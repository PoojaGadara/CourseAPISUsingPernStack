import catchAsync from "../utils/catchAsync.js";
import Errorhandler from "../utils/Errorhandler.js";
import { config as dotenvConfig } from "dotenv";
import fetch from "node-fetch"; // Import fetch directly
import pool from "../database.js";
import jwtToken from "../Auth/jwtToken.js";
import bcrypt from "bcrypt";
import cloudinary from 'cloudinary';
import nodemailer from 'nodemailer'
dotenvConfig();

const getAllUsers = catchAsync(async (req, res, next) => {
  try {
    pool.query("SELECT * FROM users ORDER BY user_id ASC", (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).send("Error while Fetching user");
      }
      res.status(200).json(results.rows);
    });
  } catch (err) {
    console.log(err);
    const error = responseMessageService.inValidToken()
    console.log(error)
    next(err);
  }
});

const createUser = catchAsync(async (req, res, next) => {
  const { name, email, pass, role } = req.body;
  const saltRounds = 10;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  console.log(req.file)
  // Check if req.file exists
  if (!req.file) {
    return res.status(400).send("Profile image is required");
  }
  
  try {
    // Validate email
    if (!emailRegex.test(email)) {
      return res.status(400).send("Invalid email format");
    }

    const user = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (user.rows.length > 0) {
      return next(new Errorhandler('User already exists', 404));
    }

    // Validate password strength
    if (!passwordRegex.test(pass)) {
      return res
        .status(400)
        .send(
          "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number"
        );
    }

    // Hash the password
    const password = bcrypt.hashSync(pass, saltRounds);

    // Upload profile image to Cloudinary
    const cloudinaryUploadResult = await cloudinary.uploader.upload(req.file.path);
    const profileImageUrl = cloudinaryUploadResult.secure_url;

    // Insert user into the database
    const queryText = `INSERT INTO users (name, email, password, role, profile_image_url)
    VALUES ($1, $2, $3, COALESCE($4, 'user'), $5)
    RETURNING user_id`;

    const { rows } = await pool.query(queryText, [name, email, password, role, profileImageUrl]);

    // Return JWT token
    jwtToken(rows[0].user_id, 201, res);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Error creating user");
  }
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and Password not found");
  }

  const queryText = "SELECT * FROM users WHERE email = $1";
  const { rows } = await pool.query(queryText, [email]);

  if (rows.length === 0) {
    return res.status(404).send("User Not Found");
  }

  const hashedPassword = rows[0].password;

  console.log("Entered password:", password);
  console.log("Hashed password from database:", hashedPassword);

  const isMatch = await bcrypt.compare(password, hashedPassword);

  console.log("Password match:", isMatch);

  if (!isMatch) {
    return res.status(401).send("Password Not Matched");
  }

  // Assuming you have a function called `sendToken` that sends a JWT token
  jwtToken(rows[0], 200, res);
});

const getUserById = (req, res) => {
  const id = req.query.id;

  pool.query(`SELECT * FROM users WHERE user_id = $1`, [user_id], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error While Getting User Data");
    }
    res.status(200).send(results.rows);
  });
};

const updateUser = catchAsync(async (req, res) => {
  const id = req.query.id;
  const { name, email } = req.body;
  const saltRounds = 10;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check if req.file exists
  let profileImageUrl;
  if (req.file) {
    // Validate email
    if (!emailRegex.test(email)) {
      return res.status(400).send("Invalid email format");
    }
    
    try {
      // Upload profile image to Cloudinary
      const cloudinaryUploadResult = await cloudinary.uploader.upload(req.file.path);
      profileImageUrl = cloudinaryUploadResult.secure_url;
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      return res.status(500).send("Error uploading image to Cloudinary");
    }
  }

  try {
    // Update user data in the database
    let updateQuery;
    let queryParams;
    if (profileImageUrl) {
      updateQuery = "UPDATE users SET name = $1, email = $2, profile_image_url = $3 WHERE user_id = $4";
      queryParams = [name, email, profileImageUrl, id];
    } else {
      updateQuery = "UPDATE users SET name = $1, email = $2 WHERE user_id = $3";
      queryParams = [name, email, id];
    }

    pool.query(updateQuery, queryParams, (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Error While Updating User Data");
      }
      console.log(results.rows);
      res.status(200).send(`User modified with ID: ${id}`);
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Error updating user");
  }
});

const deleteUser = (req, res) => {
  const id = req.query.id;
  pool.query(`DELETE FROM users WHERE user_id = ${user_id}`, (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error While Deleting User Data");
    }
    res.status(200).send(`User deleted with ID: ${user_id}`);
  });
};

const sendEmail = async (req, res) => {
  try {
    const resends = new Resend("re_3PqxSRNz_4jBsRfz5QaTBQ3Ad21kVqHUq");
    const { data, error } = await resends.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["pooja Gadara"],
      subject: "Hello World",
      html: "<strong>It works!</strong>",
    });

    if (error) {
      console.log("Error", error);
      return console.error({ error });
    }
    console.log({ data });
    res.status(200).send(data);
  } catch (error) {
    console.log("Error", error);
  }
};const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'your_resend_username',
    pass: 'your_resend_password'
  }
});

// Generate a random token
const generateToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Save the token and its expiration time in the database
const saveResetToken = async (email, token) => {
  const expirationTime = Date.now() + 3600000; // Token expires in 1 hour
  try {
    await pool.query('INSERT INTO password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)', [email, token, new Date(expirationTime)]);
  } catch (error) {
    console.error('Error saving reset token to database:', error);
    throw new Errorhandler('Error saving reset token to database', 500); // Throw an error if database query fails
  }
};

// Send the password reset email using Resend
const sendResetEmail = async (email, token) => {
  const mailOptions = {
    from: 'your_email@example.com',
    to: email,
    subject: 'Password Reset',
    text: `Click the following link to reset your password: http://localhost:3000/reset-password?token=${token}`
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Errorhandler('Error sending password reset email', 500); // Throw an error if sending email fails
  }
};

const resetPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  try {
    // Generate a unique token
    const token = generateToken();

    // Save the token and its expiration time in the database
    await saveResetToken(email, token);

    // Send the password reset email using Resend
    await sendResetEmail(email, token);

    res.status(200).send('Password reset email sent');
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(error.status || 500).send(error.message || 'Internal Server Error'); // Send appropriate error response
  }
});


export {
  getAllUsers,
  createUser,
  login,
  getUserById,
  updateUser,
  deleteUser,
  sendEmail,
  resetPassword
};
