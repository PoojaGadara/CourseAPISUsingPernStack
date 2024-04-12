import express from 'express';
import { getAllCourses, createCourse, getCourseById, updateCourse, deleteCourse , enrollCourse , getEnrolledCourses } from '../conrollers/courseController.js';
import {auth , checkRole } from '../Auth/auth.js'

const routes = express.Router();

//Get All Users 
routes.route('/list').get(auth , getAllCourses);
//Create Course
routes.route('/createCourse').post(auth , checkRole ,createCourse)
//get One Course
routes.route('/').get(auth , checkRole ,  getCourseById)
//update Course
routes.route('/').put(auth , checkRole ,updateCourse)
//delete Course
routes.route('/').delete(auth , checkRole , deleteCourse)

// enrolle course 
routes.route('/enrollCourse').post(auth , enrollCourse)

//get enrolled course
routes.route('/getEnrolledCourse').get(auth , getEnrolledCourses)

export default routes