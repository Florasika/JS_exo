// app.js - RPG Game with OOP

// ============= CLASSES DE BASE =============

/**
 * Classe Item - Représente un objet
 */
class Item {
    #name;
    #icon;
    #description;
    #type;

    constructor(data) {
        this.#name = data.name;
        this.#icon = data.icon;
        this.#description = data.description || '';
        this.#type = data.type; // 'weapon', 'potion', 'armor'
    }

    getName() {
        return this.#name;
    }

    getIcon() {
        return this.#icon;
    }

    getDescription() {
        return this.#description;
    }

    getType() {
        return this.#type;
    }

    use(character) {
        // Méthode à surcharger dans les sous-classes
    }
}

/**
 * Classe Weapon - Représente une arme (héritage)
 */
class Weapon extends Item {
    #attackBonus;
    #defenseBonus;

    constructor(data) {
        super({ ...data, type: 'weapon' });
        this.#attackBonus = data.attackBonus || 0;
        this.#defenseBonus = data.defenseBonus || 0;
    }

    getAttackBonus() {
        return this.#attackBonus;
    }

    getDefenseBonus() {
        return this.#defenseBonus;
    }
}

/**
 * Classe Potion - Représente une potion (héritage)
 */
class Potion extends Item {
    #healAmount;

    constructor(data) {
        super({ ...data, type: 'potion' });
        this.#healAmount = data.healAmount || 50;
    }

    use(character) {
        character.heal(this.#healAmount);
        return `${character.getName()} utilise ${this.getName()} et récupère ${this.#healAmount} HP!`;
    }

    getHealAmount() {
        return this.#healAmount;
    }
}

/**
 * Classe Character - Classe de base pour les personnages
 */
class Character {
    #name;
    #maxHp;
    #hp;
    #baseAttack;
    #baseDefense;
    #isDefending;
    #level;

    constructor(data) {
        this.#name = data.name;
        this.#maxHp = data.maxHp;
        this.#hp = data.maxHp;
        this.#baseAttack = data.attack;
        this.#baseDefense = data.defense;
        this.#isDefending = false;
        this.#level = data.level || 1;
    }

    // Getters
    getName() {
        return this.#name;
    }

    getHp() {
        return this.#hp;
    }

    getMaxHp() {
        return this.#maxHp;
    }

    getAttack() {
        return this.#baseAttack;
    }

    getDefense() {
        return this.#baseDefense + (this.#isDefending ? 10 : 0);
    }

    getLevel() {
        return this.#level;
    }

    isAlive() {
        return this.#hp > 0;
    }

    isDefending() {
        return this.#isDefending;
    }

    // Actions de base
    attack(target) {
        const damage = this.calculateDamage(target);
        target.takeDamage(damage);
        this.#isDefending = false;
        return {
            attacker: this.#name,
            target: target.getName(),
            damage: damage,
            message: `${this.#name} attaque ${target.getName()} et inflige ${damage} dégâts!`
        };
    }

    calculateDamage(target) {
        const baseDamage = this.#baseAttack;
        const defense = target.getDefense();
        const damage = Math.max(1, baseDamage - Math.floor(defense / 2));
        return Math.floor(damage * (0.9 + Math.random() * 0.2)); // Variation de ±10%
    }

    takeDamage(damage) {
        this.#hp = Math.max(0, this.#hp - damage);
    }

    heal(amount) {
        const actualHeal = Math.min(amount, this.#maxHp - this.#hp);
        this.#hp = Math.min(this.#maxHp, this.#hp + amount);
        return actualHeal;
    }

    defend() {
        this.#isDefending = true;
        return `${this.#name} se met en position défensive!`;
    }

    // Méthodes protégées pour les sous-classes
    _setHp(hp) {
        this.#hp = hp;
    }

    _setMaxHp(maxHp) {
        this.#maxHp = maxHp;
    }

    _setBaseAttack(attack) {
        this.#baseAttack = attack;
    }

    _setBaseDefense(defense) {
        this.#baseDefense = defense;
    }

    _setLevel(level) {
        this.#level = level;
    }

    _resetDefense() {
        this.#isDefending = false;
    }
}

/**
 * Classe Hero - Personnage joueur (héritage avec polymorphisme)
 */
class Hero extends Character {
    #className;
    #experience;
    #experienceToNextLevel;
    #gold;
    #inventory;
    #equippedWeapon;
    #potions;

    constructor(data) {
        super(data);
        this.#className = data.className;
        this.#experience = 0;
        this.#experienceToNextLevel = 100;
        this.#gold = 0;
        this.#inventory = [];
        this.#equippedWeapon = null;
        this.#potions = 3; // Commence avec 3 potions
    }

    getClassName() {
        return this.#className;
    }

    getExperience() {
        return this.#experience;
    }

    getExperienceToNextLevel() {
        return this.#experienceToNextLevel;
    }

    getGold() {
        return this.#gold;
    }

    getInventory() {
        return [...this.#inventory];
    }

    getPotionCount() {
        return this.#potions;
    }

    getEquippedWeapon() {
        return this.#equippedWeapon;
    }

    // Override pour inclure le bonus d'arme
    getAttack() {
        let attack = super.getAttack();
        if (this.#equippedWeapon) {
            attack += this.#equippedWeapon.getAttackBonus();
        }
        return attack;
    }

    getDefense() {
        let defense = super.getDefense();
        if (this.#equippedWeapon) {
            defense += this.#equippedWeapon.getDefenseBonus();
        }
        return defense;
    }

    // Compétence spéciale (polymorphisme)
    useSkill(target) {
        this._resetDefense();
        
        switch(this.#className) {
            case 'warrior':
                return this.#warriorSkill(target);
            case 'mage':
                return this.#mageSkill(target);
            case 'rogue':
                return this.#rogueSkill(target);
            default:
                return this.attack(target);
        }
    }

    #warriorSkill(target) {
        const damage = Math.floor(this.getAttack() * 1.5);
        target.takeDamage(damage);
        return {
            attacker: this.getName(),
            target: target.getName(),
            damage: damage,
            message: `${this.getName()} utilise Coup Puissant et inflige ${damage} dégâts!`
        };
    }

    #mageSkill(target) {
        const damage = Math.floor(this.getAttack() * 2);
        target.takeDamage(damage);
        return {
            attacker: this.getName(),
            target: target.getName(),
            damage: damage,
            message: `${this.getName()} lance Boule de Feu et inflige ${damage} dégâts!`
        };
    }

    #rogueSkill(target) {
        const critChance = Math.random();
        const damage = critChance > 0.3 
            ? Math.floor(this.getAttack() * 2.5)
            : Math.floor(this.getAttack() * 1.2);
        target.takeDamage(damage);
        const message = critChance > 0.3
            ? `${this.getName()} réussit un Coup Critique et inflige ${damage} dégâts!`
            : `${this.getName()} utilise Attaque Sournoise et inflige ${damage} dégâts!`;
        return {
            attacker: this.getName(),
            target: target.getName(),
            damage: damage,
            message: message
        };
    }

    // Utiliser une potion
    usePotion() {
        if (this.#potions <= 0) {
            return null;
        }

        this.#potions--;
        const healAmount = 50;
        const actualHeal = this.heal(healAmount);
        return {
            message: `${this.getName()} utilise une potion et récupère ${actualHeal} HP!`,
            healAmount: actualHeal
        };
    }

    // Gestion de l'inventaire
    addItem(item) {
        this.#inventory.push(item);
    }

    equipWeapon(weapon) {
        if (!(weapon instanceof Weapon)) {
            throw new Error('Seules les armes peuvent être équipées');
        }
        this.#equippedWeapon = weapon;
    }

    // Système d'expérience
    gainExperience(amount) {
        this.#experience += amount;
        
        const levelsGained = [];
        while (this.#experience >= this.#experienceToNextLevel) {
            this.#experience -= this.#experienceToNextLevel;
            this.#levelUp();
            levelsGained.push(this.getLevel());
        }

        return levelsGained;
    }

    #levelUp() {
        this._setLevel(this.getLevel() + 1);
        
        // Augmentation des stats selon la classe
        const statGains = {
            warrior: { hp: 20, attack: 3, defense: 2 },
            mage: { hp: 10, attack: 5, defense: 1 },
            rogue: { hp: 15, attack: 4, defense: 1 }
        };

        const gains = statGains[this.#className];
        this._setMaxHp(this.getMaxHp() + gains.hp);
        this._setHp(this.getMaxHp()); // Heal complet au level up
        this._setBaseAttack(this.getAttack() + gains.attack);
        this._setBaseDefense(this.getDefense() + gains.defense);

        this.#experienceToNextLevel = Math.floor(this.#experienceToNextLevel * 1.5);
        this.#potions += 2; // Bonus de potions
    }

    addGold(amount) {
        this.#gold += amount;
    }
}

/**
 * Classe Enemy - Ennemi (héritage avec comportement différent)
 */
class Enemy extends Character {
    #enemyType;
    #expReward;
    #goldReward;
    #lootTable;

    constructor(data) {
        super(data);
        this.#enemyType = data.enemyType;
        this.#expReward = data.expReward || 50;
        this.#goldReward = data.goldReward || 25;
        this.#lootTable = data.lootTable || [];
    }

    getEnemyType() {
        return this.#enemyType;
    }

    getExpReward() {
        return this.#expReward;
    }

    getGoldReward() {
        return this.#goldReward;
    }

    // Comportement IA de l'ennemi
    chooseAction(hero) {
        // IA simple : 70% attaque, 30% défense si HP bas
        const hpPercent = this.getHp() / this.getMaxHp();
        
        if (hpPercent < 0.3 && Math.random() < 0.3) {
            return 'defend';
        }
        
        return 'attack';
    }

    // Loot
    dropLoot() {
        if (this.#lootTable.length === 0) return null;
        
        const dropChance = Math.random();
        if (dropChance < 0.5) { // 50% de chance de drop
            const randomIndex = Math.floor(Math.random() * this.#lootTable.length);
            return this.#lootTable[randomIndex];
        }
        
        return null;
    }
}

/**
 * Classe Boss - Boss plus puissant (héritage d'Enemy)
 */
class Boss extends Enemy {
    #specialAttackName;
    #specialAttackMultiplier;

    constructor(data) {
        super(data);
        this.#specialAttackName = data.specialAttackName || 'Attaque Spéciale';
        this.#specialAttackMultiplier = data.specialAttackMultiplier || 2;
    }

    // Override du choix d'action
    chooseAction(hero) {
        const hpPercent = this.getHp() / this.getMaxHp();
        const random = Math.random();
        
        if (hpPercent < 0.5 && random < 0.3) {
            return 'special';
        } else if (hpPercent < 0.3 && random < 0.5) {
            return 'defend';
        }
        
        return 'attack';
    }

    specialAttack(target) {
        const damage = Math.floor(this.getAttack() * this.#specialAttackMultiplier);
        target.takeDamage(damage);
        this._resetDefense();
        return {
            attacker: this.getName(),
            target: target.getName(),
            damage: damage,
            message: `${this.getName()} utilise ${this.#specialAttackName} et inflige ${damage} dégâts!`
        };
    }
}

/**
 * Classe Battle - Gère le combat
 */
class Battle {
    #hero;
    #enemy;
    #isHeroTurn;
    #battleLog;

    constructor(hero, enemy) {
        this.#hero = hero;
        this.#enemy = enemy;
        this.#isHeroTurn = true;
        this.#battleLog = [];
    }

    getHero() {
        return this.#hero;
    }

    getEnemy() {
        return this.#enemy;
    }

    isHeroTurn() {
        return this.#isHeroTurn;
    }

    getBattleLog() {
        return [...this.#battleLog];
    }

    addLog(message, type = 'system') {
        this.#battleLog.push({ message, type });
    }

    // Actions du héros
    heroAttack() {
        if (!this.#isHeroTurn || !this.#hero.isAlive() || !this.#enemy.isAlive()) {
            return null;
        }

        const result = this.#hero.attack(this.#enemy);
        this.addLog(result.message, 'hero-action');
        
        this.#isHeroTurn = false;
        
        if (!this.#enemy.isAlive()) {
            return this.#endBattle(true);
        }

        return result;
    }

    heroDefend() {
        if (!this.#isHeroTurn || !this.#hero.isAlive()) {
            return null;
        }

        const message = this.#hero.defend();
        this.addLog(message, 'hero-action');
        
        this.#isHeroTurn = false;
        
        return { message };
    }

    heroUseSkill() {
        if (!this.#isHeroTurn || !this.#hero.isAlive() || !this.#enemy.isAlive()) {
            return null;
        }

        const result = this.#hero.useSkill(this.#enemy);
        this.addLog(result.message, 'hero-action');
        
        this.#isHeroTurn = false;
        
        if (!this.#enemy.isAlive()) {
            return this.#endBattle(true);
        }

        return result;
    }

    heroUsePotion() {
        if (!this.#isHeroTurn || !this.#hero.isAlive()) {
            return null;
        }

        const result = this.#hero.usePotion();
        if (!result) {
            return { error: 'Aucune potion disponible!' };
        }

        this.addLog(result.message, 'hero-action');
        
        this.#isHeroTurn = false;
        
        return result;
    }

    // Tour de l'ennemi
    enemyTurn() {
        if (this.#isHeroTurn || !this.#hero.isAlive() || !this.#enemy.isAlive()) {
            return null;
        }

        const action = this.#enemy.chooseAction(this.#hero);
        let result;

        if (action === 'special' && this.#enemy instanceof Boss) {
            result = this.#enemy.specialAttack(this.#hero);
        } else if (action === 'defend') {
            const message = this.#enemy.defend();
            result = { message };
        } else {
            result = this.#enemy.attack(this.#hero);
        }

        this.addLog(result.message, 'enemy-action');
        
        this.#isHeroTurn = true;
        
        if (!this.#hero.isAlive()) {
            return this.#endBattle(false);
        }

        return result;
    }

    #endBattle(heroWon) {
        if (heroWon) {
            const expGained = this.#enemy.getExpReward();
            const goldGained = this.#enemy.getGoldReward();
            const loot = this.#enemy.dropLoot();
            
            const levelsGained = this.#hero.gainExperience(expGained);
            this.#hero.addGold(goldGained);
            
            if (loot) {
                this.#hero.addItem(loot);
            }

            return {
                victory: true,
                expGained,
                goldGained,
                loot,
                levelsGained
            };
        } else {
            return {
                victory: false,
                defeat: true
            };
        }
    }
}

/**
 * Classe Game - Contrôleur principal du jeu
 */
class Game {
    #hero;
    #currentBattle;
    #battleCount;

    constructor() {
        this.#hero = null;
        this.#currentBattle = null;
        this.#battleCount = 0;
    }

    createHero(name, className) {
        const classStats = {
            warrior: { maxHp: 150, attack: 20, defense: 15 },
            mage: { maxHp: 100, attack: 30, defense: 5 },
            rogue: { maxHp: 120, attack: 25, defense: 10 }
        };

        const stats = classStats[className];
        this.#hero = new Hero({
            name,
            className,
            ...stats,
            level: 1
        });

        return this.#hero;
    }

    getHero() {
        return this.#hero;
    }

    getCurrentBattle() {
        return this.#currentBattle;
    }

    startBattle() {
        this.#battleCount++;
        const enemy = this.#generateEnemy();
        this.#currentBattle = new Battle(this.#hero, enemy);
        return this.#currentBattle;
    }

    #generateEnemy() {
        const heroLevel = this.#hero.getLevel();
        const isBoss = this.#battleCount % 5 === 0;

        if (isBoss) {
            return this.#generateBoss(heroLevel);
        } else {
            return this.#generateNormalEnemy(heroLevel);
        }
    }

    #generateNormalEnemy(heroLevel) {
        const enemyTypes = [
            { type: 'goblin', icon: '👺', name: 'Gobelin' },
            { type: 'orc', icon: '👹', name: 'Orc' },
            { type: 'skeleton', icon: '💀', name: 'Squelette' },
            { type: 'wolf', icon: '🐺', name: 'Loup' }
        ];

        const enemyData = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const levelVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, ou +1
        const enemyLevel = Math.max(1, heroLevel + levelVariation);

        const baseHp = 40 + (enemyLevel * 15);
        const baseAttack = 10 + (enemyLevel * 3);
        const baseDefense = 3 + (enemyLevel * 2);

        const weapons = [
            new Weapon({ name: 'Épée Rouillée', icon: '🗡️', attackBonus: 5, defenseBonus: 0 }),
            new Weapon({ name: 'Hache de Fer', icon: '🪓', attackBonus: 7, defenseBonus: 0 }),
            new Weapon({ name: 'Dague', icon: '🔪', attackBonus: 6, defenseBonus: 0 })
        ];

        return new Enemy({
            name: `${enemyData.name} Niv.${enemyLevel}`,
            enemyType: enemyData.type,
            maxHp: baseHp,
            attack: baseAttack,
            defense: baseDefense,
            level: enemyLevel,
            expReward: 30 + (enemyLevel * 10),
            goldReward: 15 + (enemyLevel * 5),
            lootTable: Math.random() < 0.3 ? weapons : []
        });
    }

    #generateBoss(heroLevel) {
        const bossLevel = heroLevel + 2;
        
        const baseHp = 100 + (bossLevel * 25);
        const baseAttack = 15 + (bossLevel * 5);
        const baseDefense = 10 + (bossLevel * 3);

        const legendaryWeapons = [
            new Weapon({ name: 'Excalibur', icon: '⚔️', attackBonus: 15, defenseBonus: 5 }),
            new Weapon({ name: 'Marteau de Thor', icon: '🔨', attackBonus: 20, defenseBonus: 10 })
        ];

        return new Boss({
            name: `Dragon Niv.${bossLevel}`,
            enemyType: 'dragon',
            maxHp: baseHp,
            attack: baseAttack,
            defense: baseDefense,
            level: bossLevel,
            expReward: 100 + (bossLevel * 20),
            goldReward: 50 + (bossLevel * 15),
            lootTable: legendaryWeapons,
            specialAttackName: 'Souffle de Feu',
            specialAttackMultiplier: 2.5
        });
    }
}

/**
 * Classe GameUI - Interface utilisateur
 */
class GameUI {
    constructor() {
        this.game = new Game();
        this.selectedClass = null;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Character creation
        this.characterCreation = document.getElementById('characterCreation');
        this.heroNameInput = document.getElementById('heroName');
        this.classCards = document.querySelectorAll('.class-card');
        this.startGameBtn = document.getElementById('startGameBtn');

        // Game screen
        this.gameScreen = document.getElementById('gameScreen');
        
        // Hero UI
        this.heroNameDisplay = document.getElementById('heroNameDisplay');
        this.heroLevel = document.getElementById('heroLevel');
        this.heroAvatar = document.getElementById('heroAvatar');
        this.heroHpText = document.getElementById('heroHpText');
        this.heroHpBar = document.getElementById('heroHpBar');
        this.heroExpText = document.getElementById('heroExpText');
        this.heroExpBar = document.getElementById('heroExpBar');
        this.heroAtk = document.getElementById('heroAtk');
        this.heroDef = document.getElementById('heroDef');
        this.heroGold = document.getElementById('heroGold');
        this.inventoryList = document.getElementById('inventoryList');

        // Enemy UI
        this.enemyContainer = document.getElementById('enemyContainer');
        this.enemyName = document.getElementById('enemyName');
        this.enemyLevel = document.getElementById('enemyLevel');
        this.enemyAvatar = document.getElementById('enemyAvatar');
        this.enemyHpText = document.getElementById('enemyHpText');
        this.enemyHpBar = document.getElementById('enemyHpBar');
        this.enemyAtk = document.getElementById('enemyAtk');
        this.enemyDef = document.getElementById('enemyDef');

        // Battle
        this.battleLog = document.getElementById('battleLog');
        this.actionsContainer = document.getElementById('actionsContainer');
        this.attackBtn = document.getElementById('attackBtn');
        this.defendBtn = document.getElementById('defendBtn');
        this.skillBtn = document.getElementById('skillBtn');
        this.healBtn = document.getElementById('healBtn');

        // Result screen
        this.resultScreen = document.getElementById('resultScreen');
        this.resultIcon = document.getElementById('resultIcon');
        this.resultTitle = document.getElementById('resultTitle');
        this.resultMessage = document.getElementById('resultMessage');
        this.resultRewards = document.getElementById('resultRewards');
        this.nextBattleBtn = document.getElementById('nextBattleBtn');
        this.restartBtn = document.getElementById('restartBtn');
    }

    attachEventListeners() {
        // Character creation
        this.classCards.forEach(card => {
            card.addEventListener('click', () => this.selectClass(card));
        });
        this.startGameBtn.addEventListener('click', () => this.startGame());

        // Battle actions
        this.attackBtn.addEventListener('click', () => this.heroAction('attack'));
        this.defendBtn.addEventListener('click', () => this.heroAction('defend'));
        this.skillBtn.addEventListener('click', () => this.heroAction('skill'));
        this.healBtn.addEventListener('click', () => this.heroAction('heal'));

        // Result screen
        this.nextBattleBtn.addEventListener('click', () => this.nextBattle());
        this.restartBtn.addEventListener('click', () => this.restart());
    }

    selectClass(card) {
        this.classCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedClass = card.dataset.class;
        this.startGameBtn.disabled = false;
    }

    startGame() {
        const name = this.heroNameInput.value.trim() || 'Héros';
        this.game.createHero(name, this.selectedClass);
        
        this.characterCreation.style.display = 'none';
        this.gameScreen.style.display = 'block';
        
        this.updateHeroUI();
        this.startBattle();
    }

    startBattle() {
        const battle = this.game.startBattle();
        this.updateEnemyUI();
        this.enableActions(true);
        this.addBattleLog('Un nouvel ennemi apparaît!', 'system');
    }

    updateHeroUI() {
        const hero = this.game.getHero();
        if (!hero) return;

        const classIcons = {
            warrior: '⚔️',
            mage: '🔮',
            rogue: '🗡️'
        };

        this.heroNameDisplay.textContent = hero.getName();
        this.heroLevel.textContent = `Niv. ${hero.getLevel()}`;
        this.heroAvatar.textContent = classIcons[hero.getClassName()];
        
        const hpPercent = (hero.getHp() / hero.getMaxHp()) * 100;
        this.heroHpText.textContent = `${hero.getHp()}/${hero.getMaxHp()}`;
        this.heroHpBar.style.width = `${hpPercent}%`;

        const expPercent = (hero.getExperience() / hero.getExperienceToNextLevel()) * 100;
        this.heroExpText.textContent = `${hero.getExperience()}/${hero.getExperienceToNextLevel()}`;
        this.heroExpBar.style.width = `${expPercent}%`;

        this.heroAtk.textContent = hero.getAttack();
        this.heroDef.textContent = hero.getDefense();
        this.heroGold.textContent = hero.getGold();

        this.healBtn.textContent = `❤️ Potion (${hero.getPotionCount()})`;
        this.healBtn.disabled = hero.getPotionCount() === 0;

        this.renderInventory();
    }

    renderInventory() {
        const hero = this.game.getHero();
        const inventory = hero.getInventory();

        if (inventory.length === 0) {
            this.inventoryList.innerHTML = '<p class="empty-message">Inventaire vide</p>';
            return;
        }

        this.inventoryList.innerHTML = inventory.map((item, index) => `
            <div class="inventory-item">
                <div class="item-name">
                    <span class="item-icon">${item.getIcon()}</span>
                    <span>${item.getName()}</span>
                </div>
                <div class="item-actions">
                    ${item.getType() === 'weapon' ? 
                        `<button class="item-btn equip-btn" onclick="gameUI.equipItem(${index})">Équiper</button>` : 
                        ''}
                </div>
            </div>
        `).join('');
    }

    equipItem(index) {
        const hero = this.game.getHero();
        const item = hero.getInventory()[index];
        
        if (item instanceof Weapon) {
            hero.equipWeapon(item);
            this.addBattleLog(`${hero.getName()} équipe ${item.getName()}!`, 'system');
            this.updateHeroUI();
        }
    }

    updateEnemyUI() {
        const battle = this.game.getCurrentBattle();
        if (!battle) return;

        const enemy = battle.getEnemy();
        
        const enemyIcons = {
            goblin: '👺',
            orc: '👹',
            skeleton: '💀',
            wolf: '🐺',
            dragon: '🐉'
        };

        this.enemyName.textContent = enemy.getName();
        this.enemyLevel.textContent = `Niv. ${enemy.getLevel()}`;
        this.enemyAvatar.textContent = enemyIcons[enemy.getEnemyType()];
        
        const hpPercent = (enemy.getHp() / enemy.getMaxHp()) * 100;
        this.enemyHpText.textContent = `${enemy.getHp()}/${enemy.getMaxHp()}`;
        this.enemyHpBar.style.width = `${hpPercent}%`;

        this.enemyAtk.textContent = enemy.getAttack();
        this.enemyDef.textContent = enemy.getDefense();
    }

    heroAction(action) {
        const battle = this.game.getCurrentBattle();
        if (!battle || !battle.isHeroTurn()) return;

        this.enableActions(false);

        let result;
        switch(action) {
            case 'attack':
                result = battle.heroAttack();
                break;
            case 'defend':
                result = battle.heroDefend();
                break;
            case 'skill':
                result = battle.heroUseSkill();
                break;
            case 'heal':
                result = battle.heroUsePotion();
                if (result && result.error) {
                    alert(result.error);
                    this.enableActions(true);
                    return;
                }
                break;
        }

        this.updateHeroUI();
        this.updateEnemyUI();

        if (result && result.victory !== undefined) {
            this.showResult(result);
            return;
        }

        setTimeout(() => this.enemyTurn(), 1000);
    }

    enemyTurn() {
        const battle = this.game.getCurrentBattle();
        if (!battle) return;

        const result = battle.enemyTurn();
        
        this.updateHeroUI();
        this.updateEnemyUI();

        if (result && result.defeat) {
            this.showResult(result);
            return;
        }

        this.enableActions(true);
    }

    enableActions(enabled) {
        this.attackBtn.disabled = !enabled;
        this.defendBtn.disabled = !enabled;
        this.skillBtn.disabled = !enabled;
        const hero = this.game.getHero();
        this.healBtn.disabled = !enabled || hero.getPotionCount() === 0;
    }

    addBattleLog(message, type = 'system') {
        const entry = document.createElement('p');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;
        this.battleLog.appendChild(entry);
        this.battleLog.scrollTop = this.battleLog.scrollHeight;
    }

    showResult(result) {
        if (result.victory) {
            this.resultIcon.textContent = '🎉';
            this.resultTitle.textContent = 'Victoire!';
            this.resultMessage.textContent = 'Vous avez vaincu l\'ennemi!';
            
            let rewardsHtml = `
                <div class="reward-item">
                    <span>Expérience:</span>
                    <span>+${result.expGained} XP</span>
                </div>
                <div class="reward-item">
                    <span>Or:</span>
                    <span>+${result.goldGained} 💰</span>
                </div>
            `;

            if (result.levelsGained && result.levelsGained.length > 0) {
                rewardsHtml += `
                    <div class="reward-item" style="color: var(--warning-color); font-weight: bold;">
                        <span>Niveau supérieur!</span>
                        <span>Niv. ${result.levelsGained[result.levelsGained.length - 1]}</span>
                    </div>
                `;
            }

            if (result.loot) {
                rewardsHtml += `
                    <div class="reward-item" style="color: var(--secondary-color);">
                        <span>Objet trouvé:</span>
                        <span>${result.loot.getIcon()} ${result.loot.getName()}</span>
                    </div>
                `;
            }

            this.resultRewards.innerHTML = rewardsHtml;
            this.nextBattleBtn.style.display = 'inline-block';
        } else {
            this.resultIcon.textContent = '💀';
            this.resultTitle.textContent = 'Défaite';
            this.resultMessage.textContent = 'Vous avez été vaincu...';
            this.resultRewards.innerHTML = '';
            this.nextBattleBtn.style.display = 'none';
        }

        this.resultScreen.style.display = 'flex';
    }

    nextBattle() {
        this.resultScreen.style.display = 'none';
        this.battleLog.innerHTML = '';
        this.updateHeroUI();
        this.startBattle();
    }

    restart() {
        location.reload();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.gameUI = new GameUI();
});