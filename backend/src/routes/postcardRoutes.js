const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const postcardController = require('../controllers/postcardController');

// Configure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'postcard-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
  fileFilter: (req, file, cb) => {
    // Only accept image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Get all postcards
router.get('/', postcardController.getAllPostcards);

// Get specific postcard
router.get('/:id', postcardController.getPostcardById);

// Create new postcard
router.post('/', upload.single('image'), postcardController.createPostcard);

// Get user's postcards
router.get('/user/:walletAddress', postcardController.getUserPostcards);

// Get postcards from a specific batch
router.get('/batch/:batchId', postcardController.getBatchPostcards);

// Get postcard status statistics
router.get('/stats/status', postcardController.getStatusStats);

module.exports = router; 