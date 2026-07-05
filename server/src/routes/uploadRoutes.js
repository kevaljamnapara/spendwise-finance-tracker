import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadAvatar, uploadReceipt, cloudinary } from '../config/cloudinary.js';

const router = express.Router();

// @desc    Upload user avatar
// @route   POST /api/v1/upload/avatar
// @access  Private
router.post('/avatar', protect, uploadAvatar.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image' });
  }
  
  res.json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      url: req.file.path,
      id: req.file.filename
    }
  });
});

// @desc    Upload expense receipt
// @route   POST /api/v1/upload/receipt
// @access  Private
router.post('/receipt', protect, uploadReceipt.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a file' });
  }

  res.json({
    success: true,
    message: 'Receipt uploaded successfully',
    data: {
      url: req.file.path,
      id: req.file.filename
    }
  });
});

// @desc    Delete file from cloudinary
// @route   DELETE /api/v1/upload
// @access  Private
router.delete('/', protect, async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, message: 'File ID is required' });
  }

  try {
    await cloudinary.uploader.destroy(id);
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete file' });
  }
});

export default router;
