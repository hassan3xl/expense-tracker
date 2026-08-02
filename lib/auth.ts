import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'finance-tracker-super-secret-key-at-least-32-chars'
);

const COOKIE_NAME = 'finance_tracker_session';

/**
 * Hash a password using PBKDF2 via Web Crypto API.
 * This runs natively in serverless and Edge environments.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(salt);

  const key = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256 // 256 bits = 32 bytes
  );

  return Array.from(new Uint8Array(derivedKey))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a cryptographically secure random salt in hex.
 */
export function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create an encrypted session JWT and store it in an HTTP-only cookie.
 */
export async function createSession(userId: number, username: string) {
  const jwt = await new SignJWT({ userId, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
}

/**
 * Destroy the session cookie.
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export interface SessionUser {
  userId: number;
  username: string;
}

/**
 * Get the current user session.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as number,
      username: payload.username as string
    };
  } catch (error) {
    return null;
  }
}

export interface CurrentProject {
  id: number;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  ownerId: number;
  autoLogDebtTransaction: boolean;
}

/**
 * Get the user's active/current project.
 * If not set or invalid, resolves to the first project or creates a default "Personal" project.
 */
export async function getCurrentProject(userId: number): Promise<CurrentProject> {
  const { sql } = await import('@/lib/db');
  const cookieStore = await cookies();
  const projectIdStr = cookieStore.get('finance_tracker_project_id')?.value;
  
  let projectId = projectIdStr ? parseInt(projectIdStr, 10) : null;
  
  if (projectId) {
    try {
      const projResult = await sql`
        SELECT p.id, p.name, p.user_id as owner_id, p.auto_log_debt_transaction,
               CASE 
                 WHEN p.user_id = ${userId} THEN 'owner'
                 ELSE COALESCE(pm.role, 'viewer')
               END as role
        FROM projects p
        LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ${userId}
        WHERE p.id = ${projectId} AND (p.user_id = ${userId} OR pm.user_id = ${userId})
        LIMIT 1
      `;
      if (projResult && projResult.length > 0) {
        return { 
          id: Number(projResult[0].id), 
          name: String(projResult[0].name),
          role: projResult[0].role as 'owner' | 'editor' | 'viewer',
          ownerId: Number(projResult[0].owner_id),
          autoLogDebtTransaction: Boolean(projResult[0].auto_log_debt_transaction)
        };
      }
    } catch (e) {
      console.error('Error verifying project:', e);
    }
  }
  
  try {
    // If not found or invalid, check if they have any projects (owned or member)
    const projs = await sql`
      SELECT p.id, p.name, p.user_id as owner_id, p.auto_log_debt_transaction,
             CASE 
               WHEN p.user_id = ${userId} THEN 'owner'
               ELSE COALESCE(pm.role, 'viewer')
             END as role
      FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ${userId}
      WHERE p.user_id = ${userId} OR pm.user_id = ${userId}
      ORDER BY p.id ASC
    `;
    
    if (projs && projs.length > 0) {
      const activeProj = projs[0];
      return { 
        id: Number(activeProj.id), 
        name: String(activeProj.name),
        role: activeProj.role as 'owner' | 'editor' | 'viewer',
        ownerId: Number(activeProj.owner_id),
        autoLogDebtTransaction: Boolean(activeProj.auto_log_debt_transaction)
      };
    }
    
    // Create default "Personal" project
    const newProjResult = await sql`
      INSERT INTO projects (user_id, name)
      VALUES (${userId}, 'Personal')
      RETURNING id, name, user_id as owner_id, auto_log_debt_transaction
    `;
    
    const defaultProj = newProjResult[0];
    const defaultProjId = Number(defaultProj.id);
    
    // Associate existing project-less transactions & debts to this default project
    await sql`
      UPDATE transactions 
      SET project_id = ${defaultProjId}
      WHERE user_id = ${userId} AND project_id IS NULL
    `;
    await sql`
      UPDATE debts
      SET project_id = ${defaultProjId}
      WHERE user_id = ${userId} AND project_id IS NULL
    `;
    
    return { 
      id: defaultProjId, 
      name: String(defaultProj.name),
      role: 'owner',
      ownerId: userId,
      autoLogDebtTransaction: Boolean(defaultProj.auto_log_debt_transaction)
    };
  } catch (error) {
    console.error('Database error in getCurrentProject:', error);
    // Return fallback project if database fails
    return { id: 0, name: 'Personal', role: 'owner', ownerId: userId, autoLogDebtTransaction: true };
  }
}
