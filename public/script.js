// Cette fonction envoie les identifiants au serveur
async function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });

        const data = await response.json();

        if (data.success) {
            // On enregistre le token dans le navigateur
            localStorage.setItem('myToken', data.token);
            showDashboard(data.token);
        } else {
            errorMsg.innerText = data.message;
        }
    } catch (err) {
        console.error("Erreur de connexion au serveur", err);
    }
}

// Affiche le tableau de bord si le token est valide
function showDashboard(token) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    document.getElementById('display-token').innerText = token;
}

// Supprime le token et déconnecte
function logout() {
    localStorage.removeItem('myToken');
    location.reload();
}

// Vérification automatique au chargement de la page
window.onload = () => {
    const savedToken = localStorage.getItem('myToken');
    if (savedToken) {
        showDashboard(savedToken);
    }
};

let map;
let boatMarker;
let boatPos = [43.2965, 5.3698]; // Coordonnées de départ (ex: Marseille)

function initMap() {
    // Initialise la carte centrée sur le point de départ
    map = L.map('map').setView(boatPos, 10);

    // Charge les "tuiles" (le dessin de la carte)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Crée l'icône du bateau (tu peux utiliser une image ou un marqueur simple)
    boatMarker = L.marker(boatPos).addTo(map)
        .bindPopup('Bateau en mouvement')
        .openPopup();

    // Lance la simulation du déplacement
    simulateMovement();
}

function simulateMovement() {
    setInterval(() => {
        // On simule un petit déplacement (on ajoute un peu à la latitude/longitude)
        boatPos[0] += 0.001; 
        boatPos[1] += 0.002;

        // Met à jour la position du marqueur sur la carte
        boatMarker.setLatLng(boatPos);
        
        // Optionnel : faire suivre la caméra
        // map.panTo(boatPos); 
    }, 1000); // Se déplace toutes les secondes
}

// MODIFICATION de ta fonction existante showDashboard
function showDashboard(token) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    document.getElementById('display-token').innerText = token;
    
    // On attend que le HTML soit affiché pour initialiser la carte
    if (!map) {
        initMap();
    }
}

async function register() {
    const user = document.getElementById('reg-user').value;
    const pass = document.getElementById('reg-pass').value;
    const msg = document.getElementById('error-msg');

    const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
    });

    const data = await response.json();
    msg.innerText = data.message;
    msg.style.color = data.success ? "#10b981" : "#ff4d4d";
}

async function login() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const msg = document.getElementById('error-msg');

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
    });

    const data = await response.json();
    if (data.success) {
        localStorage.setItem('myToken', data.token);
        showDashboard(data.token);
    } else {
        msg.innerText = data.message;
        msg.style.color = "#ff4d4d";
    }
}