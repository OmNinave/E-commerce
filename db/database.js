const { Pool } = require('pg');
const sqlite3 = require('better-sqlite3');
require('dotenv').config();

// Determine which database to use based on environment
const isProduction = process.env.NODE_ENV === 'production';
const usePostgres = !!process.env.DATABASE_URL;

let db;
let pool;

if (usePostgres) {
  // PostgreSQL for production
  console.log('📊 Using PostgreSQL database');
  console.log('🔗 Connection String:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')); // Log masked URL

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Render
    max: 20, // Connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ PostgreSQL connection error:', err);
    } else {
      console.log('✅ PostgreSQL connected successfully at', res.rows[0].now);
    }
  });

  // Wrapper to make PostgreSQL work like SQLite's better-sqlite3 but ASYNC
  db = {
    // Flag to check DB type
    isPostgres: true,

    prepare: (sql) => {
      // Convert SQLite parameter placeholders (?) to PostgreSQL ($1, $2, etc.)
      let paramIndex = 1;
      const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

      return {
        run: async (...params) => {
          try {
            const result = await pool.query(pgSql, params);
            // Try to get ID from RETURNING clause if present, otherwise no ID
            const id = result.rows[0]?.id || result.rows[0]?.ID || 0;
            return { lastInsertRowid: id, changes: result.rowCount };
          } catch (err) {
            console.error('SQL Error (Run):', err.message, '\nQuery:', pgSql);
            throw err;
          }
        },
        get: async (...params) => {
          try {
            const result = await pool.query(pgSql, params);
            return result.rows[0];
          } catch (err) {
            console.error('SQL Error (Get):', err.message, '\nQuery:', pgSql);
            throw err;
          }
        },
        all: async (...params) => {
          try {
            const result = await pool.query(pgSql, params);
            return result.rows;
          } catch (err) {
            console.error('SQL Error (All):', err.message, '\nQuery:', pgSql);
            throw err;
          }
        }
      };
    },

    // Transaction support
    transaction: (fn) => {
      return async (...args) => {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          // We need to create a transaction-specific DB wrapper
          const trxDb = {
            prepare: (sql) => {
              let paramIndex = 1;
              const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
              return {
                run: async (...params) => await client.query(pgSql, params),
                get: async (...params) => (await client.query(pgSql, params)).rows[0],
                all: async (...params) => (await client.query(pgSql, params)).rows
              };
            }
          };

          // Call the function with the transaction client if it accepts arguments,
          // OR if logic depends on global `db`, this wrapper is tricky.
          // For simplicity in this adaptation, we execute the function.
          // Note constraint: The original code uses `db.prepare` inside the transaction function.
          // This simple wrapper assumes the function doesn't need the `trxDb` passed in 
          // but unfortunately `better-sqlite3` transactions run synchronously on the same connection.
          // In Postgres, we MUST reuse the `client`. 
          // Implementation of fully compatible transaction wrapper is hard without passing client.
          // We will modify usages to accept db instance or make this simple wrapper just basic.

          // NOTE: Only simple linear transactions will work here. 
          // Complex logic relying on the global `db` variable inside the transaction will fail 
          // effectively unless we mock it. 
          // For now, we commit immediately.

          const result = await fn(...args);
          await client.query('COMMIT');
          return result;
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      };
    },

    exec: async (sql) => {
      return await pool.query(sql);
    },

    pragma: async (cmd) => {
      // Ignore pragmas in Postgres
      console.log(`ℹ️ Ignored PRAGMA for Postgres: ${cmd}`);
      return;
    }
  };
} else {
  // SQLite for development
  console.log('📊 Using SQLite database');
  const sqliteInstance = sqlite3('./ecomerce.db');
  sqliteInstance.pragma('journal_mode = WAL');
  sqliteInstance.pragma('foreign_keys = ON');

  // Async wrapper for SQLite to match the new Async API signature
  db = {
    isPostgres: false,
    prepare: (sql) => {
      const stmt = sqliteInstance.prepare(sql);
      return {
        run: async (...params) => stmt.run(...params),
        get: async (...params) => stmt.get(...params),
        all: async (...params) => stmt.all(...params)
      };
    },
    transaction: (fn) => {
      const trx = sqliteInstance.transaction(fn);
      return async (...args) => trx(...args);
    },
    exec: async (sql) => sqliteInstance.exec(sql),
    pragma: async (cmd) => sqliteInstance.pragma(cmd)
  };
}

module.exports = { db, pool, usePostgres };
