// ========================================
// ÉTAPE 1: BASE DE DONNÉES DE PRODUITS
// ========================================

const productsDatabase = [
    // Électronique
    {
        id: 1,
        name: 'Smartphone Galaxy X Pro',
        brand: 'TechPhone',
        category: 'electronique',
        price: 899,
        originalPrice: 1099,
        rating: 4.5,
        reviewsCount: 342,
        inStock: true,
        isNew: true,
        onSale: true,
        image: '📱',
        description: 'Smartphone haut de gamme avec écran OLED'
    },
    {
        id: 2,
        name: 'Ordinateur Portable UltraBook',
        brand: 'ComputerBrand',
        category: 'electronique',
        price: 1299,
        originalPrice: null,
        rating: 4.8,
        reviewsCount: 156,
        inStock: true,
        isNew: true,
        onSale: false,
        image: '💻',
        description: 'Ordinateur portable léger et performant'
    },
    {
        id: 3,
        name: 'Écouteurs Sans Fil Premium',
        brand: 'AudioMax',
        category: 'electronique',
        price: 249,
        originalPrice: 349,
        rating: 4.3,
        reviewsCount: 523,
        inStock: true,
        isNew: false,
        onSale: true,
        image: '🎧',
        description: 'Écouteurs avec réduction de bruit active'
    },
    {
        id: 4,
        name: 'Tablette Pro 12 pouces',
        brand: 'TechPhone',
        category: 'electronique',
        price: 699,
        originalPrice: null,
        rating: 4.6,
        reviewsCount: 234,
        inStock: false,
        isNew: false,
        onSale: false,
        image: '📱',
        description: 'Tablette professionnelle avec stylet'
    },
    {
        id: 5,
        name: 'Montre Connectée Sport',
        brand: 'FitWatch',
        category: 'electronique',
        price: 299,
        originalPrice: 399,
        rating: 4.2,
        reviewsCount: 445,
        inStock: true,
        isNew: false,
        onSale: true,
        image: '⌚',
        description: 'Montre avec suivi santé et GPS'
    },
    {
        id: 6,
        name: 'Appareil Photo Reflex Pro',
        brand: 'PhotoMax',
        category: 'electronique',
        price: 1899,
        originalPrice: null,
        rating: 4.9,
        reviewsCount: 89,
        inStock: true,
        isNew: true,
        onSale: false,
        image: '📷',
        description: 'Appareil photo professionnel 24MP'
    },
    
    // Vêtements
    {
        id: 7,
        name: 'Jean Slim Fit Homme',
        brand: 'DeniMode',
        category: 'vetements',
        price: 79,
        originalPrice: 99,
        rating: 4.4,
        reviewsCount: 678,
        inStock: true,
        isNew: false,
        onSale: true,
        image: '👖',
        description: 'Jean confortable en coton bio'
    },
    {
        id: 8,
        name: 'Robe d\'été Florale',
        brand: 'StyleFemme',
        category: 'vetements',
        price: 59,
        originalPrice: null,
        rating: 4.7,
        reviewsCount: 234,
        inStock: true,
        isNew: true,
        onSale: false,
        image: '👗',
        description: 'Robe légère parfaite pour l\'été'
    },
    {
        id: 9,
        name: 'Veste en Cuir Premium',
        brand: 'LuxuryWear',
        category: 'vetements',
        price: 299,
        originalPrice: 449,
        rating: 4.8,
        reviewsCount: 145,
        inStock: true,
        isNew: false,
        onSale: true,
        image: '🧥',
        description: 'Veste en cuir véritable'
    },
    {
        id: 10,
        name: 'Baskets Running Pro',
        brand: 'SportShoes',
        category: 'vetements',
        price: 129,
        originalPrice: null,
        rating: 4.5,
        reviewsCount: 567,
        inStock: true,
        isNew: true,
        onSale: false,
        image: '👟',
        description: 'Chaussures de course haute performance'
    },
    {
        id: 11,
        name: 'Pull en Laine Mérinos',
        brand: 'WarmWear',
        category: 'vetements',
        price: 89,
        originalPrice: 129,
        rating: 4.6,
        reviewsCount: 234,
        inStock: false,
        isNew: false,
        onSale: true,
        image: '🧶',
        description: 'Pull chaud et doux'
    },
    
    // Maison & Déco
    {
        id: 12,
        name: 'Canapé d\'angle Moderne',
        brand: 'HomeFurniture',
        category: 'maison',
        price: 899,
        originalPrice: 1199,
        rating: 4.7,
        reviewsCount: 123,
        inStock: true,
        isNew: true,
        onSale: true,
        image: '🛋️',
        description: 'Canapé confortable 5 places'
    },
    {
        id: 13,
        name: 'Lampe de Bureau LED',
        brand: 'LightHome',
        category: 'maison',
        price: 49,
        originalPrice: null,
        rating: 4.3,
        reviewsCount: 456,
        inStock: true,
        isNew: false,
        onSale: false,
        image: '💡',
        description: 'Lampe réglable avec USB'
    },
    {
        id: 14,
        name: 'Tapis Scandinave 200x300',
        brand: 'DecoStyle',
        category: 'maison',
        price: 159,
        originalPrice: 219,
        rating: 4.5,
        reviewsCount: 234,
        inStock: true,
        isNew: false,
        onSale: true,
        image: '🎨',
        description: 'Tapis doux style nordique'
    },
    {
        id: 15,
        name: 'Set de Casseroles Inox',
        brand: 'CookPro',
        category: 'maison',
        price: 199,
        originalPrice: null,
        rating: 4.8,
        reviewsCount: 345,
        inStock: true,
        isNew: true,
        onSale: false,
        image: '🍳',
        description: 'Set complet 10 pièces'
    },
    {
        id: 16,
        name: 'Miroir Mural Décoratif',
        brand: 'DecoStyle',
        category: 'maison',
        price: 79,
        originalPrice: 119,
        rating: 4.4,
        reviewsCount: 178,
        inStock: true,
        isNew: false,
        onSale: true,
        image: '🪞',
        description: 'Miroir rond design moderne'
    },
    
    // Sport & Loisirs
    {
        id: 17,
        name: 'Vélo VTT Semi-Rigide',
        brand: 'BikeMax',
        category: 'sport',
        price: 699,
        originalPrice: 899,
        rating: 4.6,
        reviewsCount: 234,
        inStock: true,
        isNew: false,
        onSale: true,
        image: '🚴',
        description: 'VTT 27.5 pouces aluminium'
    },
    {
        id: 18,
        name: 'Tapis de Yoga Premium',
        brand: 'YogaFit',
        category: 'sport',
        price: 39,
        originalPrice: null,
        rating: 4.7,
        reviewsCount: 567,
        inStock: true,
        isNew: true,
        onSale: false,
        image: '🧘',
        description: 'Tapis antidérapant écologique'
    },
    {
        id: 19,
        name: 'Haltères Réglables 20kg',
        brand: 'FitStrong',
        category: 'sport',
        price: 149,
        originalPrice: 199,
        rating: 4.5,
        reviewsCount: 345,
        inStock: true,
        isNew: false,
        onSale: true,
        image: '🏋️',
        description: 'Set d\'haltères modulables'
    },
    {
        id: 20,
        name: 'Raquette de Tennis Pro',
        brand: 'TennisPro',
        category: 'sport',
        price: 189,
        originalPrice: null,
        rating: 4.8,
        reviewsCount: 123,
        inStock: false,
        isNew: true,
        onSale: false,
        image: '🎾',
        description: 'Raquette graphite légère'
    },
    {
        id: 21,
        name: 'Sac de Sport Imperméable',
        brand: 'SportBag',
        category: 'sport',
        price: 59,
        originalPrice: 89,
        rating: 4.4,
        reviewsCount: 456,
        inStock: true,
        isNew: false,
        onSale: true,
        image: '🎒',
        description: 'Grand sac 50L avec compartiments'
    },
    
    // Beauté & Santé
    {
        id: 22,
        name: 'Crème Hydratante Bio',
        brand: 'NatureSkin',
        category: 'beaute',
        price: 29,
        originalPrice: 39,
        rating: 4.6,
        reviewsCount: 789,
        inStock: true,
        isNew: true,
        onSale: true,
        image: '🧴',
        description: 'Crème visage certifiée bio'
    },
    {
        id: 23,
        name: 'Parfum Homme Élégance',
        brand: 'ParfumLux',
        category: 'beaute',
        price: 89,
        originalPrice: null,
        rating: 4.7,
        reviewsCount: 234,
        inStock: true,
        isNew: true,
        onSale: false,
        image: '🧴',
        description: 'Eau de parfum 100ml'
    },
    {
        id: 24,
        name: 'Brosse à Dents Électrique',
        brand: 'DentalCare',
        category: 'beaute',
        price: 79,
        originalPrice: 119,
        rating: 4.5,
        reviewsCount: 456,
        inStock: true,
        isNew: false,
        onSale: true,
        image: '🪥',
        description: 'Brosse sonique rechargeable'
    },
    {
        id: 25,
        name: 'Sèche-Cheveux Professionnel',
        brand: 'HairPro',
        category: 'beaute',
        price: 129,
        originalPrice: null,
        rating: 4.8,
        reviewsCount: 345,
        inStock: true,
        isNew: true,
        onSale: false,
        image: '💇',
        description: 'Sèche-cheveux ionique 2000W'
    },
    {
        id: 26,
        name: 'Coffret Maquillage Complet',
        brand: 'BeautyBox',
        category: 'beaute',
        price: 59,
        originalPrice: 89,
        rating: 4.4,
        reviewsCount: 567,
        inStock: true,
        isNew: false,
        onSale: true,
        image: '💄',
        description: 'Kit maquillage 30 pièces'
    },
    {
        id: 27,
        name: 'Huile Essentielle Lavande',
        brand: 'NatureSkin',
        category: 'beaute',
        price: 19,
        originalPrice: null,
        rating: 4.9,
        reviewsCount: 890,
        inStock: true,
        isNew: false,
        onSale: false,
        image: '🌿',
        description: 'Huile pure 100% naturelle'
    },
    
    // Produits supplémentaires pour plus de variété
    {
        id: 28,
        name: 'Smart TV 55 pouces 4K',
        brand: 'TechPhone',
        category: 'electronique',
        price: 599,
        originalPrice: 799,
        rating: 4.7,
        reviewsCount: 445,
        inStock: true,
        isNew: true,
        onSale: true,
        image: '📺',
        description: 'Téléviseur LED Smart avec HDR'
    },
    {
        id: 29,
        name: 'Enceinte Bluetooth Portable',
        brand: 'AudioMax',
        category: 'electronique',
        price: 89,
        originalPrice: null,
        rating: 4.5,
        reviewsCount: 678,
        inStock: true,
        isNew: false,
        onSale: false,
        image: '🔊',
        description: 'Enceinte waterproof 20h autonomie'
    },
    {
        id: 30,
        name: 'T-shirt Basique Pack x3',
        brand: 'DeniMode',
        category: 'vetements',
        price: 39,
        originalPrice: 59,
        rating: 4.3,
        reviewsCount: 890,
        inStock: true,
        isNew: false,
        onSale: true,
        image: '👕',
        description: 'Pack de 3 t-shirts coton'
    }
];

// ========================================
// ÉTAPE 2: SYSTÈME DE FILTRES
// ========================================

class FilterSystem {
    constructor() {
        this.products = [...productsDatabase];
        this.filteredProducts = [...productsDatabase];
        
        // État des filtres
        this.filters = {
            search: '',
            priceMin: 0,
            priceMax: 2000,
            categories: [],
            rating: 'all',
            inStock: false,
            onSale: false,
            brands: []
        };
        
        this.sortBy = 'pertinence';
        this.viewMode = 'grid';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.extractBrands();
        this.renderBrandFilters();
        this.updateCategoryCounts();
        this.applyFilters();
    }
    
    // ========================================
    // ÉTAPE 3: EVENT LISTENERS
    // ========================================
    
    setupEventListeners() {
        // Recherche
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });
        
        // Prix
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        const priceRange = document.getElementById('price-range');
        
        priceMin.addEventListener('input', (e) => {
            this.filters.priceMin = parseFloat(e.target.value) || 0;
            this.applyFilters();
        });
        
        priceMax.addEventListener('input', (e) => {
            this.filters.priceMax = parseFloat(e.target.value) || 2000;
            this.applyFilters();
        });
        
        priceRange.addEventListener('input', (e) => {
            this.filters.priceMax = parseFloat(e.target.value);
            priceMax.value = e.target.value;
            document.getElementById('range-value').textContent = e.target.value + '€';
            this.applyFilters();
        });
        
        // Catégories
        const categoryAll = document.getElementById('category-all');
        const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
        
        categoryAll.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.filters.categories = [];
                categoryCheckboxes.forEach(cb => cb.checked = false);
                this.applyFilters();
            }
        });
        
        categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    categoryAll.checked = false;
                    this.filters.categories.push(e.target.value);
                } else {
                    const index = this.filters.categories.indexOf(e.target.value);
                    if (index > -1) {
                        this.filters.categories.splice(index, 1);
                    }
                    if (this.filters.categories.length === 0) {
                        categoryAll.checked = true;
                    }
                }
                this.applyFilters();
            });
        });
        
        // Notes
        const ratingInputs = document.querySelectorAll('input[name="rating"]');
        ratingInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.filters.rating = e.target.value;
                this.applyFilters();
            });
        });
        
        // Disponibilité
        const inStockCheckbox = document.getElementById('in-stock');
        const onSaleCheckbox = document.getElementById('on-sale');
        
        inStockCheckbox.addEventListener('change', (e) => {
            this.filters.inStock = e.target.checked;
            this.applyFilters();
        });
        
        onSaleCheckbox.addEventListener('change', (e) => {
            this.filters.onSale = e.target.checked;
            this.applyFilters();
        });
        
        // Tri
        const sortSelect = document.getElementById('sort-select');
        sortSelect.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.applyFilters();
        });
        
        // Vue
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                viewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.viewMode = btn.dataset.view;
                this.renderProducts();
            });
        });
        
        // Reset
        const resetBtn = document.getElementById('reset-filters-btn');
        resetBtn.addEventListener('click', () => this.resetFilters());
    }
    
    // ========================================
    // ÉTAPE 4: EXTRACTION DES MARQUES
    // ========================================
    
    extractBrands() {
        const brands = new Set();
        this.products.forEach(product => {
            brands.add(product.brand);
        });
        this.brands = Array.from(brands).sort();
    }
    
    renderBrandFilters() {
        const brandsContainer = document.getElementById('brands-filter');
        brandsContainer.innerHTML = '';
        
        this.brands.forEach(brand => {
            const label = document.createElement('label');
            label.className = 'filter-option';
            label.innerHTML = `
                <input type="checkbox" value="${brand}" class="brand-checkbox">
                <span>${brand}</span>
                <span class="count" id="count-${brand}">0</span>
            `;
            brandsContainer.appendChild(label);
            
            const checkbox = label.querySelector('input');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.filters.brands.push(brand);
                } else {
                    const index = this.filters.brands.indexOf(brand);
                    if (index > -1) {
                        this.filters.brands.splice(index, 1);
                    }
                }
                this.applyFilters();
            });
        });
    }
    
    // ========================================
    // ÉTAPE 5: APPLICATION DES FILTRES
    // ========================================
    
    applyFilters() {
        console.log('🔍 Application des filtres...');
        
        // Partir de tous les produits
        let results = [...this.products];
        
        // Filtre recherche
        if (this.filters.search) {
            results = results.filter(product => 
                product.name.toLowerCase().includes(this.filters.search) ||
                product.brand.toLowerCase().includes(this.filters.search) ||
                product.description.toLowerCase().includes(this.filters.search)
            );
        }
        
        // Filtre prix
        results = results.filter(product => 
            product.price >= this.filters.priceMin &&
            product.price <= this.filters.priceMax
        );
        
        // Filtre catégories
        if (this.filters.categories.length > 0) {
            results = results.filter(product => 
                this.filters.categories.includes(product.category)
            );
        }
        
        // Filtre notes
        if (this.filters.rating !== 'all') {
            const minRating = parseFloat(this.filters.rating);
            results = results.filter(product => product.rating >= minRating);
        }
        
        // Filtre en stock
        if (this.filters.inStock) {
            results = results.filter(product => product.inStock);
        }
        
        // Filtre en promotion
        if (this.filters.onSale) {
            results = results.filter(product => product.onSale);
        }
        
        // Filtre marques
        if (this.filters.brands.length > 0) {
            results = results.filter(product => 
                this.filters.brands.includes(product.brand)
            );
        }
        
        this.filteredProducts = results;
        
        // Trier
        this.sortProducts();
        
        // Mettre à jour l'affichage
        this.updateCategoryCounts();
        this.renderProducts();
        this.renderActiveFilters();
        
        console.log('✅ Filtres appliqués:', results.length, 'produits');
    }
    
    // ========================================
    // ÉTAPE 6: TRI DES PRODUITS
    // ========================================
    
    sortProducts() {
        switch (this.sortBy) {
            case 'price-asc':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'rating-desc':
                this.filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                this.filteredProducts.sort((a, b) => b.isNew - a.isNew);
                break;
            default: // pertinence
                // Tri par pertinence : produits en stock, en promo, puis par note
                this.filteredProducts.sort((a, b) => {
                    if (a.inStock !== b.inStock) return b.inStock - a.inStock;
                    if (a.onSale !== b.onSale) return b.onSale - a.onSale;
                    return b.rating - a.rating;
                });
        }
    }
    
    // ========================================
    // ÉTAPE 7: AFFICHAGE DES PRODUITS
    // ========================================
    
    renderProducts() {
        const grid = document.getElementById('products-grid');
        const noResults = document.getElementById('no-results');
        const resultsCount = document.getElementById('results-count');
        const productsCount = document.getElementById('products-count');
        
        // Mettre à jour les compteurs
        resultsCount.textContent = this.filteredProducts.length;
        productsCount.textContent = this.products.length;
        
        // Vider la grille
        grid.innerHTML = '';
        
        // Changer la classe selon la vue
        if (this.viewMode === 'list') {
            grid.classList.add('list-view');
        } else {
            grid.classList.remove('list-view');
        }
        
        // Afficher les produits ou message vide
        if (this.filteredProducts.length === 0) {
            grid.classList.add('hidden');
            noResults.classList.remove('hidden');
        } else {
            grid.classList.remove('hidden');
            noResults.classList.add('hidden');
            
            this.filteredProducts.forEach(product => {
                const card = this.createProductCard(product);
                grid.appendChild(card);
            });
        }
    }
    
    createProductCard(product) {
        const div = document.createElement('div');
        div.className = 'product-card';
        
        const discount = product.originalPrice 
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;
        
        const stars = '⭐'.repeat(Math.floor(product.rating));
        
        div.innerHTML = `
            <div class="product-image">
                <span style="font-size: 64px;">${product.image}</span>
                ${product.onSale ? `<div class="product-badge">-${discount}%</div>` : ''}
                ${product.isNew ? `<div class="product-badge new">NOUVEAU</div>` : ''}
                ${product.inStock 
                    ? '<div class="stock-badge">En stock</div>' 
                    : '<div class="stock-badge out-of-stock">Rupture</div>'}
            </div>
            <div class="product-info">
                <div class="product-category">${this.getCategoryName(product.category)}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-brand">par ${product.brand}</div>
                <div class="product-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-count">(${product.reviewsCount})</span>
                </div>
                <div class="product-price">
                    <span class="price-current">${product.price}€</span>
                    ${product.originalPrice ? `
                        <span class="price-original">${product.originalPrice}€</span>
                        <span class="price-discount">-${discount}%</span>
                    ` : ''}
                </div>
            </div>
        `;
        
        return div;
    }
    
    getCategoryName(category) {
        const names = {
            'electronique': 'Électronique',
            'vetements': 'Vêtements',
            'maison': 'Maison & Déco',
            'sport': 'Sport & Loisirs',
            'beaute': 'Beauté & Santé'
        };
        return names[category] || category;
    }
    
    // ========================================
    // ÉTAPE 8: COMPTEURS DE CATÉGORIES
    // ========================================
    
    updateCategoryCounts() {
        // Compter par catégorie
        const counts = {
            all: this.products.length,
            electronique: 0,
            vetements: 0,
            maison: 0,
            sport: 0,
            beaute: 0
        };
        
        this.products.forEach(product => {
            counts[product.category]++;
        });
        
        // Mettre à jour les badges
        Object.keys(counts).forEach(category => {
            const countEl = document.getElementById(`count-${category}`);
            if (countEl) {
                countEl.textContent = counts[category];
            }
        });
        
        // Compter par marque
        this.brands.forEach(brand => {
            const count = this.products.filter(p => p.brand === brand).length;
            const countEl = document.getElementById(`count-${brand}`);
            if (countEl) {
                countEl.textContent = count;
            }
        });
    }
    
    // ========================================
    // ÉTAPE 9: FILTRES ACTIFS (TAGS)
    // ========================================
    
    renderActiveFilters() {
        const container = document.getElementById('active-filters');
        container.innerHTML = '';
        
        const tags = [];
        
        // Tag recherche
        if (this.filters.search) {
            tags.push({
                label: `Recherche: "${this.filters.search}"`,
                action: () => {
                    document.getElementById('search-input').value = '';
                    this.filters.search = '';
                    this.applyFilters();
                }
            });
        }
        
        // Tag prix
        if (this.filters.priceMin > 0 || this.filters.priceMax < 2000) {
            tags.push({
                label: `Prix: ${this.filters.priceMin}€ - ${this.filters.priceMax}€`,
                action: () => {
                    this.filters.priceMin = 0;
                    this.filters.priceMax = 2000;
                    document.getElementById('price-min').value = '';
                    document.getElementById('price-max').value = '';
                    document.getElementById('price-range').value = 2000;
                    document.getElementById('range-value').textContent = '2000€';
                    this.applyFilters();
                }
            });
        }
        
        // Tags catégories
        this.filters.categories.forEach(cat => {
            tags.push({
                label: this.getCategoryName(cat),
                action: () => {
                    const checkbox = document.querySelector(`.category-checkbox[value="${cat}"]`);
                    if (checkbox) checkbox.checked = false;
                    const index = this.filters.categories.indexOf(cat);
                    if (index > -1) {
                        this.filters.categories.splice(index, 1);
                    }
                    if (this.filters.categories.length === 0) {
                        document.getElementById('category-all').checked = true;
                    }
                    this.applyFilters();
                }
            });
        });
        
        // Tag note
        if (this.filters.rating !== 'all') {
            tags.push({
                label: `Note ≥ ${this.filters.rating}⭐`,
                action: () => {
                    document.querySelector('input[name="rating"][value="all"]').checked = true;
                    this.filters.rating = 'all';
                    this.applyFilters();
                }
            });
        }
        
        // Tag en stock
        if (this.filters.inStock) {
            tags.push({
                label: 'En stock',
                action: () => {
                    document.getElementById('in-stock').checked = false;
                    this.filters.inStock = false;
                    this.applyFilters();
                }
            });
        }
        
        // Tag en promo
        if (this.filters.onSale) {
            tags.push({
                label: 'En promotion',
                action: () => {
                    document.getElementById('on-sale').checked = false;
                    this.filters.onSale = false;
                    this.applyFilters();
                }
            });
        }
        
        // Tags marques
        this.filters.brands.forEach(brand => {
            tags.push({
                label: brand,
                action: () => {
                    const checkbox = document.querySelector(`.brand-checkbox[value="${brand}"]`);
                    if (checkbox) checkbox.checked = false;
                    const index = this.filters.brands.indexOf(brand);
                    if (index > -1) {
                        this.filters.brands.splice(index, 1);
                    }
                    this.applyFilters();
                }
            });
        });
        
        // Afficher les tags
        if (tags.length > 0) {
            container.classList.remove('hidden');
            tags.forEach(tag => {
                const tagEl = document.createElement('div');
                tagEl.className = 'filter-tag';
                tagEl.innerHTML = `
                    <span>${tag.label}</span>
                    <button>✕</button>
                `;
                tagEl.querySelector('button').addEventListener('click', tag.action);
                container.appendChild(tagEl);
            });
        } else {
            container.classList.add('hidden');
        }
    }
    
    // ========================================
    // ÉTAPE 10: RESET DES FILTRES
    // ========================================
    
    resetFilters() {
        // Reset search
        document.getElementById('search-input').value = '';
        this.filters.search = '';
        
        // Reset prix
        document.getElementById('price-min').value = '';
        document.getElementById('price-max').value = '';
        document.getElementById('price-range').value = 2000;
        document.getElementById('range-value').textContent = '2000€';
        this.filters.priceMin = 0;
        this.filters.priceMax = 2000;
        
        // Reset catégories
        document.getElementById('category-all').checked = true;
        document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = false);
        this.filters.categories = [];
        
        // Reset note
        document.querySelector('input[name="rating"][value="all"]').checked = true;
        this.filters.rating = 'all';
        
        // Reset disponibilité
        document.getElementById('in-stock').checked = false;
        document.getElementById('on-sale').checked = false;
        this.filters.inStock = false;
        this.filters.onSale = false;
        
        // Reset marques
        document.querySelectorAll('.brand-checkbox').forEach(cb => cb.checked = false);
        this.filters.brands = [];
        
        // Reset tri
        document.getElementById('sort-select').value = 'pertinence';
        this.sortBy = 'pertinence';
        
        console.log('🔄 Filtres réinitialisés');
        
        this.applyFilters();
    }
}

// ========================================
// ÉTAPE 11: FONCTION GLOBALE RESET
// ========================================

function resetAllFilters() {
    if (window.filterSystem) {
        window.filterSystem.resetFilters();
    }
}

// ========================================
// ÉTAPE 12: INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🛍️ Initialisation du système de filtres e-commerce...');
    
    window.filterSystem = new FilterSystem();
    
    console.log('✅ Système de filtres prêt !');
    console.log(`📦 ${productsDatabase.length} produits chargés`);
});