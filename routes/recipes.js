var express = require("express");
var router = express.Router();
const Recipe = require("../models/recipes");
const checkBody = require("../modules/checkBody");
const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

/**
 * add a recipe to database
 * @name POST/api/recipes/
 * @param {string}name name of the recipe
 * @param {string}creator name of the creator
 * @param {string}imageURL image link
 * @param {string[]}instructions array of instructions
 * @param {string[]}ingredients array of ingredients _id
 * @param {string}dishType dish type ( entrée, plat, dessert, ...)
 * @param {number}preparationTime amount of time to prepare the dish
 * @param {string}difficulty (easy, hars, medium)
 * @param {string[]}regime list of allergens ("Fruits a coque, poisson, ...")
 * @param {string[]}tags list of tags ("A la une, Pour les fêtes, ...")
 * @returns {object} recipe update status, returns modified and populated recipes array
 */
router.post("/", async (req, res, next) => {
  const {
    name,
    creator,
    imageURL,
    instructions,
    ingredients,
    dishType,
    preparationTime,
    difficulty,
    regime,
    tags,
  } = req.body;

  const recipe = new Recipe({
    name: name,
    creator: creator,
    imageURL: imageURL,
    instructions: instructions,
    ingredients: ingredients.map((e) => ({ id: e.id, amount: e.amount })),
    dishType: dishType,
    preparationTime: preparationTime,
    difficulty: difficulty,
    regime: regime,
    tags: tags,
  });

  const response = await recipe.save();
  const populatedRes = await Recipe.findById(response._id).populate(
    "ingredients.id"
  );

  res.json({ result: true, response: populatedRes });
});

/**
 * get all recipes
 * @name GET/api/recipes
 * @returns {object} query status, returns populated recipes array
 */
router.get("/", async (req, res) => {
  const response = await Recipe.find()
    .populate("ingredients.id")
    .sort({ _id: -1 });
  res.json({ res: response });
});

/**
 * search recipes by myltiple parameters
 * @name GET/api/recipes/search
 * @param {string} req.query.input reference to use for searching by name in database
 * @param {string} req.query.time max amount of time for searcing by preparation time in db, if "135" no time limit
 * @param {string} req.query.type type to search for ("entree, plat, ...")
 * @param {string} req.query.difficulty difficulty level ("easy, hard, ..")
 * @param {string} req.query.tag tag to search for ("A la une, pour les fetes, ..")
 * @param {string} req.query.regime ","-separated list of redimes to exclude in the query ("vegan, lactose, porc, ..")
 * @param {string} req.query.exclAliments "," separated list of aliment _id to exclude int the query
 * @returns {object} query status, reutrns populated recipes array
 */
router.get("/search", async (req, res) => {
  const {
    input = "",
    time = "",
    type = "",
    difficulty = "",
    tag = "",
    regime = "",
    exclAliments = "",
  } = req.query;

  const query = {};

  if (input) {
    query.name = { $regex: new RegExp(input, "i") };
  }
  if (time || !time === "135") {
    query.preparationTime = { $lt: parseInt(time, 10) + 1 };
  }
  if (type) {
    query.dishType = type;
  }
  if (difficulty) {
    query.difficulty = difficulty;
  }
  if (tag) {
    query.tags = { $in: [tag] };
  }
  if (regime) {
    const parsedRegime = regime.split(",");
    query.regime = { $nin: parsedRegime };
  }
  if (exclAliments) {
    const parsedExclAliments = exclAliments.split(",");
    query["ingredients.id"] = { $nin: parsedExclAliments };
  }

  const recipes = await Recipe.find(query)
    .populate("ingredients.id")
    .sort({ _id: -1 });

  res.json({ result: true, response: recipes });
});

/**
 * Populates a list of ingredients ids
 *
 * @name GET/api/recipes/populateIds
 * @param req.query.idsList - "," separated list of ingredient ids
 * @returns {object} - query status, returns populated list of recipes
 */
router.get("/populateIds", async (req, res) => {
  const { idsList } = req.query;
  
  if(!idsList){
    res.json({result: false, error: "idsList not provided"})
  }
  const data = idsList.split(",");

  const queryResult = await Recipe.find({ _id: { $in: data } })
    .populate("ingredients.id")
    .sort({ _id: -1 });

  res.json({ result: true, response: queryResult });
});

/**
 * Uploads picture to cloudinary and returns the url
 * 
 * @name POST/api/recipes/pictures
 * @param {file??} req.files.data picture file to upload
 * @returns {object} query status, saved picuture url
 */
router.post("/pictures", async (req, res) => {
  try {
    const resultCloudinary = await cloudinary.uploader
      .upload_stream(async (error, result) => {
        if (error) {
          console.error("Error uploading to Cloudinary:", error);
          res
            .status(500)
            .json({ result: false, error: "Internal Server Error" });
        } else {
          res.json({ result: true, url: result.secure_url });
        }
      })
      .end(req.files.picture.data);
  } catch (error) {
    console.error("Error processing picture:", error);
    res.status(500).json({ result: false, error: "Internal Server Error" });
  }
});

module.exports = router;
