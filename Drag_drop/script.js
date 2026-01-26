// ========================================
// ÉTAPE 1: GESTION DE L'ÉTAT GLOBAL
// ========================================

class DashboardState {
    constructor() {
        this.widgets = this.loadFromStorage() || [];
        this.theme = localStorage.getItem('dashboard-theme') || 'light';
        this.draggedWidget = null;
    }
    
    addWidget(widget) {
        this.widgets.push(widget);
        this.saveToStorage();
    }
    
    removeWidget(id) {
        this.widgets = this.widgets.filter(w => w.id !== id);
        this.saveToStorage();
    }
    
    updateWidget(id, data) {
        const widget = this.widgets.find(w => w.id === id);
        if (widget) {
            Object.assign(widget, data);
            this.saveToStorage();
        }
    }
    
    reorderWidgets(fromIndex, toIndex) {
        const [removed] = this.widgets.splice(fromIndex, 1);
        this.widgets.splice(toIndex, 0, removed);
        this.saveToStorage();
    }
    
    saveToStorage() {
        localStorage.setItem('dashboard-widgets', JSON.stringify(this.widgets));
    }
    
    loadFromStorage() {
        const stored = localStorage.getItem('dashboard-widgets');
        return stored ? JSON.parse(stored) : null;
    }
    
    reset() {
        this.widgets = [];
        this.saveToStorage();
    }
    
    exportConfig() {
        return JSON.stringify({
            widgets: this.widgets,
            theme: this.theme,
            exportedAt: new Date().toISOString()
        }, null, 2);
    }
    
    importConfig(jsonString) {
        try {
            const config = JSON.parse(jsonString);
            this.widgets = config.widgets || [];
            this.theme = config.theme || 'light';
            this.saveToStorage();
            return true;
        } catch (e) {
            return false;
        }
    }
}

const state = new DashboardState();

// ========================================
// ÉTAPE 2: FACTORY DE WIDGETS
// ========================================

class WidgetFactory {
    static createWidget(type) {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        const baseWidget = {
            id,
            type,
            createdAt: new Date().toISOString()
        };
        
        switch (type) {
            case 'stats':
                return {
                    ...baseWidget,
                    title: 'Statistiques',
                    icon: '📈',
                    data: {
                        views: Math.floor(Math.random() * 10000),
                        users: Math.floor(Math.random() * 1000),
                        revenue: Math.floor(Math.random() * 50000),
                        growth: Math.floor(Math.random() * 100)
                    }
                };
            
            case 'chart':
                return {
                    ...baseWidget,
                    title: 'Graphique',
                    icon: '📊',
                    data: {
                        values: Array.from({ length: 7 }, () => Math.random() * 100)
                    }
                };
            
            case 'todo':
                return {
                    ...baseWidget,
                    title: 'Tâches',
                    icon: '✅',
                    data: {
                        todos: []
                    }
                };
            
            case 'calendar':
                return {
                    ...baseWidget,
                    title: 'Calendrier',
                    icon: '📅',
                    data: {
                        month: new Date().getMonth(),
                        year: new Date().getFullYear()
                    }
                };
            
            case 'notes':
                return {
                    ...baseWidget,
                    title: 'Notes',
                    icon: '📝',
                    data: {
                        content: ''
                    }
                };
            
            case 'weather':
                return {
                    ...baseWidget,
                    title: 'Météo',
                    icon: '🌤️',
                    data: {
                        temp: Math.floor(Math.random() * 30) + 10,
                        condition: 'Ensoleillé',
                        humidity: Math.floor(Math.random() * 50) + 30,
                        wind: Math.floor(Math.random() * 20) + 5
                    }
                };
            
            case 'clock':
                return {
                    ...baseWidget,
                    title: 'Horloge',
                    icon: '🕐',
                    data: {}
                };
            
            case 'quote':
                return {
                    ...baseWidget,
                    title: 'Citation',
                    icon: '💭',
                    data: this.getRandomQuote()
                };
            
            default:
                return baseWidget;
        }
    }
    
    static getRandomQuote() {
        const quotes = [
            { text: "La vie, c'est comme une bicyclette, il faut avancer pour ne pas perdre l'équilibre.", author: "Albert Einstein" },
            { text: "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.", author: "Winston Churchill" },
            { text: "La seule façon de faire du bon travail est d'aimer ce que vous faites.", author: "Steve Jobs" },
            { text: "L'imagination est plus importante que le savoir.", author: "Albert Einstein" },
            { text: "Soyez vous-même, tous les autres sont déjà pris.", author: "Oscar Wilde" }
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }
}

// ========================================
// ÉTAPE 3: RENDU DES WIDGETS
// ========================================

class WidgetRenderer {
    static render(widget) {
        const div = document.createElement('div');
        div.className = 'widget';
        div.draggable = true;
        div.dataset.widgetId = widget.id;
        
        // Header commun
        div.innerHTML = `
            <div class="widget-header">
                <div class="widget-title">
                    <span class="widget-icon">${widget.icon}</span>
                    <span>${widget.title}</span>
                </div>
                <div class="widget-actions">
                    <button class="widget-btn delete" onclick="dashboard.deleteWidget('${widget.id}')">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="widget-content">
                ${this.renderContent(widget)}
            </div>
        `;
        
        // Ajouter les event listeners de drag
        this.addDragListeners(div);
        
        // Initialiser les fonctionnalités spécifiques
        this.initializeWidget(div, widget);
        
        return div;
    }
    
    static renderContent(widget) {
        switch (widget.type) {
            case 'stats':
                return this.renderStats(widget.data);
            case 'chart':
                return this.renderChart(widget.data);
            case 'todo':
                return this.renderTodo(widget);
            case 'calendar':
                return this.renderCalendar(widget.data);
            case 'notes':
                return this.renderNotes(widget);
            case 'weather':
                return this.renderWeather(widget.data);
            case 'clock':
                return this.renderClock();
            case 'quote':
                return this.renderQuote(widget.data);
            default:
                return '<p>Widget non implémenté</p>';
        }
    }
    
    static renderStats(data) {
        return `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${data.views.toLocaleString()}</div>
                    <div class="stat-label">Vues</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.users.toLocaleString()}</div>
                    <div class="stat-label">Utilisateurs</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.revenue.toLocaleString()}€</div>
                    <div class="stat-label">Revenus</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">+${data.growth}%</div>
                    <div class="stat-label">Croissance</div>
                </div>
            </div>
        `;
    }
    
    static renderChart(data) {
        const maxValue = Math.max(...data.values);
        const bars = data.values.map(value => {
            const height = (value / maxValue) * 100;
            return `<div class="chart-bar" style="height: ${height}%"></div>`;
        }).join('');
        
        return `<div class="chart-container">${bars}</div>`;
    }
    
    static renderTodo(widget) {
        const todos = widget.data.todos || [];
        const todoItems = todos.map((todo, index) => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
                <input type="checkbox" class="todo-checkbox" 
                       ${todo.completed ? 'checked' : ''}
                       onchange="dashboard.toggleTodo('${widget.id}', ${index})">
                <span class="todo-text">${todo.text}</span>
                <button class="todo-delete" onclick="dashboard.deleteTodo('${widget.id}', ${index})">
                    ✕
                </button>
            </li>
        `).join('');
        
        return `
            <div class="todo-form">
                <input type="text" class="todo-input" placeholder="Nouvelle tâche..." 
                       data-widget-id="${widget.id}">
                <button class="todo-add" onclick="dashboard.addTodo('${widget.id}')">+</button>
            </div>
            <ul class="todo-list">${todoItems || '<li style="padding: 20px; text-align: center; color: var(--text-light);">Aucune tâche</li>'}</ul>
        `;
    }
    
    static renderCalendar(data) {
        const daysInMonth = new Date(data.year, data.month + 1, 0).getDate();
        const firstDay = new Date(data.year, data.month, 1).getDay();
        const today = new Date().getDate();
        const currentMonth = new Date().getMonth();
        
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                           'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        
        let days = '<div class="calendar-day header">L</div>'.repeat(7);
        
        for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
            days += '<div class="calendar-day"></div>';
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today && data.month === currentMonth ? 'today' : '';
            days += `<div class="calendar-day ${isToday}">${day}</div>`;
        }
        
        return `
            <div class="calendar-header">
                <button class="calendar-nav">←</button>
                <strong>${monthNames[data.month]} ${data.year}</strong>
                <button class="calendar-nav">→</button>
            </div>
            <div class="calendar-grid">${days}</div>
        `;
    }
    
    static renderNotes(widget) {
        return `
            <textarea class="notes-textarea" 
                      placeholder="Écrivez vos notes ici..."
                      data-widget-id="${widget.id}"
                      onchange="dashboard.saveNotes('${widget.id}', this.value)"
            >${widget.data.content || ''}</textarea>
        `;
    }
    
    static renderWeather(data) {
        return `
            <div class="weather-info">
                <div class="weather-temp">${data.temp}°C</div>
                <div class="weather-condition">${data.condition}</div>
                <div class="weather-details">
                    <div class="weather-detail">
                        <div class="weather-detail-value">${data.humidity}%</div>
                        <div class="weather-detail-label">Humidité</div>
                    </div>
                    <div class="weather-detail">
                        <div class="weather-detail-value">${data.wind} km/h</div>
                        <div class="weather-detail-label">Vent</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    static renderClock() {
        return `
            <div class="clock-display">
                <div class="clock-time" id="clock-time">00:00:00</div>
                <div class="clock-date" id="clock-date">--</div>
            </div>
        `;
    }
    
    static renderQuote(data) {
        return `
            <div class="quote-text">"${data.text}"</div>
            <div class="quote-author">— ${data.author}</div>
        `;
    }
    
    static addDragListeners(element) {
        element.addEventListener('dragstart', handleDragStart);
        element.addEventListener('dragend', handleDragEnd);
        element.addEventListener('dragover', handleDragOver);
        element.addEventListener('drop', handleDrop);
        element.addEventListener('dragenter', handleDragEnter);
        element.addEventListener('dragleave', handleDragLeave);
    }
    
    static initializeWidget(element, widget) {
        // Initialiser l'horloge si c'est un widget horloge
        if (widget.type === 'clock') {
            updateClock(element);
            setInterval(() => updateClock(element), 1000);
        }
        
        // Ajouter event listener pour Enter sur todo input
        if (widget.type === 'todo') {
            const input = element.querySelector('.todo-input');
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        dashboard.addTodo(widget.id);
                    }
                });
            }
        }
    }
}

// ========================================
// ÉTAPE 4: DRAG & DROP HANDLERS
// ========================================

function handleDragStart(e) {
    this.classList.add('dragging');
    state.draggedWidget = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // Retirer tous les drag-over
    document.querySelectorAll('.widget').forEach(widget => {
        widget.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (this !== state.draggedWidget) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (state.draggedWidget !== this) {
        // Obtenir les indices
        const widgets = Array.from(document.querySelectorAll('.widget'));
        const fromIndex = widgets.indexOf(state.draggedWidget);
        const toIndex = widgets.indexOf(this);
        
        // Réorganiser dans l'état
        state.reorderWidgets(fromIndex, toIndex);
        
        // Re-render le dashboard
        dashboard.render();
    }
    
    return false;
}

// ========================================
// ÉTAPE 5: CLASSE DASHBOARD PRINCIPALE
// ========================================

class Dashboard {
    constructor() {
        this.container = document.getElementById('dashboard');
        this.emptyMessage = document.getElementById('empty-dashboard');
        this.modal = document.getElementById('add-widget-modal');
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupEventListeners();
        this.applyTheme();
    }
    
    render() {
        this.container.innerHTML = '';
        
        if (state.widgets.length === 0) {
            this.emptyMessage.classList.remove('hidden');
            this.container.classList.add('hidden');
        } else {
            this.emptyMessage.classList.add('hidden');
            this.container.classList.remove('hidden');
            
            state.widgets.forEach(widget => {
                const element = WidgetRenderer.render(widget);
                this.container.appendChild(element);
            });
        }
    }
    
    setupEventListeners() {
        // Bouton ajouter widget
        document.getElementById('add-widget-btn').addEventListener('click', () => {
            this.modal.classList.remove('hidden');
        });
        
        // Fermer modal
        document.getElementById('close-modal').addEventListener('click', () => {
            this.modal.classList.add('hidden');
        });
        
        // Cliquer en dehors du modal
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.classList.add('hidden');
            }
        });
        
        // Options de widgets
        document.querySelectorAll('.widget-option').forEach(option => {
            option.addEventListener('click', () => {
                const type = option.dataset.type;
                this.addWidget(type);
                this.modal.classList.add('hidden');
            });
        });
        
        // Bouton reset
        document.getElementById('reset-btn').addEventListener('click', () => {
            if (confirm('Voulez-vous vraiment réinitialiser le dashboard ?')) {
                this.reset();
            }
        });
        
        // Bouton export
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportConfig();
        });
        
        // Toggle thème
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
    }
    
    addWidget(type) {
        const widget = WidgetFactory.createWidget(type);
        state.addWidget(widget);
        this.render();
        showToast(`Widget "${widget.title}" ajouté !`);
    }
    
    deleteWidget(id) {
        if (confirm('Supprimer ce widget ?')) {
            state.removeWidget(id);
            this.render();
            showToast('Widget supprimé');
        }
    }
    
    // Méthodes spécifiques aux widgets
    addTodo(widgetId) {
        const widget = state.widgets.find(w => w.id === widgetId);
        const input = document.querySelector(`.todo-input[data-widget-id="${widgetId}"]`);
        const text = input.value.trim();
        
        if (text) {
            if (!widget.data.todos) widget.data.todos = [];
            widget.data.todos.push({ text, completed: false });
            state.saveToStorage();
            this.render();
            showToast('Tâche ajoutée');
        }
    }
    
    toggleTodo(widgetId, index) {
        const widget = state.widgets.find(w => w.id === widgetId);
        widget.data.todos[index].completed = !widget.data.todos[index].completed;
        state.saveToStorage();
    }
    
    deleteTodo(widgetId, index) {
        const widget = state.widgets.find(w => w.id === widgetId);
        widget.data.todos.splice(index, 1);
        state.saveToStorage();
        this.render();
    }
    
    saveNotes(widgetId, content) {
        const widget = state.widgets.find(w => w.id === widgetId);
        widget.data.content = content;
        state.saveToStorage();
    }
    
    reset() {
        state.reset();
        this.render();
        showToast('Dashboard réinitialisé');
    }
    
    exportConfig() {
        const config = state.exportConfig();
        const blob = new Blob([config], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-config-${Date.now()}.json`;
        a.click();
        showToast('Configuration exportée');
    }
    
    toggleTheme() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('dashboard-theme', state.theme);
        this.applyTheme();
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', state.theme);
        const themeBtn = document.getElementById('theme-toggle');
        themeBtn.textContent = state.theme === 'light' ? '🌙' : '☀️';
    }
}

// ========================================
// ÉTAPE 6: FONCTIONS UTILITAIRES
// ========================================

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function updateClock(element) {
    const now = new Date();
    const timeElement = element.querySelector('#clock-time');
    const dateElement = element.querySelector('#clock-date');
    
    if (timeElement && dateElement) {
        const time = now.toLocaleTimeString('fr-FR');
        const date = now.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        timeElement.textContent = time;
        dateElement.textContent = date;
    }
}

// ========================================
// ÉTAPE 7: INITIALISATION
// ========================================

let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
    
    console.log('✅ Dashboard chargé !');
    console.log(`📊 ${state.widgets.length} widgets actifs`);
});
/*

## 🎯 Fonctionnalités du dashboard :

✅ **8 types de widgets** : Stats, Chart, Todo, Calendar, Notes, Weather, Clock, Quote  
✅ **Drag & Drop natif** : Réorganisation intuitive  
✅ **Sauvegarde automatique** : localStorage pour persistance  
✅ **Thème clair/sombre** : Toggle avec préférence sauvegardée  
✅ **Export/Import** : Configuration en JSON  
✅ **Réinitialisation** : Retour à zéro  
✅ **Widgets interactifs** : Todo list, notes éditables, horloge temps réel  
✅ **State management** : Architecture propre  
✅ **Animations fluides** : Transitions CSS  
✅ **Responsive** : Mobile-friendly  

## 📚 Concepts JavaScript maîtrisés :

1. **Drag & Drop API** : `dragstart`, `dragover`, `drop`, `dragenter`, `dragleave`, `dragend`
2. **Classes ES6** : `DashboardState`, `WidgetFactory`, `WidgetRenderer`, `Dashboard`
3. **Factory Pattern** : Création de widgets
4. **State Management** : Gestion centralisée de l'état
5. **localStorage** : Persistance des données
6. **Event Delegation** : Gestion efficace des événements
7. **Template Literals** : Construction dynamique de HTML
8. **Array manipulation** : `splice`, `find`, `filter`, `map`
9. **Closures** : Dans les event handlers
10. **setInterval** : Horloge temps réel
11. **Blob & URL** : Export de fichiers
12. **Dataset API** : Attributs data-*

## 🔄 Architecture Drag & Drop :
```
1. dragstart
   → Stocker l'élément source
   → Ajouter classe "dragging"
   
2. dragover
   → Empêcher comportement par défaut
   → Permettre le drop
   
3. dragenter
   → Ajouter classe "drag-over"
   → Effet visuel
   
4. dragleave
   → Retirer classe "drag-over"
   
5. drop
   → Calculer indices source/destination
   → Réorganiser dans state
   → Re-render dashboard
   
6. dragend
   → Nettoyer les classes
   → Finir l'opération*/