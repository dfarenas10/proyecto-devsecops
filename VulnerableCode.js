// Infraestructura: Servidor Express con vulnerabilidades
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql'); // Dependencia vulnerable
const session = require('express-session');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'supersecret', resave: false, saveUninitialized: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'test_db'
});
db.connect();

// Casos de Uso: Autenticación (con vulnerabilidades)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Vulnerabilidad: Inyección SQL
    db.query(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`, (err, results) => {
        if (results.length > 0) {
            req.session.user = username;
            res.send(`Bienvenido ${username}`);
        } else {
            res.send('Credenciales inválidas');
        }
    });
});

// Presentación: Endpoint vulnerable a XSS
app.get('/profile', (req, res) => {
    const username = req.session.user || 'Invitado';
    res.send(`<h1>Perfil de ${username}</h1><script>alert('XSS');</script>`); // XSS
});

// Endpoint vulnerable a CSRF
app.post('/transfer', (req, res) => {
    if (!req.session.user) return res.status(403).send('No autorizado');
    // Simulación de transferencia sin verificación CSRF
    res.send('Transferencia realizada con éxito');
});

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));