// ========================================
// ÉTAPE 1: SÉLECTION DES ÉLÉMENTS HTML
// ========================================

const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const emptyMessage = document.getElementById('empty-message');
const clearAllBtn = document.getElementById('clear-all');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalTasksSpan = document.getElementById('total-tasks');
const completedTasksSpan = document.getElementById('completed-tasks');

// ========================================
// ÉTAPE 2: VARIABLES GLOBALES
// ========================================

// Tableau pour stocker toutes les tâches
let tasks = [];

// Filtre actif (all, active, completed)
let currentFilter = 'all';

// ========================================
// ÉTAPE 3: FONCTIONS DE BASE
// ========================================

// Fonction pour générer un ID unique
function generateId() {
    return Date.now().toString();
}

// Fonction pour sauvegarder dans localStorage
function saveTasks() {
    // Convertir le tableau en JSON et le stocker
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Fonction pour charger depuis localStorage
function loadTasks() {
    // Récupérer les données du localStorage
    const savedTasks = localStorage.getItem('tasks');
    
    // Si des données existent, les convertir en tableau
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        tasks = [];
    }
}

// ========================================
// ÉTAPE 4: FONCTION POUR AJOUTER UNE TÂCHE
// ========================================

function addTask() {
    // 1. Récupérer la valeur de l'input et enlever les espaces
    const taskText = taskInput.value.trim();
    
    // 2. Vérifier que l'input n'est pas vide
    if (taskText === '') {
        alert('Veuillez entrer une tâche !');
        return;
    }
    
    // 3. Créer un objet tâche
    const newTask = {
        id: generateId(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // 4. Ajouter la tâche au tableau
    tasks.push(newTask);
    
    // 5. Vider l'input
    taskInput.value = '';
    
    // 6. Sauvegarder dans localStorage
    saveTasks();
    
    // 7. Afficher les tâches
    displayTasks();
    
    // 8. Focus sur l'input pour ajouter une autre tâche
    taskInput.focus();
}

// ========================================
// ÉTAPE 5: FONCTION POUR SUPPRIMER UNE TÂCHE
// ========================================

function deleteTask(id) {
    // Filtrer le tableau pour enlever la tâche avec cet ID
    tasks = tasks.filter(function(task) {
        return task.id !== id;
    });
    
    // Sauvegarder et afficher
    saveTasks();
    displayTasks();
}

// ========================================
// ÉTAPE 6: FONCTION POUR MARQUER COMME TERMINÉE
// ========================================

function toggleTask(id) {
    // Trouver la tâche et inverser son statut completed
    tasks = tasks.map(function(task) {
        if (task.id === id) {
            task.completed = !task.completed;
        }
        return task;
    });
    
    // Sauvegarder et afficher
    saveTasks();
    displayTasks();
}

// ========================================
// ÉTAPE 7: FONCTION POUR AFFICHER LES TÂCHES
// ========================================

function displayTasks() {
    // 1. Vider la liste HTML
    taskList.innerHTML = '';
    
    // 2. Filtrer les tâches selon le filtre actif
    let filteredTasks = tasks;
    
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(function(task) {
            return !task.completed;
        });
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(function(task) {
            return task.completed;
        });
    }
    
    // 3. Afficher le message vide si aucune tâche
    if (filteredTasks.length === 0) {
        emptyMessage.classList.add('show');
        clearAllBtn.classList.remove('show');
    } else {
        emptyMessage.classList.remove('show');
        clearAllBtn.classList.add('show');
    }
    
    // 4. Boucle pour créer chaque élément de tâche
    filteredTasks.forEach(function(task) {
        // Créer l'élément <li>
        const li = document.createElement('li');
        li.className = 'task-item';
        
        // Ajouter la classe 'completed' si la tâche est terminée
        if (task.completed) {
            li.classList.add('completed');
        }
        
        // Créer le HTML de la tâche
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <button class="delete-btn">Supprimer</button>
        `;
        
        // Ajouter les événements
        const checkbox = li.querySelector('.task-checkbox');
        const deleteBtn = li.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', function() {
            toggleTask(task.id);
        });
        
        deleteBtn.addEventListener('click', function() {
            if (confirm('Supprimer cette tâche ?')) {
                deleteTask(task.id);
            }
        });
        
        // Ajouter à la liste
        taskList.appendChild(li);
    });
    
    // 5. Mettre à jour les statistiques
    updateStats();
}

// ========================================
// ÉTAPE 8: FONCTION POUR METTRE À JOUR LES STATS
// ========================================

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(function(task) {
        return task.completed;
    }).length;
    
    totalTasksSpan.textContent = `${total} tâche${total > 1 ? 's' : ''}`;
    completedTasksSpan.textContent = `${completed} terminée${completed > 1 ? 's' : ''}`;
}

// ========================================
// ÉTAPE 9: FONCTION POUR SUPPRIMER TOUTES LES TÂCHES
// ========================================

function clearAllTasks() {
    if (confirm('Supprimer toutes les tâches ?')) {
        tasks = [];
        saveTasks();
        displayTasks();
    }
}

// ========================================
// ÉTAPE 10: FONCTION POUR FILTRER LES TÂCHES
// ========================================

function filterTasks(filter) {
    currentFilter = filter;
    
    // Retirer la classe 'active' de tous les boutons
    filterBtns.forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    // Ajouter la classe 'active' au bouton cliqué
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    activeBtn.classList.add('active');
    
    // Afficher les tâches filtrées
    displayTasks();
}

// ========================================
// ÉTAPE 11: GESTION DES ÉVÉNEMENTS
// ========================================

// Clic sur le bouton "Ajouter"
addBtn.addEventListener('click', addTask);

// Appuyer sur "Entrée" dans l'input
taskInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Clic sur "Supprimer tout"
clearAllBtn.addEventListener('click', clearAllTasks);

// Clic sur les boutons de filtre
filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        filterTasks(filter);
    });
});

// ========================================
// ÉTAPE 12: INITIALISATION AU CHARGEMENT
// ========================================

// Attendre que la page soit chargée
document.addEventListener('DOMContentLoaded', function() {
    // 1. Charger les tâches depuis localStorage
    loadTasks();
    
    // 2. Afficher les tâches
    displayTasks();
    
    // 3. Mettre le focus sur l'input
    taskInput.focus();
    
    console.log('✅ To-Do List chargée avec succès !');
    console.log(`📋 ${tasks.length} tâche(s) chargée(s)`);
});