// Attach common modules/libs
var express = require('express'),
    log = require('./libs/log')(module),
    config = require('./config/config'),
    path = require('path'),
    favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    sessions = require('express-session'),
    bodyParser = require('body-parser'),
    flash = require('express-flash-messages');

// init express object
var app = express();

/**
* Common express env setup
*/
// Setup views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// cookie and sessions
app.use(cookieParser(config.cookieToken));
app.use(sessions(config.sessions));
// app.use(flash())
// setup static path
app.use(express.static(path.join(__dirname, 'public')));

/**
* Setup routes
*/
// import routes
var index = require('./routes/index'),
    beers = require('./routes/beers');
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

/**
* Setup Node server
*/

//var debug = require('debug')('es:server');
var http = require('http');
var debug = require('debug')('pugbootstrap-seed:server');

// Get port from environment and store in Express.
// Normalize a port into a number, string, or false
var port = () => {
  var val = process.env.PORT || config.server.port;
  var port = parseInt(val, 10);
  // named pipe
  if (isNaN(port)) { return val; }
  // port number
  if (port >= 0) { return port; }
  return false;
}

app.set('port', config.server.ip+':'+port);
// create HTTP server
var server = http.createServer(app);
// Listen on provided port, on all network interfaces.
server.listen(port);

// server event hanlers 'on.error', 'on.listening'
server.on('error', onError);
server.on('listening', onListening);

// Event listener for HTTP server "error" event.
function onError(error) {
  if (error.syscall !== 'listen') throw error;
  var bind = typeof port === 'string' ? 'Pipe ' + port: 'Port ' + port;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      log.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      log.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

//  Event listener for HTTP server "listening" event.
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr: 'port ' + addr.port;
  debug('Listening on ' + bind);
}
