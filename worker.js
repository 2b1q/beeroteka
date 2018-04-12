// Attach common modules/libs
var express = require('express'),
    log = require('./libs/log')(module),
    config = require('./config/config'),
    path = require('path'),
    favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    sessions = require('express-session'),
    bodyParser = require('body-parser'),
    cluster = require('cluster'), // access to cluster.worker.id
    flash = require('connect-flash'),
    Rest = require('connect-rest'),
    compression = require("compression"), // Compacting requests using GZIP middleware
    helmet = require("helmet"); // security middleware for XHR API that handles several kinds of attacks in the HTTP/HTTPS protocols

// init express framework
var app = express();

/**
* Common express env setup
*/
app.use(helmet())      // add security middleware
   .use(compression()); // add GZIP (compacting the JSON responses and also the static files)
// Setup views
app.set('views', path.join(__dirname, 'views')) // set view path
   .set('view engine', 'pug');                  // set view engine
// Setup static content
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))) // favicon in /public
   .use(express.static(path.join(__dirname, 'public')));        // setup static path

// add bodyParser middleware
app.use(bodyParser.json({ limit: '10kb' }))         // create application/json parser
   .use(bodyParser.urlencoded({ extended: true }))  // create application/x-www-form-urlencoded parser
   .use(cookieParser(config.cookieToken))           // add cookie parser
   .use(sessions(config.sessions))                  // add sessions storing
   .use(flash());                                   // add flash for storing messages

/**
* Setup common routes using router middleware
*/
var index = require('./routes/index'),
    beers = require('./routes/beers');
app.use('/', index) // root '/' router
   .use('/beers', beers); // '/beers' router
/**
* Setup REST API services using 'rest-connect' middleware
*/
var rest = Rest.create(config.restOptions), // create rest-connect object
    services = require('./routes/rest/services'); // add REST services
app.use(rest.processRequest()); // add connect-rest middleware
services.attach(rest); // Attach REST service endpoints

// Last ROUTE catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.success = req.flash('success');
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
// var value = function(args) { /* ... */ }(args); // IIFE
var port = function (val) {
  var port = parseInt(val, 10);
  // named pipe
  if (isNaN(port)) { return val; }
  // port number
  if (port >= 0) { return port; }
  return false;
}(process.env.PORT || config.server.port);

// console.log('port %s', port);

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
  var workerid = cluster.worker.id;
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr: 'port ' + addr.port;
  log.info(config.color.cyan+'Worker %d '+config.color.yellow+'Listening on '+config.color.cyan+config.server.ip+' '+config.color.white+'%s',workerid, bind)
}
