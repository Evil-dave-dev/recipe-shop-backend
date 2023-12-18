require('dotenv').config();
require('./models/connection')
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var ingredientsRouter = require('./routes/ingredients')
var recipesRouter = require('./routes/recipes')
var storesRouter = require('./routes/stores')

var app = express();

const fileUpload = require('express-fileupload');
app.use(fileUpload());

const cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/ingredients', ingredientsRouter);
app.use('/recipes', recipesRouter);
app.use('/stores', storesRouter)

module.exports = app;
