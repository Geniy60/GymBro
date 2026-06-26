import { readFile } from 'node:fs/promises';
import { Client } from 'pg';

const migrationPath = process.argv[2];
const connectionString =
  process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;

if (!migrationPath) {
  console.error('Usage: node scripts/applyMigration.mjs <migration.sql>');
  process.exit(1);
}

if (!connectionString) {
  console.error('Set SUPABASE_DATABASE_URL or DATABASE_URL before running.');
  process.exit(1);
}

const sql = await readFile(migrationPath, 'utf8');
const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query('begin');
  await client.query(sql);
  await client.query('commit');
  console.log(`Applied migration: ${migrationPath}`);
} catch (error) {
  await client.query('rollback').catch(() => undefined);
  throw error;
} finally {
  await client.end();
}
