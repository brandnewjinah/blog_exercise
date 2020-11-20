const express = require("express");
const router = express.Router();
const passport = require("passport");
const checkAuth = passport.authenticate("jwt", { session: false });
const postModel = require("../models/post");

// @route POST http://localhost:5000/post
// @desc Create post
// @access Private

router.post("/", checkAuth, (req, res) => {
  const newPost = new postModel({
    text: req.body.text,
    //if you want real name, use req.user.name
    name: req.user.name,
    avatar: req.user.avatar,
    user: req.user.id,
  });
  newPost
    .save()
    .then((post) => res.json(post))
    .catch((err) => res.status(404).json(err));
});

module.exports = router;
