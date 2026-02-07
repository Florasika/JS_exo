// app.js - Main Application File

// Router Class
class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentRoute = null;
        this.init();
    }

    init() {
        // Gérer les clics sur les liens
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigateTo(e.target.href);
            }
        });

        // Gérer les boutons précédent/suivant du navigateur
        window.addEventListener('popstate', () => {
            this.loadRoute();
        });

        // Charger la route initiale
        this.loadRoute();
    }

    navigateTo(url) {
        history.pushState(null, null, url);
        this.loadRoute();
    }

    async loadRoute() {
        // Afficher le loader
        this.showLoading();

        // Obtenir le chemin actuel
        const path = window.location.pathname;

        // Trouver la route correspondante
        let route = this.routes.find(r => r.path === path);

        // Si aucune route n'est trouvée, utiliser la page 404
        if (!route) {
            route = this.routes.find(r => r.path === '*');
        }

        // Mettre à jour les liens actifs
        this.updateActiveLinks(path);

        try {
            // Lazy loading de la vue
            const view = await route.view();
            
            // Rendre le contenu
            this.render(view);
            
            this.currentRoute = route;
        } catch (error) {
            console.error('Erreur de chargement de la route:', error);
            this.render(new Error404View());
        } finally {
            this.hideLoading();
        }
    }

    render(view) {
        const content = document.getElementById('content');
        content.innerHTML = view.getHtml();
        
        // Exécuter le code JavaScript de la vue si présent
        if (view.afterRender) {
            view.afterRender();
        }
    }

    updateActiveLinks(path) {
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === path) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
}

// Base View Class
class View {
    constructor() {
        this.title = 'Mini SPA';
    }

    getHtml() {
        return `<div>Page non implémentée</div>`;
    }

    afterRender() {
        // Hook pour exécuter du code après le rendu
    }
}

// Home View
class HomeView extends View {
    constructor() {
        super();
        this.title = 'Accueil';
    }

    getHtml() {
        return `
            <div class="page">
                <h1>🏠 Bienvenue sur Mini SPA</h1>
                <p>Une application single-page sans framework avec routing et lazy loading.</p>
                
                <div class="features">
                    <div class="feature">
                        <h3>🚀 Routing</h3>
                        <p>Navigation fluide avec l'History API</p>
                    </div>
                    <div class="feature">
                        <h3>⚡ Lazy Loading</h3>
                        <p>Chargement conditionnel des composants</p>
                    </div>
                    <div class="feature">
                        <h3>🏗️ Architecture MVC</h3>
                        <p>Séparation claire des responsabilités</p>
                    </div>
                    <div class="feature">
                        <h3>📱 Responsive</h3>
                        <p>Interface adaptative et moderne</p>
                    </div>
                </div>

                <h2>Fonctionnalités</h2>
                <p>Cette mini SPA démontre les concepts fondamentaux nécessaires pour comprendre React, Vue ou Angular :</p>
                <ul style="margin-left: 2rem; color: var(--text-secondary);">
                    <li>Gestion des routes client-side</li>
                    <li>Chargement dynamique des vues</li>
                    <li>État de l'application</li>
                    <li>Rendu conditionnel</li>
                    <li>Lifecycle hooks</li>
                </ul>
            </div>
        `;
    }
}

// About View
class AboutView extends View {
    constructor() {
        super();
        this.title = 'À propos';
    }

    getHtml() {
        return `
            <div class="page">
                <h1>📚 À propos</h1>
                <p>Cette application démontre les concepts fondamentaux d'une Single Page Application (SPA) sans utiliser de framework.</p>
                
                <h2>Technologies utilisées</h2>
                <div class="cards-grid">
                    <div class="card">
                        <h3>HTML5</h3>
                        <p>Structure sémantique et moderne</p>
                    </div>
                    <div class="card">
                        <h3>CSS3</h3>
                        <p>Styles personnalisés avec variables CSS</p>
                    </div>
                    <div class="card">
                        <h3>JavaScript ES6+</h3>
                        <p>Classes, modules, async/await</p>
                    </div>
                    <div class="card">
                        <h3>History API</h3>
                        <p>Gestion de la navigation</p>
                    </div>
                </div>

                <h2>Architecture</h2>
                <p>L'application suit le pattern MVC (Model-View-Controller) :</p>
                <ul style="margin-left: 2rem; color: var(--text-secondary);">
                    <li><strong>Model</strong> : Gestion des données (simulé)</li>
                    <li><strong>View</strong> : Classes de vues avec méthode getHtml()</li>
                    <li><strong>Controller</strong> : Router qui orchestre tout</li>
                </ul>
            </div>
        `;
    }
}

// Products View
class ProductsView extends View {
    constructor() {
        super();
        this.title = 'Produits';
        this.products = [
            { id: 1, name: 'Produit 1', description: 'Description du produit 1', price: '29.99€' },
            { id: 2, name: 'Produit 2', description: 'Description du produit 2', price: '39.99€' },
            { id: 3, name: 'Produit 3', description: 'Description du produit 3', price: '49.99€' },
            { id: 4, name: 'Produit 4', description: 'Description du produit 4', price: '59.99€' },
            { id: 5, name: 'Produit 5', description: 'Description du produit 5', price: '69.99€' },
            { id: 6, name: 'Produit 6', description: 'Description du produit 6', price: '79.99€' }
        ];
    }

    getHtml() {
        const productsHtml = this.products.map(product => `
            <div class="card" data-product-id="${product.id}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="price">${product.price}</div>
            </div>
        `).join('');

        return `
            <div class="page">
                <h1>🛍️ Nos Produits</h1>
                <p>Découvrez notre gamme de produits avec chargement dynamique.</p>
                
                <div class="cards-grid">
                    ${productsHtml}
                </div>
            </div>
        `;
    }

    afterRender() {
        // Ajouter des événements après le rendu
        document.querySelectorAll('.card[data-product-id]').forEach(card => {
            card.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.productId;
                const product = this.products.find(p => p.id == productId);
                alert(`Produit sélectionné : ${product.name}\nPrix : ${product.price}`);
            });
        });
    }
}

// Contact View
class ContactView extends View {
    constructor() {
        super();
        this.title = 'Contact';
    }

    getHtml() {
        return `
            <div class="page">
                <h1>📧 Contactez-nous</h1>
                <p>Remplissez le formulaire ci-dessous pour nous envoyer un message.</p>
                
                <form id="contactForm" style="max-width: 600px; margin-top: 2rem;">
                    <div class="form-group">
                        <label for="name">Nom</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="message">Message</label>
                        <textarea id="message" name="message" required></textarea>
                    </div>
                    
                    <button type="submit" class="btn">Envoyer</button>
                </form>

                <div id="formMessage" style="margin-top: 1rem; display: none;"></div>
            </div>
        `;
    }

    afterRender() {
        const form = document.getElementById('contactForm');
        const messageDiv = document.getElementById('formMessage');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Simuler l'envoi du formulaire
            messageDiv.style.display = 'block';
            messageDiv.style.color = 'var(--primary-color)';
            messageDiv.innerHTML = `
                <p><strong>Message envoyé avec succès !</strong></p>
                <p>Nom: ${data.name}</p>
                <p>Email: ${data.email}</p>
                <p>Message: ${data.message}</p>
            `;
            
            form.reset();
        });
    }
}

// Error 404 View
class Error404View extends View {
    constructor() {
        super();
        this.title = '404 - Page non trouvée';
    }

    getHtml() {
        return `
            <div class="error-page">
                <h1>404</h1>
                <h2>Page non trouvée</h2>
                <p>La page que vous recherchez n'existe pas.</p>
                <a href="/" class="btn" data-link>Retour à l'accueil</a>
            </div>
        `;
    }
}

// Routes Configuration avec Lazy Loading
const routes = [
    {
        path: '/',
        view: async () => {
            // Simuler le lazy loading
            await new Promise(resolve => setTimeout(resolve, 200));
            return new HomeView();
        }
    },
    {
        path: '/about',
        view: async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            return new AboutView();
        }
    },
    {
        path: '/products',
        view: async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            return new ProductsView();
        }
    },
    {
        path: '/contact',
        view: async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            return new ContactView();
        }
    },
    {
        path: '*',
        view: async () => {
            return new Error404View();
        }
    }
];

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    const app = new Router(routes);
});