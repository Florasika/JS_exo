// app.js - Blackjack Game with OOP

// ============= CLASSES MÉTIER =============

/**
 * Classe Card - Représente une carte de jeu
 */
class Card {
    static SUITS = {
        HEARTS: { name: 'hearts', symbol: '♥', color: 'red' },
        DIAMONDS: { name: 'diamonds', symbol: '♦', color: 'red' },
        CLUBS: { name: 'clubs', symbol: '♣', color: 'black' },
        SPADES: { name: 'spades', symbol: '♠', color: 'black' }
    };

    static RANKS = {
        ACE: { name: 'A', value: 11, displayValue: 'A' },
        TWO: { name: '2', value: 2, displayValue: '2' },
        THREE: { name: '3', value: 3, displayValue: '3' },
        FOUR: { name: '4', value: 4, displayValue: '4' },
        FIVE: { name: '5', value: 5, displayValue: '5' },
        SIX: { name: '6', value: 6, displayValue: '6' },
        SEVEN: { name: '7', value: 7, displayValue: '7' },
        EIGHT: { name: '8', value: 8, displayValue: '8' },
        NINE: { name: '9', value: 9, displayValue: '9' },
        TEN: { name: '10', value: 10, displayValue: '10' },
        JACK: { name: 'J', value: 10, displayValue: 'J' },
        QUEEN: { name: 'Q', value: 10, displayValue: 'Q' },
        KING: { name: 'K', value: 10, displayValue: 'K' }
    };

    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

    getValue() {
        return this.rank.value;
    }

    isAce() {
        return this.rank.name === 'A';
    }

    toString() {
        return `${this.rank.displayValue}${this.suit.symbol}`;
    }

    toHTML(isHidden = false) {
        if (isHidden) {
            return `<div class="card-back">🂠</div>`;
        }

        return `
            <div class="card ${this.suit.color}">
                <div class="card-value">${this.rank.displayValue}</div>
                <div class="card-suit">${this.suit.symbol}</div>
            </div>
        `;
    }
}

/**
 * Classe Deck - Représente un paquet de cartes
 */
class Deck {
    constructor(numberOfDecks = 1) {
        this.cards = [];
        this.numberOfDecks = numberOfDecks;
        this.initialize();
    }

    initialize() {
        this.cards = [];
        for (let i = 0; i < this.numberOfDecks; i++) {
            Object.values(Card.SUITS).forEach(suit => {
                Object.values(Card.RANKS).forEach(rank => {
                    this.cards.push(new Card(suit, rank));
                });
            });
        }
        this.shuffle();
    }

    shuffle() {
        // Algorithme de Fisher-Yates
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw() {
        if (this.cards.length === 0) {
            this.initialize();
        }
        return this.cards.pop();
    }

    getCardsRemaining() {
        return this.cards.length;
    }

    reset() {
        this.initialize();
    }
}

/**
 * Classe Hand - Représente une main de cartes
 */
class Hand {
    constructor() {
        this.cards = [];
    }

    addCard(card) {
        this.cards.push(card);
    }

    getCards() {
        return [...this.cards];
    }

    getValue() {
        let value = 0;
        let aces = 0;

        this.cards.forEach(card => {
            value += card.getValue();
            if (card.isAce()) {
                aces++;
            }
        });

        // Ajuster la valeur des As si nécessaire
        while (value > 21 && aces > 0) {
            value -= 10; // Convertir un As de 11 à 1
            aces--;
        }

        return value;
    }

    isBusted() {
        return this.getValue() > 21;
    }

    isBlackjack() {
        return this.cards.length === 2 && this.getValue() === 21;
    }

    clear() {
        this.cards = [];
    }

    size() {
        return this.cards.length;
    }
}

/**
 * Classe Player - Représente un joueur (humain ou croupier)
 */
class Player {
    constructor(name, isDealer = false) {
        this.name = name;
        this.hand = new Hand();
        this.isDealer = isDealer;
    }

    receiveCard(card) {
        this.hand.addCard(card);
    }

    getHandValue() {
        return this.hand.getValue();
    }

    isBusted() {
        return this.hand.isBusted();
    }

    hasBlackjack() {
        return this.hand.isBlackjack();
    }

    clearHand() {
        this.hand.clear();
    }

    getHand() {
        return this.hand;
    }

    // Stratégie du croupier
    shouldDealerHit() {
        return this.isDealer && this.getHandValue() < 17;
    }
}

/**
 * Classe HumanPlayer - Joueur humain avec solde et paris
 */
class HumanPlayer extends Player {
    constructor(name, balance = 1000) {
        super(name, false);
        this.balance = balance;
        this.currentBet = 0;
        this.stats = {
            wins: 0,
            losses: 0,
            ties: 0,
            blackjacks: 0
        };
    }

    placeBet(amount) {
        if (amount > this.balance) {
            throw new Error('Mise supérieure au solde disponible');
        }
        this.currentBet += amount;
        this.balance -= amount;
    }

    clearBet() {
        this.balance += this.currentBet;
        this.currentBet = 0;
    }

    win(multiplier = 1) {
        const winnings = this.currentBet * (1 + multiplier);
        this.balance += winnings;
        this.stats.wins++;
        return winnings;
    }

    lose() {
        this.stats.losses++;
        this.currentBet = 0;
    }

    tie() {
        this.balance += this.currentBet;
        this.stats.ties++;
        this.currentBet = 0;
    }

    recordBlackjack() {
        this.stats.blackjacks++;
    }

    canDouble() {
        return this.currentBet <= this.balance && this.hand.size() === 2;
    }

    doubleBet() {
        if (!this.canDouble()) {
            throw new Error('Impossible de doubler');
        }
        this.balance -= this.currentBet;
        this.currentBet *= 2;
    }

    getBalance() {
        return this.balance;
    }

    getCurrentBet() {
        return this.currentBet;
    }

    getStats() {
        return { ...this.stats };
    }
}

/**
 * Classe Game - Contrôleur du jeu Blackjack
 */
class BlackjackGame {
    static GAME_STATE = {
        BETTING: 'betting',
        DEALING: 'dealing',
        PLAYER_TURN: 'player_turn',
        DEALER_TURN: 'dealer_turn',
        GAME_OVER: 'game_over'
    };

    constructor() {
        this.deck = new Deck(6); // 6 paquets de cartes
        this.player = new HumanPlayer('Joueur', 1000);
        this.dealer = new Player('Croupier', true);
        this.state = BlackjackGame.GAME_STATE.BETTING;
        this.dealerHiddenCard = true;
    }

    // Gestion des mises
    placeBet(amount) {
        if (this.state !== BlackjackGame.GAME_STATE.BETTING) {
            throw new Error('Vous ne pouvez pas miser maintenant');
        }
        this.player.placeBet(amount);
    }

    clearBet() {
        if (this.state !== BlackjackGame.GAME_STATE.BETTING) {
            throw new Error('Vous ne pouvez pas effacer la mise maintenant');
        }
        this.player.clearBet();
    }

    // Début de partie
    deal() {
        if (this.player.getCurrentBet() === 0) {
            throw new Error('Veuillez placer une mise');
        }

        this.state = BlackjackGame.GAME_STATE.DEALING;
        this.player.clearHand();
        this.dealer.clearHand();
        this.dealerHiddenCard = true;

        // Distribution initiale
        this.player.receiveCard(this.deck.draw());
        this.dealer.receiveCard(this.deck.draw());
        this.player.receiveCard(this.deck.draw());
        this.dealer.receiveCard(this.deck.draw());

        // Vérifier les blackjacks
        if (this.player.hasBlackjack() || this.dealer.hasBlackjack()) {
            this.dealerHiddenCard = false;
            this.state = BlackjackGame.GAME_STATE.GAME_OVER;
            return this.determineWinner();
        }

        this.state = BlackjackGame.GAME_STATE.PLAYER_TURN;
        return null;
    }

    // Actions du joueur
    hit() {
        if (this.state !== BlackjackGame.GAME_STATE.PLAYER_TURN) {
            throw new Error('Ce n\'est pas votre tour');
        }

        this.player.receiveCard(this.deck.draw());

        if (this.player.isBusted()) {
            this.state = BlackjackGame.GAME_STATE.GAME_OVER;
            this.dealerHiddenCard = false;
            return this.determineWinner();
        }

        return null;
    }

    stand() {
        if (this.state !== BlackjackGame.GAME_STATE.PLAYER_TURN) {
            throw new Error('Ce n\'est pas votre tour');
        }

        this.state = BlackjackGame.GAME_STATE.DEALER_TURN;
        this.dealerHiddenCard = false;
        return this.playDealerTurn();
    }

    double() {
        if (this.state !== BlackjackGame.GAME_STATE.PLAYER_TURN) {
            throw new Error('Ce n\'est pas votre tour');
        }

        if (!this.player.canDouble()) {
            throw new Error('Impossible de doubler');
        }

        this.player.doubleBet();
        this.player.receiveCard(this.deck.draw());

        if (this.player.isBusted()) {
            this.state = BlackjackGame.GAME_STATE.GAME_OVER;
            this.dealerHiddenCard = false;
            return this.determineWinner();
        }

        this.state = BlackjackGame.GAME_STATE.DEALER_TURN;
        this.dealerHiddenCard = false;
        return this.playDealerTurn();
    }

    // Tour du croupier
    playDealerTurn() {
        const actions = [];

        while (this.dealer.shouldDealerHit()) {
            const card = this.deck.draw();
            this.dealer.receiveCard(card);
            actions.push({ action: 'hit', card });
        }

        this.state = BlackjackGame.GAME_STATE.GAME_OVER;
        return {
            actions,
            result: this.determineWinner()
        };
    }

    // Déterminer le gagnant
    determineWinner() {
        const playerValue = this.player.getHandValue();
        const dealerValue = this.dealer.getHandValue();
        const playerBlackjack = this.player.hasBlackjack();
        const dealerBlackjack = this.dealer.hasBlackjack();

        let result = {
            outcome: '',
            message: '',
            winnings: 0
        };

        // Blackjacks
        if (playerBlackjack && dealerBlackjack) {
            result.outcome = 'tie';
            result.message = 'Égalité - Deux Blackjacks !';
            this.player.tie();
        } else if (playerBlackjack) {
            result.outcome = 'blackjack';
            result.message = '🎉 BLACKJACK ! 🎉';
            result.winnings = this.player.win(1.5); // Blackjack paie 3:2
            this.player.recordBlackjack();
        } else if (dealerBlackjack) {
            result.outcome = 'lose';
            result.message = 'Le croupier a un Blackjack - Vous perdez';
            this.player.lose();
        }
        // Busts
        else if (this.player.isBusted()) {
            result.outcome = 'lose';
            result.message = 'Vous avez dépassé 21 - Vous perdez';
            this.player.lose();
        } else if (this.dealer.isBusted()) {
            result.outcome = 'win';
            result.message = 'Le croupier a dépassé 21 - Vous gagnez !';
            result.winnings = this.player.win(1);
        }
        // Comparaison des valeurs
        else if (playerValue > dealerValue) {
            result.outcome = 'win';
            result.message = 'Vous gagnez !';
            result.winnings = this.player.win(1);
        } else if (playerValue < dealerValue) {
            result.outcome = 'lose';
            result.message = 'Le croupier gagne - Vous perdez';
            this.player.lose();
        } else {
            result.outcome = 'tie';
            result.message = 'Égalité !';
            this.player.tie();
        }

        return result;
    }

    // Nouvelle partie
    newGame() {
        this.state = BlackjackGame.GAME_STATE.BETTING;
        this.dealerHiddenCard = true;
    }

    // Getters
    getState() {
        return this.state;
    }

    getPlayer() {
        return this.player;
    }

    getDealer() {
        return this.dealer;
    }

    isDealerCardHidden() {
        return this.dealerHiddenCard;
    }
}

/**
 * Classe GameUI - Gère l'interface utilisateur
 */
class GameUI {
    constructor(game) {
        this.game = game;
        this.initializeElements();
        this.attachEventListeners();
        this.render();
    }

    initializeElements() {
        // Betting elements
        this.bettingControls = document.getElementById('bettingControls');
        this.chipButtons = document.querySelectorAll('.chip-btn');
        this.clearBetBtn = document.getElementById('clearBet');
        this.dealBtn = document.getElementById('dealBtn');

        // Game control elements
        this.gameControls = document.getElementById('gameControls');
        this.hitBtn = document.getElementById('hitBtn');
        this.standBtn = document.getElementById('standBtn');
        this.doubleBtn = document.getElementById('doubleBtn');

        // New game elements
        this.newGameControls = document.getElementById('newGameControls');
        this.newGameBtn = document.getElementById('newGameBtn');

        // Display elements
        this.playerHand = document.getElementById('playerHand');
        this.dealerHand = document.getElementById('dealerHand');
        this.playerScore = document.getElementById('playerScore');
        this.dealerScore = document.getElementById('dealerScore');
        this.gameMessage = document.getElementById('gameMessage');
        
        // Stats elements
        this.balanceEl = document.getElementById('playerBalance');
        this.currentBetEl = document.getElementById('currentBet');
        this.winsEl = document.getElementById('wins');
        this.lossesEl = document.getElementById('losses');
        this.tiesEl = document.getElementById('ties');
        this.blackjacksEl = document.getElementById('blackjacks');
    }

    attachEventListeners() {
        // Betting
        this.chipButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.dataset.amount);
                this.handleBet(amount);
            });
        });

        this.clearBetBtn.addEventListener('click', () => this.handleClearBet());
        this.dealBtn.addEventListener('click', () => this.handleDeal());

        // Game actions
        this.hitBtn.addEventListener('click', () => this.handleHit());
        this.standBtn.addEventListener('click', () => this.handleStand());
        this.doubleBtn.addEventListener('click', () => this.handleDouble());

        // New game
        this.newGameBtn.addEventListener('click', () => this.handleNewGame());
    }

    // Event handlers
    handleBet(amount) {
        try {
            this.game.placeBet(amount);
            this.render();
        } catch (error) {
            this.showMessage(error.message, 'lose');
        }
    }

    handleClearBet() {
        try {
            this.game.clearBet();
            this.render();
        } catch (error) {
            this.showMessage(error.message, 'lose');
        }
    }

    async handleDeal() {
        try {
            const result = this.game.deal();
            this.render();
            
            if (result) {
                await this.delay(500);
                this.handleGameOver(result);
            }
        } catch (error) {
            this.showMessage(error.message, 'lose');
        }
    }

    async handleHit() {
        try {
            const result = this.game.hit();
            this.render();
            
            if (result) {
                await this.delay(500);
                this.handleGameOver(result);
            }
        } catch (error) {
            this.showMessage(error.message, 'lose');
        }
    }

    async handleStand() {
        try {
            const dealerResult = this.game.stand();
            this.render();
            
            // Animer le tour du croupier
            if (dealerResult.actions.length > 0) {
                for (let action of dealerResult.actions) {
                    await this.delay(800);
                    this.render();
                }
            }
            
            await this.delay(500);
            this.handleGameOver(dealerResult.result);
        } catch (error) {
            this.showMessage(error.message, 'lose');
        }
    }

    async handleDouble() {
        try {
            const result = this.game.double();
            this.render();
            
            if (result && result.result) {
                // Si la partie est terminée immédiatement
                await this.delay(500);
                this.handleGameOver(result.result);
            } else {
                // Sinon, jouer le tour du croupier
                await this.delay(500);
                this.render();
                
                if (result.actions && result.actions.length > 0) {
                    for (let action of result.actions) {
                        await this.delay(800);
                        this.render();
                    }
                }
                
                await this.delay(500);
                this.handleGameOver(result.result);
            }
        } catch (error) {
            this.showMessage(error.message, 'lose');
        }
    }

    handleGameOver(result) {
        this.showMessage(result.message, result.outcome);
        this.render();
    }

    handleNewGame() {
        this.game.newGame();
        this.clearMessage();
        this.render();
    }

    // Rendering
    render() {
        this.renderHands();
        this.renderScores();
        this.renderStats();
        this.renderControls();
    }

    renderHands() {
        const player = this.game.getPlayer();
        const dealer = this.game.getDealer();
        const hideDealer = this.game.isDealerCardHidden();

        // Player hand
        this.playerHand.innerHTML = player.getHand().getCards()
            .map(card => card.toHTML())
            .join('');

        // Dealer hand
        this.dealerHand.innerHTML = dealer.getHand().getCards()
            .map((card, index) => {
                if (hideDealer && index === 1) {
                    return card.toHTML(true);
                }
                return card.toHTML();
            })
            .join('');
    }

    renderScores() {
        const player = this.game.getPlayer();
        const dealer = this.game.getDealer();
        const hideDealer = this.game.isDealerCardHidden();

        this.playerScore.textContent = player.getHandValue();
        this.dealerScore.textContent = hideDealer ? '?' : dealer.getHandValue();
    }

    renderStats() {
        const player = this.game.getPlayer();
        const stats = player.getStats();

        this.balanceEl.textContent = `${player.getBalance()} €`;
        this.currentBetEl.textContent = `${player.getCurrentBet()} €`;
        this.winsEl.textContent = stats.wins;
        this.lossesEl.textContent = stats.losses;
        this.tiesEl.textContent = stats.ties;
        this.blackjacksEl.textContent = stats.blackjacks;
    }

    renderControls() {
        const state = this.game.getState();
        const player = this.game.getPlayer();

        // Hide all controls first
        this.bettingControls.style.display = 'none';
        this.gameControls.style.display = 'none';
        this.newGameControls.style.display = 'none';

        switch (state) {
            case BlackjackGame.GAME_STATE.BETTING:
                this.bettingControls.style.display = 'block';
                this.dealBtn.disabled = player.getCurrentBet() === 0;
                break;
            
            case BlackjackGame.GAME_STATE.PLAYER_TURN:
                this.gameControls.style.display = 'flex';
                this.doubleBtn.disabled = !player.canDouble();
                break;
            
            case BlackjackGame.GAME_STATE.GAME_OVER:
                this.newGameControls.style.display = 'flex';
                break;
        }
    }

    showMessage(message, type = '') {
        this.gameMessage.textContent = message;
        this.gameMessage.className = `message ${type}`;
    }

    clearMessage() {
        this.gameMessage.textContent = '';
        this.gameMessage.className = 'message';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialisation du jeu
document.addEventListener('DOMContentLoaded', () => {
    const game = new BlackjackGame();
    const ui = new GameUI(game);
    
    // Exposer pour le debugging
    window.blackjackGame = game;
    window.gameUI = ui;
});