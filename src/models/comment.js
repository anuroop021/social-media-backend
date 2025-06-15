const { query } = require("../utils/database");

/**
 * Comment model for managing post comments
 */

// Create a comment on a post
const createComment = async ({ user_id, post_id, content }) => {
  const result = await query(
    `INSERT INTO comments (user_id, post_id, content, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING id, user_id, post_id, content, created_at, updated_at`,
    [user_id, post_id, content]
  );
  return result.rows[0];
};

// Update a comment
const updateComment = async (commentId, userId, content) => {
  const result = await query(
    `UPDATE comments SET content = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3 AND is_deleted = FALSE
     RETURNING id, user_id, post_id, content, updated_at`,
    [content, commentId, userId]
  );
  return result.rows[0];
};

// Delete a comment
const deleteComment = async (commentId, userId) => {
  const result = await query(
    `UPDATE comments SET is_deleted = TRUE WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE`,
    [commentId, userId]
  );
  return result.rowCount > 0;
};

// Get comments for a post (with pagination)
const getPostComments = async (postId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT c.*, u.username, u.full_name FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = $1 AND c.is_deleted = FALSE ORDER BY c.created_at ASC LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );
  return result.rows;
};

// Get a comment by ID
const getCommentById = async (commentId) => {
  const result = await query(
    `SELECT * FROM comments WHERE id = $1 AND is_deleted = FALSE`,
    [commentId]
  );
  return result.rows[0];
};

module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
  getCommentById,
};
