// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3008;

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var userRoutes   = require('./routes/user');

var entregaRoutes = require('./routes/entrega');

var tareaRoutes=require('./routes/tarea');
var solicitudRoutes = require('./routes/solicitud');

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));



var cors = require('cors')

var whitelist = ['http://app.multipartes.com.py','http://localhost:8100','http://localhost:8080']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin ) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.options('*', cors()) 

app.use(cors())


// routes ======================================================================
app.use('/teckel/subir-archivo', userRoutes);

app.use('/teckel/entrega/', entregaRoutes);

app.use('/teckel/tarea/api/v2/',tareaRoutes);
app.use('/teckel/solicitud/', solicitudRoutes);


// launch ======================================================================

app.listen(port);
console.log('The magic happens on port ' + port);


