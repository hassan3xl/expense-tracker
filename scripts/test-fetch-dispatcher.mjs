import { Agent, setGlobalDispatcher } from 'undici';
import { neon } from '@neondatabase/serverless';

setGlobalDispatcher(new Agent({
  connect: {
    family: 4
  }
}));

if (!process.env.DB_URI) {
  console.error("DB_URI is missing");
  process.exit(1);
}

const url = process.env.DB_URI.replace('-pooler', '');

async function main() {
  console.log("Testing fetch with global dispatcher...");
  try {
    const sql = neon(url);
    const result = await sql`SELECT 1 + 1 AS result`;
    console.log("Success! Result is:", result[0].result);
  } catch (error) {
    console.error("Failed:", error);
  }
}

main();
