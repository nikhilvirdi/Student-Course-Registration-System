const fs = require('fs');
const path = require('path');
const prisma = require('../../config/prisma');

const getDocuments = async (userId, userRole = 'STUDENT') => {
  if (userRole === 'ADMIN') {
    return await prisma.document.findMany({
      include: {
        student: { select: { student_id: true, name: true, email: true } }
      },
      orderBy: { uploaded_at: 'desc' }
    });
  }
  return await prisma.document.findMany({
    where: { student_id: userId },
    orderBy: { uploaded_at: 'desc' }
  });
};

const getDocumentById = async (documentId) => {
  const document = await prisma.document.findUnique({
    where: { document_id: documentId },
    include: {
      student: { select: { student_id: true, name: true, email: true } }
    }
  });
  if (!document) throw new Error('Document not found');
  return document;
};

const uploadDocument = async (userId, data, userRole = 'STUDENT') => {
  const studentId = userRole === 'ADMIN' ? (data.student_id || '00000000-0000-4000-a000-000000000001') : userId;
  return await prisma.document.create({
    data: {
      name: data.name,
      type: data.type || 'Other',
      size: data.size || '0 KB',
      url: data.url || '',
      student_id: studentId
    }
  });
};

const deleteDocument = async (documentId, userId, userRole = 'STUDENT') => {
  const document = await prisma.document.findUnique({ where: { document_id: documentId } });
  if (!document) {
    throw new Error('Document not found');
  }
  if (userRole !== 'ADMIN' && document.student_id !== userId) {
    throw new Error('Unauthorized');
  }

  // Remove physical file from disk if it starts with /uploads/
  if (document.url && document.url.startsWith('/uploads/')) {
    const filename = path.basename(document.url);
    const filePath = path.join(__dirname, '../../../uploads', filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error removing physical document:', err);
      }
    }
  }

  return await prisma.document.delete({
    where: { document_id: documentId }
  });
};

module.exports = {
  getDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument
};
