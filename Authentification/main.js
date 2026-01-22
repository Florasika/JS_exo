// ========================================
// ÉTAPE 1: ARCHITECTURE & MODULES
// ========================================

// Module de hashing simplifié (simulation)
const HashModule = {
    // Fonction simple de "hashing" (ATTENTION: pas sécurisé en production)
    hash: function(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        // Convertir en string et ajouter un sel
        return 'hashed_' + Math.abs(hash).toString(16) + '_' + password.length;
    },
    
    verify: function(password, hashedPassword) {
        return this.hash(password) === hashedPassword;
    }
};

// Module de gestion des utilisateurs
const UserManager = {
    STORAGE_KEY: 'app_users',
    
    // Charger tous les utilisateurs
    getAllUsers: function() {
        const users = localStorage.getItem(this.STORAGE_KEY);
        return users ? JSON.parse(users) : [];
    },
    
    // Sauvegarder tous les utilisateurs
    saveUsers: function(users) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    },
    
    // Trouver un utilisateur par email
    findByEmail: function(email) {
        const users = this.getAllUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },
    
    // Créer un utilisateur
    create: function(userData) {
        const users = this.getAllUsers();
        
        // Vérifier si l'email existe déjà
        if (this.findByEmail(userData.email)) {
            throw new Error('Cet email est déjà utilisé');
        }
        
        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: HashModule.hash(userData.password),
            role: userData.role || 'user',
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        users.push(newUser);
        this.saveUsers(users);
        
        return newUser;
    },
    
    // Mettre à jour un utilisateur
    update: function(userId, updates) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === userId);
        
        if (index === -1) {
            throw new Error('Utilisateur introuvable');
        }
        
        // Si le mot de passe est modifié, le hasher
        if (updates.password) {
            updates.password = HashModule.hash(updates.password);
        }
        
        users[index] = { ...users[index], ...updates };
        this.saveUsers(users);
        
        return users[index];
    },
    
    // Supprimer un utilisateur
    delete: function(userId) {
        const users = this.getAllUsers();
        const filtered = users.filter(u => u.id !== userId);
        this.saveUsers(filtered);
    },
    
    // Mettre à jour la dernière connexion
    updateLastLogin: function(userId) {
        this.update(userId, { lastLogin: new Date().toISOString() });
    }
};

// Module de gestion de session
const SessionManager = {
    SESSION_KEY: 'app_session',
    
    // Créer une session
    create: function(user) {
        const session = {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: new Date().toISOString()
        };
        
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        
        // Mettre à jour la dernière connexion
        UserManager.updateLastLogin(user.id);
        
        return session;
    },
    
    // Récupérer la session actuelle
    get: function() {
        const session = sessionStorage.getItem(this.SESSION_KEY);
        return session ? JSON.parse(session) : null;
    },
    
    // Détruire la session
    destroy: function() {
        sessionStorage.removeItem(this.SESSION_KEY);
    },
    
    // Vérifier si l'utilisateur est connecté
    isAuthenticated: function() {
        return this.get() !== null;
    },
    
    // Vérifier si l'utilisateur est admin
    isAdmin: function() {
        const session = this.get();
        return session && session.role === 'admin';
    }
};

// Module d'authentification
const AuthModule = {
    // Connexion
    login: function(email, password) {
        const user = UserManager.findByEmail(email);
        
        if (!user) {
            throw new Error('Email ou mot de passe incorrect');
        }
        
        if (!HashModule.verify(password, user.password)) {
            throw new Error('Email ou mot de passe incorrect');
        }
        
        return SessionManager.create(user);
    },
    
    // Inscription
    register: function(userData) {
        return UserManager.create(userData);
    },
    
    // Déconnexion
    logout: function() {
        SessionManager.destroy();
    },
    
    // Changer le mot de passe
    changePassword: function(userId, currentPassword, newPassword) {
        const users = UserManager.getAllUsers();
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            throw new Error('Utilisateur introuvable');
        }
        
        if (!HashModule.verify(currentPassword, user.password)) {
            throw new Error('Mot de passe actuel incorrect');
        }
        
        UserManager.update(userId, { password: newPassword });
    }
};

// ========================================
// ÉTAPE 2: INITIALISATION DES DONNÉES
// ========================================

function initializeDefaultUsers() {
    const users = UserManager.getAllUsers();
    
    if (users.length === 0) {
        // Créer un admin par défaut
        UserManager.create({
            name: 'Administrateur',
            email: 'admin@test.com',
            password: 'admin123',
            role: 'admin'
        });
        
        // Créer un utilisateur par défaut
        UserManager.create({
            name: 'Utilisateur Test',
            email: 'user@test.com',
            password: 'user123',
            role: 'user'
        });
        
        console.log('✅ Utilisateurs par défaut créés');
    }
}

// ========================================
// ÉTAPE 3: GESTION DE LA NAVIGATION
// ========================================

const Router = {
    currentPage: 'login',
    
    navigateTo: function(pageName) {
        // Cacher toutes les pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Afficher la page demandée
        const page = document.getElementById(`${pageName}-page`);
        if (page) {
            // Vérifier si la page est protégée
            if (page.classList.contains('protected')) {
                if (!SessionManager.isAuthenticated()) {
                    this.navigateTo('login');
                    return;
                }
            }
            
            // Vérifier si la page est réservée aux admins
            if (page.classList.contains('admin-only')) {
                if (!SessionManager.isAdmin()) {
                    this.navigateTo('dashboard');
                    return;
                }
            }
            
            page.classList.add('active');
            this.currentPage = pageName;
            
            // Charger les données de la page si nécessaire
            this.loadPageData(pageName);
        }
    },
    
    loadPageData: function(pageName) {
        switch (pageName) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'admin':
                loadAdminData();
                break;
            case 'profile':
                loadProfileData();
                break;
        }
    }
};

// ========================================
// ÉTAPE 4: GESTION DE L'INTERFACE
// ========================================

function updateUI() {
    const session = SessionManager.get();
    const guestMenu = document.getElementById('guest-menu');
    const userMenu = document.getElementById('user-menu');
    
    if (session) {
        // Utilisateur connecté
        guestMenu.classList.add('hidden');
        userMenu.classList.remove('hidden');
        
        document.getElementById('username-display').textContent = session.name;
        
        const roleBadge = document.getElementById('role-badge');
        roleBadge.textContent = session.role === 'admin' ? 'Admin' : 'User';
        roleBadge.className = `role-badge ${session.role}`;
        
        // Afficher/masquer les éléments admin
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            if (session.role === 'admin') {
                el.classList.add('show');
                el.style.display = '';
            } else {
                el.classList.remove('show');
                el.style.display = 'none';
            }
        });
        
        // Naviguer vers le dashboard si on est sur login/register
        if (Router.currentPage === 'login' || Router.currentPage === 'register') {
            Router.navigateTo('dashboard');
        }
    } else {
        // Utilisateur non connecté
        guestMenu.classList.remove('hidden');
        userMenu.classList.add('hidden');
        
        // Naviguer vers login si on est sur une page protégée
        const currentPageElement = document.querySelector('.page.active');
        if (currentPageElement && currentPageElement.classList.contains('protected')) {
            Router.navigateTo('login');
        }
    }
}

// ========================================
// ÉTAPE 5: GESTIONNAIRES DE FORMULAIRES
// ========================================

// Connexion
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    try {
        AuthModule.login(email, password);
        updateUI();
        errorDiv.classList.add('hidden');
        this.reset();
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
    }
});

// Inscription
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');
    
    try {
        // Vérifier que les mots de passe correspondent
        if (password !== confirm) {
            throw new Error('Les mots de passe ne correspondent pas');
        }
        
        AuthModule.register({ name, email, password });
        
        errorDiv.classList.add('hidden');
        successDiv.textContent = 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.';
        successDiv.classList.remove('hidden');
        
        this.reset();
        
        // Rediriger vers la connexion après 2 secondes
        setTimeout(() => {
            Router.navigateTo('login');
        }, 2000);
    } catch (error) {
        successDiv.classList.add('hidden');
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
    }
});

// Changement de mot de passe
document.getElementById('change-password-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const session = SessionManager.get();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    const errorDiv = document.getElementById('password-change-error');
    const successDiv = document.getElementById('password-change-success');
    
    try {
        if (newPassword !== confirmPassword) {
            throw new Error('Les nouveaux mots de passe ne correspondent pas');
        }
        
        AuthModule.changePassword(session.userId, currentPassword, newPassword);
        
        errorDiv.classList.add('hidden');
        successDiv.textContent = 'Mot de passe modifié avec succès !';
        successDiv.classList.remove('hidden');
        
        this.reset();
    } catch (error) {
        successDiv.classList.add('hidden');
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
    }
});

// ========================================
// ÉTAPE 6: CHARGEMENT DES DONNÉES
// ========================================

function loadDashboardData() {
    const session = SessionManager.get();
    if (!session) return;
    
    document.getElementById('dashboard-username').textContent = session.name;
    document.getElementById('account-type').textContent = 
        session.role === 'admin' ? 'Administrateur' : 'Utilisateur';
    
    const user = UserManager.getAllUsers().find(u => u.id === session.userId);
    if (user) {
        const memberSince = new Date(user.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long'
        });
        document.getElementById('member-since').textContent = memberSince;
    }
}

function loadProfileData() {
    const session = SessionManager.get();
    if (!session) return;
    
    const user = UserManager.getAllUsers().find(u => u.id === session.userId);
    if (!user) return;
    
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-role').textContent = 
        user.role === 'admin' ? 'Administrateur' : 'Utilisateur';
    
    const joinedDate = new Date(user.createdAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('profile-joined').textContent = joinedDate;
}

function loadAdminData() {
    const users = UserManager.getAllUsers();
    
    // Statistiques
    document.getElementById('total-users').textContent = users.length;
    document.getElementById('total-admins').textContent = 
        users.filter(u => u.role === 'admin').length;
    document.getElementById('active-sessions').textContent = 
        SessionManager.get() ? '1' : '0';
    
    // Table des utilisateurs
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <span class="user-role-badge ${user.role}">
                    ${user.role === 'admin' ? 'Admin' : 'User'}
                </span>
            </td>
            <td>${new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
            <td>
                ${user.role !== 'admin' ? `
                    <button class="action-btn btn-change-role" data-user-id="${user.id}">
                        Promouvoir Admin
                    </button>
                ` : ''}
                <button class="action-btn btn-delete" data-user-id="${user.id}">
                    Supprimer
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Événements pour les boutons d'action
    document.querySelectorAll('.btn-change-role').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.dataset.userId;
            changeUserRole(userId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.dataset.userId;
            deleteUser(userId);
        });
    });
}

// ========================================
// ÉTAPE 7: ACTIONS ADMIN
// ========================================

function changeUserRole(userId) {
    if (confirm('Promouvoir cet utilisateur en administrateur ?')) {
        UserManager.update(userId, { role: 'admin' });
        loadAdminData();
    }
}

function deleteUser(userId) {
    const session = SessionManager.get();
    
    // Empêcher la suppression de soi-même
    if (session.userId === userId) {
        alert('Vous ne pouvez pas supprimer votre propre compte');
        return;
    }
    
    if (confirm('Supprimer cet utilisateur définitivement ?')) {
        UserManager.delete(userId);
        loadAdminData();
    }
}

// ========================================
// ÉTAPE 8: ÉVÉNEMENTS GLOBAUX
// ========================================

// Navigation
document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.dataset.page;
        Router.navigateTo(page);
    });
});

// Déconnexion
document.getElementById('logout-btn').addEventListener('click', function() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        AuthModule.logout();
        updateUI();
        Router.navigateTo('login');
    }
});

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function() {
        const targetId = this.dataset.target;
        const input = document.getElementById(targetId);
        
        if (input.type === 'password') {
            input.type = 'text';
            this.textContent = '🙈';
        } else {
            input.type = 'password';
            this.textContent = '👁️';
        }
    });
});

// ========================================
// ÉTAPE 9: INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les utilisateurs par défaut
    initializeDefaultUsers();
    
    // Mettre à jour l'interface
    updateUI();
    
    // Naviguer vers la page appropriée
    if (SessionManager.isAuthenticated()) {
        Router.navigateTo('dashboard');
    } else {
        Router.navigateTo('login');
    }
    
    console.log('✅ Application d\'authentification chargée');
    console.log('👤 Utilisateurs disponibles:', UserManager.getAllUsers().length);
});
