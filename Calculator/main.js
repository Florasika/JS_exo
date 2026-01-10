// ========================================
// ÉTAPE 1: SÉLECTION DES ÉLÉMENTS HTML
// ========================================

const previousOperandElement = document.getElementById('previous-operand');
const currentOperandElement = document.getElementById('current-operand');
const numberButtons = document.querySelectorAll('[data-number]');
const operatorButtons = document.querySelectorAll('[data-operator]');
const clearButton = document.querySelector('[data-action="clear"]');
const deleteButton = document.querySelector('[data-action="delete"]');
const equalsButton = document.querySelector('[data-action="equals"]');
const percentageButton = document.querySelector('[data-action="percentage"]');
const historyList = document.getElementById('history-list');
const clearHistoryButton = document.getElementById('clear-history');

// ========================================
// ÉTAPE 2: VARIABLES D'ÉTAT DE LA CALCULATRICE
// ========================================

// État actuel de la calculatrice
let currentOperand = '0';      // Le nombre actuellement affiché
let previousOperand = '';      // Le nombre précédent
let operation = null;          // L'opération en cours (+, -, ×, ÷)
let shouldResetScreen = false; // Si on doit réinitialiser l'écran au prochain nombre

// Historique des calculs
let history = [];

// ========================================
// ÉTAPE 3: FONCTIONS D'AFFICHAGE
// ========================================

// Fonction pour mettre à jour l'affichage
function updateDisplay() {
    // Afficher le nombre actuel
    currentOperandElement.textContent = formatNumber(currentOperand);
    
    // Afficher l'opération précédente
    if (operation != null) {
        previousOperandElement.textContent = `${formatNumber(previousOperand)} ${operation}`;
    } else {
        previousOperandElement.textContent = '';
    }
}

// Fonction pour formater les nombres (ajouter des espaces pour les milliers)
function formatNumber(number) {
    if (number === '') return '';
    
    // Séparer la partie entière et décimale
    const parts = number.toString().split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Formater la partie entière avec des espaces
    let integerDisplay = parseFloat(integerPart).toLocaleString('fr-FR');
    
    // Si c'est NaN, retourner le texte original
    if (isNaN(parseFloat(integerPart))) {
        integerDisplay = integerPart;
    }
    
    // Ajouter la partie décimale si elle existe
    if (decimalPart != null) {
        return `${integerDisplay}.${decimalPart}`;
    } else {
        return integerDisplay;
    }
}

// ========================================
// ÉTAPE 4: FONCTIONS POUR AJOUTER DES NOMBRES
// ========================================

// Fonction pour ajouter un chiffre
function appendNumber(number) {
    // Si on doit réinitialiser l'écran, remplacer par le nouveau nombre
    if (shouldResetScreen) {
        currentOperand = '';
        shouldResetScreen = false;
    }
    
    // Ne pas ajouter plusieurs points décimaux
    if (number === '.' && currentOperand.includes('.')) {
        return;
    }
    
    // Limiter à 15 chiffres
    if (currentOperand.replace('.', '').length >= 15) {
        return;
    }
    
    // Si l'écran affiche 0, remplacer par le nouveau chiffre (sauf si c'est un point)
    if (currentOperand === '0' && number !== '.') {
        currentOperand = number;
    } else {
        currentOperand = currentOperand + number;
    }
    
    updateDisplay();
}

// ========================================
// ÉTAPE 5: FONCTIONS POUR LES OPÉRATIONS
// ========================================

// Fonction pour choisir une opération
function chooseOperation(operator) {
    // Si l'utilisateur a déjà une opération en cours, calculer d'abord
    if (previousOperand !== '' && currentOperand !== '') {
        calculate();
    }
    
    // Définir l'opération
    operation = operator;
    previousOperand = currentOperand;
    shouldResetScreen = true;
    
    updateDisplay();
}

// Fonction pour effectuer le calcul
function calculate() {
    // Variables pour stocker les nombres
    let result;
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    
    // Vérifier que les nombres sont valides
    if (isNaN(prev) || isNaN(current)) {
        return;
    }
    
    // Effectuer le calcul selon l'opération
    switch (operation) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '×':
            result = prev * current;
            break;
        case '÷':
            // Vérifier la division par zéro
            if (current === 0) {
                showError();
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }
    
    // Arrondir le résultat à 10 décimales pour éviter les erreurs de précision
    result = Math.round(result * 10000000000) / 10000000000;
    
    // Sauvegarder dans l'historique
    addToHistory(`${prev} ${operation} ${current} = ${result}`);
    
    // Mettre à jour l'état
    currentOperand = result.toString();
    operation = null;
    previousOperand = '';
    shouldResetScreen = true;
    
    updateDisplay();
}

// ========================================
// ÉTAPE 6: FONCTIONS UTILITAIRES
// ========================================

// Fonction pour tout effacer (AC)
function clear() {
    currentOperand = '0';
    previousOperand = '';
    operation = null;
    shouldResetScreen = false;
    updateDisplay();
}

// Fonction pour effacer le dernier chiffre (DEL)
function deleteNumber() {
    if (shouldResetScreen) {
        return;
    }
    
    // Supprimer le dernier caractère
    currentOperand = currentOperand.slice(0, -1);
    
    // Si vide, afficher 0
    if (currentOperand === '' || currentOperand === '-') {
        currentOperand = '0';
    }
    
    updateDisplay();
}

// Fonction pour calculer le pourcentage
function percentage() {
    const current = parseFloat(currentOperand);
    
    if (isNaN(current)) {
        return;
    }
    
    currentOperand = (current / 100).toString();
    updateDisplay();
}

// Fonction pour afficher une erreur
function showError() {
    currentOperandElement.textContent = 'Erreur';
    currentOperandElement.classList.add('shake');
    
    // Retirer l'animation après 0.3s
    setTimeout(() => {
        currentOperandElement.classList.remove('shake');
        clear();
    }, 1000);
}

// ========================================
// ÉTAPE 7: GESTION DE L'HISTORIQUE
// ========================================

// Fonction pour charger l'historique depuis localStorage
function loadHistory() {
    const savedHistory = localStorage.getItem('calculatorHistory');
    
    if (savedHistory) {
        history = JSON.parse(savedHistory);
    } else {
        history = [];
    }
    
    displayHistory();
}

// Fonction pour sauvegarder l'historique dans localStorage
function saveHistory() {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
}

// Fonction pour ajouter un calcul à l'historique
function addToHistory(calculation) {
    // Ajouter au début du tableau
    history.unshift(calculation);
    
    // Limiter à 50 entrées
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    saveHistory();
    displayHistory();
}

// Fonction pour afficher l'historique
function displayHistory() {
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">Aucun calcul pour le moment</div>';
        return;
    }
    
    history.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.textContent = item;
        
        // Cliquer sur un élément de l'historique pour réutiliser le résultat
        li.addEventListener('click', () => {
            const result = item.split('=')[1].trim();
            currentOperand = result;
            previousOperand = '';
            operation = null;
            shouldResetScreen = true;
            updateDisplay();
        });
        
        historyList.appendChild(li);
    });
}

// Fonction pour effacer l'historique
function clearHistory() {
    if (confirm('Effacer tout l\'historique ?')) {
        history = [];
        saveHistory();
        displayHistory();
    }
}

// ========================================
// ÉTAPE 8: GESTION DES ÉVÉNEMENTS (CLICS)
// ========================================

// Événements pour les chiffres
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        appendNumber(button.dataset.number);
    });
});

// Événements pour les opérateurs
operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        chooseOperation(button.dataset.operator);
    });
});

// Événement pour le bouton égal
equalsButton.addEventListener('click', () => {
    calculate();
});

// Événement pour le bouton clear (AC)
clearButton.addEventListener('click', () => {
    clear();
});

// Événement pour le bouton delete (DEL)
deleteButton.addEventListener('click', () => {
    deleteNumber();
});

// Événement pour le bouton pourcentage
percentageButton.addEventListener('click', () => {
    percentage();
});

// Événement pour effacer l'historique
clearHistoryButton.addEventListener('click', () => {
    clearHistory();
});

// ========================================
// ÉTAPE 9: SUPPORT DU CLAVIER PHYSIQUE
// ========================================

document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    // Chiffres et point décimal
    if ((key >= '0' && key <= '9') || key === '.') {
        appendNumber(key);
    }
    
    // Opérateurs
    if (key === '+' || key === '-') {
        chooseOperation(key);
    }
    
    if (key === '*') {
        chooseOperation('×');
    }
    
    if (key === '/') {
        event.preventDefault(); // Empêcher la recherche dans Firefox
        chooseOperation('÷');
    }
    
    // Touche Entrée ou =
    if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    }
    
    // Touche Échap pour effacer
    if (key === 'Escape') {
        clear();
    }
    
    // Touche Backspace pour supprimer
    if (key === 'Backspace') {
        deleteNumber();
    }
    
    // Touche % pour pourcentage
    if (key === '%') {
        percentage();
    }
});

// ========================================
// ÉTAPE 10: INITIALISATION AU CHARGEMENT
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Charger l'historique
    loadHistory();
    
    // Afficher l'état initial
    updateDisplay();
    
    console.log('✅ Calculatrice chargée avec succès !');
    console.log('📋 Raccourcis clavier disponibles :');
    console.log('   - Chiffres 0-9 : Entrer des nombres');
    console.log('   - + - * / : Opérations');
    console.log('   - Entrée ou = : Calculer');
    console.log('   - Échap : Effacer tout (AC)');
    console.log('   - Backspace : Effacer dernier chiffre (DEL)');
    console.log('   - % : Pourcentage');
});