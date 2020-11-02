const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

// @route POST http://localhost:5000/user/signup
// @desc Register user
// @access Public

router.post("/signup", (req, res) => {
  const { email, password, name } = req.body;

  userModel
    .findOne({ email })
    .then((user) => {
      if (user) {
        return res.status(400).json({
          message: "Email taken",
        });
      } else {
        const newUser = new userModel({
          name,
          email,
          password,
        });

        newUser
          .save()
          .then((user) => {
            res.status(200).json({
              message: "user created",
              userInfo: user,
            });
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

// @route POST http://localhost:5000/user/login
// @desc Login user / return jwt
// @access Public

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  userModel
    .findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          messsage: "Not a registered user",
        });
      } else {
        user.comparePassword(password, (err, isMatch) => {
          console.log(isMatch);
          if (err || !isMatch) {
            return res.status(400).json({
              errors: "Password Incorrect",
            });
          } else {
            const token = jwt.sign(
              { userID: user._id, email: user.email, name: user.name },
              process.env.SECRET_KEY,
              { expiresIn: "1d" }
            );
            res.status(200).json({
              message: "user logged in",
              token,
            });
          }
        });
        // bcrypt.compare(password, user.password, (err, result) => {
        //   if (err || result === false) {
        //     return res.status(400).json({
        //       message: "Password incorrect",
        //     });
        //   } else {
        //     const token = jwt.sign(
        //       { userID: user._id, email: user.email },
        //       "secret",
        //       { expiresIn: "1d" }
        //     );
        //     res.status(200).json({
        //       message: "User logged in",
        //       token,
        //     });
        //   }
        // });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
