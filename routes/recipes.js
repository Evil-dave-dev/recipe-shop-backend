var express = require('express');
var router = express.Router();
const Recipe = require('../models/recipes')
const checkBody = require('../modules/checkBody');

router.post('/', async (req, res, next)=> {
    const {name, creator, imageURL, instructions, ingredients, dishType, preparationTime, difficulty, regime, tags} = req.body

    const validation = checkBody(req)
    if(!validation.result) res.json(validation)

    const recipe = new Recipe({
        "name": name,
        "creator": creator,
        "imageURL": imageURL,
        "instructions": instructions,
        "ingredients": [{id: "pomme", "amount": 2}, {id: "poire", "amount": 2}], //[{id: ObjectId('ingredients'), "amount": Number}
        "dishType": dishType,
        "preparationTime": preparationTime,
        "difficulty": difficulty,
        "regime": regime,
        "tags": tags,
    })
    const response = await recipe.save()
    res.json({result: true, response})
});

/*router.post("/", async (req, res) => {
   
});*/

module.exports = router;
