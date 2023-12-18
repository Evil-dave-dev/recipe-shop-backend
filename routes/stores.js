var express = require("express");
var router = express.Router();
const Store = require("../models/stores");
const Ingredient = require("../models/ingredients");

/*ingredients: [
    {
      name: String,
      qty: Number,
      unit: String,
      price: Number,
    },
  ],*/

const categoryReference = {
  "Fruits & Légumes": { lowPriceKg: 4.15, variance: 0.5 },
  "Boulangerie & Pâtisseries": { lowPriceKg: 1.74, variance: 0.1 },
  "Produits laitiers": { lowPriceKg: 7.12, variance: 0.3 },
  "Viandes & Poissons": { lowPriceKg: 13.97, variance: 0.2 },
  Epices: { lowPriceKg: 17.53, variance: 2 },
  "Epicerie Salée": { lowPriceKg: 5.45, variance: 0.12 },
  "Epicerie Sucrée": { lowPriceKg: 5.45, variance: 0.12 },
  "Pâtes, Riz & Céréales": { lowPriceKg: 1.09, variance: 1 },
  Autre: { average: 4.5, variance: 0.1 },
};
const storeReference = {
  ["Lidl Saint-Omer"]: 0.95,
  ["E.Leclerc Carvin"]: 0.975,
  ["Cc Auchan Flandre Littoral"]: 1,
  ["Carrefour Drive Lens Maës"]: 1.025,
  ["MONOPRIX (MONOPRIX LILLE TANNEURS)"]: 1.05,
};

const generateProductCalalogue = (store, ingredients) => {
  const storeRef = storeReference[store.name] * (0.95 + Math.random() * 0.05);

  return ingredients.map((e) => ({
    productName: e.name,
    productReferences: [
      {
        ref: `${e.name} Marque repère`,
        qty: 30,
        unit: e.unit,
        price:
          storeRef * categoryReference[e.category].lowPriceKg +
          categoryReference[e.category].lowPriceKg *
            categoryReference[e.category].variance *
            Math.random(),
      },
      {
        ref: `${e.name} classique`,
        qty: 30,
        unit: e.unit,
        price:
          categoryReference[e.category].lowPriceKg * storeReference[store.name],
      },
      {
        ref: `${e.name} Louis Vuitton`,
        qty: 30,
        unit: e.unit,
        price:
          categoryReference[e.category].lowPriceKg * storeReference[store.name],
      },
    ],
  }));
};

router.post("/", async (req, res, next) => {
  const { name, logo = "", catalogue = [], adress } = req.body;
  if (!name || !adress) {
    res.json({ result: false, response: "must enter an adress and a name" });
  }
  const store = new Store({
    name: name,
    adress: {
      city: adress.city,
      postcode: adress.postcode,
      location: {
        type: "Point",
        coordinates: adress.location.coordinates,
      },
    },
    logo: logo,
    catalogue: catalogue,
  });
  const response = await store.save();
  res.json({ result: true, response });
});

router.get("/", async (req, res) => {
  const response = await Store.find();
  res.json({ response: response });
});

router.put("/", async (req, res) => {
  const { ingredientsList } = req.body;

  const stores = await Store.find();
  const ingredients = await Ingredient.find();

  const storeData = stores.map((e) => ({
    storeName: e.name,
    productsCatalogue: generateProductCalalogue(e, ingredients),
  }));

  const response = storeData.map((e) => ({
    storeName: e.storeName,
    relevantProductsCatalogue: e.productsCatalogue.filter(x => ingredientsList.some(y => y === x.productName))
  }));

  res.json({ response: { response } });
});

router.get("/search/:name", async (req, res) => {
  const response = await Ingredient.find({
    name: { $regex: new RegExp(req.params.name, "i") },
  });
  res.json({ res: response });
});
module.exports = router;
