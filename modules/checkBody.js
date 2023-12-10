const EnumsRecipes = require('./enums')

const checkBody = (data)=>{
    const {name, creator, imageURL, instructions, ingredients, dishType, preparationTime, difficulty, regime, tags} = data
    if(name.length > 1 ) return{result: false, error: "'name' must be a non-null string"}
    if(!instructions) return{result: false, error: "'instructions' must be present and non-null"}
    if(!ingredients) return{result: false, error: "'ingredients' must be an Array of Objects"}
    if(!EnumsRecipes.dishType.some(dishType)) return{result: false, error: `invalid 'dishType', please use:${EnumsRecipes.dishType.join(". ")}`}
    if(!preparationTime) return{result: false, error: "'preparationTime' must be a number"}
    if(!EnumsRecipes.difficulty.some(difficulty)) return{result: false, error: `invalid 'difficulty', please use: ${EnumsRecipes.difficulty.join(". ")}`}
    if(!EnumsRecipes.difficulty.some(tags)) return{result: false, error: `invalidd 'tags', please use: ${EnumsRecipes.tags.join(". ")}`}
    if(!EnumsRecipes.difficulty.some(regime)) return{result: false, error: `invalidd 'tags', please use: ${EnumsRecipes.regime.join(". ")}`}
    return{result: true, message: "all fields are valid, if error refer to Schema validation"}
} 

module.exports = checkBody