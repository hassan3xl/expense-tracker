import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET() {
  try {
    const accounts = await db.account.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch accounts from database" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, type, balance, currency, accountNumber, color } =
      body;

    const newAccount = await db.account.create({
      data: {
        userId: userId || "default-user-id",
        name,
        type,
        balance: parseFloat(balance),
        currency: currency || "USD",
        accountNumber,
        color: color || "#3b82f6",
      },
    });

    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
