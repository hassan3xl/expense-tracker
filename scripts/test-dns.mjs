import dns from 'dns';
import { neon } from '@neondatabase/serverless';

dns.setDefaultResultOrder('ipv4first');

if (!process.env.DB_URI) {
  console.error("DB_URI is missing");
  process.exit(1);
}

const url = process.env.DB_URI.replace('-pooler', '');

async function main() {
  console.log("Testing with ipv4first on URL:", url);
  try {
    const sql = neon(url);
    const result = await sql`SELECT 1 + 1 AS result`;
    console.log("Success! Result is:", result[0].result);
  } catch (error) {
    console.error("Failed:", error);
  }
}

main();
