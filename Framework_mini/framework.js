// ========================================
// MINI FRAMEWORK JAVASCRIPT
// Inspiré de React/Vue pour l'apprentissage
// ========================================

(function(global) {
    'use strict';

    // ========================================
    // ÉTAPE 1: SYSTÈME DE RÉACTIVITÉ
    // ========================================
    
    class ReactiveState {
        constructor(initialState) {
            this._state = initialState;
            this._listeners = [];
        }
        
        // Obtenir l'état actuel
        get() {
            return this._state;
        }
        
        // Mettre à jour l'état et notifier les listeners
        set(newState) {
            const oldState = this._state;
            
            // Merger l'ancien et le nouvel état (shallow merge)
            if (typeof newState === 'object' && !Array.isArray(newState)) {
                this._state = { ...this._state, ...newState };
            } else {
                this._state = newState;
            }
            
            // Notifier tous les listeners
            this._listeners.forEach(listener => {
                listener(this._state, oldState);
            });
        }
        
        // S'abonner aux changements d'état
        subscribe(listener) {
            this._listeners.push(listener);
            
            // Retourner une fonction pour se désabonner
            return () => {
                const index = this._listeners.indexOf(listener);
                if (index > -1) {
                    this._listeners.splice(index, 1);
                }
            };
        }
    }
    
    // ========================================
    // ÉTAPE 2: VIRTUAL DOM SIMPLIFIÉ
    // ========================================
    
    class VNode {
        constructor(tag, props = {}, children = []) {
            this.tag = tag;
            this.props = props;
            this.children = children;
        }
    }
    
    // Créer un élément virtuel
    function h(tag, props, ...children) {
        return new VNode(tag, props, children.flat());
    }
    
    // Convertir le Virtual DOM en vrai DOM
    function render(vnode) {
        // Si c'est du texte
        if (typeof vnode === 'string' || typeof vnode === 'number') {
            return document.createTextNode(vnode);
        }
        
        // Créer l'élément
        const el = document.createElement(vnode.tag);
        
        // Ajouter les propriétés
        if (vnode.props) {
            Object.keys(vnode.props).forEach(key => {
                if (key.startsWith('on')) {
                    // Événement
                    const eventName = key.substring(2).toLowerCase();
                    el.addEventListener(eventName, vnode.props[key]);
                } else if (key === 'className') {
                    el.className = vnode.props[key];
                } else if (key === 'style' && typeof vnode.props[key] === 'object') {
                    Object.assign(el.style, vnode.props[key]);
                } else {
                    el.setAttribute(key, vnode.props[key]);
                }
            });
        }
        
        // Ajouter les enfants
        vnode.children.forEach(child => {
            el.appendChild(render(child));
        });
        
        return el;
    }
    
    // Algorithme de diff simplifié (pour comparaison)
    function diff(oldVNode, newVNode) {
        // Implémentation simplifiée - en production, React utilise un algo complexe
        // Pour ce mini framework, on re-render complètement
        return newVNode;
    }
    
    // ========================================
    // ÉTAPE 3: COMPOSANT DE BASE
    // ========================================
    
    class Component {
        constructor(props = {}) {
            this.props = props;
            this.state = new ReactiveState(this.data ? this.data() : {});
            this._element = null;
            this._mounted = false;
            
            // S'abonner aux changements d'état pour re-render
            this.state.subscribe(() => {
                if (this._mounted) {
                    this.update();
                }
            });
        }
        
        // Méthode à surcharger par les composants
        data() {
            return {};
        }
        
        // Méthode à surcharger pour le template
        render() {
            return h('div', {}, 'Component');
        }
        
        // Lifecycle: appelé après le montage
        mounted() {}
        
        // Lifecycle: appelé avant la destruction
        beforeDestroy() {}
        
        // Monter le composant dans le DOM
        mount(container) {
            const vnode = this.render();
            const element = render(vnode);
            
            container.appendChild(element);
            this._element = element;
            this._mounted = true;
            
            this.mounted();
            
            return this;
        }
        
        // Mettre à jour le composant
        update() {
            if (!this._element) return;
            
            const vnode = this.render();
            const newElement = render(vnode);
            
            this._element.parentNode.replaceChild(newElement, this._element);
            this._element = newElement;
        }
        
        // Détruire le composant
        destroy() {
            this.beforeDestroy();
            if (this._element && this._element.parentNode) {
                this._element.parentNode.removeChild(this._element);
            }
            this._mounted = false;
        }
        
        // Mettre à jour l'état
        setState(newState) {
            this.state.set(newState);
        }
        
        // Obtenir l'état
        getState() {
            return this.state.get();
        }
    }
    
    // ========================================
    // ÉTAPE 4: ROUTER SIMPLE
    // ========================================
    
    class Router {
        constructor() {
            this.routes = {};
            this.currentRoute = null;
            this.currentComponent = null;
            this.container = null;
            
            // Écouter les changements d'URL
            window.addEventListener('popstate', () => {
                this.navigate(window.location.pathname, false);
            });
        }
        
        // Définir une route
        route(path, component) {
            this.routes[path] = component;
            return this;
        }
        
        // Définir le container
        setContainer(container) {
            this.container = container;
            return this;
        }
        
        // Naviguer vers une route
        navigate(path, pushState = true) {
            // Détruire le composant actuel
            if (this.currentComponent) {
                this.currentComponent.destroy();
            }
            
            // Vider le container
            if (this.container) {
                this.container.innerHTML = '';
            }
            
            // Trouver la route
            const ComponentClass = this.routes[path];
            
            if (ComponentClass) {
                this.currentRoute = path;
                this.currentComponent = new ComponentClass();
                
                if (this.container) {
                    this.currentComponent.mount(this.container);
                }
                
                // Mettre à jour l'historique
                if (pushState) {
                    window.history.pushState({}, '', path);
                }
                
                // Mettre à jour les liens actifs
                this.updateActiveLinks();
            } else {
                console.error(`Route not found: ${path}`);
            }
        }
        
        // Mettre à jour les liens actifs
        updateActiveLinks() {
            document.querySelectorAll('.nav-link').forEach(link => {
                const href = link.getAttribute('href');
                if (href === this.currentRoute) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
        
        // Démarrer le router
        start(initialRoute = '/') {
            // Intercepter les clics sur les liens
            document.addEventListener('click', (e) => {
                if (e.target.matches('.nav-link')) {
                    e.preventDefault();
                    const path = e.target.getAttribute('href');
                    this.navigate(path);
                }
            });
            
            // Naviguer vers la route initiale
            this.navigate(initialRoute, false);
        }
    }
    
    // ========================================
    // ÉTAPE 5: DATA BINDING HELPERS
    // ========================================
    
    // Créer un input avec data binding bidirectionnel
    function createBoundInput(component, stateKey, type = 'text') {
        return h('input', {
            type: type,
            value: component.getState()[stateKey] || '',
            onInput: (e) => {
                component.setState({ [stateKey]: e.target.value });
            }
        });
    }
    
    // Créer un textarea avec data binding
    function createBoundTextarea(component, stateKey) {
        return h('textarea', {
            value: component.getState()[stateKey] || '',
            onInput: (e) => {
                component.setState({ [stateKey]: e.target.value });
            }
        });
    }
    
    // Créer un select avec data binding
    function createBoundSelect(component, stateKey, options) {
        return h('select', {
            value: component.getState()[stateKey] || '',
            onChange: (e) => {
                component.setState({ [stateKey]: e.target.value });
            }
        }, options.map(opt => 
            h('option', { value: opt.value }, opt.label)
        ));
    }
    
    // ========================================
    // ÉTAPE 6: UTILITAIRES
    // ========================================
    
    // Générer un ID unique
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // ========================================
    // ÉTAPE 7: EXPORTER LE FRAMEWORK
    // ========================================
    
    const MiniJS = {
        // Classes principales
        Component,
        Router,
        ReactiveState,
        
        // Virtual DOM
        h,
        render,
        
        // Data Binding
        createBoundInput,
        createBoundTextarea,
        createBoundSelect,
        
        // Utilitaires
        generateId
    };
    
    // Exposer globalement
    global.MiniJS = MiniJS;
    
    console.log('🚀 MiniJS Framework loaded!');
    console.log('📚 Components:', Object.keys(MiniJS));
    
})(window);