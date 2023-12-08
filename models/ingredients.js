const mongoose = require('mongoose')

const ingredientSchema = mongoose.Schema({
        "name": String, 
        "unit": String,
        "imageURL": String,
        "category": String,
        "allergens": [String],
});
const Ingredient = mongoose.model('ingredients', ingredientSchema);

module.exports = Ingredient