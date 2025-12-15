const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/profiles', 'uploads/selfies', 'uploads/documents', 'uploads/evidence'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads';
    
    if (file.fieldname === 'profilePhoto') {
      folder = 'uploads/profiles';
    } else if (file.fieldname === 'selfiePhoto') {
      folder = 'uploads/selfies';
    } else if (file.fieldname === 'governmentId') {
      folder = 'uploads/documents';
    } else if (file.fieldname === 'evidence') {
      folder = 'uploads/evidence';
    }
    
    cb(null, path.join(__dirname, '..', folder));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, jpg, png, gif) and PDF files are allowed!'), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload middleware for different purposes
const uploadProfile = upload.single('profilePhoto');
const uploadSelfie = upload.single('selfiePhoto');
const uploadDocument = upload.single('governmentId');
const uploadEvidence = upload.array('evidence', 5);

const uploadOnboarding = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'selfiePhoto', maxCount: 1 },
  { name: 'governmentId', maxCount: 1 }
]);

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = {
  upload,
  uploadProfile,
  uploadSelfie,
  uploadDocument,
  uploadEvidence,
  uploadOnboarding,
  handleUploadError
};
