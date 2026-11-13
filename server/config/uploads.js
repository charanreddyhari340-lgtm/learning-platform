const path = require('path');

const uploadsPath = path.resolve(process.env.UPLOADS_DIR || path.join(__dirname, '../uploads'));

module.exports = {
  uploadsPath,
  documentsPath: path.join(uploadsPath, 'documents'),
  videosPath: path.join(uploadsPath, 'videos'),
  imagesPath: path.join(uploadsPath, 'images'),
};
