
const pool = require('../config/db');

// Create a new user and return the full user row
const createUser = async ({ name, email, passwordHash, role }) => {
  const result = await pool.query(
    `INSERT INTO hm_users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, name, email, role, created_at`, // Exclude password from return
    [name, email, passwordHash, role]
  );
  return result.rows[0];
};

// Fetch full user row by email (needed for login, includes password_hash)
const findUserByEmail = async (email) => {
  const result = await pool.query(
   ` SELECT user_id, name, email, password_hash, role FROM hm_users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
};

// Fetch public profile info by user ID (no password hash)
const findUserById = async (user_id) => {
  const result = await pool.query(
   ` SELECT user_id, name, email, role, created_at FROM hm_users WHERE user_id = $1`,
    [user_id]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};