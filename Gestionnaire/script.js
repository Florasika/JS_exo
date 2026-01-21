// ========================================
// ÉTAPE 1: SÉLECTION DES ÉLÉMENTS HTML
// ========================================

// Dashboard
const totalRevenueElement = document.getElementById('total-revenue');
const totalExpenseElement = document.getElementById('total-expense');
const balanceElement = document.getElementById('balance');
const expenseChart = document.getElementById('expense-chart');
const chartLegend = document.getElementById('chart-legend');

// Formulaire
const transactionForm = document.getElementById('transaction-form');
const formTitle = document.getElementById('form-title');
const cancelEditBtn = document.getElementById('cancel-edit');
const transactionType = document.getElementById('transaction-type');
const transactionAmount = document.getElementById('transaction-amount');
const transactionCategory = document.getElementById('transaction-category');
const transactionDate = document.getElementById('transaction-date');
const transactionDescription = document.getElementById('transaction-description');
const submitBtn = document.getElementById('submit-btn');

// Filtres
const filterType = document.getElementById('filter-type');
const filterCategory = document.getElementById('filter-category');
const filterPeriod = document.getElementById('filter-period');
const filterDateStart = document.getElementById('filter-date-start');
const filterDateEnd = document.getElementById('filter-date-end');

// Transactions
const transactionsList = document.getElementById('transactions-list');
const transactionsCount = document.getElementById('transactions-count');
const noTransactions = document.getElementById('no-transactions');
const sortSelect = document.getElementById('sort-select');

// Boutons header
const exportBtn = document.getElementById('export-btn');
const resetBtn = document.getElementById('reset-btn');

// ========================================
// ÉTAPE 2: CATÉGORIES PAR DÉFAUT
// ========================================

const categories = {
    expense: [
        'Alimentation',
        'Transport',
        'Logement',
        'Santé',
        'Loisirs',
        'Vêtements',
        'Éducation',
        'Autres'
    ],
    revenue: [
        'Salaire',
        'Freelance',
        'Investissements',
        'Cadeaux',
        'Autres'
    ]
};

// Couleurs pour le graphique
const chartColors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

// ========================================
// ÉTAPE 3: VARIABLES GLOBALES
// ========================================

let transactions = [];
let editingId = null;

// ========================================
// ÉTAPE 4: GESTION DU LOCALSTORAGE
// ========================================

function loadTransactions() {
    const saved = localStorage.getItem('budgetTransactions');
    if (saved) {
        transactions = JSON.parse(saved);
    }
}

function saveTransactions() {
    localStorage.setItem('budgetTransactions', JSON.stringify(transactions));
}

// ========================================
// ÉTAPE 5: INITIALISATION DES CATÉGORIES
// ========================================

function updateCategoryOptions() {
    const type = transactionType.value;
    const currentCategories = categories[type];
    
    transactionCategory.innerHTML = '';
    currentCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        transactionCategory.appendChild(option);
    });
    
    // Mettre à jour les filtres
    updateFilterCategories();
}

function updateFilterCategories() {
    const allCategories = [...new Set([...categories.expense, ...categories.revenue])];
    
    filterCategory.innerHTML = '<option value="all">Toutes</option>';
    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        filterCategory.appendChild(option);
    });
}

// ========================================
// ÉTAPE 6: AJOUT/MODIFICATION DE TRANSACTION
// ========================================

function addTransaction(e) {
    e.preventDefault();
    
    const transaction = {
        id: editingId || Date.now().toString(),
        type: transactionType.value,
        amount: parseFloat(transactionAmount.value),
        category: transactionCategory.value,
        date: transactionDate.value,
        description: transactionDescription.value,
        createdAt: editingId ? transactions.find(t => t.id === editingId).createdAt : new Date().toISOString()
    };
    
    if (editingId) {
        // Modifier la transaction existante
        const index = transactions.findIndex(t => t.id === editingId);
        transactions[index] = transaction;
        editingId = null;
        
        // Réinitialiser le formulaire
        formTitle.textContent = 'Ajouter une transaction';
        submitBtn.textContent = '➕ Ajouter la transaction';
        cancelEditBtn.classList.add('hidden');
    } else {
        // Ajouter une nouvelle transaction
        transactions.push(transaction);
    }
    
    saveTransactions();
    transactionForm.reset();
    
    // Mettre la date à aujourd'hui
    transactionDate.valueAsDate = new Date();
    
    updateDisplay();
}

// ========================================
// ÉTAPE 7: SUPPRESSION DE TRANSACTION
// ========================================

function deleteTransaction(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateDisplay();
    }
}

// ========================================
// ÉTAPE 8: ÉDITION DE TRANSACTION
// ========================================

function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    editingId = id;
    
    // Remplir le formulaire
    transactionType.value = transaction.type;
    updateCategoryOptions();
    transactionAmount.value = transaction.amount;
    transactionCategory.value = transaction.category;
    transactionDate.value = transaction.date;
    transactionDescription.value = transaction.description;
    
    // Mettre à jour l'interface
    formTitle.textContent = 'Modifier la transaction';
    submitBtn.textContent = '✓ Enregistrer les modifications';
    cancelEditBtn.classList.remove('hidden');
    
    // Scroller vers le formulaire
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
    editingId = null;
    transactionForm.reset();
    formTitle.textContent = 'Ajouter une transaction';
    submitBtn.textContent = '➕ Ajouter la transaction';
    cancelEditBtn.classList.add('hidden');
    transactionDate.valueAsDate = new Date();
}

// ========================================
// ÉTAPE 9: FILTRAGE DES TRANSACTIONS
// ========================================

function getFilteredTransactions() {
    let filtered = [...transactions];
    
    // Filtre par type
    if (filterType.value !== 'all') {
        filtered = filtered.filter(t => t.type === filterType.value);
    }
    
    // Filtre par catégorie
    if (filterCategory.value !== 'all') {
        filtered = filtered.filter(t => t.category === filterCategory.value);
    }
    
    // Filtre par période
    if (filterPeriod.value !== 'all') {
        filtered = filterByPeriod(filtered, filterPeriod.value);
    }
    
    return filtered;
}

function filterByPeriod(transactions, period) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return transactions.filter(t => {
        const transactionDate = new Date(t.date);
        
        switch (period) {
            case 'today':
                return transactionDate >= today;
            
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return transactionDate >= weekAgo;
            
            case 'month':
                return transactionDate.getMonth() === now.getMonth() &&
                       transactionDate.getFullYear() === now.getFullYear();
            
            case 'year':
                return transactionDate.getFullYear() === now.getFullYear();
            
            case 'custom':
                const start = new Date(filterDateStart.value);
                const end = new Date(filterDateEnd.value);
                return transactionDate >= start && transactionDate <= end;
            
            default:
                return true;
        }
    });
}

// ========================================
// ÉTAPE 10: TRI DES TRANSACTIONS
// ========================================

function sortTransactions(transactions) {
    const sorted = [...transactions];
    const sortOption = sortSelect.value;
    
    switch (sortOption) {
        case 'date-desc':
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'amount-desc':
            sorted.sort((a, b) => b.amount - a.amount);
            break;
        case 'amount-asc':
            sorted.sort((a, b) => a.amount - b.amount);
            break;
    }
    
    return sorted;
}

// ========================================
// ÉTAPE 11: CALCUL DES STATISTIQUES
// ========================================

function calculateStats() {
    const filtered = getFilteredTransactions();
    
    const revenues = filtered
        .filter(t => t.type === 'revenue')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filtered
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = revenues - expenses;
    
    return { revenues, expenses, balance };
}

// ========================================
// ÉTAPE 12: AFFICHAGE DES STATISTIQUES
// ========================================

function displayStats() {
    const { revenues, expenses, balance } = calculateStats();
    
    totalRevenueElement.textContent = formatCurrency(revenues);
    totalExpenseElement.textContent = formatCurrency(expenses);
    balanceElement.textContent = formatCurrency(balance);
    
    // Couleur du solde
    balanceElement.className = 'stat-value';
    if (balance > 0) {
        balanceElement.classList.add('positive');
    } else if (balance < 0) {
        balanceElement.classList.add('negative');
    }
}

// ========================================
// ÉTAPE 13: AFFICHAGE DES TRANSACTIONS
// ========================================

function displayTransactions() {
    const filtered = getFilteredTransactions();
    const sorted = sortTransactions(filtered);
    
    transactionsList.innerHTML = '';
    
    if (sorted.length === 0) {
        noTransactions.classList.remove('hidden');
        transactionsCount.textContent = '0 transaction';
        return;
    }
    
    noTransactions.classList.add('hidden');
    transactionsCount.textContent = `${sorted.length} transaction${sorted.length > 1 ? 's' : ''}`;
    
    sorted.forEach(transaction => {
        const item = createTransactionElement(transaction);
        transactionsList.appendChild(item);
    });
}

function createTransactionElement(transaction) {
    const div = document.createElement('div');
    div.className = `transaction-item ${transaction.type}`;
    
    div.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-header">
                <span class="transaction-type-badge ${transaction.type}">
                    ${transaction.type === 'revenue' ? 'Revenu' : 'Dépense'}
                </span>
                <span class="transaction-description">${transaction.description}</span>
            </div>
            <div class="transaction-category">${transaction.category}</div>
            <div class="transaction-date">${formatDate(transaction.date)}</div>
        </div>
        <span class="transaction-amount">
            ${transaction.type === 'revenue' ? '+' : '-'}${formatCurrency(transaction.amount)}
        </span>
        <div class="transaction-actions">
            <button class="transaction-btn edit-btn" onclick="editTransaction('${transaction.id}')">
                ✏️ Modifier
            </button>
            <button class="transaction-btn delete-btn" onclick="deleteTransaction('${transaction.id}')">
                🗑️ Supprimer
            </button>
        </div>
    `;
    
    return div;
}

// ========================================
// ÉTAPE 14: GRAPHIQUE EN CANVAS
// ========================================

function drawChart() {
    const filtered = getFilteredTransactions();
    const expenses = filtered.filter(t => t.type === 'expense');
    
    if (expenses.length === 0) {
        const ctx = expenseChart.getContext('2d');
        ctx.clearRect(0, 0, expenseChart.width, expenseChart.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'center';
        ctx.fillText('Aucune dépense à afficher', expenseChart.width / 2, expenseChart.height / 2);
        chartLegend.innerHTML = '';
        return;
    }
    
    // Calculer les totaux par catégorie
    const categoryTotals = {};
    expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    // Convertir en tableau et trier
    const data = Object.entries(categoryTotals)
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total);
    
    const total = data.reduce((sum, item) => sum + item.total, 0);
    
    // Dessiner le graphique en camembert
    const ctx = expenseChart.getContext('2d');
    const centerX = expenseChart.width / 2;
    const centerY = expenseChart.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    ctx.clearRect(0, 0, expenseChart.width, expenseChart.height);
    
    let currentAngle = -Math.PI / 2;
    
    data.forEach((item, index) => {
        const sliceAngle = (item.total / total) * 2 * Math.PI;
        
        // Dessiner la tranche
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = chartColors[index % chartColors.length];
        ctx.fill();
        
        // Bordure
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        currentAngle += sliceAngle;
    });
    
    // Créer la légende
    chartLegend.innerHTML = '';
    data.forEach((item, index) => {
        const percentage = ((item.total / total) * 100).toFixed(1);
        
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background: ${chartColors[index % chartColors.length]}"></div>
            <span class="legend-label">${item.category}</span>
            <span class="legend-value">${percentage}%</span>
        `;
        chartLegend.appendChild(legendItem);
    });
}

// ========================================
// ÉTAPE 15: FONCTIONS UTILITAIRES
// ========================================

function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ========================================
// ÉTAPE 16: EXPORT CSV
// ========================================

function exportToCSV() {
    if (transactions.length === 0) {
        alert('Aucune transaction à exporter');
        return;
    }
    
    // En-têtes CSV
    const headers = ['Type', 'Montant', 'Catégorie', 'Date', 'Description'];
    const rows = transactions.map(t => [
        t.type === 'revenue' ? 'Revenu' : 'Dépense',
        t.amount,
        t.category,
        t.date,
        t.description
    ]);
    
    // Créer le contenu CSV
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `budget_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ========================================
// ÉTAPE 17: RÉINITIALISATION
// ========================================

function resetData() {
    if (confirm('⚠️ ATTENTION: Toutes vos données seront supprimées définitivement. Continuer ?')) {
        transactions = [];
        saveTransactions();
        updateDisplay();
    }
}

// ========================================
// ÉTAPE 18: MISE À JOUR GLOBALE
// ========================================

function updateDisplay() {
    displayStats();
    displayTransactions();
    drawChart();
}

// ========================================
// ÉTAPE 19: GESTION DES ÉVÉNEMENTS
// ========================================

// Formulaire
transactionForm.addEventListener('submit', addTransaction);
transactionType.addEventListener('change', updateCategoryOptions);
cancelEditBtn.addEventListener('click', cancelEdit);

// Filtres
filterType.addEventListener('change', updateDisplay);
filterCategory.addEventListener('change', updateDisplay);
filterPeriod.addEventListener('change', (e) => {
    const customDates = document.querySelectorAll('.custom-dates');
    if (e.target.value === 'custom') {
        customDates.forEach(el => el.classList.remove('hidden'));
    } else {
        customDates.forEach(el => el.classList.add('hidden'));
    }
    updateDisplay();
});
filterDateStart.addEventListener('change', updateDisplay);
filterDateEnd.addEventListener('change', updateDisplay);

// Tri
sortSelect.addEventListener('change', displayTransactions);

// Boutons header
exportBtn.addEventListener('click', exportToCSV);
resetBtn.addEventListener('click', resetData);

// ========================================
// ÉTAPE 20: INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Charger les données
    loadTransactions();
    
    // Initialiser les catégories
    updateCategoryOptions();
    
    // Mettre la date à aujourd'hui
    transactionDate.valueAsDate = new Date();
    
    // Afficher les données
    updateDisplay();
    
    console.log('✅ Gestionnaire de budget chargé !');
    console.log(`💰 ${transactions.length} transaction(s) chargée(s)`);
});