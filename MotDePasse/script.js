// ========================================
// ÉTAPE 1: SÉLECTION DES ÉLÉMENTS HTML
// ========================================

const passwordOutput = document.getElementById('password-output');
const copyBtn = document.getElementById('copy-btn');
const generateBtn = document.getElementById('generate-btn');
const lengthSlider = document.getElementById('length-slider');
const lengthValue = document.getElementById('length-value');

// Checkboxes pour les types de caractères
const includeUppercase = document.getElementById('include-uppercase');
const includeLowercase = document.getElementById('include-lowercase');
const includeNumbers = document.getElementById('include-numbers');
const includeSymbols = document.getElementById('include-symbols');

// Options avancées
const excludeAmbiguous = document.getElementById('exclude-ambiguous');
const noRepeat = document.getElementById('no-repeat');

// Indicateur de force
const strengthFill = document.getElementById('strength-fill');
const strengthText = document.getElementById('strength-text');

// Historique
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');

// Toast
const toast = document.getElementById('toast');

// ========================================
// ÉTAPE 2: DÉFINITION DES ENSEMBLES DE CARACTÈRES
// ========================================

// Ensembles de base
const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Caractères ambigus (qui peuvent être confondus)
const ambiguousChars = 'il1Lo0O';

// ========================================
// ÉTAPE 3: VARIABLES GLOBALES
// ========================================

let currentPassword = '';
let passwordHistory = [];

// ========================================
// ÉTAPE 4: FONCTION PRINCIPALE - GÉNÉRER LE MOT DE PASSE
// ========================================

function generatePassword() {
    // 1. Récupérer les paramètres
    const length = parseInt(lengthSlider.value);
    const useUppercase = includeUppercase.checked;
    const useLowercase = includeLowercase.checked;
    const useNumbers = includeNumbers.checked;
    const useSymbols = includeSymbols.checked;
    const excludeAmbig = excludeAmbiguous.checked;
    const noRepeatChars = noRepeat.checked;
    
    // 2. Valider qu'au moins un type est sélectionné
    if (!useUppercase && !useLowercase && !useNumbers && !useSymbols) {
        showToast('⚠️ Sélectionnez au moins un type de caractère !');
        return;
    }
    
    // 3. Construire l'ensemble de caractères disponibles
    let availableChars = '';
    
    if (useUppercase) availableChars += charSets.uppercase;
    if (useLowercase) availableChars += charSets.lowercase;
    if (useNumbers) availableChars += charSets.numbers;
    if (useSymbols) availableChars += charSets.symbols;
    
    // 4. Retirer les caractères ambigus si demandé
    if (excludeAmbig) {
        availableChars = removeAmbiguousChars(availableChars);
    }
    
    // 5. Vérifier qu'il y a assez de caractères pour "no repeat"
    if (noRepeatChars && length > availableChars.length) {
        showToast('⚠️ Pas assez de caractères uniques disponibles !');
        return;
    }
    
    // 6. Générer le mot de passe
    let password = '';
    
    if (noRepeatChars) {
        // Sans répétition : mélanger et prendre les N premiers
        password = shuffleString(availableChars).substring(0, length);
    } else {
        // Avec répétition possible
        for (let i = 0; i < length; i++) {
            const randomIndex = getRandomInt(0, availableChars.length - 1);
            password += availableChars[randomIndex];
        }
    }
    
    // 7. S'assurer qu'au moins un caractère de chaque type sélectionné est présent
    password = ensureCharacterTypes(password, useUppercase, useLowercase, useNumbers, useSymbols, availableChars);
    
    // 8. Afficher le mot de passe
    currentPassword = password;
    passwordOutput.value = password;
    
    // 9. Évaluer la force
    evaluatePasswordStrength(password);
    
    // 10. Ajouter à l'historique
    addToHistory(password);
}

// ========================================
// ÉTAPE 5: FONCTION POUR GÉNÉRER UN NOMBRE ALÉATOIRE
// ========================================

function getRandomInt(min, max) {
    // Utiliser crypto.getRandomValues pour plus de sécurité
    // (meilleur que Math.random() pour les mots de passe)
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    
    // Convertir en nombre dans la plage [min, max]
    return min + (array[0] % (max - min + 1));
}

// ========================================
// ÉTAPE 6: FONCTIONS UTILITAIRES
// ========================================

// Retirer les caractères ambigus d'une chaîne
function removeAmbiguousChars(str) {
    let result = '';
    
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        // Si le caractère n'est pas dans la liste des ambigus, l'ajouter
        if (!ambiguousChars.includes(char)) {
            result += char;
        }
    }
    
    return result;
}

// Mélanger une chaîne de caractères (algorithme Fisher-Yates)
function shuffleString(str) {
    // Convertir la chaîne en tableau
    const array = str.split('');
    
    // Algorithme de mélange
    for (let i = array.length - 1; i > 0; i--) {
        const j = getRandomInt(0, i);
        
        // Échanger les éléments
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    
    // Reconvertir en chaîne
    return array.join('');
}

// S'assurer qu'au moins un caractère de chaque type est présent
function ensureCharacterTypes(password, useUpper, useLower, useNum, useSym, availableChars) {
    // Convertir en tableau pour manipulation
    let passArray = password.split('');
    let position = 0;
    
    // Vérifier et ajouter majuscule si nécessaire
    if (useUpper && !hasUppercase(password)) {
        const upperChars = charSets.uppercase.split('').filter(c => availableChars.includes(c));
        passArray[position] = upperChars[getRandomInt(0, upperChars.length - 1)];
        position++;
    }
    
    // Vérifier et ajouter minuscule si nécessaire
    if (useLower && !hasLowercase(password)) {
        const lowerChars = charSets.lowercase.split('').filter(c => availableChars.includes(c));
        passArray[position] = lowerChars[getRandomInt(0, lowerChars.length - 1)];
        position++;
    }
    
    // Vérifier et ajouter chiffre si nécessaire
    if (useNum && !hasNumber(password)) {
        const numChars = charSets.numbers.split('').filter(c => availableChars.includes(c));
        passArray[position] = numChars[getRandomInt(0, numChars.length - 1)];
        position++;
    }
    
    // Vérifier et ajouter symbole si nécessaire
    if (useSym && !hasSymbol(password)) {
        const symChars = charSets.symbols.split('').filter(c => availableChars.includes(c));
        passArray[position] = symChars[getRandomInt(0, symChars.length - 1)];
        position++;
    }
    
    // Mélanger à nouveau pour éviter un pattern prévisible
    return shuffleString(passArray.join(''));
}

// Fonctions de vérification
function hasUppercase(str) {
    return /[A-Z]/.test(str);
}

function hasLowercase(str) {
    return /[a-z]/.test(str);
}

function hasNumber(str) {
    return /[0-9]/.test(str);
}

function hasSymbol(str) {
    return /[^A-Za-z0-9]/.test(str);
}

// ========================================
// ÉTAPE 7: ÉVALUATION DE LA FORCE DU MOT DE PASSE
// ========================================

function evaluatePasswordStrength(password) {
    let score = 0;
    
    // Critère 1: Longueur
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    
    // Critère 2: Diversité des caractères
    if (hasUppercase(password)) score++;
    if (hasLowercase(password)) score++;
    if (hasNumber(password)) score++;
    if (hasSymbol(password)) score++;
    
    // Critère 3: Pas de patterns évidents
    if (!hasSequentialChars(password)) score++;
    if (!hasRepeatingChars(password)) score++;
    
    // Déterminer le niveau de force
    let strength = '';
    
    if (score <= 3) {
        strength = 'weak';
    } else if (score <= 5) {
        strength = 'fair';
    } else if (score <= 7) {
        strength = 'good';
    } else {
        strength = 'strong';
    }
    
    // Mettre à jour l'affichage
    updateStrengthIndicator(strength);
}

// Vérifier les caractères séquentiels (abc, 123, etc.)
function hasSequentialChars(str) {
    for (let i = 0; i < str.length - 2; i++) {
        const char1 = str.charCodeAt(i);
        const char2 = str.charCodeAt(i + 1);
        const char3 = str.charCodeAt(i + 2);
        
        if (char2 === char1 + 1 && char3 === char2 + 1) {
            return true;
        }
    }
    return false;
}

// Vérifier les caractères répétés (aaa, 111, etc.)
function hasRepeatingChars(str) {
    for (let i = 0; i < str.length - 2; i++) {
        if (str[i] === str[i + 1] && str[i] === str[i + 2]) {
            return true;
        }
    }
    return false;
}

// Mettre à jour l'indicateur visuel de force
function updateStrengthIndicator(strength) {
    // Retirer toutes les classes précédentes
    strengthFill.className = 'strength-fill';
    strengthText.className = 'strength-text';
    
    // Ajouter la classe correspondante
    strengthFill.classList.add(strength);
    strengthText.classList.add(strength);
    
    // Texte correspondant
    const strengthTexts = {
        weak: 'Faible 😟',
        fair: 'Moyen 😐',
        good: 'Bon 😊',
        strong: 'Fort 💪'
    };
    
    strengthText.textContent = strengthTexts[strength];
}

// ========================================
// ÉTAPE 8: COPIER DANS LE PRESSE-PAPIERS
// ========================================

function copyToClipboard(text) {
    // Méthode moderne avec l'API Clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showToast('✓ Mot de passe copié !');
            })
            .catch(() => {
                // Fallback si l'API échoue
                fallbackCopy(text);
            });
    } else {
        // Fallback pour les navigateurs plus anciens
        fallbackCopy(text);
    }
}

// Méthode de copie alternative
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showToast('✓ Mot de passe copié !');
    } catch (err) {
        showToast('❌ Impossible de copier');
    }
    
    document.body.removeChild(textarea);
}

// ========================================
// ÉTAPE 9: GESTION DE L'HISTORIQUE
// ========================================

function loadHistory() {
    const savedHistory = localStorage.getItem('passwordHistory');
    
    if (savedHistory) {
        passwordHistory = JSON.parse(savedHistory);
    } else {
        passwordHistory = [];
    }
    
    displayHistory();
}

function saveHistory() {
    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
}

function addToHistory(password) {
    // Ajouter au début du tableau
    passwordHistory.unshift(password);
    
    // Limiter à 10 entrées
    if (passwordHistory.length > 10) {
        passwordHistory = passwordHistory.slice(0, 10);
    }
    
    saveHistory();
    displayHistory();
}

function displayHistory() {
    historyList.innerHTML = '';
    
    if (passwordHistory.length === 0) {
        historyList.innerHTML = '<div class="history-empty">Aucun mot de passe généré</div>';
        return;
    }
    
    passwordHistory.forEach((password, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <span class="history-password">${password}</span>
            <button class="history-copy-btn" data-password="${password}">Copier</button>
        `;
        
        // Événement de copie
        const copyBtn = div.querySelector('.history-copy-btn');
        copyBtn.addEventListener('click', () => {
            copyToClipboard(password);
        });
        
        historyList.appendChild(div);
    });
}

function clearHistory() {
    if (confirm('Effacer tout l\'historique ?')) {
        passwordHistory = [];
        saveHistory();
        displayHistory();
        showToast('✓ Historique effacé');
    }
}

// ========================================
// ÉTAPE 10: AFFICHER UNE NOTIFICATION TOAST
// ========================================

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    
    // Masquer après 3 secondes
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ========================================
// ÉTAPE 11: GESTION DES ÉVÉNEMENTS
// ========================================

// Mise à jour de l'affichage de la longueur
lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
});

// Génération du mot de passe
generateBtn.addEventListener('click', () => {
    generatePassword();
});

// Copie du mot de passe
copyBtn.addEventListener('click', () => {
    if (currentPassword) {
        copyToClipboard(currentPassword);
    } else {
        showToast('⚠️ Générez d\'abord un mot de passe !');
    }
});

// Effacer l'historique
clearHistoryBtn.addEventListener('click', () => {
    clearHistory();
});

// Génération automatique au changement d'options
const allOptions = [
    includeUppercase, includeLowercase, includeNumbers, includeSymbols,
    excludeAmbiguous, noRepeat, lengthSlider
];

allOptions.forEach(option => {
    option.addEventListener('change', () => {
        if (currentPassword) {
            generatePassword();
        }
    });
});

// Support du clavier
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        generatePassword();
    }
    
    if (event.ctrlKey && event.key === 'c' && currentPassword) {
        copyToClipboard(currentPassword);
    }
});

// ========================================
// ÉTAPE 12: INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Charger l'historique
    loadHistory();
    
    // Générer un premier mot de passe
    generatePassword();
    
    console.log('✅ Générateur de mot de passe chargé !');
    console.log('🔐 Utilisez des mots de passe forts et uniques !');
});