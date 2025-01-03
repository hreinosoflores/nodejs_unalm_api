import express, { urlencoded, json } from "express";
import Sequelize, { BIGINT, STRING, INTEGER, DATE, NOW } from "sequelize";
import cors from "cors";

const app = express();

app.use(cors());

app.use(urlencoded({ extended: false }));
app.use(json());

const errorJSON = function (res, errCode, errMsg) {
  res.status(errCode).json({
    codigo: errCode,
    error: errMsg,
  });
};

const PORT = 40009;
const MYSQL_DATABASE = "unalm";
const MYSQL_USER = "root";
const MYSQL_PASS = "mysql";
const MYSQL_HOST = "localhost";
const MYSQL_DIALECT = "mysql";
const TABLE_CURSOS = "cursos";
const URL_CURSOS = "/api/Cursos/";
const TABLE_BANDEJA_MSJ = "bandeja_mensajes";
const URL_BANDEJA_MSJ = "/api/BandejaMensajes/";

const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USER, MYSQL_PASS, {
  host: MYSQL_HOST,
  dialect: MYSQL_DIALECT,
  define: {
    timestamps: false,
  },
});

sequelize
  .authenticate()
  .then(() => console.log(`CONEXION EXITOSA A DB '${MYSQL_DATABASE}'`))
  .catch((error) => console.log(`EL ERROR DE CONEXION ES: ${error}`));

//------------CURSOS-------------------------------

const cursosModel = sequelize.define(TABLE_CURSOS, {
  id: { type: BIGINT, primaryKey: true, autoIncrement: true },
  codigo: { type: STRING },
  nombre: { type: STRING },
  creditos: { type: INTEGER },
  horas_teoria: { type: INTEGER },
  horas_practica: { type: INTEGER },
  sumilla: { type: STRING },
  created_at: { type: DATE, defaultValue: NOW },
  updated_at: { type: DATE, defaultValue: NOW },
});

//Mostrar todos los cursos
app.get(URL_CURSOS, (req, res) => {
  cursosModel
    .findAll({
      attributes: [
        "id",
        "codigo",
        "nombre",
        "creditos",
        ["horas_teoria", "horasTeoria"],
        ["horas_practica", "horasPractica"],
        "sumilla",
        ["created_at", "createdAt"],
        ["updated_at", "updatedAt"],
      ],
    })
    .then((cursos) => res.json(cursos))
    .catch((error) => console.log(`ERROR AL CONSULTAR DATOS: ${error}`));
});

//Consultar curso por id
app.get(`${URL_CURSOS}:id`, (req, res) => {
  cursosModel
    .findByPk(req.params.id, {
      attributes: [
        "id",
        "codigo",
        "nombre",
        "creditos",
        ["horas_teoria", "horasTeoria"],
        ["horas_practica", "horasPractica"],
        "sumilla",
        ["created_at", "createdAt"],
        ["updated_at", "updatedAt"],
      ],
    })
    .then((curso) => res.json(curso))
    .catch((error) => console.log(`ERROR AL CONSULTAR DATOS: ${error}`));
});

//Crear nuevo curso
app.post(URL_CURSOS, (req, res) => {
  cursosModel
    .create({
      codigo: req.body.codigo,
      nombre: req.body.nombre,
      creditos: req.body.creditos,
      horas_teoria: req.body.horasTeoria,
      horas_practica: req.body.horasPractica,
      sumilla: req.body.sumilla,
    })
    .then((curso) => {
      res.json(curso);
      console.log(`Nuevo curso generado con ID ${curso.id}`);
    })
    .catch((error) => console.log(`ERROR AL INSERTAR DATOS: ${error}`));
});

//Actualizar curso
app.put(`${URL_CURSOS}:id`, (req, res) => {
  if (req.params.id == req.body.id) {
    cursosModel
      .update(
        {
          codigo: req.body.codigo,
          nombre: req.body.nombre,
          creditos: req.body.creditos,
          horas_teoria: req.body.horasTeoria,
          horas_practica: req.body.horasPractica,
          sumilla: req.body.sumilla,
          updated_at: new Date(),
        },
        { where: { id: req.body.id } }
      )
      .then((resultado) => {
        if (resultado == 1) {
          cursosModel.findByPk(req.body.id).then((curso) => res.json(curso));
        } else {
          errorJSON(res, 400, `No se encontró curso con ID ${req.body.id}`);
        }
      })
      .catch((error) => console.log(`ERROR AL ACTUALIZAR DATOS: ${error}`));
  } else {
    errorJSON(res, 400, "Url y body no coinciden");
  }
});

//Borrar curso
app.delete(`${URL_CURSOS}:id`, function (req, res) {
  cursosModel
    .destroy({ where: { id: req.params.id } })
    .then((resultado) => {
      if (resultado == 1) {
        console.log("CURSO ELIMINADO CORRECTAMENTE");
        res.end();
      } else {
        errorJSON(res, 400, `No se encontró curso con ID ${req.params.id}`);
      }
    })
    .catch((error) => console.log(`ERROR AL ELIMINAR DATOS: ${error}`));
});

//------------BANDEJA DE ENTRADA MENSAJES-------------------------------

const mensajesModel = sequelize.define(TABLE_BANDEJA_MSJ, {
  id: { type: BIGINT, primaryKey: true, autoIncrement: true },
  nombres: { type: STRING },
  apellidos: { type: STRING },
  email: { type: STRING },
  telefono: { type: STRING },
  comentarios: { type: STRING },
  created_at: { type: DATE, defaultValue: NOW },
  updated_at: { type: DATE, defaultValue: NOW },
});

//Mostrar todos los mensajes
app.get(URL_BANDEJA_MSJ, (req, res) => {
  mensajesModel
    .findAll({
      attributes: [
        "id",
        "nombres",
        "apellidos",
        "email",
        "telefono",
        "comentarios",
        ["created_at", "createdAt"],
        ["updated_at", "updatedAt"],
      ],
    })
    .then((mensajes) => res.json(mensajes))
    .catch((error) => console.log(`ERROR AL CONSULTAR DATOS: ${error}`));
});

//Crear nuevo mensaje
app.post(URL_BANDEJA_MSJ, (req, res) => {
  mensajesModel
    .create({
      nombres: req.body.nombres,
      apellidos: req.body.apellidos,
      email: req.body.email,
      telefono: req.body.telefono,
      comentarios: req.body.comentarios,
    })
    .then((mensaje) => {
      res.json(mensaje);
      console.log(
        `Acaba de llegar un nuevo mensaje con ID ${mensaje.id} a la bandeja de entrada`
      );
    })
    .catch((error) => console.log(`ERROR AL INSERTAR DATOS: ${error}`));
});

app.use(function (req, res) {
  errorJSON(res, 404, "URL no encontrada");
});

const puerto = PORT || 40009;
app.listen(puerto, () => {
  console.log(`SERVER UP ON PORT ${puerto}!!`);
});
