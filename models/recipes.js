const mongoose = require('mongoose')

const recipeSchema = mongoose.Schema({ 
        "name": String,
        "creator": String,
        "imageURL": String,
        "instructions": [String],
        "ingredients": [{id: String, "amount": Number}],
        "dishType": String,
        "preparationTime": Number,
        "difficulty": String,
        "regime": [String],
        "tags": [String],
});
const Recipe = mongoose.model('recipes', recipeSchema);

module.exports = Recipe