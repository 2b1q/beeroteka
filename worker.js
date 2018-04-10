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
    Rest = require('connect-rest');

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
// add bodyParser middleware
app.use(bodyParser.json({ limit: '10kb'} ));
app.use(bodyParser.urlencoded({ extended: false }));
// add cookie parser, sessions and flash MSGS (http client state)
app.use(cookieParser(config.cookieToken));
app.use(sessions(config.sessions));
app.use(flash()); // flash is a special area of the session used for storing messages
// setup static path
app.use(express.static(path.join(__dirname, 'public')));

/**
* Setup common routes using router middleware
*/
var index = require('./routes/index'),
    beers = require('./routes/beers');
app.use('/', index); // root '/' router
app.use('/beers', beers); // '/beers' router

/**
* Setup REST API services using 'rest-connect' middleware
*/
var rest = Rest.create(config.restOptions), // create rest-connect object
    service = require('./routes/rest_services'); // add REST services
app.use(rest.processRequest()); // add connect-rest middleware

/** REST service endpoints */
// bind the service funciont to only the given http request types
rest.assign([ 'get','post' ], // assign incoming HTTP REST methods
            [ { path: '/test', unprotected: true } ], // config API route
            service.test_service ) // setup assync callback service to API route
rest.get({ path: '/dataload/:id', unprotected: false }, service.dataload ); // hashload service /api/dataload/<id>?api_key=<api_key>

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
