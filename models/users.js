const mongoose = require("mongoose");

const preference = mongoose.Schema({
  regime: [String],
  excludeAliments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "ingredients" },
  ],
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
  preference: preference,
  favoriteRecipes: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "recipes" },
    },
  ],
  myRecipes: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: "recipes" } }],
  currentRecipes: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "recipes" },
      date: Date,
    },
  ],
  historyRecipes: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "recipes" },
      date: Date,
    },
  ],
});

const User = mongoose.model("users", usersSchema);

module.exports = User;
