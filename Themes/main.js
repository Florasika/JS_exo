class ThemeManager {
    constructor() {
        this.theme = this.getStoredTheme() || 'light';
        this.colorScheme = this.getStoredColorScheme() || 'blue';
        this.themeToggle = document.getElementById('themeToggle');
        this.currentThemeDisplay = document.getElementById('currentTheme');
        this.colorPickers = document.querySelectorAll('.color-picker');
        
        this.colorSchemes = {
            blue: {
                light: {
                    primary: '#3b82f6',
                    secondary: '#8b5cf6',
                    accent: '#ec4899'
                },
                dark: {
                    primary: '#60a5fa',
                    secondary: '#a78bfa',
                    accent: '#f472b6'
                }
            },
            green: {
                light: {
                    primary: '#10b981',
                    secondary: '#14b8a6',
                    accent: '#f59e0b'
                },
                dark: {
                    primary: '#34d399',
                    secondary: '#2dd4bf',
                    accent: '#fbbf24'
                }
            },
            purple: {
                light: {
                    primary: '#8b5cf6',
                    secondary: '#a855f7',
                    accent: '#ec4899'
                },
                dark: {
                    primary: '#a78bfa',
                    secondary: '#c084fc',
                    accent: '#f472b6'
                }
            },
            orange: {
                light: {
                    primary: '#f97316',
                    secondary: '#fb923c',
                    accent: '#ef4444'
                },
                dark: {
                    primary: '#fb923c',
                    secondary: '#fdba74',
                    accent: '#f87171'
                }
            },
            pink: {
                light: {
                    primary: '#ec4899',
                    secondary: '#f472b6',
                    accent: '#8b5cf6'
                },
                dark: {
                    primary: '#f472b6',
                    secondary: '#f9a8d4',
                    accent: '#a78bfa'
                }
            },
            red: {
                light: {
                    primary: '#ef4444',
                    secondary: '#dc2626',
                    accent: '#f97316'
                },
                dark: {
                    primary: '#f87171',
                    secondary: '#ef4444',
                    accent: '#fb923c'
                }
            }
        };
        
        this.init();
    }

    init() {
        this.applyTheme(this.theme);
        this.applyColorScheme(this.colorScheme);
        this.updateThemeDisplay();
        this.updateActiveColorPicker();
        this.attachEventListeners();
    }

    getStoredTheme() {
        return localStorage.getItem('theme');
    }

    getStoredColorScheme() {
        return localStorage.getItem('colorScheme');
    }

    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    saveColorScheme(colorScheme) {
        localStorage.setItem('colorScheme', colorScheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.theme = theme;
        this.applyColorScheme(this.colorScheme);
    }

    applyColorScheme(scheme) {
        this.colorScheme = scheme;
        const colors = this.colorSchemes[scheme][this.theme];
        
        const root = document.documentElement;
        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-secondary', colors.secondary);
        root.style.setProperty('--color-accent', colors.accent);
    }

    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.saveTheme(newTheme);
        this.updateThemeDisplay();
    }

    changeColorScheme(scheme) {
        this.applyColorScheme(scheme);
        this.saveColorScheme(scheme);
        this.updateActiveColorPicker();
    }

    updateThemeDisplay() {
        const themeName = this.theme.charAt(0).toUpperCase() + this.theme.slice(1);
        this.currentThemeDisplay.textContent = themeName;
    }

    updateActiveColorPicker() {
        this.colorPickers.forEach(picker => {
            if (picker.dataset.color === this.colorScheme) {
                picker.classList.add('active');
            } else {
                picker.classList.remove('active');
            }
        });
    }

    attachEventListeners() {
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        this.colorPickers.forEach(picker => {
            picker.addEventListener('click', () => {
                const colorScheme = picker.dataset.color;
                this.changeColorScheme(colorScheme);
            });
        });

        // Détection du thème système (optionnel)
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getStoredTheme()) {
                const systemTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(systemTheme);
                this.updateThemeDisplay();
            }
        });
    }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});