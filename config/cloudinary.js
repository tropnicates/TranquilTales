require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const storage = {
  _handleFile(req, file, callback) {
    if (!["image/jpeg", "image/png"].includes(file.mimetype)) {
      const error = new Error("Only JPEG and PNG images are supported");
      error.statusCode = 400;
      return callback(error);
    }

    let finished = false;
    const complete = (error, result) => {
      if (finished) {
        return;
      }
      finished = true;
      callback(error, result);
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "blog-app-v3",
        allowed_formats: ["jpg", "jpeg", "png"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      },
      (error, result) => {
        if (error || !result) {
          return complete(error || new Error("Cloudinary did not return an upload result"));
        }
        complete(null, {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes,
        });
      }
    );

    file.stream.on("error", error => {
      uploadStream.destroy();
      complete(error);
    });
    uploadStream.on("error", error => complete(error));
    file.stream.pipe(uploadStream);
  },
  _removeFile(req, file, callback) {
    if (!file.filename) {
      return callback(null);
    }
    cloudinary.uploader
      .destroy(file.filename)
      .then(() => callback(null))
      .catch(callback);
  },
};

module.exports = storage;
