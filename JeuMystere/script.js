// ========================================
// ÉTAPE 1: SÉLECTION DES ÉLÉMENTS HTML
// ========================================

const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const newGameBtn = document.getElementById('new-game-btn');
const hintBtn = document.getElementById('hint-btn');
const playAgainBtn = document.getElementById('play-again-btn');

const feedbackElement = document.getElementById('feedback');
const temperatureElement = document.getElementById('temperature');
const attemptsElement = document.getElementById('attempts');
const bestScoreElement = document.getElementById('best-score');
const winsElement = document.getElementById('wins');
const hintsLeftElement = document.getElementById('hints-left');
const attemptsList = document.getElementById('attempts-list');

const minRangeElement = document.getElementById('min-range');
const maxRangeElement = document.getElementById('max-range');

const victoryModal = document.getElementById('victory-modal');
const victoryMessage = document.getElementById('victory-message');
const victoryNumber = document.getElementById('victory-number');
const victoryAttempts = document.getElementById('victory-attempts');

const difficultyButtons = document.querySelectorAll('.difficulty-btn');

// ========================================
// ÉTAPE 2: VARIABLES DU JEU
// ========================================

// Configuration du jeu
let minNumber = 1;
let maxNumber = 100;
let secretNumber = 0;
let attempts = 0;
let attemptsHistory = [];
let hintsRemaining = 3;
let gameActive = true;

// Niveaux de difficulté
const difficulties = {
    easy: { min: 1, max: 50, hints: 5 },
    medium: { min: 1, max: 100, hints: 3 },
    hard: { min: 1, max: 500, hints: 1 }
};

let currentDifficulty = 'medium';

// Statistiques (sauvegardées dans localStorage)
let stats = {
    bestScore: null,
    totalWins: 0,
    gamesPlayed: 0
};

// ========================================
// ÉTAPE 3: FONCTIONS DE BASE DU JEU
// ========================================

// Fonction pour générer un nombre aléatoire
function generateRandomNumber(min, max) {
    // Math.random() génère un nombre entre 0 et 1
    // On multiplie par (max - min + 1) pour avoir la plage souhaitée
    // On ajoute min pour décaler dans la bonne plage
    // Math.floor() pour arrondir à l'entier inférieur
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fonction pour initialiser une nouvelle partie
function startNewGame() {
    // 1. Récupérer la configuration de difficulté
    const config = difficulties[currentDifficulty];
    minNumber = config.min;
    maxNumber = config.max;
    hintsRemaining = config.hints;
    
    // 2. Générer le nombre secret
    secretNumber = generateRandomNumber(minNumber, maxNumber);
    
    // 3. Réinitialiser les variables du jeu
    attempts = 0;
    attemptsHistory = [];
    gameActive = true;
    
    // 4. Mettre à jour l'interface
    updateDisplay();
    guessInput.value = '';
    guessInput.disabled = false;
    guessBtn.disabled = false;
    hintBtn.disabled = false;
    
    // 5. Afficher le message de départ
    showFeedback('🎯 Entrez votre premier nombre !', 'info');
    temperatureElement.textContent = '';
    
    // 6. Vider l'historique
    attemptsList.innerHTML = '<div class="attempts-empty">Aucune tentative pour le moment</div>';
    
    // 7. Focus sur l'input
    guessInput.focus();
    
    // Pour le développement (à retirer en production)
    console.log(`🎲 Nombre secret: ${secretNumber}`);
}

// ========================================
// ÉTAPE 4: FONCTION PRINCIPALE - DEVINER
// ========================================

function makeGuess() {
    // 1. Récupérer la valeur entrée
    const userGuess = parseInt(guessInput.value);
    
    // 2. Valider l'entrée
    if (!validateInput(userGuess)) {
        return;
    }
    
    // 3. Incrémenter le nombre de tentatives
    attempts++;
    
    // 4. Comparer avec le nombre secret
    if (userGuess === secretNumber) {
        handleVictory();
    } else if (userGuess < secretNumber) {
        handleTooLow(userGuess);
    } else {
        handleTooHigh(userGuess);
    }
    
    // 5. Mettre à jour l'affichage
    updateDisplay();
    
    // 6. Vider l'input et le focus
    guessInput.value = '';
    guessInput.focus();
}

// ========================================
// ÉTAPE 5: VALIDATION DE L'ENTRÉE
// ========================================

function validateInput(guess) {
    // Vérifier si c'est un nombre
    if (isNaN(guess)) {
        showFeedback('⚠️ Veuillez entrer un nombre valide !', 'warning');
        guessInput.classList.add('shake');
        setTimeout(() => guessInput.classList.remove('shake'), 300);
        return false;
    }
    
    // Vérifier si c'est dans la plage
    if (guess < minNumber || guess > maxNumber) {
        showFeedback(`⚠️ Le nombre doit être entre ${minNumber} et ${maxNumber} !`, 'warning');
        guessInput.classList.add('shake');
        setTimeout(() => guessInput.classList.remove('shake'), 300);
        return false;
    }
    
    // Vérifier si le nombre a déjà été essayé
    if (attemptsHistory.some(item => item.guess === guess)) {
        showFeedback('⚠️ Vous avez déjà essayé ce nombre !', 'warning');
        guessInput.classList.add('shake');
        setTimeout(() => guessInput.classList.remove('shake'), 300);
        return false;
    }
    
    return true;
}

// ========================================
// ÉTAPE 6: GESTION DES DIFFÉRENTS CAS
// ========================================

// Cas 1: Nombre trop bas
function handleTooLow(guess) {
    const difference = secretNumber - guess;
    const message = `📉 C'est trop petit !`;
    
    showFeedback(message, 'info');
    showTemperature(difference);
    
    // Ajouter à l'historique
    addToHistory(guess, 'too-low', 'Trop petit');
}

// Cas 2: Nombre trop haut
function handleTooHigh(guess) {
    const difference = guess - secretNumber;
    const message = `📈 C'est trop grand !`;
    
    showFeedback(message, 'danger');
    showTemperature(difference);
    
    // Ajouter à l'historique
    addToHistory(guess, 'too-high', 'Trop grand');
}

// Cas 3: Victoire !
function handleVictory() {
    gameActive = false;
    
    // Désactiver les inputs
    guessInput.disabled = true;
    guessBtn.disabled = true;
    hintBtn.disabled = true;
    
    // Mettre à jour les statistiques
    updateStats();
    
    // Afficher le feedback
    showFeedback('🎉 Bravo ! Vous avez trouvé le nombre !', 'success');
    temperatureElement.textContent = '🔥🔥🔥';
    
    // Ajouter à l'historique
    addToHistory(secretNumber, 'success', '✓ Trouvé !');
    
    // Afficher la modal de victoire avec un léger délai
    setTimeout(() => {
        showVictoryModal();
    }, 500);
}

// ========================================
// ÉTAPE 7: SYSTÈME DE TEMPÉRATURE (CHAUD/FROID)
// ========================================

function showTemperature(difference) {
    let emoji = '';
    
    // Calculer le pourcentage de la différence par rapport à la plage
    const range = maxNumber - minNumber;
    const percentage = (difference / range) * 100;
    
    if (percentage <= 2) {
        emoji = '🔥🔥🔥'; // Très chaud
    } else if (percentage <= 5) {
        emoji = '🔥🔥'; // Chaud
    } else if (percentage <= 10) {
        emoji = '🔥'; // Tiède
    } else if (percentage <= 20) {
        emoji = '😐'; // Moyen
    } else if (percentage <= 40) {
        emoji = '❄️'; // Froid
    } else {
        emoji = '❄️❄️'; // Très froid
    }
    
    temperatureElement.textContent = emoji;
}

// ========================================
// ÉTAPE 8: SYSTÈME D'INDICES
// ========================================

function giveHint() {
    if (hintsRemaining <= 0) {
        showFeedback('⚠️ Plus d\'indices disponibles !', 'warning');
        return;
    }
    
    hintsRemaining--;
    
    // Générer un indice aléatoire
    const hintType = Math.floor(Math.random() * 3);
    let hintMessage = '';
    
    switch (hintType) {
        case 0:
            // Indice: pair ou impair
            const parity = secretNumber % 2 === 0 ? 'pair' : 'impair';
            hintMessage = `💡 Le nombre est ${parity}`;
            break;
        case 1:
            // Indice: plage réduite
            const mid = Math.floor((minNumber + maxNumber) / 2);
            if (secretNumber <= mid) {
                hintMessage = `💡 Le nombre est entre ${minNumber} et ${mid}`;
            } else {
                hintMessage = `💡 Le nombre est entre ${mid + 1} et ${maxNumber}`;
            }
            break;
        case 2:
            // Indice: divisible par...
            const divisors = [2, 3, 5, 10];
            for (let divisor of divisors) {
                if (secretNumber % divisor === 0) {
                    hintMessage = `💡 Le nombre est divisible par ${divisor}`;
                    break;
                }
            }
            if (hintMessage === '') {
                hintMessage = `💡 Le nombre n'est divisible ni par 2, 3, 5, ni par 10`;
            }
            break;
    }
    
    showFeedback(hintMessage, 'warning');
    updateDisplay();
    
    if (hintsRemaining === 0) {
        hintBtn.disabled = true;
    }
}

// ========================================
// ÉTAPE 9: GESTION DE L'HISTORIQUE
// ========================================

function addToHistory(guess, type, feedback) {
    // Ajouter au tableau
    attemptsHistory.unshift({ guess, type, feedback });
    
    // Mettre à jour l'affichage
    displayHistory();
}

function displayHistory() {
    attemptsList.innerHTML = '';
    
    if (attemptsHistory.length === 0) {
        attemptsList.innerHTML = '<div class="attempts-empty">Aucune tentative pour le moment</div>';
        return;
    }
    
    attemptsHistory.forEach(item => {
        const div = document.createElement('div');
        div.className = `attempt-item ${item.type}`;
        div.innerHTML = `
            <span class="attempt-number">${item.guess}</span>
            <span class="attempt-feedback">${item.feedback}</span>
        `;
        attemptsList.appendChild(div);
    });
}

// ========================================
// ÉTAPE 10: GESTION DES STATISTIQUES
// ========================================

function loadStats() {
    const savedStats = localStorage.getItem('mysteryNumberStats');
    
    if (savedStats) {
        stats = JSON.parse(savedStats);
    }
    
    updateStatsDisplay();
}

function saveStats() {
    localStorage.setItem('mysteryNumberStats', JSON.stringify(stats));
}

function updateStats() {
    stats.totalWins++;
    stats.gamesPlayed++;
    
    // Mettre à jour le meilleur score
    if (stats.bestScore === null || attempts < stats.bestScore) {
        stats.bestScore = attempts;
    }
    
    saveStats();
    updateStatsDisplay();
}

function updateStatsDisplay() {
    bestScoreElement.textContent = stats.bestScore !== null ? stats.bestScore : '-';
    winsElement.textContent = stats.totalWins;
}

// ========================================
// ÉTAPE 11: FONCTIONS D'AFFICHAGE
// ========================================

function updateDisplay() {
    attemptsElement.textContent = attempts;
    hintsLeftElement.textContent = hintsRemaining;
    minRangeElement.textContent = minNumber;
    maxRangeElement.textContent = maxNumber;
}

function showFeedback(message, type) {
    feedbackElement.textContent = message;
    feedbackElement.className = `feedback ${type}`;
}

function showVictoryModal() {
    victoryNumber.textContent = secretNumber;
    victoryAttempts.textContent = `${attempts} tentative${attempts > 1 ? 's' : ''}`;
    
    let message = '';
    if (attempts === 1) {
        message = '🏆 Incroyable ! Du premier coup !';
    } else if (attempts <= 3) {
        message = '⭐ Excellent ! Très rapide !';
    } else if (attempts <= 7) {
        message = '👍 Bien joué !';
    } else {
        message = '✓ Vous avez trouvé !';
    }
    
    victoryMessage.textContent = message;
    victoryModal.classList.remove('hidden');
}

function hideVictoryModal() {
    victoryModal.classList.add('hidden');
}

// ========================================
// ÉTAPE 12: CHANGEMENT DE DIFFICULTÉ
// ========================================

function changeDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    // Mettre à jour les boutons de difficulté
    difficultyButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.difficulty === difficulty) {
            btn.classList.add('active');
        }
    });
    
    // Démarrer une nouvelle partie avec la nouvelle difficulté
    startNewGame();
}

// ========================================
// ÉTAPE 13: GESTION DES ÉVÉNEMENTS
// ========================================

// Clic sur le bouton "Deviner"
guessBtn.addEventListener('click', () => {
    if (gameActive) {
        makeGuess();
    }
});

// Touche "Entrée" dans l'input
guessInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && gameActive) {
        makeGuess();
    }
});

// Clic sur "Nouvelle partie"
newGameBtn.addEventListener('click', () => {
    startNewGame();
});

// Clic sur "Rejouer" (modal)
playAgainBtn.addEventListener('click', () => {
    hideVictoryModal();
    startNewGame();
});

// Clic sur le bouton "Indice"
hintBtn.addEventListener('click', () => {
    giveHint();
});

// Changement de difficulté
difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        changeDifficulty(btn.dataset.difficulty);
    });
});

// Clic en dehors de la modal pour la fermer
victoryModal.addEventListener('click', (event) => {
    if (event.target === victoryModal) {
        hideVictoryModal();
        startNewGame();
    }
});

// ========================================
// ÉTAPE 14: INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Charger les statistiques
    loadStats();
    
    // Démarrer une nouvelle partie
    startNewGame();
    
    console.log('✅ Jeu du nombre mystère chargé !');
    console.log('🎮 Bonne chance !');
});
