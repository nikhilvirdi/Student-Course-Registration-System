const prisma = require('../../config/prisma');


const getAllFaculty = async () => {
  return await prisma.faculty.findMany({
    orderBy: { faculty_name: 'asc' }
  });
};

module.exports = {
  getAllFaculty
};
