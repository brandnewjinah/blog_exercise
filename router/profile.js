const express = require("express");
const router = express.Router();
const passport = require("passport");
const checkAuth = passport.authenticate("jwt", { session: false });
const profileModel = require("../models/profile");

const {
  profile_post,
  profile_get,
  profile_delete,
} = require("../controller/profile");
const { reset } = require("nodemon");
const { json } = require("body-parser");

// creating profile
// @route POST http://localhost:5000/profile
// @desc Register user profile
// @access Private

router.post("/", checkAuth, profile_post);

// @route GET http://localhost:5000/profile
// @desc Get current user profile
// @access Private

router.get("/", checkAuth, profile_get);

// @route DELETE http://localhost:5000/profile
// @desc delete current user profile
// @access Private

router.delete("/", checkAuth, profile_delete);

// @route POST http://localhost:5000/profile/education
// @desc Add education to profile
// @access Private

router.post("/education", checkAuth, (req, res) => {
  profileModel
    .findOne({ user: req.user.id })
    .then((profile) => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      profile.education.unshift(newEdu);

      profile
        .save()
        .then((profile) => res.json(profile))
        .catch((err) => res.status(400).json(err));
    })
    .catch((err) => res.status(404).json(err));
});

// @route DELETE http://localhost:5000/profile/education/:edu_id
// @desc Delete education to profile
// @access Private

router.delete("/education/:edu_id", checkAuth, (req, res) => {
  profileModel
    .findOne({ user: req.user.id })
    .then((profile) => {
      //get item to delete
      const removeIndex = profile.education
        .map((item) => item.id)
        .indexOf(req.params.edu_id);

      //splice out of array
      profile.education.splice(removeIndex, 1);

      //save
      profile
        .save()
        .then((profile) => res.json(profile))
        .catch((err) => reset.status(408).json(err));
    })
    .catch((err) => res.status(404).json(err));
});

// @route POST http://localhost:5000/profile/experience
// @desc Add experience to profile
// @access Private

router.post("/experience", checkAuth, (req, res) => {
  profileModel
    .findOne({ user: req.user.id })
    .then((profile) => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      profile.experience.unshift(newExp);

      profile
        .save()
        .then((profile) => res.json(profile))
        .catch((err) => res.status(400).json(err));
    })
    .catch((err) => res.status(400).json(err));
});

// @route DELETE http://localhost:5000/profile/experience/:exp_id
// @desc Delete experience to profile
// @access Private

router.delete("/experience/:exp_id", checkAuth, (req, res) => {
  profileModel
    .findOne({ user: req.user.id })
    .then((profile) => {
      //get item to delete
      const removeIndex = profile.experience
        .map((item) => item.id)
        .indexOf(req.params.exp_id);
      //splice out of array
      profile.experience.splice(removeIndex, 1);
      //save
      profile
        .save()
        .then((profile) => res.json(profile))
        .catch((err) => res.status(408).json(err));
    })
    .catch((err) => res.status(404).json(err));
});

module.exports = router;
