// ========================================
// ÉTAPE 1: GÉNÉRATION DE DONNÉES FICTIVES
// ========================================

function generateMockData(count) {
    const data = [];
    const categories = ['Produit', 'Service', 'Article', 'Élément'];
    const adjectives = ['Premium', 'Standard', 'Pro', 'Elite', 'Basic', 'Advanced'];
    
    for (let i = 1; i <= count; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        
        data.push({
            id: i,
            title: `${adjective} ${category} #${i}`,
            description: `Description détaillée pour l'élément numéro ${i}. Ceci est un exemple de contenu généré automatiquement.`,
            category: category,
            price: (Math.random() * 1000).toFixed(2),
            stock: Math.floor(Math.random() * 100),
            createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
        });
    }
    
    return data;
}

// Générer 200 éléments
const mockData = generateMockData(200);

// ========================================
// ÉTAPE 2: CLASSE PAGINATION RÉUTILISABLE
// ========================================

class Paginator {
    constructor(data, itemsPerPage = 10) {
        this.data = data;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
    }
    
    // Obtenir le nombre total de pages
    getTotalPages() {
        return Math.ceil(this.data.length / this.itemsPerPage);
    }
    
    // Obtenir les éléments de la page courante
    getCurrentPageData() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.data.slice(startIndex, endIndex);
    }
    
    // Aller à une page spécifique
    goToPage(pageNumber) {
        const totalPages = this.getTotalPages();
        
        if (pageNumber < 1) {
            this.currentPage = 1;
        } else if (pageNumber > totalPages) {
            this.currentPage = totalPages;
        } else {
            this.currentPage = pageNumber;
        }
        
        return this.getCurrentPageData();
    }
    
    // Page suivante
    nextPage() {
        return this.goToPage(this.currentPage + 1);
    }
    
    // Page précédente
    previousPage() {
        return this.goToPage(this.currentPage - 1);
    }
    
    // Première page
    firstPage() {
        return this.goToPage(1);
    }
    
    // Dernière page
    lastPage() {
        return this.goToPage(this.getTotalPages());
    }
    
    // Obtenir les statistiques
    getStats() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.data.length);
        
        return {
            total: this.data.length,
            currentPage: this.currentPage,
            totalPages: this.getTotalPages(),
            itemsPerPage: this.itemsPerPage,
            showing: `${startIndex}-${endIndex}`
        };
    }
    
    // Changer le nombre d'éléments par page
    setItemsPerPage(count) {
        this.itemsPerPage = count;
        this.currentPage = 1;
        return this.getCurrentPageData();
    }
}

// ========================================
// ÉTAPE 3: PAGINATION CLASSIQUE
// ========================================

class ClassicPagination {
    constructor() {
        this.paginator = new Paginator(mockData, 10);
        this.listContainer = document.getElementById('classic-list');
        this.paginationContainer = document.getElementById('classic-pagination');
        this.itemsPerPageSelect = document.getElementById('classic-items-per-page');
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupEvents();
    }
    
    render() {
        this.renderItems();
        this.renderPagination();
        this.updateStats();
    }
    
    renderItems() {
        const items = this.paginator.getCurrentPageData();
        this.listContainer.innerHTML = '';
        
        items.forEach(item => {
            const card = this.createItemCard(item);
            this.listContainer.appendChild(card);
        });
    }
    
    createItemCard(item) {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `
            <div class="item-header">
                <h3 class="item-title">${item.title}</h3>
                <span class="item-id">#${item.id}</span>
            </div>
            <p class="item-description">${item.description}</p>
        `;
        return div;
    }
    
    renderPagination() {
        const totalPages = this.paginator.getTotalPages();
        const currentPage = this.paginator.currentPage;
        
        this.paginationContainer.innerHTML = '';
        
        // Bouton Précédent
        const prevBtn = this.createButton('← Précédent', () => {
            this.paginator.previousPage();
            this.render();
        });
        prevBtn.disabled = currentPage === 1;
        this.paginationContainer.appendChild(prevBtn);
        
        // Boutons de pages
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = this.createButton(i, () => {
                this.paginator.goToPage(i);
                this.render();
            });
            
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            
            this.paginationContainer.appendChild(pageBtn);
        }
        
        // Bouton Suivant
        const nextBtn = this.createButton('Suivant →', () => {
            this.paginator.nextPage();
            this.render();
        });
        nextBtn.disabled = currentPage === totalPages;
        this.paginationContainer.appendChild(nextBtn);
    }
    
    createButton(text, onClick) {
        const button = document.createElement('button');
        button.className = 'pagination-btn';
        button.textContent = text;
        button.addEventListener('click', onClick);
        return button;
    }
    
    updateStats() {
        const stats = this.paginator.getStats();
        
        document.getElementById('classic-total').textContent = stats.total;
        document.getElementById('classic-current-page').textContent = stats.currentPage;
        document.getElementById('classic-total-pages').textContent = stats.totalPages;
        document.getElementById('classic-showing').textContent = stats.showing;
    }
    
    setupEvents() {
        this.itemsPerPageSelect.addEventListener('change', (e) => {
            this.paginator.setItemsPerPage(parseInt(e.target.value));
            this.render();
        });
    }
}

// ========================================
// ÉTAPE 4: PAGINATION INTELLIGENTE (avec ellipses)
// ========================================

class SmartPagination {
    constructor() {
        this.paginator = new Paginator(mockData, 12);
        this.listContainer = document.getElementById('smart-list');
        this.paginationContainer = document.getElementById('smart-pagination');
        this.itemsPerPageSelect = document.getElementById('smart-items-per-page');
        this.maxButtonsSelect = document.getElementById('smart-max-buttons');
        this.maxVisibleButtons = 5;
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupEvents();
    }
    
    render() {
        this.renderItems();
        this.renderSmartPagination();
        this.updateStats();
    }
    
    renderItems() {
        const items = this.paginator.getCurrentPageData();
        this.listContainer.innerHTML = '';
        
        items.forEach(item => {
            const card = this.createGridCard(item);
            this.listContainer.appendChild(card);
        });
    }
    
    createGridCard(item) {
        const div = document.createElement('div');
        div.className = 'grid-card';
        
        const icons = ['📦', '🎯', '⭐', '🚀', '💎'];
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];
        
        div.innerHTML = `
            <div class="grid-icon">${randomIcon}</div>
            <h3 class="grid-title">${item.title}</h3>
            <p class="grid-subtitle">${item.category}</p>
        `;
        return div;
    }
    
    renderSmartPagination() {
        const totalPages = this.paginator.getTotalPages();
        const currentPage = this.paginator.currentPage;
        const maxButtons = this.maxVisibleButtons;
        
        this.paginationContainer.innerHTML = '';
        
        // Bouton Précédent
        const prevBtn = this.createButton('←', () => {
            this.paginator.previousPage();
            this.render();
        });
        prevBtn.disabled = currentPage === 1;
        this.paginationContainer.appendChild(prevBtn);
        
        // Calculer la plage de pages à afficher
        let startPage, endPage;
        
        if (totalPages <= maxButtons) {
            // Afficher toutes les pages
            startPage = 1;
            endPage = totalPages;
        } else {
            // Calculer la plage avec ellipses
            const halfMax = Math.floor(maxButtons / 2);
            
            if (currentPage <= halfMax + 1) {
                startPage = 1;
                endPage = maxButtons;
            } else if (currentPage >= totalPages - halfMax) {
                startPage = totalPages - maxButtons + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - halfMax;
                endPage = currentPage + halfMax;
            }
        }
        
        // Première page et ellipse
        if (startPage > 1) {
            this.paginationContainer.appendChild(this.createPageButton(1));
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                this.paginationContainer.appendChild(ellipsis);
            }
        }
        
        // Pages du milieu
        for (let i = startPage; i <= endPage; i++) {
            this.paginationContainer.appendChild(this.createPageButton(i));
        }
        
        // Ellipse et dernière page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                this.paginationContainer.appendChild(ellipsis);
            }
            
            this.paginationContainer.appendChild(this.createPageButton(totalPages));
        }
        
        // Bouton Suivant
        const nextBtn = this.createButton('→', () => {
            this.paginator.nextPage();
            this.render();
        });
        nextBtn.disabled = currentPage === totalPages;
        this.paginationContainer.appendChild(nextBtn);
    }
    
    createPageButton(pageNum) {
        const button = this.createButton(pageNum, () => {
            this.paginator.goToPage(pageNum);
            this.render();
        });
        
        if (pageNum === this.paginator.currentPage) {
            button.classList.add('active');
        }
        
        return button;
    }
    
    createButton(text, onClick) {
        const button = document.createElement('button');
        button.className = 'pagination-btn';
        button.textContent = text;
        button.addEventListener('click', onClick);
        return button;
    }
    
    updateStats() {
        const stats = this.paginator.getStats();
        
        document.getElementById('smart-total').textContent = stats.total;
        document.getElementById('smart-current-page').textContent = stats.currentPage;
        document.getElementById('smart-total-pages').textContent = stats.totalPages;
        document.getElementById('smart-showing').textContent = stats.showing;
    }
    
    setupEvents() {
        this.itemsPerPageSelect.addEventListener('change', (e) => {
            this.paginator.setItemsPerPage(parseInt(e.target.value));
            this.render();
        });
        
        this.maxButtonsSelect.addEventListener('change', (e) => {
            this.maxVisibleButtons = parseInt(e.target.value);
            this.render();
        });
    }
}

// ========================================
// ÉTAPE 5: INFINITE SCROLL
// ========================================

class InfiniteScroll {
    constructor() {
        this.data = [...mockData];
        this.loadedItems = [];
        this.itemsPerBatch = 12;
        this.currentIndex = 0;
        this.listContainer = document.getElementById('infinite-list');
        this.loader = document.getElementById('infinite-loader');
        this.endMessage = document.getElementById('infinite-end');
        this.autoLoadCheckbox = document.getElementById('infinite-auto-load');
        this.scrollToTopBtn = document.getElementById('scroll-to-top');
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.loadMore();
        this.setupScrollListener();
        this.setupEvents();
    }
    
    loadMore() {
        if (this.isLoading || this.currentIndex >= this.data.length) {
            this.showEndMessage();
            return;
        }
        
        this.isLoading = true;
        this.loader.classList.remove('hidden');
        
        // Simuler un délai de chargement
        setTimeout(() => {
            const nextBatch = this.data.slice(
                this.currentIndex,
                this.currentIndex + this.itemsPerBatch
            );
            
            nextBatch.forEach(item => {
                const card = this.createGridCard(item);
                this.listContainer.appendChild(card);
                this.loadedItems.push(item);
            });
            
            this.currentIndex += this.itemsPerBatch;
            this.isLoading = false;
            this.loader.classList.add('hidden');
            
            this.updateStats();
            
            if (this.currentIndex >= this.data.length) {
                this.showEndMessage();
            }
        }, 800);
    }
    
    createGridCard(item) {
        const div = document.createElement('div');
        div.className = 'grid-card';
        
        const icons = ['🎁', '🌟', '🎨', '🎭', '🎪'];
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];
        
        div.innerHTML = `
            <div class="grid-icon">${randomIcon}</div>
            <h3 class="grid-title">${item.title}</h3>
            <p class="grid-subtitle">ID: ${item.id}</p>
        `;
        return div;
    }
    
    setupScrollListener() {
        const section = document.getElementById('infinite-tab');
        
        window.addEventListener('scroll', () => {
            if (!section.classList.contains('active') || !this.autoLoadCheckbox.checked) {
                return;
            }
            
            const scrollPosition = window.scrollY + window.innerHeight;
            const threshold = document.documentElement.scrollHeight - 300;
            
            if (scrollPosition >= threshold && !this.isLoading) {
                this.loadMore();
            }
        });
    }
    
    setupEvents() {
        this.scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    updateStats() {
        document.getElementById('infinite-loaded').textContent = this.loadedItems.length;
        document.getElementById('infinite-total').textContent = this.data.length;
        document.getElementById('infinite-pages-loaded').textContent = 
            Math.ceil(this.loadedItems.length / this.itemsPerBatch);
    }
    
    showEndMessage() {
        this.endMessage.classList.remove('hidden');
    }
    
    reset() {
        this.listContainer.innerHTML = '';
        this.loadedItems = [];
        this.currentIndex = 0;
        this.endMessage.classList.add('hidden');
        this.loadMore();
    }
}

// ========================================
// ÉTAPE 6: LOAD MORE BUTTON
// ========================================

class LoadMorePagination {
    constructor() {
        this.data = [...mockData];
        this.loadedItems = [];
        this.batchSize = 12;
        this.currentIndex = 0;
        this.listContainer = document.getElementById('loadmore-list');
        this.loadMoreBtn = document.getElementById('load-more-btn');
        this.loader = document.getElementById('loadmore-loader');
        this.endMessage = document.getElementById('loadmore-end');
        this.batchSizeSelect = document.getElementById('loadmore-batch-size');
        
        this.init();
    }
    
    init() {
        this.loadMore();
        this.setupEvents();
    }
    
    loadMore() {
        if (this.currentIndex >= this.data.length) {
            this.showEndMessage();
            return;
        }
        
        this.loadMoreBtn.disabled = true;
        this.loader.classList.remove('hidden');
        
        // Simuler un délai de chargement
        setTimeout(() => {
            const nextBatch = this.data.slice(
                this.currentIndex,
                this.currentIndex + this.batchSize
            );
            
            nextBatch.forEach(item => {
                const card = this.createItemCard(item);
                this.listContainer.appendChild(card);
                this.loadedItems.push(item);
            });
            
            this.currentIndex += this.batchSize;
            this.loadMoreBtn.disabled = false;
            this.loader.classList.add('hidden');
            
            this.updateStats();
            
            if (this.currentIndex >= this.data.length) {
                this.showEndMessage();
            }
        }, 600);
    }
    
    createItemCard(item) {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `
            <div class="item-header">
                <h3 class="item-title">${item.title}</h3>
                <span class="item-id">#${item.id}</span>
            </div>
            <p class="item-description">${item.description}</p>
        `;
        return div;
    }
    
    setupEvents() {
        this.loadMoreBtn.addEventListener('click', () => {
            this.loadMore();
        });
        
        this.batchSizeSelect.addEventListener('change', (e) => {
            this.batchSize = parseInt(e.target.value);
        });
    }
    
    updateStats() {
        document.getElementById('loadmore-loaded').textContent = this.loadedItems.length;
        document.getElementById('loadmore-total').textContent = this.data.length;
        document.getElementById('loadmore-remaining').textContent = 
            this.data.length - this.loadedItems.length;
    }
    
    showEndMessage() {
        this.loadMoreBtn.classList.add('hidden');
        this.endMessage.classList.remove('hidden');
    }
    
    reset() {
        this.listContainer.innerHTML = '';
        this.loadedItems = [];
        this.currentIndex = 0;
        this.loadMoreBtn.classList.remove('hidden');
        this.endMessage.classList.add('hidden');
        this.loadMore();
    }
}

// ========================================
// ÉTAPE 7: GESTION DES TABS
// ========================================

class TabManager {
    constructor() {
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        this.setupEvents();
    }
    
    setupEvents() {
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }
    
    switchTab(tabName) {
        // Désactiver tous les tabs
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));
        
        // Activer le tab sélectionné
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
}

// ========================================
// ÉTAPE 8: INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les systèmes de pagination
    const classicPagination = new ClassicPagination();
    const smartPagination = new SmartPagination();
    const infiniteScroll = new InfiniteScroll();
    const loadMorePagination = new LoadMorePagination();
    
    // Initialiser le gestionnaire de tabs
    const tabManager = new TabManager();
    
    console.log('✅ Systèmes de pagination initialisés !');
    console.log(`📊 ${mockData.length} éléments chargés`);
});