import { validationResult } from "express-validator";
import deleteFile from "../util/file.js";
import webSocket from '../socket.js';


import Post from "../models/post.js";
import User from "../models/user.js";
// const { validationResult } = require("express-validator");
// const fileHelper = require("../util/file");
// const io = require("../socket.js");

// const Post = require("../models/post.js");
// const User = require("../models/user.js");

export const getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({createdAt: -1})
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      posts: posts,
      totalItems: postsTest,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image?");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path.replace("\\", "/");
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });

  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    const savedUser = await user.save();
    webSocket.getIO().emit("posts", {
      action: "create",
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
    });

    res.status(201).json({
      message: "Post created!",
      post: post,
      creator: { _id: user._id, name: user.name },
    });

    return savedUser;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
    return error;
  }
};

export const getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      post: post,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;
    throw error;
  }

  const postId = req.params.postId;
  const updateTitle = req.body.title;
  const updateContent = req.body.content;
  let updateImageUrl = req.body.image;
  if (req.file) {
    updateImageUrl = req.file.path.replace("\\", "/");
  }

  if (!updateImageUrl) {
    const error = new Error("No file picked.");
    error.statusCode = 404;
    throw error;
  }

  try {
    const post = await Post.findById(postId).populate('creator');
    if (!post) {
      const error = new Error("Could not find post.");  
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("No authorized.");
      error.statusCode = 403;
      throw error;
    }
    if (updateImageUrl !== post.imageUrl) {
      deleteFile(post.imageUrl);
    }

    post.title = updateTitle;
    post.content = updateContent;
    post.imageUrl = updateImageUrl;

    const result = await post.save();

    webSocket.getIO().emit('posts', {
      action: 'update',
      post: result
    })

    res.status(200).json({
      message: "Post Updated!",
      post: result,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error("No authorized.");
      error.statusCode = 403;
      throw error;
    }
    deleteFile(post.imageUrl);
    await Post.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    webSocket.getIO().emit('posts', {
      action: 'delete',
      post: postId
    });
    res.status(200).json({
      message: "Delete Post.",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const getStatus = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: user.status,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  const userId = req.userId;
  const updateStatus = req.body.status;

  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 404;
      throw error;
    }
    user.status = updateStatus;
    await user.save();

    res.status(200).json({ message: "Status Updated" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
