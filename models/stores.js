const mongoose = require("mongoose");

const storesSchema = mongoose.Schema({
  name: String,
  adress: {
    city: String,
    postcode: Number,
    location: {
      latitude: Number,
      longitude: Number,
    },
  },
  logo: String,
  catalogue: {
    ingredient: [
      {
        name: String,
        qty: Number,
        unit: String,
        price: Number,
      },
    ],
  },
});

const Store = mongoose.model("store", storesSchema);

module.exports = Store;
