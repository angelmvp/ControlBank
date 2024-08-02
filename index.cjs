const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 4322;
const cors = require('cors');
const bodyParser = require('body-parser');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  password: '',
  database: 'prueba'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Agregar middleware cors para permitir solicitudes desde otros orígenes

app.get('/usuarios', async (req, res) => {
    try {
        const users = await pool.query('SELECT * FROM usuario');
        res.json(users.rows);
    } catch (e) {
        console.error('Error al obtener usuarios:', e);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

app.post('/registrar', async (req, res) => {
    const { nombre, apellidos, correo, contrasena } = req.body;
    try {
      const texto = 'INSERT INTO usuario(nombre_usuario, apellidos, correo, password) VALUES($1, $2, $3, $4)';
      const valores = [nombre, apellidos, correo, contrasena];
      await pool.query(texto, valores);
      res.status(200).json({ message: 'Usuario registrado exitosamente' });
    } catch (e) {
      console.error('Error al registrar usuario:', e);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  });

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

app.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
      const text = 'SELECT * FROM usuario WHERE correo = $1 AND password = $2';
      const valores = [correo, contrasena];
      const resultado = await pool.query(text, valores);
      if (resultado.rows.length > 0) {
          const usuario = resultado.rows[0];
          res.json({ success: true, id_usuario: usuario.id_usuario, nombre_usuario: usuario.nombre_usuario });
      } else {
          res.json({ success: false, message: 'Correo o contraseña incorrectos' });
      }
  } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

  app.get('/deportes/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;
    const texto = `
      SELECT nombre_deporte 
      FROM deporte  
      JOIN usuario_deporte ud ON deporte.id_deporte = ud.deporte_id 
      WHERE ud.usuario_id = $1`;
    
    try {
      const result = await pool.query(texto, [usuario_id]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error ejecutando la consulta:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });
  
  


const obtenerUsuarios=async() => {
    try{const users=await pool.query('select * from usuario');
    console.log(users.rows);
    pool.end();
}
    catch(e){
console.log(e);
    }
}


const insertarUsuario=async()=>{
    const texto='insert into usuario(nombre_usuario,apellidos,correo,password) values($1,$2,$3,$4)';  
    const valores =['Jhon','Uchiha', 'jhonuchicha','4321']
    const respuesta=await pool.query(texto,valores);
    console.log(respuesta);

}

const borrarUsuario=async()=>{
    const texto ='delete from usuario where nombre_usuario=$1';
    const valor=['Jhon'];
    const respuesta =await pool.query(texto,valor);
    console.log(respuesta);
    

}

const editarUsuario= async()=>{
    const texto ='update usuario set nombre_usuario=$1 where nombre_usuario =$2;';
    const valores=['Jhonathan','Jhon'];
    const respuesta=await pool.query(texto,valores);
    console.log(respuesta);
}


