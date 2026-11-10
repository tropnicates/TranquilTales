const globalErrHandler = (err, req, res, next) => {
  const statusCode =
    err.code === 'LIMIT_FILE_SIZE'
      ? 413
      : err.statusCode || err.status || 500;
  if (statusCode >= 500) {
    console.error(`Request failed: ${req.method} ${req.path}`, err);
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message:
      statusCode >= 500 && process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message || 'An unexpected error occurred',
  });
};
module.exports = globalErrHandler;
