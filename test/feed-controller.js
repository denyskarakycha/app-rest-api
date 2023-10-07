import { expect } from "chai";
import sinon from 'sinon';
import mongoose from 'mongoose';
import webSocket from '../socket.js';

import User from "../models/user.js";
import { createPost, getStatus} from '../controllers/feed.js'

const MONGODB_URI =
  "mongodb+srv://denys:295q6722822@cluster0.fk2cpgo.mongodb.net/test?retryWrites=true&w=majority";

describe("Feed controller", function () {
  before(function (done) {
    mongoose
      .connect(MONGODB_URI)
      .then((result) => {
        const user = new User({
          email: "test@test.com",
          password: "tester",
          name: "Test",
          status: "I am new",
          posts: [],
          _id: "5c0f66b979af55031b34728a",
        });
        return user.save();
      })
      .then(() => {
        done();
      });
  });

  it('should add a created post to the posts of creator', function(done) {

    const req = {
        body: {
            title: 'Test Post',
            content: 'Some test'
        },
        file: {
            path: 'abc'
        },
        userId: "5c0f66b979af55031b34728a"
    }
    const res = {
        status: function() {return this}, 
        json: function() {}
    };

    sinon.stub(webSocket, 'getIO')
    webSocket.getIO.returns({
      emit: function() {}
    });

    createPost(req, res, () => {})
        .then((savedUser) => {
            expect(savedUser).to.have.property('posts');
            expect(savedUser.posts).to.have.length(1);
            webSocket.getIO.restore();
            done();
        })
  })

  it("should send a response with a valid user status for an existing user", function (done) {
    const req = { userId: "5c0f66b979af55031b34728a" };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (obj) {
        this.userStatus = obj.status;
      },
    };
    getStatus(req, res, () => {})
      .then(() => {       
        expect(res.statusCode).to.be.equal(200);
        expect(res.userStatus).to.be.equal("I am new");
        done();
      });
  });

  after(function(done) {
    User.deleteMany({})
     .then(()=> {
        return mongoose.disconnect();
     })
     .then(() => {
        done();
     })
  })
});
