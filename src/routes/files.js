const express = require('express');
const router = express.Router();
const File = require('../models/file');
const { upload } = require('../middlewares/upload');
const StorageService = require('../services/storage');
const QuotaService = require('../services/quota');
const User = require('../models/user');

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const canUpload = await QuotaService.canUpload(req.user.id, req.file.size);
    if (!canUpload) {
      await StorageService.deleteFile(req.file.filename);
      return res.status(400).json({ error: 'Quota exceeded' });
    }

    const file = await File.create({
      userId: req.user.id,
      originalName: req.file.originalname,
      storagePath: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {}
    });

    await User.updateStorageUsed(req.user.id, req.file.size);
    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const files = await File.findByUserId(req.user.id);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const file = await File.delete(req.params.id, req.user.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    await StorageService.deleteFile(file.storage_path);
    await User.updateStorageUsed(req.user.id, -file.size);
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
