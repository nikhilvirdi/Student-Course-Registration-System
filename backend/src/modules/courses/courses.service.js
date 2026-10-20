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
  const { prerequisite_course_ids, ...courseData } = data;
  const course = await prisma.course.create({
    data: {
      course_name:    courseData.course_name,
      description:    courseData.description,
      credits:        parseInt(courseData.credits),
      max_seats:      parseInt(courseData.max_seats),
      available_seats: parseInt(courseData.max_seats),
      faculty_id:     courseData.faculty_id,
      department_id:  courseData.department_id,
      course_code:    courseData.course_code    || null,
      schedule_days:  courseData.schedule_days  || null,
      schedule_time:  courseData.schedule_time  || null,
      room:           courseData.room           || null,
      semester_label: courseData.semester_label || null,
    }
  });

  if (Array.isArray(prerequisite_course_ids) && prerequisite_course_ids.length > 0) {
    await prisma.prerequisite.createMany({
      data: prerequisite_course_ids.map(prereqId => ({
        course_id: course.course_id,
        prerequisite_course_id: prereqId
      }))
    });
  }

  return await getCourseById(course.course_id);
};

const updateCourse = async (id, data) => {
  const {
    course_name, description, credits, max_seats,
    faculty_id, department_id,
    course_code, schedule_days, schedule_time, room, semester_label,
    prerequisite_course_ids
  } = data;

  await prisma.course.update({
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

  if (prerequisite_course_ids !== undefined && Array.isArray(prerequisite_course_ids)) {
    // Delete old prerequisites
    await prisma.prerequisite.deleteMany({
      where: { course_id: id }
    });
    // Add new prerequisites
    if (prerequisite_course_ids.length > 0) {
      await prisma.prerequisite.createMany({
        data: prerequisite_course_ids.map(prereqId => ({
          course_id: id,
          prerequisite_course_id: prereqId
        }))
      });
    }
  }

  return await getCourseById(id);
};

const deleteCourse = async (id) => {
  return await prisma.$transaction(async (tx) => {
    // Check if there are active enrollments
    const enrollmentsCount = await tx.enrollment.count({
      where: { course_id: id }
    });
    if (enrollmentsCount > 0) {
      throw new Error(`Cannot delete course: ${enrollmentsCount} student(s) are currently enrolled in it.`);
    }

    // Delete prerequisites where this course is referenced or child
    await tx.prerequisite.deleteMany({
      where: {
        OR: [
          { course_id: id },
          { prerequisite_course_id: id }
        ]
      }
    });

    return await tx.course.delete({
      where: { course_id: id }
    });
  });
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};
