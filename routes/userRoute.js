import express from 'express';
import { getAllUsers, createUser, getUserById, updateUser, deleteUser, sendEmail } from '../conrollers/userController.js';

const routes = express.Router();

routes.route('/list').get(getAllUsers);
routes.route('/createUser').post(createUser)
//get One User
routes.route('/').get(getUserById)
//update user
routes.route('/').put(updateUser)
//delete User
routes.route('/').delete(deleteUser)

//sendMail
routes.route('/sendmail').post(sendEmail)


export default routes