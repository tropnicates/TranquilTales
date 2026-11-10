const mongoose = require("mongoose");

const dbConnect = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URL is required');
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log('DB Connected Successfully');
};

module.exports = dbConnect;
