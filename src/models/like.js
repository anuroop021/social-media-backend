const { query } = require("../utils/database");

/**
 * Like model for managing post likes
 */

// Like a post
const likePost = async (userId, postId) => {
  const result = await query(
    `INSERT INTO likes (user_id, post_id) VALUES ($1, $2)
     ON CONFLICT (user_id, post_id) DO NOTHING RETURNING id`,
    [userId, postId]
  );
  return result.rowCount > 0;
};

// Unlike a post
const unlikePost = async (userId, postId) => {
  const result = await query(
    `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  );
  return result.rowCount > 0;
};

// Get likes for a post
const getPostLikes = async (postId) => {
  const result = await query(
    `SELECT l.*, u.username, u.full_name FROM likes l JOIN users u ON l.user_id = u.id WHERE l.post_id = $1`,
    [postId]
  );
  return result.rows;
};

// Get posts liked by a user
const getUserLikes = async (userId) => {
  const result = await query(
    `SELECT l.*, p.content, p.media_url FROM likes l JOIN posts p ON l.post_id = p.id WHERE l.user_id = $1`,
    [userId]
  );
  return result.rows;
};

// Check if user liked a post
const hasUserLikedPost = async (userId, postId) => {
  const result = await query(
    `SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  );
  return result.rowCount > 0;
};

module.exports = {
  likePost,
  unlikePost,
  getPostLikes,
  getUserLikes,
  hasUserLikedPost,
};
