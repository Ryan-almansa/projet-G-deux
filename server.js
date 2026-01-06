const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // Import de SQLite

const app = express();
const db = new sqlite3.Database('./database.db'); // Création du fichier BDD

app.use(bodyParser.json());
app.use(express.static('public'));

// Initialisation de la Table Users
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)`);

// --- ROUTE INSCRIPTION (REGISTER) ---
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;

    db.run(query, [username, password], (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: "Nom d'utilisateur déjà pris" });
        }
        res.json({ success: true, message: "Compte créé avec succès !" });
    });
});

// --- ROUTE CONNEXION (LOGIN) ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;

    db.get(query, [username, password], (err, user) => {
        if (user) {
            const token = "TOKEN_" + Math.random().toString(36).substr(2);
            res.json({ success: true, token: token });
        } else {
            res.status(401).json({ success: false, message: "Identifiants invalides" });
        }
    });
});

app.listen(3000, () => console.log("Serveur BDD actif sur http://localhost:3000"));