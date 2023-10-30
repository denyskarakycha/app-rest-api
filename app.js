import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import swaggerUI from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

import feedRoutes from './router/feed.js';
import authRoutes from './router/auth.js';

import { get404 } from './controllers/error.js'

import webSocket from './socket.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGODB_URI =
  "mongodb+srv://denys:295q6722822@cluster0.fk2cpgo.mongodb.net/messages?retryWrites=true&w=majority";

const option = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Library API",
            version: "1.0.0",
            description: "Messages API"
        },
        servers: [
            {
                url: "http://localhost:8080"
            }
        ],
    },
    apis: ["./documentation/*.js"]
   // apis: ["./router/*.js", "./controllers/*.js", "./models/*js"]
}

const specs = swaggerJSDoc(option);

const app = express();

 app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

const fileStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, uuidv4())
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);     
    } else {
        cb(null, false);
    }
}

// app.use(bodyParser.urlencoded()) // for x-www-form <form> format
app.use(bodyParser.json()); // application/json
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));


app.use((req, res, next)=> {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes); 
app.use('/auth', authRoutes); 

app.use(get404);

app.use((error, req, res, next) => {
    console.log(1);
    const status = error.statusCode || 404;
    const message = error.message || "Not found!";
    const data = error.data || "Invalid router";
    res.status(status).json({message: message, data: data});
});

mongoose.connect(MONGODB_URI)
    .then(result => {
      const server = app.listen(8080);
      const io = webSocket.init(server);
      io.on('connection', socket => {
        console.log('connect');
      });
    })
    .catch((err) => {
        console.log(err);
      });