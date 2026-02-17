// app.js - Notification System with Design Patterns

// ============= DESIGN PATTERNS =============

/**
 * Singleton Pattern - NotificationManager
 * Garantit une seule instance du gestionnaire de notifications
 */
class NotificationManager {
    static #instance = null;
    #notifications = new Map();
    #containers = new Map();
    #observers = [];
    #stats = {
        total: 0,
        success: 0,
        error: 0,
        warning: 0,
        info: 0
    };

    constructor() {
        if (NotificationManager.#instance) {
            return NotificationManager.#instance;
        }
        NotificationManager.#instance = this;
        this.#initializeContainers();
    }

    static getInstance() {
        if (!NotificationManager.#instance) {
            NotificationManager.#instance = new NotificationManager();
        }
        return NotificationManager.#instance;
    }

    #initializeContainers() {
        const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'];
        positions.forEach(position => {
            const container = document.createElement('div');
            container.className = `notification-container ${position}`;
            document.body.appendChild(container);
            this.#containers.set(position, container);
        });
    }

    addNotification(notification) {
        this.#notifications.set(notification.getId(), notification);
        this.#updateStats(notification.getType(), 1);
        this.#notifyObservers();
        
        const container = this.#containers.get(notification.getPosition());
        if (container) {
            container.appendChild(notification.getElement());
        }
    }

    removeNotification(notificationId) {
        const notification = this.#notifications.get(notificationId);
        if (notification) {
            this.#notifications.delete(notificationId);
            this.#notifyObservers();
        }
    }

    clearAll() {
        this.#notifications.forEach(notif => notif.close());
        this.#notifications.clear();
        this.#notifyObservers();
    }

    getActiveNotifications() {
        return Array.from(this.#notifications.values());
    }

    getStats() {
        return {
            ...this.#stats,
            active: this.#notifications.size
        };
    }

    #updateStats(type, delta) {
        this.#stats.total += delta;
        this.#stats[type] += delta;
    }

    // Observer Pattern
    subscribe(callback) {
        this.#observers.push(callback);
    }

    #notifyObservers() {
        this.#observers.forEach(callback => callback(this.getStats()));
    }
}

/**
 * Classe de base Notification
 */
class Notification {
    #id;
    #type;
    #title;
    #message;
    #position;
    #duration;
    #closable;
    #showProgress;
    #element;
    #timer;
    #createdAt;

    constructor(config) {
        this.#id = this.#generateId();
        this.#type = config.type || 'info';
        this.#title = config.title || this.#getDefaultTitle();
        this.#message = config.message || '';
        this.#position = config.position || 'top-right';
        this.#duration = config.duration || 5000;
        this.#closable = config.closable !== undefined ? config.closable : true;
        this.#showProgress = config.showProgress || false;
        this.#createdAt = new Date();
        
        this.#element = this.#createNotificationElement();
        
        if (this.#duration > 0) {
            this.#startTimer();
        }
    }

    #generateId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    #getDefaultTitle() {
        const titles = {
            success: 'Succès',
            error: 'Erreur',
            warning: 'Avertissement',
            info: 'Information'
        };
        return titles[this.#type] || 'Notification';
    }

    #createNotificationElement() {
        const notif = document.createElement('div');
        notif.className = `notification ${this.#type}`;
        notif.innerHTML = `
            <div class="notification-header">
                <div class="notification-title-group">
                    <span class="notification-icon">${this.getIcon()}</span>
                    <span class="notification-title">${this.#title}</span>
                </div>
                ${this.#closable ? '<button class="notification-close">×</button>' : ''}
            </div>
            <div class="notification-message">${this.#message}</div>
            ${this.#showProgress && this.#duration > 0 ? '<div class="notification-progress"></div>' : ''}
        `;

        if (this.#closable) {
            const closeBtn = notif.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => this.close());
        }

        return notif;
    }

    getIcon() {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[this.#type] || 'ℹ️';
    }

    #startTimer() {
        if (this.#showProgress) {
            const progressBar = this.#element.querySelector('.notification-progress');
            if (progressBar) {
                progressBar.style.width = '100%';
                progressBar.style.transition = `width ${this.#duration}ms linear`;
                setTimeout(() => {
                    progressBar.style.width = '0%';
                }, 10);
            }
        }

        this.#timer = setTimeout(() => {
            this.close();
        }, this.#duration);
    }

    close() {
        if (this.#timer) {
            clearTimeout(this.#timer);
        }

        this.#element.classList.add('closing');
        
        setTimeout(() => {
            this.#element.remove();
            NotificationManager.getInstance().removeNotification(this.#id);
        }, 300);
    }

    // Getters
    getId() {
        return this.#id;
    }

    getType() {
        return this.#type;
    }

    getTitle() {
        return this.#title;
    }

    getMessage() {
        return this.#message;
    }

    getPosition() {
        return this.#position;
    }

    getElement() {
        return this.#element;
    }

    getCreatedAt() {
        return this.#createdAt;
    }
}

/**
 * Notifications spécialisées (héritage)
 */
class SuccessNotification extends Notification {
    constructor(config) {
        super({ ...config, type: 'success' });
    }

    getIcon() {
        return '✅';
    }
}

class ErrorNotification extends Notification {
    constructor(config) {
        super({ ...config, type: 'error' });
    }

    getIcon() {
        return '❌';
    }
}

class WarningNotification extends Notification {
    constructor(config) {
        super({ ...config, type: 'warning' });
    }

    getIcon() {
        return '⚠️';
    }
}

class InfoNotification extends Notification {
    constructor(config) {
        super({ ...config, type: 'info' });
    }

    getIcon() {
        return 'ℹ️';
    }
}

/**
 * Factory Pattern - NotificationFactory
 * Crée les notifications selon le type
 */
class NotificationFactory {
    static createNotification(type, config) {
        const notificationConfig = { ...config, type };

        switch (type) {
            case 'success':
                return new SuccessNotification(notificationConfig);
            case 'error':
                return new ErrorNotification(notificationConfig);
            case 'warning':
                return new WarningNotification(notificationConfig);
            case 'info':
                return new InfoNotification(notificationConfig);
            default:
                return new Notification(notificationConfig);
        }
    }

    static createSuccessNotification(config) {
        return this.createNotification('success', config);
    }

    static createErrorNotification(config) {
        return this.createNotification('error', config);
    }

    static createWarningNotification(config) {
        return this.createNotification('warning', config);
    }

    static createInfoNotification(config) {
        return this.createNotification('info', config);
    }
}

/**
 * Builder Pattern - NotificationBuilder
 * Construction fluide des notifications
 */
class NotificationBuilder {
    #config = {};

    setType(type) {
        this.#config.type = type;
        return this;
    }

    setTitle(title) {
        this.#config.title = title;
        return this;
    }

    setMessage(message) {
        this.#config.message = message;
        return this;
    }

    setPosition(position) {
        this.#config.position = position;
        return this;
    }

    setDuration(duration) {
        this.#config.duration = duration;
        return this;
    }

    setClosable(closable) {
        this.#config.closable = closable;
        return this;
    }

    setShowProgress(showProgress) {
        this.#config.showProgress = showProgress;
        return this;
    }

    build() {
        return NotificationFactory.createNotification(
            this.#config.type || 'info',
            this.#config
        );
    }
}

/**
 * Classe NotificationUI - Interface utilisateur
 */
class NotificationUI {
    constructor() {
        this.manager = NotificationManager.getInstance();
        this.selectedType = 'success';
        this.history = [];
        
        this.initializeElements();
        this.attachEventListeners();
        this.subscribeToManager();
    }

    initializeElements() {
        // Type buttons
        this.typeBtns = document.querySelectorAll('.type-btn');
        
        // Form inputs
        this.titleInput = document.getElementById('notifTitle');
        this.messageInput = document.getElementById('notifMessage');
        this.positionSelect = document.getElementById('notifPosition');
        this.durationInput = document.getElementById('notifDuration');
        this.closableCheckbox = document.getElementById('notifClosable');
        this.progressCheckbox = document.getElementById('notifProgress');
        
        // Buttons
        this.createBtn = document.getElementById('createNotifBtn');
        this.quickSuccess = document.getElementById('quickSuccess');
        this.quickError = document.getElementById('quickError');
        this.quickWarning = document.getElementById('quickWarning');
        this.quickInfo = document.getElementById('quickInfo');
        this.testAllBtn = document.getElementById('testAll');
        this.clearAllBtn = document.getElementById('clearAll');

        // Stats
        this.statTotal = document.getElementById('statTotal');
        this.statActive = document.getElementById('statActive');
        this.statSuccess = document.getElementById('statSuccess');
        this.statError = document.getElementById('statError');
        this.statWarning = document.getElementById('statWarning');
        this.statInfo = document.getElementById('statInfo');

        // History
        this.historyList = document.getElementById('historyList');

        // Preview positions
        this.previewPositions = document.querySelectorAll('.preview-position');
    }

    attachEventListeners() {
        // Type selection
        this.typeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectType(btn));
        });

        // Create notification
        this.createBtn.addEventListener('click', () => this.createNotification());

        // Quick actions
        this.quickSuccess.addEventListener('click', () => this.quickNotification('success'));
        this.quickError.addEventListener('click', () => this.quickNotification('error'));
        this.quickWarning.addEventListener('click', () => this.quickNotification('warning'));
        this.quickInfo.addEventListener('click', () => this.quickNotification('info'));
        this.testAllBtn.addEventListener('click', () => this.testAllPositions());
        this.clearAllBtn.addEventListener('click', () => this.manager.clearAll());

        // Preview positions
        this.previewPositions.forEach(pos => {
            pos.addEventListener('click', () => {
                this.positionSelect.value = pos.dataset.position;
            });
        });
    }

    selectType(btn) {
        this.typeBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedType = btn.dataset.type;
    }

    createNotification() {
        const config = {
            title: this.titleInput.value.trim() || undefined,
            message: this.messageInput.value.trim() || 'Message par défaut',
            position: this.positionSelect.value,
            duration: parseInt(this.durationInput.value),
            closable: this.closableCheckbox.checked,
            showProgress: this.progressCheckbox.checked
        };

        const notification = NotificationFactory.createNotification(this.selectedType, config);
        this.manager.addNotification(notification);
        this.addToHistory(notification);
        
        // Reset form
        this.titleInput.value = '';
        this.messageInput.value = '';
    }

    quickNotification(type) {
        const messages = {
            success: 'Opération réussie avec succès!',
            error: 'Une erreur est survenue!',
            warning: 'Attention, veuillez vérifier!',
            info: 'Voici une information importante.'
        };

        const notification = new NotificationBuilder()
            .setType(type)
            .setMessage(messages[type])
            .setPosition('top-right')
            .setDuration(3000)
            .setClosable(true)
            .setShowProgress(true)
            .build();

        this.manager.addNotification(notification);
        this.addToHistory(notification);
    }

    testAllPositions() {
        const positions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
        const types = ['success', 'error', 'warning', 'info'];
        
        positions.forEach((position, index) => {
            setTimeout(() => {
                const type = types[index % types.length];
                const notification = new NotificationBuilder()
                    .setType(type)
                    .setTitle(`Position: ${position}`)
                    .setMessage(`Notification de test en ${position}`)
                    .setPosition(position)
                    .setDuration(4000)
                    .setClosable(true)
                    .setShowProgress(true)
                    .build();

                this.manager.addNotification(notification);
                this.addToHistory(notification);
            }, index * 300);
        });
    }

    subscribeToManager() {
        this.manager.subscribe((stats) => this.updateStats(stats));
    }

    updateStats(stats) {
        this.statTotal.textContent = stats.total;
        this.statActive.textContent = stats.active;
        this.statSuccess.textContent = stats.success;
        this.statError.textContent = stats.error;
        this.statWarning.textContent = stats.warning;
        this.statInfo.textContent = stats.info;
    }

    addToHistory(notification) {
        this.history.unshift({
            type: notification.getType(),
            title: notification.getTitle(),
            message: notification.getMessage(),
            time: notification.getCreatedAt()
        });

        // Limiter l'historique à 20 éléments
        if (this.history.length > 20) {
            this.history.pop();
        }

        this.renderHistory();
    }

    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<p class="empty-message">Aucune notification créée</p>';
            return;
        }

        this.historyList.innerHTML = this.history.map(item => {
            const time = new Date(item.time);
            const timeString = time.toLocaleTimeString('fr-FR');
            
            return `
                <div class="history-item ${item.type}">
                    <div class="history-header">
                        <span class="history-title">${item.title}</span>
                        <span class="history-time">${timeString}</span>
                    </div>
                    <div class="history-message">${item.message}</div>
                </div>
            `;
        }).join('');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const ui = new NotificationUI();
    
    // Notification de bienvenue
    setTimeout(() => {
        const welcomeNotif = new NotificationBuilder()
            .setType('info')
            .setTitle('Bienvenue!')
            .setMessage('Système de notifications avec Design Patterns (Singleton, Factory, Builder, Observer)')
            .setPosition('top-right')
            .setDuration(5000)
            .setClosable(true)
            .setShowProgress(true)
            .build();
        
        NotificationManager.getInstance().addNotification(welcomeNotif);
        ui.addToHistory(welcomeNotif);
    }, 500);

    // Exposer pour le debugging
    window.notificationUI = ui;
    window.notificationManager = NotificationManager.getInstance();
    window.NotificationFactory = NotificationFactory;
    window.NotificationBuilder = NotificationBuilder;
});