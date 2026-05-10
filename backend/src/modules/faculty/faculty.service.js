const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllFaculty = async () => {
  return await prisma.faculty.findMany({
    orderBy: { faculty_name: 'asc' }
  });
};

module.exports = {
  getAllFaculty
};
