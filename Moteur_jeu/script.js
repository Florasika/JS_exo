// app.js - Mini Game Engine with OOP

// ============= MATH UTILITIES =============

/**
 * Classe Vector2D - Vecteur mathématique 2D
 */
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        return new Vector2D(this.x / scalar, this.y / scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const mag = this.magnitude();
        return mag > 0 ? this.divide(mag) : new Vector2D(0, 0);
    }

    distance(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    clone() {
        return new Vector2D(this.x, this.y);
    }

    static zero() {
        return new Vector2D(0, 0);
    }
}

// ============= EVENT SYSTEM =============

/**
 * Classe EventEmitter - Système d'événements
 */
class EventEmitter {
    #listeners = new Map();

    on(event, callback) {
        if (!this.#listeners.has(event)) {
            this.#listeners.set(event, []);
        }
        this.#listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.#listeners.has(event)) {
            const callbacks = this.#listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.#listeners.has(event)) {
            this.#listeners.get(event).forEach(callback => callback(data));
        }
    }

    clear() {
        this.#listeners.clear();
    }
}

// ============= ENTITY SYSTEM =============

/**
 * Classe Entity - Entité de base du jeu
 */
class Entity extends EventEmitter {
    static #nextId = 0;

    #id;
    #type;
    #position;
    #velocity;
    #size;
    #color;
    #active;
    #health;
    #maxHealth;

    constructor(config) {
        super();
        this.#id = Entity.#nextId++;
        this.#type = config.type || 'entity';
        this.#position = config.position || Vector2D.zero();
        this.#velocity = config.velocity || Vector2D.zero();
        this.#size = config.size || 20;
        this.#color = config.color || '#ffffff';
        this.#active = true;
        this.#health = config.health || 100;
        this.#maxHealth = config.maxHealth || 100;
    }

    // Cycle de vie
    update(deltaTime) {
        if (!this.#active) return;
        
        // Mise à jour de la position avec la vélocité
        this.#position = this.#position.add(this.#velocity.multiply(deltaTime));
    }

    render(ctx) {
        if (!this.#active) return;
        
        ctx.fillStyle = this.#color;
        ctx.fillRect(
            this.#position.x - this.#size / 2,
            this.#position.y - this.#size / 2,
            this.#size,
            this.#size
        );

        // Health bar
        if (this.#health < this.#maxHealth) {
            const barWidth = this.#size;
            const barHeight = 4;
            const healthPercent = this.#health / this.#maxHealth;

            ctx.fillStyle = '#333';
            ctx.fillRect(
                this.#position.x - barWidth / 2,
                this.#position.y - this.#size / 2 - 10,
                barWidth,
                barHeight
            );

            ctx.fillStyle = '#00ff00';
            ctx.fillRect(
                this.#position.x - barWidth / 2,
                this.#position.y - this.#size / 2 - 10,
                barWidth * healthPercent,
                barHeight
            );
        }
    }

    destroy() {
        this.#active = false;
        this.emit('destroyed', this);
    }

    takeDamage(amount) {
        this.#health = Math.max(0, this.#health - amount);
        this.emit('damaged', { entity: this, amount });
        
        if (this.#health <= 0) {
            this.destroy();
        }
    }

    // Collision
    getBounds() {
        return {
            left: this.#position.x - this.#size / 2,
            right: this.#position.x + this.#size / 2,
            top: this.#position.y - this.#size / 2,
            bottom: this.#position.y + this.#size / 2
        };
    }

    intersects(other) {
        const thisBounds = this.getBounds();
        const otherBounds = other.getBounds();

        return !(
            thisBounds.right < otherBounds.left ||
            thisBounds.left > otherBounds.right ||
            thisBounds.bottom < otherBounds.top ||
            thisBounds.top > otherBounds.bottom
        );
    }

    // Getters
    getId() { return this.#id; }
    getType() { return this.#type; }
    getPosition() { return this.#position.clone(); }
    getVelocity() { return this.#velocity.clone(); }
    getSize() { return this.#size; }
    getColor() { return this.#color; }
    isActive() { return this.#active; }
    getHealth() { return this.#health; }
    getMaxHealth() { return this.#maxHealth; }

    // Setters
    setPosition(position) { this.#position = position; }
    setVelocity(velocity) { this.#velocity = velocity; }
    setColor(color) { this.#color = color; }
}

/**
 * Classe Player - Entité joueur (héritage)
 */
class Player extends Entity {
    #speed;
    #shootCooldown;
    #lastShootTime;

    constructor(config) {
        super({
            ...config,
            type: 'player',
            color: '#00aaff',
            size: 30,
            health: 100,
            maxHealth: 100
        });
        this.#speed = 200;
        this.#shootCooldown = 250;
        this.#lastShootTime = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Décelération
        const friction = 0.9;
        this.setVelocity(this.getVelocity().multiply(friction));
    }

    render(ctx) {
        // Triangle pour le joueur
        const pos = this.getPosition();
        const size = this.getSize();
        
        ctx.fillStyle = this.getColor();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - size / 2);
        ctx.lineTo(pos.x - size / 2, pos.y + size / 2);
        ctx.lineTo(pos.x + size / 2, pos.y + size / 2);
        ctx.closePath();
        ctx.fill();

        // Health bar
        const barWidth = size;
        const barHeight = 4;
        const healthPercent = this.getHealth() / this.getMaxHealth();

        ctx.fillStyle = '#333';
        ctx.fillRect(pos.x - barWidth / 2, pos.y - size / 2 - 10, barWidth, barHeight);

        ctx.fillStyle = '#00ff00';
        ctx.fillRect(pos.x - barWidth / 2, pos.y - size / 2 - 10, barWidth * healthPercent, barHeight);
    }

    move(direction) {
        const acceleration = direction.normalize().multiply(this.#speed);
        this.setVelocity(this.getVelocity().add(acceleration.multiply(0.1)));
    }

    canShoot(currentTime) {
        return currentTime - this.#lastShootTime >= this.#shootCooldown;
    }

    shoot(currentTime) {
        if (!this.canShoot(currentTime)) return null;
        
        this.#lastShootTime = currentTime;
        const position = this.getPosition();
        
        return new Projectile({
            position: new Vector2D(position.x, position.y - this.getSize() / 2),
            velocity: new Vector2D(0, -400),
            owner: 'player'
        });
    }
}

/**
 * Classe Enemy - Entité ennemie (héritage)
 */
class Enemy extends Entity {
    #speed;
    #target;

    constructor(config) {
        super({
            ...config,
            type: 'enemy',
            color: '#ff4444',
            size: 25,
            health: 50,
            maxHealth: 50
        });
        this.#speed = 50 + Math.random() * 50;
        this.#target = null;
    }

    setTarget(target) {
        this.#target = target;
    }

    update(deltaTime) {
        // Poursuit le joueur
        if (this.#target && this.#target.isActive()) {
            const direction = this.#target.getPosition().subtract(this.getPosition());
            const velocity = direction.normalize().multiply(this.#speed);
            this.setVelocity(velocity);
        }

        super.update(deltaTime);
    }

    render(ctx) {
        // Hexagone pour l'ennemi
        const pos = this.getPosition();
        const size = this.getSize();
        const sides = 6;
        
        ctx.fillStyle = this.getColor();
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (Math.PI * 2 * i) / sides;
            const x = pos.x + Math.cos(angle) * size / 2;
            const y = pos.y + Math.sin(angle) * size / 2;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();

        // Health bar
        const barWidth = size;
        const barHeight = 4;
        const healthPercent = this.getHealth() / this.getMaxHealth();

        ctx.fillStyle = '#333';
        ctx.fillRect(pos.x - barWidth / 2, pos.y - size / 2 - 10, barWidth, barHeight);

        ctx.fillStyle = '#00ff00';
        ctx.fillRect(pos.x - barWidth / 2, pos.y - size / 2 - 10, barWidth * healthPercent, barHeight);
    }
}

/**
 * Classe Projectile - Projectile
 */
class Projectile extends Entity {
    #owner;
    #damage;

    constructor(config) {
        super({
            ...config,
            type: 'projectile',
            color: '#ffff00',
            size: 8,
            health: 1,
            maxHealth: 1
        });
        this.#owner = config.owner || 'player';
        this.#damage = config.damage || 25;
    }

    getOwner() {
        return this.#owner;
    }

    getDamage() {
        return this.#damage;
    }

    render(ctx) {
        const pos = this.getPosition();
        const size = this.getSize();
        
        ctx.fillStyle = this.getColor();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============= SCENE SYSTEM =============

/**
 * Classe Scene - Gère une scène de jeu
 */
class Scene extends EventEmitter {
    #name;
    #entities;
    #active;

    constructor(name) {
        super();
        this.#name = name;
        this.#entities = new Map();
        this.#active = false;
    }

    addEntity(entity) {
        this.#entities.set(entity.getId(), entity);
        this.emit('entity-added', entity);
    }

    removeEntity(entityId) {
        const entity = this.#entities.get(entityId);
        if (entity) {
            this.#entities.delete(entityId);
            this.emit('entity-removed', entity);
        }
    }

    getEntities() {
        return Array.from(this.#entities.values());
    }

    getEntitiesByType(type) {
        return this.getEntities().filter(e => e.getType() === type);
    }

    getActiveEntities() {
        return this.getEntities().filter(e => e.isActive());
    }

    update(deltaTime) {
        if (!this.#active) return;
        
        this.getActiveEntities().forEach(entity => {
            entity.update(deltaTime);
        });

        // Nettoyer les entités inactives
        this.getEntities().forEach(entity => {
            if (!entity.isActive()) {
                this.removeEntity(entity.getId());
            }
        });
    }

    render(ctx) {
        if (!this.#active) return;
        
        this.getActiveEntities().forEach(entity => {
            entity.render(ctx);
        });
    }

    activate() {
        this.#active = true;
        this.emit('activated');
    }

    deactivate() {
        this.#active = false;
        this.emit('deactivated');
    }

    clear() {
        this.#entities.clear();
        this.emit('cleared');
    }

    isActive() {
        return this.#active;
    }

    getName() {
        return this.#name;
    }
}

// ============= COLLISION SYSTEM =============

/**
 * Classe CollisionSystem - Gère les collisions
 */
class CollisionSystem {
    #collisionCount = 0;

    checkCollisions(scene) {
        this.#collisionCount = 0;
        const entities = scene.getActiveEntities();

        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                if (entities[i].intersects(entities[j])) {
                    this.#handleCollision(entities[i], entities[j]);
                    this.#collisionCount++;
                }
            }
        }
    }

    #handleCollision(entityA, entityB) {
        // Player vs Enemy
        if (entityA.getType() === 'player' && entityB.getType() === 'enemy') {
            entityA.takeDamage(10);
            entityB.takeDamage(50);
        } else if (entityA.getType() === 'enemy' && entityB.getType() === 'player') {
            entityB.takeDamage(10);
            entityA.takeDamage(50);
        }
        // Projectile vs Enemy
        else if (entityA.getType() === 'projectile' && entityB.getType() === 'enemy') {
            if (entityA.getOwner() === 'player') {
                entityB.takeDamage(entityA.getDamage());
                entityA.destroy();
            }
        } else if (entityA.getType() === 'enemy' && entityB.getType() === 'projectile') {
            if (entityB.getOwner() === 'player') {
                entityA.takeDamage(entityB.getDamage());
                entityB.destroy();
            }
        }
    }

    getCollisionCount() {
        return this.#collisionCount;
    }
}

// ============= INPUT SYSTEM =============

/**
 * Classe InputManager - Gère les entrées utilisateur
 */
class InputManager {
    #keys = new Set();
    #mousePos = Vector2D.zero();
    #mouseDown = false;

    constructor(canvas) {
        this.#setupListeners(canvas);
    }

    #setupListeners(canvas) {
        window.addEventListener('keydown', (e) => {
            this.#keys.add(e.key.toLowerCase());
        });

        window.addEventListener('keyup', (e) => {
            this.#keys.delete(e.key.toLowerCase());
        });

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.#mousePos = new Vector2D(
                e.clientX - rect.left,
                e.clientY - rect.top
            );
        });

        canvas.addEventListener('mousedown', () => {
            this.#mouseDown = true;
        });

        canvas.addEventListener('mouseup', () => {
            this.#mouseDown = false;
        });
    }

    isKeyDown(key) {
        return this.#keys.has(key.toLowerCase());
    }

    getMousePosition() {
        return this.#mousePos.clone();
    }

    isMouseDown() {
        const down = this.#mouseDown;
        this.#mouseDown = false; // Reset pour éviter les clics multiples
        return down;
    }
}

// ============= GAME ENGINE =============

/**
 * Classe Game - Moteur de jeu principal
 */
class Game extends EventEmitter {
    #canvas;
    #ctx;
    #scenes;
    #activeScene;
    #running;
    #lastTime;
    #fps;
    #frameCount;
    #lastFpsUpdate;
    #inputManager;
    #collisionSystem;
    #updateTime;
    #renderTime;

    constructor(canvasId) {
        super();
        this.#canvas = document.getElementById(canvasId);
        this.#ctx = this.#canvas.getContext('2d');
        this.#scenes = new Map();
        this.#activeScene = null;
        this.#running = false;
        this.#lastTime = 0;
        this.#fps = 0;
        this.#frameCount = 0;
        this.#lastFpsUpdate = 0;
        this.#updateTime = 0;
        this.#renderTime = 0;
        
        this.#inputManager = new InputManager(this.#canvas);
        this.#collisionSystem = new CollisionSystem();
    }

    createScene(name) {
        const scene = new Scene(name);
        this.#scenes.set(name, scene);
        return scene;
    }

    setActiveScene(name) {
        if (this.#activeScene) {
            this.#activeScene.deactivate();
        }

        const scene = this.#scenes.get(name);
        if (scene) {
            this.#activeScene = scene;
            scene.activate();
            this.emit('scene-changed', scene);
        }
    }

    start() {
        if (this.#running) return;
        
        this.#running = true;
        this.#lastTime = performance.now();
        this.#gameLoop();
        this.emit('started');
    }

    pause() {
        this.#running = false;
        this.emit('paused');
    }

    reset() {
        this.#activeScene?.clear();
        this.emit('reset');
    }

    #gameLoop = (currentTime = 0) => {
        if (!this.#running) return;

        const deltaTime = Math.min((currentTime - this.#lastTime) / 1000, 0.1); // Max 100ms
        this.#lastTime = currentTime;

        // Update
        const updateStart = performance.now();
        this.#update(deltaTime);
        this.#updateTime = performance.now() - updateStart;

        // Render
        const renderStart = performance.now();
        this.#render();
        this.#renderTime = performance.now() - renderStart;

        // FPS
        this.#frameCount++;
        if (currentTime - this.#lastFpsUpdate >= 1000) {
            this.#fps = this.#frameCount;
            this.#frameCount = 0;
            this.#lastFpsUpdate = currentTime;
            this.emit('fps-update', this.#fps);
        }

        requestAnimationFrame(this.#gameLoop);
    }

    #update(deltaTime) {
        if (!this.#activeScene) return;

        // Update entities
        this.#activeScene.update(deltaTime);

        // Check collisions
        this.#collisionSystem.checkCollisions(this.#activeScene);

        // Cleanup out-of-bounds entities
        this.#cleanupEntities();

        this.emit('update', deltaTime);
    }

    #render() {
        if (!this.#activeScene) return;

        // Clear canvas
        this.#ctx.fillStyle = '#000';
        this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);

        // Render scene
        this.#activeScene.render(this.#ctx);

        this.emit('render');
    }

    #cleanupEntities() {
        if (!this.#activeScene) return;

        const entities = this.#activeScene.getActiveEntities();
        entities.forEach(entity => {
            const pos = entity.getPosition();
            const margin = 50;
            
            if (pos.x < -margin || pos.x > this.#canvas.width + margin ||
                pos.y < -margin || pos.y > this.#canvas.height + margin) {
                entity.destroy();
            }
        });
    }

    getCanvas() {
        return this.#canvas;
    }

    getContext() {
        return this.#ctx;
    }

    getActiveScene() {
        return this.#activeScene;
    }

    getInputManager() {
        return this.#inputManager;
    }

    getCollisionSystem() {
        return this.#collisionSystem;
    }

    getFPS() {
        return this.#fps;
    }

    getUpdateTime() {
        return this.#updateTime;
    }

    getRenderTime() {
        return this.#renderTime;
    }

    isRunning() {
        return this.#running;
    }
}

// ============= GAME IMPLEMENTATION =============

/**
 * Classe GameController - Contrôle la logique du jeu
 */
class GameController {
    #game;
    #player;
    #score;
    #gameTime;
    #spawnTimer;
    #spawnInterval;

    constructor() {
        this.#game = new Game('gameCanvas');
        this.#score = 0;
        this.#gameTime = 0;
        this.#spawnTimer = 0;
        this.#spawnInterval = 2000;

        this.#setupGame();
        this.#setupUI();
    }

    #setupGame() {
        // Créer la scène principale
        const mainScene = this.#game.createScene('main');
        this.#game.setActiveScene('main');

        // Créer le joueur
        this.#player = new Player({
            position: new Vector2D(400, 500)
        });

        this.#player.on('destroyed', () => {
            this.#logEvent('Game Over!', 'collision');
            this.#game.pause();
        });

        mainScene.addEntity(this.#player);

        // Événements du jeu
        this.#game.on('update', (deltaTime) => this.#onUpdate(deltaTime));
        this.#game.on('fps-update', (fps) => this.#updateFPS(fps));

        // Canvas click pour spawn enemy
        this.#game.getCanvas().addEventListener('click', (e) => {
            const rect = this.#game.getCanvas().getBoundingClientRect();
            const pos = new Vector2D(
                e.clientX - rect.left,
                e.clientY - rect.top
            );
            this.spawnEnemy(pos);
        });
    }

    #setupUI() {
        document.getElementById('startBtn').addEventListener('click', () => {
            this.#game.start();
            document.getElementById('startBtn').disabled = true;
            document.getElementById('pauseBtn').disabled = false;
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.#game.pause();
            document.getElementById('startBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = true;
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });

        document.getElementById('spawnEnemyBtn').addEventListener('click', () => {
            const canvas = this.#game.getCanvas();
            const pos = new Vector2D(
                Math.random() * canvas.width,
                Math.random() * 200
            );
            this.spawnEnemy(pos);
        });

        document.getElementById('clearEnemiesBtn').addEventListener('click', () => {
            const scene = this.#game.getActiveScene();
            scene.getEntitiesByType('enemy').forEach(enemy => enemy.destroy());
        });

        // Update stats every frame
        setInterval(() => this.#updateStats(), 100);
    }

    #onUpdate(deltaTime) {
        this.#gameTime += deltaTime;
        this.#handleInput(deltaTime);
        this.#updateEnemies();
        this.#spawnEnemies(deltaTime);
        this.#updateEntityList();
    }

    #handleInput(deltaTime) {
        const input = this.#game.getInputManager();
        const moveDir = Vector2D.zero();

        if (input.isKeyDown('arrowleft') || input.isKeyDown('a')) moveDir.x -= 1;
        if (input.isKeyDown('arrowright') || input.isKeyDown('d')) moveDir.x += 1;
        if (input.isKeyDown('arrowup') || input.isKeyDown('w')) moveDir.y -= 1;
        if (input.isKeyDown('arrowdown') || input.isKeyDown('s')) moveDir.y += 1;

        if (moveDir.magnitude() > 0) {
            this.#player.move(moveDir);
        }

        // Shoot
        if (input.isKeyDown(' ')) {
            const projectile = this.#player.shoot(performance.now());
            if (projectile) {
                this.#game.getActiveScene().addEntity(projectile);
                this.#logEvent('Projectile fired', 'event');
            }
        }

        // Keep player in bounds
        const pos = this.#player.getPosition();
        const size = this.#player.getSize();
        const canvas = this.#game.getCanvas();
        
        const clampedX = Math.max(size / 2, Math.min(canvas.width - size / 2, pos.x));
        const clampedY = Math.max(size / 2, Math.min(canvas.height - size / 2, pos.y));
        
        this.#player.setPosition(new Vector2D(clampedX, clampedY));
    }

    #updateEnemies() {
        const enemies = this.#game.getActiveScene().getEntitiesByType('enemy');
        enemies.forEach(enemy => {
            enemy.setTarget(this.#player);
        });
    }

    #spawnEnemies(deltaTime) {
        this.#spawnTimer += deltaTime * 1000;
        
        if (this.#spawnTimer >= this.#spawnInterval) {
            this.#spawnTimer = 0;
            const canvas = this.#game.getCanvas();
            const pos = new Vector2D(
                Math.random() * canvas.width,
                Math.random() * 200
            );
            this.spawnEnemy(pos);
        }
    }

    spawnEnemy(position) {
        const enemy = new Enemy({ position });
        
        enemy.on('destroyed', () => {
            this.#score += 10;
            this.#logEvent('Enemy destroyed +10 points', 'spawn');
        });

        this.#game.getActiveScene().addEntity(enemy);
        this.#logEvent('Enemy spawned', 'spawn');
    }

    reset() {
        this.#game.reset();
        this.#score = 0;
        this.#gameTime = 0;
        this.#spawnTimer = 0;

        this.#player = new Player({
            position: new Vector2D(400, 500)
        });

        this.#player.on('destroyed', () => {
            this.#logEvent('Game Over!', 'collision');
            this.#game.pause();
        });

        this.#game.getActiveScene().addEntity(this.#player);
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;

        this.#logEvent('Game reset', 'system');
    }

    #updateFPS(fps) {
        document.getElementById('fps').textContent = fps;
    }

    #updateStats() {
        const scene = this.#game.getActiveScene();
        const entities = scene ? scene.getActiveEntities() : [];
        
        document.getElementById('entityCount').textContent = entities.length;
        document.getElementById('score').textContent = this.#score;
        document.getElementById('gameTime').textContent = Math.floor(this.#gameTime) + 's';
        document.getElementById('updateRate').textContent = this.#game.getUpdateTime().toFixed(2) + 'ms';
        document.getElementById('renderRate').textContent = this.#game.getRenderTime().toFixed(2) + 'ms';
        document.getElementById('sceneCount').textContent = 1;
        document.getElementById('collisionCount').textContent = this.#game.getCollisionSystem().getCollisionCount();
    }

    #updateEntityList() {
        const scene = this.#game.getActiveScene();
        if (!scene) return;

        const entities = scene.getActiveEntities();
        const listEl = document.getElementById('entityList');

        if (entities.length === 0) {
            listEl.innerHTML = '<p class="empty-message">Aucune entité</p>';
            return;
        }

        listEl.innerHTML = entities.map(entity => `
            <div class="entity-item ${entity.getType()}">
                <div>
                    <span class="entity-name">${entity.getType()} #${entity.getId()}</span>
                </div>
                <span class="entity-health">HP: ${entity.getHealth()}/${entity.getMaxHealth()}</span>
            </div>
        `).join('');
    }

    #logEvent(message, type = 'event') {
        const logEl = document.getElementById('eventLog');
        const entry = document.createElement('p');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;
        logEl.appendChild(entry);
        logEl.scrollTop = logEl.scrollHeight;

        // Limiter à 50 entrées
        while (logEl.children.length > 50) {
            logEl.removeChild(logEl.firstChild);
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const gameController = new GameController();
    
    // Exposer pour le debugging
    window.gameController = gameController;
});