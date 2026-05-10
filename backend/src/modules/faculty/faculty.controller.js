const facultyService = require('./faculty.service');

const getAllFaculty = async (req, res) => {
  try {
    const faculty = await facultyService.getAllFaculty();
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching faculty', error: error.message });
  }
};

module.exports = {
  getAllFaculty
};
