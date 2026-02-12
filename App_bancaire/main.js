// app.js - Banking Application with OOP

// ============= CLASSES DE BASE =============

/**
 * Classe Transaction - Représente une transaction bancaire
 */
class Transaction {
    #id;
    #type;
    #amount;
    #date;
    #description;
    #accountId;
    #toAccountId;

    static TYPES = {
        DEPOSIT: 'deposit',
        WITHDRAWAL: 'withdrawal',
        TRANSFER: 'transfer',
        LOAN: 'loan',
        INTEREST: 'interest'
    };

    constructor(data) {
        this.#id = data.id || this.#generateId();
        this.#type = data.type;
        this.#amount = data.amount;
        this.#date = data.date || new Date();
        this.#description = data.description || '';
        this.#accountId = data.accountId;
        this.#toAccountId = data.toAccountId || null;
    }

    #generateId() {
        return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Getters
    getId() {
        return this.#id;
    }

    getType() {
        return this.#type;
    }

    getAmount() {
        return this.#amount;
    }

    getDate() {
        return this.#date;
    }

    getDescription() {
        return this.#description;
    }

    getAccountId() {
        return this.#accountId;
    }

    getToAccountId() {
        return this.#toAccountId;
    }

    // Méthodes métier
    isDeposit() {
        return this.#type === Transaction.TYPES.DEPOSIT;
    }

    isWithdrawal() {
        return this.#type === Transaction.TYPES.WITHDRAWAL;
    }

    isTransfer() {
        return this.#type === Transaction.TYPES.TRANSFER;
    }

    getTypeLabel() {
        const labels = {
            [Transaction.TYPES.DEPOSIT]: 'Dépôt',
            [Transaction.TYPES.WITHDRAWAL]: 'Retrait',
            [Transaction.TYPES.TRANSFER]: 'Virement',
            [Transaction.TYPES.LOAN]: 'Prêt',
            [Transaction.TYPES.INTEREST]: 'Intérêts'
        };
        return labels[this.#type];
    }

    toJSON() {
        return {
            id: this.#id,
            type: this.#type,
            amount: this.#amount,
            date: this.#date,
            description: this.#description,
            accountId: this.#accountId,
            toAccountId: this.#toAccountId
        };
    }
}

/**
 * Classe Account - Classe de base pour les comptes bancaires
 */
class Account {
    #accountNumber;
    #balance;
    #transactions;
    #createdDate;
    #type;

    constructor(accountNumber, initialBalance = 0, type = 'current') {
        this.#accountNumber = accountNumber;
        this.#balance = initialBalance;
        this.#transactions = [];
        this.#createdDate = new Date();
        this.#type = type;
    }

    // Getters
    getAccountNumber() {
        return this.#accountNumber;
    }

    getBalance() {
        return this.#balance;
    }

    getTransactions() {
        return [...this.#transactions];
    }

    getCreatedDate() {
        return this.#createdDate;
    }

    getType() {
        return this.#type;
    }

    // Méthodes protégées
    _setBalance(amount) {
        this.#balance = amount;
    }

    _addTransaction(transaction) {
        this.#transactions.push(transaction);
    }

    // Méthodes métier
    deposit(amount, description = '') {
        if (!this.#validateAmount(amount)) {
            throw new Error('Montant invalide');
        }

        this.#balance += amount;
        const transaction = new Transaction({
            type: Transaction.TYPES.DEPOSIT,
            amount: amount,
            description: description,
            accountId: this.#accountNumber
        });
        this.#transactions.push(transaction);

        return transaction;
    }

    withdraw(amount, description = '') {
        if (!this.#validateAmount(amount)) {
            throw new Error('Montant invalide');
        }

        if (!this.#canWithdraw(amount)) {
            throw new Error('Solde insuffisant');
        }

        this.#balance -= amount;
        const transaction = new Transaction({
            type: Transaction.TYPES.WITHDRAWAL,
            amount: amount,
            description: description,
            accountId: this.#accountNumber
        });
        this.#transactions.push(transaction);

        return transaction;
    }

    // Méthodes privées
    #validateAmount(amount) {
        return typeof amount === 'number' && amount > 0 && isFinite(amount);
    }

    #canWithdraw(amount) {
        return this.#balance >= amount;
    }

    // Statistiques
    getTotalDeposits() {
        return this.#transactions
            .filter(t => t.isDeposit())
            .reduce((sum, t) => sum + t.getAmount(), 0);
    }

    getTotalWithdrawals() {
        return this.#transactions
            .filter(t => t.isWithdrawal())
            .reduce((sum, t) => sum + t.getAmount(), 0);
    }

    getTransactionCount() {
        return this.#transactions.length;
    }

    toJSON() {
        return {
            accountNumber: this.#accountNumber,
            balance: this.#balance,
            transactions: this.#transactions.map(t => t.toJSON()),
            createdDate: this.#createdDate,
            type: this.#type
        };
    }
}

/**
 * Classe CurrentAccount - Compte courant (héritage)
 */
class CurrentAccount extends Account {
    #overdraftLimit;

    constructor(accountNumber, initialBalance = 0, overdraftLimit = 500) {
        super(accountNumber, initialBalance, 'current');
        this.#overdraftLimit = overdraftLimit;
    }

    getOverdraftLimit() {
        return this.#overdraftLimit;
    }

    // Override de la méthode de retrait pour autoriser le découvert
    withdraw(amount, description = '') {
        if (amount <= 0) {
            throw new Error('Montant invalide');
        }

        const newBalance = this.getBalance() - amount;
        if (newBalance < -this.#overdraftLimit) {
            throw new Error(`Découvert autorisé dépassé (limite: ${this.#overdraftLimit} €)`);
        }

        this._setBalance(newBalance);
        const transaction = new Transaction({
            type: Transaction.TYPES.WITHDRAWAL,
            amount: amount,
            description: description,
            accountId: this.getAccountNumber()
        });
        this._addTransaction(transaction);

        return transaction;
    }

    isOverdrawn() {
        return this.getBalance() < 0;
    }

    getAvailableBalance() {
        return this.getBalance() + this.#overdraftLimit;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            overdraftLimit: this.#overdraftLimit
        };
    }
}

/**
 * Classe SavingsAccount - Compte épargne (héritage)
 */
class SavingsAccount extends Account {
    #interestRate;
    #minimumBalance;

    constructor(accountNumber, initialBalance = 0, interestRate = 0.02) {
        super(accountNumber, initialBalance, 'savings');
        this.#interestRate = interestRate;
        this.#minimumBalance = 100;
    }

    getInterestRate() {
        return this.#interestRate;
    }

    getMinimumBalance() {
        return this.#minimumBalance;
    }

    // Override pour interdire le solde négatif
    withdraw(amount, description = '') {
        if (amount <= 0) {
            throw new Error('Montant invalide');
        }

        const newBalance = this.getBalance() - amount;
        if (newBalance < 0) {
            throw new Error('Solde insuffisant (découvert non autorisé sur compte épargne)');
        }

        if (newBalance < this.#minimumBalance) {
            throw new Error(`Solde minimum requis: ${this.#minimumBalance} €`);
        }

        this._setBalance(newBalance);
        const transaction = new Transaction({
            type: Transaction.TYPES.WITHDRAWAL,
            amount: amount,
            description: description,
            accountId: this.getAccountNumber()
        });
        this._addTransaction(transaction);

        return transaction;
    }

    // Calculer et ajouter les intérêts
    calculateInterest() {
        const interest = this.getBalance() * this.#interestRate;
        return Math.round(interest * 100) / 100;
    }

    applyInterest() {
        const interest = this.calculateInterest();
        if (interest > 0) {
            this._setBalance(this.getBalance() + interest);
            const transaction = new Transaction({
                type: Transaction.TYPES.INTEREST,
                amount: interest,
                description: `Intérêts ${(this.#interestRate * 100).toFixed(1)}%`,
                accountId: this.getAccountNumber()
            });
            this._addTransaction(transaction);
            return transaction;
        }
        return null;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            interestRate: this.#interestRate,
            minimumBalance: this.#minimumBalance
        };
    }
}

/**
 * Classe User - Représente un utilisateur
 */
class User {
    #userId;
    #name;
    #email;
    #pin;
    #accounts;
    #createdDate;

    constructor(data) {
        this.#userId = data.userId;
        this.#name = data.name;
        this.#email = data.email;
        this.#pin = data.pin;
        this.#accounts = new Map();
        this.#createdDate = new Date();
    }

    // Getters
    getUserId() {
        return this.#userId;
    }

    getName() {
        return this.#name;
    }

    getEmail() {
        return this.#email;
    }

    // Vérification du PIN
    verifyPin(pin) {
        return this.#pin === pin;
    }

    // Gestion des comptes
    addAccount(account) {
        if (!(account instanceof Account)) {
            throw new Error('Invalid account');
        }
        this.#accounts.set(account.getAccountNumber(), account);
    }

    getAccount(accountNumber) {
        return this.#accounts.get(accountNumber);
    }

    getAccounts() {
        return Array.from(this.#accounts.values());
    }

    hasAccount(accountNumber) {
        return this.#accounts.has(accountNumber);
    }

    // Statistiques
    getTotalBalance() {
        return this.getAccounts().reduce((sum, acc) => sum + acc.getBalance(), 0);
    }

    getAllTransactions() {
        const allTransactions = [];
        this.getAccounts().forEach(account => {
            allTransactions.push(...account.getTransactions());
        });
        return allTransactions.sort((a, b) => b.getDate() - a.getDate());
    }

    getTotalDeposits() {
        return this.getAccounts().reduce((sum, acc) => sum + acc.getTotalDeposits(), 0);
    }

    getTotalWithdrawals() {
        return this.getAccounts().reduce((sum, acc) => sum + acc.getTotalWithdrawals(), 0);
    }
}

/**
 * Classe Bank - Gère la banque et les utilisateurs
 */
class Bank {
    #users;
    #currentUser;

    constructor() {
        this.#users = new Map();
        this.#currentUser = null;
        this.#initializeDemoUsers();
    }

    #initializeDemoUsers() {
        // Utilisateur 1
        const user1 = new User({
            userId: 'user1',
            name: 'Marie Dupont',
            email: 'marie.dupont@email.com',
            pin: '1234'
        });
        const account1 = new CurrentAccount('FR7630001007941234567890185', 5000, 1000);
        const savings1 = new SavingsAccount('FR7630001007941234567890186', 10000, 0.025);
        user1.addAccount(account1);
        user1.addAccount(savings1);
        
        // Transactions de démonstration
        account1.deposit(2500, 'Salaire');
        account1.withdraw(150, 'Courses');
        account1.withdraw(50, 'Restaurant');
        savings1.deposit(5000, 'Épargne mensuelle');
        
        this.#users.set(user1.getUserId(), user1);

        // Utilisateur 2
        const user2 = new User({
            userId: 'user2',
            name: 'Pierre Martin',
            email: 'pierre.martin@email.com',
            pin: '1234@!P$'
        });
        const account2 = new CurrentAccount('FR7630004000031234567890143', 3000, 500);
        const savings2 = new SavingsAccount('FR7630004000031234567890144', 15000, 0.03);
        user2.addAccount(account2);
        user2.addAccount(savings2);
        
        account2.deposit(3000, 'Salaire');
        account2.withdraw(200, 'Loyer partiel');
        
        this.#users.set(user2.getUserId(), user2);

        // Utilisateur 3
        const user3 = new User({
            userId: 'user3',
            name: 'Sophie Bernard',
            email: 'sophie.bernard@email.com',
            pin: '1234'
        });
        const account3 = new CurrentAccount('FR7610096000509876543210143', 1500, 300);
        user3.addAccount(account3);
        
        account3.deposit(1500, 'Freelance');
        account3.withdraw(100, 'Courses');
        
        this.#users.set(user3.getUserId(), user3);
    }

    // Authentification
    login(userId, pin) {
        const user = this.#users.get(userId);
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        if (!user.verifyPin(pin)) {
            throw new Error('Code PIN incorrect');
        }

        this.#currentUser = user;
        return user;
    }

    logout() {
        this.#currentUser = null;
    }

    getCurrentUser() {
        return this.#currentUser;
    }

    isLoggedIn() {
        return this.#currentUser !== null;
    }

    // Opérations bancaires
    transfer(fromAccountNumber, toAccountNumber, amount, description = '') {
        if (!this.#currentUser) {
            throw new Error('Non authentifié');
        }

        const fromAccount = this.#currentUser.getAccount(fromAccountNumber);
        if (!fromAccount) {
            throw new Error('Compte source non trouvé');
        }

        const toAccount = this.#currentUser.getAccount(toAccountNumber);
        if (!toAccount) {
            throw new Error('Compte destinataire non trouvé');
        }

        if (fromAccountNumber === toAccountNumber) {
            throw new Error('Impossible de transférer vers le même compte');
        }

        // Effectuer le retrait du compte source
        fromAccount.withdraw(amount, `Virement vers ${toAccountNumber.slice(-4)}`);

        // Effectuer le dépôt sur le compte destinataire
        toAccount.deposit(amount, `Virement depuis ${fromAccountNumber.slice(-4)}`);

        // Créer une transaction de type transfer
        const transaction = new Transaction({
            type: Transaction.TYPES.TRANSFER,
            amount: amount,
            description: description,
            accountId: fromAccountNumber,
            toAccountId: toAccountNumber
        });

        return transaction;
    }

    requestLoan(accountNumber, amount) {
        if (!this.#currentUser) {
            throw new Error('Non authentifié');
        }

        const account = this.#currentUser.getAccount(accountNumber);
        if (!account) {
            throw new Error('Compte non trouvé');
        }

        // Règle: le prêt ne peut excéder 10% du solde total
        const maxLoan = this.#currentUser.getTotalBalance() * 0.1;
        
        if (amount > maxLoan) {
            throw new Error(`Prêt maximum autorisé: ${maxLoan.toFixed(2)} €`);
        }

        const transaction = new Transaction({
            type: Transaction.TYPES.LOAN,
            amount: amount,
            description: 'Prêt bancaire',
            accountId: accountNumber
        });

        account.deposit(amount, 'Prêt bancaire');
        
        return transaction;
    }
}

/**
 * Classe BankUI - Gère l'interface utilisateur
 */
class BankUI {
    constructor(bank) {
        this.bank = bank;
        this.currentTransactionType = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.showLoginScreen();
    }

    initializeElements() {
        // Screens
        this.loginScreen = document.getElementById('loginScreen');
        this.mainApp = document.getElementById('mainApp');
        
        // Login elements
        this.loginForm = document.getElementById('loginForm');
        this.userIdInput = document.getElementById('userId');
        this.pinInput = document.getElementById('pin');
        
        // User info
        this.userWelcome = document.getElementById('userWelcome');
        this.userEmail = document.getElementById('userEmail');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        // Accounts
        this.accountsList = document.getElementById('accountsList');
        
        // Quick actions
        this.depositBtn = document.getElementById('depositBtn');
        this.withdrawBtn = document.getElementById('withdrawBtn');
        this.transferBtn = document.getElementById('transferBtn');
        this.requestLoanBtn = document.getElementById('requestLoanBtn');
        
        // Transactions
        this.accountFilter = document.getElementById('accountFilter');
        this.transactionsList = document.getElementById('transactionsList');
        this.emptyTransactions = document.getElementById('emptyTransactions');
        this.totalIncome = document.getElementById('totalIncome');
        this.totalExpense = document.getElementById('totalExpense');
        
        // Modal
        this.modal = document.getElementById('transactionModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalClose = document.getElementById('modalClose');
        this.transactionForm = document.getElementById('transactionForm');
        this.accountSelect = document.getElementById('accountSelect');
        this.toAccountGroup = document.getElementById('toAccountGroup');
        this.toAccountSelect = document.getElementById('toAccountSelect');
        this.amountInput = document.getElementById('amount');
        this.descriptionInput = document.getElementById('description');
        this.cancelTransaction = document.getElementById('cancelTransaction');
    }

    attachEventListeners() {
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        this.depositBtn.addEventListener('click', () => this.showTransactionModal('deposit'));
        this.withdrawBtn.addEventListener('click', () => this.showTransactionModal('withdrawal'));
        this.transferBtn.addEventListener('click', () => this.showTransactionModal('transfer'));
        this.requestLoanBtn.addEventListener('click', () => this.showTransactionModal('loan'));
        
        this.modalClose.addEventListener('click', () => this.hideModal());
        this.cancelTransaction.addEventListener('click', () => this.hideModal());
        this.transactionForm.addEventListener('submit', (e) => this.handleTransaction(e));
        
        this.accountFilter.addEventListener('change', () => this.renderTransactions());
    }

    showLoginScreen() {
        this.loginScreen.style.display = 'flex';
        this.mainApp.style.display = 'none';
    }

    showMainApp() {
        this.loginScreen.style.display = 'none';
        this.mainApp.style.display = 'block';
    }

    handleLogin(e) {
        e.preventDefault();
        
        const userId = this.userIdInput.value.trim();
        const pin = this.pinInput.value.trim();
        
        try {
            const user = this.bank.login(userId, pin);
            this.showMainApp();
            this.renderUserInfo(user);
            this.renderAccounts(user);
            this.renderTransactions();
            this.loginForm.reset();
        } catch (error) {
            alert(error.message);
        }
    }

    handleLogout() {
        this.bank.logout();
        this.showLoginScreen();
    }

    renderUserInfo(user) {
        this.userWelcome.textContent = `Bonjour, ${user.getName()}`;
        this.userEmail.textContent = user.getEmail();
    }

    renderAccounts(user) {
        const accounts = user.getAccounts();
        
        // Populate account filter
        this.accountFilter.innerHTML = `
            <option value="all">Tous les comptes</option>
            ${accounts.map(acc => `
                <option value="${acc.getAccountNumber()}">
                    ${acc.getType() === 'current' ? 'Compte courant' : 'Compte épargne'} - ${acc.getAccountNumber().slice(-4)}
                </option>
            `).join('')}
        `;
        
        // Render accounts
        this.accountsList.innerHTML = accounts.map(account => this.renderAccountCard(account)).join('');
    }

    renderAccountCard(account) {
        const isCurrentAccount = account instanceof CurrentAccount;
        const isSavingsAccount = account instanceof SavingsAccount;
        
        let additionalInfo = '';
        if (isCurrentAccount) {
            additionalInfo = `
                <div class="account-info-item">
                    <span>Découvert autorisé</span>
                    <span>${account.getOverdraftLimit().toFixed(2)} €</span>
                </div>
                <div class="account-info-item">
                    <span>Solde disponible</span>
                    <span>${account.getAvailableBalance().toFixed(2)} €</span>
                </div>
            `;
        } else if (isSavingsAccount) {
            additionalInfo = `
                <div class="account-info-item">
                    <span>Taux d'intérêt</span>
                    <span>${(account.getInterestRate() * 100).toFixed(1)}%</span>
                </div>
                <div class="account-info-item">
                    <span>Solde minimum</span>
                    <span>${account.getMinimumBalance().toFixed(2)} €</span>
                </div>
            `;
        }
        
        return `
            <div class="account-card ${account.getType()}">
                <div class="account-header">
                    <span class="account-type ${account.getType()}">
                        ${account.getType() === 'current' ? 'Compte Courant' : 'Compte Épargne'}
                    </span>
                    <span class="account-number">****${account.getAccountNumber().slice(-4)}</span>
                </div>
                <div class="account-balance">${account.getBalance().toFixed(2)} €</div>
                <div class="account-info">
                    <div class="account-info-item">
                        <span>Transactions</span>
                        <span>${account.getTransactionCount()}</span>
                    </div>
                    ${additionalInfo}
                </div>
            </div>
        `;
    }

    renderTransactions() {
        const user = this.bank.getCurrentUser();
        if (!user) return;
        
        let transactions = [];
        const filter = this.accountFilter.value;
        
        if (filter === 'all') {
            transactions = user.getAllTransactions();
        } else {
            const account = user.getAccount(filter);
            if (account) {
                transactions = account.getTransactions().sort((a, b) => b.getDate() - a.getDate());
            }
        }
        
        if (transactions.length === 0) {
            this.transactionsList.style.display = 'none';
            this.emptyTransactions.style.display = 'block';
        } else {
            this.transactionsList.style.display = 'flex';
            this.emptyTransactions.style.display = 'none';
            this.transactionsList.innerHTML = transactions.map(t => this.renderTransaction(t)).join('');
        }
        
        // Update stats
        const totalIncome = transactions
            .filter(t => t.isDeposit())
            .reduce((sum, t) => sum + t.getAmount(), 0);
        
        const totalExpense = transactions
            .filter(t => t.isWithdrawal())
            .reduce((sum, t) => sum + t.getAmount(), 0);
        
        this.totalIncome.textContent = `${totalIncome.toFixed(2)} €`;
        this.totalExpense.textContent = `${totalExpense.toFixed(2)} €`;
    }

    renderTransaction(transaction) {
        const isPositive = transaction.isDeposit() || transaction.getType() === 'loan';
        const date = new Date(transaction.getDate());
        
        return `
            <div class="transaction-item ${transaction.getType()}">
                <div class="transaction-info">
                    <div class="transaction-type">${transaction.getTypeLabel()}</div>
                    <div class="transaction-description">
                        ${transaction.getDescription() || 'Aucune description'}
                    </div>
                </div>
                <div class="transaction-details">
                    <div class="transaction-amount ${isPositive ? 'positive' : 'negative'}">
                        ${isPositive ? '+' : '-'}${transaction.getAmount().toFixed(2)} €
                    </div>
                    <div class="transaction-date">
                        ${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        `;
    }

    showTransactionModal(type) {
        this.currentTransactionType = type;
        
        const titles = {
            deposit: '💰 Effectuer un dépôt',
            withdrawal: '💸 Effectuer un retrait',
            transfer: '🔄 Effectuer un virement',
            loan: '🏛️ Demander un prêt'
        };
        
        this.modalTitle.textContent = titles[type];
        
        // Populate account select
        const user = this.bank.getCurrentUser();
        const accounts = user.getAccounts();
        
        this.accountSelect.innerHTML = accounts.map(acc => `
            <option value="${acc.getAccountNumber()}">
                ${acc.getType() === 'current' ? 'Compte courant' : 'Compte épargne'} - ${acc.getAccountNumber().slice(-4)} (${acc.getBalance().toFixed(2)} €)
            </option>
        `).join('');
        
        // Show/hide transfer fields
        if (type === 'transfer') {
            this.toAccountGroup.style.display = 'block';
            this.toAccountSelect.innerHTML = accounts.map(acc => `
                <option value="${acc.getAccountNumber()}">
                    ${acc.getType() === 'current' ? 'Compte courant' : 'Compte épargne'} - ${acc.getAccountNumber().slice(-4)}
                </option>
            `).join('');
        } else {
            this.toAccountGroup.style.display = 'none';
        }
        
        this.modal.classList.add('show');
        this.transactionForm.reset();
    }

    hideModal() {
        this.modal.classList.remove('show');
    }

    handleTransaction(e) {
        e.preventDefault();
        
        const accountNumber = this.accountSelect.value;
        const amount = parseFloat(this.amountInput.value);
        const description = this.descriptionInput.value.trim();
        
        const user = this.bank.getCurrentUser();
        const account = user.getAccount(accountNumber);
        
        try {
            switch (this.currentTransactionType) {
                case 'deposit':
                    account.deposit(amount, description || 'Dépôt');
                    alert(`Dépôt de ${amount.toFixed(2)} € effectué avec succès`);
                    break;
                    
                case 'withdrawal':
                    account.withdraw(amount, description || 'Retrait');
                    alert(`Retrait de ${amount.toFixed(2)} € effectué avec succès`);
                    break;
                    
                case 'transfer':
                    const toAccountNumber = this.toAccountSelect.value;
                    this.bank.transfer(accountNumber, toAccountNumber, amount, description);
                    alert(`Virement de ${amount.toFixed(2)} € effectué avec succès`);
                    break;
                    
                case 'loan':
                    this.bank.requestLoan(accountNumber, amount);
                    alert(`Prêt de ${amount.toFixed(2)} € accordé`);
                    break;
            }
            
            this.hideModal();
            this.renderAccounts(user);
            this.renderTransactions();
            
        } catch (error) {
            alert(error.message);
        }
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    const bank = new Bank();
    const ui = new BankUI(bank);
    
    // Exposer pour le debugging
    window.bankApp = { bank, ui };
});