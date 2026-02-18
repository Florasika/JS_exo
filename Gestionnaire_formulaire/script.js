// app.js - Form Manager with OOP Architecture

// ============= VALIDATEURS (Strategy Pattern) =============

/**
 * Classe de base Validator
 */
class Validator {
    #errorMessage;

    constructor(errorMessage) {
        this.#errorMessage = errorMessage;
    }

    validate(value, field) {
        throw new Error('validate() must be implemented');
    }

    getErrorMessage() {
        return this.#errorMessage;
    }

    setErrorMessage(message) {
        this.#errorMessage = message;
    }
}

/**
 * RequiredValidator - Champ obligatoire
 */
class RequiredValidator extends Validator {
    constructor(errorMessage = 'Ce champ est obligatoire') {
        super(errorMessage);
    }

    validate(value) {
        if (typeof value === 'boolean') {
            return value === true;
        }
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }
}

/**
 * EmailValidator - Validation d'email
 */
class EmailValidator extends Validator {
    constructor(errorMessage = 'Email invalide') {
        super(errorMessage);
    }

    validate(value) {
        if (!value) return true; // Skip if empty (use required for mandatory)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }
}

/**
 * MinLengthValidator - Longueur minimale
 */
class MinLengthValidator extends Validator {
    #minLength;

    constructor(minLength, errorMessage) {
        super(errorMessage || `Minimum ${minLength} caractères requis`);
        this.#minLength = minLength;
    }

    validate(value) {
        if (!value) return true;
        return value.toString().length >= this.#minLength;
    }
}

/**
 * MaxLengthValidator - Longueur maximale
 */
class MaxLengthValidator extends Validator {
    #maxLength;

    constructor(maxLength, errorMessage) {
        super(errorMessage || `Maximum ${maxLength} caractères autorisés`);
        this.#maxLength = maxLength;
    }

    validate(value) {
        if (!value) return true;
        return value.toString().length <= this.#maxLength;
    }
}

/**
 * PatternValidator - Expression régulière
 */
class PatternValidator extends Validator {
    #pattern;

    constructor(pattern, errorMessage = 'Format invalide') {
        super(errorMessage);
        this.#pattern = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    }

    validate(value) {
        if (!value) return true;
        return this.#pattern.test(value);
    }
}

/**
 * MinValidator - Valeur minimale
 */
class MinValidator extends Validator {
    #min;

    constructor(min, errorMessage) {
        super(errorMessage || `La valeur doit être au moins ${min}`);
        this.#min = min;
    }

    validate(value) {
        if (!value) return true;
        return parseFloat(value) >= this.#min;
    }
}

/**
 * MaxValidator - Valeur maximale
 */
class MaxValidator extends Validator {
    #max;

    constructor(max, errorMessage) {
        super(errorMessage || `La valeur ne doit pas dépasser ${max}`);
        this.#max = max;
    }

    validate(value) {
        if (!value) return true;
        return parseFloat(value) <= this.#max;
    }
}

/**
 * UrlValidator - Validation d'URL
 */
class UrlValidator extends Validator {
    constructor(errorMessage = 'URL invalide') {
        super(errorMessage);
    }

    validate(value) {
        if (!value) return true;
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * PhoneValidator - Validation de numéro de téléphone
 */
class PhoneValidator extends Validator {
    constructor(errorMessage = 'Numéro de téléphone invalide') {
        super(errorMessage);
    }

    validate(value) {
        if (!value) return true;
        const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
        return phoneRegex.test(value.replace(/\s/g, ''));
    }
}

/**
 * StrongPasswordValidator - Mot de passe fort
 */
class StrongPasswordValidator extends Validator {
    constructor(errorMessage = 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 chiffre et 1 caractère spécial') {
        super(errorMessage);
    }

    validate(value) {
        if (!value) return true;
        const hasMinLength = value.length >= 8;
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    }
}

/**
 * MatchFieldValidator - Correspondance avec un autre champ
 */
class MatchFieldValidator extends Validator {
    #fieldToMatch;
    #form;

    constructor(fieldToMatch, errorMessage = 'Les champs ne correspondent pas') {
        super(errorMessage);
        this.#fieldToMatch = fieldToMatch;
    }

    setForm(form) {
        this.#form = form;
    }

    validate(value) {
        if (!value || !this.#form) return true;
        const otherField = this.#form.getField(this.#fieldToMatch);
        return otherField ? value === otherField.getValue() : true;
    }
}

// ============= FIELD CLASS (Composition) =============

/**
 * Classe Field - Représente un champ de formulaire
 */
class Field {
    #name;
    #element;
    #validators;
    #errorElement;
    #containerElement;
    #value;
    #isValid;
    #errorMessage;

    constructor(name, element) {
        this.#name = name;
        this.#element = element;
        this.#validators = [];
        this.#value = null;
        this.#isValid = true;
        this.#errorMessage = '';
        
        this.#containerElement = element.closest('.form-field');
        this.#errorElement = this.#containerElement?.querySelector('.field-error');
        
        this.#attachListeners();
    }

    #attachListeners() {
        this.#element.addEventListener('blur', () => this.validate());
        this.#element.addEventListener('input', () => {
            this.#value = this.#element.value;
            if (!this.#isValid) {
                this.validate();
            }
        });
        
        if (this.#element.type === 'checkbox') {
            this.#element.addEventListener('change', () => {
                this.#value = this.#element.checked;
                this.validate();
            });
        }
    }

    addValidator(validator) {
        if (validator instanceof MatchFieldValidator) {
            // Will be set by form
        }
        this.#validators.push(validator);
        return this;
    }

    validate() {
        this.#value = this.#element.type === 'checkbox' ? this.#element.checked : this.#element.value;
        
        for (const validator of this.#validators) {
            if (!validator.validate(this.#value, this)) {
                this.#setInvalid(validator.getErrorMessage());
                return false;
            }
        }
        
        this.#setValid();
        return true;
    }

    #setValid() {
        this.#isValid = true;
        this.#errorMessage = '';
        this.#containerElement?.classList.remove('invalid');
        this.#containerElement?.classList.add('valid');
        if (this.#errorElement) {
            this.#errorElement.textContent = '';
        }
    }

    #setInvalid(message) {
        this.#isValid = false;
        this.#errorMessage = message;
        this.#containerElement?.classList.remove('valid');
        this.#containerElement?.classList.add('invalid');
        if (this.#errorElement) {
            this.#errorElement.textContent = message;
        }
    }

    reset() {
        if (this.#element.type === 'checkbox') {
            this.#element.checked = false;
        } else {
            this.#element.value = '';
        }
        this.#value = null;
        this.#isValid = true;
        this.#errorMessage = '';
        this.#containerElement?.classList.remove('valid', 'invalid');
        if (this.#errorElement) {
            this.#errorElement.textContent = '';
        }
    }

    getName() {
        return this.#name;
    }

    getValue() {
        return this.#value;
    }

    setValue(value) {
        if (this.#element.type === 'checkbox') {
            this.#element.checked = value;
            this.#value = value;
        } else {
            this.#element.value = value;
            this.#value = value;
        }
    }

    isValid() {
        return this.#isValid;
    }

    getErrorMessage() {
        return this.#errorMessage;
    }

    getElement() {
        return this.#element;
    }
}

// ============= FORM CLASS (Composition & Chain of Responsibility) =============

/**
 * Classe Form - Gère un formulaire complet
 */
class Form {
    #formElement;
    #fields;
    #onSubmitCallback;
    #isSubmitting;

    constructor(formElement) {
        this.#formElement = formElement;
        this.#fields = new Map();
        this.#isSubmitting = false;
        
        this.#attachSubmitListener();
    }

    addField(field) {
        this.#fields.set(field.getName(), field);
        
        // Set form reference for MatchFieldValidator
        field.getElement().addEventListener('input', () => {
            field['_Form__validators']?.forEach(validator => {
                if (validator instanceof MatchFieldValidator) {
                    validator.setForm(this);
                }
            });
        });
        
        return this;
    }

    getField(name) {
        return this.#fields.get(name);
    }

    #attachSubmitListener() {
        this.#formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submit();
        });
    }

    validate() {
        let isValid = true;
        
        this.#fields.forEach(field => {
            if (!field.validate()) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    async submit() {
        if (this.#isSubmitting) return;
        
        if (!this.validate()) {
            return;
        }
        
        this.#isSubmitting = true;
        
        const data = this.getData();
        
        if (this.#onSubmitCallback) {
            await this.#onSubmitCallback(data);
        }
        
        this.#isSubmitting = false;
    }

    onSubmit(callback) {
        this.#onSubmitCallback = callback;
        return this;
    }

    getData() {
        const data = {};
        this.#fields.forEach((field, name) => {
            data[name] = field.getValue();
        });
        return data;
    }

    reset() {
        this.#fields.forEach(field => field.reset());
        this.#formElement.reset();
    }

    getValidationStatus() {
        const status = {};
        this.#fields.forEach((field, name) => {
            status[name] = {
                isValid: field.isValid(),
                errorMessage: field.getErrorMessage()
            };
        });
        return status;
    }
}

// ============= FORM BUILDER (Builder Pattern) =============

/**
 * Classe FormBuilder - Construction fluide de formulaires
 */
class FormBuilder {
    #form;

    constructor(formElement) {
        this.#form = new Form(formElement);
    }

    addField(name, validators = []) {
        const element = this.#form['_Form__formElement'].querySelector(`[name="${name}"]`);
        if (!element) {
            console.warn(`Field "${name}" not found`);
            return this;
        }

        const field = new Field(name, element);
        
        validators.forEach(validator => {
            field.addValidator(validator);
            if (validator instanceof MatchFieldValidator) {
                validator.setForm(this.#form);
            }
        });
        
        this.#form.addField(field);
        
        return this;
    }

    onSubmit(callback) {
        this.#form.onSubmit(callback);
        return this;
    }

    build() {
        return this.#form;
    }
}

// ============= UI CONTROLLER =============

/**
 * Classe FormUI - Gère l'interface utilisateur
 */
class FormUI {
    constructor() {
        this.forms = new Map();
        this.initializeForms();
        this.attachGlobalListeners();
    }

    initializeForms() {
        // Registration Form
        const registrationForm = new FormBuilder(document.getElementById('registrationForm'))
            .addField('username', [
                new RequiredValidator(),
                new MinLengthValidator(3),
                new MaxLengthValidator(20),
                new PatternValidator(/^[a-zA-Z0-9]+$/, 'Lettres et chiffres uniquement')
            ])
            .addField('email', [
                new RequiredValidator(),
                new EmailValidator()
            ])
            .addField('password', [
                new RequiredValidator(),
                new StrongPasswordValidator()
            ])
            .addField('confirmPassword', [
                new RequiredValidator(),
                new MatchFieldValidator('password', 'Les mots de passe ne correspondent pas')
            ])
            .addField('age', [
                new RequiredValidator(),
                new MinValidator(18, 'Vous devez avoir au moins 18 ans'),
                new MaxValidator(120, 'Âge invalide')
            ])
            .addField('website', [
                new UrlValidator()
            ])
            .addField('terms', [
                new RequiredValidator('Vous devez accepter les conditions')
            ])
            .onSubmit((data) => this.handleSubmit('Inscription', data))
            .build();

        this.forms.set('registration', registrationForm);

        // Contact Form
        const contactForm = new FormBuilder(document.getElementById('contactForm'))
            .addField('name', [
                new RequiredValidator(),
                new MinLengthValidator(2)
            ])
            .addField('email', [
                new RequiredValidator(),
                new EmailValidator()
            ])
            .addField('phone', [
                new PhoneValidator()
            ])
            .addField('subject', [
                new RequiredValidator()
            ])
            .addField('message', [
                new RequiredValidator(),
                new MinLengthValidator(10),
                new MaxLengthValidator(500)
            ])
            .onSubmit((data) => this.handleSubmit('Contact', data))
            .build();

        this.forms.set('contact', contactForm);

        // Real-time validation status
        this.setupRealTimeValidation();
    }

    attachGlobalListeners() {
        // Reset buttons
        document.getElementById('resetRegistration')?.addEventListener('click', () => {
            this.forms.get('registration').reset();
            this.updateValidationStatus();
            this.updateDataPreview();
        });

        document.getElementById('resetContact')?.addEventListener('click', () => {
            this.forms.get('contact').reset();
            this.updateValidationStatus();
            this.updateDataPreview();
        });

        // Toggle password visibility
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const input = document.getElementById(targetId);
                if (input) {
                    input.type = input.type === 'password' ? 'text' : 'password';
                    btn.textContent = input.type === 'password' ? '👁️' : '🙈';
                }
            });
        });

        // Close modal
        document.getElementById('closeModal')?.addEventListener('click', () => {
            document.getElementById('successModal').classList.remove('show');
        });
    }

    setupRealTimeValidation() {
        this.forms.forEach(form => {
            const formElement = form['_Form__formElement'];
            formElement.querySelectorAll('input, select, textarea').forEach(element => {
                element.addEventListener('input', () => {
                    this.updateValidationStatus();
                    this.updateDataPreview();
                });
            });
        });
    }

    updateValidationStatus() {
        const statusContainer = document.getElementById('validationStatus');
        const allStatus = [];

        this.forms.forEach((form, formName) => {
            const status = form.getValidationStatus();
            Object.entries(status).forEach(([fieldName, fieldStatus]) => {
                allStatus.push({
                    form: formName,
                    field: fieldName,
                    ...fieldStatus
                });
            });
        });

        if (allStatus.length === 0) {
            statusContainer.innerHTML = '<p class="empty-message">Remplissez les formulaires pour voir la validation</p>';
            return;
        }

        statusContainer.innerHTML = allStatus.map(item => {
            const icon = item.isValid ? '✅' : item.errorMessage ? '❌' : '⏳';
            const statusClass = item.isValid ? 'valid' : item.errorMessage ? 'invalid' : 'pending';
            
            return `
                <div class="status-item ${statusClass}">
                    <span class="status-label">${item.form}.${item.field}</span>
                    <span class="status-icon">${icon}</span>
                </div>
            `;
        }).join('');
    }

    updateDataPreview() {
        const previewContainer = document.getElementById('dataPreview');
        const allData = [];

        this.forms.forEach((form, formName) => {
            const data = form.getData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    allData.push({ form: formName, key, value });
                }
            });
        });

        if (allData.length === 0) {
            previewContainer.innerHTML = '<p class="empty-message">Les données du formulaire apparaîtront ici</p>';
            return;
        }

        previewContainer.innerHTML = allData.map(item => `
            <div class="data-item">
                <span class="data-key">${item.form}.${item.key}:</span>
                <span class="data-value">${this.formatValue(item.value)}</span>
            </div>
        `).join('');
    }

    formatValue(value) {
        if (typeof value === 'boolean') {
            return value ? '✓ Oui' : '✗ Non';
        }
        if (typeof value === 'string' && value.length > 50) {
            return value.substring(0, 50) + '...';
        }
        return value;
    }

    handleSubmit(formName, data) {
        const modal = document.getElementById('successModal');
        const dataContainer = document.getElementById('submittedData');

        dataContainer.innerHTML = `
            <h3>Données du formulaire "${formName}":</h3>
            ${Object.entries(data).map(([key, value]) => `
                <div class="data-item">
                    <span class="data-key">${key}:</span>
                    <span class="data-value">${this.formatValue(value)}</span>
                </div>
            `).join('')}
        `;

        modal.classList.add('show');

        // Reset form after submission
        setTimeout(() => {
            const form = formName === 'Inscription' ? this.forms.get('registration') : this.forms.get('contact');
            form.reset();
            this.updateValidationStatus();
            this.updateDataPreview();
        }, 2000);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const formUI = new FormUI();
    
    // Exposer pour le debugging
    window.formUI = formUI;
    window.FormBuilder = FormBuilder;
    window.RequiredValidator = RequiredValidator;
    window.EmailValidator = EmailValidator;
});