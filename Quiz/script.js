// ========================================
// ÉTAPE 1: SÉLECTION DES ÉLÉMENTS HTML
// ========================================

// Écrans
const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');

// Boutons écran d'accueil
const startBtn = document.getElementById('start-btn');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const categorySelect = document.getElementById('category-select');

// Éléments du quiz
const currentQuestionElement = document.getElementById('current-question');
const totalQuestionsElement = document.getElementById('total-questions');
const currentScoreElement = document.getElementById('current-score');
const timerText = document.getElementById('timer-text');
const timerProgress = document.getElementById('timer-progress');
const progressFill = document.getElementById('progress-fill');
const questionCategoryElement = document.getElementById('question-category');
const questionText = document.getElementById('question-text');
const answersContainer = document.getElementById('answers-container');
const feedbackElement = document.getElementById('feedback');
const feedbackIcon = document.getElementById('feedback-icon');
const feedbackText = document.getElementById('feedback-text');

// Éléments des résultats
const resultsEmoji = document.getElementById('results-emoji');
const resultsTitle = document.getElementById('results-title');
const finalScore = document.getElementById('final-score');
const finalPercentage = document.getElementById('final-percentage');
const correctCount = document.getElementById('correct-count');
const incorrectCount = document.getElementById('incorrect-count');
const avgTime = document.getElementById('avg-time');
const reviewList = document.getElementById('review-list');
const retryBtn = document.getElementById('retry-btn');
const homeBtn = document.getElementById('home-btn');
const bestScoresList = document.getElementById('best-scores-list');

// ========================================
// ÉTAPE 2: BASE DE DONNÉES DES QUESTIONS
// ========================================

const questionsDatabase = [
    // Sciences
    {
        category: 'science',
        question: 'Quelle est la vitesse de la lumière dans le vide ?',
        answers: ['300 000 km/s', '150 000 km/s', '500 000 km/s', '100 000 km/s'],
        correct: 0
    },
    {
        category: 'science',
        question: 'Combien de planètes compte notre système solaire ?',
        answers: ['7', '8', '9', '10'],
        correct: 1
    },
    {
        category: 'science',
        question: 'Quel est le symbole chimique de l\'or ?',
        answers: ['Or', 'Au', 'Ag', 'Go'],
        correct: 1
    },
    {
        category: 'science',
        question: 'Quelle est la température d\'ébullition de l\'eau au niveau de la mer ?',
        answers: ['90°C', '95°C', '100°C', '105°C'],
        correct: 2
    },
    {
        category: 'science',
        question: 'Quel organe produit l\'insuline ?',
        answers: ['Le foie', 'Le pancréas', 'Les reins', 'L\'estomac'],
        correct: 1
    },
    
    // Histoire
    {
        category: 'history',
        question: 'En quelle année a eu lieu la Révolution française ?',
        answers: ['1789', '1799', '1776', '1804'],
        correct: 0
    },
    {
        category: 'history',
        question: 'Qui a découvert l\'Amérique en 1492 ?',
        answers: ['Magellan', 'Vasco de Gama', 'Christophe Colomb', 'Marco Polo'],
        correct: 2
    },
    {
        category: 'history',
        question: 'Quelle était la durée de la Seconde Guerre mondiale ?',
        answers: ['4 ans', '5 ans', '6 ans', '7 ans'],
        correct: 2
    },
    {
        category: 'history',
        question: 'Qui a peint la Joconde ?',
        answers: ['Michel-Ange', 'Raphaël', 'Léonard de Vinci', 'Donatello'],
        correct: 2
    },
    {
        category: 'history',
        question: 'En quelle année l\'homme a-t-il marché sur la Lune pour la première fois ?',
        answers: ['1965', '1967', '1969', '1971'],
        correct: 2
    },
    
    // Géographie
    {
        category: 'geography',
        question: 'Quelle est la capitale de l\'Australie ?',
        answers: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
        correct: 2
    },
    {
        category: 'geography',
        question: 'Quel est le plus long fleuve du monde ?',
        answers: ['Le Nil', 'L\'Amazone', 'Le Yangtsé', 'Le Mississippi'],
        correct: 0
    },
    {
        category: 'geography',
        question: 'Combien de continents y a-t-il sur Terre ?',
        answers: ['5', '6', '7', '8'],
        correct: 2
    },
    {
        category: 'geography',
        question: 'Quelle est la plus haute montagne du monde ?',
        answers: ['K2', 'Mont Everest', 'Kangchenjunga', 'Makalu'],
        correct: 1
    },
    {
        category: 'geography',
        question: 'Quel océan borde la côte ouest de l\'Afrique ?',
        answers: ['Océan Indien', 'Océan Pacifique', 'Océan Atlantique', 'Océan Arctique'],
        correct: 2
    },
    
    // Culture générale
    {
        category: 'culture',
        question: 'Combien de touches a un piano standard ?',
        answers: ['76', '82', '88', '92'],
        correct: 2
    },
    {
        category: 'culture',
        question: 'Qui a écrit "Les Misérables" ?',
        answers: ['Émile Zola', 'Victor Hugo', 'Balzac', 'Flaubert'],
        correct: 1
    },
    {
        category: 'culture',
        question: 'Quelle est la langue la plus parlée au monde ?',
        answers: ['Anglais', 'Espagnol', 'Mandarin', 'Hindi'],
        correct: 2
    },
    {
        category: 'culture',
        question: 'Combien de cordes a une guitare classique ?',
        answers: ['4', '5', '6', '7'],
        correct: 2
    },
    {
        category: 'culture',
        question: 'Quel est le plus grand pays du monde par superficie ?',
        answers: ['Canada', 'Chine', 'États-Unis', 'Russie'],
        correct: 3
    }
];

// ========================================
// ÉTAPE 3: VARIABLES GLOBALES DU JEU
// ========================================

// Configuration de difficulté
const difficulties = {
    easy: { questions: 10, timePerQuestion: 30 },
    medium: { questions: 15, timePerQuestion: 20 },
    hard: { questions: 20, timePerQuestion: 15 }
};

// État du jeu
let currentDifficulty = 'easy';
let selectedCategory = 'all';
let gameQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 30;
let timerInterval = null;
let questionStartTime = 0;
let answersHistory = [];

// Constantes pour le timer circulaire
const CIRCLE_RADIUS = 35;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

// ========================================
// ÉTAPE 4: FONCTIONS DE NAVIGATION
// ========================================

function showScreen(screen) {
    welcomeScreen.classList.remove('active');
    quizScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    
    screen.classList.add('active');
}

// ========================================
// ÉTAPE 5: INITIALISATION DU JEU
// ========================================

function startQuiz() {
    // 1. Réinitialiser les variables
    currentQuestionIndex = 0;
    score = 0;
    answersHistory = [];
    
    // 2. Filtrer les questions selon la catégorie
    let filteredQuestions = questionsDatabase;
    
    if (selectedCategory !== 'all') {
        filteredQuestions = questionsDatabase.filter(q => q.category === selectedCategory);
    }
    
    // 3. Mélanger les questions
    const shuffled = shuffleArray([...filteredQuestions]);
    
    // 4. Sélectionner le nombre de questions selon la difficulté
    const config = difficulties[currentDifficulty];
    gameQuestions = shuffled.slice(0, Math.min(config.questions, shuffled.length));
    
    // 5. Vérifier qu'il y a assez de questions
    if (gameQuestions.length === 0) {
        alert('Pas assez de questions dans cette catégorie !');
        return;
    }
    
    // 6. Mettre à jour l'affichage
    totalQuestionsElement.textContent = gameQuestions.length;
    currentScoreElement.textContent = score;
    
    // 7. Afficher l'écran du quiz
    showScreen(quizScreen);
    
    // 8. Charger la première question
    loadQuestion();
}

// ========================================
// ÉTAPE 6: MÉLANGER UN TABLEAU (Fisher-Yates)
// ========================================

function shuffleArray(array) {
    const newArray = [...array];
    
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        
        // Échanger les éléments
        const temp = newArray[i];
        newArray[i] = newArray[j];
        newArray[j] = temp;
    }
    
    return newArray;
}

// ========================================
// ÉTAPE 7: CHARGER UNE QUESTION
// ========================================

function loadQuestion() {
    // 1. Récupérer la question actuelle
    const question = gameQuestions[currentQuestionIndex];
    
    // 2. Réinitialiser le timer
    const config = difficulties[currentDifficulty];
    timeLeft = config.timePerQuestion;
    questionStartTime = Date.now();
    
    // 3. Mettre à jour l'affichage
    currentQuestionElement.textContent = currentQuestionIndex + 1;
    questionText.textContent = question.question;
    
    // 4. Afficher la catégorie
    const categoryNames = {
        science: 'Sciences',
        history: 'Histoire',
        geography: 'Géographie',
        culture: 'Culture générale'
    };
    questionCategoryElement.textContent = categoryNames[question.category];
    
    // 5. Afficher les réponses
    displayAnswers(question);
    
    // 6. Mettre à jour la barre de progression
    const progress = ((currentQuestionIndex + 1) / gameQuestions.length) * 100;
    progressFill.style.width = progress + '%';
    
    // 7. Cacher le feedback
    feedbackElement.classList.add('hidden');
    
    // 8. Démarrer le timer
    startTimer();
}

// ========================================
// ÉTAPE 8: AFFICHER LES RÉPONSES
// ========================================

function displayAnswers(question) {
    answersContainer.innerHTML = '';
    
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = answer;
        button.dataset.index = index;
        
        button.addEventListener('click', () => {
            selectAnswer(index);
        });
        
        answersContainer.appendChild(button);
    });
}

// ========================================
// ÉTAPE 9: SÉLECTIONNER UNE RÉPONSE
// ========================================

function selectAnswer(selectedIndex) {
    // 1. Arrêter le timer
    clearInterval(timerInterval);
    
    // 2. Calculer le temps de réponse
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    
    // 3. Récupérer la question
    const question = gameQuestions[currentQuestionIndex];
    const isCorrect = selectedIndex === question.correct;
    
    // 4. Mettre à jour le score
    if (isCorrect) {
        score++;
        currentScoreElement.textContent = score;
    }
    
    // 5. Sauvegarder dans l'historique
    answersHistory.push({
        question: question.question,
        userAnswer: question.answers[selectedIndex],
        correctAnswer: question.answers[question.correct],
        isCorrect: isCorrect,
        timeSpent: timeSpent
    });
    
    // 6. Afficher le feedback visuel
    showFeedback(isCorrect, selectedIndex, question.correct);
    
    // 7. Passer à la question suivante après 2 secondes
    setTimeout(() => {
        nextQuestion();
    }, 2000);
}

// ========================================
// ÉTAPE 10: AFFICHER LE FEEDBACK
// ========================================

function showFeedback(isCorrect, selectedIndex, correctIndex) {
    const buttons = answersContainer.querySelectorAll('.answer-btn');
    
    // Désactiver tous les boutons
    buttons.forEach(btn => {
        btn.disabled = true;
    });
    
    // Marquer la réponse sélectionnée
    buttons[selectedIndex].classList.add(isCorrect ? 'correct' : 'incorrect');
    
    // Toujours montrer la bonne réponse
    if (!isCorrect) {
        buttons[correctIndex].classList.add('correct');
    }
    
    // Afficher le message de feedback
    feedbackElement.classList.remove('hidden');
    feedbackElement.className = 'feedback ' + (isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
        feedbackIcon.textContent = '✓';
        feedbackText.textContent = 'Bonne réponse !';
    } else {
        feedbackIcon.textContent = '✗';
        feedbackText.textContent = 'Mauvaise réponse !';
    }
}

// ========================================
// ÉTAPE 11: PASSER À LA QUESTION SUIVANTE
// ========================================

function nextQuestion() {
    currentQuestionIndex++;
    
    // Vérifier s'il reste des questions
    if (currentQuestionIndex < gameQuestions.length) {
        loadQuestion();
    } else {
        endQuiz();
    }
}

// ========================================
// ÉTAPE 12: GESTION DU TIMER
// ========================================

function startTimer() {
    // Initialiser le cercle de progression
    timerProgress.style.strokeDasharray = CIRCLE_CIRCUMFERENCE;
    timerProgress.style.strokeDashoffset = '0';
    
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            // Temps écoulé
            clearInterval(timerInterval);
            selectAnswer(-1); // -1 = pas de réponse
        }
    }, 1000);
}

function updateTimerDisplay() {
    // Mettre à jour le texte
    timerText.textContent = timeLeft;
    
    // Calculer le pourcentage restant
    const config = difficulties[currentDifficulty];
    const percentage = timeLeft / config.timePerQuestion;
    
    // Mettre à jour le cercle
    const offset = CIRCLE_CIRCUMFERENCE * (1 - percentage);
    timerProgress.style.strokeDashoffset = offset;
    
    // Changer la couleur selon le temps restant
    timerProgress.className = 'timer-progress';
    
    if (percentage <= 0.25) {
        timerProgress.classList.add('danger');
    } else if (percentage <= 0.5) {
        timerProgress.classList.add('warning');
    }
}

// ========================================
// ÉTAPE 13: FIN DU QUIZ
// ========================================

function endQuiz() {
    // 1. Arrêter le timer s'il tourne encore
    clearInterval(timerInterval);
    
    // 2. Calculer les statistiques
    const totalQuestions = gameQuestions.length;
    const correctAnswers = score;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Calculer le temps moyen
    const totalTime = answersHistory.reduce((sum, item) => sum + item.timeSpent, 0);
    const averageTime = Math.round(totalTime / totalQuestions);
    
    // 3. Afficher les résultats
    finalScore.textContent = `${correctAnswers}/${totalQuestions}`;
    finalPercentage.textContent = `${percentage}%`;
    correctCount.textContent = correctAnswers;
    incorrectCount.textContent = incorrectAnswers;
    avgTime.textContent = `${averageTime}s`;
    
    // 4. Déterminer le message et l'emoji
    let emoji = '🎉';
    let title = 'Félicitations !';
    
    if (percentage === 100) {
        emoji = '🏆';
        title = 'Parfait !';
    } else if (percentage >= 80) {
        emoji = '🎉';
        title = 'Excellent !';
    } else if (percentage >= 60) {
        emoji = '👍';
        title = 'Bien joué !';
    } else if (percentage >= 40) {
        emoji = '😐';
        title = 'Pas mal !';
    } else {
        emoji = '😕';
        title = 'Il faut réviser !';
    }
    
    resultsEmoji.textContent = emoji;
    resultsTitle.textContent = title;
    
    // 5. Afficher la révision des réponses
    displayReview();
    
    // 6. Sauvegarder le score
    saveScore(correctAnswers, totalQuestions, percentage);
    
    // 7. Afficher l'écran de résultats
    showScreen(resultsScreen);
}

// ========================================
// ÉTAPE 14: AFFICHER LA RÉVISION
// ========================================

function displayReview() {
    reviewList.innerHTML = '';
    
    answersHistory.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `review-item ${item.isCorrect ? 'correct' : 'incorrect'}`;
        
        div.innerHTML = `
            <div class="review-question">Q${index + 1}: ${item.question}</div>
            <div class="review-answer">Votre réponse: ${item.userAnswer || 'Pas de réponse'}</div>
            ${!item.isCorrect ? `<div class="review-correct">Bonne réponse: ${item.correctAnswer}</div>` : ''}
        `;
        
        reviewList.appendChild(div);
    });
}

// ========================================
// ÉTAPE 15: GESTION DES SCORES
// ========================================

function saveScore(correct, total, percentage) {
    // Charger les scores existants
    let scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
    
    // Ajouter le nouveau score
    scores.push({
        date: new Date().toLocaleString('fr-FR'),
        difficulty: currentDifficulty,
        category: selectedCategory,
        correct: correct,
        total: total,
        percentage: percentage
    });
    
    // Trier par pourcentage décroissant
    scores.sort((a, b) => b.percentage - a.percentage);
    
    // Garder seulement les 5 meilleurs
    scores = scores.slice(0, 5);
    
    // Sauvegarder
    localStorage.setItem('quizScores', JSON.stringify(scores));
    
    // Recharger l'affichage
    loadBestScores();
}

function loadBestScores() {
    const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
    
    bestScoresList.innerHTML = '';
    
    if (scores.length === 0) {
        bestScoresList.innerHTML = '<div class="no-scores">Aucun score enregistré</div>';
        return;
    }
    
    scores.forEach((score, index) => {
        const div = document.createElement('div');
        div.className = 'score-item';
        div.innerHTML = `
            <span class="score-name">${index + 1}. ${score.date}</span>
            <span class="score-points">${score.percentage}%</span>
        `;
        bestScoresList.appendChild(div);
    });
}

// ========================================
// ÉTAPE 16: GESTION DES ÉVÉNEMENTS
// ========================================

// Sélection de difficulté
difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.dataset.difficulty;
    });
});

// Sélection de catégorie
categorySelect.addEventListener('change', () => {
    selectedCategory = categorySelect.value;
});

// Bouton démarrer
startBtn.addEventListener('click', () => {
    startQuiz();
});

// Bouton recommencer
retryBtn.addEventListener('click', () => {
    startQuiz();
});

// Bouton retour à l'accueil
homeBtn.addEventListener('click', () => {
    showScreen(welcomeScreen);
});

// ========================================
// ÉTAPE 17: INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Charger les meilleurs scores
    loadBestScores();
    
    // Afficher l'écran d'accueil
    showScreen(welcomeScreen);
    
    console.log('✅ Quiz chargé avec succès !');
    console.log(`📚 ${questionsDatabase.length} questions disponibles`);
});