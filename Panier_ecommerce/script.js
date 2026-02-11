// app.js - E-Commerce Cart System with OOP

// ============= CLASSES MÉTIER =============

/**
 * Classe Product - Représente un produit
 */
class Product {
    #id;
    #name;
    #description;
    #price; // Prix HT
    #category;
    #stock;
    #image;
    #taxRate;

    constructor(data) {
        this.#id = data.id;
        this.#name = data.name;
        this.#description = data.description;
        this.#price = data.price;
        this.#category = data.category;
        this.#stock = data.stock;
        this.#image = data.image || '📦';
        this.#taxRate = data.taxRate || 0.20; // TVA 20% par défaut
    }

    // Getters
    getId() {
        return this.#id;
    }

    getName() {
        return this.#name;
    }

    getDescription() {
        return this.#description;
    }

    getPrice() {
        return this.#price;
    }

    getPriceWithTax() {
        return this.#calculatePriceWithTax();
    }

    getCategory() {
        return this.#category;
    }

    getStock() {
        return this.#stock;
    }

    getImage() {
        return this.#image;
    }

    getTaxRate() {
        return this.#taxRate;
    }

    // Méthodes métier
    isAvailable() {
        return this.#stock > 0;
    }

    isLowStock() {
        return this.#stock > 0 && this.#stock <= 5;
    }

    decreaseStock(quantity) {
        if (quantity > this.#stock) {
            throw new Error('Stock insuffisant');
        }
        this.#stock -= quantity;
    }

    increaseStock(quantity) {
        this.#stock += quantity;
    }

    // Méthodes privées
    #calculatePriceWithTax() {
        return this.#price * (1 + this.#taxRate);
    }

    toJSON() {
        return {
            id: this.#id,
            name: this.#name,
            description: this.#description,
            price: this.#price,
            category: this.#category,
            stock: this.#stock,
            image: this.#image,
            taxRate: this.#taxRate
        };
    }
}

/**
 * Classe CartItem - Représente un article dans le panier
 */
class CartItem {
    #product;
    #quantity;

    constructor(product, quantity = 1) {
        if (!(product instanceof Product)) {
            throw new Error('Invalid product');
        }
        this.#product = product;
        this.#quantity = quantity;
    }

    // Getters
    getProduct() {
        return this.#product;
    }

    getQuantity() {
        return this.#quantity;
    }

    // Méthodes métier
    increaseQuantity(amount = 1) {
        if (this.#quantity + amount > this.#product.getStock()) {
            throw new Error('Stock insuffisant');
        }
        this.#quantity += amount;
    }

    decreaseQuantity(amount = 1) {
        if (this.#quantity - amount < 1) {
            throw new Error('Quantité minimale atteinte');
        }
        this.#quantity -= amount;
    }

    setQuantity(quantity) {
        if (quantity < 1) {
            throw new Error('Quantité invalide');
        }
        if (quantity > this.#product.getStock()) {
            throw new Error('Stock insuffisant');
        }
        this.#quantity = quantity;
    }

    getSubtotal() {
        return this.#calculateSubtotal();
    }

    getSubtotalWithTax() {
        return this.#calculateSubtotalWithTax();
    }

    getTaxAmount() {
        return this.#calculateTaxAmount();
    }

    // Méthodes privées
    #calculateSubtotal() {
        return this.#product.getPrice() * this.#quantity;
    }

    #calculateSubtotalWithTax() {
        return this.#product.getPriceWithTax() * this.#quantity;
    }

    #calculateTaxAmount() {
        return this.#calculateSubtotalWithTax() - this.#calculateSubtotal();
    }

    toJSON() {
        return {
            product: this.#product.toJSON(),
            quantity: this.#quantity
        };
    }
}

/**
 * Classe PromoCode - Représente un code promo
 */
class PromoCode {
    #code;
    #discount; // Pourcentage de remise
    #isValid;
    #minAmount; // Montant minimum requis

    constructor(code, discount, minAmount = 0) {
        this.#code = code.toUpperCase();
        this.#discount = discount;
        this.#isValid = true;
        this.#minAmount = minAmount;
    }

    getCode() {
        return this.#code;
    }

    getDiscount() {
        return this.#discount;
    }

    isValid() {
        return this.#isValid;
    }

    getMinAmount() {
        return this.#minAmount;
    }

    invalidate() {
        this.#isValid = false;
    }

    canApply(cartTotal) {
        return this.#isValid && cartTotal >= this.#minAmount;
    }
}

/**
 * Classe Cart - Représente le panier d'achat
 */
class Cart {
    #items;
    #promoCode;
    #shippingCost;
    #observers;

    constructor() {
        this.#items = new Map();
        this.#promoCode = null;
        this.#shippingCost = 0;
        this.#observers = [];
        this.#loadFromStorage();
    }

    // Gestion des articles
    addItem(product, quantity = 1) {
        if (!product.isAvailable()) {
            throw new Error('Produit non disponible');
        }

        const productId = product.getId();

        if (this.#items.has(productId)) {
            const cartItem = this.#items.get(productId);
            cartItem.increaseQuantity(quantity);
        } else {
            const cartItem = new CartItem(product, quantity);
            this.#items.set(productId, cartItem);
        }

        this.#updateShippingCost();
        this.#saveToStorage();
        this.#notifyObservers();
    }

    removeItem(productId) {
        if (this.#items.has(productId)) {
            this.#items.delete(productId);
            this.#updateShippingCost();
            this.#saveToStorage();
            this.#notifyObservers();
        }
    }

    updateQuantity(productId, quantity) {
        if (this.#items.has(productId)) {
            const cartItem = this.#items.get(productId);
            cartItem.setQuantity(quantity);
            this.#updateShippingCost();
            this.#saveToStorage();
            this.#notifyObservers();
        }
    }

    increaseQuantity(productId) {
        if (this.#items.has(productId)) {
            const cartItem = this.#items.get(productId);
            cartItem.increaseQuantity(1);
            this.#updateShippingCost();
            this.#saveToStorage();
            this.#notifyObservers();
        }
    }

    decreaseQuantity(productId) {
        if (this.#items.has(productId)) {
            const cartItem = this.#items.get(productId);
            try {
                cartItem.decreaseQuantity(1);
                this.#updateShippingCost();
                this.#saveToStorage();
                this.#notifyObservers();
            } catch (error) {
                this.removeItem(productId);
            }
        }
    }

    clear() {
        this.#items.clear();
        this.#promoCode = null;
        this.#shippingCost = 0;
        this.#saveToStorage();
        this.#notifyObservers();
    }

    // Code promo
    applyPromoCode(promoCode) {
        const subtotal = this.getSubtotalWithTax();
        
        if (!promoCode.canApply(subtotal)) {
            throw new Error(`Montant minimum de ${promoCode.getMinAmount().toFixed(2)} € requis`);
        }

        this.#promoCode = promoCode;
        this.#saveToStorage();
        this.#notifyObservers();
    }

    removePromoCode() {
        this.#promoCode = null;
        this.#saveToStorage();
        this.#notifyObservers();
    }

    // Getters
    getItems() {
        return Array.from(this.#items.values());
    }

    getItemCount() {
        return this.#items.size;
    }

    getTotalQuantity() {
        return this.getItems().reduce((total, item) => total + item.getQuantity(), 0);
    }

    getSubtotal() {
        return this.#calculateSubtotal();
    }

    getSubtotalWithTax() {
        return this.#calculateSubtotalWithTax();
    }

    getTaxAmount() {
        return this.#calculateTaxAmount();
    }

    getDiscountAmount() {
        return this.#calculateDiscountAmount();
    }

    getShippingCost() {
        return this.#shippingCost;
    }

    getTotal() {
        return this.#calculateTotal();
    }

    getPromoCode() {
        return this.#promoCode;
    }

    isEmpty() {
        return this.#items.size === 0;
    }

    // Calculs privés
    #calculateSubtotal() {
        return this.getItems().reduce((total, item) => total + item.getSubtotal(), 0);
    }

    #calculateSubtotalWithTax() {
        return this.getItems().reduce((total, item) => total + item.getSubtotalWithTax(), 0);
    }

    #calculateTaxAmount() {
        return this.getItems().reduce((total, item) => total + item.getTaxAmount(), 0);
    }

    #calculateDiscountAmount() {
        if (!this.#promoCode) return 0;
        const subtotal = this.getSubtotalWithTax();
        return subtotal * (this.#promoCode.getDiscount() / 100);
    }

    #calculateTotal() {
        const subtotal = this.getSubtotalWithTax();
        const discount = this.getDiscountAmount();
        return subtotal - discount + this.#shippingCost;
    }

    #updateShippingCost() {
        const subtotal = this.getSubtotalWithTax();
        
        if (subtotal === 0) {
            this.#shippingCost = 0;
        } else if (subtotal >= 100) {
            this.#shippingCost = 0; // Livraison gratuite au-dessus de 100€
        } else {
            this.#shippingCost = 5.99;
        }
    }

    // Persistance
    #saveToStorage() {
        const data = {
            items: this.getItems().map(item => item.toJSON()),
            promoCode: this.#promoCode ? {
                code: this.#promoCode.getCode(),
                discount: this.#promoCode.getDiscount(),
                minAmount: this.#promoCode.getMinAmount()
            } : null
        };
        localStorage.setItem('cart', JSON.stringify(data));
    }

    #loadFromStorage() {
        // Note: Dans une vraie application, il faudrait reconstruire
        // les objets Product à partir d'une source de données
        // Pour cette démo, on ne charge pas depuis le storage
        // car on n'a pas accès au catalogue de produits ici
    }

    // Pattern Observer
    subscribe(callback) {
        this.#observers.push(callback);
    }

    #notifyObservers() {
        this.#observers.forEach(callback => callback());
    }
}

/**
 * Classe ProductCatalog - Gère le catalogue de produits
 */
class ProductCatalog {
    #products;

    constructor() {
        this.#products = new Map();
        this.#initializeProducts();
    }

    #initializeProducts() {
        const productsData = [
            {
                id: 1,
                name: 'MacBook Pro 16"',
                description: 'Ordinateur portable haute performance',
                price: 2499.99,
                category: 'electronics',
                stock: 15,
                image: '💻'
            },
            {
                id: 2,
                name: 'iPhone 15 Pro',
                description: 'Smartphone dernière génération',
                price: 1199.99,
                category: 'electronics',
                stock: 25,
                image: '📱'
            },
            {
                id: 3,
                name: 'AirPods Pro',
                description: 'Écouteurs sans fil avec réduction de bruit',
                price: 279.99,
                category: 'electronics',
                stock: 50,
                image: '🎧'
            },
            {
                id: 4,
                name: 'T-Shirt Premium',
                description: 'T-shirt en coton bio de haute qualité',
                price: 29.99,
                category: 'clothing',
                stock: 100,
                image: '👕'
            },
            {
                id: 5,
                name: 'Jeans Slim',
                description: 'Jean coupe slim confortable',
                price: 79.99,
                category: 'clothing',
                stock: 75,
                image: '👖'
            },
            {
                id: 6,
                name: 'Sneakers Sport',
                description: 'Chaussures de sport légères et confortables',
                price: 89.99,
                category: 'clothing',
                stock: 3,
                image: '👟'
            },
            {
                id: 7,
                name: 'Café Bio 1kg',
                description: 'Café arabica 100% bio en grains',
                price: 24.99,
                category: 'food',
                stock: 200,
                image: '☕'
            },
            {
                id: 8,
                name: 'Chocolat Noir 70%',
                description: 'Tablette de chocolat noir premium',
                price: 4.99,
                category: 'food',
                stock: 150,
                image: '🍫'
            },
            {
                id: 9,
                name: 'Livre "Clean Code"',
                description: 'Guide de programmation professionnelle',
                price: 39.99,
                category: 'books',
                stock: 30,
                image: '📚'
            },
            {
                id: 10,
                name: 'Livre "Design Patterns"',
                description: 'Modèles de conception orientés objet',
                price: 44.99,
                category: 'books',
                stock: 0,
                image: '📖'
            }
        ];

        productsData.forEach(data => {
            const product = new Product(data);
            this.#products.set(product.getId(), product);
        });
    }

    getProduct(id) {
        return this.#products.get(id);
    }

    getAllProducts() {
        return Array.from(this.#products.values());
    }

    getProductsByCategory(category) {
        return this.getAllProducts().filter(p => p.getCategory() === category);
    }

    searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllProducts().filter(p => 
            p.getName().toLowerCase().includes(lowerQuery) ||
            p.getDescription().toLowerCase().includes(lowerQuery)
        );
    }

    sortProducts(products, sortBy) {
        const sorted = [...products];
        
        switch(sortBy) {
            case 'name-asc':
                return sorted.sort((a, b) => a.getName().localeCompare(b.getName()));
            case 'name-desc':
                return sorted.sort((a, b) => b.getName().localeCompare(a.getName()));
            case 'price-asc':
                return sorted.sort((a, b) => a.getPrice() - b.getPrice());
            case 'price-desc':
                return sorted.sort((a, b) => b.getPrice() - a.getPrice());
            default:
                return sorted;
        }
    }
}

/**
 * Classe PromoCodeManager - Gère les codes promo
 */
class PromoCodeManager {
    #promoCodes;

    constructor() {
        this.#promoCodes = new Map();
        this.#initializePromoCodes();
    }

    #initializePromoCodes() {
        const codes = [
            new PromoCode('WELCOME10', 10, 0),
            new PromoCode('SAVE20', 20, 100),
            new PromoCode('MEGA50', 50, 500)
        ];

        codes.forEach(code => {
            this.#promoCodes.set(code.getCode(), code);
        });
    }

    validateCode(codeString) {
        const code = this.#promoCodes.get(codeString.toUpperCase());
        if (!code) {
            throw new Error('Code promo invalide');
        }
        if (!code.isValid()) {
            throw new Error('Code promo expiré');
        }
        return code;
    }
}

/**
 * Classe ShopUI - Gère l'interface utilisateur
 */
class ShopUI {
    constructor(catalog, cart, promoManager) {
        this.catalog = catalog;
        this.cart = cart;
        this.promoManager = promoManager;
        this.currentFilter = 'all';
        this.currentSort = 'name-asc';

        this.initializeElements();
        this.attachEventListeners();
        this.cart.subscribe(() => this.renderCart());
        this.render();
    }

    initializeElements() {
        this.productsListEl = document.getElementById('productsList');
        this.cartItemsEl = document.getElementById('cartItems');
        this.emptyCartEl = document.getElementById('emptyCart');
        this.cartSummaryEl = document.getElementById('cartSummary');
        this.cartCountEl = document.getElementById('cartCount');
        
        this.categoryFilterEl = document.getElementById('categoryFilter');
        this.sortByEl = document.getElementById('sortBy');
        
        this.subtotalHTEl = document.getElementById('subtotalHT');
        this.taxAmountEl = document.getElementById('taxAmount');
        this.discountRowEl = document.getElementById('discountRow');
        this.discountPercentEl = document.getElementById('discountPercent');
        this.discountAmountEl = document.getElementById('discountAmount');
        this.shippingCostEl = document.getElementById('shippingCost');
        this.totalTTCEl = document.getElementById('totalTTC');
        
        this.promoCodeInput = document.getElementById('promoCode');
        this.applyPromoBtn = document.getElementById('applyPromo');
        this.clearCartBtn = document.getElementById('clearCart');
        this.checkoutBtn = document.getElementById('checkout');
        
        this.modal = document.getElementById('modal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalCancel = document.getElementById('modalCancel');
        this.modalConfirm = document.getElementById('modalConfirm');
    }

    attachEventListeners() {
        this.categoryFilterEl.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderProducts();
        });

        this.sortByEl.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderProducts();
        });

        this.applyPromoBtn.addEventListener('click', () => this.handleApplyPromo());
        this.clearCartBtn.addEventListener('click', () => this.handleClearCart());
        this.checkoutBtn.addEventListener('click', () => this.handleCheckout());

        this.modalCancel.addEventListener('click', () => this.hideModal());
    }

    render() {
        this.renderProducts();
        this.renderCart();
    }

    renderProducts() {
        let products = this.currentFilter === 'all' 
            ? this.catalog.getAllProducts()
            : this.catalog.getProductsByCategory(this.currentFilter);

        products = this.catalog.sortProducts(products, this.currentSort);

        this.productsListEl.innerHTML = products.map(product => this.renderProductCard(product)).join('');

        // Attach event listeners to add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                this.handleAddToCart(productId);
            });
        });
    }

    renderProductCard(product) {
        const stockClass = !product.isAvailable() ? 'out-of-stock' : 
                          product.isLowStock() ? 'low-stock' : 'in-stock';
        const stockText = !product.isAvailable() ? 'Rupture de stock' :
                         product.isLowStock() ? `Plus que ${product.getStock()} en stock` :
                         'En stock';

        return `
            <div class="product-card">
                <div class="product-image">${product.getImage()}</div>
                <div class="product-name">${product.getName()}</div>
                <span class="product-category">${this.getCategoryLabel(product.getCategory())}</span>
                <div class="product-description">${product.getDescription()}</div>
                <div class="product-footer">
                    <div>
                        <div class="product-price">${product.getPrice().toFixed(2)} € HT</div>
                        <div class="product-stock ${stockClass}">${stockText}</div>
                    </div>
                </div>
                <button 
                    class="add-to-cart-btn" 
                    data-product-id="${product.getId()}"
                    ${!product.isAvailable() ? 'disabled' : ''}
                >
                    ${!product.isAvailable() ? 'Indisponible' : 'Ajouter au panier'}
                </button>
            </div>
        `;
    }

    renderCart() {
        const items = this.cart.getItems();
        
        this.cartCountEl.textContent = this.cart.getTotalQuantity();

        if (items.length === 0) {
            this.cartItemsEl.style.display = 'none';
            this.emptyCartEl.style.display = 'block';
            this.cartSummaryEl.style.display = 'none';
            return;
        }

        this.cartItemsEl.style.display = 'flex';
        this.emptyCartEl.style.display = 'none';
        this.cartSummaryEl.style.display = 'block';

        this.cartItemsEl.innerHTML = items.map(item => this.renderCartItem(item)).join('');

        // Attach event listeners
        this.attachCartItemListeners();

        // Update summary
        this.renderCartSummary();
    }

    renderCartItem(item) {
        const product = item.getProduct();
        const quantity = item.getQuantity();
        const maxStock = product.getStock();

        return `
            <div class="cart-item">
                <div class="item-header">
                    <span class="item-name">${product.getName()}</span>
                    <button class="remove-btn" data-product-id="${product.getId()}">🗑️</button>
                </div>
                <div class="item-price">${product.getPrice().toFixed(2)} € HT / unité</div>
                <div class="item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn qty-decrease" data-product-id="${product.getId()}" ${quantity <= 1 ? 'disabled' : ''}>-</button>
                        <span class="quantity-display">${quantity}</span>
                        <button class="qty-btn qty-increase" data-product-id="${product.getId()}" ${quantity >= maxStock ? 'disabled' : ''}>+</button>
                    </div>
                    <div class="item-total">${item.getSubtotal().toFixed(2)} € HT</div>
                </div>
            </div>
        `;
    }

    attachCartItemListeners() {
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                this.cart.removeItem(productId);
            });
        });

        document.querySelectorAll('.qty-decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                this.cart.decreaseQuantity(productId);
            });
        });

        document.querySelectorAll('.qty-increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                try {
                    this.cart.increaseQuantity(productId);
                } catch (error) {
                    alert(error.message);
                }
            });
        });
    }

    renderCartSummary() {
        this.subtotalHTEl.textContent = `${this.cart.getSubtotal().toFixed(2)} €`;
        this.taxAmountEl.textContent = `${this.cart.getTaxAmount().toFixed(2)} €`;
        this.shippingCostEl.textContent = this.cart.getShippingCost() === 0 
            ? 'GRATUIT' 
            : `${this.cart.getShippingCost().toFixed(2)} €`;
        this.totalTTCEl.textContent = `${this.cart.getTotal().toFixed(2)} €`;

        const promoCode = this.cart.getPromoCode();
        if (promoCode) {
            this.discountRowEl.style.display = 'flex';
            this.discountPercentEl.textContent = promoCode.getDiscount();
            this.discountAmountEl.textContent = `-${this.cart.getDiscountAmount().toFixed(2)} €`;
        } else {
            this.discountRowEl.style.display = 'none';
        }
    }

    handleAddToCart(productId) {
        const product = this.catalog.getProduct(productId);
        try {
            this.cart.addItem(product, 1);
            this.showNotification(`${product.getName()} ajouté au panier`);
        } catch (error) {
            alert(error.message);
        }
    }

    handleApplyPromo() {
        const code = this.promoCodeInput.value.trim();
        if (!code) return;

        try {
            const promoCode = this.promoManager.validateCode(code);
            this.cart.applyPromoCode(promoCode);
            this.showNotification(`Code promo ${code} appliqué avec succès !`);
            this.promoCodeInput.value = '';
        } catch (error) {
            alert(error.message);
        }
    }

    handleClearCart() {
        this.showModal(
            'Vider le panier',
            'Êtes-vous sûr de vouloir vider votre panier ?',
            () => {
                this.cart.clear();
                this.hideModal();
            }
        );
    }

    handleCheckout() {
        this.showModal(
            'Confirmation de commande',
            `Montant total: ${this.cart.getTotal().toFixed(2)} €\n\nValider la commande ?`,
            () => {
                this.showNotification('Commande validée ! Merci pour votre achat 🎉');
                this.cart.clear();
                this.hideModal();
            }
        );
    }

    showModal(title, message, onConfirm) {
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        this.modal.classList.add('show');
        
        this.modalConfirm.onclick = () => {
            onConfirm();
        };
    }

    hideModal() {
        this.modal.classList.remove('show');
    }

    showNotification(message) {
        // Simple alert for now - could be enhanced with a toast notification
        alert(message);
    }

    getCategoryLabel(category) {
        const labels = {
            electronics: 'Électronique',
            clothing: 'Vêtements',
            food: 'Alimentation',
            books: 'Livres'
        };
        return labels[category] || category;
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    const catalog = new ProductCatalog();
    const cart = new Cart();
    const promoManager = new PromoCodeManager();
    const ui = new ShopUI(catalog, cart, promoManager);

    // Exposer pour le debugging
    window.shop = { catalog, cart, promoManager, ui };
});