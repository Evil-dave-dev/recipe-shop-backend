const mongoose = require("mongoose");

const preferenceSchema = mongoose.Schema({
  regime: [String],
  excludeAliments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "ingredients" },
  ],
  queryBasis: String,
  planningDisplay: Boolean,
  favStore: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  postCode: Number,
});

const recipesSchema = mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: "recipes" },
  date: Date,
  nb: Number,
});

const usersSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  token: String,
  preference: preferenceSchema,
  favoriteRecipes: [
    { id: { type: mongoose.Schema.Types.ObjectId, ref: "recipes" } },
  ],
  myRecipes: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: "recipes" } }],
  currentRecipes: [recipesSchema],
  historyRecipes: [recipesSchema],
});

const User = mongoose.model("users", usersSchema);

module.exports = User;
