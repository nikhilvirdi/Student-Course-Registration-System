const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const documentsController = require('./documents.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

// Configure multer disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

router.use(authMiddleware);
router.use(roleMiddleware(['STUDENT', 'ADMIN']));

router.get('/', documentsController.getDocuments);
router.post('/', upload.single('file'), documentsController.uploadDocument);
router.get('/:id/download', documentsController.downloadDocument);
router.delete('/:id', documentsController.deleteDocument);

module.exports = router;
