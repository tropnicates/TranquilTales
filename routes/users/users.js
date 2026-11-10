const express = require('express');
const multer = require('multer');
const storage = require('../../config/cloudinary');
const {
  registerCtrl,
  loginCtrl,
  sessionCtrl,
  userDetailsCtrl,
  profileCtrl,
  uploadProfilePhotoCtrl,
  uploadCoverImgCtrl,
  updatePasswordCtrl,
  updateUserCtrl,
  logoutCtrl,
} = require('../../controllers/users/users');
const protectedRoute = require('../../middlewares/protected');

const userRoutes = express.Router();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

userRoutes.get('/session', sessionCtrl);
userRoutes.post('/register', upload.single('profile'), registerCtrl);
userRoutes.post('/login', loginCtrl);
userRoutes.get('/profile-page', protectedRoute, profileCtrl);
userRoutes.put(
  '/profile-photo-upload',
  protectedRoute,
  upload.single('profile'),
  uploadProfilePhotoCtrl
);
userRoutes.put(
  '/cover-photo-upload',
  protectedRoute,
  upload.single('profile'),
  uploadCoverImgCtrl
);
userRoutes.put('/update-password', protectedRoute, updatePasswordCtrl);
userRoutes.put('/update', protectedRoute, updateUserCtrl);
userRoutes.post('/logout', logoutCtrl);
userRoutes.get('/:id', userDetailsCtrl);

module.exports = userRoutes;
