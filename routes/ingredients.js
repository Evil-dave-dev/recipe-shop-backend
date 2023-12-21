var express = require('express');
var router = express.Router();
const Ingredient = require('../models/ingredients')


/**
 * Adds a new ingredient to database,  doesn't allow for duplicates
 * 
 * @name POST/api/ingredients
 * @param {string} req.body.name name of the recipe
 * @param {string} req.body.unit unit in which to calculate the recipe(pcs || L || g) 
 * @param {string} req.body.imageURL cloudinary link to the image (one day eventually maybe)
 * @param {string} req.body.category cateogy of the ingredient (~aisle (fruits et legumes, viande, poisson, ...))
 * @param {string[]} req.body.allergens allergens associated with the ingredient (porc, fruits a coque, poisson, fruits de mer, ...)
 * @returns {object} query status, whole saved ingredietn object 
 */
router.post('/', async (req, res, next) => {
    const { name, unit, imageURL, category, allergens } = req.body
    const existingIngredient = await Ingredient.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } })
    if (existingIngredient) {
        res.json({ result: false, response: "Ingredient already in db" })
    }
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

/**
 * search ingredient by name or part of name
 * 
 * @name GET/api/ingredients/search/...
 * @param {string} req.param.name string by which to base the search query in the ingredients db
 * @returns {object} res: query results
*/
router.get("/search/:name", async (req, res) => {
    const response = await Ingredient.find({ name: { $regex: new RegExp(req.params.name, 'i') } })
    res.json({ res: response })
});


//get all ingredients, to delete eventually
router.get("/", async (req, res) => {
    const response = await Ingredient.find()
    res.json({ res: response })
});
module.exports = router;
