const prisma = require('../../config/prisma');

const getDocuments = async (studentId) => {
  return await prisma.document.findMany({
    where: { student_id: studentId },
    orderBy: { uploaded_at: 'desc' }
  });
};

const uploadDocument = async (studentId, data) => {
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

const deleteDocument = async (documentId, studentId) => {
  const document = await prisma.document.findUnique({ where: { document_id: documentId } });
  if (!document || document.student_id !== studentId) {
    throw new Error('Document not found or unauthorized');
  }
  return await prisma.document.delete({
    where: { document_id: documentId }
  });
};

module.exports = {
  getDocuments,
  uploadDocument,
  deleteDocument
};
