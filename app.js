// Attach common modules/libs
var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    sessions = require('express-session'),
    bodyParser = require('body-parser'),
    flash = require('express-flash-messages')
    apivo_es = require('./models/apivo_es'), // add apivo_es model
    credentials = require('./credentials.js'); // add credentials

// import routes
var index = require('./routes/index'),
    beers = require('./routes/beers');

// init ES connect first
apivo_es.ping(); // es_ping APIVO index
// init express object
var app = express();

// Setup view engine
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(credentials.cookieToken));
app.use(sessions({
  resave: false,
  saveUninitialized: false,
  secret: credentials.cookieToken,
}));
// app.use(flash())
app.use(express.static(path.join(__dirname, 'public')));

// attach routes
app.use('/', index);
app.use('/beers', beers);

// Last ROUTE catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
