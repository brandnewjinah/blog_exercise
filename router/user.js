const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const normalize = require("normalize-url");
const bcrypt = require("bcryptjs");
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
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            return res.status(408).json({
              error: err,
            });
          } else {
            const avatar = normalize(
              gravatar.url(email, {
                s: "200",
                r: "pg",
                d: "mm",
              }),
              { forceHttps: true }
            );
            // const avatar = gravatar.url(email, {
            //   s: "200", //size
            //   r: "pg", //rating
            //   d: "mm", //default
            // });

            const user = new userModel({
              email,
              name,
              avatar,
              password: hash,
            });

            user
              .save()
              .then((user) => {
                res.status(200).json({
                  message: "User created",
                  userInfo: user,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  error: err,
                });
              });
          }
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

router.post("/login", (req, res) => {});

module.exports = router;
