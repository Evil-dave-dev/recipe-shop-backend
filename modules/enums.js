const EnumsIngredients = {
    ailse: ["Fruits & Légumes", "Boulangerie & Pâtisseries", "Produits laitiers", "Viandes & Poissons", "Epices", "Epicerie Salée", "Epicerie Sucrée" , "Pâtes, Riz & Céréales", "Autre" ],
    allergens: ["Fruits à Coques", "Arachides", "Gluten", "Fruits de Mer", "Oeuf", "Poisson", "Soja", "Lait", "Viande", "Porc", ],
    unit: ["g", "L", "pcs"],
}
const EnumsRecipes = {
    regime: ["Fruits à Coques", "Arachides", "Gluten", "Fruits de Mer", "Oeuf", "Poisson", "Soja", "Lait", "Viande", "Porc",],
    dishType: ["Entrée", "Plat", "Dessert", "Apéro", "Autre"],
    difficulty: ["Easy", "Medium","Hard"],
    tags: ["A la une", "Pas cher", "Peu de vaisselle", "Pour les fetes", "A cuisiner en famille", "Pour les enfant"],
}

module.exports = { EnumsRecipes, EnumsIngredients}