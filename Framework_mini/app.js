// ========================================
// APPLICATION DE DÉMONSTRATION
// Utilisant le framework MiniJS
// ========================================

const { Component, Router, h, createBoundInput, generateId } = MiniJS;

// ========================================
// COMPOSANT: COUNTER (Compteur)
// ========================================

class CounterPage extends Component {
    data() {
        return {
            count: 0,
            step: 1,
            history: []
        };
    }
    
    increment() {
        const newCount = this.getState().count + this.getState().step;
        this.setState({ 
            count: newCount,
            history: [...this.getState().history, `+${this.getState().step}`]
        });
    }
    
    decrement() {
        const newCount = this.getState().count - this.getState().step;
        this.setState({ 
            count: newCount,
            history: [...this.getState().history, `-${this.getState().step}`]
        });
    }
    
    reset() {
        this.setState({ 
            count: 0,
            history: [...this.getState().history, 'Reset']
        });
    }
    
    double() {
        const newCount = this.getState().count * 2;
        this.setState({ 
            count: newCount,
            history: [...this.getState().history, '×2']
        });
    }
    
    render() {
        const state = this.getState();
        
        return h('div', { className: 'container' }, [
            h('div', { className: 'page' }, [
                h('div', { className: 'counter-container' }, [
                    h('h1', {}, '🔢 Compteur Interactif'),
                    h('p', { style: { textAlign: 'center', color: '#6b7280', marginBottom: '20px' } }, 
                        'Démonstration de la réactivité'
                    ),
                    
                    // Affichage du compteur
                    h('div', { className: 'counter-display' }, state.count),
                    
                    // Contrôles
                    h('div', { className: 'counter-controls' }, [
                        h('button', { 
                            className: 'btn btn-danger',
                            onClick: () => this.decrement()
                        }, '➖ Décrémenter'),
                        
                        h('button', { 
                            className: 'btn btn-secondary',
                            onClick: () => this.reset()
                        }, '🔄 Réinitialiser'),
                        
                        h('button', { 
                            className: 'btn btn-success',
                            onClick: () => this.increment()
                        }, '➕ Incrémenter'),
                        
                        h('button', { 
                            className: 'btn btn-primary',
                            onClick: () => this.double()
                        }, '✖️ Doubler')
                    ]),
                    
                    // Configuration du step
                    h('div', { style: { textAlign: 'center', marginTop: '30px' } }, [
                        h('label', {}, 'Pas: '),
                        createBoundInput(this, 'step', 'number')
                    ]),
                    
                    // Historique
                    h('div', { style: { marginTop: '30px', padding: '20px', background: '#f9fafb', borderRadius: '8px' } }, [
                        h('h3', {}, '📜 Historique'),
                        h('p', { style: { color: '#6b7280', fontSize: '14px' } }, 
                            state.history.slice(-10).join(' → ') || 'Aucune action'
                        )
                    ])
                ])
            ])
        ]);
    }
}

// ========================================
// COMPOSANT: TODO LIST
// ========================================

class TodoPage extends Component {
    data() {
        return {
            todos: [],
            newTodoText: '',
            filter: 'all'
        };
    }
    
    addTodo() {
        const text = this.getState().newTodoText.trim();
        
        if (text) {
            const newTodo = {
                id: generateId(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            this.setState({
                todos: [...this.getState().todos, newTodo],
                newTodoText: ''
            });
        }
    }
    
    toggleTodo(id) {
        const todos = this.getState().todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        
        this.setState({ todos });
    }
    
    deleteTodo(id) {
        const todos = this.getState().todos.filter(todo => todo.id !== id);
        this.setState({ todos });
    }
    
    getFilteredTodos() {
        const { todos, filter } = this.getState();
        
        switch (filter) {
            case 'active':
                return todos.filter(t => !t.completed);
            case 'completed':
                return todos.filter(t => t.completed);
            default:
                return todos;
        }
    }
    
    render() {
        const state = this.getState();
        const filteredTodos = this.getFilteredTodos();
        const totalTodos = state.todos.length;
        const completedTodos = state.todos.filter(t => t.completed).length;
        const activeTodos = totalTodos - completedTodos;
        
        return h('div', { className: 'container' }, [
            h('div', { className: 'page' }, [
                h('div', { className: 'todo-header' }, [
                    h('h1', {}, '✅ Liste de Tâches'),
                    h('p', { style: { color: '#6b7280' } }, 
                        'Gestion complète avec filtres et statistiques'
                    )
                ]),
                
                // Formulaire d'ajout
                h('div', { className: 'todo-form' }, [
                    h('input', {
                        className: 'todo-input',
                        type: 'text',
                        placeholder: 'Ajouter une nouvelle tâche...',
                        value: state.newTodoText,
                        onInput: (e) => this.setState({ newTodoText: e.target.value }),
                        onKeypress: (e) => {
                            if (e.key === 'Enter') this.addTodo();
                        }
                    }),
                    h('button', {
                        className: 'btn btn-primary',
                        onClick: () => this.addTodo()
                    }, '➕ Ajouter')
                ]),
                
                // Filtres
                h('div', { style: { display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' } }, [
                    h('button', {
                        className: `btn btn-secondary ${state.filter === 'all' ? 'btn-primary' : ''}`,
                        onClick: () => this.setState({ filter: 'all' })
                    }, 'Toutes'),
                    h('button', {
                        className: `btn btn-secondary ${state.filter === 'active' ? 'btn-primary' : ''}`,
                        onClick: () => this.setState({ filter: 'active' })
                    }, 'Actives'),
                    h('button', {
                        className: `btn btn-secondary ${state.filter === 'completed' ? 'btn-primary' : ''}`,
                        onClick: () => this.setState({ filter: 'completed' })
                    }, 'Terminées')
                ]),
                
                // Liste des tâches
                h('ul', { className: 'todo-list' }, 
                    filteredTodos.length === 0 
                        ? [h('p', { style: { textAlign: 'center', color: '#6b7280', padding: '40px' } }, 
                            'Aucune tâche à afficher')]
                        : filteredTodos.map(todo => 
                            h('li', { 
                                className: `todo-item ${todo.completed ? 'completed' : ''}`
                            }, [
                                h('input', {
                                    type: 'checkbox',
                                    className: 'todo-checkbox',
                                    checked: todo.completed,
                                    onChange: () => this.toggleTodo(todo.id)
                                }),
                                h('span', { className: 'todo-text' }, todo.text),
                                h('button', {
                                    className: 'todo-delete',
                                    onClick: () => this.deleteTodo(todo.id)
                                }, '🗑️ Supprimer')
                            ])
                        )
                ),
                
                // Statistiques
                h('div', { className: 'todo-stats' }, [
                    h('div', { className: 'stat' }, [
                        h('span', { className: 'stat-value' }, totalTodos),
                        h('span', { className: 'stat-label' }, 'Total')
                    ]),
                    h('div', { className: 'stat' }, [
                        h('span', { className: 'stat-value' }, activeTodos),
                        h('span', { className: 'stat-label' }, 'Actives')
                    ]),
                    h('div', { className: 'stat' }, [
                        h('span', { className: 'stat-value' }, completedTodos),
                        h('span', { className: 'stat-label' }, 'Terminées')
                    ])
                ])
            ])
        ]);
    }
}

// ========================================
// COMPOSANT: FORM BINDING DEMO
// ========================================

class FormPage extends Component {
    data() {
        return {
            name: '',
            email: '',
            message: '',
            country: 'france'
        };
    }
    
    render() {
        const state = this.getState();
        
        return h('div', { className: 'container' }, [
            h('div', { className: 'page' }, [
                h('h1', {}, '📝 Data Binding Bidirectionnel'),
                h('p', { style: { color: '#6b7280', marginBottom: '30px', textAlign: 'center' } }, 
                    'Les données sont synchronisées automatiquement'
                ),
                
                h('div', { className: 'form-demo' }, [
                    // Formulaire
                    h('div', { className: 'form-group' }, [
                        h('label', {}, 'Nom:'),
                        createBoundInput(this, 'name', 'text')
                    ]),
                    
                    h('div', { className: 'form-group' }, [
                        h('label', {}, 'Email:'),
                        createBoundInput(this, 'email', 'email')
                    ]),
                    
                    h('div', { className: 'form-group' }, [
                        h('label', {}, 'Pays:'),
                        h('select', {
                            value: state.country,
                            onChange: (e) => this.setState({ country: e.target.value })
                        }, [
                            h('option', { value: 'france' }, 'France'),
                            h('option', { value: 'belgique' }, 'Belgique'),
                            h('option', { value: 'suisse' }, 'Suisse'),
                            h('option', { value: 'canada' }, 'Canada')
                        ])
                    ]),
                    
                    h('div', { className: 'form-group' }, [
                        h('label', {}, 'Message:'),
                        h('textarea', {
                            value: state.message,
                            onInput: (e) => this.setState({ message: e.target.value }),
                            rows: 5
                        })
                    ]),
                    
                    // Prévisualisation en temps réel
                    h('div', { className: 'preview-box' }, [
                        h('h3', {}, '👁️ Prévisualisation en temps réel'),
                        h('div', { className: 'preview-item' }, [
                            h('strong', {}, 'Nom: '),
                            state.name || '(vide)'
                        ]),
                        h('div', { className: 'preview-item' }, [
                            h('strong', {}, 'Email: '),
                            state.email || '(vide)'
                        ]),
                        h('div', { className: 'preview-item' }, [
                            h('strong', {}, 'Pays: '),
                            state.country
                        ]),
                        h('div', { className: 'preview-item' }, [
                            h('strong', {}, 'Message: '),
                            state.message || '(vide)'
                        ])
                    ])
                ])
            ])
        ]);
    }
}

// ========================================
// COMPOSANT: HOME PAGE
// ========================================

class HomePage extends Component {
    render() {
        return h('div', { className: 'container' }, [
            h('div', { className: 'header' }, [
                h('h1', {}, '🚀 MiniJS Framework'),
                h('p', {}, 'Un mini-framework JavaScript pour comprendre React/Vue')
            ]),
            
            h('div', { className: 'page' }, [
                h('h2', { style: { marginBottom: '20px' } }, '📚 Concepts implémentés'),
                
                h('div', { style: { display: 'grid', gap: '20px' } }, [
                    h('div', { style: { padding: '20px', background: '#f9fafb', borderRadius: '8px' } }, [
                        h('h3', {}, '⚛️ Système de Réactivité'),
                        h('p', { style: { color: '#6b7280' } }, 
                            'État réactif avec pattern Observer - les composants se mettent à jour automatiquement'
                        )
                    ]),
                    
                    h('div', { style: { padding: '20px', background: '#f9fafb', borderRadius: '8px' } }, [
                        h('h3', {}, '🎨 Virtual DOM'),
                        h('p', { style: { color: '#6b7280' } }, 
                            'Représentation virtuelle du DOM pour optimiser les rendus'
                        )
                    ]),
                    
                    h('div', { style: { padding: '20px', background: '#f9fafb', borderRadius: '8px' } }, [
                        h('h3', {}, '🧩 Composants'),
                        h('p', { style: { color: '#6b7280' } }, 
                            'Architecture basée sur les composants avec lifecycle hooks'
                        )
                    ]),
                    
                    h('div', { style: { padding: '20px', background: '#f9fafb', borderRadius: '8px' } }, [
                        h('h3', {}, '🔄 Data Binding'),
                        h('p', { style: { color: '#6b7280' } }, 
                            'Liaison bidirectionnelle des données entre état et interface'
                        )
                    ]),
                    
                    h('div', { style: { padding: '20px', background: '#f9fafb', borderRadius: '8px' } }, [
                        h('h3', {}, '🛣️ Router'),
                        h('p', { style: { color: '#6b7280' } }, 
                            'Navigation entre pages sans rechargement (SPA)'
                        )
                    ])
                ]),
                
                h('div', { style: { marginTop: '40px', textAlign: 'center' } }, [
                    h('p', { style: { color: '#6b7280', marginBottom: '20px' } }, 
                        'Explorez les exemples pour voir le framework en action !'
                    )
                ])
            ])
        ]);
    }
}

// ========================================
// INITIALISATION DE L'APPLICATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Créer le container principal
    const app = document.getElementById('app');
    
    // Créer la navigation
    const nav = document.createElement('nav');
    nav.className = 'nav';
    nav.innerHTML = `
        <a href="/" class="nav-link">🏠 Accueil</a>
        <a href="/counter" class="nav-link">🔢 Compteur</a>
        <a href="/todo" class="nav-link">✅ Todo List</a>
        <a href="/form" class="nav-link">📝 Data Binding</a>
    `;
    app.appendChild(nav);
    
    // Créer le container pour les pages
    const pageContainer = document.createElement('div');
    pageContainer.id = 'page-container';
    app.appendChild(pageContainer);
    
    // Initialiser le router
    const router = new Router();
    
    router
        .route('/', HomePage)
        .route('/counter', CounterPage)
        .route('/todo', TodoPage)
        .route('/form', FormPage)
        .setContainer(pageContainer)
        .start('/');
    
    console.log('✅ Application démarrée !');
});
/*

## 🎯 Fonctionnalités du framework :

✅ **Système de réactivité** : Pattern Observer avec ReactiveState  
✅ **Virtual DOM** : Représentation virtuelle pour optimisation  
✅ **Composants** : Architecture basée composants avec lifecycle  
✅ **Data Binding bidirectionnel** : Synchronisation automatique  
✅ **Router SPA** : Navigation sans rechargement  
✅ **Lifecycle hooks** : mounted(), beforeDestroy()  
✅ **Event handling** : Gestion des événements  
✅ **State management** : setState() / getState()  

## 📚 Concepts avancés maîtrisés :

1. **Classes ES6** : Utilisation avancée des classes
2. **Design Patterns** :
   - Observer (réactivité)
   - Component Pattern
   - Virtual DOM Pattern
   - Router Pattern
3. **Architecture MVC** : Séparation Model-View-Controller
4. **Réactivité manuelle** : Système d'abonnement/notification
5. **Virtual DOM** : Création et rendu d'éléments virtuels
6. **Closures** : Capture de contexte dans callbacks
7. **Higher-Order Functions** : createBoundInput, etc.
8. **Lifecycle Management** : Montage/démontage composants
9. **Event Delegation** : Gestion optimisée des événements
10. **Immutabilité** : Spread operator pour état

## 🔍 Comment ça fonctionne (comme React/Vue) :

1. État initial
   ↓
2. render() génère Virtual DOM
   ↓
3. Virtual DOM → Real DOM
   ↓
4. Utilisateur interagit
   ↓
5. setState() modifie l'état
   ↓
6. Notify listeners (réactivité)
   ↓
7. Composant se re-render automatiquement
   ↓
8. Retour à l'étape 2*/