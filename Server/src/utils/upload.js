// src/utils/upload.js
const multer = require('multer');
const cloudinary = require('../config/cloudinary.config');
const path = require('path');

// Multer configuration — stores files in memory for Cloudinary upload
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
}).single('image');

// Middleware to upload the image to Cloudinary
const uploadToCloudinary = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  let publicId;
  let folder;

  if (req.body.title) {
    // Blog post image
    const title = req.body.title.replace(/\s+/g, '_').toLowerCase();
    const dateOfVisit = req.body.dateOfVisit;
    publicId = `${title}_${dateOfVisit}`;
    folder = 'blog_posts';
  } else if (req.body.username) {
    // User profile picture
    const username = req.body.username.replace(/\s+/g, '_').toLowerCase();
    publicId = `${username}_profile_Pic`;
    folder = 'profile_pictures';
  } else {
    return res.status(400).json({ error: 'Invalid request' });
  }

  cloudinary.uploader
    .upload_stream({ folder, public_id: publicId }, (error, result) => {
      if (error) {
        return res.status(500).json({ error: 'Image upload failed', details: error });
      }
      req.fileUrl = result.secure_url;
      next();
    })
    .end(req.file.buffer);
};

module.exports = { upload, uploadToCloudinary };
