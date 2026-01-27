// ========================================
// ÉTAPE 1: CLASSE NOTIFICATION
// ========================================

class Notification {
    constructor(options) {
        // Configuration par défaut
        this.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        this.type = options.type || 'info';
        this.title = options.title || '';
        this.message = options.message || '';
        this.duration = options.duration !== undefined ? options.duration : 5000;
        this.autoClose = options.autoClose !== false;
        this.showProgress = options.showProgress !== false;
        this.pausable = options.pausable !== false;
        this.closeOnClick = options.closeOnClick || false;
        this.action = options.action || null;
        this.onClose = options.onClose || null;
        this.priority = options.priority || 0;
        
        // État interne
        this.element = null;
        this.progressBar = null;
        this.timer = null;
        this.startTime = null;
        this.remainingTime = this.duration;
        this.isPaused = false;
    }
    
    // Créer l'élément DOM
    createElement() {
        const div = document.createElement('div');
        div.className = `notification ${this.type} entering`;
        div.dataset.notificationId = this.id;
        
        // Icône selon le type
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        div.innerHTML = `
            <div class="notification-header">
                <div class="notification-icon">${icons[this.type]}</div>
                <div class="notification-content">
                    ${this.title ? `<div class="notification-title">${this.title}</div>` : ''}
                    ${this.message ? `<div class="notification-message">${this.message}</div>` : ''}
                </div>
                <button class="notification-close">✕</button>
            </div>
            ${this.action ? `
                <div class="notification-action">
                    <button class="notification-action-btn">${this.action.text}</button>
                </div>
            ` : ''}
            ${this.showProgress && this.autoClose ? `
                <div class="notification-progress">
                    <div class="notification-progress-bar"></div>
                </div>
            ` : ''}
        `;
        
        this.element = div;
        this.progressBar = div.querySelector('.notification-progress-bar');
        
        // Event listeners
        this.setupEventListeners();
        
        return div;
    }
    
    setupEventListeners() {
        // Bouton fermer
        const closeBtn = this.element.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.close());
        
        // Fermeture au clic
        if (this.closeOnClick) {
            this.element.addEventListener('click', (e) => {
                if (!e.target.closest('.notification-action-btn') && 
                    !e.target.closest('.notification-close')) {
                    this.close();
                }
            });
        }
        
        // Action personnalisée
        if (this.action) {
            const actionBtn = this.element.querySelector('.notification-action-btn');
            actionBtn.addEventListener('click', () => {
                if (this.action.onClick) {
                    this.action.onClick();
                }
                if (this.action.closeOnClick !== false) {
                    this.close();
                }
            });
        }
        
        // Pause au survol
        if (this.pausable) {
            this.element.addEventListener('mouseenter', () => this.pause());
            this.element.addEventListener('mouseleave', () => this.resume());
        }
    }
    
    // Démarrer le timer
    start() {
        if (!this.autoClose) return;
        
        this.startTime = Date.now();
        
        // Animer la barre de progression
        if (this.progressBar) {
            this.progressBar.style.width = '100%';
            this.progressBar.style.transition = `width ${this.remainingTime}ms linear`;
            
            // Force reflow pour restart l'animation
            setTimeout(() => {
                this.progressBar.style.width = '0%';
            }, 10);
        }
        
        // Timer d'auto-fermeture
        this.timer = setTimeout(() => {
            this.close();
        }, this.remainingTime);
    }
    
    // Mettre en pause
    pause() {
        if (!this.autoClose || this.isPaused) return;
        
        this.isPaused = true;
        this.element.classList.add('paused');
        
        // Calculer le temps restant
        const elapsed = Date.now() - this.startTime;
        this.remainingTime = this.remainingTime - elapsed;
        
        // Arrêter le timer
        clearTimeout(this.timer);
        
        // Arrêter l'animation de la barre
        if (this.progressBar) {
            const computedStyle = window.getComputedStyle(this.progressBar);
            const currentWidth = computedStyle.width;
            this.progressBar.style.transition = 'none';
            this.progressBar.style.width = currentWidth;
        }
    }
    
    // Reprendre
    resume() {
        if (!this.autoClose || !this.isPaused) return;
        
        this.isPaused = false;
        this.element.classList.remove('paused');
        
        this.startTime = Date.now();
        
        // Redémarrer la barre de progression
        if (this.progressBar) {
            this.progressBar.style.transition = `width ${this.remainingTime}ms linear`;
            this.progressBar.style.width = '0%';
        }
        
        // Redémarrer le timer
        this.timer = setTimeout(() => {
            this.close();
        }, this.remainingTime);
    }
    
    // Fermer la notification
    close() {
        // Animation de sortie
        this.element.classList.remove('entering');
        this.element.classList.add('exiting');
        
        // Nettoyer les timers
        clearTimeout(this.timer);
        
        // Supprimer après l'animation
        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            
            // Callback
            if (this.onClose) {
                this.onClose(this);
            }
        }, 300);
    }
}

// ========================================
// ÉTAPE 2: SYSTÈME DE NOTIFICATIONS
// ========================================

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.queue = [];
        this.containers = {};
        this.currentPosition = 'top-right';
        this.maxVisible = 5;
        this.stats = {
            total: 0,
            active: 0,
            queued: 0
        };
        
        this.createContainers();
    }
    
    // Créer les containers pour chaque position
    createContainers() {
        const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
        
        positions.forEach(position => {
            const container = document.createElement('div');
            container.className = `notification-container ${position}`;
            container.id = `notification-container-${position}`;
            document.body.appendChild(container);
            this.containers[position] = container;
        });
    }
    
    // Afficher une notification
    show(options) {
        const notification = new Notification({
            ...options,
            onClose: (notif) => this.handleNotificationClose(notif)
        });
        
        // Si on a atteint le maximum, mettre en file d'attente
        if (this.notifications.length >= this.maxVisible) {
            this.queue.push(notification);
            this.updateStats();
            return notification;
        }
        
        this.displayNotification(notification);
        this.updateStats();
        
        return notification;
    }
    
    // Afficher physiquement la notification
    displayNotification(notification) {
        const container = this.containers[this.currentPosition];
        const element = notification.createElement();
        
        // Ajouter au container
        if (this.currentPosition.includes('bottom')) {
            container.insertBefore(element, container.firstChild);
        } else {
            container.appendChild(element);
        }
        
        // Ajouter à la liste
        this.notifications.push(notification);
        
        // Démarrer le timer
        notification.start();
        
        this.stats.total++;
        this.stats.active++;
    }
    
    // Gérer la fermeture d'une notification
    handleNotificationClose(notification) {
        // Retirer de la liste
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
        
        this.stats.active--;
        
        // Afficher une notification en attente
        if (this.queue.length > 0) {
            // Trier par priorité
            this.queue.sort((a, b) => b.priority - a.priority);
            const next = this.queue.shift();
            this.displayNotification(next);
        }
        
        this.updateStats();
    }
    
    // Notifications typées
    success(title, message, options = {}) {
        return this.show({ ...options, type: 'success', title, message });
    }
    
    error(title, message, options = {}) {
        return this.show({ ...options, type: 'error', title, message });
    }
    
    warning(title, message, options = {}) {
        return this.show({ ...options, type: 'warning', title, message });
    }
    
    info(title, message, options = {}) {
        return this.show({ ...options, type: 'info', title, message });
    }
    
    // Gérer une promesse
    promise(promise, messages) {
        const pendingNotif = this.info(
            messages.pending || 'En cours...',
            '',
            { autoClose: false, showProgress: false }
        );
        
        promise
            .then(() => {
                pendingNotif.close();
                this.success(
                    messages.success || 'Succès !',
                    '',
                    { duration: 3000 }
                );
            })
            .catch(() => {
                pendingNotif.close();
                this.error(
                    messages.error || 'Erreur !',
                    '',
                    { duration: 5000 }
                );
            });
        
        return promise;
    }
    
    // Changer de position
    setPosition(position) {
        this.currentPosition = position;
    }
    
    // Tout effacer
    clearAll() {
        this.notifications.forEach(notif => notif.close());
        this.queue = [];
        this.updateStats();
    }
    
    // Pause/Reprendre tout
    pauseAll() {
        this.notifications.forEach(notif => notif.pause());
    }
    
    resumeAll() {
        this.notifications.forEach(notif => notif.resume());
    }
    
    // Mettre à jour les statistiques
    updateStats() {
        this.stats.queued = this.queue.length;
        
        document.getElementById('total-notifications').textContent = this.stats.total;
        document.getElementById('active-notifications').textContent = this.stats.active;
        document.getElementById('queue-count').textContent = this.stats.queued;
    }
}

// ========================================
// ÉTAPE 3: INSTANCE GLOBALE
// ========================================

const notificationSystem = new NotificationSystem();

// ========================================
// ÉTAPE 4: FONCTIONS DE DÉMONSTRATION
// ========================================

function getConfig() {
    return {
        autoClose: document.getElementById('auto-close').checked,
        showProgress: document.getElementById('show-progress').checked,
        pausable: document.getElementById('pausable').checked,
        closeOnClick: document.getElementById('clickable').checked,
        duration: parseInt(document.getElementById('duration-slider').value)
    };
}

function showDemoNotification(type) {
    const config = getConfig();
    
    const titles = {
        success: 'Opération réussie !',
        error: 'Une erreur est survenue',
        warning: 'Attention',
        info: 'Information'
    };
    
    const messages = {
        success: 'Votre action a été effectuée avec succès.',
        error: 'Impossible de terminer l\'opération.',
        warning: 'Veuillez vérifier vos informations.',
        info: 'Nouvelle mise à jour disponible.'
    };
    
    notificationSystem.show({
        type,
        title: titles[type],
        message: messages[type],
        ...config
    });
}

function changePosition(position) {
    notificationSystem.setPosition(position);
    
    // Feedback visuel
    document.querySelectorAll('.position-btn').forEach(btn => {
        btn.style.background = '';
    });
    event.target.style.background = '#6366f1';
    event.target.style.color = 'white';
}

function showNotificationWithAction() {
    const config = getConfig();
    
    notificationSystem.show({
        type: 'info',
        title: 'Nouvelle fonctionnalité',
        message: 'Découvrez les dernières nouveautés de notre application.',
        action: {
            text: 'En savoir plus',
            onClick: () => {
                alert('Vous avez cliqué sur l\'action !');
            }
        },
        ...config
    });
}

function showPromiseNotification() {
    // Simuler une requête async
    const fakeRequest = new Promise((resolve, reject) => {
        setTimeout(() => {
            Math.random() > 0.5 ? resolve() : reject();
        }, 2000);
    });
    
    notificationSystem.promise(fakeRequest, {
        pending: 'Chargement des données...',
        success: 'Données chargées avec succès !',
        error: 'Erreur lors du chargement'
    });
}

function showMultipleNotifications() {
    const types = ['success', 'error', 'warning', 'info', 'success'];
    
    types.forEach((type, index) => {
        setTimeout(() => {
            showDemoNotification(type);
        }, index * 200);
    });
}

function showPriorityNotification() {
    notificationSystem.show({
        type: 'error',
        title: '🚨 URGENT',
        message: 'Cette notification a une priorité élevée et passe devant les autres.',
        priority: 10,
        duration: 10000
    });
}

function showQueueStatus() {
    notificationSystem.info(
        'État de la file',
        `Actives: ${notificationSystem.stats.active} | En attente: ${notificationSystem.stats.queued}`
    );
}

let allPaused = false;
function togglePauseAll() {
    if (allPaused) {
        notificationSystem.resumeAll();
    } else {
        notificationSystem.pauseAll();
    }
    allPaused = !allPaused;
}

// ========================================
// ÉTAPE 5: INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Slider de durée
    const durationSlider = document.getElementById('duration-slider');
    const durationValue = document.getElementById('duration-value');
    
    durationSlider.addEventListener('input', (e) => {
        durationValue.textContent = e.target.value;
    });
    
    // Notification de bienvenue
    setTimeout(() => {
        notificationSystem.success(
            'Bienvenue ! 👋',
            'Le système de notifications est prêt à l\'emploi.',
            { duration: 5000 }
        );
    }, 500);
    
    console.log('✅ Système de notifications initialisé !');
});