const prisma = require('../../config/prisma');


exports.getAllDepartments = async () => {
  return await prisma.department.findMany({
    orderBy: {
      department_name: 'asc'
    }
  });
};
