const facultyService = require('./faculty.service');

const getAllFaculty = async (req, res) => {
  try {
    const faculty = await facultyService.getAllFaculty();
    res.status(200).json({
      success: true,
      message: 'Faculty retrieved successfully',
      data: faculty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty',
      error: error.message
    });
  }
};

module.exports = {
  getAllFaculty
};
