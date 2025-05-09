// config/upload.js
const multer = require('multer');
const path = require('path');

// Set storage engine for multer (saving images in the 'uploads' directory)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');  // Folder to save uploaded images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); 
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // File name
  }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'));
  }
};

// Set up the multer middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // Max file size: 5MB
  fileFilter: fileFilter
});

module.exports = upload;
