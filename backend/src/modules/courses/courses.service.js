const prisma = require('../../config/prisma');

const getAllCourses = async (filters = {}) => {
  const { search, department_id } = filters;
  
  return await prisma.course.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { course_name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        department_id ? { department_id } : {}
      ]
    },
    include: {
      department: true,
      faculty: true,
      prerequisites: {
        include: {
          prerequisite_course: true
        }
      }
    }
  });
};

const getCourseById = async (id) => {
  const course = await prisma.course.findUnique({
    where: { course_id: id },
    include: {
      department: true,
      faculty: true,
      prerequisites: {
        include: {
          prerequisite_course: true
        }
      }
    }
  });
  
  if (!course) throw new Error('Course not found');
  return course;
};

module.exports = {
  getAllCourses,
  getCourseById
};
