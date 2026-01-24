// ========================================
// ÉTAPE 1: BASE DE DONNÉES D'ARTICLES
// ========================================

const articlesDatabase = [
    // Technologie
    {
        id: 1,
        title: "L'Intelligence Artificielle révolutionne le développement web",
        description: "Les nouvelles technologies d'IA transforment la manière dont nous créons des applications web modernes.",
        category: "technology",
        author: "Marie Dupont",
        date: "2024-01-20",
        tags: ["IA", "développement", "web", "innovation"]
    },
    {
        id: 2,
        title: "JavaScript ES2024 : Les nouvelles fonctionnalités",
        description: "Découvrez les dernières additions à JavaScript qui vont simplifier votre code.",
        category: "technology",
        author: "Pierre Martin",
        date: "2024-01-18",
        tags: ["javascript", "programmation", "ES2024"]
    },
    {
        id: 3,
        title: "React vs Vue : Quel framework choisir en 2024",
        description: "Comparaison approfondie des deux frameworks JavaScript les plus populaires.",
        category: "technology",
        author: "Sophie Bernard",
        date: "2024-01-15",
        tags: ["react", "vue", "framework", "frontend"]
    },
    
    // Science
    {
        id: 4,
        title: "Découverte majeure en physique quantique",
        description: "Des scientifiques ont réalisé une percée dans la compréhension de l'intrication quantique.",
        category: "science",
        author: "Dr. Jean Rousseau",
        date: "2024-01-19",
        tags: ["physique", "quantique", "recherche"]
    },
    {
        id: 5,
        title: "Le changement climatique et ses effets",
        description: "Analyse des impacts du réchauffement climatique sur notre planète.",
        category: "science",
        author: "Claire Petit",
        date: "2024-01-17",
        tags: ["climat", "environnement", "écologie"]
    },
    
    // Business
    {
        id: 6,
        title: "Les startups françaises en pleine croissance",
        description: "Tour d'horizon des jeunes entreprises innovantes qui dynamisent l'économie.",
        category: "business",
        author: "Thomas Leroy",
        date: "2024-01-16",
        tags: ["startup", "innovation", "économie"]
    },
    {
        id: 7,
        title: "Stratégies marketing digital pour 2024",
        description: "Les tendances incontournables du marketing en ligne cette année.",
        category: "business",
        author: "Émilie Moreau",
        date: "2024-01-14",
        tags: ["marketing", "digital", "stratégie"]
    },
    
    // Santé
    {
        id: 8,
        title: "Les bienfaits de la méditation quotidienne",
        description: "Comment la pratique régulière de la méditation améliore votre bien-être.",
        category: "health",
        author: "Dr. Anne Dubois",
        date: "2024-01-13",
        tags: ["méditation", "bien-être", "santé mentale"]
    },
    {
        id: 9,
        title: "Nutrition : Les super-aliments de 2024",
        description: "Découvrez les aliments aux propriétés exceptionnelles pour votre santé.",
        category: "health",
        author: "Julien Blanc",
        date: "2024-01-12",
        tags: ["nutrition", "santé", "alimentation"]
    },
    
    // Sports
    {
        id: 10,
        title: "Préparation mentale des athlètes professionnels",
        description: "Les techniques psychologiques utilisées par les champions pour performer.",
        category: "sports",
        author: "Marc Laurent",
        date: "2024-01-11",
        tags: ["sport", "psychologie", "performance"]
    }
];

// Générer plus d'articles pour avoir une base de données conséquente
function generateMoreArticles() {
    const templates = [
        { prefix: "Guide complet", suffix: "pour débutants" },
        { prefix: "Les secrets de", suffix: "révélés" },
        { prefix: "Comment maîtriser", suffix: "en 30 jours" },
        { prefix: "Analyse approfondie de", suffix: "et ses implications" },
        { prefix: "10 astuces pour", suffix: "efficacement" }
    ];
    
    const topics = [
        "Python", "TypeScript", "CSS Grid", "Node.js", "MongoDB",
        "Docker", "Kubernetes", "AWS", "Azure", "GraphQL",
        "Machine Learning", "Deep Learning", "Data Science", "Big Data",
        "Blockchain", "Cryptomonnaies", "NFT", "Métaverse"
    ];
    
    let id = articlesDatabase.length + 1;
    
    topics.forEach(topic => {
        templates.forEach(template => {
            articlesDatabase.push({
                id: id++,
                title: `${template.prefix} ${topic} ${template.suffix}`,
                description: `Article détaillé sur ${topic} avec exemples pratiques et cas d'usage.`,
                category: "technology",
                author: `Expert ${topic}`,
                date: `2024-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                tags: [topic.toLowerCase(), "tutoriel", "guide"]
            });
        });
    });
}

generateMoreArticles();

// ========================================
// ÉTAPE 2: VARIABLES GLOBALES
// ========================================

let allArticles = [...articlesDatabase];
let filteredArticles = [...articlesDatabase];
let currentPage = 1;
const itemsPerPage = 10;
let searchTerm = '';
let currentCategory = 'all';
let currentSort = 'relevance';
let exactMatch = false;
let caseSensitive = false;
let searchStartTime = 0;

// ========================================
// ÉTAPE 3: SÉLECTION DES ÉLÉMENTS
// ========================================

const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const categoryFilter = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-select');
const exactMatchCheckbox = document.getElementById('exact-match');
const caseSensitiveCheckbox = document.getElementById('case-sensitive');
const resultsContainer = document.getElementById('results-container');
const resultsCount = document.getElementById('results-count');
const searchTime = document.getElementById('search-time');
const loading = document.getElementById('loading');
const noResults = document.getElementById('no-results');
const pagination = document.getElementById('pagination');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const totalArticlesSpan = document.getElementById('total-articles');
const displayedArticlesSpan = document.getElementById('displayed-articles');
const searchPerformance = document.getElementById('search-performance');
const suggestions = document.getElementById('suggestions');
const toast = document.getElementById('toast');

// ========================================
// ÉTAPE 4: DEBOUNCE FUNCTION
// ========================================

function debounce(func, delay) {
    let timeoutId;
    
    return function(...args) {
        // Annuler le timeout précédent
        clearTimeout(timeoutId);
        
        // Créer un nouveau timeout
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// ========================================
// ÉTAPE 5: THROTTLE FUNCTION
// ========================================

function throttle(func, limit) {
    let inThrottle;
    
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========================================
// ÉTAPE 6: FONCTION DE RECHERCHE
// ========================================

function performSearch() {
    searchStartTime = performance.now();
    
    const query = searchInput.value.trim();
    searchTerm = caseSensitive ? query : query.toLowerCase();
    
    if (!query) {
        filteredArticles = [...allArticles];
    } else {
        filteredArticles = allArticles.filter(article => {
            const title = caseSensitive ? article.title : article.title.toLowerCase();
            const description = caseSensitive ? article.description : article.description.toLowerCase();
            const author = caseSensitive ? article.author : article.author.toLowerCase();
            const tags = article.tags.map(tag => caseSensitive ? tag : tag.toLowerCase());
            
            if (exactMatch) {
                // Recherche exacte
                return title === searchTerm || 
                       description === searchTerm ||
                       author === searchTerm ||
                       tags.includes(searchTerm);
            } else {
                // Recherche partielle
                return title.includes(searchTerm) ||
                       description.includes(searchTerm) ||
                       author.includes(searchTerm) ||
                       tags.some(tag => tag.includes(searchTerm));
            }
        });
    }
    
    // Appliquer le filtre de catégorie
    if (currentCategory !== 'all') {
        filteredArticles = filteredArticles.filter(a => a.category === currentCategory);
    }
    
    // Trier les résultats
    sortResults();
    
    // Calculer le score de pertinence si tri par pertinence
    if (currentSort === 'relevance' && searchTerm) {
        calculateRelevanceScore();
    }
    
    // Réinitialiser à la page 1
    currentPage = 1;
    
    // Afficher les résultats
    displayResults();
    
    // Calculer le temps de recherche
    const searchDuration = performance.now() - searchStartTime;
    updateSearchStats(searchDuration);
}

// ========================================
// ÉTAPE 7: CALCUL DU SCORE DE PERTINENCE
// ========================================

function calculateRelevanceScore() {
    filteredArticles = filteredArticles.map(article => {
        let score = 0;
        const term = searchTerm.toLowerCase();
        
        // Score basé sur le titre (poids: 3)
        const titleMatches = (article.title.toLowerCase().match(new RegExp(term, 'g')) || []).length;
        score += titleMatches * 3;
        
        // Score basé sur la description (poids: 2)
        const descMatches = (article.description.toLowerCase().match(new RegExp(term, 'g')) || []).length;
        score += descMatches * 2;
        
        // Score basé sur l'auteur (poids: 1)
        if (article.author.toLowerCase().includes(term)) {
            score += 1;
        }
        
        // Score basé sur les tags (poids: 2)
        const tagMatches = article.tags.filter(tag => tag.toLowerCase().includes(term)).length;
        score += tagMatches * 2;
        
        return { ...article, relevanceScore: score };
    });
    
    // Trier par score de pertinence
    filteredArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// ========================================
// ÉTAPE 8: TRI DES RÉSULTATS
// ========================================

function sortResults() {
    switch (currentSort) {
        case 'date-desc':
            filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            filteredArticles.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'title-asc':
            filteredArticles.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            filteredArticles.sort((a, b) => b.title.localeCompare(a.title));
            break;
        // relevance est géré dans calculateRelevanceScore()
    }
}

// ========================================
// ÉTAPE 9: SURLIGNAGE DES TERMES
// ========================================

function highlightText(text, term) {
    if (!term) return text;
    
    const regex = new RegExp(`(${escapeRegex(term)})`, caseSensitive ? 'g' : 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ========================================
// ÉTAPE 10: AFFICHAGE DES RÉSULTATS
// ========================================

function displayResults() {
    resultsContainer.innerHTML = '';
    
    if (filteredArticles.length === 0) {
        noResults.classList.remove('hidden');
        pagination.classList.add('hidden');
        showNoResultsSuggestions();
        return;
    }
    
    noResults.classList.add('hidden');
    
    // Calculer la pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageArticles = filteredArticles.slice(startIndex, endIndex);
    
    // Afficher les articles
    pageArticles.forEach(article => {
        const card = createArticleCard(article);
        resultsContainer.appendChild(card);
    });
    
    // Mettre à jour la pagination
    updatePagination();
}

function createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    const highlightedTitle = highlightText(article.title, searchTerm);
    const highlightedDescription = highlightText(article.description, searchTerm);
    const highlightedAuthor = highlightText(article.author, searchTerm);
    
    card.innerHTML = `
        <div class="result-header">
            <div>
                <h2 class="result-title">${highlightedTitle}</h2>
                <span class="result-category">${getCategoryName(article.category)}</span>
            </div>
        </div>
        <div class="result-meta">
            <span>👤 ${highlightedAuthor}</span>
            <span>📅 ${formatDate(article.date)}</span>
        </div>
        <p class="result-description">${highlightedDescription}</p>
        <div class="result-footer">
            <div class="result-tags">
                ${article.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}
            </div>
        </div>
    `;
    
    return card;
}

// ========================================
// ÉTAPE 11: PAGINATION
// ========================================

function updatePagination() {
    const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.classList.add('hidden');
        return;
    }
    
    pagination.classList.remove('hidden');
    pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`;
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

function goToPage(page) {
    currentPage = page;
    displayResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// ÉTAPE 12: SUGGESTIONS
// ========================================

function showSuggestions() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query || query.length < 2) {
        suggestions.classList.add('hidden');
        return;
    }
    
    // Trouver des suggestions basées sur les titres
    const suggestionList = allArticles
        .filter(article => article.title.toLowerCase().includes(query))
        .slice(0, 5)
        .map(article => article.title);
    
    if (suggestionList.length === 0) {
        suggestions.classList.add('hidden');
        return;
    }
    
    suggestions.innerHTML = '';
    suggestionList.forEach(suggestion => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = suggestion;
        div.addEventListener('click', () => {
            searchInput.value = suggestion;
            suggestions.classList.add('hidden');
            performSearch();
        });
        suggestions.appendChild(div);
    });
    
    suggestions.classList.remove('hidden');
}

function showNoResultsSuggestions() {
    const suggestionsList = document.getElementById('search-suggestions');
    suggestionsList.innerHTML = '';
    
    // Suggestions basées sur les catégories populaires
    const popularTopics = ['JavaScript', 'React', 'Python', 'IA', 'Santé'];
    
    popularTopics.forEach(topic => {
        const li = document.createElement('li');
        li.textContent = topic;
        li.addEventListener('click', () => {
            searchInput.value = topic;
            performSearch();
        });
        suggestionsList.appendChild(li);
    });
}

// ========================================
// ÉTAPE 13: MISE À JOUR DES STATISTIQUES
// ========================================

function updateSearchStats(duration) {
    const durationMs = duration.toFixed(2);
    searchTime.textContent = `Recherche effectuée en ${durationMs}ms`;
    
    resultsCount.textContent = `${filteredArticles.length} résultat${filteredArticles.length > 1 ? 's' : ''}`;
    totalArticlesSpan.textContent = allArticles.length;
    displayedArticlesSpan.textContent = Math.min(filteredArticles.length, itemsPerPage);
    
    // Performance
    let performanceText = 'Excellent';
    if (duration > 100) performanceText = 'Bon';
    if (duration > 500) performanceText = 'Moyen';
    if (duration > 1000) performanceText = 'Lent';
    
    searchPerformance.textContent = performanceText;
}

// ========================================
// ÉTAPE 14: FONCTIONS UTILITAIRES
// ========================================

function getCategoryName(category) {
    const names = {
        technology: 'Technologie',
        science: 'Science',
        business: 'Business',
        health: 'Santé',
        sports: 'Sports'
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

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ========================================
// ÉTAPE 15: GESTIONNAIRES D'ÉVÉNEMENTS
// ========================================

// Recherche avec debounce
const debouncedSearch = debounce(performSearch, 300);

searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    
    if (query) {
        clearSearchBtn.classList.remove('hidden');
    } else {
        clearSearchBtn.classList.add('hidden');
    }
    
    debouncedSearch();
    showSuggestions();
});

// Clear search
clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    suggestions.classList.add('hidden');
    performSearch();
});

// Filtres
categoryFilter.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    performSearch();
});

sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    performSearch();
});

exactMatchCheckbox.addEventListener('change', (e) => {
    exactMatch = e.target.checked;
    performSearch();
});

caseSensitiveCheckbox.addEventListener('change', (e) => {
    caseSensitive = e.target.checked;
    performSearch();
});

// Pagination
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        goToPage(currentPage - 1);
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
    if (currentPage < totalPages) {
        goToPage(currentPage + 1);
    }
});

// Cacher les suggestions quand on clique ailleurs
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.classList.add('hidden');
    }
});

// ========================================
// ÉTAPE 16: INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Affichage initial
    performSearch();
    
    console.log('✅ Moteur de recherche chargé !');
    console.log(`📚 ${allArticles.length} articles disponibles`);
});