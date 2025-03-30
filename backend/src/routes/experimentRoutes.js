const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const experimentController = require('../controllers/experimentController');

// Configure data file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/experiments'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'exp-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit 10MB
  fileFilter: (req, file, cb) => {
    // Accept common data file formats
    if (!file.originalname.match(/\.(csv|json|txt|dat|xlsx|zip)$/)) {
      return cb(new Error('Unsupported file format!'), false);
    }
    cb(null, true);
  }
});

// Get all experiments
router.get('/', experimentController.getAllExperiments);

// Get specific experiment
router.get('/:id', experimentController.getExperimentById);

// Create new experiment
router.post('/', upload.single('dataFile'), experimentController.createExperiment);

// Get experiments of a specific type
router.get('/type/:experimentType', experimentController.getExperimentsByType);

// Get experiments by scientist
router.get('/scientist/:address', experimentController.getScientistExperiments);

// Verify experiment (admin only)
router.put('/:id/verify', experimentController.verifyExperiment);

// Get verified experiments
router.get('/verified/all', experimentController.getVerifiedExperiments);

// Get experiment type statistics
router.get('/stats/types', experimentController.getTypeStats);

module.exports = router; 