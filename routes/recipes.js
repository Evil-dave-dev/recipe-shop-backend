var express = require("express");
var router = express.Router();
const Recipe = require("../models/recipes");
const checkBody = require("../modules/checkBody");
const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

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

  //const validation = checkBody(req)
  //if(!validation.result) res.json(validation)

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

router.get("/", async (req, res) => {
  const response = await Recipe.find()
    .populate("ingredients.id")
    .sort({ _id: -1 });
  res.json({ res: response });
});

router.get("/find/tag=:tag", async (req, res) => {
  const response = await Recipe.find({ tags: { $in: [req.params.tag] } })
    .populate("ingredients.id")
    .sort({ _id: -1 });
  res.json({ res: response });
});

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
    query.preparationTime = { $lt: parseInt(time + 1, 10) };
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
