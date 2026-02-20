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

// ========================================
// ÉTAPE 6: GESTION DES ARTICLES (FACTURE)
// ========================================

function addInvoiceItem() {
    invoiceItemCount++;
    const container = document.getElementById('invoice-items');
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'invoice-item';
    itemDiv.id = `item-${invoiceItemCount}`;
    
    itemDiv.innerHTML = `
        <div class="invoice-item-header">
            <h4>Article ${invoiceItemCount}</h4>
            <button class="btn-delete" onclick="removeInvoiceItem(${invoiceItemCount})">
                Supprimer
            </button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Type d'article</label>
                <select class="form-input invoice-item-type" data-item-id="${invoiceItemCount}">
                    <option value="Service">Service</option>
                    <option value="Produit">Produit</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Formation">Formation</option>
                    <option value="Développement">Développement</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Autre">Autre</option>
                </select>
            </div>
            <div class="form-group">
                <label>Description</label>
                <input type="text" 
                       class="form-input invoice-item-description" 
                       placeholder="Description détaillée"
                       value="${invoiceItemCount === 1 ? 'Développement application web' : ''}"
                       data-item-id="${invoiceItemCount}">
            </div>
        </div>
        <div class="form-row" style="grid-template-columns: 1fr 1fr 1fr;">
            <div class="form-group">
                <label>Quantité</label>
                <input type="number" 
                       class="form-input invoice-item-quantity" 
                       value="${invoiceItemCount === 1 ? '10' : '1'}" 
                       min="1"
                       data-item-id="${invoiceItemCount}">
            </div>
            <div class="form-group">
                <label>Prix unitaire HT (€)</label>
                <input type="number" 
                       class="form-input invoice-item-price" 
                       value="${invoiceItemCount === 1 ? '50' : '100'}" 
                       min="0" 
                       step="0.01"
                       data-item-id="${invoiceItemCount}">
            </div>
            <div class="form-group">
                <label>Total HT (€)</label>
                <input type="text" 
                       class="form-input invoice-item-total" 
                       value="${invoiceItemCount === 1 ? '500.00' : '100.00'}" 
                       readonly
                       data-item-id="${invoiceItemCount}">
            </div>
        </div>
    `;
    
    container.appendChild(itemDiv);
    
    const inputs = itemDiv.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            updateItemTotal(invoiceItemCount);
            updateInvoicePreview();
        });
        input.addEventListener('change', updateInvoicePreview);
    });
    
    updateInvoicePreview();
}

function removeInvoiceItem(id) {
    const item = document.getElementById(`item-${id}`);
    if (item) {
        item.remove();
        updateInvoicePreview();
    }
}

function updateItemTotal(itemId) {
    const quantity = document.querySelector(`.invoice-item-quantity[data-item-id="${itemId}"]`);
    const price = document.querySelector(`.invoice-item-price[data-item-id="${itemId}"]`);
    const total = document.querySelector(`.invoice-item-total[data-item-id="${itemId}"]`);
    
    if (quantity && price && total) {
        const itemTotal = (parseFloat(quantity.value) || 0) * (parseFloat(price.value) || 0);
        total.value = itemTotal.toFixed(2);
    }
}

function getInvoiceItems() {
    const items = [];
    const types = document.querySelectorAll('.invoice-item-type');
    
    types.forEach(type => {
        const itemId = type.dataset.itemId;
        const description = document.querySelector(`.invoice-item-description[data-item-id="${itemId}"]`);
        const quantity = document.querySelector(`.invoice-item-quantity[data-item-id="${itemId}"]`);
        const price = document.querySelector(`.invoice-item-price[data-item-id="${itemId}"]`);
        
        if (description && description.value) {
            items.push({
                type: type.value,
                description: description.value,
                quantity: parseFloat(quantity.value) || 0,
                price: parseFloat(price.value) || 0
            });
        }
    });
    
    return items;
}

function calculateInvoiceTotals() {
    const items = getInvoiceItems();
    
    let totalHT = 0;
    items.forEach(item => {
        totalHT += item.quantity * item.price;
    });
    
    const tva = totalHT * 0.20;
    const totalTTC = totalHT + tva;
    
    return {
        totalHT: totalHT.toFixed(2),
        tva: tva.toFixed(2),
        totalTTC: totalTTC.toFixed(2)
    };
}

// ========================================
// ÉTAPE 7: PRÉVISUALISATION FACTURE
// ========================================

function setupInvoiceListeners() {
    const fields = [
        'company-name', 'company-address', 'company-zip', 'company-city',
        'company-email', 'company-phone', 'company-siret',
        'client-name', 'client-address', 'client-zip', 'client-city',
        'invoice-number', 'invoice-date', 'invoice-notes', 'invoice-subject',
        'invoice-location'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', updateInvoicePreview);
        }
    });
    
    updateInvoicePreview();
}

function updateInvoicePreview() {
    const color = document.getElementById('invoice-color').value;
    
    // Appliquer la couleur au nom de l'entreprise
    const companyNameEl = document.getElementById('preview-company-name');
    companyNameEl.style.color = color;
    
    // Appliquer la couleur au header
    const header = document.getElementById('invoice-preview-header');
    header.style.borderBottomColor = color;
    
    // Appliquer la couleur aux en-têtes de tableau
    const tableHead = document.getElementById('invoice-table-head');
    tableHead.querySelectorAll('th').forEach(th => {
        th.style.backgroundColor = color;
    });
    
    // Appliquer la couleur au total TTC
    const totalTTC = document.getElementById('preview-total-ttc');
    totalTTC.style.color = color;
    
    // Logo
    const previewLogo = document.getElementById('preview-logo');
    if (companyLogoBase64) {
        previewLogo.innerHTML = `<img src="${companyLogoBase64}" alt="Logo">`;
        previewLogo.style.display = 'block';
    } else {
        previewLogo.innerHTML = '';
        previewLogo.style.display = 'none';
    }
    
    // Informations entreprise
    const companyName = document.getElementById('company-name').value;
    const companyAddress = document.getElementById('company-address').value;
    const companyZip = document.getElementById('company-zip').value;
    const companyCity = document.getElementById('company-city').value;
    
    companyNameEl.textContent = companyName;
    document.getElementById('preview-company-address').innerHTML = 
        `${companyAddress}<br>${companyZip} ${companyCity}`;
    
    // Numéro facture
    const invoiceNumber = document.getElementById('invoice-number').value;
    document.getElementById('preview-invoice-number').textContent = `N° ${invoiceNumber}`;
    
    // Objet
    const subject = document.getElementById('invoice-subject').value;
    document.getElementById('preview-subject-text').textContent = subject;
    
    // Client
    const clientName = document.getElementById('client-name').value;
    const clientAddress = document.getElementById('client-address').value;
    const clientZip = document.getElementById('client-zip').value;
    const clientCity = document.getElementById('client-city').value;
    
    document.getElementById('preview-client-info').innerHTML = 
        `${clientName}<br>${clientAddress}<br>${clientZip} ${clientCity}`;
    
    // Articles
    const items = getInvoiceItems();
    const tbody = document.getElementById('preview-items');
    tbody.innerHTML = '';
    
    items.forEach(item => {
        const total = (item.quantity * item.price).toFixed(2);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.type}</td>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>${item.price.toFixed(2)}€</td>
            <td>${total}€</td>
        `;
        tbody.appendChild(row);
    });
    
    // Totaux
    const totals = calculateInvoiceTotals();
    document.getElementById('preview-total-ht').textContent = totals.totalHT + '€';
    document.getElementById('preview-tva').textContent = totals.tva + '€';
    totalTTC.textContent = totals.totalTTC + '€';
    
    // Signature
    const includeSignature = document.getElementById('include-signature').checked;
    const signatureSection = document.getElementById('preview-signature-section');
    
    if (includeSignature) {
        const location = document.getElementById('invoice-location').value;
        const date = document.getElementById('invoice-date').value;
        const formattedDate = new Date(date).toLocaleDateString('fr-FR');
        
        document.getElementById('preview-signature-location').textContent = 
            `A ${location}, le ${formattedDate}`;
        
        const signatureImage = document.getElementById('preview-signature-image');
        if (signatureBase64) {
            signatureImage.innerHTML = `<img src="${signatureBase64}" alt="Signature">`;
        } else {
            signatureImage.innerHTML = '<p style="font-style: italic; margin-top: 30px;">Signature</p>';
        }
        
        signatureSection.style.display = 'block';
    } else {
        signatureSection.style.display = 'none';
    }
}

// ========================================
// ÉTAPE 8: GÉNÉRATION PDF FACTURE
// ========================================

function generateInvoicePDF() {
    console.log('Génération de la facture PDF...');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Récupérer les données
    const companyName = document.getElementById('company-name').value;
    const companyAddress = document.getElementById('company-address').value;
    const companyZip = document.getElementById('company-zip').value;
    const companyCity = document.getElementById('company-city').value;
    const companyEmail = document.getElementById('company-email').value;
    const companyPhone = document.getElementById('company-phone').value;
    const companySiret = document.getElementById('company-siret').value;
    
    const clientName = document.getElementById('client-name').value;
    const clientAddress = document.getElementById('client-address').value;
    const clientZip = document.getElementById('client-zip').value;
    const clientCity = document.getElementById('client-city').value;
    
    const invoiceNumber = document.getElementById('invoice-number').value;
    const invoiceDate = document.getElementById('invoice-date').value;
    const invoiceNotes = document.getElementById('invoice-notes').value;
    const invoiceSubject = document.getElementById('invoice-subject').value;
    const invoiceLocation = document.getElementById('invoice-location').value;
    
    const color = document.getElementById('invoice-color').value;
    const rgb = hexToRgb(color);
    
    const items = getInvoiceItems();
    const totals = calculateInvoiceTotals();
    
    // HEADER avec couleur personnalisée
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.rect(0, 0, 210, 50, 'F');
    
    let headerY = 15;
    
    // Logo si présent
    if (companyLogoBase64) {
        try {
            doc.addImage(companyLogoBase64, 'PNG', 15, 10, 30, 30);
            headerY = 15;
        } catch (e) {
            console.error('Erreur logo:', e);
        }
    }
    
    // Entreprise avec couleur
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(companyName, companyLogoBase64 ? 50 : 15, headerY);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(companyAddress, companyLogoBase64 ? 50 : 15, headerY + 7);
    doc.text(`${companyZip} ${companyCity}`, companyLogoBase64 ? 50 : 15, headerY + 12);
    doc.text(companyEmail, companyLogoBase64 ? 50 : 15, headerY + 17);
    doc.text(companyPhone, companyLogoBase64 ? 50 : 15, headerY + 22);
    
    // Titre FACTURE
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('FACTURE', 210 - 15, 20, { align: 'right' });
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`N° ${invoiceNumber}`, 210 - 15, 28, { align: 'right' });
    doc.text(`Date: ${new Date(invoiceDate).toLocaleDateString('fr-FR')}`, 210 - 15, 35, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    
    let yPos = 60;
    
    // OBJET ET CLIENT SUR MÊME LIGNE
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Objet:', 15, yPos);
    doc.setFont(undefined, 'normal');
    const splitSubject = doc.splitTextToSize(invoiceSubject, 75);
    doc.text(splitSubject, 15, yPos + 5);
    
    doc.setFont(undefined, 'bold');
    doc.text('Client:', 110, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(clientName, 110, yPos + 5);
    doc.text(clientAddress, 110, yPos + 10);
    doc.text(`${clientZip} ${clientCity}`, 110, yPos + 15);
    
    yPos += Math.max(splitSubject.length * 5, 20) + 10;
    
    // SIRET
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`SIRET: ${companySiret}`, 15, yPos);
    doc.setTextColor(0, 0, 0);
    
    yPos += 10;
    
    // TABLEAU DES ARTICLES
    const tableData = items.map(item => [
        item.type,
        item.description,
        item.quantity.toString(),
        `${item.price.toFixed(2)}€`,
        `${(item.quantity * item.price).toFixed(2)}€`
    ]);
    
    doc.autoTable({
        startY: yPos,
        head: [['Type', 'Description', 'Qté', 'Prix HT', 'Total HT']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [rgb.r, rgb.g, rgb.b],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 11
        },
        styles: {
            fontSize: 10,
            cellPadding: 5
        },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 70 },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 30, halign: 'right' }
        }
    });
    
    // TOTAUX
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFontSize(11);
    doc.text('Total HT:', 140, finalY);
    doc.text(`${totals.totalHT}€`, 190, finalY, { align: 'right' });
    
    doc.text('TVA (20%):', 140, finalY + 7);
    doc.text(`${totals.tva}€`, 190, finalY + 7, { align: 'right' });
    
    // Total TTC avec couleur
    doc.setFont(undefined, 'bold');
    doc.setFontSize(13);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text('Total TTC:', 140, finalY + 15);
    doc.text(`${totals.totalTTC}€`, 190, finalY + 15, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    
    // NOTES
    if (invoiceNotes) {
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        
        const notesY = finalY + 30;
        doc.text('Notes:', 15, notesY);
        
        const splitNotes = doc.splitTextToSize(invoiceNotes, 180);
        doc.text(splitNotes, 15, notesY + 5);
    }
    
    // SIGNATURE
    const includeSignature = document.getElementById('include-signature').checked;
    if (includeSignature) {
        const signatureY = 250;
        const formattedDate = new Date(invoiceDate).toLocaleDateString('fr-FR');
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`A ${invoiceLocation}, le ${formattedDate}`, 140, signatureY);
        
        if (signatureBase64) {
            try {
                doc.addImage(signatureBase64, 'PNG', 140, signatureY + 5, 40, 20);
            } catch (e) {
                console.error('Erreur signature:', e);
            }
        }
    }
    
    // FOOTER
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
        `${companyName} - ${companyAddress}, ${companyZip} ${companyCity}`,
        105,
        285,
        { align: 'center' }
    );
    doc.text(`SIRET: ${companySiret}`, 105, 290, { align: 'center' });
    
    doc.save(`Facture-${invoiceNumber}.pdf`);
    
    console.log('Facture PDF générée !');
    showNotification('Facture PDF générée avec succès !');
}

// ========================================
// ÉTAPE 9: GESTION CV - EXPÉRIENCES
// ========================================

function addExperience() {
    experienceCount++;
    const container = document.getElementById('cv-experiences');
    
    const div = document.createElement('div');
    div.className = 'experience-item';
    div.id = `experience-${experienceCount}`;
    
    const defaultData = experienceCount === 1 ? {
        title: 'Développeur Full Stack',
        company: 'TechCorp',
        period: '2020 - Présent',
        description: 'Développement d\'applications web avec React et Node.js. Gestion de projets en méthode Agile.'
    } : {
        title: '',
        company: '',
        period: '',
        description: ''
    };
    
    div.innerHTML = `
        <div class="item-header">
            <h4>Expérience ${experienceCount}</h4>
            <button class="btn-delete" onclick="removeExperience(${experienceCount})">
                Supprimer
            </button>
        </div>
        <div class="form-group">
            <label>Poste</label>
            <input type="text" class="form-input cv-exp-title" 
                   value="${defaultData.title}"
                   data-exp-id="${experienceCount}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Entreprise</label>
                <input type="text" class="form-input cv-exp-company" 
                       value="${defaultData.company}"
                       data-exp-id="${experienceCount}">
            </div>
            <div class="form-group">
                <label>Période</label>
                <input type="text" class="form-input cv-exp-period" 
                       value="${defaultData.period}"
                       placeholder="2020 - 2023"
                       data-exp-id="${experienceCount}">
            </div>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea class="form-input cv-exp-description" rows="3" 
                      data-exp-id="${experienceCount}">${defaultData.description}</textarea>
        </div>
    `;
    
    container.appendChild(div);
    
    const inputs = div.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('input', updateCVPreview);
    });
    
    updateCVPreview();
}

function removeExperience(id) {
    const item = document.getElementById(`experience-${id}`);
    if (item) {
        item.remove();
        updateCVPreview();
    }
}

// ========================================
// ÉTAPE 10: GESTION CV - FORMATION
// ========================================

function addEducation() {
    educationCount++;
    const container = document.getElementById('cv-education');
    
    const div = document.createElement('div');
    div.className = 'education-item';
    div.id = `education-${educationCount}`;
    
    const defaultData = educationCount === 1 ? {
        degree: 'Master Informatique',
        school: 'Université Paris',
        period: '2015 - 2017',
        description: 'Spécialisation en développement web et bases de données'
    } : {
        degree: '',
        school: '',
        period: '',
        description: ''
    };
    
    div.innerHTML = `
        <div class="item-header">
            <h4>Formation ${educationCount}</h4>
            <button class="btn-delete" onclick="removeEducation(${educationCount})">
                Supprimer
            </button>
        </div>
        <div class="form-group">
            <label>Diplôme</label>
            <input type="text" class="form-input cv-edu-degree" 
                   value="${defaultData.degree}"
                   data-edu-id="${educationCount}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>École / Université</label>
                <input type="text" class="form-input cv-edu-school" 
                       value="${defaultData.school}"
                       data-edu-id="${educationCount}">
            </div>
            <div class="form-group">
                <label>Période</label>
                <input type="text" class="form-input cv-edu-period" 
                       value="${defaultData.period}"
                       placeholder="2015 - 2017"
                       data-edu-id="${educationCount}">
            </div>
        </div>
        <div class="form-group">
            <label>Description (optionnel)</label>
            <textarea class="form-input cv-edu-description" rows="2" 
                      data-edu-id="${educationCount}">${defaultData.description}</textarea>
        </div>
    `;
    
    container.appendChild(div);
    
    const inputs = div.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('input', updateCVPreview);
    });
    
    updateCVPreview();
}

function removeEducation(id) {
    const item = document.getElementById(`education-${id}`);
    if (item) {
        item.remove();
        updateCVPreview();
    }
}

// ========================================
// ÉTAPE 11: GESTION CV - PROJETS
// ========================================

function addProject() {
    projectCount++;
    const container = document.getElementById('cv-projects');
    
    const div = document.createElement('div');
    div.className = 'project-item';
    div.id = `project-${projectCount}`;
    
    const defaultData = projectCount === 1 ? {
        title: 'Application de gestion de tâches',
        period: '2023',
        description: 'Application web full-stack avec React et Node.js permettant la gestion collaborative de projets.',
        technologies: 'React, Node.js, MongoDB, Express'
    } : {
        title: '',
        period: '',
        description: '',
        technologies: ''
    };
    
    div.innerHTML = `
        <div class="item-header">
            <h4>Projet ${projectCount}</h4>
            <button class="btn-delete" onclick="removeProject(${projectCount})">
                Supprimer
            </button>
        </div>
        <div class="form-group">
            <label>Nom du projet</label>
            <input type="text" class="form-input cv-project-title" 
                   value="${defaultData.title}"
                   data-project-id="${projectCount}">
        </div>
        <div class="form-group">
            <label>Période</label>
            <input type="text" class="form-input cv-project-period" 
                   value="${defaultData.period}"
                   placeholder="2023"
                   data-project-id="${projectCount}">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea class="form-input cv-project-description" rows="3" 
                      data-project-id="${projectCount}">${defaultData.description}</textarea>
        </div>
        <div class="form-group">
            <label>Technologies utilisées</label>
            <input type="text" class="form-input cv-project-technologies" 
                   value="${defaultData.technologies}"
                   placeholder="React, Node.js, MongoDB"
                   data-project-id="${projectCount}">
        </div>
    `;
    
    container.appendChild(div);
    
    const inputs = div.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('input', updateCVPreview);
    });
    
    updateCVPreview();
}

function removeProject(id) {
    const item = document.getElementById(`project-${id}`);
    if (item) {
        item.remove();
        updateCVPreview();
    }
}

function getCVProjects() {
    const projects = [];
    const titles = document.querySelectorAll('.cv-project-title');
    
    titles.forEach(title => {
        const projectId = title.dataset.projectId;
        const period = document.querySelector(`.cv-project-period[data-project-id="${projectId}"]`);
        const description = document.querySelector(`.cv-project-description[data-project-id="${projectId}"]`);
        const technologies = document.querySelector(`.cv-project-technologies[data-project-id="${projectId}"]`);
        
        if (title.value) {
            projects.push({
                title: title.value,
                period: period?.value || '',
                description: description?.value || '',
                technologies: technologies?.value || ''
            });
        }
    });
    
    return projects;
}

// ========================================
// ÉTAPE 12: PRÉVISUALISATION CV
// ========================================

function setupCVListeners() {
    const fields = [
        'cv-name', 'cv-title', 'cv-email', 'cv-phone', 'cv-address',
        'cv-linkedin', 'cv-summary', 'cv-skills', 'cv-languages', 'cv-font'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', updateCVPreview);
            if (field.tagName === 'SELECT') {
                field.addEventListener('change', updateCVPreview);
            }
        }
    });
    
    updateCVPreview();
}

function updateCVPreview() {
    const color = document.getElementById('cv-color').value;
    
    // Appliquer la couleur au nom
    const cvName = document.getElementById('preview-cv-name');
    cvName.style.color = color;
    
    // Appliquer la couleur au header
    const cvHeader = document.getElementById('cv-preview-header');
    cvHeader.style.borderBottomColor = color;
    
    // Appliquer la couleur aux titres de sections
    const sections = document.querySelectorAll('#cv-preview .cv-section h4');
    sections.forEach(h4 => {
        h4.style.color = color;
        h4.style.borderBottomColor = color;
    });
    
    // Photo
    const includePhoto = document.getElementById('cv-include-photo').checked;
    const photoContainer = document.getElementById('cv-photo-container');
    
    if (includePhoto && cvPhotoBase64) {
        photoContainer.innerHTML = `<img src="${cvPhotoBase64}" alt="Photo" class="cv-photo">`;
        photoContainer.style.display = 'block';
        photoContainer.className = `cv-photo-container cv-photo-${cvPhotoPosition}`;
        
        // Appliquer la couleur à la bordure de la photo
        const photoImg = photoContainer.querySelector('.cv-photo');
        if (photoImg) {
            photoImg.style.borderColor = color;
        }
    } else {
        photoContainer.innerHTML = '';
        photoContainer.style.display = 'none';
    }
    
    // Informations personnelles
    const name = document.getElementById('cv-name').value;
    const title = document.getElementById('cv-title').value;
    const email = document.getElementById('cv-email').value;
    const phone = document.getElementById('cv-phone').value;
    const address = document.getElementById('cv-address').value;
    
    cvName.textContent = name;
    document.getElementById('preview-cv-title').textContent = title;
    document.getElementById('preview-cv-contact').textContent = 
        `${email} | ${phone} | ${address}`;
    
    // Résumé
    const summary = document.getElementById('cv-summary').value;
    document.getElementById('preview-cv-summary').textContent = summary;
    
    // Expériences
    const experiences = getCVExperiences();
    const expContainer = document.getElementById('preview-cv-experiences');
    expContainer.innerHTML = '';
    
    experiences.forEach(exp => {
        const div = document.createElement('div');
        div.className = 'cv-experience-item';
        div.innerHTML = `
            <h5>${exp.title}</h5>
            <p class="cv-meta">${exp.company} | ${exp.period}</p>
            <p>${exp.description}</p>
        `;
        expContainer.appendChild(div);
    });
    
    // Formation
    const education = getCVEducation();
    const eduContainer = document.getElementById('preview-cv-education');
    eduContainer.innerHTML = '';
    
    education.forEach(edu => {
        const div = document.createElement('div');
        div.className = 'cv-education-item';
        div.innerHTML = `
            <h5>${edu.degree}</h5>
            <p class="cv-meta">${edu.school} | ${edu.period}</p>
            ${edu.description ? `<p>${edu.description}</p>` : ''}
        `;
        eduContainer.appendChild(div);
    });
    
    // Projets
    const projects = getCVProjects();
    const projectsContainer = document.getElementById('preview-cv-projects');
    const projectsSection = document.getElementById('cv-projects-section');
    
    if (projects.length > 0) {
        projectsContainer.innerHTML = '';
        projects.forEach(project => {
            const div = document.createElement('div');
            div.className = 'cv-project-item';
            div.innerHTML = `
                <h5>${project.title}</h5>
                <p class="cv-meta">${project.period} | ${project.technologies}</p>
                <p>${project.description}</p>
            `;
            projectsContainer.appendChild(div);
        });
        projectsSection.style.display = 'block';
    } else {
        projectsSection.style.display = 'none';
    }
    
    // Compétences
    const skills = document.getElementById('cv-skills').value;
    document.getElementById('preview-cv-skills').textContent = skills;
    
    // Langues
    const languages = document.getElementById('cv-languages').value;
    document.getElementById('preview-cv-languages').textContent = languages;
}

function getCVExperiences() {
    const experiences = [];
    const titles = document.querySelectorAll('.cv-exp-title');
    
    titles.forEach(title => {
        const expId = title.dataset.expId;
        const company = document.querySelector(`.cv-exp-company[data-exp-id="${expId}"]`);
        const period = document.querySelector(`.cv-exp-period[data-exp-id="${expId}"]`);
        const description = document.querySelector(`.cv-exp-description[data-exp-id="${expId}"]`);
        
        if (title.value) {
            experiences.push({
                title: title.value,
                company: company?.value || '',
                period: period?.value || '',
                description: description?.value || ''
            });
        }
    });
    
    return experiences;
}

function getCVEducation() {
    const education = [];
    const degrees = document.querySelectorAll('.cv-edu-degree');
    
    degrees.forEach(degree => {
        const eduId = degree.dataset.eduId;
        const school = document.querySelector(`.cv-edu-school[data-edu-id="${eduId}"]`);
        const period = document.querySelector(`.cv-edu-period[data-edu-id="${eduId}"]`);
        const description = document.querySelector(`.cv-edu-description[data-edu-id="${eduId}"]`);
        
        if (degree.value) {
            education.push({
                degree: degree.value,
                school: school?.value || '',
                period: period?.value || '',
                description: description?.value || ''
            });
        }
    });
    
    return education;
}

// ========================================
// ÉTAPE 13: GÉNÉRATION PDF CV
// ========================================

function generateCVPDF() {
    console.log('Génération du CV PDF...');
    
    const { jsPDF } = window.jspdf;
    
    // Récupérer le font sélectionné
    const fontFamily = document.getElementById('cv-font').value;
    const doc = new jsPDF({
        unit: 'mm',
        format: 'a4'
    });
    
    // Définir la police
    doc.setFont(fontFamily);
    
    // Récupérer les données
    const name = document.getElementById('cv-name').value;
    const title = document.getElementById('cv-title').value;
    const email = document.getElementById('cv-email').value;
    const phone = document.getElementById('cv-phone').value;
    const address = document.getElementById('cv-address').value;
    const linkedin = document.getElementById('cv-linkedin').value;
    const summary = document.getElementById('cv-summary').value;
    const skills = document.getElementById('cv-skills').value;
    const languages = document.getElementById('cv-languages').value;
    
    const color = document.getElementById('cv-color').value;
    const rgb = hexToRgb(color);
    
    const experiences = getCVExperiences();
    const education = getCVEducation();
    const projects = getCVProjects();
    
    const includePhoto = document.getElementById('cv-include-photo').checked;
    
    let yPosition = 20;
    
    // HEADER avec couleur personnalisée selon template
    if (cvTemplate === 'modern') {
        // Template Moderne - Header avec fond couleur
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(0, 0, 210, 60, 'F');
        
        // Photo si présente
        if (includePhoto && cvPhotoBase64) {
            let photoX = cvPhotoPosition === 'left' ? 15 : (cvPhotoPosition === 'center' ? 90 : 165);
            try {
                doc.addImage(cvPhotoBase64, 'PNG', photoX, 10, 30, 30, undefined, 'FAST', 0);
            } catch (e) {
                console.error('Erreur photo:', e);
            }
        }
        
        // Nom et titre en blanc
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(26);
        doc.setFont(fontFamily, 'bold');
        doc.text(name, 105, 25, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setFont(fontFamily, 'normal');
        doc.text(title, 105, 33, { align: 'center' });
        
        doc.setFontSize(9);
        doc.text(`${email}  |  ${phone}  |  ${address}`, 105, 45, { align: 'center' });
        
        if (linkedin) {
            doc.text(linkedin, 105, 52, { align: 'center' });
        }
        
        yPosition = 70;
        doc.setTextColor(0, 0, 0);
        
    } else if (cvTemplate === 'classic') {
        // Template Classique - Header simple noir
        if (includePhoto && cvPhotoBase64) {
            try {
                doc.addImage(cvPhotoBase64, 'PNG', 15, 15, 30, 30, undefined, 'FAST', 0);
            } catch (e) {
                console.error('Erreur photo:', e);
            }
        }
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(28);
        doc.setFont(fontFamily, 'bold');
        doc.text(name, includePhoto && cvPhotoBase64 ? 50 : 15, 25);
        
        doc.setFontSize(14);
        doc.setFont(fontFamily, 'normal');
        doc.text(title, includePhoto && cvPhotoBase64 ? 50 : 15, 33);
        
        doc.setFontSize(9);
        doc.text(`${email}  |  ${phone}  |  ${address}`, includePhoto && cvPhotoBase64 ? 50 : 15, 40);
        
        // Ligne noire
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1);
        doc.line(15, 48, 195, 48);
        
        yPosition = 55;
        
    } else {
        // Template Créatif - Bande de couleur à gauche
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(0, 0, 5, 297, 'F');
        
        if (includePhoto && cvPhotoBase64) {
            try {
                doc.addImage(cvPhotoBase64, 'PNG', 15, 15, 30, 30, undefined, 'FAST', 0);
            } catch (e) {
                console.error('Erreur photo:', e);
            }
        }
        
        // Nom avec couleur
        doc.setTextColor(rgb.r, rgb.g, rgb.b);
        doc.setFontSize(26);
        doc.setFont(fontFamily, 'bold');
        doc.text(name, includePhoto && cvPhotoBase64 ? 50 : 15, 25);
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setFont(fontFamily, 'normal');
        doc.text(title, includePhoto && cvPhotoBase64 ? 50 : 15, 33);
        
        doc.setFontSize(9);
        doc.text(`${email}  |  ${phone}  |  ${address}`, includePhoto && cvPhotoBase64 ? 50 : 15, 40);
        
        yPosition = 55;
    }
    
    // RÉSUMÉ
    if (summary) {
        addCVSection(doc, yPosition, 'RÉSUMÉ PROFESSIONNEL', fontFamily, rgb, cvTemplate);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont(fontFamily, 'normal');
        const splitSummary = doc.splitTextToSize(summary, 180);
        doc.text(splitSummary, 15, yPosition);
        yPosition += splitSummary.length * 5 + 10;
    }
    
    // EXPÉRIENCE
    if (experiences.length > 0) {
        if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
        }
        
        addCVSection(doc, yPosition, 'EXPÉRIENCE PROFESSIONNELLE', fontFamily, rgb, cvTemplate);
        yPosition += 10;
        
        experiences.forEach((exp) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(11);
            doc.setFont(fontFamily, 'bold');
            doc.text(exp.title, 15, yPosition);
            
            doc.setFontSize(9);
            doc.setFont(fontFamily, 'normal');
            doc.setTextColor(100, 100, 100);
            yPosition += 5;
            doc.text(`${exp.company} | ${exp.period}`, 15, yPosition);
            
            doc.setTextColor(0, 0, 0);
            yPosition += 6;
            
            if (exp.description) {
                const splitDesc = doc.splitTextToSize(exp.description, 180);
                doc.text(splitDesc, 15, yPosition);
                yPosition += splitDesc.length * 4;
            }
            
            yPosition += 8;
        });
    }
    
    // FORMATION
    if (education.length > 0) {
        if (yPosition > 230) {
            doc.addPage();
            yPosition = 20;
        }
        
        addCVSection(doc, yPosition, 'FORMATION', fontFamily, rgb, cvTemplate);
        yPosition += 10;
        
        education.forEach((edu) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(11);
            doc.setFont(fontFamily, 'bold');
            doc.text(edu.degree, 15, yPosition);
            
            doc.setFontSize(9);
            doc.setFont(fontFamily, 'normal');
            doc.setTextColor(100, 100, 100);
            yPosition += 5;
            doc.text(`${edu.school} | ${edu.period}`, 15, yPosition);
            
            doc.setTextColor(0, 0, 0);
            yPosition += 6;
            
            if (edu.description) {
                const splitDesc = doc.splitTextToSize(edu.description, 180);
                doc.text(splitDesc, 15, yPosition);
                yPosition += splitDesc.length * 4;
            }
            
            yPosition += 8;
        });
    }
    
    // PROJETS
    if (projects.length > 0) {
        if (yPosition > 230) {
            doc.addPage();
            yPosition = 20;
        }
        
        addCVSection(doc, yPosition, 'PROJETS', fontFamily, rgb, cvTemplate);
        yPosition += 10;
        
        projects.forEach((project) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(11);
            doc.setFont(fontFamily, 'bold');
            doc.text(project.title, 15, yPosition);
            
            doc.setFontSize(9);
            doc.setFont(fontFamily, 'normal');
            doc.setTextColor(100, 100, 100);
            yPosition += 5;
            doc.text(`${project.period} | ${project.technologies}`, 15, yPosition);
            
            doc.setTextColor(0, 0, 0);
            yPosition += 6;
            
            if (project.description) {
                const splitDesc = doc.splitTextToSize(project.description, 180);
                doc.text(splitDesc, 15, yPosition);
                yPosition += splitDesc.length * 4;
            }
            
            yPosition += 8;
        });
    }
    
    // COMPÉTENCES
    if (skills) {
        if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
        }
        
        addCVSection(doc, yPosition, 'COMPÉTENCES', fontFamily, rgb, cvTemplate);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont(fontFamily, 'normal');
        const splitSkills = doc.splitTextToSize(skills, 180);
        doc.text(splitSkills, 15, yPosition);
        yPosition += splitSkills.length * 5 + 10;
    }
    
    // LANGUES
    if (languages) {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }
        
        addCVSection(doc, yPosition, 'LANGUES', fontFamily, rgb, cvTemplate);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont(fontFamily, 'normal');
        const splitLang = doc.splitTextToSize(languages, 180);
        doc.text(splitLang, 15, yPosition);
    }
    
    // Télécharger
    const fileName = `CV-${name.replace(/\s+/g, '-')}.pdf`;
    doc.save(fileName);
    
    console.log('CV PDF généré !');
    showNotification('CV PDF généré avec succès !');
}

function addCVSection(doc, y, title, font, rgb, template) {
    if (template === 'classic') {
        // Template classique - fond noir
        doc.setFillColor(0, 0, 0);
        doc.rect(15, y - 5, 180, 8, 'F');
        
        doc.setFontSize(12);
        doc.setFont(font, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(title, 17, y);
        doc.setTextColor(0, 0, 0);
    } else if (template === 'creative') {
        // Template créatif - barre de couleur à gauche
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(10, y - 5, 4, 8, 'F');
        
        doc.setFontSize(12);
        doc.setFont(font, 'bold');
        doc.setTextColor(rgb.r, rgb.g, rgb.b);
        doc.text(title, 17, y);
        doc.setTextColor(0, 0, 0);
    } else {
        // Template moderne - ligne de couleur
        doc.setFontSize(12);
        doc.setFont(font, 'bold');
        doc.setTextColor(rgb.r, rgb.g, rgb.b);
        doc.text(title, 15, y);
        
        doc.setDrawColor(rgb.r, rgb.g, rgb.b);
        doc.setLineWidth(0.5);
        doc.line(15, y + 2, 195, y + 2);
        
        doc.setTextColor(0, 0, 0);
    }
}

// ========================================
// ÉTAPE 14: FULLSCREEN PREVIEW
// ========================================

function openFullscreenPreview(type) {
    const modal = document.getElementById('fullscreen-modal');
    const content = document.getElementById('fullscreen-content');
    const title = document.getElementById('fullscreen-title');
    
    if (type === 'invoice') {
        title.textContent = 'Prévisualisation - Facture';
        const previewContent = document.querySelector('#invoice-preview .preview-content');
        content.innerHTML = previewContent.outerHTML;
    } else {
        title.textContent = 'Prévisualisation - CV';
        const previewContent = document.querySelector('#cv-preview .cv-preview-content');
        content.innerHTML = previewContent.outerHTML;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFullscreenPreview() {
    const modal = document.getElementById('fullscreen-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Fermer avec Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeFullscreenPreview();
    }
});

// ========================================
// ÉTAPE 15: UTILITAIRES
// ========================================

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 99, g: 102, b: 241 };
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animations
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