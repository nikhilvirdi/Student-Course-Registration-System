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

const createCourse = async (data) => {
  return await prisma.course.create({
    data: {
      course_name: data.course_name,
      description: data.description,
      credits: data.credits,
      max_seats: data.max_seats,
      available_seats: data.max_seats, // default available to max
      faculty_id: data.faculty_id,
      department_id: data.department_id,
    }
  });
};

const updateCourse = async (id, data) => {
  return await prisma.course.update({
    where: { course_id: id },
    data
  });
};

const deleteCourse = async (id) => {
  return await prisma.course.delete({
    where: { course_id: id }
  });
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};
