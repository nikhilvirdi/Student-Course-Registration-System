const documentsService = require('./documents.service');
const auditService = require('../admin/audit.service');

const getDocuments = async (req, res, next) => {
  try {
    const documents = await documentsService.getDocuments(req.user.id);
    res.status(200).json({ success: true, message: 'Documents retrieved', data: documents });
  } catch (error) {
    next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    const document = await documentsService.uploadDocument(req.user.id, req.body);
    
    // Log action
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

const deleteDocument = async (req, res, next) => {
  try {
    await documentsService.deleteDocument(req.params.id, req.user.id);
    
    // Log action
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
    if (error.message === 'Document not found or unauthorized') {
      return res.status(403).json({ success: false, message: error.message, data: null });
    }
    next(error);
  }
};

module.exports = {
  getDocuments,
  uploadDocument,
  deleteDocument
};
