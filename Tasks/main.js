// app.js - Gestionnaire de Tâches Orienté Objet

// ============= CLASSES MÉTIER =============

/**
 * Classe Task - Représente une tâche individuelle
 * Encapsule toutes les données et comportements d'une tâche
 */
class Task {
    static STATUS = {
        TODO: 'todo',
        IN_PROGRESS: 'in-progress',
        COMPLETED: 'completed'
    };

    static PRIORITY = {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high'
    };

    constructor(data) {
        this.id = data.id || this.generateId();
        this.title = data.title;
        this.description = data.description || '';
        this.status = data.status || Task.STATUS.TODO;
        this.priority = data.priority || Task.PRIORITY.MEDIUM;
        this.dueDate = data.dueDate || null;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Méthodes métier
    markAsTodo() {
        this.status = Task.STATUS.TODO;
        this.updateTimestamp();
    }

    markAsInProgress() {
        this.status = Task.STATUS.IN_PROGRESS;
        this.updateTimestamp();
    }

    markAsCompleted() {
        this.status = Task.STATUS.COMPLETED;
        this.updateTimestamp();
    }

    updateTimestamp() {
        this.updatedAt = new Date().toISOString();
    }

    update(data) {
        if (data.title !== undefined) this.title = data.title;
        if (data.description !== undefined) this.description = data.description;
        if (data.priority !== undefined) this.priority = data.priority;
        if (data.dueDate !== undefined) this.dueDate = data.dueDate;
        this.updateTimestamp();
    }

    isCompleted() {
        return this.status === Task.STATUS.COMPLETED;
    }

    isOverdue() {
        if (!this.dueDate) return false;
        return new Date(this.dueDate) < new Date() && !this.isCompleted();
    }

    getPriorityLabel() {
        const labels = {
            [Task.PRIORITY.LOW]: '🟢 Basse',
            [Task.PRIORITY.MEDIUM]: '🟡 Moyenne',
            [Task.PRIORITY.HIGH]: '🔴 Haute'
        };
        return labels[this.priority];
    }

    getStatusLabel() {
        const labels = {
            [Task.STATUS.TODO]: 'À faire',
            [Task.STATUS.IN_PROGRESS]: 'En cours',
            [Task.STATUS.COMPLETED]: 'Terminée'
        };
        return labels[this.status];
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            status: this.status,
            priority: this.priority,
            dueDate: this.dueDate,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

/**
 * Classe TaskList - Gère une collection de tâches
 * Responsable de la logique métier et de la persistance
 */
class TaskList {
    constructor() {
        this.tasks = [];
        this.observers = [];
        this.loadFromStorage();
    }

    // Gestion des tâches
    addTask(taskData) {
        const task = new Task(taskData);
        this.tasks.push(task);
        this.saveToStorage();
        this.notifyObservers();
        return task;
    }

    getTask(id) {
        return this.tasks.find(task => task.id === id);
    }

    updateTask(id, data) {
        const task = this.getTask(id);
        if (task) {
            task.update(data);
            this.saveToStorage();
            this.notifyObservers();
            return task;
        }
        return null;
    }

    deleteTask(id) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
            this.tasks.splice(index, 1);
            this.saveToStorage();
            this.notifyObservers();
            return true;
        }
        return false;
    }

    changeTaskStatus(id, status) {
        const task = this.getTask(id);
        if (task) {
            switch(status) {
                case Task.STATUS.TODO:
                    task.markAsTodo();
                    break;
                case Task.STATUS.IN_PROGRESS:
                    task.markAsInProgress();
                    break;
                case Task.STATUS.COMPLETED:
                    task.markAsCompleted();
                    break;
            }
            this.saveToStorage();
            this.notifyObservers();
            return task;
        }
        return null;
    }

    // Filtres et recherche
    getAllTasks() {
        return [...this.tasks];
    }

    getTasksByStatus(status) {
        return this.tasks.filter(task => task.status === status);
    }

    getTasksByPriority(priority) {
        return this.tasks.filter(task => task.priority === priority);
    }

    filterTasks(filters) {
        let filtered = [...this.tasks];

        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(task => task.status === filters.status);
        }

        if (filters.priority && filters.priority !== 'all') {
            filtered = filtered.filter(task => task.priority === filters.priority);
        }

        return filtered;
    }

    sortTasks(tasks, sortBy) {
        const sorted = [...tasks];

        switch(sortBy) {
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return sorted.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            case 'title':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            default:
                return sorted;
        }
    }

    // Statistiques
    getStatistics() {
        return {
            total: this.tasks.length,
            todo: this.getTasksByStatus(Task.STATUS.TODO).length,
            inProgress: this.getTasksByStatus(Task.STATUS.IN_PROGRESS).length,
            completed: this.getTasksByStatus(Task.STATUS.COMPLETED).length,
            overdue: this.tasks.filter(task => task.isOverdue()).length
        };
    }

    // Persistance
    saveToStorage() {
        const data = this.tasks.map(task => task.toJSON());
        localStorage.setItem('tasks', JSON.stringify(data));
    }

    loadFromStorage() {
        const data = localStorage.getItem('tasks');
        if (data) {
            const tasksData = JSON.parse(data);
            this.tasks = tasksData.map(taskData => new Task(taskData));
        }
    }

    clearAll() {
        this.tasks = [];
        this.saveToStorage();
        this.notifyObservers();
    }

    // Pattern Observer
    subscribe(callback) {
        this.observers.push(callback);
    }

    notifyObservers() {
        this.observers.forEach(callback => callback());
    }
}

/**
 * Classe TaskManager - Contrôleur principal
 * Gère l'interface utilisateur et les interactions
 */
class TaskManager {
    constructor() {
        this.taskList = new TaskList();
        this.currentFilter = { status: 'all', priority: 'all' };
        this.currentSort = 'date-desc';
        this.editingTaskId = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.taskList.subscribe(() => this.render());
        this.render();
    }

    initializeElements() {
        // Form elements
        this.form = document.getElementById('taskForm');
        this.titleInput = document.getElementById('taskTitle');
        this.descriptionInput = document.getElementById('taskDescription');
        this.prioritySelect = document.getElementById('taskPriority');
        this.dueDateInput = document.getElementById('taskDueDate');
        this.formBtn = document.getElementById('formBtnText');
        this.cancelBtn = document.getElementById('cancelEdit');

        // Display elements
        this.tasksList = document.getElementById('tasksList');
        this.emptyState = document.getElementById('emptyState');
        
        // Stats elements
        this.totalTasksEl = document.getElementById('totalTasks');
        this.todoTasksEl = document.getElementById('todoTasks');
        this.inProgressTasksEl = document.getElementById('inProgressTasks');
        this.completedTasksEl = document.getElementById('completedTasks');

        // Filter elements
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.priorityFilterBtns = document.querySelectorAll('.priority-filter-btn');
        this.sortSelect = document.getElementById('sortSelect');
    }

    attachEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.cancelBtn.addEventListener('click', () => this.cancelEdit());

        // Filters
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });

        this.priorityFilterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePriorityFilterClick(e));
        });

        // Sort
        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.render();
        });
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const taskData = {
            title: this.titleInput.value.trim(),
            description: this.descriptionInput.value.trim(),
            priority: this.prioritySelect.value,
            dueDate: this.dueDateInput.value || null
        };

        if (this.editingTaskId) {
            this.taskList.updateTask(this.editingTaskId, taskData);
            this.cancelEdit();
        } else {
            this.taskList.addTask(taskData);
            this.form.reset();
        }
    }

    handleFilterClick(e) {
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter.status = e.target.dataset.filter;
        this.render();
    }

    handlePriorityFilterClick(e) {
        this.priorityFilterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter.priority = e.target.dataset.priority;
        this.render();
    }

    editTask(id) {
        const task = this.taskList.getTask(id);
        if (task) {
            this.editingTaskId = id;
            this.titleInput.value = task.title;
            this.descriptionInput.value = task.description;
            this.prioritySelect.value = task.priority;
            this.dueDateInput.value = task.dueDate || '';
            this.formBtn.textContent = 'Modifier la tâche';
            this.cancelBtn.style.display = 'inline-block';
            this.titleInput.focus();
        }
    }

    cancelEdit() {
        this.editingTaskId = null;
        this.form.reset();
        this.formBtn.textContent = 'Ajouter la tâche';
        this.cancelBtn.style.display = 'none';
    }

    deleteTask(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            this.taskList.deleteTask(id);
        }
    }

    changeStatus(id, status) {
        this.taskList.changeTaskStatus(id, status);
    }

    render() {
        this.renderStatistics();
        this.renderTasks();
    }

    renderStatistics() {
        const stats = this.taskList.getStatistics();
        this.totalTasksEl.textContent = stats.total;
        this.todoTasksEl.textContent = stats.todo;
        this.inProgressTasksEl.textContent = stats.inProgress;
        this.completedTasksEl.textContent = stats.completed;
    }

    renderTasks() {
        let tasks = this.taskList.filterTasks(this.currentFilter);
        tasks = this.taskList.sortTasks(tasks, this.currentSort);

        if (tasks.length === 0) {
            this.tasksList.style.display = 'none';
            this.emptyState.style.display = 'block';
            return;
        }

        this.tasksList.style.display = 'flex';
        this.emptyState.style.display = 'none';
        this.tasksList.innerHTML = tasks.map(task => this.renderTaskItem(task)).join('');

        // Attach event listeners to task items
        this.attachTaskEventListeners();
    }

    renderTaskItem(task) {
        const dueDateHtml = task.dueDate 
            ? `<span class="task-date">📅 ${new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>`
            : '';

        return `
            <div class="task-item ${task.isCompleted() ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-header">
                    <div class="task-title-section">
                        <div class="task-title">${task.title}</div>
                        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    </div>
                    <div class="task-actions">
                        <button class="action-btn edit-btn" data-action="edit">✏️</button>
                        <button class="action-btn delete-btn" data-action="delete">🗑️</button>
                    </div>
                </div>
                
                <div class="task-meta">
                    <span class="task-badge priority-${task.priority}">${task.getPriorityLabel()}</span>
                    <span class="task-badge status-${task.status}">${task.getStatusLabel()}</span>
                    ${dueDateHtml}
                </div>

                <div class="task-footer">
                    <div class="status-controls">
                        <button class="status-btn ${task.status === Task.STATUS.TODO ? 'active' : ''}" 
                                data-status="${Task.STATUS.TODO}">
                            À faire
                        </button>
                        <button class="status-btn ${task.status === Task.STATUS.IN_PROGRESS ? 'active' : ''}" 
                                data-status="${Task.STATUS.IN_PROGRESS}">
                            En cours
                        </button>
                        <button class="status-btn ${task.status === Task.STATUS.COMPLETED ? 'active' : ''}" 
                                data-status="${Task.STATUS.COMPLETED}">
                            Terminée
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    attachTaskEventListeners() {
        // Edit and delete buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item').dataset.taskId;
                const action = e.target.dataset.action;
                
                if (action === 'edit') {
                    this.editTask(taskId);
                } else if (action === 'delete') {
                    this.deleteTask(taskId);
                }
            });
        });

        // Status buttons
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item').dataset.taskId;
                const status = e.target.dataset.status;
                this.changeStatus(taskId, status);
            });
        });
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    const app = new TaskManager();
    
    // Exposer l'instance pour le debugging
    window.taskManager = app;
});