const path = require('path');
const fs = require('fs');
const documentsService = require('./documents.service');
const auditService = require('../admin/audit.service');

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getDocuments = async (req, res, next) => {
  try {
    const documents = await documentsService.getDocuments(req.user.id, req.user.role);
    res.status(200).json({ success: true, message: 'Documents retrieved', data: documents });
  } catch (error) {
    next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    let name = req.body.name;
    let size = req.body.size || '0 KB';
    let url = req.body.url || '';
    let type = req.body.type || 'Other';

    if (req.file) {
      name = name || req.file.originalname;
      size = formatBytes(req.file.size);
      url = `/uploads/${req.file.filename}`;
      if (!req.body.type || req.body.type === 'Other') {
        const ext = path.extname(req.file.originalname).toLowerCase();
        if (ext === '.pdf') type = 'PDF';
        else if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) type = 'Image';
        else if (['.doc', '.docx'].includes(ext)) type = 'Document';
        else if (['.zip', '.rar'].includes(ext)) type = 'Archive';
      }
    }

    if (!name) {
      return res.status(400).json({ success: false, message: 'File or document name is required' });
    }

    const document = await documentsService.uploadDocument(req.user.id, {
      name,
      type,
      size,
      url,
      student_id: req.body.student_id
    }, req.user.role);

    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'UPLOAD_DOCUMENT',
      target: `Document: ${document.name}`,
      type: 'upload'
    });

    res.status(201).json({ success: true, message: 'Document uploaded successfully', data: document });
  } catch (error) {
    next(error);
  }
};

const downloadDocument = async (req, res, next) => {
  try {
    const document = await documentsService.getDocumentById(req.params.id);

    if (document.url && document.url.startsWith('/uploads/')) {
      const filename = path.basename(document.url);
      const filePath = path.join(__dirname, '../../../uploads', filename);
      if (fs.existsSync(filePath)) {
        return res.download(filePath, document.name);
      }
    }

    if (document.url && (document.url.startsWith('http://') || document.url.startsWith('https://'))) {
      return res.redirect(document.url);
    }

    return res.status(404).json({ success: false, message: 'Document file not found on server' });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    await documentsService.deleteDocument(req.params.id, req.user.id, req.user.role);
    
    await auditService.logAction({
      user_id: req.user.id,
      user_name: req.user.name,
      user_role: req.user.role,
      action: 'DELETE_DOCUMENT',
      target: `Document ID: ${req.params.id}`,
      type: 'upload'
    });

    res.status(200).json({ success: true, message: 'Document deleted successfully', data: null });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
      return res.status(403).json({ success: false, message: error.message, data: null });
    }
    next(error);
  }
};

module.exports = {
  getDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument
};
