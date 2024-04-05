

import catchAsync from '../utils/catchAsync.js';
//import AppError from './../utils/appError.js';
import responseMessageService from '../services/responseMessageService.js';
import { config as dotenvConfig } from 'dotenv';
import fetch from 'node-fetch'; // Import fetch directly
import pool from '../database.js'


dotenvConfig();

const getAllUsers = catchAsync(async (req, res, next) => {
    try {
        pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).send('Error while Fetching user');
            }
            res.status(200).json(results.rows)
        })
    } catch (err) {
        console.log(err);
        next(err);
    }
});

const createUser = (req, res, next) => {
    const { name, email, password } = req.body;
    pool.query(
        `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id`,
        [name, email, password],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error creating user');
            }
            res.status(201).send(`User added with ID: ${results.rows[0].id}`);
        }
    );
};

const getUserById = (req, res) => {
    const id = req.query.id;
    pool.query(`SELECT * FROM users WHERE id = $1`, [id], (error, results) => {
        if (error) {
            console.error(error)
            return res.status(500).send('Error While Getting User Data')
        }
        res.status(200).send(results.rows)
    })
}

const updateUser = (req, res) => {
    const id = req.query.id
    const { name, email } = req.body
    pool.query(
        "UPDATE users SET name = $1 , email = $2 WHERE id = $3",
        [name, email, id],
        (error, results) => {
            if (error) {
                console.error(error)
                return res.status(500).send('Error While Updating User Data')
            }
            console.log(results.rows)
            res.status(200).send(`User modified with ID: ${id}`)
        }
    )
}

const deleteUser = (req, res) => {
    const id = req.query.id
    pool.query(`DELETE FROM users WHERE id = ${id}`, (error, results) => {
        if (error) {
            console.error(error)
            return res.status(500).send('Error While Deleting User Data')
        }
        res.status(200).send(`User deleted with ID: ${id}`);
    });
}

const sendEmail = async (req, res) => {
    try {
        
const resends = new Resend('re_3PqxSRNz_4jBsRfz5QaTBQ3Ad21kVqHUq');
        const { data, error } = await resends.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: ['pooja Gadara'],
            subject: 'Hello World',
            html: '<strong>It works!</strong>',
          });
        
          if (error) {
            console.log("Error",error)
            return console.error({ error });
          }
        
          console.log({ data });
          res.status(200).send(data)
    } catch (error) {
        console.log("Error",error)
    }
}

export {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    sendEmail
}