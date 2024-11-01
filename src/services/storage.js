const fs = require('fs').promises;
const path = require('path');
const User = require('../models/user');

class StorageService {
  static async checkQuota(userId, fileSize) {
    const user = await User.findById(userId);
    const newTotal = user.storage_used + fileSize;
    if (newTotal > user.quota_limit) {
      throw new Error('Quota exceeded');
    }
  }

  static async deleteFile(storagePath) {
    const fullPath = path.join(__dirname, '../../uploads', storagePath);
    await fs.unlink(fullPath);
  }
}

module.exports = StorageService;
