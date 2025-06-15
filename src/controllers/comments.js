const {
	createComment,
	updateComment,
	deleteComment,
	getPostComments,
	getCommentById,
} = require("../models/comment");
const logger = require("../utils/logger");

// Create a comment on a post
const create = async (req, res) => {
	try {
		const user_id = req.user.id;
		const { post_id, content } = req.body;
		if (!post_id || !content)
			return res.status(400).json({ error: "post_id and content required" });
		const comment = await createComment({ user_id, post_id, content });
		logger.verbose(`User ${user_id} commented on post ${post_id}`);
		res.status(201).json({ message: "Comment created", comment });
	} catch (error) {
		logger.critical("Create comment error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Update a comment
const update = async (req, res) => {
	try {
		const user_id = req.user.id;
		const { comment_id } = req.params;
		const { content } = req.body;
		if (!content) return res.status(400).json({ error: "content required" });
		const updated = await updateComment(comment_id, user_id, content);
		if (!updated)
			return res
				.status(404)
				.json({ error: "Comment not found or unauthorized" });
		logger.verbose(`User ${user_id} updated comment ${comment_id}`);
		res.json({ message: "Comment updated", comment: updated });
	} catch (error) {
		logger.critical("Update comment error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Delete a comment
const remove = async (req, res) => {
	try {
		const user_id = req.user.id;
		const { comment_id } = req.params;
		const success = await deleteComment(comment_id, user_id);
		if (!success)
			return res
				.status(404)
				.json({ error: "Comment not found or unauthorized" });
		logger.verbose(`User ${user_id} deleted comment ${comment_id}`);
		res.json({ message: "Comment deleted" });
	} catch (error) {
		logger.critical("Delete comment error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Get comments for a post
const getForPost = async (req, res) => {
	try {
		const { post_id } = req.params;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const offset = (page - 1) * limit;
		const comments = await getPostComments(post_id, limit, offset);
		res.json({
			comments,
			pagination: { page, limit, hasMore: comments.length === limit },
		});
	} catch (error) {
		logger.critical("Get post comments error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

module.exports = {
	create,
	update,
	remove,
	getForPost,
};
