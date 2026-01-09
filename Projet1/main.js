// ================================
// ÉTAPE 1 : SÉLECTION DES ÉLÉMENTS
// ================================

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherDisplay = document.getElementById('weather-display');
const errorMessage = document.getElementById('error-message');
const loader = document.getElementById('loader');

// Éléments d'affichage
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temp');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');


// ================================
// ÉTAPE 2 : CONFIGURATION API
// ================================

const API_KEY = 'a2842902c6529342e4627474e427d73f';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';


// ================================
// ÉTAPE 3 : UTILITAIRES D’AFFICHAGE
// ================================

function showElement(element) {
    element.classList.remove('hidden');
}

function hideElement(element) {
    element.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    showElement(errorMessage);
    hideElement(weatherDisplay);
}


// ================================
// ÉTAPE 4 : APPEL API MÉTÉO
// ================================

function getWeather(city) {
    showElement(loader);
    hideElement(weatherDisplay);
    hideElement(errorMessage);

    const url = `${API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=fr`;

    fetch(url)
        .then(function (response) {
            if (response.status === 401) {
                throw new Error('Clé API invalide ou non activée');
            }
            if (response.status === 404) {
                throw new Error('Ville introuvable');
            }
            if (!response.ok) {
                throw new Error('Erreur serveur');
            }
            return response.json();
        })
        .then(function (data) {
            displayWeather(data);
        })
        .catch(function (error) {
            console.error(error.message);
            showError(error.message);
        })
        .finally(function () {
            hideElement(loader);
        });
}


// ================================
// ÉTAPE 5 : AFFICHAGE DES DONNÉES
// ================================

function displayWeather(data) {
    cityName.textContent = data.name;
    temperature.textContent = Math.round(data.main.temp);
    description.textContent = data.weather[0].description;
    humidity.textContent = data.main.humidity + '%';
    wind.textContent = Math.round(data.wind.speed * 3.6) + ' km/h';

    showElement(weatherDisplay);
    hideElement(errorMessage);
}


// ================================
// ÉTAPE 6 : ÉVÉNEMENTS
// ================================

searchBtn.addEventListener('click', function () {
    const city = cityInput.value.trim();
    if (city !== '') {
        getWeather(city);
    }
});

cityInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city !== '') {
            getWeather(city);
        }
    }
});


// ================================
// ÉTAPE 7 : CHARGEMENT INITIAL
// ================================

document.addEventListener('DOMContentLoaded', function () {
    getWeather('Lomé');
});
