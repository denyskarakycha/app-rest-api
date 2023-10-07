import { Router } from 'express';
import { body } from 'express-validator';
// const { body } = require('express-validator');

import {
    getPosts,
    createPost,
    getPost,
    updatePost,
    deletePost,
    getStatus,
    updateStatus
} from '../controllers/feed.js'
// const feedController = require('../controllers/feed.js');

import isAuth from '../middleware/is-auth.js'
// const isAuth = require('../middleware/is-auth.js');

const router = Router();
// GET /feed/posts
router.get('/posts', isAuth, getPosts);

// POST /feed/post
router.post('/post', isAuth, [
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min: 5})
], createPost);

router.get('/post/:postId', getPost);

// PUT
router.put('/post/:postId', isAuth, [
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min: 5})
], updatePost);

// DELETE
router.delete('/post/:postId', isAuth, deletePost)

router.get('/status', isAuth, getStatus);

router.put('/status', isAuth, updateStatus);

export default router;