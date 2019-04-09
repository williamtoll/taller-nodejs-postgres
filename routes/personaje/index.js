var express = require('express');
var cors = require('cors');
var router = express.Router();
const axios = require('axios');

const jwt = require('express-jwt')

var PropertiesReader = require('properties-reader');

//Configurar aquí la ubicación del archivo properties donde se encuentra la configuración de conexión a la base de datos
var properties = PropertiesReader('/opt/got.properties');

const db = require('../../db');

var _ = require('lodash');
//conexion a la base de datos Postgres
const {Pool,Client} = require('pg');

const Router = require('express-promise-router')


const poolGot = new Pool({
    host: properties.get('db.got.host'),
    database: properties.get('db.got.database'),
    port: properties.get('db.got.port'),
    user: properties.get('db.got.username'),
    password: properties.get('db.got.password'),
});

const dateformat = require('dateformat');

const SQL_PERSONAJES = 'select * from personaje';

const SQL_FAMILIAS = 'select * from familia';




const baseUrlGotApi="https://gotdata.northeurope.cloudapp.azure.com/api/show";

//Ejemplo de como obtener un registro de la base de datos de Postgres
router.get('/lista', cors(), async (req, res, next) => {
    let rowsPersonajes = await poolGot.query(SQL_PERSONAJES);
    console.log("personajes", rowsPersonajes[0]);
    resPersonajes = rowsPersonajes.rows;
    //terminamos el request y devolvemos un mensaje
    res.send(resPersonajes);
});


//Ejemplo de como obtener un objeto y su detalle, 
// Realizamos una consulta a la base de datos para obtener el "personaje" a partir de esto rellenamos su atributo "familia" realizando otra consulta a la base de datos
router.get('/det', cors(), async (req, res, next) => {
    let personaje=[];
    let rowsPersonajes = await poolGot.query(SQL_PERSONAJES);

    console.log("personajes", rowsPersonajes[0]);
    personaje = rowsPersonajes.rows;

    for( var i in personaje){
        
        let familia = await db.obtenerFamiliaPorID(personaje[i].id_familia);
        personaje[i].familia=familia.rows[0];
    }

    //terminamos el request y devolvemos un mensaje
    res.send(personaje);
});


//Ejemplo de como recibir parametros en la petición GET, en este caso recibido el parametro id
router.get('/:id', cors(), async (req, res, next) => {

    let rowsPersonajes = await db.obtenerPersonajePorID(req.params.id);
    console.log("personajes", rowsPersonajes[0]);
    resPersonajes = rowsPersonajes.rows;
    res.send(resPersonajes);

});

//Ejemplo de como recibir parametros en la petición POST y cómo insertarlo en la base de datos
router.post('/insertar',cors(),async(req,res,next)=>{
    var result={};
    console.log("params", req.body);

    var personaje=req.body;
    result= await db.insertarPersonajeTrx(personaje);

    if(result.rows){
        res.send(result.rows[0]);
    }else{
        res.send("No se pudo insertar");
    }




});

//Ejemplo de cómo documentar la api con Express Swagger

/**
 * Obtiene el personaje del api externo apigot a partir del nombre del personaje
 * @route GET /apigot/characters
 * @group characters - Lista el personaje a partir del nombre
 * @param {string} name+- - nombre del personaje
 * @returns {object} 200 - Devuelve el objeto personaje
 * @returns {Error}  default - Error al obtener los datos
 */

 //Ejemplo de cómo recibir párametros de tipo GET en la url, en este caso recibimos un parametro de tipo Query Param llamado name
router.get('/apigot/characters',cors(),async(req,res,next)=>{

    axios.get(baseUrlGotApi+'/characters/'+req.query.name)
    .then(function (response) {
      // handle success
      console.log(response);

      res.send(response.data.data);

    })
    .catch(function (error) {
      // handle error
      console.log(error);
      res.send("Error al obtener los datos",error);
    })
    .then(function () {
      // always executed
    });
  

});



//Ejemplo de cómo proteger nuestro recurso utilizando Tokens JWT
//para generar el token de prueba ir a http://jwt.io
//https://github.com/axios/axios
const secret  = { secret: process.env.SECRET || 'ejemplo' }
/**
 * Obtiene todas las casas
 * @route GET /apigot/houses
 * @group houses - Lista todas las casas
 * @returns {object} 200 - Devuelve la lista de casas
 * @returns {Error}  default - Error al obtener los datos
 */
router.get('/apigot/houses',jwt(secret),async(req,res,next)=>{

    axios.get(baseUrlGotApi+'/houses/')
    .then(function (response) {
      // handle success
      console.log(response);

      //si el usuario tiene el atributo admin:true entonces devolvemos los datos
      if(req.user.admin){
        res.send(response.data);
      }

      //respuesta para el usuario que no es admin
      res.status(401).send({ message: 'not authorized' })

    })
    .catch(function (error) {
      // handle error
      console.log(error);
      res.send("Error al obtener los datos",error);
    })
    .then(function () {
      // always executed
    });
  

});





module.exports = router;