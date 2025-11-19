#!/usr/bin/env node
/**
 * Run SQL migration files against a PostgreSQL database using the `pg` client.
 *
 * Usage:
 *   DATABASE_URL="postgresql://user:pass@host:5432/dbname" node scripts/run_migrations.js --run
 *
 * Without `--run` the script will list found migration files and exit (dry-run / preview).
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config();

const args = process.argv.slice(2);
const doRun = args.includes('--run');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required.');
  console.error('Example: DATABASE_URL="postgresql://postgres:pass@localhost:5432/ecomerce_staging" node scripts/run_migrations.js --run');
  process.exit(1);
}

const migrationsDir = path.join(__dirname, '..', 'migrations');

function getSqlFiles() {
  if (!fs.existsSync(migrationsDir)) return [];
  return fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
}

async function run() {
  const files = getSqlFiles();
  if (files.length === 0) {
    console.log('No .sql migration files found in', migrationsDir);
    process.exit(0);
  }

  console.log('Found migration files:');
  files.forEach(f => console.log('  -', f));

  if (!doRun) {
    console.log('\nPreview mode. To execute these migrations run with --run flag.');
    process.exit(0);
  }

  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log('\nStarting migration run...');
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`\n--- Executing: ${file} ---`);
      await client.query(sql);
      console.log(`Executed ${file}`);
    }
    console.log('\nAll migrations executed successfully.');
  } catch (err) {
    console.error('\nMigration failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
