import { neon } from '@neondatabase/serverless';

if (!process.env.DB_URI) {
  console.error("DB_URI is missing");
  process.exit(1);
}

const poolerUrl = process.env.DB_URI;
const nonPoolerUrl = poolerUrl.replace('-pooler', '');

async function test(url, name) {
  console.log(`Testing ${name}...`);
  try {
    const sql = neon(url);
    const result = await sql`SELECT 1 + 1 AS result`;
    console.log(`Success ${name}! Result is:`, result[0].result);
    return true;
  } catch (error) {
    console.error(`Failed ${name}:`, error);
    return false;
  }
}

async function main() {
  console.log("Pooler URL:", poolerUrl);
  console.log("Non-Pooler URL:", nonPoolerUrl);
  await test(poolerUrl, "Pooler URL");
  await test(nonPoolerUrl, "Non-Pooler URL");
}

main();
