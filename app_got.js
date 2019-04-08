// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3001;

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var personajeRoutes = require('./routes/personaje');

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));



var cors = require('cors')

var whitelist = ['http://localhost:8100','http://localhost:8080']
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


const expressSwagger = require('express-swagger-generator')(app);

let optionsExpressSwagger = {
    swaggerDefinition: {
        info: {
            description: 'Api GOT',
            title: 'Swagger',
            version: '1.0.0',
        },
        host: 'localhost:'+port,
        basePath: '/v1',
        produces: [
            "application/json",
            "application/xml"
        ],
        schemes: ['http', 'https'],
        securityDefinitions: {
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: "",
            }
        }
    },
    basedir: __dirname, //app absolute path
    files: ['./routes/**/*.js'] //Path to the API handle folder
};
expressSwagger(optionsExpressSwagger)


// routes ======================================================================
app.use('/personaje', personajeRoutes);

// launch ======================================================================

app.listen(port);
console.log('The magic happens on port ' + port);


