// =========================================================
// 1. FONCTION INSCRIPTION (REGISTER)
// =========================================================
async function register() {
    const elPrenom = document.getElementById('reg-prenom');
    const elNom = document.getElementById('reg-nom');
    const elEmail = document.getElementById('reg-email');
    const elMdp = document.getElementById('reg-mdp');
    const msg = document.getElementById('error-msg');

    if (!elPrenom.value || !elNom.value || !elEmail.value || !elMdp.value) {
        msg.innerText = "Veuillez remplir tous les champs.";
        msg.style.color = "orange";
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prenom: elPrenom.value,
                nom: elNom.value,
                email: elEmail.value,
                mdp: elMdp.value
            })
        });

        const data = await response.json();
        msg.innerText = data.message;
        msg.style.color = data.success ? "#10b981" : "#ff4d4d";

        if (data.success) {
            elPrenom.value = ""; elNom.value = ""; elEmail.value = ""; elMdp.value = "";
        }
    } catch (err) {
        console.error(err);
        msg.innerText = "Erreur serveur.";
    }
}

// =========================================================
// 2. FONCTION CONNEXION (LOGIN)
// =========================================================
async function login() {
    const elEmail = document.getElementById('login-email');
    const elMdp = document.getElementById('login-mdp');
    const msg = document.getElementById('error-msg');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: elEmail.value, mdp: elMdp.value })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('myToken', data.token);
            showDashboard(data.token);
        } else {
            msg.innerText = data.message;
            msg.style.color = "#ff4d4d";
        }
    } catch (err) {
        console.error(err);
        msg.innerText = "Impossible de joindre le serveur.";
    }
}

// =========================================================
// 3. GESTION DASHBOARD & CARTE (MODE DÉMO)
// =========================================================
let map;
let boatMarker;
// Point de départ (Marseille)
let boatPos = [43.2965, 5.3698]; 

function showDashboard(token) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    document.getElementById('display-token').innerText = token;

    // On lance la carte
    if (!map) setTimeout(initMap, 300);
}

function initMap() {
    if (map) return; // Sécurité pour ne pas créer 2 cartes

    map = L.map('map').setView(boatPos, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    const boatIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/2904/2904913.png',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    boatMarker = L.marker(boatPos, { icon: boatIcon }).addTo(map)
        .bindPopup('<b>Navire G-Deux</b><br>Mode : Simulation')
        .openPopup();

    // On lance l'animation locale
    simulateMovement();
}

function simulateMovement() {
    console.log("Démarrage de la simulation locale...");
    
    // Cette boucle tourne toutes les 1 seconde (1000ms)
    setInterval(() => {
        // --- CALCUL MATHÉMATIQUE (SIMULATION) ---
        // On modifie légèrement la latitude et la longitude
        // pour faire croire que le bateau avance.
        boatPos[0] += 0.0005; // Monte vers le Nord
        boatPos[1] += 0.0003; // Va vers l'Est

        // 1. On bouge le marqueur
        boatMarker.setLatLng(boatPos);
        
        // 2. On centre la caméra sur le bateau (optionnel, supprime si ça bouge trop)
        map.panTo(boatPos);

        console.log("Nouvelle position simulée :", boatPos);
        
    }, 1000); 
}

function logout() {
    localStorage.removeItem('myToken');
    location.reload();
}

// Vérification connexion automatique
window.onload = () => {
    const savedToken = localStorage.getItem('myToken');
    if (savedToken) showDashboard(savedToken);
};