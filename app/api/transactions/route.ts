import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET() {
  try {
    const transactions = await db.transaction.findMany({
      include: {
        account: true,
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch transactions from database" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      accountId,
      categoryId,
      amount,
      type,
      description,
      date,
      payee,
    } = body;

    const newTransaction = await db.transaction.create({
      data: {
        userId: userId || "default-user-id",
        accountId,
        categoryId,
        amount: parseFloat(amount),
        type,
        description,
        date: date ? new Date(date) : new Date(),
        payee,
      },
    });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}
