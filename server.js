require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const MongoStore = require('connect-mongo');
const globalErrHandler = require('./middlewares/globalHandler');
const commentRoutes = require('./routes/comments/comment');
const postRoutes = require('./routes/posts/posts');
const userRoutes = require('./routes/users/users');
const dbConnect = require('./config/dbConnect');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_KEY || 'tranquil-tales-development-session-secret',
    resave: false,
    saveUninitialized: false,
    store: process.env.MONGO_URL
      ? MongoStore.create({ mongoUrl: process.env.MONGO_URL })
      : undefined,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  })
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'TranquilTales API is running' });
});
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api', (req, res) => {
  res.status(404).json({ status: 'fail', message: 'API route not found' });
});
app.use(globalErrHandler);

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const start = async () => {
  if (process.env.NODE_ENV === 'production' && !process.env.SESSION_KEY) {
    throw new Error('SESSION_KEY is required in production');
  }
  await dbConnect();
  const port = process.env.PORT || 9000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

if (require.main === module) {
  start().catch(error => {
    console.error('Unable to start the server:', error.message);
    process.exitCode = 1;
  });
}

module.exports = app;
