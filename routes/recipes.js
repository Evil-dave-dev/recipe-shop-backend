var express = require('express');
var router = express.Router();
const Recipe = require('../models/recipes');
const checkBody = require('../modules/checkBody');

router.post('/', async (req, res, next)=> {
    const {name, creator, imageURL, instructions, ingredients, dishType, preparationTime, difficulty, regime, tags} = req.body

    //const validation = checkBody(req)
    //if(!validation.result) res.json(validation)

    const recipe = new Recipe({
        "name": name,
        "creator": creator,
        "imageURL": imageURL,
        "instructions": instructions,
        "ingredients": ingredients.map(e => ({id: e.id, amount: e.amount })),
        "dishType": dishType,
        "preparationTime": preparationTime,
        "difficulty": difficulty,
        "regime": regime,
        "tags": tags,
    })
    const response = await recipe.save()
    const populatedRes = await Recipe.findById(response._id).populate('ingredients.id')
    res.json({result: true, response: populatedRes})
});

router.get("/", async (req, res) => {
   const response =  await Recipe.find().populate('ingredients.id').sort({ _id: -1 }) 
   res.json({res: response})
});

module.exports = router;
