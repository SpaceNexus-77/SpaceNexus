const fs = require('fs');
const path = require('path');
// Assuming MongoDB models will be used, this is just for demonstration
// const Postcard = require('../models/postcardModel');

// Simulated data storage
let postcards = [];
let idCounter = 1;

// Postcard status enum
const PostcardStatus = {
  CREATED: 'created',
  LAUNCHED_TO_SPACE: 'launched_to_space',
  RETURNED_TO_EARTH: 'returned_to_earth',
  MAILED_TO_OWNER: 'mailed_to_owner'
};

// Get all postcards
exports.getAllPostcards = (req, res) => {
  try {
    // In a real application, pagination should be added
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    const paginatedPostcards = postcards.slice(offset, offset + limit);
    
    res.json({
      success: true,
      count: postcards.length,
      data: paginatedPostcards
    });
  } catch (error) {
    console.error('Failed to get postcards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get postcards',
      error: error.message
    });
  }
};

// Get specific postcard
exports.getPostcardById = (req, res) => {
  try {
    const { id } = req.params;
    const postcard = postcards.find(p => p.id === parseInt(id));
    
    if (!postcard) {
      return res.status(404).json({
        success: false,
        message: 'Postcard does not exist'
      });
    }
    
    res.json({
      success: true,
      data: postcard
    });
  } catch (error) {
    console.error('Failed to get postcard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get postcard',
      error: error.message
    });
  }
};

// Create new postcard
exports.createPostcard = (req, res) => {
  try {
    const { name, email, content, walletAddress } = req.body;
    
    // Validate required fields
    if (!name || !email || !content) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and content are required fields'
      });
    }
    
    // Generate new postcard
    const newPostcard = {
      id: idCounter++,
      name,
      email,
      content,
      walletAddress: walletAddress || null,
      status: PostcardStatus.CREATED,
      createdAt: new Date(),
      launchDate: null,
      returnDate: null,
      batchId: 1, // Assuming current batch is 1
      nftTokenId: null // To be filled after NFT generation
    };
    
    // Handle uploaded image
    if (req.file) {
      newPostcard.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    // Save postcard
    postcards.push(newPostcard);
    
    res.status(201).json({
      success: true,
      message: 'Postcard created successfully',
      data: newPostcard
    });
  } catch (error) {
    console.error('Failed to create postcard:', error);
    
    // If a file was uploaded but saving failed, delete the file
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete file:', err);
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create postcard',
      error: error.message
    });
  }
};

// Get user's postcards
exports.getUserPostcards = (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const userPostcards = postcards.filter(p => 
      p.walletAddress && p.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
    
    res.json({
      success: true,
      count: userPostcards.length,
      data: userPostcards
    });
  } catch (error) {
    console.error('Failed to get user postcards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user postcards',
      error: error.message
    });
  }
};

// Get postcards for a specific batch
exports.getBatchPostcards = (req, res) => {
  try {
    const { batchId } = req.params;
    
    const batchPostcards = postcards.filter(p => p.batchId === parseInt(batchId));
    
    res.json({
      success: true,
      count: batchPostcards.length,
      data: batchPostcards
    });
  } catch (error) {
    console.error('Failed to get batch postcards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get batch postcards',
      error: error.message
    });
  }
};

// Get postcard status statistics
exports.getStatusStats = (req, res) => {
  try {
    const stats = {
      total: postcards.length,
      created: postcards.filter(p => p.status === PostcardStatus.CREATED).length,
      launched_to_space: postcards.filter(p => p.status === PostcardStatus.LAUNCHED_TO_SPACE).length,
      returned_to_earth: postcards.filter(p => p.status === PostcardStatus.RETURNED_TO_EARTH).length,
      mailed_to_owner: postcards.filter(p => p.status === PostcardStatus.MAILED_TO_OWNER).length
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Failed to get status statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get status statistics',
      error: error.message
    });
  }
}; 