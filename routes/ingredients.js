var express = require('express');
var router = express.Router();
const Ingredient = require('../models/ingredients')

router.post('/', async (req, res, next) => {
    const { name, unit, imageURL, category, allergens } = req.body
    const ingredient = new Ingredient({
        "name": name,
        "unit": unit,
        "imageURL": imageURL,
        "category": category,
        "allergens": allergens,
    })
    const response = await ingredient.save()
    res.json({ result: true, response })
});

router.get("/", async (req, res) => {
    const response = await Ingredient.find()
    res.json({ res: response })
});

router.get("/search", async (req, res) => {
    const response = await Ingredient.find({ name: { $regex: new RegExp(req.params.name, 'i') } })
    res.json({ res: response })
});
module.exports = router;
