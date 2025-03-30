const fs = require('fs');
const path = require('path');
// Assuming MongoDB models will be used in the future
// const Experiment = require('../models/experimentModel');

// Simulated data storage
let experiments = [];
let idCounter = 1;

// Simulated experiment types
const experimentTypes = [
  'space_data_storage',
  'space_agriculture',
  'aerospace_medical',
  'earth_atmosphere',
  '3d_printing',
  'radiation_testing'
];

// Initialize some mock data
for (let i = 0; i < 20; i++) {
  const typeIndex = Math.floor(Math.random() * experimentTypes.length);
  experiments.push({
    id: idCounter++,
    name: `${experimentTypes[typeIndex]} Experiment ${i + 1}`,
    description: `This is a demonstration experiment for ${experimentTypes[typeIndex]} research.`,
    experimentType: experimentTypes[typeIndex],
    ipfsDataHash: `ipfs://hash${Math.random().toString(16).substr(2, 40)}`,
    timestamp: Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
    scientist: `0x${Math.random().toString(16).substr(2, 40)}`,
    verified: Math.random() > 0.5,
    dataFileUrl: null
  });
}

// Get all experiments
exports.getAllExperiments = (req, res) => {
  try {
    // Support pagination
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    const paginatedExperiments = experiments.slice(offset, offset + limit);
    
    res.json({
      success: true,
      count: experiments.length,
      data: paginatedExperiments
    });
  } catch (error) {
    console.error('Failed to get experiments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get experiments',
      error: error.message
    });
  }
};

// Get specific experiment
exports.getExperimentById = (req, res) => {
  try {
    const { id } = req.params;
    const experiment = experiments.find(e => e.id === parseInt(id));
    
    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment does not exist'
      });
    }
    
    res.json({
      success: true,
      data: experiment
    });
  } catch (error) {
    console.error('Failed to get experiment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get experiment',
      error: error.message
    });
  }
};

// Create new experiment
exports.createExperiment = (req, res) => {
  try {
    const { name, description, experimentType, scientist } = req.body;
    
    // Validate required fields
    if (!name || !description || !experimentType || !scientist) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, experiment type, and scientist address are required fields'
      });
    }
    
    // Check if experiment type is valid
    if (!experimentTypes.includes(experimentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid experiment type'
      });
    }
    
    // Generate IPFS hash (simulated)
    const ipfsDataHash = `ipfs://hash${Math.random().toString(16).substr(2, 40)}`;
    
    // Create new experiment
    const newExperiment = {
      id: idCounter++,
      name,
      description,
      experimentType,
      ipfsDataHash,
      timestamp: Date.now(),
      scientist,
      verified: false
    };
    
    // Handle uploaded data file
    if (req.file) {
      newExperiment.dataFileUrl = `/uploads/experiments/${req.file.filename}`;
    }
    
    // Save experiment
    experiments.push(newExperiment);
    
    res.status(201).json({
      success: true,
      message: 'Experiment created successfully',
      data: newExperiment
    });
  } catch (error) {
    console.error('Failed to create experiment:', error);
    
    // If a file was uploaded but saving failed, delete the file
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete file:', err);
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create experiment',
      error: error.message
    });
  }
};

// Get experiments of a specific type
exports.getExperimentsByType = (req, res) => {
  try {
    const { experimentType } = req.params;
    
    if (!experimentTypes.includes(experimentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid experiment type'
      });
    }
    
    const typeExperiments = experiments.filter(e => e.experimentType === experimentType);
    
    res.json({
      success: true,
      count: typeExperiments.length,
      data: typeExperiments
    });
  } catch (error) {
    console.error('Failed to get experiments by type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get experiments by type',
      error: error.message
    });
  }
};

// Get experiments by scientist
exports.getScientistExperiments = (req, res) => {
  try {
    const { address } = req.params;
    
    const scientistExperiments = experiments.filter(e => 
      e.scientist.toLowerCase() === address.toLowerCase()
    );
    
    res.json({
      success: true,
      count: scientistExperiments.length,
      data: scientistExperiments
    });
  } catch (error) {
    console.error('Failed to get scientist experiments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scientist experiments',
      error: error.message
    });
  }
};

// Verify experiment (admin only)
exports.verifyExperiment = (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    
    // In a real application, check if user has admin permission
    // if (!req.user.isAdmin) {...}
    
    const experiment = experiments.find(e => e.id === parseInt(id));
    
    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment does not exist'
      });
    }
    
    experiment.verified = !!verified;
    
    res.json({
      success: true,
      message: `Experiment ${verified ? 'verified' : 'unverified'}`,
      data: experiment
    });
  } catch (error) {
    console.error('Failed to verify experiment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify experiment',
      error: error.message
    });
  }
};

// Get verified experiments
exports.getVerifiedExperiments = (req, res) => {
  try {
    const verifiedExperiments = experiments.filter(e => e.verified);
    
    res.json({
      success: true,
      count: verifiedExperiments.length,
      data: verifiedExperiments
    });
  } catch (error) {
    console.error('Failed to get verified experiments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verified experiments',
      error: error.message
    });
  }
};

// Get experiment type statistics
exports.getTypeStats = (req, res) => {
  try {
    const stats = {};
    
    experimentTypes.forEach(type => {
      const typeCount = experiments.filter(e => e.experimentType === type).length;
      const verifiedCount = experiments.filter(e => e.experimentType === type && e.verified).length;
      
      stats[type] = {
        total: typeCount,
        verified: verifiedCount,
        percent: typeCount > 0 ? Math.round(verifiedCount / typeCount * 100) : 0
      };
    });
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Failed to get experiment type statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get experiment type statistics',
      error: error.message
    });
  }
}; 