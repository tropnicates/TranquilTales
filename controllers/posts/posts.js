const Post = require('../../models/post/Post');
const User = require('../../models/user/User');
const Comment = require('../../models/comment/comment');
const appErr = require('../../utils/appErr');

const createPostCtrl = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description || !category || !req.file) {
      return next(appErr('Title, description, category, and image are required', 400));
    }

    const user = await User.findById(req.session.userAuth);
    if (!user) {
      return next(appErr('User not found', 404));
    }

    const post = await Post.create({
      title,
      description,
      category,
      user: user._id,
      image: req.file.path,
    });
    user.posts.push(post._id);
    await user.save();
    const populatedPost = await post.populate({ path: 'user', select: 'fullname profileImage' });
    res.status(201).json({ status: 'success', data: { post: populatedPost } });
  } catch (error) {
    next(error);
  }
};

const fetchPostsCtrl = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: 'user', select: 'fullname profileImage' });
    res.json({ status: 'success', data: { posts } });
  } catch (error) {
    next(error);
  }
};

const fetchPostCtrl = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({ path: 'user', select: 'fullname profileImage role bio' })
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'fullname profileImage' },
      });
    if (!post) {
      return next(appErr('Post not found', 404));
    }
    res.json({ status: 'success', data: { post } });
  } catch (error) {
    next(error);
  }
};

const deletePostCtrl = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(appErr('Post not found', 404));
    }
    if (post.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr('You are not authorized to delete this post', 403));
    }

    await Comment.deleteMany({ post: post._id });
    await User.findByIdAndUpdate(post.user, { $pull: { posts: post._id } });
    await Post.findByIdAndDelete(post._id);
    res.json({ status: 'success', message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

const updatepostCtrl = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(appErr('Post not found', 404));
    }
    if (post.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr('You are not authorized to update this post', 403));
    }

    const { title, description, category } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        ...(req.file && { image: req.file.path }),
      },
      { new: true, runValidators: true }
    ).populate({ path: 'user', select: 'fullname profileImage' });
    res.json({ status: 'success', data: { post: updatedPost } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPostCtrl,
  fetchPostsCtrl,
  fetchPostCtrl,
  deletePostCtrl,
  updatepostCtrl,
};
