
var PropertiesReader = require('properties-reader');

var properties = PropertiesReader('/opt/got.properties');

var _ = require('lodash');
//conexion a la base de datos Postgres
const {
    Pool,
    Client
} = require('pg');

const Router = require('express-promise-router')


const poolGot = new Pool({
    host: properties.get('db.got.host'),
    database: properties.get('db.got.database'),
    port: properties.get('db.got.port'),
    user: properties.get('db.got.username'),
    password: properties.get('db.got.password'),
});



const SQL_OBTENER_LISTA_PERSONAJES_POR_ID="select * from personaje where id=$1";

const SQL_OBTENER_FAMILIA_POR_ID="select * from familia where id=$1";

const SQL_INSERTAR_PERSONAJE="insert into personaje(nombre,id_familia) values($1,$2) RETURNING id";
const SQL_INSERTAR_FAMILIA="insert into familia(nombre) values($1) RETURNING id";


function insertarPersonaje(personaje){
    try {
        const res = poolGot.query(SQL_INSERTAR_PERSONAJE,[personaje]);
        return res;
    } catch(err) {
        console.log(err.stack)
        return err.stack;
    }
}

function insertarFamilia(familia){
    try{
        const res=poolGot.query(SQL_INSERTAR_FAMILIA,[familia]);
        return res;
    }catch(err){
        console.log(err.stack)
        return err.stack;
    }

}

async function  insertarPersonajeTrx(dato){
    // (async () => {
        const client = await poolGot.connect()
      
        try {
          await client.query('BEGIN')

          const resFamilia = await client.query(SQL_INSERTAR_FAMILIA, [dato.personaje.familia.nombre])

          dato.personaje.id_familia=resFamilia.rows[0].id;

          const resPersonaje = await client.query(SQL_INSERTAR_PERSONAJE, [dato.personaje.nombre,dato.personaje.id_familia]);

          await client.query('COMMIT');
          return resPersonaje;

        } catch (e) {
          await client.query('ROLLBACK')
          throw e
        } finally {
          client.release()

        }
    //   })().catch(e => console.error(e.stack))
}

module.exports = {
    insertarPersonaje: insertarPersonaje,
    insertarFamilia: insertarFamilia,
    insertarPersonajeTrx: insertarPersonajeTrx,
    obtenerPersonajePorID: (id)=>poolGot.query(SQL_OBTENER_LISTA_PERSONAJES_POR_ID,[id]),
    obtenerFamiliaPorID: (id)=>poolGot.query(SQL_OBTENER_FAMILIA_POR_ID,[id])

}
