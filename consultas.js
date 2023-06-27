require("dotenv").config();

const bcrypt = require('bcryptjs');

const { get_Users_Middleware } = require('./middleware/middleware.js');

const { Pool } = require('pg');



const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: process.env.PASS,
    database: 'desafiosoftjobs',
    allowExitOnIdle: true
});

const agregarUsuario = async (usuario) => {
    try {
        const { email, password, rol, lenguage } = usuario;
        const emailExiste = await pool.query('SELECT email FROM usuarios WHERE email = $1', [email]);
        if (emailExiste.rows.length > 0) {
            throw { code: 400, message: "El email se encuentra registrado" };
        } else {
            const passwordEncriptada = bcrypt.hashSync(password);
            const values = [email, passwordEncriptada, rol, lenguage];
            const consulta = "INSERT INTO usuarios (email, password, rol, lenguage) values ($1, $2, $3, $4) RETURNING *";
            const result = await pool.query(consulta, values);
            console.log("Usuario creado con éxito");
            return result.rows[0];
        }
    } catch (error) {
        if (error.code) {
            throw error;
        } else {
            console.log("Error en el sistema.");
            throw { code: 500, message: "Error en el sistema." };
        }
    }   
} 

const verificarCredenciales = async (email, password) => {
    let usuario;
    let rowCount;
    const values = [email];
    const consulta = "SELECT * FROM usuarios WHERE email = $1";

    try {
        const result = await pool.query(consulta, values);
        usuario = result.rows[0];
        rowCount = result.rowCount;
    } catch (error) {
        throw { code: 500, message: "Error en el sistema." };
    }

    if (!usuario || !usuario.password) {
        throw { code: 401, message: "No existe usuario." }
    }

    const { password: passwordEncriptada } = usuario;
    const passwordCorrecta = bcrypt.compareSync(password, passwordEncriptada);

    if (!passwordCorrecta || !rowCount) {
        throw { code: 401, message: "Email o contraseña incorrecta."};
    }
}

const obtenerUsuario = async (email) => {
    try {
        const consulta = "SELECT email, rol, lenguage FROM usuarios WHERE email = $1";
        const values = [email];
        const { rowCount, rows } = await pool.query(consulta, values);
        if (!rowCount) throw { code: 404, message: "No se encontró usuario" };
        return rows[0];
    } catch (error) {
        throw { code: error.code || 500, message: "Hay un error en el sistema"};
    }
}

module.exports = {verificarCredenciales, agregarUsuario, obtenerUsuario};