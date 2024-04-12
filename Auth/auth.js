import jwt from 'jsonwebtoken';
import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import pool from "../database.js";
import Errorhandler from '../utils/Errorhandler.js';
import catchAsync from '../utils/catchAsync.js';


export const auth = catchAsync(async (req, res, next) => {
    const token = req.header('x-auth-token') || req.query.xAuthToken;
    if (!token) {
      return res.status(400).send('Invalid Token');
    }
    try {
      const decoded = jwt.verify(token, process.env.SECRETKEY);
      console.log("decoded", decoded);
      // If you need to perform further actions with the decoded token, you can do it here
      req.user = decoded.id; // Assuming your decoded token contains a user object
      return next();
    } catch (error) {
      console.log(error);
      return next(new Errorhandler('Invalid Token', 400));
    }
  });
  
export async function checkRole(req , res , next) {
    const role = req.header('role');
    try {
        if(role == 'superAdmin'){
            const queryText = 'SELECT * FROM users WHERE role = $1';
            const { rows } = await pool.query(queryText, [role]);
            console.log(rows[0]);
            return next();
        } else {
            return res.status(401).send("You Don't have access to this Resource");
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
}
