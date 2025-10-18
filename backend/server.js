const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Conexion a PostgreSql
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "usersdb",
    password: "Jaircho2609",
    port: 5432,
});

// Ruta de prueba
app.get("/api/ping", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({message: "Backend funcionando", time: result.rows[0]});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// Registro de usuario
app.post("/api/register", async (req, res) => {
    console.log(" Entro a /api/register");
    try{
     const { name, email, password } = req.body;   
        
     // encriptar contraseña
     const hashedPassword = await bcrypt.hash(password, 10);
     
     // insertar en la bd
     await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
        [name, email, hashedPassword]
     );

     res.json({ message: "Usuario registrador con exito" });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "No se pudo registrar el usuario (quiza el correo ya existe)" });
    }
});

app.post("/api/login", async (req, res) => {
    console.log ("Entro a /api/login");
    try {
        const { email, password } = req.body;

        const result = await pool.query("SELECT * FROM users WHERE email = $1", [
            email,
        ]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Usuario no encontrado " });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);

        if(!passwordMatch) {
            return res.status(400).json({ error: "Credenaciales invalidas" });
        }
        
        res.json({
            message: "Inicio de sesion exitoso",
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


// Subir servidor
app.listen(port, () => {
    console.log("Servidor backend funcionando en http://localhost:${port}");
});

// Obtener todos los productos de la tienda web
app.get("/api/products", async (req,res) => {
    try{
        const result = await pool.query ("SELECT * FROM products ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear producto
app.post ("/api/poducts", async (req,res) =>{
    try{
        const {nombre, brand, precio, stock, description, image_url } = req.body;
        await pool.query (
            "INSERT INTO products (name, brand, price, stock, description, image_url) VALUES ($1,$2,$3,$4,$5,$6)",
            [nombre, brand, precio, stock, description, image_url ]
        );
        res.json({ message: "Producto agregado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

//actualizar producto
app.put("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, brand, precio, stock, description, image_url } = req.body;
        await pool.query (
            "UPDATE products SET nombre=$1, brand=2#, precio=$3, stock=$4, description=$5, image_url=$6 WHERE id=$7",
            [nombre, brand, precio, stock, description, image_url, id]
        );
        res.json({ message: "Producto actualizado correctamente "});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar producto
app.delete("api/products/id", async (req, res) => {
    try{
        const { id } = req.params;
        await pool.query("DELETE FROM products WHERE id=$1", [id]);
        res.json({ message: "Producto eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});