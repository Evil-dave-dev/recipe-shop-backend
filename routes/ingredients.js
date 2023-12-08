var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.json({result: true})
});

router.post("/", async (req, res) => {
   
});

module.exports = router;
