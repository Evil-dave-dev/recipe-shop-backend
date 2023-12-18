const mongoose = require("mongoose");

const storesSchema = mongoose.Schema({
  name: String,
  adress: {
    city: String,
    postcode: Number,
    location: {
      type: {
        type: String,
      },
      coordinates: [Number]
    },
  },
  logo: String,
  catalogue: [],
});

const Store = mongoose.model("store", storesSchema);

module.exports = Store;

/*ingredients: [
  {
    name: String,
    qty: Number,
    unit: String,
    price: Number,
  },
],
  location: {
      type: "Point",
      coordinates: [longitude, latitude]
    },
*/