// ========================================
// ÉTAPE 1: VARIABLES GLOBALES
// ========================================

let invoiceItemCount = 0;
let experienceCount = 0;
let educationCount = 0;
let projectCount = 0;

// Images en base64
let companyLogoBase64 = null;
let cvPhotoBase64 = null;
let signatureBase64 = null;

// Configuration CV
let cvTemplate = 'modern';
let cvPhotoPosition = 'left';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initialisation du générateur de PDF...');
    
    setupTabs();
    setupColorPickers();
    setupFileUploads();
    
    // Initialiser la date du jour
    document.getElementById('invoice-date').value = new Date().toISOString().split('T')[0];
    
    // Ajouter les articles initiaux
    addInvoiceItem();
    addInvoiceItem();
    
    // Ajouter les éléments CV initiaux
    addExperience();
    addEducation();
    addProject();
    
    // Setup listeners
    setupInvoiceListeners();
    setupCVListeners();
    
    console.log('Générateur prêt !');
});

// ========================================
// ÉTAPE 2: SETUP TABS
// ========================================

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

// ========================================
// ÉTAPE 3: COLOR PICKERS
// ========================================

function setupColorPickers() {
    // Facture
    const invoiceColor = document.getElementById('invoice-color');
    const invoiceColorText = document.getElementById('invoice-color-text');
    
    invoiceColor.addEventListener('input', (e) => {
        invoiceColorText.value = e.target.value;
        updateInvoicePreview();
    });
    
    invoiceColorText.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            invoiceColor.value = e.target.value;
            updateInvoicePreview();
        }
    });
    
    // CV
    const cvColor = document.getElementById('cv-color');
    const cvColorText = document.getElementById('cv-color-text');
    
    cvColor.addEventListener('input', (e) => {
        cvColorText.value = e.target.value;
        updateCVPreview();
    });
    
    cvColorText.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            cvColor.value = e.target.value;
            updateCVPreview();
        }
    });
}

// ========================================
// ÉTAPE 4: FILE UPLOADS
// ========================================

function setupFileUploads() {
    // Logo entreprise
    const logoInput = document.getElementById('company-logo');
    logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                companyLogoBase64 = event.target.result;
                
                const preview = document.getElementById('logo-preview');
                preview.innerHTML = `<img src="${companyLogoBase64}" alt="Logo">`;
                preview.style.display = 'block';
                
                document.getElementById('logo-filename').textContent = file.name;
                document.getElementById('remove-logo-btn').style.display = 'inline-block';
                
                updateInvoicePreview();
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Photo CV
    const photoInput = document.getElementById('cv-photo');
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                cvPhotoBase64 = event.target.result;
                
                const preview = document.getElementById('photo-preview');
                preview.innerHTML = `<img src="${cvPhotoBase64}" alt="Photo">`;
                preview.style.display = 'block';
                
                document.getElementById('photo-filename').textContent = file.name;
                document.getElementById('remove-photo-btn').style.display = 'inline-block';
                
                updateCVPreview();
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Signature
    const signatureInput = document.getElementById('signature-file');
    signatureInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                signatureBase64 = event.target.result;
                
                const preview = document.getElementById('signature-preview');
                preview.innerHTML = `<img src="${signatureBase64}" alt="Signature">`;
                preview.style.display = 'block';
                
                document.getElementById('signature-filename').textContent = file.name;
                document.getElementById('remove-signature-btn').style.display = 'inline-block';
                
                updateInvoicePreview();
            };
            reader.readAsDataURL(file);
        }
    });
}

function removeLogo() {
    companyLogoBase64 = null;
    document.getElementById('company-logo').value = '';
    document.getElementById('logo-preview').innerHTML = '';
    document.getElementById('logo-preview').style.display = 'none';
    document.getElementById('logo-filename').textContent = 'Choisir un logo (PNG, JPG)';
    document.getElementById('remove-logo-btn').style.display = 'none';
    updateInvoicePreview();
}

function removePhoto() {
    cvPhotoBase64 = null;
    document.getElementById('cv-photo').value = '';
    document.getElementById('photo-preview').innerHTML = '';
    document.getElementById('photo-preview').style.display = 'none';
    document.getElementById('photo-filename').textContent = 'Choisir une photo';
    document.getElementById('remove-photo-btn').style.display = 'none';
    updateCVPreview();
}

function removeSignature() {
    signatureBase64 = null;
    document.getElementById('signature-file').value = '';
    document.getElementById('signature-preview').innerHTML = '';
    document.getElementById('signature-preview').style.display = 'none';
    document.getElementById('signature-filename').textContent = 'Choisir une signature';
    document.getElementById('remove-signature-btn').style.display = 'none';
    updateInvoicePreview();
}

function toggleSignatureUpload() {
    const includeSignature = document.getElementById('include-signature').checked;
    const section = document.getElementById('signature-upload-section');
    section.style.display = includeSignature ? 'block' : 'none';
    updateInvoicePreview();
}

// ========================================
// ÉTAPE 5: CV TEMPLATES & OPTIONS
// ========================================

function selectCVTemplate(template) {
    cvTemplate = template;
    
    document.querySelectorAll('.template-option').forEach(opt => {
        opt.classList.remove('active');
    });
    document.querySelector(`[data-template="${template}"]`).classList.add('active');
    
    document.getElementById('cv-preview-content').setAttribute('data-template', template);
    updateCVPreview();
}

function togglePhotoOptions() {
    const includePhoto = document.getElementById('cv-include-photo').checked;
    const photoOptions = document.getElementById('photo-options');
    
    if (includePhoto) {
        photoOptions.style.display = 'block';
    } else {
        photoOptions.style.display = 'none';
        document.getElementById('cv-photo-container').style.display = 'none';
    }
    
    updateCVPreview();
}

function selectPhotoPosition(position) {
    cvPhotoPosition = position;
    
    document.querySelectorAll('.position-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-position="${position}"]`).classList.add('active');
    
    updateCVPreview();
}

// Suite dans la partie 2...