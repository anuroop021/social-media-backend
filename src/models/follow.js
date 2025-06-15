const { query } = require("../utils/database");

/**
 * Follow model for managing user relationships
 */

// Follow a user
const followUser = async (followerId, followingId) => {
  if (followerId === followingId) return false;
  const result = await query(
    `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)
     ON CONFLICT (follower_id, following_id) DO NOTHING RETURNING id`,
    [followerId, followingId]
  );
  return result.rowCount > 0;
};

// Unfollow a user
const unfollowUser = async (followerId, followingId) => {
  const result = await query(
    `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
    [followerId, followingId]
  );
  return result.rowCount > 0;
};

// Get users the current user is following
const getFollowing = async (userId) => {
  const result = await query(
    `SELECT u.id, u.username, u.full_name FROM follows f JOIN users u ON f.following_id = u.id WHERE f.follower_id = $1`,
    [userId]
  );
  return result.rows;
};

// Get users that follow the current user
const getFollowers = async (userId) => {
  const result = await query(
    `SELECT u.id, u.username, u.full_name FROM follows f JOIN users u ON f.follower_id = u.id WHERE f.following_id = $1`,
    [userId]
  );
  return result.rows;
};

// Get follow counts for a user
const getFollowCounts = async (userId) => {
  const following = await query(
    `SELECT COUNT(*) FROM follows WHERE follower_id = $1`,
    [userId]
  );
  const followers = await query(
    `SELECT COUNT(*) FROM follows WHERE following_id = $1`,
    [userId]
  );
  return {
    following: parseInt(following.rows[0].count, 10),
    followers: parseInt(followers.rows[0].count, 10),
  };
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowCounts,
};
