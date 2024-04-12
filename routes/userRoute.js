import express from 'express';
import { getAllUsers, createUser, getUserById, updateUser, deleteUser, sendEmail , login } from '../conrollers/userController.js';
import {auth , checkRole } from '../Auth/auth.js'
import multer from 'multer';
const upload = multer({ dest: 'uploads/' }); // Specify the destination directory for uploaded files

const routes = express.Router();

//Get All Users 
routes.route('/list').get(auth , getAllUsers);
//Create User
routes.route('/createUser').post(upload.single('profileImage') ,createUser)
//Login User
routes.route('/login').post(login)
//get One User
routes.route('/').get(getUserById)
//update user
routes.route('/').put(updateUser)
//delete User
routes.route('/').delete(deleteUser)
//sendMail
routes.route('/sendmail').post(sendEmail)



export default routes