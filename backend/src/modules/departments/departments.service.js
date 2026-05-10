const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllDepartments = async () => {
  return await prisma.department.findMany({
    orderBy: {
      department_name: 'asc'
    }
  });
};
