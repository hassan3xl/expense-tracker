import { Agent, setGlobalDispatcher } from 'undici';
import { neon } from '@neondatabase/serverless';

// Force undici to use IPv4 due to network environments where IPv6 is misconfigured
setGlobalDispatcher(new Agent({
  connect: {
    family: 4
  }
}));

if (!process.env.DB_URI) {
  console.error("Error: DB_URI environment variable is not defined.");
  process.exit(1);
}

// Strip -pooler for HTTP driver stability
const url = process.env.DB_URI.replace('-pooler', '');
const sql = neon(url);

async function main() {
  console.log("Initializing database tables...");
  try {
    // 1. Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        salt VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("- 'users' table checked/created.");

    // 2. Create projects table
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, name)
      );
    `;
    console.log("- 'projects' table checked/created.");

    // 3. Create transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL, -- 'income', 'expense'
        category VARCHAR(100) NOT NULL, -- e.g., 'Salary', 'Food', 'Leisure', 'Debt Payment'
        amount NUMERIC(12, 2) NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("- 'transactions' table checked/created.");

    // 4. Create debts table
    await sql`
      CREATE TABLE IF NOT EXISTS debts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        person VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'owed_to_me' (others owe me), 'owed_by_me' (I owe others)
        amount NUMERIC(12, 2) NOT NULL,
        remaining_amount NUMERIC(12, 2) NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active', -- 'active', 'paid'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("- 'debts' table checked/created.");

    // 5. Run migrations for existing databases (adds columns if table already existed)
    await sql`
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE;
    `;
    await sql`
      ALTER TABLE debts ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE;
    `;
    await sql`
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS auto_log_debt_transaction BOOLEAN DEFAULT TRUE;
    `;
    console.log("- Added project_id columns and projects setting columns to existing tables if needed.");

    // 6. Create project_members table
    await sql`
      CREATE TABLE IF NOT EXISTS project_members (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL DEFAULT 'editor', -- 'editor', 'viewer'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, user_id)
      );
    `;
    console.log("- 'project_members' table checked/created.");

    console.log("Database schema initialized successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

main();
