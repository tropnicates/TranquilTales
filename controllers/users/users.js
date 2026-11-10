const bcrypt = require('bcryptjs');
const User = require('../../models/user/User');
const appErr = require('../../utils/appErr');

const publicUser = user => {
  const result = user.toObject ? user.toObject() : { ...user };
  delete result.password;
  return result;
};

const registerCtrl = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
      return next(appErr('Full name, email, and password are required', 400));
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
      return next(appErr('An account with this email already exists', 409));
    }

    const user = await User.create({
      fullname: fullname.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      ...(req.file && { profileImage: req.file.path }),
    });
    req.session.userAuth = user._id.toString();
    res.status(201).json({ status: 'success', data: { user: publicUser(user) } });
  } catch (error) {
    next(error);
  }
};

const loginCtrl = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(appErr('Email and password are required', 400));
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(appErr('Invalid email or password', 401));
    }

    req.session.userAuth = user._id.toString();
    res.json({ status: 'success', data: { user: publicUser(user) } });
  } catch (error) {
    next(error);
  }
};

const sessionCtrl = async (req, res, next) => {
  try {
    if (!req.session.userAuth) {
      return res.json({ status: 'success', data: { user: null } });
    }
    const user = await User.findById(req.session.userAuth);
    if (!user) {
      req.session.userAuth = null;
      return res.json({ status: 'success', data: { user: null } });
    }
    res.json({ status: 'success', data: { user: publicUser(user) } });
  } catch (error) {
    next(error);
  }
};

const userDetailsCtrl = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return next(appErr('User not found', 404));
    }
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

const profileCtrl = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userAuth)
      .select('-password')
      .populate({ path: 'posts', populate: { path: 'user', select: 'fullname profileImage' } })
      .populate('comments');
    if (!user) {
      return next(appErr('User not found', 404));
    }
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

const uploadProfilePhotoCtrl = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(appErr('Please upload an image', 400));
    }
    const user = await User.findByIdAndUpdate(
      req.session.userAuth,
      { profileImage: req.file.path },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return next(appErr('User not found', 404));
    }
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

const uploadCoverImgCtrl = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(appErr('Please upload an image', 400));
    }
    const user = await User.findByIdAndUpdate(
      req.session.userAuth,
      { coverImage: req.file.path },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return next(appErr('User not found', 404));
    }
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

const updatePasswordCtrl = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return next(appErr('Password is required', 400));
    }
    const user = await User.findByIdAndUpdate(
      req.session.userAuth,
      { password: await bcrypt.hash(password, 10) },
      { new: true }
    ).select('-password');
    if (!user) {
      return next(appErr('User not found', 404));
    }
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

const updateUserCtrl = async (req, res, next) => {
  try {
    const { fullname, email } = req.body;
    if (!fullname || !email) {
      return next(appErr('Full name and email are required', 400));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailTaken = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.session.userAuth },
    });
    if (emailTaken) {
      return next(appErr('An account with this email already exists', 409));
    }

    const user = await User.findByIdAndUpdate(
      req.session.userAuth,
      { fullname: fullname.trim(), email: normalizedEmail },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return next(appErr('User not found', 404));
    }
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

const logoutCtrl = (req, res, next) => {
  req.session.destroy(error => {
    if (error) {
      return next(error);
    }
    res.clearCookie('connect.sid');
    res.json({ status: 'success', message: 'Logged out' });
  });
};

module.exports = {
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
};
