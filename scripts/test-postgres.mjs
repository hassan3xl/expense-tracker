import postgres from 'postgres';

if (!process.env.DB_URI) {
  console.error("DB_URI is missing");
  process.exit(1);
}

const sql = postgres(process.env.DB_URI, { ssl: 'require' });

async function main() {
  console.log("Testing connection...");
  try {
    const result = await sql`SELECT 1 + 1 AS result`;
    console.log("Success! Result is:", result[0].result);
    await sql.end();
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

main();
