const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");
const io = require("../socket.js");

const Post = require('../models/post');
const User = require("../models/user");
const feedController = require("../controllers/feed.js");

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

    sinon.stub(io, 'getIO')
    io.getIO.returns({
      emit: function() {}
    });

    feedController.createPost(req, res, () => {})
        .then((savedUser) => {
            expect(savedUser).to.have.property('posts');
            expect(savedUser.posts).to.have.length(1);
            io.getIO.restore();
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
    feedController.getStatus(req, res, () => {})
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
