const { Pool } = require('pg');
const sqlite3 = require('better-sqlite3');

// Determine which database to use based on environment
const isProduction = process.env.NODE_ENV === 'production';
const usePostgres = process.env.DATABASE_URL || isProduction;

let db;
let pool;

if (usePostgres) {
  // PostgreSQL for production
  console.log('📊 Using PostgreSQL database');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  // Wrapper to make PostgreSQL work like SQLite's better-sqlite3
  db = {
    prepare: (sql) => ({
      run: async (...params) => {
        const result = await pool.query(sql, params);
        return { lastInsertRowid: result.rows[0]?.id, changes: result.rowCount };
      },
      get: async (...params) => {
        const result = await pool.query(sql, params);
        return result.rows[0];
      },
      all: async (...params) => {
        const result = await pool.query(sql, params);
        return result.rows;
      }
    })
  };
} else {
  // SQLite for development
  console.log('📊 Using SQLite database');
  db = sqlite3('./ecomerce.db');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
}

module.exports = { db, pool, usePostgres };
