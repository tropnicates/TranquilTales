const express = require('express');
const multer = require('multer');
const storage = require('../../config/cloudinary');
const {
  createPostCtrl,
  deletePostCtrl,
  fetchPostCtrl,
  fetchPostsCtrl,
  updatepostCtrl,
} = require('../../controllers/posts/posts');
const protectedRoute = require('../../middlewares/protected');

const postRoutes = express.Router();
const upload = multer({ storage });

postRoutes.get('/', fetchPostsCtrl);
postRoutes.post('/', protectedRoute, upload.single('file'), createPostCtrl);
postRoutes.get('/:id', fetchPostCtrl);
postRoutes.delete('/:id', protectedRoute, deletePostCtrl);
postRoutes.put('/:id', protectedRoute, upload.single('file'), updatepostCtrl);

module.exports = postRoutes;
