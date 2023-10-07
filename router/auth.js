import { Router } from 'express';
import { body } from 'express-validator';
import { signup, login} from '../controllers/auth.js'

import User from "../models/user.js";

const router = Router();

router.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, {req})=>{
            return User.findOne({email: value}).then((userDoc)=>{
                if (userDoc) {
                    return Promise.reject('User already exists');
                }
            })
        })
        .normalizeEmail(),
    body('password').trim().isLength({min: 5}),
    body('name').trim().not().isEmpty()
], signup);

router.post('/login', login);

export default router;