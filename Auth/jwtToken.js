import jwt from 'jsonwebtoken';
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

const jwtToken = (id, statuscode, res) => {
  const token = jwt.sign({ id }, process.env.SECRETKEY, {
    expiresIn: process.env.JWT_EXPIER
  });
  
  const options = {
    expires: new Date('9999-12-31T23:59:59Z'),
    httpOnly: true
  };
  
  res.cookie('token', token , options); // Set the cookie
  res.status(statuscode).json({          // Send the response
    success: true,
    token
  });
};

export default jwtToken;
