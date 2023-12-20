var express = require("express");
var router = express.Router();
const Store = require("../models/stores");
const Ingredient = require("../models/ingredients");

const categoryReference = {
  "Fruits & Légumes": { lowPriceKg: 4.15, variance: 0.5 },
  "Boulangerie & Pâtisseries": { lowPriceKg: 2.74, variance: 0.1 },
  "Produits laitiers": { lowPriceKg: 7.12, variance: 0.3 },
  "Viandes & Poissons": { lowPriceKg: 13.97, variance: 0.2 },
  Epices: { lowPriceKg: 17.53, variance: 2 },
  "Epicerie Salée": { lowPriceKg: 5.45, variance: 0.12 },
  "Epicerie Sucrée": { lowPriceKg: 5.45, variance: 0.12 },
  "Pâtes, Riz & Céréales": { lowPriceKg: 1.09, variance: 1 },
  Autre: { lowPriceKg: 4.5, variance: 0.1 },
};
const storeReference = {
  ["Lidl Saint-Omer"]: 0.95,
  ["E.Leclerc Carvin"]: 0.975,
  ["Cc Auchan Flandre Littoral"]: 1,
  ["Carrefour Drive Lens Maës"]: 1.025,
  ["MONOPRIX (MONOPRIX LILLE TANNEURS)"]: 1.05,
};
const qtyReference = {
  ["g"]: [150, 500, 1000],
  ["L"]: [0.5, 1, 2.5],
  ["pcs"]: [1, 2, 5],
};

/**
 * Generates a random price for an item according to its reference store and brand price level.
 *
 * @param {string} store - store name used to find its corresonding comparative price index in storeReference array
 * @param {string} category - category name used to find its corresponding base price and price variance
 * @param {number} itemRange - multiplier used to diffrenciate expensive and unexpensive brands (low multiplier for homeBrands and high for Louis Vuitton)
 * @param {number} qty - packaging quantity of the item (i.e: 150, 500 or 1000 for a piece of meat in grams)
 * @param {string} unit - unit used as ref to compute pricing
 * @returns {number} - computed pseudo-random price
 */
const computePrice = (store, category, itemRange, qty, unit) => {
  const storeRef = storeReference[store] * (0.95 + Math.random() * 0.05);
  const itemPriceMinKg = categoryReference[category].lowPriceKg;
  const itemVariance =
    categoryReference[category].lowPriceKg *
    categoryReference[category].variance *
    Math.random();
  const computedPriceKg = storeRef * itemPriceMinKg + itemVariance * itemRange;
  if (unit === "g") return ((computedPriceKg / 1000) * qty).toFixed(2);
  if (unit === "L") return (computedPriceKg * qty).toFixed(2);
  if (unit === "pcs") return (computedPriceKg / 3).toFixed(2);
};

/**
 * Generates 3 productReferences (homeBrand, regular, high-end) for each ingredients of a provided list
 *
 * @param {string} store - store for which the products are generated
 * @param {object[]} ingredients - ingredients list used as reference to generate random Item references and prices
 * @returns {Array} - array of products objects {productName: ... , category: ... , productReferences: [...]}
 */
const generateProductCalalogue = (store, ingredients) => {
  return ingredients.map((e) => {
    let qty1 = qtyReference[e.unit][Math.floor(Math.random() * 3)];
    let qty2 = qtyReference[e.unit][Math.floor(Math.random() * 3)];
    let qty3 = qtyReference[e.unit][Math.floor(Math.random() * 3)];
    return {
      productName: e.name,
      category: e.category,
      productReferences: [
        {
          ref: `${e.name} Marque repère`,
          qty: qty1,
          unit: e.unit,
          price: computePrice(store.name, e.category, 1 / 3, qty1, e.unit),
        },
        {
          ref: `${e.name} classique`,
          qty: qty2,
          unit: e.unit,
          price: computePrice(store.name, e.category, 2 / 3, qty2, e.unit),
        },
        {
          ref: `${e.name} Louis Vuitton`,
          qty: qty3,
          unit: e.unit,
          price: computePrice(store.name, e.category, 3 / 3, qty3, e.unit),
        },
      ],
    };
  });
};

router.post("/addNewStore", async (req, res, next) => {
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

/**
 * @name PUT/api/stores/lowestPrices
 * @param {object[]} ingredientsList of ingredient {name, amount}
 * @returns {object} - query status, list of ingredients and their lowest computed price {amount, name, item: {ref, qty, unit, price,}}
 */
router.put("/lowestPrices", async (req, res) => {
  const { ingredientsList } = req.body;
  const sortedIngredients = ingredientsList.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const storeData = await Store.find();
  const storesResults = storeData.map((store) => {
    const sortedProducts = store.catalogue
      .filter((x) => ingredientsList.some((y) => y.name === x.productName))
      .sort((a, b) => a.productName.localeCompare(b.productName));

    const ref = {};
    for (let i = 0; i < sortedIngredients.length; i++) {
      const data = sortedProducts[i].productReferences.reduce(
        (acc, e, j) => {
          if (
            acc.price * acc.nbRequired >
            e.price * Math.ceil(sortedIngredients[i].amount / e.qty)
          ) {
            return {
              ...e,
              nbRequired: Math.ceil(sortedIngredients[i].amount / e.qty),
            };
          } else {
            return acc;
          }
        },
        {
          ...sortedProducts[i].productReferences[0],
          nbRequired: Math.ceil(
            sortedIngredients[i].amount /
              sortedProducts[i].productReferences[0].qty
          ),
        }
      );
      const result = {
        amount: sortedIngredients[i].amount,
        reference: { ...data, TOTAL: data.nbRequired * data.price },
      };
      ref[sortedIngredients[i].name] = (result)
    }
    return {store: {name: store.name, coordinates: store.adress, logo: store.logo}, products: ref}
  });

  res.json({ response: storesResults });
});

/**
 * For each store, genrerates 3 Product references with random prices and qty for each ingredient stored in db
 *
 * @name PUT/api/stores/generate
 * @returns - query status, enerated results
 */
router.put("/generate", async (req, res) => {
  const stores = await Store.find();
  const ingredients = await Ingredient.find();

  const storeData = stores.map((e) => ({
    storeName: e.name,
    productsCatalogue: generateProductCalalogue(e, ingredients),
  }));

  for (const store of storeData) {
    await Store.updateOne(
      { name: store.storeName },
      { $set: { catalogue: store.productsCatalogue } }
    );
  }

  res.json({ result: true, response: { storeData } });
});

module.exports = router;
