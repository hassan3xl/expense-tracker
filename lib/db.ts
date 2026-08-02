import { Agent, setGlobalDispatcher } from 'undici';
import { neon } from '@neondatabase/serverless';

// Force undici to use IPv4 on the server side to prevent IPv6 connection timeouts
if (typeof window === 'undefined') {
  setGlobalDispatcher(new Agent({
    connect: {
      family: 4
    }
  }));
}

if (!process.env.DB_URI) {
  throw new Error("DB_URI environment variable is not defined.");
}

const url = process.env.DB_URI.replace('-pooler', '');

export const sql = neon(url);
export default sql;
