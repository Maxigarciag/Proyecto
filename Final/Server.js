import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql2";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
    host: "localhost", // Cambiar según tu configuración
    user: "root",      // Usuario de la base de datos
    password: "Maxigarcia4554", // Contraseña de la base de datos
    database: "Proyecto_para_recibirnos", // Nombre de la base de datos
});

// Conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error("Error al conectar a la base de datos:", err);
    } else {
        console.log("Conexión exitosa a la base de datos.");
    }
});

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "tucorreo@gmail.com", // Cambia esto por tu correo
        pass: "tucontraseña", // Cambia esto por tu contraseña o contraseña de aplicación
    },
});

// Rutas de la API

// Ruta para login
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Por favor, complete todos los campos." });
    }

    const query = "SELECT Nombre, IDRol FROM Usuarios WHERE Correo = ? AND Contraseña = ?";
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error("Error al consultar la base de datos:", err);
            return res.status(500).json({ message: "Error del servidor." });
        }

        if (results.length > 0) {
            const { Nombre, IDRol } = results[0];
            res.json({ 
                message: "Inicio de sesión exitoso.", 
                userName: Nombre, 
                userRole: IDRol.toString()  // Asegurar que es string
            });
            
        } else {
            res.status(401).json({ message: "Correo o contraseña incorrectos." });
        }
    });
});

// Ruta para registrar usuarios
app.post("/api/register", (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Por favor, complete todos los campos." });
    }

    const query = "INSERT INTO Usuarios (Nombre, Correo, Contraseña, IDRol) VALUES (?, ?, ?, ?)";
    db.query(query, [name, email, password, role], (err) => {
        if (err) {
            console.error("Error al registrar al usuario:", err);
            return res.status(500).json({ message: "Error del servidor." });
        }
        res.json({ message: "Usuario registrado exitosamente." });
    });
});

// Ruta para generar código de recuperación
app.post("/api/forgot-password", (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Por favor, ingrese su correo." });
    }

    const code = Math.floor(100000 + Math.random() * 900000);

    const query = "UPDATE Usuarios SET CodigoRecuperacion = ? WHERE Correo = ?";
    db.query(query, [code, email], (err, results) => {
        if (err) {
            console.error("Error al generar el código:", err);
            return res.status(500).json({ message: "Error del servidor." });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Correo no encontrado." });
        }

        const mailOptions = {
            from: '"Recuperación de Contraseña" <tucorreo@gmail.com>',
            to: email,
            subject: "Código de Recuperación",
            text: `Tu código de recuperación es: ${code}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error al enviar el correo:", error);
                return res.status(500).json({ message: "Error al enviar el correo." });
            }

            console.log(`Correo enviado a ${email}: ${info.response}`);
            res.json({ message: "Código enviado. Por favor, revise su correo." });
        });
    });
});

// Ruta para verificar código
app.post("/api/verify-code", (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ message: "Correo y código requeridos." });
    }

    const query = "SELECT * FROM Usuarios WHERE Correo = ? AND CodigoRecuperacion = ?";
    db.query(query, [email, code], (err, results) => {
        if (err) {
            console.error("Error al verificar el código:", err);
            return res.status(500).json({ message: "Error del servidor." });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Código inválido o expirado." });
        }

        res.json({ message: "Código verificado. Puede restablecer su contraseña." });
    });
});

// Ruta para restablecer contraseña
app.post("/api/reset-password", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Correo y contraseña requeridos." });
    }

    const query = "UPDATE Usuarios SET Contraseña = ?, CodigoRecuperacion = NULL WHERE Correo = ?";
    db.query(query, [password, email], (err) => {
        if (err) {
            console.error("Error al restablecer la contraseña:", err);
            return res.status(500).json({ message: "Error del servidor." });
        }

        res.json({ message: "Contraseña restablecida exitosamente." });
    });
});

// Obtener todas las sucursales
app.get("/api/sucursales", (req, res) => {
    const query = "SELECT IDSucursal, Nombre, Dirección AS direccion FROM Sucursales";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener sucursales:", err);
            return res.status(500).json({ message: "Error del servidor." });
        }
        res.json(results);
    });
});

app.post("/api/sucursales", (req, res) => {
    const { nombre, direccion } = req.body;
    
    if (!nombre || !direccion) {
        return res.status(400).json({ message: "Todos los campos son requeridos." });
    }

    const query = "INSERT INTO Sucursales (Nombre, Dirección) VALUES (?, ?)";
    db.query(query, [nombre, direccion], (err, result) => {
        if (err) {
            console.error("Error al agregar sucursal:", err);
            return res.status(500).json({ message: "Error del servidor." });
        }

        // Obtener la sucursal recién creada
        db.query("SELECT IDSucursal, Nombre, Dirección AS direccion FROM Sucursales WHERE IDSucursal = ?", 
        [result.insertId], (err, newSucursal) => {
            if (err) {
                console.error("Error al obtener sucursal:", err);
                return res.status(500).json({ message: "Error del servidor." });
            }
            res.status(201).json({ message: "Sucursal agregada exitosamente.", sucursal: newSucursal[0] });
        });
    });
});


// Eliminar una sucursal por ID
app.delete("/api/sucursales/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM Sucursales WHERE IDSucursal = ?";
    db.query(query, [id], (err) => {
        if (err) {
            console.error("Error al eliminar sucursal:", err);
            return res.status(500).json({ message: "Error del servidor." });
        }
        res.json({ message: "Sucursal eliminada exitosamente." });
    });
});


// Editar una sucursal por ID
app.put("/api/sucursales/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, direccion } = req.body;
    if (!nombre || !direccion) {
        return res.status(400).json({ message: "Todos los campos son requeridos." });
    }
    const query = "UPDATE Sucursales SET Nombre = ?, Dirección = ? WHERE IDSucursal = ?";
    db.query(query, [nombre, direccion, id], (err, result) => {
        if (err) {
            console.error("Error al actualizar sucursal:", err);
            return res.status(500).json({ message: "Error del servidor." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Sucursal no encontrada." });
        }
        res.json({ message: "Sucursal actualizada exitosamente." });
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});