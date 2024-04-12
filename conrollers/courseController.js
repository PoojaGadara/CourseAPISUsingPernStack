import catchAsync from "../utils/catchAsync.js";
import pool from "../database.js";

const getAllCourses = catchAsync(async (req, res, next) => {
  const user_id = req.query.keyword;
  const { category, level, popularity, page = 1, limit = 10 } = req.query; // Default page = 1, limit = 10

  try {
    let enrolledCoursesQuery = `
      SELECT courses.course_id, courses.name, courses.category, courses.level, courses.popularity
      FROM courses
      INNER JOIN enrollments ON courses.course_id = enrollments.course_id
      WHERE enrollments.user_id = $1`;
    const enrolledCoursesValues = [user_id];

    // Add filters if provided in the request
    if (category) {
      enrolledCoursesQuery += ` AND courses.category = $${enrolledCoursesValues.length + 1}`;
      enrolledCoursesValues.push(category);
    }
    if (level) {
      enrolledCoursesQuery += ` AND courses.level = $${enrolledCoursesValues.length + 1}`;
      enrolledCoursesValues.push(level);
    }
    if (popularity) {
      enrolledCoursesQuery += ` AND courses.popularity = $${enrolledCoursesValues.length + 1}`;
      enrolledCoursesValues.push(popularity);
    }

    // Add pagination parameters
    enrolledCoursesQuery += ` LIMIT $${enrolledCoursesValues.length + 1} OFFSET $${enrolledCoursesValues.length + 2}`;
    enrolledCoursesValues.push(limit);
    enrolledCoursesValues.push((page - 1) * limit);

    const { rows } = await pool.query(enrolledCoursesQuery, enrolledCoursesValues);
    console.log(rows)
    res.status(200).json({ success: true, courses: rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

const createCourse = catchAsync(async (req, res, next) => {
  const { name, category, level, popularity } = req.body;
  pool.query(
    'INSERT INTO courses (name, category, level, popularity) VALUES ($1, $2, $3, $4) RETURNING course_id',
    [name, category, level, popularity],
    (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send('Error in Creating Course');
      } else {
        return res.status(200).json({ id: results.rows[0].course_id });
      }
    }
  );
});

const getCourseById = (req, res) => {
  const id = req.query.id;
  pool.query(`SELECT * FROM courses WHERE id = $1`, [id], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error While Getting Course Data");
    }
    res.status(200).send(results.rows);
  });
}

const updateCourse = (req, res) => {
  const id = req.query.id;
  const { category , level , popularity } = req.body;
  pool.query(
    "UPDATE courses SET category = $1, level = $2, popularity = $3 WHERE id = $4",
    [category, level, popularity, id],
    (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Error While Updating Course Data");
      }
      console.log(results.rows);
      res.status(200).send(`Course modified with ID: ${id}`);
    }
  );
};

const deleteCourse = (req, res) => {
  const id = req.query.id;
  pool.query(`DELETE FROM courses WHERE id = $1`, [id], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error While Deleting Course Data");
    }
    res.status(200).send(`Course deleted with ID: ${id}`);
  });
};

const enrollCourse = catchAsync(async (req, res, next) => {
  const { user_id, course_id } = req.body;

  // Check if the user is already enrolled in the course
  const enrollmentCheckQuery = 'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2';
  const enrollmentCheckValues = [user_id, course_id];

  try {
    const enrollmentCheckResult = await pool.query(enrollmentCheckQuery, enrollmentCheckValues);
    if (enrollmentCheckResult.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User is already enrolled in this course' });
    }

    // If not already enrolled, proceed with enrollment
    const enrollmentQuery = 'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING id';
    const enrollmentValues = [user_id, course_id]; // Corrected variable names
    await pool.query(enrollmentQuery, enrollmentValues); // Pass enrollmentValues here

    res.status(200).json({ success: true, message: 'Course enrolled successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


const getEnrolledCourses = catchAsync(async (req, res, next) => {
  const user_id = req.query.userId;

  try {
    const enrolledCoursesQuery = `
      SELECT courses.course_id, courses.name, courses.category, courses.level, courses.popularity
      FROM courses
      INNER JOIN enrollments ON courses.course_id = enrollments.course_id
      WHERE enrollments.user_id = $1`;
    const enrolledCoursesValues = [user_id];

    const { rows } = await pool.query(enrolledCoursesQuery, enrolledCoursesValues);
    console.log(rows)
    res.status(200).json({ success: true, courses: rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});



export {
  getAllCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getEnrolledCourses
};
