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

// @route GET http://localhost:5000/post
// @desc View all posts
// @access Public

router.get("/", (req, res) => {
  postModel
    .find()
    .sort({ date: -1 })
    .then((posts) => res.json(posts))
    .catch((err) => res.status(404).json({ nopostfound: "No Post Found" }));
});

// @route GET http://localhost:5000/post/:id
// @desc View each post
// @access Public

router.get("/:id", (req, res) => {
  postModel
    .findById(req.params.id)
    .then((post) => res.json(post))
    .catch((err) =>
      res.status(404).json({
        nopostfound: "No Post found with this ID",
      })
    );
});

// @route DELETE http://localhost:5000/post/:id
// @desc Delete each post
// @access Private

router.delete("/:id", checkAuth, (req, res) => {
  postModel
    .findById(req.params.id)
    .then((post) => {
      //check for post owner
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ noauthorized: "User not authorized" });
      }
      post.remove().then(() => res.json({ success: true }));
    })
    .catch((err) =>
      res.status(404).json({
        postnotfound: "No Post found",
      })
    );
});

// @route POST http://localhost:5000/post/like/:post_id
// @desc Like post
// @access Private
router.post("/like/:post_id", checkAuth, (req, res) => {
  postModel
    .findById(req.params.post_id)
    .then((post) => {
      if (
        post.likes.filter((like) => like.user.toString() === req.user.id)
          .length > 0
      ) {
        return res
          .status(400)
          .json({ alreadyliked: "user already liked this post" });
      }
      post.likes.unshift({ user: req.user.id });
      post.save().then((post) => res.json(post));
    })
    .catch((err) =>
      res.status(404).json({
        postnotfound: "No post found",
      })
    );
});

// @route POST http://localhost:5000/post/unlike/:post_id
// @desc Unlike post
// @access Private
router.delete("/unlike/:post_id", checkAuth, (req, res) => {
  postModel
    .findById(req.params.post_id)
    .then((post) => {
      if (
        post.likes.filter((like) => like.user.toString() === req.user.id)
          .length === 0
      ) {
        return res.status(400).json({
          notliked: "You have not liked this post",
        });
      }
      // get remove Index
      const removeIndex = post.likes
        .map((item) => item.user.toString())
        .indexOf(req.user.id);

      //splice out of array
      post.likes.splice(removeIndex, 1);

      //save
      post.save().then((post) => res.json(post));
    })
    .catch((err) =>
      res.status(404).json({
        postnotfound: "No post found",
      })
    );
});

//comment add
// @route POST http://localhost:5000/post/comment/:post_id
// @desc Add comment to the post
// @access Private
router.post("/comment/:post_id", checkAuth, (req, res) => {
  const newComment = {
    user: req.user.id,
    text: req.body.text,
    name: req.user.name,
    avatar: req.user.avatar,
  };

  postModel
    .findById(req.params.post_id)
    .then((post) => {
      post.comments.unshift(newComment);
      post.save().then((post) => res.json(post));
    })
    .catch((err) => res.status(404).json({ postnotfound: "No post found" }));
});

//comment delete
// @route DELETE http://localhost:5000/post/comment/:post_id
// @desc Delete comment to the post
// @access Private
// router.delete("/comment/:post_id/:commnet_id", checkAuth, (req, res) => {
//   postModel
//     .findById(req.params.post_id)
//     .then((post) => {
//       if (
//         post.comments.filter(
//           (comment) => comment._id.toString() === req.params.comment_id
//         ).length === 0
//       ) {
//         return res
//           .status(404)
//           .json({ commentnotexist: "Comment does not exist" });
//       }
//       const removeIndex = post.comments
//         .map((item = item._id.toString()))
//         .indexOf(req.params.comment_id);

//       //splice comment out of array
//       post.comments.splice(removeIndex, 1);
//       post.save().then((post) => res.json(post));
//     })
//     .catch((err) =>
//       res.status(404).json({
//         postnotfound: "No post found",
//       })
//     );

//   postModel.findById(req.params.post_id).then((post) => {
//     if (
//       post.comments.filter(
//         (comment) => comment._id.toString() === req.params.comment_id
//       ).length === 0
//     ) {
//       return res
//         .status(404)
//         .json({ commentnotexists: "Comment does not exist" });
//     }
//     // get remove index
//     const removeIndex = post.comments
//       .map((item) => item._id.toString())
//       .indexOf(req.params.comment_id);
//     // splice comment out of array
//     post.comments.splice(removeIndex, 1);
//     post.save().then((post) => res.json(post));
//   });
// });

// @route DELETE http://localhost:5000/post/comment/:post_id/:comment_id
// @desc Remove comment from post
// @access Private
router.delete("/comment/:post_id/:comment_id", checkAuth, (req, res) => {
  postModel.findById(req.params.post_id).then((post) => {
    if (
      post.comments.filter(
        (comment) => comment._id.toString() === req.params.comment_id
      ).length === 0
    ) {
      return res.status(400).json({
        message: "Comment does not exist",
      });
    } else {
      const removeIndex = post.comments
        .map((item) => item._id.toString())
        .indexOf(req.params.comment_id);

      post.comments.splice(removeIndex, 1);
      post.save().then((post) => res.status(200).json(post));
    }
  });
});

module.exports = router;
