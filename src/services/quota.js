const User = require('../models/user');

class QuotaService {
  static async canUpload(userId, fileSize) {
    const user = await User.findById(userId);
    return (user.storage_used + fileSize) <= user.quota_limit;
  }

  static formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }
}

module.exports = QuotaService;
