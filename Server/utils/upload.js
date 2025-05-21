const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');  
const path = require('path');  

// Multer configuration (no need to define storage since we're uploading directly to Cloudinary)
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },  // Max file size: 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  }
}).single('image');  // Accept a single image file

// Middleware to upload the image to Cloudinary
const uploadToCloudinary = (req, res, next) => {
  // If no image is uploaded, skip the Cloudinary upload and proceed
  if (req.file) {
    let publicId;

    // Check if the request is for a post or a user
    if (req.body.title) {
      // For blog post: Use title_postId for the image filename
      const title = req.body.title.replace(/\s+/g, '_').toLowerCase();  // Replace spaces with underscores and make it lowercase
      const dateOfVisit = req.body.dateOfVisit;
      publicId = `${title}_${dateOfVisit}`;
    } else if (req.body.username) {
      // For user profile: Use username_userId for the image filename
      const username = req.body.username.replace(/\s+/g, '_').toLowerCase();
      publicId = `${username}_profile_Pic`;
    } else {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Upload the image to Cloudinary using the custom filename
    cloudinary.uploader.upload_stream(
      {
        folder: req.body.title ? "blog_posts" : "profile_pictures",  // Different folder based on context
        public_id: publicId,    // Custom filename
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'Image upload failed', details: error });
        }
        req.fileUrl = result.secure_url;  // Store the Cloudinary URL in the request object
        next();  // Proceed to the next middleware or route handler
      }
    ).end(req.file.buffer);
  } else {
    next();
  }
  
};

module.exports = { upload, uploadToCloudinary }; 
