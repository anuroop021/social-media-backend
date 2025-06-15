const { query } = require("../utils/database");
const bcrypt = require("bcryptjs");

/**
 * User model for database operations
 */

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
const createUser = async ({ username, email, password, full_name }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (username, email, password_hash, full_name, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, username, email, full_name, created_at`,
    [username, email, hashedPassword, full_name],
  );

  return result.rows[0];
};

/**
 * Find user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User object or null
 */
const getUserByUsername = async (username) => {
  const result = await query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null
 */
const getUserById = async (id) => {
  const result = await query(
    "SELECT id, username, email, full_name, created_at FROM users WHERE id = $1",
    [id],
  );

  return result.rows[0] || null;
};

/**
 * Verify user password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} Password match result
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Find users by name (partial match, pagination)
 * @param {string} name - Name to search for
 * @param {number} limit - Number of results to return
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array<Object>>} List of matching users
 */
const findUsersByName = async (name, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT id, username, full_name FROM users WHERE full_name ILIKE $1 OR username ILIKE $1 LIMIT $2 OFFSET $3`,
    [`%${name}%`, limit, offset]
  );
  return result.rows;
};

/**
 * Get user profile with follower/following counts
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User profile with counts or null
 */
const getUserProfile = async (userId) => {
  const userResult = await query(
    `SELECT id, username, email, full_name, created_at FROM users WHERE id = $1`,
    [userId]
  );
  if (!userResult.rows[0]) return null;
  const user = userResult.rows[0];
  const following = await query(`SELECT COUNT(*) FROM follows WHERE follower_id = $1`, [userId]);
  const followers = await query(`SELECT COUNT(*) FROM follows WHERE following_id = $1`, [userId]);
  return {
    ...user,
    following: parseInt(following.rows[0].count, 10),
    followers: parseInt(followers.rows[0].count, 10),
  };
};

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  verifyPassword,
  findUsersByName,
  getUserProfile,
};
