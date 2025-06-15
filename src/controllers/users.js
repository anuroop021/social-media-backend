const {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowCounts,
} = require("../models/follow");
const {
  getUserById,
  findUsersByName,
  getUserProfile,
} = require("../models/user");
const logger = require("../utils/logger");

// Follow a user
const follow = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { user_id: followingId } = req.body;
    if (!followingId) return res.status(400).json({ error: "user_id required" });
    if (followerId === followingId) return res.status(400).json({ error: "Cannot follow yourself" });
    const user = await getUserById(followingId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const success = await followUser(followerId, followingId);
    if (!success) return res.status(409).json({ error: "Already following" });
    logger.verbose(`User ${followerId} followed ${followingId}`);
    res.json({ message: "Followed successfully" });
  } catch (error) {
    logger.critical("Follow error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Unfollow a user
const unfollow = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { user_id: followingId } = req.body;
    if (!followingId) return res.status(400).json({ error: "user_id required" });
    const success = await unfollowUser(followerId, followingId);
    if (!success) return res.status(409).json({ error: "Not following" });
    logger.verbose(`User ${followerId} unfollowed ${followingId}`);
    res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    logger.critical("Unfollow error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get users the current user is following
const getMyFollowing = async (req, res) => {
  try {
    const userId = req.user.id;
    const following = await getFollowing(userId);
    res.json({ following });
  } catch (error) {
    logger.critical("Get following error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get users that follow the current user
const getMyFollowers = async (req, res) => {
  try {
    const userId = req.user.id;
    const followers = await getFollowers(userId);
    res.json({ followers });
  } catch (error) {
    logger.critical("Get followers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get follow stats for current user
const getMyFollowStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await getFollowCounts(userId);
    res.json({ stats });
  } catch (error) {
    logger.critical("Get follow stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Search users by name
const search = async (req, res) => {
  try {
    const { name, page = 1, limit = 20 } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });
    const offset = (page - 1) * limit;
    const users = await findUsersByName(name, limit, offset);
    res.json({ users, pagination: { page, limit, hasMore: users.length === limit } });
  } catch (error) {
    logger.critical("User search error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user profile with follower/following counts
const profile = async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await getUserProfile(user_id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error) {
    logger.critical("Get user profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  follow,
  unfollow,
  getMyFollowing,
  getMyFollowers,
  getMyFollowStats,
  search,
  profile,
};
