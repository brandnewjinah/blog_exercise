const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const checkAuth = passport.authenticate("jwt", { session: false });
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.MAIL_KEY);
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
        const payload = { name, email, password };
        const token = jwt.sign(payload, process.env.EMAIL_CONFIRMATION_KEY, {
          expiresIn: "15m",
        });

        const emailData = {
          from: process.env.MAIL_FROM,
          to: email,
          subject: "Account activation link",
          html: `
            <h1>Please use the following to activate your account</h1>
            <p>http://localhost:3000/users/activate/${token}</p>
            <hr />
            <p>This email may containe sensetive information</p>
            <p>http://localhost:3000</p>
          `,
        };

        sgMail
          .send(emailData)
          .then(() => {
            return res.status(200).json({
              message: `Email has been sent to ${email}`,
            });
          })
          .catch((err) => {
            res.status(400).json({
              error: err.message,
            });
          });

        // const newUser = new userModel({
        //   name,
        //   email,
        //   password,
        // });

        // newUser
        //   .save()
        //   .then((user) => {
        //     res.status(200).json({
        //       message: "user created",
        //       userInfo: user,
        //     });
        //   })
        //   .catch((err) => {
        //     res.status(500).json({
        //       error: err,
        //     });
        //   });
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
              { id: user._id, email: user.email, name: user.name },
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

//로그인 후 토큰으로 사용자 정보 가져오기
// @route GET http://localhost:5000/user/current
// @desc Return current user
// @access Private

router.get("/current", checkAuth, (req, res) => {
  // res.json({
  //   id: req.user.id,
  //   name: req.user.name,
  //   email: req.user.email,
  // });

  userModel
    .findById(req.user.id)
    .then((user) => {
      if (user) {
        return res.status(200).json(user);
      } else {
        res.status(400).json({
          message: "user not found",
        });
      }
    })
    .catch((err) => console.log(err));
});

module.exports = router;
