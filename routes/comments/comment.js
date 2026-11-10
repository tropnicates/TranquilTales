const express = require('express');
const {
  createCommentCtrl,
  commentDetailsCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
} = require('../../controllers/comments/comments');
const protectedRoute = require('../../middlewares/protected');

const commentRoutes = express.Router();

commentRoutes.post('/:id', protectedRoute, createCommentCtrl);
commentRoutes.get('/:id', commentDetailsCtrl);
commentRoutes.delete('/:id', protectedRoute, deleteCommentCtrl);
commentRoutes.put('/:id', protectedRoute, updateCommentCtrl);

module.exports = commentRoutes;
