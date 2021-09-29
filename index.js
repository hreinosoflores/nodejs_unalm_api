const express = require('express');
const Sequelize = require('sequelize');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config({ path: './.env' });
const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const errorJSON = function (res, errCode, errMsg) {
    res.status(errCode).json({
        codigo: errCode,
        error: errMsg
    });
};

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASS,
    {
        host: process.env.MYSQL_HOST,
        dialect: process.env.MYSQL_DIALECT,
        define: {
            timestamps: false
        }
    }
);

sequelize.authenticate()
    .then(() => console.log(`CONEXION EXITOSA A DB '${process.env.MYSQL_DATABASE}'`))
    .catch(error => console.log(`EL ERROR DE CONEXION ES: ${error}`));

//------------CURSOS-------------------------------

const cursosModel = sequelize.define(
    process.env.TABLE_CURSOS,
    {
        id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, },
        codigo: { type: Sequelize.STRING },
        nombre: { type: Sequelize.STRING },
        creditos: { type: Sequelize.INTEGER },
        horas_teoria: { type: Sequelize.INTEGER },
        horas_practica: { type: Sequelize.INTEGER },
        sumilla: { type: Sequelize.STRING },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    }
);


//Mostrar todos los cursos
app.get(process.env.URL_CURSOS, (req, res) => {
    cursosModel.findAll(
        {
            attributes: [
                'id',
                'codigo',
                'nombre',
                'creditos',
                ['horas_teoria', 'horasTeoria'],
                ['horas_practica', 'horasPractica'],
                'sumilla',
                ['created_at', 'createdAt'],
                ['updated_at', 'updatedAt']
            ]
        }
    )
        .then(cursos => res.json(cursos))
        .catch(error => console.log(`ERROR AL CONSULTAR DATOS: ${error}`));
});

//Consultar curso por id
app.get(`${process.env.URL_CURSOS}:id`, (req, res) => {
    cursosModel.findByPk(req.params.id,
        {
            attributes: [
                'id',
                'codigo',
                'nombre',
                'creditos',
                ['horas_teoria', 'horasTeoria'],
                ['horas_practica', 'horasPractica'],
                'sumilla',
                ['created_at', 'createdAt'],
                ['updated_at', 'updatedAt']
            ]
        }
    )
        .then(curso => res.json(curso))
        .catch(error => console.log(`ERROR AL CONSULTAR DATOS: ${error}`));
});

//Crear nuevo curso
app.post(process.env.URL_CURSOS, (req, res) => {
    cursosModel.create({
        codigo: req.body.codigo,
        nombre: req.body.nombre,
        creditos: req.body.creditos,
        horas_teoria: req.body.horasTeoria,
        horas_practica: req.body.horasPractica,
        sumilla: req.body.sumilla,
    })
        .then(curso => {
            res.json(curso);
            console.log(`Nuevo curso generado con ID ${curso.id}`);
        })
        .catch(error => console.log(`ERROR AL INSERTAR DATOS: ${error}`));
});

//Actualizar curso
app.put(`${process.env.URL_CURSOS}:id`, (req, res) => {
    if (req.params.id == req.body.id) {
        cursosModel.update({
            codigo: req.body.codigo,
            nombre: req.body.nombre,
            creditos: req.body.creditos,
            horas_teoria: req.body.horasTeoria,
            horas_practica: req.body.horasPractica,
            sumilla: req.body.sumilla,
            updated_at: new Date()
        }, { where: { id: req.body.id } })
            .then(resultado => {
                if (resultado == 1) {
                    cursosModel.findByPk(req.body.id)
                        .then(curso => res.json(curso))
                } else {
                    errorJSON(res, 400, `No se encontró curso con ID ${req.body.id}`);
                }

            })
            .catch(error => console.log(`ERROR AL ACTUALIZAR DATOS: ${error}`));
    } else {
        errorJSON(res, 400, 'Url y body no coinciden');
    }
});

//Borrar curso
app.delete(`${process.env.URL_CURSOS}:id`, function (req, res) {
    cursosModel.destroy({ where: { id: req.params.id } })
        .then(resultado => {
            if (resultado == 1) {
                console.log('CURSO ELIMINADO CORRECTAMENTE');
                res.end();
            } else {
                errorJSON(res, 400, `No se encontró curso con ID ${req.params.id}`);
            }

        })
        .catch(error => console.log(`ERROR AL ELIMINAR DATOS: ${error}`));
});


//------------BANDEJA DE ENTRADA MENSAJES-------------------------------

const mensajesModel = sequelize.define(
    process.env.TABLE_BANDEJA_MSJ,
    {
        id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, },
        nombres: { type: Sequelize.STRING },
        apellidos: { type: Sequelize.STRING },
        email: { type: Sequelize.STRING },
        telefono: { type: Sequelize.STRING },
        comentarios: { type: Sequelize.STRING },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    }
);


//Mostrar todos los mensajes
app.get(process.env.URL_BANDEJA_MSJ, (req, res) => {
    mensajesModel.findAll(
        {
            attributes: [
                'id',
                'nombres',
                'apellidos',
                'email',
                'telefono',
                'comentarios',
                ['created_at', 'createdAt'],
                ['updated_at', 'updatedAt']
            ]
        }

    )
        .then(mensajes => res.json(mensajes))
        .catch(error => console.log(`ERROR AL CONSULTAR DATOS: ${error}`));
});

//Crear nuevo mensaje
app.post(process.env.URL_BANDEJA_MSJ, (req, res) => {
    mensajesModel.create({
        nombres: req.body.nombres,
        apellidos: req.body.apellidos,
        email: req.body.email,
        telefono: req.body.telefono,
        comentarios: req.body.comentarios,
    })
        .then(mensaje => {
            res.json(mensaje);
            console.log(`Acaba de llegar un nuevo mensaje con ID ${mensaje.id} a la bandeja de entrada`);
        })
        .catch(error => console.log(`ERROR AL INSERTAR DATOS: ${error}`));
});


app.use(function (req, res, next) {
    errorJSON(res, 404, 'URL no encontrada');
});

const puerto = process.env.PORT || 40009;
app.listen(puerto, () => {
    console.log(`SERVER UP ON PORT ${puerto}!!`);
});