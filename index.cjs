const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 4322;
const cors = require('cors');
const bodyParser = require('body-parser');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  password: 'BD27-mVp+',
  database: 'prueba'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Agregar middleware  cors para permitir solicitudes desde otros orígenes

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
      const texto = 'SELECT * FROM usuario WHERE correo = $1 AND password = $2';
      const valores = [correo, contrasena];
      const resultado = await pool.query(texto, valores);
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
      select distinct id_deporte, nombre_deporte from deporte
      join liga on liga.deporte_id=id_deporte
      join usuario_liga on usuario_liga.liga_id=liga.id_liga 
      where usuario_liga.usuario_id=$1 `;
    
    try {
      const result = await pool.query(texto, [usuario_id]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error ejecutando la consulta:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });

  app.get('/ligas/:userId/:deporteId', async (req, res) => {
    const { userId, deporteId } = req.params;
    const texto = `
      SELECT id_liga, nombre_liga 
      FROM liga  
      JOIN usuario_liga ul ON liga.id_liga = ul.liga_id 
      WHERE ul.usuario_id = $1 AND liga.deporte_id = $2`;
    try {
      const result = await pool.query(texto, [userId, deporteId]);
      res.json(result.rows); 
    } catch (err) {
      console.error('Error ejecutando la consulta:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });
  
  
  app.post('/apuesta', async (req, res) => {
    const { usuario, liga, FechaApuesta, Evento,DescripcionApuesta, TipoDeLaApuesta, Momio, Cantidad, resultado } = req.body;
    try {
        const texto = `INSERT INTO apuesta(usuario_id, liga_id, fecha, evento,descripcion_apuesta, tipo_apuesta, momio, cantidad_apostada, resultado)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)`;
        const valores = [usuario, liga, FechaApuesta, Evento, DescripcionApuesta, TipoDeLaApuesta, Momio, Cantidad, resultado];
        await pool.query(texto, valores);
        res.status(201).json({success:true});
    } catch (error) {
        console.error('Error al registrar apuesta:', error);
        res.status(500).json({ success: false, message: 'Error interno dsssel servidor' });
    }
});

app.get('/obtenerdeportes', async (req,res) =>{
  const{deporteId,deportNombre}=req.params;
  const texto=`
      select id_deporte,nombre_deporte from deporte`;
  try{
      const result= await pool.query(texto)
      res.json(result.rows);
    }catch(error){
    console.error('Error al obtener deporte:', error);
  }
});

app.get('/obtenerligas/:deporteId', async (req, res) => {
  const { deporteId } = req.params;
  const texto = `
    SELECT id_liga, nombre_liga 
    FROM liga  
    JOIN deporte d ON d.id_deporte = liga.deporte_id 
    WHERE d.id_deporte=$1`;
  try {
    const result = await pool.query(texto, [deporteId]);
    res.json(result.rows); 
  } catch (err) {
    console.error('Error ejecutando la consulta:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.post('/guardarnuevaliga/:userId/:ligaId', async (req, res) => {
  const { userId, ligaId } = req.body;
  const texto = `
    INSERT INTO usuario_liga(usuario_id, liga_id) VALUES ($1, $2)
    ON CONFLICT (usuario_id, liga_id) DO NOTHING`; // Evita duplicación
  
  try {
    const result = await pool.query(texto, [userId, ligaId]);
    
    if (result.rowCount === 0) {
      // Si no se insertó ninguna fila, es porque ya existía el registro
      res.status(409).json({ success: false, message: 'Ya tienes registrada esta liga.' });
    } else {
      res.status(201).json({ success: true });
      console.log("Liga registrada con éxito");
    }
  } catch (error) {
    console.error('Error al insertar:', error);
    if (error.code === '23505') {
      // Error de duplicación
      res.status(409).json({ success: false, message: 'Ya tienes registrada esta liga.' });
    } else {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
});


app.get('/apuestas/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
      const texto = 'SELECT fecha, evento, descripcion_apuesta, momio, cantidad_apostada, resultado FROM apuesta WHERE usuario_id = $1';
      const result = await pool.query(texto, [userId]);
      console.log(userId);
      res.json(result.rows);
  } catch (err) {
      console.error(err);
      console.log("error")
      res.status(500).send('Server Error');
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


