const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let pool = null;
let sqliteDb = null;
let isPostgres = false;

function init() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.startsWith('postgres')) {
    console.log('Connecting to PostgreSQL database...');
    pool = new Pool({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
    isPostgres = true;
  } else {
    console.log('No PostgreSQL connection string found. Falling back to local SQLite database...');
    const dbPath = path.resolve(__dirname, '../../database.sqlite');
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Failed to connect to SQLite database:', err.message);
      } else {
        console.log('Connected to local SQLite database at:', dbPath);
      }
    });
    isPostgres = false;
  }
}

// Helper to execute database queries.
// It maps PostgreSQL style parameterized queries ($1, $2, etc.) to SQLite format (?) automatically.
function query(text, params = []) {
  if (!pool && !sqliteDb) {
    init();
  }

  if (isPostgres) {
    return pool.query(text, params);
  } else {
    return new Promise((resolve, reject) => {
      // Replace $1, $2, etc. with ? for SQLite
      const sqliteText = text.replace(/\$\d+/g, '?');
      sqliteDb.all(sqliteText, params, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve({ rows, rowCount: rows.length });
      });
    });
  }
}

module.exports = {
  init,
  query,
  getIsPostgres: () => isPostgres
};
