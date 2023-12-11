const mongoose = require("mongoose");

const preference = mongoose.Schema({
  regime: [String],
  excludeAliments: { type: mongoose.Schema.Types.ObjectId, ref: "ingredients" },
  queryBasis: String,
  planningDisplay: Boolean,
  favStore: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  postCode: Number,
});

const usersSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  token: String,
  preference: [preference],
  favoriteRecipes: { type: mongoose.Schema.Types.ObjectId, ref: "recipes" },
  myRecipes: { type: mongoose.Schema.Types.ObjectId, ref: "recipes" },
});

const User = mongoose.model("users", usersSchema);

module.exports = User;
