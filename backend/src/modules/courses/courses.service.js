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
      course_name:    data.course_name,
      description:    data.description,
      credits:        parseInt(data.credits),
      max_seats:      parseInt(data.max_seats),
      available_seats: parseInt(data.max_seats),
      faculty_id:     data.faculty_id,
      department_id:  data.department_id,
      course_code:    data.course_code    || null,
      schedule_days:  data.schedule_days  || null,
      schedule_time:  data.schedule_time  || null,
      room:           data.room           || null,
      semester_label: data.semester_label || null,
    }
  });
};

const updateCourse = async (id, data) => {
  const {
    course_name, description, credits, max_seats,
    faculty_id, department_id,
    course_code, schedule_days, schedule_time, room, semester_label
  } = data;

  return await prisma.course.update({
    where: { course_id: id },
    data: {
      ...(course_name    !== undefined && { course_name }),
      ...(description    !== undefined && { description }),
      ...(credits        !== undefined && { credits: parseInt(credits) }),
      ...(max_seats      !== undefined && { max_seats: parseInt(max_seats) }),
      ...(faculty_id     !== undefined && { faculty_id }),
      ...(department_id  !== undefined && { department_id }),
      ...(course_code    !== undefined && { course_code }),
      ...(schedule_days  !== undefined && { schedule_days }),
      ...(schedule_time  !== undefined && { schedule_time }),
      ...(room           !== undefined && { room }),
      ...(semester_label !== undefined && { semester_label }),
    }
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
