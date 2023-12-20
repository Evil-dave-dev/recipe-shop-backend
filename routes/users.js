var express = require("express");
var router = express.Router();
const User = require("../models/users");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const { checkBody } = require("../modules/checkBody");

//------------USER ACCOUNT CRUD OPERATIONS-----------//

/** 
 * handles signup, validates user information, initializes user document, saves user to db, returns user information
 * @name POST/api/users/signup'
 * @param {string} req.body.name
 * @param {string} req.body.email
 * @param {string} req.body.password
 * @returns {object} registration status, returns initialzed user information and token
 */
router.post("/signup", function (req, res) {
  const { name, email, password } = req.body;

  //check for empty fields
  if (!checkBody(req.body, ["name", "email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  //check if valid email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(email);
  if (!isValidEmail) {
    res.json({ result: false, error: "email is not valid" });
    return;
  }

  //encrypt password
  const hash = bcrypt.hashSync(password, 10);

  //check if user already exists in database
  User.findOne({
    $or: [{ name: name.toLowerCase() }, { email: email.toLowerCase() }],
  }).then((data) => {
    //save new user to db if all validation steps passed
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
      // return false if user already exists
      res.json({ result: false, error: "User already exists" });
    }
  });
});

/** 
 * handles signin, checks credentials, returns token & user-relevant populated information
 * @name POST/api/users/signin
 * @param {string} req.body.name username sent by user
 * @param {string} req.body.password password sent by user
 * @returns {object} returns populated and satinized user information (no password or _id)
 */
router.post("/signin", async (req, res) => {
  const { name, password } = req.body;

  //if missing or empty fields return error
  if (!checkBody(req.body, ["name", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
  }

  const user = await User.findOne({ name: name.toLowerCase() });

  //if user doesn't exist in database return error
  if (!user) {
    res.json({ result: false, error: "User don't exists" });
  }
  //if password doen't match return error
  if (!bcrypt.compareSync(password, user.password)) {
    res.json({ result: false, error: "wrong password" });
  }
  //if correct credentials return populated user
  const populatedUser = await User.populate(user, [
    {
      path: "currentRecipes.id",
      populate: {
        path: "ingredients.id",
        model: "ingredients",
      },
    },
    {
      path: "historyRecipes.id",
      populate: {
        path: "ingredients.id",
        model: "ingredients",
      },
    },
  ]);
  //delete sensible information from the response
  const sanitizedUser = populatedUser.toObject();
  delete sanitizedUser.password;
  delete sanitizedUser._id;
  delete sanitizedUser.__v;

  res.json({ result: true, response: sanitizedUser });
});

/** 
 * uptades user preference information
 * @name PUT/api/users/preference' 
 * @param {string} req.body.token user identifier
 * @param {string[]} req.body.regime allergens information
 * @param {string[]} req.body.excludeAliments aliments _id
 * @param {boolean} req.body.planningDisplay wheter or not do display recipes in a planning format
 * @param {string} req.body.favStore store _id
 * @param {number} req.body.postCode user postcode
 * @returns {object} status of the update operation, return object containing updated user preferences
 */
router.put("/preference", async (req, res, next) => {
  const {
    regime,
    excludeAliments,
    planningDisplay = null,
    favStore,
    postCode,
    token,
  } = req.body;

  //initialize empty object tu use as reference for db update query
  const update = {};

  //update reference object according to user's new desired preferences
  if (regime) {
    update["preference.regime"] = regime;
  }
  if (excludeAliments) {
    update["preference.excludeAliments"] = excludeAliments;
  }
  if (favStore) {
    update["preference.excludeAliments.favStore"] = favStore;
  }
  if (postCode) {
    update["preference.postCode"] = postCode;
  }
  if (planningDisplay !== null) {
    update["preference.planningDisplay"] = planningDisplay;
  }

  //update user preferences
  const user = await User.findOneAndUpdate(
    { token: token },
    { $set: update },
    { new: true }
  );

  //send back update status and updated preferences to user
  if (user) {
    res.json({ result: true, response: user.preference });
  } else {
    res.json({ result: false, error: "Couldn't modify preferences." });
  }
});

//------------USER PLANNED RECIPES CRUD OPERATIONS-----------//

/** 
 * Add 1 new recipe to the currentRecipe field in user collection
 * @name POST/api/users/currentRecipes
 * @param {string} req.body.recipeId _id of the recipe
 * @param {date} req.body.date date at which to save the recipe
 * @param {number} req.body.amount for how many people the recipe is for
 * @param {string} req.body.token user token
 * @returns {object} recipe adding status, returns modified and populated currentRecipes array
 */
router.post("/currentRecipes", async (req, res, next) => {
  const { recipeId, date = new Date(), amount = 1, token } = req.body;

  if (!recipeId) {
    res.json({ result: false, response: "Invalid recipe id" });
  }

  const user = await User.findOneAndUpdate(
    { token: token },
    { $push: { currentRecipes: { id: recipeId, date: date, nb: amount } } },
    { new: true }
  ).populate({
    path: "currentRecipes.id",
    populate: {
      path: "ingredients.id",
      model: "ingredients",
    },
  });

  if (user) {
    res.json({ result: true, response: user.currentRecipes });
  } else {
    res.json({ result: false, error: "Couldn't add recipe" });
  }
});

/**
 * Remove 1 recipe from the currentRecipe field in user collection
 * @name DELETE/api/users/currentRecipes
 * @param {string} req.body.recipeId _id of the recipe object(id, nb, date, _id) saved in currentRecipes array
 * @param {string} req.body.token user token
 * @returns {object} recipe removal status, returns modified and populated currentRecipes array
 */
router.delete("/currentRecipes", async (req, res, next) => {
  const { recipeId, token } = req.body;

  if (!recipeId) {
    res.json({ result: false, response: "Invalid recipe id" });
  }

  const user = await User.findOneAndUpdate(
    { token: token },
    { $pull: { currentRecipes: { _id: recipeId } } },
    { new: true }
  ).populate({
    path: "currentRecipes.id",
    populate: {
      path: "ingredients.id",
      model: "ingredients",
    },
  });

  if (user !== null) {
    res.json({ result: true, response: user.currentRecipes });
  } else {
    res.json({ result: false, error: "Couldn't delete recipe" });
  }
});

/** 
 * modify recipe amount and/or date in the currentRecipe field in user collection
 * @name PUT/api/users/currentRecipes
 * @param {string} req.body.recipeId _id of the recipe
 * @param {date} req.body.date date at which to modify the recipe
 * @param {number} req.body.amount for how many people the recipe is for
 * @param {string} req.body.token
 * @returns {object} recipe modification status, returns modified and populated currentRecipes array
 */
router.put("/currentRecipes", async (req, res, next) => {
  const { recipeId, date, amount, token } = req.body;

  const query = {};

  if (date) {
    query["currentRecipes.$.date"] = date;
  }

  if (amount) {
    query["currentRecipes.$.nb"] = amount;
  }

  const user = await User.findOneAndUpdate(
    {
      token: token,
      "currentRecipes._id": recipeId,
    },
    { $set: query },
    { new: true }
  ).populate({
    path: "currentRecipes.id",
    populate: {
      path: "ingredients.id",
      model: "ingredients",
    },
  });

  if (user) {
    res.json({ result: true, response: user.currentRecipes });
  } else {
    res.json({ result: false, error: "Couldn't modify recipe" });
  }
});


//------------NOT FINISHED STUFF-----------//

// POST add recipe
/**
 * @toDelete forcer à ajouter une recette id sinon tout crash
 */
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

/* POST like recipe */

/**
 * adds or removes a recipe _id from the likedRecipes field of a user document
 * @name POST/api/users/like
 * @param {string} req.body.token user identifier
 * @param {object} req.body.recipe _id: _id of the recipe to use as reference
 * @returns {object} result of the query, indiction message 
 */
router.post("/like", function (req, res, next) {
  User.updateOne(
    { token: "eaHhFVrDdt2wDaomqxgCoXys2M2hSqUd" },
    { $addToSet: { favoriteRecipes: req.body.recipe } }
  ).then((data) => {
    if (data.modifiedCount > 0) {
      res.json({ result: true, message: "Recipe liked" });
    } else {
      User.updateOne(
        { token: "eaHhFVrDdt2wDaomqxgCoXys2M2hSqUd" },
        { $pull: { favoriteRecipes: req.body.recipe } }
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
/**@toDelete to be removed later on since already fetching on signin, turn it to a put route to modify and add recipes to planning */
router.get("/recipes", async (req, res, next) => {
  const user = await User.findOne({
    token: "eaHhFVrDdt2wDaomqxgCoXys2M2hSqUd",
  })
    .populate({
      path: "currentRecipes.id",
      populate: {
        path: "ingredients.id",
        model: "ingredients",
      },
    })
    .populate({
      path: "historyRecipes.id",
      populate: {
        path: "ingredients.id",
        model: "ingredients",
      },
    });
  // .populate({
  //   path: "favoriteRecipes.id",
  //   populate: {
  //     path: "ingredients.id",
  //     model: "ingredients",
  //   },
  // });

  res.json({ result: true, response: { currentRecipes: user.currentRecipes } });
});

module.exports = router;
