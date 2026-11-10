const protected = (req, res, next) => {
  if (!req.session.userAuth) {
    return res.status(401).json({
      status: 'fail',
      message: 'Please log in to continue',
    });
  }

  next();
};
module.exports = protected;
