import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const primaryEmail =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || "";

    let dbUser = await db.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });

    if (!dbUser && primaryEmail) {
      const existingUserByEmail = await db.user.findUnique({
        where: { email: primaryEmail },
      });
      if (existingUserByEmail) {
        dbUser = await db.user.update({
          where: { id: existingUserByEmail.id },
          data: { clerkUserId: clerkUser.id },
        });
      }
    }

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
          isPending,
        } = payload;

        let targetAccountId = accountId;
        if (!targetAccountId) {
          const userAcc = await db.account.findFirst({ where: { userId: dbUser.id } });
          if (!userAcc) {
            return NextResponse.json(
              { error: "No active account found. Please create an account first." },
              { status: 400 }
            );
          }
          targetAccountId = userAcc.id;
        }

        let targetCategoryId = type === "TRANSFER" ? null : categoryId;
        if (type !== "TRANSFER" && targetCategoryId) {
          const catExists = await db.category.findUnique({ where: { id: targetCategoryId } });
          if (!catExists) {
            targetCategoryId = null;
          }
        }

        const parsedAmount = Math.abs(parseFloat(amount) || 0);
        if (parsedAmount <= 0) {
          return NextResponse.json(
            { error: "Invalid transaction amount" },
            { status: 400 }
          );
        }

        const isPendingBool = Boolean(isPending);

        // Perform transaction creation and atomic balance update in database
        const createdTx = await db.$transaction(async (tx) => {
          const newTx = await tx.transaction.create({
            data: {
              userId: dbUser.id,
              accountId: targetAccountId,
              toAccountId: type === "TRANSFER" ? toAccountId : null,
              categoryId: targetCategoryId,
              amount: parsedAmount,
              type: type || "EXPENSE",
              description: description || (type === "TRANSFER" ? "Transfer" : "Transaction"),
              date: date ? new Date(date) : new Date(),
              payee: payee || null,
              isPending: isPendingBool,
            },
          });

          // Only update account balances if transaction is NOT pending
          if (!isPendingBool) {
            if (type === "TRANSFER") {
              // Deduct from source
              await tx.account.update({
                where: { id: targetAccountId },
                data: { balance: { decrement: parsedAmount } },
              });
              // Add to destination
              if (toAccountId) {
                await tx.account.update({
                  where: { id: toAccountId },
                  data: { balance: { increment: parsedAmount } },
                });
              }
            } else if (type === "INCOME") {
              await tx.account.update({
                where: { id: targetAccountId },
                data: { balance: { increment: parsedAmount } },
              });
            } else if (type === "EXPENSE") {
              await tx.account.update({
                where: { id: targetAccountId },
                data: { balance: { decrement: parsedAmount } },
              });
            }
          }

          return newTx;
        });

        return NextResponse.json({ success: true, transaction: createdTx });
      }

      case "TOGGLE_PENDING_TRANSACTION": {
        const { id } = payload;
        const existingTx = await db.transaction.findUnique({
          where: { id },
        });

        if (!existingTx || existingTx.userId !== dbUser.id) {
          return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        const newPendingState = !existingTx.isPending;

        await db.$transaction(async (tx) => {
          await tx.transaction.update({
            where: { id },
            data: { isPending: newPendingState },
          });

          // If changing from pending -> cleared (paid): apply balance update
          if (!newPendingState) {
            if (existingTx.type === "TRANSFER") {
              await tx.account.update({
                where: { id: existingTx.accountId },
                data: { balance: { decrement: existingTx.amount } },
              });
              if (existingTx.toAccountId) {
                await tx.account.update({
                  where: { id: existingTx.toAccountId },
                  data: { balance: { increment: existingTx.amount } },
                });
              }
            } else if (existingTx.type === "INCOME") {
              await tx.account.update({
                where: { id: existingTx.accountId },
                data: { balance: { increment: existingTx.amount } },
              });
            } else if (existingTx.type === "EXPENSE") {
              await tx.account.update({
                where: { id: existingTx.accountId },
                data: { balance: { decrement: existingTx.amount } },
              });
            }
          } else {
            // If changing from cleared -> pending: reverse balance update
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
          }
        });

        return NextResponse.json({ success: true });
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
          // Only adjust balance if the deleted transaction was NOT pending
          if (!existingTx.isPending) {
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
          }

          await tx.transaction.delete({ where: { id } });
        });

        return NextResponse.json({ success: true });
      }

      case "ADD_ACCOUNT": {
        const { name, type, balance, currency, accountNumber, color } = payload;
        const parsedBalance = isNaN(Number(balance)) ? 0 : Number(balance);
        const newAcc = await db.account.create({
          data: {
            userId: dbUser.id,
            name: name || "New Account",
            type: type || "CHECKING",
            balance: parsedBalance,
            currency: currency || "NGN",
            accountNumber: accountNumber || null,
            color: color || "#3b82f6",
          },
        });
        return NextResponse.json({ success: true, account: newAcc });
      }

      case "EDIT_ACCOUNT": {
        const { id, name, type, currency, color } = payload;
        const existingAcc = await db.account.findUnique({ where: { id } });
        if (!existingAcc || existingAcc.userId !== dbUser.id) {
          return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }
        const updatedAcc = await db.account.update({
          where: { id },
          data: {
            name: name ?? existingAcc.name,
            type: type ?? existingAcc.type,
            currency: currency ?? existingAcc.currency,
            color: color ?? existingAcc.color,
          },
        });
        return NextResponse.json({ success: true, account: updatedAcc });
      }

      case "DELETE_ACCOUNT": {
        const { id } = payload;
        const existingAcc = await db.account.findUnique({ where: { id } });
        if (!existingAcc || existingAcc.userId !== dbUser.id) {
          return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }
        await db.account.delete({ where: { id } });
        return NextResponse.json({ success: true });
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
