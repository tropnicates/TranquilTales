const Comment = require('../../models/comment/comment');
const Post = require('../../models/post/Post');
const User = require('../../models/user/User');
const appErr = require('../../utils/appErr');

const createCommentCtrl = async (req, res, next) => {
  try {
    const message = req.body.message?.trim();
    if (!message) {
      return next(appErr('Comment message is required', 400));
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(appErr('Post not found', 404));
    }
    const user = await User.findById(req.session.userAuth);
    if (!user) {
      return next(appErr('User not found', 404));
    }

    const comment = await Comment.create({
      user: user._id,
      message,
      post: post._id,
    });
    post.comments.push(comment._id);
    user.comments.push(comment._id);
    await Promise.all([
      post.save({ validateBeforeSave: false }),
      user.save({ validateBeforeSave: false }),
    ]);

    const populatedComment = await comment.populate({
      path: 'user',
      select: 'fullname profileImage',
    });
    res.status(201).json({ status: 'success', data: { comment: populatedComment } });
  } catch (error) {
    next(error);
  }
};

const commentDetailsCtrl = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id).populate({
      path: 'user',
      select: 'fullname profileImage',
    });
    if (!comment) {
      return next(appErr('Comment not found', 404));
    }
    res.json({ status: 'success', data: { comment } });
  } catch (error) {
    next(error);
  }
};

const deleteCommentCtrl = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return next(appErr('Comment not found', 404));
    }
    if (comment.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr('You are not allowed to delete this comment', 403));
    }

    await Promise.all([
      Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } }),
      User.findByIdAndUpdate(comment.user, { $pull: { comments: comment._id } }),
      Comment.findByIdAndDelete(comment._id),
    ]);
    res.json({ status: 'success', message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

const updateCommentCtrl = async (req, res, next) => {
  try {
    const message = req.body.message?.trim();
    if (!message) {
      return next(appErr('Comment message is required', 400));
    }
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return next(appErr('Comment not found', 404));
    }
    if (comment.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr('You are not allowed to update this comment', 403));
    }

    comment.message = message;
    await comment.save();
    res.json({ status: 'success', data: { comment } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCommentCtrl,
  commentDetailsCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
};
