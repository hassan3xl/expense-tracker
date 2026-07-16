'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sql } from '@/lib/db';
import { hashPassword, generateSalt, createSession, destroySession, getSessionUser, getCurrentProject } from '@/lib/auth';

/**
 * Check if the user has write access ('owner' or 'editor') to a project.
 * Viewers are read-only and will fail this check.
 */
async function checkProjectWriteAccess(projectId: number, userId: number) {
  const result = await sql`
    SELECT p.id 
    FROM projects p
    LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ${userId}
    WHERE p.id = ${projectId} AND (p.user_id = ${userId} OR pm.role = 'editor')
    LIMIT 1
  `;
  if (!result || result.length === 0) {
    throw new Error('Unauthorized: You do not have write permissions for this project');
  }
}

// --- AUTH ACTIONS ---

export async function registerAction(prevState: any, formData: FormData) {
  const username = (formData.get('username') as string)?.trim();
  const password = formData.get('password') as string;

  if (!username || username.length < 3) {
    return { error: 'Username must be at least 3 character long.' };
  }
  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  let success = false;
  try {
    const existing = await sql`
      SELECT id FROM users WHERE username = ${username} LIMIT 1
    `;
    if (existing && existing.length > 0) {
      return { error: 'Username already exists.' };
    }

    const salt = generateSalt();
    const hash = await hashPassword(password, salt);

    const result = await sql`
      INSERT INTO users (username, password_hash, salt)
      VALUES (${username}, ${hash}, ${salt})
      RETURNING id, username
    `;

    if (!result || result.length === 0) {
      return { error: 'Failed to create user.' };
    }

    const user = result[0];
    await createSession(user.id, user.username);
    success = true;
  } catch (error) {
    console.error('Registration database error:', error);
    return { error: 'An unexpected database error occurred.' };
  }

  if (success) {
    redirect('/dashboard');
  }
}

export async function loginAction(prevState: any, formData: FormData) {
  const username = (formData.get('username') as string)?.trim();
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Please enter both username and password.' };
  }

  let success = false;
  try {
    const result = await sql`
      SELECT id, username, password_hash, salt 
      FROM users 
      WHERE username = ${username} 
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      return { error: 'Invalid username or password.' };
    }

    const user = result[0];
    const computedHash = await hashPassword(password, user.salt);

    if (computedHash !== user.password_hash) {
      return { error: 'Invalid username or password.' };
    }

    await createSession(user.id, user.username);
    success = true;
  } catch (error) {
    console.error('Login database error:', error);
    return { error: 'An unexpected database error occurred.' };
  }

  if (success) {
    redirect('/dashboard');
  }
}

export async function logoutAction() {
  await destroySession();
  redirect('/login');
}

// --- TRANSACTION ACTIONS ---

export async function addTransactionAction(data: {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  date: string;
}) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const { type, category, amount, description = '', date } = data;

  if (amount <= 0) throw new Error('Amount must be positive');
  if (!category) throw new Error('Category is required');

  try {
    const currentProj = await getCurrentProject(user.userId);
    await checkProjectWriteAccess(currentProj.id, user.userId);

    await sql`
      INSERT INTO transactions (user_id, project_id, type, category, amount, description, date)
      VALUES (${user.userId}, ${currentProj.id}, ${type}, ${category}, ${amount}, ${description}, ${date ? new Date(date) : new Date()})
    `;
  } catch (error: any) {
    console.error('Failed to add transaction:', error);
    throw new Error(error.message || 'Failed to save transaction');
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}

export async function deleteTransactionAction(id: number) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  try {
    const txResult = await sql`SELECT project_id FROM transactions WHERE id = ${id} LIMIT 1`;
    if (!txResult || txResult.length === 0) throw new Error('Transaction not found');
    await checkProjectWriteAccess(Number(txResult[0].project_id), user.userId);

    await sql`
      DELETE FROM transactions 
      WHERE id = ${id}
    `;
  } catch (error: any) {
    console.error('Failed to delete transaction:', error);
    throw new Error(error.message || 'Failed to delete transaction');
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}

// --- DEBT ACTIONS ---

export async function addDebtAction(data: {
  person: string;
  type: 'owed_to_me' | 'owed_by_me';
  amount: number;
  description?: string;
  due_date?: string;
}) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const { person, type, amount, description = '', due_date } = data;

  if (amount <= 0) throw new Error('Amount must be positive');
  if (!person) throw new Error('Person name is required');

  try {
    const currentProj = await getCurrentProject(user.userId);
    await checkProjectWriteAccess(currentProj.id, user.userId);

    const formattedDueDate = due_date ? new Date(due_date) : null;

    // Insert the debt
    await sql`
      INSERT INTO debts (user_id, project_id, person, type, amount, remaining_amount, description, due_date, status)
      VALUES (${user.userId}, ${currentProj.id}, ${person}, ${type}, ${amount}, ${amount}, ${description}, ${formattedDueDate}, 'active')
    `;

    if (currentProj.autoLogDebtTransaction) {
      // Also log this as an initial transaction (optional, but let's log the loan transaction)
      // Owed to me (I loaned someone money) -> This is an expense from my current wallet.
      // Owed by me (I borrowed from someone) -> This is income to my current wallet.
      const transType = type === 'owed_to_me' ? 'expense' : 'income';
      const transCategory = type === 'owed_to_me' ? 'Loan Lent' : 'Loan Borrowed';
      const transDesc = type === 'owed_to_me' 
        ? `Lent money to ${person}. Total debt recorded.` 
        : `Borrowed money from ${person}. Total debt recorded.`;

      await sql`
        INSERT INTO transactions (user_id, project_id, type, category, amount, description, date)
        VALUES (${user.userId}, ${currentProj.id}, ${transType}, ${transCategory}, ${amount}, ${transDesc}, CURRENT_TIMESTAMP)
      `;
    }
  } catch (error: any) {
    console.error('Failed to add debt:', error);
    throw new Error(error.message || 'Failed to save debt record');
  }

  revalidatePath('/dashboard');
  revalidatePath('/debts');
}

export async function deleteDebtAction(id: number) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  try {
    const debtResult = await sql`SELECT project_id FROM debts WHERE id = ${id} LIMIT 1`;
    if (!debtResult || debtResult.length === 0) throw new Error('Debt record not found');
    await checkProjectWriteAccess(Number(debtResult[0].project_id), user.userId);

    await sql`
      DELETE FROM debts 
      WHERE id = ${id}
    `;
  } catch (error: any) {
    console.error('Failed to delete debt:', error);
    throw new Error(error.message || 'Failed to delete debt record');
  }

  revalidatePath('/dashboard');
  revalidatePath('/debts');
}

export async function addDebtPaymentAction(data: {
  debtId: number;
  paymentAmount: number;
  description?: string;
}) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const { debtId, paymentAmount, description = '' } = data;

  if (paymentAmount <= 0) throw new Error('Payment amount must be positive');

  try {
    // 1. Fetch debt details
    const result = await sql`
      SELECT id, person, type, amount, remaining_amount, project_id 
      FROM debts 
      WHERE id = ${debtId}
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      throw new Error('Debt not found');
    }

    const debt = result[0];
    await checkProjectWriteAccess(Number(debt.project_id), user.userId);

    const currentRemaining = parseFloat(debt.remaining_amount);
    
    if (paymentAmount > currentRemaining) {
      throw new Error(`Payment cannot exceed remaining debt balance of ${currentRemaining}`);
    }

    const newRemaining = Math.max(0, currentRemaining - paymentAmount);
    const newStatus = newRemaining === 0 ? 'paid' : 'active';

    // 2. Update remaining debt balance
    await sql`
      UPDATE debts 
      SET remaining_amount = ${newRemaining}, status = ${newStatus} 
      WHERE id = ${debtId}
    `;

    // 3. Log a transaction linked to this payment
    // If owed_by_me (I owe John): Paying John means money goes out -> Expense (Category: 'Debt Payment')
    // If owed_to_me (John owes me): John pays me back -> Income (Category: 'Debt Repayment')
    const transType = debt.type === 'owed_by_me' ? 'expense' : 'income';
    const transCategory = debt.type === 'owed_by_me' ? 'Debt Payment' : 'Debt Repayment';
    const transDesc = debt.type === 'owed_by_me'
      ? `Paid ₦${paymentAmount} towards debt to ${debt.person}. ${description}`
      : `Received ₦${paymentAmount} repayment from ${debt.person}. ${description}`;

    await sql`
      INSERT INTO transactions (user_id, project_id, type, category, amount, description, date)
      VALUES (${user.userId}, ${debt.project_id}, ${transType}, ${transCategory}, ${paymentAmount}, ${transDesc}, CURRENT_TIMESTAMP)
    `;

  } catch (error: any) {
    console.error('Failed to add debt payment:', error);
    throw new Error(error.message || 'Failed to process debt payment');
  }

  revalidatePath('/dashboard');
  revalidatePath('/debts');
}

// --- PROJECT ACTIONS ---

export async function getProjectsAction() {
  const user = await getSessionUser();
  if (!user) return [];
  try {
    return await sql`
      SELECT DISTINCT p.id, p.name FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id
      WHERE p.user_id = ${user.userId} OR pm.user_id = ${user.userId}
      ORDER BY p.name ASC
    `;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

export async function addProjectAction(name: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error('Project name cannot be empty');
  
  try {
    // Check if project with the same name already exists for this user
    const existing = await sql`
      SELECT id FROM projects WHERE user_id = ${user.userId} AND name = ${trimmedName} LIMIT 1
    `;
    if (existing && existing.length > 0) {
      throw new Error('A project with this name already exists');
    }

    const result = await sql`
      INSERT INTO projects (user_id, name)
      VALUES (${user.userId}, ${trimmedName})
      RETURNING id, name
    `;
    
    // Auto-switch to the newly created project
    const newProj = result[0];
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.set('finance_tracker_project_id', newProj.id.toString(), {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    
    revalidatePath('/dashboard');
    revalidatePath('/transactions');
    revalidatePath('/debts');
    
    return { id: Number(newProj.id), name: String(newProj.name) };
  } catch (error: any) {
    console.error('Failed to add project:', error);
    throw new Error(error.message || 'Failed to create project');
  }
}

export async function switchProjectAction(projectId: number) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  
  try {
    // Verify the project exists and belongs to the user or user is a member
    const projResult = await sql`
      SELECT p.id FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ${user.userId}
      WHERE p.id = ${projectId} AND (p.user_id = ${user.userId} OR pm.user_id = ${user.userId})
      LIMIT 1
    `;
    if (!projResult || projResult.length === 0) {
      throw new Error('Project not found or access denied');
    }
    
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.set('finance_tracker_project_id', projectId.toString(), {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    
    revalidatePath('/dashboard');
    revalidatePath('/transactions');
    revalidatePath('/debts');
  } catch (error: any) {
    console.error('Failed to switch project:', error);
    throw new Error(error.message || 'Failed to switch project');
  }
}

// --- PROJECT COLLABORATION ACTIONS ---

export async function getProjectMembersAction(projectId: number) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  
  // Verify user has access to the project
  const accessResult = await sql`
    SELECT p.id, p.user_id FROM projects p
    LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ${user.userId}
    WHERE p.id = ${projectId} AND (p.user_id = ${user.userId} OR pm.user_id = ${user.userId})
    LIMIT 1
  `;
  if (!accessResult || accessResult.length === 0) {
    throw new Error('Project not found or access denied');
  }

  // Get project owner
  const ownerResult = await sql`
    SELECT u.id, u.username FROM users u
    JOIN projects p ON p.user_id = u.id
    WHERE p.id = ${projectId}
    LIMIT 1
  `;
  const owner = ownerResult[0] ? { id: Number(ownerResult[0].id), username: String(ownerResult[0].username), role: 'owner' } : null;

  // Get other members
  const members = await sql`
    SELECT pm.id, u.id as user_id, u.username, pm.role 
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ${projectId}
    ORDER BY u.username ASC
  `;

  const formattedMembers = members.map(m => ({
    id: Number(m.id),
    userId: Number(m.user_id),
    username: String(m.username),
    role: String(m.role)
  }));

  return {
    owner,
    members: formattedMembers
  };
}

export async function addProjectMemberAction(projectId: number, username: string, role: 'editor' | 'viewer') {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  // Verify the current user is the owner of the project
  const project = await sql`
    SELECT id, user_id FROM projects WHERE id = ${projectId} LIMIT 1
  `;
  if (!project || project.length === 0) throw new Error('Project not found');
  if (Number(project[0].user_id) !== user.userId) {
    throw new Error('Only the project owner can add members');
  }

  const targetUsername = username.trim();
  if (!targetUsername) throw new Error('Username is required');

  // Find the target user by username
  const targetUserResult = await sql`
    SELECT id, username FROM users WHERE username = ${targetUsername} LIMIT 1
  `;
  if (!targetUserResult || targetUserResult.length === 0) {
    throw new Error(`User "${targetUsername}" does not exist`);
  }

  const targetUser = targetUserResult[0];
  const targetUserId = Number(targetUser.id);

  if (targetUserId === user.userId) {
    throw new Error('You are already the owner of this project');
  }

  // Check if they are already a member
  const existingMember = await sql`
    SELECT id FROM project_members 
    WHERE project_id = ${projectId} AND user_id = ${targetUserId} 
    LIMIT 1
  `;
  if (existingMember && existingMember.length > 0) {
    throw new Error('This user is already a member of this project');
  }

  // Insert member
  await sql`
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (${projectId}, ${targetUserId}, ${role})
  `;

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/debts');
}

export async function removeProjectMemberAction(projectId: number, memberUserId: number) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  // Verify the current user is the owner of the project
  const project = await sql`
    SELECT id, user_id FROM projects WHERE id = ${projectId} LIMIT 1
  `;
  if (!project || project.length === 0) throw new Error('Project not found');
  if (Number(project[0].user_id) !== user.userId) {
    throw new Error('Only the project owner can remove members');
  }

  // Delete member
  await sql`
    DELETE FROM project_members 
    WHERE project_id = ${projectId} AND user_id = ${memberUserId}
  `;

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/debts');
}

export async function updateProjectMemberRoleAction(projectId: number, memberUserId: number, role: 'editor' | 'viewer') {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  // Verify the current user is the owner of the project
  const project = await sql`
    SELECT id, user_id FROM projects WHERE id = ${projectId} LIMIT 1
  `;
  if (!project || project.length === 0) throw new Error('Project not found');
  if (Number(project[0].user_id) !== user.userId) {
    throw new Error('Only the project owner can update member roles');
  }

  // Update role
  await sql`
    UPDATE project_members 
    SET role = ${role} 
    WHERE project_id = ${projectId} AND user_id = ${memberUserId}
  `;

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/debts');
}

export async function updateProjectSettingsAction(data: {
  autoLogDebtTransaction: boolean;
}) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const { autoLogDebtTransaction } = data;

  try {
    const currentProj = await getCurrentProject(user.userId);
    // Only owner can update settings
    if (currentProj.role !== 'owner') {
      throw new Error('Only the project owner can update project settings');
    }

    await sql`
      UPDATE projects 
      SET auto_log_debt_transaction = ${autoLogDebtTransaction}
      WHERE id = ${currentProj.id}
    `;
  } catch (error: any) {
    console.error('Failed to update project settings:', error);
    throw new Error(error.message || 'Failed to update project settings');
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/debts');
}
