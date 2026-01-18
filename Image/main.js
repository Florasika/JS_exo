// ========================================
// ÉTAPE 1: SÉLECTION DES ÉLÉMENTS HTML
// ========================================

const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const filterButtons = document.querySelectorAll('.filter-btn');
const gridViewBtn = document.getElementById('grid-view');
const listViewBtn = document.getElementById('list-view');
const sortSelect = document.getElementById('sort-select');
const resultsCount = document.getElementById('results-count');
const noResults = document.getElementById('no-results');
const loader = document.getElementById('loader');
const loadMoreBtn = document.getElementById('load-more');

// Éléments de la modale
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal');
const prevImageBtn = document.getElementById('prev-image');
const nextImageBtn = document.getElementById('next-image');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalCategory = document.getElementById('modal-category');
const modalDate = document.getElementById('modal-date');
const modalCounter = document.getElementById('modal-counter');

// ========================================
// ÉTAPE 2: BASE DE DONNÉES D'IMAGES
// ========================================

const imagesDatabase = [
    {
        id: 1,
        title: 'Montagne enneigée',
        description: 'Vue spectaculaire d\'une montagne couverte de neige au lever du soleil',
        category: 'nature',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        date: '2024-01-15'
    },
    {
        id: 2,
        title: 'Architecture moderne',
        description: 'Bâtiment contemporain avec des lignes épurées et du verre',
        category: 'architecture',
        url: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800',
        date: '2024-01-14'
    },
    {
        id: 3,
        title: 'Chat domestique',
        description: 'Adorable chat tigré aux yeux verts regardant la caméra',
        category: 'animals',
        url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
        date: '2024-01-13'
    },
    {
        id: 4,
        title: 'Plat gastronomique',
        description: 'Assiette raffinée de cuisine française',
        category: 'food',
        url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        date: '2024-01-12'
    },
    {
        id: 5,
        title: 'Ordinateur portable',
        description: 'Setup de travail moderne avec ordinateur et accessoires',
        category: 'technology',
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800',
        date: '2024-01-11'
    },
    {
        id: 6,
        title: 'Forêt tropicale',
        description: 'Végétation luxuriante dans une jungle tropicale',
        category: 'nature',
        url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800',
        date: '2024-01-10'
    },
    {
        id: 7,
        title: 'Gratte-ciel',
        description: 'Vue en contre-plongée de buildings dans une grande ville',
        category: 'architecture',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
        date: '2024-01-09'
    },
    {
        id: 8,
        title: 'Chien golden retriever',
        description: 'Golden retriever souriant dans un parc',
        category: 'animals',
        url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
        date: '2024-01-08'
    },
    {
        id: 9,
        title: 'Pizza artisanale',
        description: 'Pizza fraîche sortie du four avec ingrédients de qualité',
        category: 'food',
        url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
        date: '2024-01-07'
    },
    {
        id: 10,
        title: 'Smartphone moderne',
        description: 'Dernière génération de téléphone intelligent',
        category: 'technology',
        url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
        date: '2024-01-06'
    },
    {
        id: 11,
        title: 'Lac de montagne',
        description: 'Eau cristalline reflétant les montagnes environnantes',
        category: 'nature',
        url: 'https://images.unsplash.com/photo-1506765515384-028b60a970df?w=800',
        date: '2024-01-05'
    },
    {
        id: 12,
        title: 'Pont suspendu',
        description: 'Architecture impressionnante d\'un pont moderne',
        category: 'architecture',
        url: 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=800',
        date: '2024-01-04'
    },
    {
        id: 13,
        title: 'Perroquet coloré',
        description: 'Oiseau exotique aux plumes multicolores',
        category: 'animals',
        url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800',
        date: '2024-01-03'
    },
    {
        id: 14,
        title: 'Sushi japonais',
        description: 'Assortiment de sushi fraîchement préparés',
        category: 'food',
        url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
        date: '2024-01-02'
    },
    {
        id: 15,
        title: 'Casque audio',
        description: 'Écouteurs sans fil de haute qualité',
        category: 'technology',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        date: '2024-01-01'
    },
    {
        id: 16,
        title: 'Cascade naturelle',
        description: 'Chute d\'eau puissante dans un environnement préservé',
        category: 'nature',
        url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800',
        date: '2023-12-31'
    },
    {
        id: 17,
        title: 'Maison contemporaine',
        description: 'Villa moderne avec grandes baies vitrées',
        category: 'architecture',
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        date: '2023-12-30'
    },
    {
        id: 18,
        title: 'Lapin mignon',
        description: 'Petit lapin blanc aux oreilles dressées',
        category: 'animals',
        url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800',
        date: '2023-12-29'
    },
    {
        id: 19,
        title: 'Burger gourmet',
        description: 'Hamburger artisanal avec ingrédients frais',
        category: 'food',
        url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
        date: '2023-12-28'
    },
    {
        id: 20,
        title: 'Drone professionnel',
        description: 'Drone équipé de caméra 4K pour la photographie aérienne',
        category: 'technology',
        url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
        date: '2023-12-27'
    }
];

// ========================================
// ÉTAPE 3: VARIABLES GLOBALES
// ========================================

let filteredImages = [...imagesDatabase];
let displayedImages = [];
let currentCategory = 'all';
let currentSearchTerm = '';
let currentSortOption = 'date-desc';
let currentViewMode = 'grid';
let currentModalIndex = 0;
let imagesPerPage = 9;
let currentPage = 1;

// Intersection Observer pour lazy loading
let imageObserver = null;

// ========================================
// ÉTAPE 4: FONCTIONS DE FILTRAGE ET TRI
// ========================================

function filterImages() {
    let result = [...imagesDatabase];
    
    // Filtre par catégorie
    if (currentCategory !== 'all') {
        result = result.filter(img => img.category === currentCategory);
    }
    
    // Filtre par recherche
    if (currentSearchTerm) {
        const searchLower = currentSearchTerm.toLowerCase();
        result = result.filter(img => 
            img.title.toLowerCase().includes(searchLower) ||
            img.description.toLowerCase().includes(searchLower)
        );
    }
    
    // Tri
    result = sortImages(result);
    
    return result;
}

function sortImages(images) {
    const sorted = [...images];
    
    switch (currentSortOption) {
        case 'date-desc':
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'title-asc':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            sorted.sort((a, b) => b.title.localeCompare(a.title));
            break;
    }
    
    return sorted;
}

// ========================================
// ÉTAPE 5: AFFICHAGE DES IMAGES
// ========================================

function displayImages(reset = false) {
    if (reset) {
        currentPage = 1;
        displayedImages = [];
    }
    
    // Calculer les images à afficher
    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const imagesToShow = filteredImages.slice(startIndex, endIndex);
    
    // Si c'est un reset, vider la galerie
    if (reset) {
        gallery.innerHTML = '';
    }
    
    // Créer les cartes d'images
    imagesToShow.forEach((image) => {
        const card = createImageCard(image);
        gallery.appendChild(card);
        displayedImages.push(image);
    });
    
    // Mettre à jour le bouton "Charger plus"
    updateLoadMoreButton();
    
    // Mettre à jour les compteurs
    updateCounts();
    
    // Initialiser le lazy loading
    initializeLazyLoading();
    
    // Afficher/masquer le message "aucun résultat"
    if (filteredImages.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
    }
}

function createImageCard(image) {
    const card = document.createElement('div');
    card.className = `image-card ${currentViewMode === 'list' ? 'list-mode' : ''}`;
    card.dataset.imageId = image.id;
    
    card.innerHTML = `
        <div class="image-wrapper">
            <div class="image-placeholder"></div>
            <img 
                class="card-image lazy" 
                data-src="${image.url}" 
                alt="${image.title}"
            >
        </div>
        <div class="card-info">
            <span class="card-category">${getCategoryName(image.category)}</span>
            <h3 class="card-title">${image.title}</h3>
            <p class="card-description">${image.description}</p>
            <span class="card-date">${formatDate(image.date)}</span>
        </div>
    `;
    
    // Événement de clic pour ouvrir la modale
    card.addEventListener('click', () => {
        openModal(image.id);
    });
    
    return card;
}

// ========================================
// ÉTAPE 6: LAZY LOADING DES IMAGES
// ========================================

function initializeLazyLoading() {
    // Déconnecter l'observer précédent s'il existe
    if (imageObserver) {
        imageObserver.disconnect();
    }
    
    // Créer un nouvel Intersection Observer
    imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                loadImage(img);
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    // Observer toutes les images lazy
    const lazyImages = document.querySelectorAll('.lazy');
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}

function loadImage(img) {
    const src = img.dataset.src;
    
    // Créer une nouvelle image pour précharger
    const tempImg = new Image();
    
    tempImg.onload = () => {
        img.src = src;
        img.classList.remove('lazy');
        
        // Masquer le placeholder et afficher la carte
        const placeholder = img.previousElementSibling;
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        const card = img.closest('.image-card');
        if (card) {
            card.classList.add('loaded');
        }
    };
    
    tempImg.onerror = () => {
        console.error('Erreur de chargement de l\'image:', src);
        img.src = 'https://via.placeholder.com/800x600?text=Erreur';
    };
    
    tempImg.src = src;
}

// ========================================
// ÉTAPE 7: GESTION DE LA MODALE
// ========================================

function openModal(imageId) {
    // Trouver l'index de l'image dans les images filtrées
    currentModalIndex = filteredImages.findIndex(img => img.id === imageId);
    
    if (currentModalIndex === -1) return;
    
    // Afficher la modale
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Charger l'image
    updateModalContent();
}

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function updateModalContent() {
    const image = filteredImages[currentModalIndex];
    
    modalImage.src = image.url;
    modalTitle.textContent = image.title;
    modalDescription.textContent = image.description;
    modalCategory.textContent = getCategoryName(image.category);
    modalDate.textContent = formatDate(image.date);
    modalCounter.textContent = `${currentModalIndex + 1} / ${filteredImages.length}`;
    
    // Gérer les boutons de navigation
    prevImageBtn.disabled = currentModalIndex === 0;
    nextImageBtn.disabled = currentModalIndex === filteredImages.length - 1;
}

function showPreviousImage() {
    if (currentModalIndex > 0) {
        currentModalIndex--;
        updateModalContent();
    }
}

function showNextImage() {
    if (currentModalIndex < filteredImages.length - 1) {
        currentModalIndex++;
        updateModalContent();
    }
}

// ========================================
// ÉTAPE 8: FONCTIONS UTILITAIRES
// ========================================

function getCategoryName(category) {
    const names = {
        nature: 'Nature',
        architecture: 'Architecture',
        animals: 'Animaux',
        food: 'Nourriture',
        technology: 'Technologie'
    };
    return names[category] || category;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function updateCounts() {
    // Compter les images par catégorie
    const counts = {
        all: imagesDatabase.length,
        nature: 0,
        architecture: 0,
        animals: 0,
        food: 0,
        technology: 0
    };
    
    imagesDatabase.forEach(img => {
        counts[img.category]++;
    });
    
    // Mettre à jour les compteurs dans les boutons
    Object.keys(counts).forEach(category => {
        const countElement = document.getElementById(`count-${category}`);
        if (countElement) {
            countElement.textContent = counts[category];
        }
    });
    
    // Mettre à jour le compteur de résultats
    resultsCount.textContent = `${filteredImages.length} image${filteredImages.length > 1 ? 's' : ''}`;
}

function updateLoadMoreButton() {
    const totalDisplayed = currentPage * imagesPerPage;
    
    if (totalDisplayed >= filteredImages.length) {
        loadMoreBtn.classList.add('hidden');
    } else {
        loadMoreBtn.classList.remove('hidden');
    }
}

function applyFiltersAndDisplay() {
    filteredImages = filterImages();
    displayImages(true);
}

// ========================================
// ÉTAPE 9: GESTION DES ÉVÉNEMENTS
// ========================================

// Recherche
searchInput.addEventListener('input', (e) => {
    currentSearchTerm = e.target.value.trim();
    
    // Afficher/masquer le bouton clear
    if (currentSearchTerm) {
        clearSearchBtn.classList.remove('hidden');
    } else {
        clearSearchBtn.classList.add('hidden');
    }
    
    // Appliquer les filtres avec un léger délai (debounce)
    clearTimeout(searchInput.debounceTimer);
    searchInput.debounceTimer = setTimeout(() => {
        applyFiltersAndDisplay();
    }, 300);
});

// Bouton clear recherche
clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchTerm = '';
    clearSearchBtn.classList.add('hidden');
    applyFiltersAndDisplay();
});

// Filtres de catégorie
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Retirer la classe active de tous les boutons
        filterButtons.forEach(b => b.classList.remove('active'));
        
        // Ajouter la classe active au bouton cliqué
        btn.classList.add('active');
        
        // Mettre à jour la catégorie
        currentCategory = btn.dataset.category;
        
        // Appliquer les filtres
        applyFiltersAndDisplay();
    });
});

// Modes d'affichage
gridViewBtn.addEventListener('click', () => {
    currentViewMode = 'grid';
    gallery.classList.remove('list-mode');
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
    
    // Mettre à jour les cartes
    document.querySelectorAll('.image-card').forEach(card => {
        card.classList.remove('list-mode');
    });
});

listViewBtn.addEventListener('click', () => {
    currentViewMode = 'list';
    gallery.classList.add('list-mode');
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
    
    // Mettre à jour les cartes
    document.querySelectorAll('.image-card').forEach(card => {
        card.classList.add('list-mode');
    });
});

// Tri
sortSelect.addEventListener('change', (e) => {
    currentSortOption = e.target.value;
    applyFiltersAndDisplay();
});

// Charger plus d'images
loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    displayImages(false);
});

// Modale - Fermeture
closeModalBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Modale - Navigation
prevImageBtn.addEventListener('click', showPreviousImage);
nextImageBtn.addEventListener('click', showNextImage);

// Navigation clavier
document.addEventListener('keydown', (e) => {
    // Si la modale est ouverte
    if (!modal.classList.contains('hidden')) {
        switch (e.key) {
            case 'Escape':
                closeModal();
                break;
            case 'ArrowLeft':
                showPreviousImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    }
});

// ========================================
// ÉTAPE 10: INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Afficher les images initiales
    filteredImages = filterImages();
    displayImages(true);
    
    console.log('✅ Galerie d\'images chargée !');
    console.log(`📸 ${imagesDatabase.length} images disponibles`);
});