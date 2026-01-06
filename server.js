const path = require('path');
// Chargement sécurisé du fichier .env
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.json());

// --- CONNEXION BASE DE DONNÉES ---
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('❌ ERREUR BDD :', err.message);
        console.log('Vérifiez le fichier .env ! User:', process.env.DB_USER);
    } else {
        console.log('✅ Connecté à la base MariaDB');
    }
});

// --- ROUTES API ---

// 1. INSCRIPTION
app.post('/api/register', (req, res) => {
    const { prenom, nom, email, mdp } = req.body;
    console.log(`[INSCRIPTION] Demande pour : ${email}`);

    // Attention : La table s'appelle 'User' avec une majuscule dans ta BDD MariaDB
    const query = 'INSERT INTO User (prenom, nom, email, mdp) VALUES (?, ?, ?, ?)';

    db.query(query, [prenom, nom, email, mdp], (err, result) => {
        if (err) {
            console.error("Erreur SQL Register:", err.message);
            return res.status(400).json({ success: false, message: "Erreur ou Email déjà pris." });
        }
        res.json({ success: true, message: "Compte créé avec succès !" });
    });
});

// 2. CONNEXION
app.post('/api/login', (req, res) => {
    const { email, mdp } = req.body;
    console.log(`[LOGIN] Demande pour : ${email}`);

    const query = 'SELECT * FROM User WHERE email = ? AND mdp = ?';

    db.query(query, [email, mdp], (err, results) => {
        if (err) {
            console.error("Erreur SQL Login:", err.message);
            return res.status(500).json({ success: false, message: "Erreur serveur BDD" });
        }

        if (results.length > 0) {
            res.json({ success: true, token: "TOKEN_" + results[0].id });
        } else {
            res.status(401).json({ success: false, message: "Email ou mot de passe incorrect" });
        }
    });
});

// 3. POSITION GPS
app.get('/api/boat-position', (req, res) => {
    const query = 'SELECT latitude, longitude FROM positions_gps ORDER BY date_heure DESC LIMIT 1';
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        if (results.length === 0) return res.status(404).json({ success: false });
        
        res.json({ success: true, position: results[0] });
    });
});

// --- SERVEUR WEB ---
// Servir le dossier 'public' (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Route de secours pour éviter les erreurs "Cannot GET /"
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// DÉMARRAGE
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 SERVEUR ACTIF SUR : http://localhost:${PORT}`);
});