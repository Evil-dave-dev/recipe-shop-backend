var express = require("express");
var router = express.Router();
const User = require("../models/users");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const { checkBody } = require("../modules/checkBody");

// POST signup
router.post("/signup", function (req, res) {
  const { name, email, password } = req.body;

  if (!checkBody(req.body, ["name", "email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(email);
  if (!isValidEmail) {
    res.json({ result: false, error: "email is not valid" });
    return;
  }

  const token = uid2(32);
  const hash = bcrypt.hashSync(password, 10);

  User.findOne({
    $or: [{ name: name.toLowerCase() }, { email: email.toLowerCase() }],
  }).then((data) => {
    if (data === null) {
      const newUser = new User({
        name: name.toLowerCase(),
        email: email,
        password: hash,
        token: uid2(32),
        preference: {
          regime: [],
          excludeAliments: [],
          queryBasis: "",
          planningDisplay: false,
          favStore: null,
          postCode: null,
        },
        favoriteRecipes: [],
        myRecipes: [],
        currentRecipes: [],
        historyRecipes: [],
      });

      newUser.save().then(() => {
        res.json({ result: true, newUser: newUser });
      });
    } else {
      res.json({ result: false, error: "User already exists" });
    }
  });
});

// POST signin
router.post("/signin", function (req, res) {
  const { name, password } = req.body;

  if (!checkBody(req.body, ["name", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  const hash = bcrypt.hashSync(req.body.password, 10);

  User.findOne({ name: name.toLowerCase() }).then((data) => {
    if (data) {
      if (bcrypt.compareSync(password, data.password)) {
        res.json({ result: true });
      } else {
        res.json({ result: false, error: "wrong password" });
      }
    } else {
      res.json({ result: false, error: "User don't exists" });
    }
  });
});

// POST add recipe
router.post("/add", function (req, res, next) {
  User.updateOne(
    { token: "eaHhFVrDdt2wDaomqxgCoXys2M2hSqUd" },
    { $push: { currentRecipes: req.body } }
  ).then((data) => {
    if (data.modifiedCount > 0) {
      res.json({ result: true, message: "Recipe added successfully." });
    } else {
      res.json({ result: false, message: "Recipe not added." });
    }
  });
});

// POST like recipe
router.post("/like", function (req, res, next) {
  User.updateOne(
    { token: "eaHhFVrDdt2wDaomqxgCoXys2M2hSqUd" },
    { $addToSet: { favoriteRecipes: req.body } }
  ).then((data) => {
    if (data.modifiedCount > 0) {
      res.json({ result: true, message: "Recipe liked" });
    } else {
      User.updateOne(
        { token: "eaHhFVrDdt2wDaomqxgCoXys2M2hSqUd" },
        { $pull: { favoriteRecipes: req.body } }
      ).then((data) => {
        if (data.modifiedCount > 0) {
          res.json({ result: false, message: "Recipe unliked" });
        } else {
          res.json({ result: false, message: "Recipe not liked or unliked" });
        }
      });
    }
  });
});

// GET list ingredients
router.get("/recipes", async (req, res, next) => {
  const user = await User.findOne({
    token: "eaHhFVrDdt2wDaomqxgCoXys2M2hSqUd",
  }).populate({
    path: "currentRecipes.id",
    populate: {
      path: "ingredients.id",
      model: "ingredients",
    },
  });

  res.json({ result: true, response: { currentRecipes: user.currentRecipes } });
});

module.exports = router;
