const mongoose = require('mongoose')

const recipeSchema = mongoose.Schema({
        "name": String,
        "creator": ObjectId('user'),
        "imageURL": String,
        "instructions": [String],
        "ingredients": [{id: ObjectId('ingredients'), "amount": Number}],
        "dishType": String,
        "preparationTime": Number,
        "difficulty": String,
        "regime": [String],
        "tags": [String],
});
const Recipe = mongoose.model('recipes', recipeSchema);

module.exports = Recipe