import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { action, payload } = await req.json();

    switch (action) {
      case "ADD_TRANSACTION": {
        const {
          accountId,
          toAccountId,
          categoryId,
          amount,
          type,
          description,
          date,
          payee,
        } = payload;

        // Perform transaction creation and atomic balance update in database
        const createdTx = await db.$transaction(async (tx) => {
          const newTx = await tx.transaction.create({
            data: {
              userId: dbUser.id,
              accountId,
              toAccountId: type === "TRANSFER" ? toAccountId : null,
              categoryId: type === "TRANSFER" ? null : categoryId,
              amount: parseFloat(amount),
              type,
              description,
              date: date ? new Date(date) : new Date(),
              payee: payee || null,
            },
          });

          if (type === "TRANSFER") {
            // Deduct from source
            await tx.account.update({
              where: { id: accountId },
              data: { balance: { decrement: parseFloat(amount) } },
            });
            // Add to destination
            if (toAccountId) {
              await tx.account.update({
                where: { id: toAccountId },
                data: { balance: { increment: parseFloat(amount) } },
              });
            }
          } else if (type === "INCOME") {
            await tx.account.update({
              where: { id: accountId },
              data: { balance: { increment: parseFloat(amount) } },
            });
          } else if (type === "EXPENSE") {
            await tx.account.update({
              where: { id: accountId },
              data: { balance: { decrement: parseFloat(amount) } },
            });
          }

          return newTx;
        });

        return NextResponse.json({ success: true, transaction: createdTx });
      }

      case "DELETE_TRANSACTION": {
        const { id } = payload;
        const existingTx = await db.transaction.findUnique({
          where: { id },
        });

        if (!existingTx || existingTx.userId !== dbUser.id) {
          return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        await db.$transaction(async (tx) => {
          if (existingTx.type === "TRANSFER") {
            await tx.account.update({
              where: { id: existingTx.accountId },
              data: { balance: { increment: existingTx.amount } },
            });
            if (existingTx.toAccountId) {
              await tx.account.update({
                where: { id: existingTx.toAccountId },
                data: { balance: { decrement: existingTx.amount } },
              });
            }
          } else if (existingTx.type === "INCOME") {
            await tx.account.update({
              where: { id: existingTx.accountId },
              data: { balance: { decrement: existingTx.amount } },
            });
          } else if (existingTx.type === "EXPENSE") {
            await tx.account.update({
              where: { id: existingTx.accountId },
              data: { balance: { increment: existingTx.amount } },
            });
          }

          await tx.transaction.delete({ where: { id } });
        });

        return NextResponse.json({ success: true });
      }

      case "ADD_ACCOUNT": {
        const { name, type, balance, currency, accountNumber, color } = payload;
        const newAcc = await db.account.create({
          data: {
            userId: dbUser.id,
            name,
            type: type || "CHECKING",
            balance: parseFloat(balance) || 0,
            currency: currency || "NGN",
            accountNumber: accountNumber || null,
            color: color || "#3b82f6",
          },
        });
        return NextResponse.json({ success: true, account: newAcc });
      }

      case "ADD_CATEGORY": {
        const { name, type, icon, color } = payload;
        const newCat = await db.category.create({
          data: {
            userId: dbUser.id,
            name,
            type: type || "EXPENSE",
            icon: icon || "tag",
            color: color || "#64748b",
          },
        });
        return NextResponse.json({ success: true, category: newCat });
      }

      case "EDIT_CATEGORY": {
        const { id, name, type, icon, color } = payload;
        const updatedCat = await db.category.update({
          where: { id },
          data: {
            name,
            type,
            icon,
            color,
          },
        });
        return NextResponse.json({ success: true, category: updatedCat });
      }

      case "DELETE_CATEGORY": {
        const { id } = payload;
        await db.category.delete({
          where: { id },
        });
        return NextResponse.json({ success: true });
      }

      case "ADD_BUDGET": {
        const { categoryId, amount, period } = payload;
        const newBudget = await db.budget.create({
          data: {
            userId: dbUser.id,
            categoryId,
            amount: parseFloat(amount),
            period: period || "MONTHLY",
          },
        });
        return NextResponse.json({ success: true, budget: newBudget });
      }

      case "ADD_GOAL": {
        const { name, targetAmount, currentAmount, targetDate, color, icon } = payload;
        const newGoal = await db.goal.create({
          data: {
            userId: dbUser.id,
            name,
            targetAmount: parseFloat(targetAmount),
            currentAmount: parseFloat(currentAmount) || 0,
            targetDate: targetDate ? new Date(targetDate) : new Date(),
            color: color || "#10b981",
            icon: icon || "target",
          },
        });
        return NextResponse.json({ success: true, goal: newGoal });
      }

      case "UPDATE_GOAL_DEPOSIT": {
        const { goalId, amount } = payload;
        const updatedGoal = await db.goal.update({
          where: { id: goalId },
          data: {
            currentAmount: { increment: parseFloat(amount) },
          },
        });
        return NextResponse.json({ success: true, goal: updatedGoal });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("POST /api/sync/action error:", error);
    return NextResponse.json(
      { error: "Failed to perform database action" },
      { status: 500 }
    );
  }
}
