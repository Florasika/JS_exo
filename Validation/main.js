// ========================================
// ÉTAPE 1: RÈGLES DE VALIDATION
// ========================================

const ValidationRules = {
    // Champ requis
    required: {
        validate: (value) => value.trim() !== '',
        message: 'Ce champ est obligatoire'
    },
    
    // Longueur minimale
    minLength: {
        validate: (value, min) => value.length >= parseInt(min),
        message: (min) => `Minimum ${min} caractères requis`
    },
    
    // Longueur maximale
    maxLength: {
        validate: (value, max) => value.length <= parseInt(max),
        message: (max) => `Maximum ${max} caractères autorisés`
    },
    
    // Email
    email: {
        validate: (value) => {
            const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return regex.test(value);
        },
        message: 'Email invalide (ex: nom@exemple.fr)'
    },
    
    // Téléphone français
    phone: {
        validate: (value) => {
            const regex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
            return regex.test(value.replace(/\s/g, ''));
        },
        message: 'Numéro de téléphone invalide (ex: 06 12 34 56 78)'
    },
    
    // Code postal français
    zipcode: {
        validate: (value) => {
            const regex = /^[0-9]{5}$/;
            return regex.test(value);
        },
        message: 'Code postal invalide (ex: 75001)'
    },
    
    // URL
    url: {
        validate: (value) => {
            if (!value) return true; // Optionnel
            const regex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
            return regex.test(value);
        },
        message: 'URL invalide (ex: https://www.exemple.fr)'
    },
    
    // Alphabétique (avec accents, espaces, tirets)
    alpha: {
        validate: (value) => {
            const regex = /^[a-zA-ZÀ-ÿ\s-]+$/;
            return regex.test(value);
        },
        message: 'Seules les lettres sont autorisées'
    },
    
    // Mot de passe fort
    password: {
        validate: (value) => {
            const hasMinLength = value.length >= 8;
            const hasUpperCase = /[A-Z]/.test(value);
            const hasLowerCase = /[a-z]/.test(value);
            const hasNumber = /[0-9]/.test(value);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
            
            return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
        },
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
    },
    
    // Correspondance avec un autre champ
    match: {
        validate: (value, fieldId) => {
            const matchField = document.getElementById(fieldId);
            return matchField && value === matchField.value;
        },
        message: (fieldId) => {
            const matchField = document.getElementById(fieldId);
            const label = matchField ? document.querySelector(`label[for="${fieldId}"]`)?.textContent : '';
            return `Ne correspond pas au champ ${label || fieldId}`;
        }
    },
    
    // Âge minimum
    age: {
        validate: (value, minAge) => {
            if (!value) return false;
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                return age - 1 >= parseInt(minAge);
            }
            return age >= parseInt(minAge);
        },
        message: (minAge) => `Vous devez avoir au moins ${minAge} ans`
    }
};

// ========================================
// ÉTAPE 2: CLASSE VALIDATOR
// ========================================

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.fields = [];
        this.validFields = new Set();
        
        this.init();
    }
    
    init() {
        if (!this.form) {
            console.error('Formulaire non trouvé');
            return;
        }
        
        // Récupérer tous les champs avec validation
        this.fields = Array.from(this.form.querySelectorAll('[data-validate]'));
        
        console.log('🔍 Initialisation du validateur...');
        console.log(`📋 ${this.fields.length} champs à valider`);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialiser la progression
        this.updateProgress();
    }
    
    setupEventListeners() {
        // Validation en temps réel sur chaque champ
        this.fields.forEach(field => {
            // Validation sur blur (perte de focus)
            field.addEventListener('blur', () => {
                if (field.value || field.hasAttribute('data-touched')) {
                    this.validateField(field);
                    field.setAttribute('data-touched', 'true');
                }
            });
            
            // Validation sur input (saisie)
            field.addEventListener('input', () => {
                if (field.hasAttribute('data-touched')) {
                    this.validateField(field);
                }
                
                // Compteur de caractères pour textarea
                if (field.tagName === 'TEXTAREA') {
                    this.updateCharCount(field);
                }
                
                // Force du mot de passe
                if (field.id === 'password') {
                    this.checkPasswordStrength(field.value);
                }
            });
        });
        
        // Soumission du formulaire
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Reset du formulaire
        this.form.addEventListener('reset', () => {
            setTimeout(() => this.resetValidation(), 0);
        });
        
        // Toggle password visibility
        const toggleButtons = this.form.querySelectorAll('.toggle-password');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.previousElementSibling;
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.textContent = '🙈';
                } else {
                    input.type = 'password';
                    btn.textContent = '👁️';
                }
            });
        });
    }
    
    // ========================================
    // ÉTAPE 3: VALIDATION DE CHAMP
    // ========================================
    
    validateField(field) {
        const rules = field.getAttribute('data-validate').split(',');
        const value = field.value;
        let isValid = true;
        let errorMessage = '';
        
        // Parcourir toutes les règles
        for (const rule of rules) {
            const [ruleName, ruleParam] = rule.trim().split(':');
            
            if (ValidationRules[ruleName]) {
                const ruleObj = ValidationRules[ruleName];
                
                // Valider
                const valid = ruleObj.validate(value, ruleParam);
                
                if (!valid) {
                    isValid = false;
                    // Message d'erreur
                    errorMessage = typeof ruleObj.message === 'function' 
                        ? ruleObj.message(ruleParam)
                        : ruleObj.message;
                    break; // Arrêter à la première erreur
                }
            }
        }
        
        // Mettre à jour l'UI
        this.updateFieldUI(field, isValid, errorMessage);
        
        // Mettre à jour la liste des champs valides
        if (isValid && value) {
            this.validFields.add(field.id);
        } else {
            this.validFields.delete(field.id);
        }
        
        // Mettre à jour la progression
        this.updateProgress();
        
        return isValid;
    }
    
    updateFieldUI(field, isValid, errorMessage) {
        const errorEl = document.getElementById(`${field.id}-error`);
        const successEl = field.parentElement.nextElementSibling?.nextElementSibling;
        
        // Reset classes
        field.classList.remove('valid', 'invalid');
        
        if (!field.value) {
            // Champ vide - pas de style
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.remove('show');
            }
            if (successEl) {
                successEl.classList.remove('show');
            }
            return;
        }
        
        if (isValid) {
            // Valide
            field.classList.add('valid');
            field.setAttribute('aria-invalid', 'false');
            
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.remove('show');
            }
            
            if (successEl && successEl.classList.contains('success-message')) {
                successEl.classList.add('show');
            }
        } else {
            // Invalide
            field.classList.add('invalid');
            field.setAttribute('aria-invalid', 'true');
            
            if (errorEl) {
                errorEl.textContent = errorMessage;
                errorEl.classList.add('show');
            }
            
            if (successEl) {
                successEl.classList.remove('show');
            }
        }
    }
    
    // ========================================
    // ÉTAPE 4: FORCE DU MOT DE PASSE
    // ========================================
    
    checkPasswordStrength(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        // Mettre à jour les indicateurs visuels
        Object.keys(requirements).forEach(req => {
            const reqEl = document.querySelector(`.requirement[data-requirement="${req}"]`);
            if (reqEl) {
                if (requirements[req]) {
                    reqEl.classList.add('met');
                } else {
                    reqEl.classList.remove('met');
                }
            }
        });
        
        // Calculer le score
        const metCount = Object.values(requirements).filter(Boolean).length;
        
        // Mettre à jour la barre de force
        const strengthFill = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');
        
        if (!strengthFill || !strengthText) return;
        
        strengthFill.className = 'strength-fill';
        strengthText.className = 'strength-text';
        
        if (password.length === 0) {
            strengthFill.style.width = '0%';
            strengthText.textContent = '-';
        } else if (metCount <= 2) {
            strengthFill.classList.add('weak');
            strengthText.classList.add('weak');
            strengthText.textContent = 'Faible';
        } else if (metCount === 3) {
            strengthFill.classList.add('medium');
            strengthText.classList.add('medium');
            strengthText.textContent = 'Moyen';
        } else if (metCount === 4) {
            strengthFill.classList.add('good');
            strengthText.classList.add('good');
            strengthText.textContent = 'Bon';
        } else {
            strengthFill.classList.add('strong');
            strengthText.classList.add('strong');
            strengthText.textContent = 'Fort';
        }
    }
    
    // ========================================
    // ÉTAPE 5: COMPTEUR DE CARACTÈRES
    // ========================================
    
    updateCharCount(field) {
        const countEl = document.getElementById(`${field.id}-count`);
        if (countEl) {
            countEl.textContent = field.value.length;
        }
    }
    
    // ========================================
    // ÉTAPE 6: PROGRESSION DU FORMULAIRE
    // ========================================
    
    updateProgress() {
        const requiredFields = this.fields.filter(f => 
            f.getAttribute('data-validate')?.includes('required')
        );
        
        const totalFields = requiredFields.length;
        const validCount = requiredFields.filter(f => this.validFields.has(f.id)).length;
        
        const percentage = totalFields > 0 ? (validCount / totalFields) * 100 : 0;
        
        // Mettre à jour la barre
        const progressFill = document.getElementById('form-progress');
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        // Mettre à jour le texte
        const validFieldsEl = document.getElementById('valid-fields');
        const totalFieldsEl = document.getElementById('total-fields');
        
        if (validFieldsEl) validFieldsEl.textContent = validCount;
        if (totalFieldsEl) totalFieldsEl.textContent = totalFields;
        
        console.log(`📊 Progression: ${validCount}/${totalFields} (${percentage.toFixed(0)}%)`);
    }
    
    // ========================================
    // ÉTAPE 7: SOUMISSION DU FORMULAIRE
    // ========================================
    
    handleSubmit() {
        console.log('📤 Tentative de soumission...');
        
        // Valider tous les champs
        let allValid = true;
        
        this.fields.forEach(field => {
            const isValid = this.validateField(field);
            field.setAttribute('data-touched', 'true');
            if (!isValid && field.getAttribute('data-validate')?.includes('required')) {
                allValid = false;
            }
        });
        
        if (allValid) {
            console.log('✅ Formulaire valide !');
            this.submitForm();
        } else {
            console.log('❌ Formulaire invalide');
            
            // Scroller vers la première erreur
            const firstError = this.form.querySelector('.invalid');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            
            // Notification
            this.showNotification('Veuillez corriger les erreurs avant de continuer', 'error');
        }
    }
    
    submitForm() {
        // Récupérer les données
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        console.log('📋 Données du formulaire:', data);
        
        // Simuler un envoi
        this.showLoading();
        
        setTimeout(() => {
            this.hideLoading();
            this.showSuccessModal();
            
            // Logger les données (en production, envoyer au serveur)
            console.log('✅ Inscription réussie:', {
                prenom: data.firstname,
                nom: data.lastname,
                email: data.email,
                telephone: data.phone,
                ville: data.city,
                newsletter: data.newsletter === 'on'
            });
        }, 1500);
    }
    
    // ========================================
    // ÉTAPE 8: NOTIFICATIONS & MODALES
    // ========================================
    
    showNotification(message, type = 'info') {
        // Créer une notification toast (simple)
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    showSuccessModal() {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
    
    showLoading() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Envoi en cours...';
        }
    }
    
    hideLoading() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'S\'inscrire';
        }
    }
    
    // ========================================
    // ÉTAPE 9: RESET
    // ========================================
    
    resetValidation() {
        console.log('🔄 Reset du formulaire');
        
        this.validFields.clear();
        
        this.fields.forEach(field => {
            field.classList.remove('valid', 'invalid');
            field.removeAttribute('data-touched');
            field.removeAttribute('aria-invalid');
            
            const errorEl = document.getElementById(`${field.id}-error`);
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.remove('show');
            }
            
            const successEl = field.parentElement.nextElementSibling?.nextElementSibling;
            if (successEl) {
                successEl.classList.remove('show');
            }
        });
        
        // Reset force du mot de passe
        const strengthFill = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');
        
        if (strengthFill) {
            strengthFill.className = 'strength-fill';
            strengthFill.style.width = '0%';
        }
        
        if (strengthText) {
            strengthText.className = 'strength-text';
            strengthText.textContent = '-';
        }
        
        // Reset requirements
        document.querySelectorAll('.requirement').forEach(req => {
            req.classList.remove('met');
        });
        
        // Reset compteur
        const bioCount = document.getElementById('bio-count');
        if (bioCount) bioCount.textContent = '0';
        
        this.updateProgress();
    }
}

// ========================================
// ÉTAPE 10: FONCTION GLOBALE MODAL
// ========================================

function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    // Reset le formulaire
    const form = document.getElementById('registration-form');
    if (form) {
        form.reset();
        if (window.validator) {
            window.validator.resetValidation();
        }
    }
}

// ========================================
// ÉTAPE 11: ANIMATIONS CSS DYNAMIQUES
// ========================================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================================
// ÉTAPE 12: INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation du validateur de formulaires...');
    
    window.validator = new FormValidator('registration-form');
    
    console.log('✅ Validateur prêt !');
});