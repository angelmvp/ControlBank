const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Configura tu conexión a PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'prueba',
    password: 'BD27-mVp+',
    port: 5432,
});

// Ruta de registro
app.post('/register', async (req, res) => {
    const { nombre, apellidos, correo, contrasena } = req.body;
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    try {
        const result = await pool.query(
            'INSERT INTO usuarios (nombre, apellidos, correo, contrasena) VALUES ($1, $2, $3, $4)',
            [nombre, apellidos, correo, hashedPassword]
        );
        res.status(201).json({ message: 'Usuario registrado exitosamente!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ruta de login
app.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(contrasena, user.contrasena)) {
            const token = jwt.sign({ id: user.id }, 'tu_secreto_jwt', { expiresIn: '1h' });
            res.status(200).json({ token });
        } else {
            res.status(401).json({ message: 'Credenciales inválidas' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
