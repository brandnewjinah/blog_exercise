const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const checkAuth = passport.authenticate("jwt", { session: false });
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.MAIL_KEY);
const _ = require("lodash");
const userModel = require("../models/user");

// @route POST http://localhost:5000/user/signup
// @desc Register user / Send email
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

// @route POST http://localhost:5000/user/activation
// #desc Activation account / confirm email
// @access Private

router.post("/activation", (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(token, process.env.EMAIL_CONFIRMATION_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          errors: "Expired link. Signup again",
        });
      } else {
        const { name, email, password } = jwt.decode(token);

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
    });
  }
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

// @route PUT http://localhost:5000/user/forgotpw
// @desc Forgot password/send email
// @access Public

router.put("/forgotpw", (req, res) => {
  //get user email
  const { email } = req.body;

  userModel
    .findOne({ email }) //look for email first
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          message: "Email not found",
        });
      } else {
        //create token
        const token = jwt.sign(
          { _id: user._id },
          process.env.PASSWORD_CONFIRMATION,
          { expiresIn: "20m" }
        );

        //email reset link
        const emailData = {
          from: process.env.MAIL_FROM,
          to: email,
          subject: "Password Reset Link",
          html: `
            <h1>Please use the following link to reset your password</h1>
            <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>${process.env.CLIENT_URL}</p>
          `,
        };

        //email has been sent
        return user
          .updateOne({ resetPasswordLink: token })
          .then((user) => {
            sgMail
              .send(emailData)
              .then(() => {
                return res.status(200).json({
                  message: `Email has been sent to ${email}. Follow the instruction to activate your account`,
                });
              })
              .catch((err) => {
                return res.status(404).json({
                  message: err.message,
                });
              });
          })
          .catch((err) => {
            return res.status(404).json({
              message: err.message,
            });
          });
      }
    })
    .catch((err) => {
      return res.status(400).json({
        message: "Error",
      });
    });
});

// @route PUT http://localhost:5000/user/changepw
// @desc Change password
// @access Private

router.put("/changepw", (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      process.env.PASSWORD_CONFIRMATION,
      (err, decoded) => {
        if (err) {
          return res.status(400).json({
            error: "Expired link. Try again",
          });
        } else {
          userModel
            .findOne({ resetPasswordLink })
            .then((user) => {
              const updateFields = {
                password: newPassword,
                resetPasswordLink: "",
              };

              user = _.extend(user, updateFields);

              user
                .save()
                .then(() => {
                  res.status(200).json({
                    message: "Password successfully changed",
                  });
                })
                .catch((err) => {
                  return res.status(400).json({
                    error: "Error resetting password",
                  });
                });
            })
            .catch((err) => {
              return res.status(400).json({
                error: "Something went wrong",
              });
            });
        }
      }
    );
  }
});

module.exports = router;
