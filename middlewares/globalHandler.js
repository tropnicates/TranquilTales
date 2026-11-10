const globalErrHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message: err.message || 'An unexpected error occurred',
  });
};
module.exports = globalErrHandler;
