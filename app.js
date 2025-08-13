var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var profileRouter = require('./routes/profile');
var postsRouter = require('./routes/posts');
var uploadRouter = require('./routes/upload');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/profile', profileRouter);
app.use('/api/posts', postsRouter);
app.use('/api/upload', uploadRouter);

module.exports = app;
