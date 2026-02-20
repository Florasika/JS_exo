// app.js - Mini UI Framework (Version corrigée)

// ============= VIRTUAL DOM =============

/**
 * Classe VNode - Nœud Virtual DOM
 */
class VNode {
    constructor(tag, props = {}, children = []) {
        this.tag = tag;
        this.props = props;
        this.children = Array.isArray(children) ? children : [children];
        this.key = props.key || null;
        this.ref = null;
    }

    isTextNode() {
        return this.tag === 'text';
    }
}

/**
 * Fonction h - Créer un VNode (JSX-like)
 */
function h(tag, props = {}, ...children) {
    const flatChildren = children
        .flat()
        .map(child => 
            typeof child === 'string' || typeof child === 'number'
                ? new VNode('text', {}, String(child))
                : child
        )
        .filter(child => child !== null && child !== undefined && child !== false);

    return new VNode(tag, props, flatChildren);
}

// ============= STATE MANAGEMENT =============

/**
 * Classe State - Gestion d'état réactive
 */
class State {
    #data;
    #listeners;
    #component;

    constructor(initialData = {}) {
        this.#data = { ...initialData };
        this.#listeners = [];
        this.#component = null;
    }

    setComponent(component) {
        this.#component = component;
    }

    get(key) {
        return this.#data[key];
    }

    getAll() {
        return { ...this.#data };
    }

    setState(updates) {
        if (!updates || typeof updates !== 'object') return;
        
        const oldState = { ...this.#data };
        this.#data = { ...this.#data, ...updates };
        
        this.#notifyListeners(oldState, this.#data);
        
        if (this.#component) {
            this.#component._scheduleUpdate();
            Framework.logStateUpdate();
        }
    }

    subscribe(callback) {
        if (typeof callback === 'function') {
            this.#listeners.push(callback);
        }
    }

    #notifyListeners(oldState, newState) {
        this.#listeners.forEach(callback => {
            try {
                callback(oldState, newState);
            } catch (error) {
                console.error('State listener error:', error);
            }
        });
    }
}

// ============= RENDERER =============

/**
 * Classe Renderer - Moteur de rendu
 */
class Renderer {
    static renderCount = 0;

    static createElement(vnode) {
        if (!vnode) return null;
        
        if (vnode.isTextNode()) {
            return document.createTextNode(vnode.children[0] || '');
        }

        const element = document.createElement(vnode.tag);

        // Set props
        this.#setProps(element, vnode.props);

        // Render children
        vnode.children.forEach(child => {
            const childElement = this.createElement(child);
            if (childElement) {
                element.appendChild(childElement);
            }
        });

        vnode.ref = element;
        return element;
    }

    static #setProps(element, props) {
        Object.entries(props).forEach(([key, value]) => {
            this.#setProp(element, key, value);
        });
    }

    static #setProp(element, key, value) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.substring(2).toLowerCase();
            element.addEventListener(eventName, value);
        } else if (key === 'key' || key === 'ref') {
            // Skip special props
        } else if (key === 'value' || key === 'checked') {
            element[key] = value;
        } else if (typeof value === 'boolean') {
            if (value) {
                element.setAttribute(key, '');
            }
        } else if (value !== null && value !== undefined) {
            element.setAttribute(key, value);
        }
    }

    static patch(oldVNode, newVNode, container) {
        this.renderCount++;

        // Create
        if (!oldVNode) {
            const element = this.createElement(newVNode);
            if (element && container) {
                container.appendChild(element);
            }
            return newVNode;
        }

        // Remove
        if (!newVNode) {
            if (oldVNode.ref && container) {
                container.removeChild(oldVNode.ref);
            }
            return null;
        }

        // Replace
        if (this.#hasChanged(oldVNode, newVNode)) {
            const element = this.createElement(newVNode);
            if (element && oldVNode.ref && container) {
                container.replaceChild(element, oldVNode.ref);
            }
            return newVNode;
        }

        // Update
        if (newVNode.tag !== 'text') {
            this.#updateProps(oldVNode.ref, oldVNode.props, newVNode.props);

            // Update children
            const oldChildren = oldVNode.children;
            const newChildren = newVNode.children;
            const maxLength = Math.max(oldChildren.length, newChildren.length);

            for (let i = 0; i < maxLength; i++) {
                this.patch(
                    oldChildren[i],
                    newChildren[i],
                    oldVNode.ref
                );
            }
        } else if (oldVNode.children[0] !== newVNode.children[0]) {
            if (oldVNode.ref) {
                oldVNode.ref.textContent = newVNode.children[0];
            }
        }

        newVNode.ref = oldVNode.ref;
        return newVNode;
    }

    static #hasChanged(vnode1, vnode2) {
        return typeof vnode1.tag !== typeof vnode2.tag ||
               vnode1.tag !== vnode2.tag ||
               vnode1.key !== vnode2.key;
    }

    static #updateProps(element, oldProps, newProps) {
        if (!element) return;

        // Remove old props
        Object.keys(oldProps).forEach(key => {
            if (!(key in newProps)) {
                if (key.startsWith('on')) {
                    const eventName = key.substring(2).toLowerCase();
                    element.removeEventListener(eventName, oldProps[key]);
                } else if (key !== 'key' && key !== 'ref') {
                    element.removeAttribute(key);
                }
            }
        });

        // Set new props
        Object.entries(newProps).forEach(([key, value]) => {
            if (oldProps[key] !== value) {
                this.#setProp(element, key, value);
            }
        });
    }

    static getRenderCount() {
        return this.renderCount;
    }
}

// ============= COMPONENT SYSTEM =============

/**
 * Classe Component - Composant de base
 */
class Component {
    #container;
    #vnode;
    #isMounted;
    #updateScheduled;

    constructor() {
        this.state = new State();
        this.state.setComponent(this);
        this.#container = null;
        this.#vnode = null;
        this.#isMounted = false;
        this.#updateScheduled = false;

        Framework.registerComponent(this);
    }

    // Lifecycle methods
    componentWillMount() {}
    componentDidMount() {}
    componentWillUpdate(prevState) {}
    componentDidUpdate(prevState) {}
    componentWillUnmount() {}

    // Render method (to be overridden)
    render() {
        return h('div', {}, 'Component');
    }

    // Mount component
    mount(selector) {
        try {
            const container = typeof selector === 'string'
                ? document.querySelector(selector)
                : selector;

            if (!container) {
                console.error(`Container ${selector} not found`);
                return;
            }

            this.#container = container;
            this.#container.innerHTML = '';

            this.componentWillMount();
            Framework.logLifecycle(this.constructor.name, 'componentWillMount');

            this._render();
            this.#isMounted = true;

            this.componentDidMount();
            Framework.logLifecycle(this.constructor.name, 'componentDidMount');
        } catch (error) {
            console.error('Mount error:', error);
        }
    }

    // Unmount component
    unmount() {
        if (!this.#isMounted) return;

        try {
            this.componentWillUnmount();
            Framework.logLifecycle(this.constructor.name, 'componentWillUnmount');

            if (this.#container) {
                this.#container.innerHTML = '';
            }

            this.#isMounted = false;
            Framework.unregisterComponent(this);
        } catch (error) {
            console.error('Unmount error:', error);
        }
    }

    // Internal render
    _render() {
        try {
            const newVNode = this.render();
            this.#vnode = Renderer.patch(this.#vnode, newVNode, this.#container);
            Framework.updateVDOMTree();
        } catch (error) {
            console.error('Render error:', error);
        }
    }

    // Schedule update
    _scheduleUpdate() {
        if (this.#updateScheduled || !this.#isMounted) return;
        
        this.#updateScheduled = true;
        
        requestAnimationFrame(() => {
            try {
                const prevState = this.state.getAll();
                
                this.componentWillUpdate(prevState);
                Framework.logLifecycle(this.constructor.name, 'componentWillUpdate');
                
                this._render();
                
                this.componentDidUpdate(prevState);
                Framework.logLifecycle(this.constructor.name, 'componentDidUpdate');
            } catch (error) {
                console.error('Update error:', error);
            } finally {
                this.#updateScheduled = false;
            }
        });
    }

    isMounted() {
        return this.#isMounted;
    }
}

// ============= FRAMEWORK MANAGER =============

/**
 * Classe Framework - Gestionnaire global
 */
class Framework {
    static components = new Set();
    static stateUpdateCount = 0;

    static registerComponent(component) {
        this.components.add(component);
        this.updateStats();
    }

    static unregisterComponent(component) {
        this.components.delete(component);
        this.updateStats();
    }

    static logStateUpdate() {
        this.stateUpdateCount++;
        this.updateStats();
    }

    static updateStats() {
        const componentCountEl = document.getElementById('componentCount');
        const renderCountEl = document.getElementById('renderCount');
        const stateUpdateCountEl = document.getElementById('stateUpdateCount');

        if (componentCountEl) componentCountEl.textContent = this.components.size;
        if (renderCountEl) renderCountEl.textContent = Renderer.getRenderCount();
        if (stateUpdateCountEl) stateUpdateCountEl.textContent = this.stateUpdateCount;
    }

    static logLifecycle(componentName, phase) {
        const log = document.getElementById('lifecycleLog');
        if (!log) return;

        const entry = document.createElement('p');
        
        let className = 'log-entry ';
        if (phase.includes('Mount')) className += 'mount';
        else if (phase.includes('Update')) className += 'update';
        else if (phase.includes('Unmount')) className += 'unmount';
        
        entry.className = className;
        entry.textContent = `${componentName}: ${phase}`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;

        // Limiter à 50 entrées
        while (log.children.length > 50) {
            log.removeChild(log.firstChild);
        }
    }

    static updateVDOMTree() {
        const tree = document.getElementById('vdomTree');
        if (!tree) return;

        const components = Array.from(this.components).filter(c => c.isMounted());
        
        if (components.length === 0) {
            tree.innerHTML = '<p class="empty-message">Aucun composant monté</p>';
            return;
        }

        tree.innerHTML = components.map(component => 
            `<div class="vdom-node">
                <span class="tag">&lt;${component.constructor.name}&gt;</span>
            </div>`
        ).join('');
    }
}

// ============= DEMO COMPONENTS =============

/**
 * Counter Component
 */
class CounterComponent extends Component {
    constructor() {
        super();
        this.state = new State({ count: 0 });
    }

    increment() {
        this.state.setState({ count: this.state.get('count') + 1 });
    }

    decrement() {
        this.state.setState({ count: this.state.get('count') - 1 });
    }

    reset() {
        this.state.setState({ count: 0 });
    }

    render() {
        return h('div', { className: 'miniui-counter' },
            h('h3', {}, `Count: ${this.state.get('count')}`),
            h('div', { className: 'button-group' },
                h('button', { className: 'miniui-button', onClick: () => this.decrement() }, '➖ Decrement'),
                h('button', { className: 'miniui-button secondary', onClick: () => this.reset() }, '🔄 Reset'),
                h('button', { className: 'miniui-button', onClick: () => this.increment() }, '➕ Increment')
            )
        );
    }
}

/**
 * Todo List Component
 */
class TodoComponent extends Component {
    constructor() {
        super();
        this.state = new State({
            todos: [],
            inputValue: '',
            nextId: 1
        });
    }

    handleInput(e) {
        this.state.setState({ inputValue: e.target.value });
    }

    addTodo() {
        const value = this.state.get('inputValue').trim();
        if (!value) return;

        const todos = this.state.get('todos');
        this.state.setState({
            todos: [...todos, { id: this.state.get('nextId'), text: value, completed: false }],
            inputValue: '',
            nextId: this.state.get('nextId') + 1
        });
    }

    toggleTodo(id) {
        const todos = this.state.get('todos').map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        this.state.setState({ todos });
    }

    deleteTodo(id) {
        const todos = this.state.get('todos').filter(todo => todo.id !== id);
        this.state.setState({ todos });
    }

    render() {
        const todos = this.state.get('todos');

        return h('div', { className: 'miniui-todo' },
            h('div', { className: 'miniui-todo-input' },
                h('input', {
                    type: 'text',
                    value: this.state.get('inputValue'),
                    placeholder: 'Add a new todo...',
                    onInput: (e) => this.handleInput(e),
                    onKeyPress: (e) => e.key === 'Enter' && this.addTodo()
                }),
                h('button', { className: 'miniui-button', onClick: () => this.addTodo() }, '➕ Add')
            ),
            h('ul', { className: 'miniui-todo-list' },
                ...todos.map(todo =>
                    h('li', {
                        key: todo.id,
                        className: `miniui-todo-item${todo.completed ? ' completed' : ''}`
                    },
                        h('input', { type: 'checkbox', checked: todo.completed, onChange: () => this.toggleTodo(todo.id) }),
                        h('span', { className: 'todo-text' }, todo.text),
                        h('button', { className: 'delete-btn', onClick: () => this.deleteTodo(todo.id) }, '🗑️')
                    )
                )
            )
        );
    }
}

/**
 * Form Component
 */
class FormComponent extends Component {
    constructor() {
        super();
        this.state = new State({
            name: '',
            email: '',
            country: 'fr',
            submitted: false
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        this.state.setState({ submitted: true });
    }

    handleChange(field, value) {
        this.state.setState({ [field]: value, submitted: false });
    }

    render() {
        const { name, email, country, submitted } = this.state.getAll();

        return h('div', { className: 'miniui-form' },
            h('form', { onSubmit: (e) => this.handleSubmit(e) },
                h('div', { className: 'miniui-form-group' },
                    h('label', {}, 'Name:'),
                    h('input', { type: 'text', value: name, onInput: (e) => this.handleChange('name', e.target.value) })
                ),
                h('div', { className: 'miniui-form-group' },
                    h('label', {}, 'Email:'),
                    h('input', { type: 'email', value: email, onInput: (e) => this.handleChange('email', e.target.value) })
                ),
                h('div', { className: 'miniui-form-group' },
                    h('label', {}, 'Country:'),
                    h('select', { value: country, onChange: (e) => this.handleChange('country', e.target.value) },
                        h('option', { value: 'fr' }, 'France'),
                        h('option', { value: 'us' }, 'USA'),
                        h('option', { value: 'uk' }, 'UK'),
                        h('option', { value: 'de' }, 'Germany')
                    )
                ),
                h('button', { type: 'submit', className: 'miniui-button' }, 'Submit')
            ),
            submitted && h('div', { className: 'form-result' },
                `Form submitted! Name: ${name}, Email: ${email}, Country: ${country}`
            )
        );
    }
}

/**
 * Timer Component
 */
class TimerComponent extends Component {
    constructor() {
        super();
        this.state = new State({ seconds: 0, isRunning: false });
        this.interval = null;
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    start() {
        if (this.state.get('isRunning')) return;
        this.state.setState({ isRunning: true });
        this.interval = setInterval(() => {
            this.state.setState({ seconds: this.state.get('seconds') + 1 });
        }, 1000);
    }

    pause() {
        this.state.setState({ isRunning: false });
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    reset() {
        this.pause();
        this.state.setState({ seconds: 0 });
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    render() {
        const { seconds, isRunning } = this.state.getAll();

        return h('div', { className: 'miniui-timer' },
            h('div', { className: 'timer-display' }, this.formatTime(seconds)),
            h('div', { className: 'timer-controls' },
                !isRunning
                    ? h('button', { className: 'miniui-button', onClick: () => this.start() }, '▶️ Start')
                    : h('button', { className: 'miniui-button secondary', onClick: () => this.pause() }, '⏸️ Pause'),
                h('button', { className: 'miniui-button danger', onClick: () => this.reset() }, '🔄 Reset')
            )
        );
    }
}

// ============= INITIALIZATION =============

document.addEventListener('DOMContentLoaded', () => {
    try {
        new CounterComponent().mount('#counterApp');
        new TodoComponent().mount('#todoApp');
        new FormComponent().mount('#formApp');
        new TimerComponent().mount('#timerApp');

        // Exposer pour le debugging
        window.MiniUI = { h, Component, State, Renderer, Framework };
    } catch (error) {
        console.error('Initialization error:', error);
    }
});