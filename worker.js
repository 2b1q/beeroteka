// Attach common modules/libs
var express = require('express'),
    log = require('./libs/log')(module),
    config = require('./config/config'),
    path = require('path'),
    favicon = require('serve-favicon'),
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

// start server
    //var debug = require('debug')('es:server');
    var http = require('http');
    var debug = require('debug')('pugbootstrap-seed:server');

    /**
     * Get port from environment and store in Express.
     */

    var port = normalizePort(process.env.PORT || config.server.port);
    app.set('port', config.server.ip+':'+port);

    /**
     * Create HTTP server.
     */

    var server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    /**
     * Normalize a port into a number, string, or false.
     */

    function normalizePort(val) {
      var port = parseInt(val, 10);

      if (isNaN(port)) {
        // named pipe
        return val;
      }

      if (port >= 0) {
        // port number
        return port;
      }

      return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error) {
      if (error.syscall !== 'listen') {
        throw error;
      }

      var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
      var addr = server.address();
      var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
      debug('Listening on ' + bind);
    }
