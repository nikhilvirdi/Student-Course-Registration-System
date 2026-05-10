const express = require('express');
const router = express.Router();
const documentsController = require('./documents.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

router.use(authMiddleware);
router.use(roleMiddleware(['STUDENT', 'ADMIN']));

router.get('/', documentsController.getDocuments);
router.post('/', documentsController.uploadDocument);
router.delete('/:id', documentsController.deleteDocument);

module.exports = router;
