const {
	likePost,
	unlikePost,
	getPostLikes,
	getUserLikes,
	hasUserLikedPost,
} = require("../models/like");
const logger = require("../utils/logger");

// Like a post
const like = async (req, res) => {
	try {
		const userId = req.user.id;
		const { post_id } = req.body;
		if (!post_id) return res.status(400).json({ error: "post_id required" });
		const success = await likePost(userId, post_id);
		if (!success) return res.status(409).json({ error: "Already liked" });
		logger.verbose(`User ${userId} liked post ${post_id}`);
		res.json({ message: "Post liked" });
	} catch (error) {
		logger.critical("Like post error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Unlike a post
const unlike = async (req, res) => {
	try {
		const userId = req.user.id;
		const { post_id } = req.params;
		const success = await unlikePost(userId, post_id);
		if (!success) return res.status(409).json({ error: "Not liked" });
		logger.verbose(`User ${userId} unliked post ${post_id}`);
		res.json({ message: "Post unliked" });
	} catch (error) {
		logger.critical("Unlike post error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Get likes for a post
const getLikesForPost = async (req, res) => {
	try {
		const { post_id } = req.params;
		const likes = await getPostLikes(post_id);
		res.json({ likes });
	} catch (error) {
		logger.critical("Get post likes error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Get posts liked by a user
const getLikesByUser = async (req, res) => {
	try {
		const { user_id } = req.params;
		const likes = await getUserLikes(user_id);
		res.json({ likes });
	} catch (error) {
		logger.critical("Get user likes error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

module.exports = {
	like,
	unlike,
	getLikesForPost,
	getLikesByUser,
};
