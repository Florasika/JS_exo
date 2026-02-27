// ========================================
// VARIABLES GLOBALES
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
let cvPhotoPosition = 'left';

// ========================================
// INITIALISATION
// ========================================

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
// SETUP TABS
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
// COLOR PICKERS
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
// FILE UPLOADS
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
// FACTURE - GESTION ARTICLES
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
// FACTURE - PRÉVISUALISATION
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
// FACTURE - GÉNÉRATION PDF
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
    
    let yPos = 20;
    
    // HEADER SANS FOND COLORÉ - comme la prévisualisation
    
    // Logo si présent (à gauche)
    if (companyLogoBase64) {
        try {
            doc.addImage(companyLogoBase64, 'PNG', 15, 15, 30, 30);
        } catch (e) {
            console.error('Erreur logo:', e);
        }
    }
    
    // Nom de l'entreprise avec couleur (à gauche, après le logo)
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(companyName, companyLogoBase64 ? 50 : 15, 22);
    
    // Informations entreprise (noir)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(companyAddress, companyLogoBase64 ? 50 : 15, 28);
    doc.text(`${companyZip} ${companyCity}`, companyLogoBase64 ? 50 : 15, 33);
    
    // Titre FACTURE à droite
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('FACTURE', 195, 22, { align: 'right' });
    
    // Numéro et date à droite
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`N° ${invoiceNumber}`, 195, 30, { align: 'right' });
    doc.text(`Date: ${new Date(invoiceDate).toLocaleDateString('fr-FR')}`, 195, 36, { align: 'right' });
    
    // Ligne de séparation colorée
    doc.setDrawColor(rgb.r, rgb.g, rgb.b);
    doc.setLineWidth(1);
    doc.line(15, 50, 195, 50);
    
    yPos = 60;
    
    // OBJET ET CLIENT SUR MÊME LIGNE
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    
    // Objet (à gauche)
    doc.text('Objet:', 15, yPos);
    doc.setFont(undefined, 'normal');
    const splitSubject = doc.splitTextToSize(invoiceSubject, 75);
    doc.text(splitSubject, 15, yPos + 5);
    
    // Client (à droite)
    doc.setFont(undefined, 'bold');
    doc.text('Client:', 110, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(clientName, 110, yPos + 5);
    doc.text(clientAddress, 110, yPos + 10);
    doc.text(`${clientZip} ${clientCity}`, 110, yPos + 15);
    
    yPos += Math.max(splitSubject.length * 5, 20) + 10;
    
    // SIRET
    doc.setFontSize(8);
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
            fontSize: 10
        },
        styles: {
            fontSize: 9,
            cellPadding: 4
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
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Total HT:', 140, finalY);
    doc.text(`${totals.totalHT}€`, 190, finalY, { align: 'right' });
    
    doc.text('TVA (20%):', 140, finalY + 6);
    doc.text(`${totals.tva}€`, 190, finalY + 6, { align: 'right' });
    
    // Total TTC avec couleur
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text('Total TTC:', 140, finalY + 14);
    doc.text(`${totals.totalTTC}€`, 190, finalY + 14, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    
    // NOTES
    if (invoiceNotes) {
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        
        const notesY = finalY + 28;
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
        doc.setFont(undefined, 'normal');
        doc.text(`A ${invoiceLocation}, le ${formattedDate}`, 140, signatureY);
        
        if (signatureBase64) {
            try {
                doc.addImage(signatureBase64, 'PNG', 140, signatureY + 5, 40, 20);
            } catch (e) {
                console.error('Erreur signature:', e);
            }
        } else {
            doc.setFont(undefined, 'italic');
            doc.text('Signature', 140, signatureY + 15);
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
// CV - GESTION EXPÉRIENCES
// ========================================

function addExperience() {
    experienceCount++;
    const container = document.getElementById('cv-experiences');
    
    const div = document.createElement('div');
    div.className = 'experience-item';
    div.id = `experience-${experienceCount}`;
    
    const defaultData = experienceCount === 1 ? {
        title: 'Développeur Full Stack Senior',
        company: 'TechCorp International',
        period: 'Jan 2020 - Présent',
        description: '• Développement et maintenance d\'applications web scalables avec React et Node.js\n• Collaboration avec une équipe de 8 développeurs en méthodologie Agile\n• Réduction du temps de chargement de 40% grâce à l\'optimisation du code\n• Mise en place de tests automatisés augmentant la couverture de code à 85%'
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
            <label>Titre du poste</label>
            <input type="text" class="form-input cv-exp-title" 
                   value="${defaultData.title}"
                   data-exp-id="${experienceCount}"
                   placeholder="Ex: Développeur Full Stack Senior">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Entreprise</label>
                <input type="text" class="form-input cv-exp-company" 
                       value="${defaultData.company}"
                       data-exp-id="${experienceCount}"
                       placeholder="Nom de l'entreprise">
            </div>
            <div class="form-group">
                <label>Période</label>
                <input type="text" class="form-input cv-exp-period" 
                       value="${defaultData.period}"
                       placeholder="Jan 2020 - Présent"
                       data-exp-id="${experienceCount}">
            </div>
        </div>
        <div class="form-group">
            <label>Missions et réalisations</label>
            <textarea class="form-input cv-exp-description" rows="5" 
                      data-exp-id="${experienceCount}"
                      placeholder="• Développement de fonctionnalité X qui a permis Y&#10;• Gestion d'une équipe de Z personnes&#10;• Amélioration des performances de 30%">${defaultData.description}</textarea>
            <div class="help-text">Utilisez des bullet points (•) et quantifiez vos résultats</div>
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

// ========================================
// CV - GESTION FORMATION
// ========================================

function addEducation() {
    educationCount++;
    const container = document.getElementById('cv-education');
    
    const div = document.createElement('div');
    div.className = 'education-item';
    div.id = `education-${educationCount}`;
    
    const defaultData = educationCount === 1 ? {
        degree: 'Master en Informatique',
        school: 'Université Paris-Saclay',
        period: '2015 - 2017',
        description: 'Spécialisation en développement web et architecture logicielle'
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
                   data-edu-id="${educationCount}"
                   placeholder="Ex: Master en Informatique">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>École / Université</label>
                <input type="text" class="form-input cv-edu-school" 
                       value="${defaultData.school}"
                       data-edu-id="${educationCount}"
                       placeholder="Nom de l'établissement">
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
                      data-edu-id="${educationCount}"
                      placeholder="Spécialisation, projets importants, mentions...">${defaultData.description}</textarea>
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
// CV - GESTION PROJETS
// ========================================

function addProject() {
    projectCount++;
    const container = document.getElementById('cv-projects');
    
    const div = document.createElement('div');
    div.className = 'project-item';
    div.id = `project-${projectCount}`;
    
    const defaultData = projectCount === 1 ? {
        title: 'Plateforme E-commerce Multivendeurs',
        period: '2023',
        context: 'Projet Freelance',
        technologies: 'React, Node.js, MongoDB, Stripe, AWS S3',
        description: 'Développement d\'une plateforme e-commerce complète permettant à plusieurs vendeurs de gérer leurs boutiques en ligne.',
        achievements: '• Architecture microservices avec 5 services indépendants\n• Intégration de paiements sécurisés via Stripe API\n• Système de gestion des stocks en temps réel avec WebSocket\n• Panel d\'administration avec analytics et graphiques\n• Performance: temps de chargement < 2s, support de 10k+ utilisateurs\n• Acquisition de 1000+ utilisateurs actifs en 3 mois'
    } : {
        title: '',
        period: '',
        context: '',
        technologies: '',
        description: '',
        achievements: ''
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
                   data-project-id="${projectCount}"
                   placeholder="Ex: Application mobile de livraison">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Période</label>
                <input type="text" class="form-input cv-project-period" 
                       value="${defaultData.period}"
                       placeholder="2023 ou Jan 2023 - Mars 2023"
                       data-project-id="${projectCount}">
            </div>
            <div class="form-group">
                <label>Contexte</label>
                <input type="text" class="form-input cv-project-context" 
                       value="${defaultData.context}"
                       placeholder="Personnel / École / Freelance / Entreprise"
                       data-project-id="${projectCount}">
            </div>
        </div>
        <div class="form-group">
            <label>Technologies utilisées</label>
            <input type="text" class="form-input cv-project-technologies" 
                   value="${defaultData.technologies}"
                   placeholder="React, Node.js, MongoDB, Docker, AWS"
                   data-project-id="${projectCount}">
            <div class="help-text">Listez les technologies clés séparées par des virgules</div>
        </div>
        <div class="form-group">
            <label>Description du projet</label>
            <textarea class="form-input cv-project-description" rows="2" 
                      data-project-id="${projectCount}"
                      placeholder="Décrivez brièvement l'objectif et le contexte du projet">${defaultData.description}</textarea>
        </div>
        <div class="form-group">
            <label>Réalisations & Résultats clés</label>
            <textarea class="form-input cv-project-achievements" rows="5" 
                      data-project-id="${projectCount}"
                      placeholder="• Développement de fonctionnalité X qui a permis Y&#10;• Optimisation des performances (+50% de vitesse)&#10;• Mise en place de tests automatisés (95% de couverture)&#10;• Déploiement sur AWS avec CI/CD&#10;• 1000+ utilisateurs en 3 mois">${defaultData.achievements}</textarea>
            <div class="help-text">Commencez chaque ligne par •. Quantifiez les résultats (nombres, pourcentages, délais).</div>
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
        const context = document.querySelector(`.cv-project-context[data-project-id="${projectId}"]`);
        const technologies = document.querySelector(`.cv-project-technologies[data-project-id="${projectId}"]`);
        const description = document.querySelector(`.cv-project-description[data-project-id="${projectId}"]`);
        const achievements = document.querySelector(`.cv-project-achievements[data-project-id="${projectId}"]`);
        
        if (title.value) {
            projects.push({
                title: title.value,
                period: period?.value || '',
                context: context?.value || '',
                technologies: technologies?.value || '',
                description: description?.value || '',
                achievements: achievements?.value || ''
            });
        }
    });
    
    return projects;
}

// ========================================
// CV - SETUP LISTENERS
// ========================================

function setupCVListeners() {
    const fields = [
        'cv-name', 'cv-title', 'cv-email', 'cv-phone', 'cv-address',
        'cv-linkedin', 'cv-website', 'cv-summary', 
        'cv-skills-programming', 'cv-skills-frameworks', 
        'cv-skills-tools', 'cv-skills-methodologies',
        'cv-languages', 'cv-certifications', 'cv-font'
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

// ========================================
// CV - PRÉVISUALISATION
// ========================================

function updateCVPreview() {
    const color = document.getElementById('cv-color').value;
    
    // Appliquer la couleur au nom
    const cvName = document.getElementById('preview-cv-name');
    if (cvName) {
        cvName.style.color = color;
    }
    
    // Appliquer la couleur au header border
    const header = document.querySelector('.cv-ats-header');
    if (header) {
        header.style.borderBottomColor = color;
    }
    
    // Appliquer la couleur aux titres de sections
    const sections = document.querySelectorAll('.cv-ats-section-title');
    sections.forEach(title => {
        title.style.color = color;
    });
    
    // Appliquer la couleur aux catégories de compétences
    const skillCategories = document.querySelectorAll('.cv-ats-skill-category strong');
    skillCategories.forEach(cat => {
        cat.style.color = color;
    });
    
    // Photo
    const includePhoto = document.getElementById('cv-include-photo').checked;
    const photoContainer = document.getElementById('cv-photo-container');
    
    if (includePhoto && cvPhotoBase64) {
        photoContainer.innerHTML = `<img src="${cvPhotoBase64}" alt="Photo">`;
        photoContainer.style.display = 'block';
        
        const photoImg = photoContainer.querySelector('img');
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
    const linkedin = document.getElementById('cv-linkedin').value;
    const website = document.getElementById('cv-website').value;
    
    if (cvName) cvName.textContent = name;
    
    const titleEl = document.getElementById('preview-cv-title');
    if (titleEl) titleEl.textContent = title;
    
    const emailEl = document.getElementById('preview-cv-email');
    if (emailEl) emailEl.textContent = email;
    
    const phoneEl = document.getElementById('preview-cv-phone');
    if (phoneEl) phoneEl.textContent = phone;
    
    const addressEl = document.getElementById('preview-cv-address');
    if (addressEl) addressEl.textContent = address;
    
    const linkedinEl = document.getElementById('preview-cv-linkedin');
    if (linkedinEl) linkedinEl.textContent = linkedin;
    
    const websiteEl = document.getElementById('preview-cv-website');
    if (websiteEl) {
        if (website) {
            websiteEl.textContent = ' | ' + website;
            websiteEl.style.display = 'inline';
        } else {
            websiteEl.style.display = 'none';
        }
    }
    
    // Résumé
    const summary = document.getElementById('cv-summary').value;
    const summaryEl = document.getElementById('preview-cv-summary');
    if (summaryEl) summaryEl.textContent = summary;
    
    // Expériences
    const experiences = getCVExperiences();
    const expContainer = document.getElementById('preview-cv-experiences');
    if (expContainer) {
        expContainer.innerHTML = '';
        
        experiences.forEach(exp => {
            const div = document.createElement('div');
            div.className = 'cv-ats-item';
            div.innerHTML = `
                <div class="cv-ats-item-header">
                    <span class="cv-ats-item-title">${exp.title}</span>
                    <span class="cv-ats-item-period">${exp.period}</span>
                </div>
                <div class="cv-ats-item-subtitle">${exp.company}</div>
                <div class="cv-ats-item-description">${exp.description.replace(/\n/g, '<br>')}</div>
            `;
            expContainer.appendChild(div);
        });
    }
    
    // Formation
    const education = getCVEducation();
    const eduContainer = document.getElementById('preview-cv-education');
    if (eduContainer) {
        eduContainer.innerHTML = '';
        
        education.forEach(edu => {
            const div = document.createElement('div');
            div.className = 'cv-ats-item';
            div.innerHTML = `
                <div class="cv-ats-item-header">
                    <span class="cv-ats-item-title">${edu.degree}</span>
                    <span class="cv-ats-item-period">${edu.period}</span>
                </div>
                <div class="cv-ats-item-subtitle">${edu.school}</div>
                ${edu.description ? `<div class="cv-ats-item-description">${edu.description}</div>` : ''}
            `;
            eduContainer.appendChild(div);
        });
    }
    
    // Projets
    const projects = getCVProjects();
    const projectsContainer = document.getElementById('preview-cv-projects');
    const projectsSection = document.getElementById('cv-projects-section');
    
    if (projectsContainer && projectsSection) {
        if (projects.length > 0) {
            projectsContainer.innerHTML = '';
            projects.forEach(project => {
                const div = document.createElement('div');
                div.className = 'cv-ats-item';
                
                let achievementsList = '';
                if (project.achievements) {
                    const lines = project.achievements.split('\n').filter(line => line.trim());
                    if (lines.length > 0) {
                        achievementsList = '<ul>' + lines.map(line => 
                            `<li>${line.replace(/^[•\-]\s*/, '').trim()}</li>`
                        ).join('') + '</ul>';
                    }
                }
                
                div.innerHTML = `
                    <div class="cv-ats-item-header">
                        <span class="cv-ats-item-title">${project.title}</span>
                        <span class="cv-ats-item-period">${project.period}</span>
                    </div>
                    ${project.context ? `<div class="cv-ats-item-subtitle">${project.context}</div>` : ''}
                    <div class="cv-ats-item-description">
                        <strong>Technologies:</strong> ${project.technologies}<br>
                        ${project.description}
                        ${achievementsList}
                    </div>
                `;
                projectsContainer.appendChild(div);
            });
            projectsSection.style.display = 'block';
        } else {
            projectsSection.style.display = 'none';
        }
    }
    
    // Compétences
    const skillsProgramming = document.getElementById('cv-skills-programming').value;
    const skillsFrameworks = document.getElementById('cv-skills-frameworks').value;
    const skillsTools = document.getElementById('cv-skills-tools').value;
    const skillsMethodologies = document.getElementById('cv-skills-methodologies').value;
    
    const skillsContainer = document.getElementById('preview-cv-skills');
    if (skillsContainer) {
        skillsContainer.innerHTML = `
            <div class="cv-ats-skills-grid">
                ${skillsProgramming ? `<div class="cv-ats-skill-category"><strong>Langages:</strong> <span>${skillsProgramming}</span></div>` : ''}
                ${skillsFrameworks ? `<div class="cv-ats-skill-category"><strong>Frameworks:</strong> <span>${skillsFrameworks}</span></div>` : ''}
                ${skillsTools ? `<div class="cv-ats-skill-category"><strong>Outils:</strong> <span>${skillsTools}</span></div>` : ''}
                ${skillsMethodologies ? `<div class="cv-ats-skill-category"><strong>Méthodologies:</strong> <span>${skillsMethodologies}</span></div>` : ''}
            </div>
        `;
    }
    
    // Langues
    const languages = document.getElementById('cv-languages').value;
    const languagesEl = document.getElementById('preview-cv-languages');
    if (languagesEl) languagesEl.textContent = languages;
    
    // Certifications
    const certifications = document.getElementById('cv-certifications').value;
    const certificationsEl = document.getElementById('preview-cv-certifications');
    const certificationsSection = document.getElementById('cv-certifications-section');
    
    if (certificationsEl && certificationsSection) {
        if (certifications && certifications.trim()) {
            certificationsEl.innerHTML = certifications.split('\n').filter(c => c.trim()).map(cert => 
                `• ${cert.trim()}`
            ).join('<br>');
            certificationsSection.style.display = 'block';
        } else {
            certificationsSection.style.display = 'none';
        }
    }
}

// ========================================
// CV - OPTIONS PHOTO
// ========================================

function togglePhotoOptions() {
    const includePhoto = document.getElementById('cv-include-photo').checked;
    const photoOptions = document.getElementById('photo-options');
    
    if (includePhoto) {
        photoOptions.style.display = 'block';
    } else {
        photoOptions.style.display = 'none';
        const photoContainer = document.getElementById('cv-photo-container');
        if (photoContainer) {
            photoContainer.style.display = 'none';
        }
    }
    
    updateCVPreview();
}

function selectPhotoPosition(position) {
    cvPhotoPosition = position;
    
    document.querySelectorAll('.position-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const selectedBtn = document.querySelector(`[data-position="${position}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    updateCVPreview();
}

// ========================================
// CV - GÉNÉRATION PDF OPTIMISÉ ATS
// ========================================

function generateCVPDF() {
    console.log('Génération du CV PDF optimisé ATS...');
    
    const { jsPDF } = window.jspdf;
    
    const fontFamily = document.getElementById('cv-font').value;
    const doc = new jsPDF({
        unit: 'mm',
        format: 'a4'
    });
    
    doc.setFont(fontFamily);
    
    // Récupérer les données
    const name = document.getElementById('cv-name').value;
    const title = document.getElementById('cv-title').value;
    const email = document.getElementById('cv-email').value;
    const phone = document.getElementById('cv-phone').value;
    const address = document.getElementById('cv-address').value;
    const linkedin = document.getElementById('cv-linkedin').value;
    const website = document.getElementById('cv-website').value;
    const summary = document.getElementById('cv-summary').value;
    
    const skillsProgramming = document.getElementById('cv-skills-programming').value;
    const skillsFrameworks = document.getElementById('cv-skills-frameworks').value;
    const skillsTools = document.getElementById('cv-skills-tools').value;
    const skillsMethodologies = document.getElementById('cv-skills-methodologies').value;
    
    const languages = document.getElementById('cv-languages').value;
    const certifications = document.getElementById('cv-certifications').value;
    
    const color = document.getElementById('cv-color').value;
    const rgb = hexToRgb(color);
    
    const experiences = getCVExperiences();
    const education = getCVEducation();
    const projects = getCVProjects();
    
    const includePhoto = document.getElementById('cv-include-photo').checked;
    
    let yPosition = 20;
    const pageWidth = 210;
    const leftMargin = 20;
    const rightMargin = 20;
    const contentWidth = pageWidth - leftMargin - rightMargin;
    
    // HEADER
    if (includePhoto && cvPhotoBase64) {
        try {
            doc.addImage(cvPhotoBase64, 'PNG', 85, yPosition, 25, 25, undefined, 'FAST', 0);
            yPosition += 30;
        } catch (e) {
            console.error('Erreur photo:', e);
        }
    }
    
    // Nom
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.setFontSize(20);
    doc.setFont(fontFamily, 'bold');
    doc.text(name.toUpperCase(), pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    
    // Titre
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(12);
    doc.setFont(fontFamily, 'normal');
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 7;
    
    // Contact
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    let contactLine = `${email} | ${phone} | ${address}`;
    doc.text(contactLine, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    
    // Liens
    let linksLine = linkedin;
    if (website) {
        linksLine += ` | ${website}`;
    }
    if (linksLine) {
        doc.setTextColor(0, 102, 204);
        doc.text(linksLine, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 5;
    }
    
    // Ligne de séparation
    doc.setDrawColor(rgb.r, rgb.g, rgb.b);
    doc.setLineWidth(0.5);
    doc.line(leftMargin, yPosition, pageWidth - rightMargin, yPosition);
    yPosition += 8;
    
    doc.setTextColor(0, 0, 0);
    
    // RÉSUMÉ
    if (summary) {
        yPosition = addATSSection(doc, 'RÉSUMÉ PROFESSIONNEL', yPosition, fontFamily, rgb);
        
        doc.setFontSize(10);
        doc.setFont(fontFamily, 'normal');
        const splitSummary = doc.splitTextToSize(summary, contentWidth);
        doc.text(splitSummary, leftMargin, yPosition);
        yPosition += splitSummary.length * 5 + 8;
    }
    
    // EXPÉRIENCE
    if (experiences.length > 0) {
        if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
        }
        
        yPosition = addATSSection(doc, 'EXPÉRIENCE PROFESSIONNELLE', yPosition, fontFamily, rgb);
        
        experiences.forEach((exp) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(11);
            doc.setFont(fontFamily, 'bold');
            doc.text(exp.title, leftMargin, yPosition);
            
            doc.setFont(fontFamily, 'italic');
            doc.setTextColor(100, 100, 100);
            const periodWidth = doc.getTextWidth(exp.period);
            doc.text(exp.period, pageWidth - rightMargin - periodWidth, yPosition);
            doc.setTextColor(0, 0, 0);
            
            yPosition += 6;
            
            doc.setFontSize(10);
            doc.setFont(fontFamily, 'normal');
            doc.text(exp.company, leftMargin, yPosition);
            yPosition += 6;
            
            if (exp.description) {
                doc.setFontSize(10);
                const lines = exp.description.split('\n').filter(line => line.trim());
                
                lines.forEach(line => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    
                    const cleanLine = line.replace(/^[•\-]\s*/, '').trim();
                    
                    if (cleanLine) {
                        doc.text('•', leftMargin + 2, yPosition);
                        const splitLine = doc.splitTextToSize(cleanLine, contentWidth - 8);
                        doc.text(splitLine, leftMargin + 6, yPosition);
                        yPosition += splitLine.length * 5;
                    }
                });
            }
            
            yPosition += 6;
        });
    }
    
    // FORMATION
    if (education.length > 0) {
        if (yPosition > 230) {
            doc.addPage();
            yPosition = 20;
        }
        
        yPosition = addATSSection(doc, 'FORMATION', yPosition, fontFamily, rgb);
        
        education.forEach((edu) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(11);
            doc.setFont(fontFamily, 'bold');
            doc.text(edu.degree, leftMargin, yPosition);
            
            doc.setFont(fontFamily, 'italic');
            doc.setTextColor(100, 100, 100);
            const periodWidth = doc.getTextWidth(edu.period);
            doc.text(edu.period, pageWidth - rightMargin - periodWidth, yPosition);
            doc.setTextColor(0, 0, 0);
            
            yPosition += 6;
            
            doc.setFontSize(10);
            doc.setFont(fontFamily, 'normal');
            doc.text(edu.school, leftMargin, yPosition);
            yPosition += 6;
            
            if (edu.description) {
                const splitDesc = doc.splitTextToSize(edu.description, contentWidth);
                doc.text(splitDesc, leftMargin, yPosition);
                yPosition += splitDesc.length * 5;
            }
            
            yPosition += 6;
        });
    }
    
    // PROJETS
    if (projects.length > 0) {
        if (yPosition > 220) {
            doc.addPage();
            yPosition = 20;
        }
        
        yPosition = addATSSection(doc, 'PROJETS CLÉS', yPosition, fontFamily, rgb);
        
        projects.forEach((project) => {
            if (yPosition > 240) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(11);
            doc.setFont(fontFamily, 'bold');
            doc.text(project.title, leftMargin, yPosition);
            
            if (project.period) {
                doc.setFont(fontFamily, 'italic');
                doc.setTextColor(100, 100, 100);
                const periodWidth = doc.getTextWidth(project.period);
                doc.text(project.period, pageWidth - rightMargin - periodWidth, yPosition);
                doc.setTextColor(0, 0, 0);
            }
            
            yPosition += 6;
            
            if (project.context) {
                doc.setFontSize(10);
                doc.setFont(fontFamily, 'normal');
                doc.text(project.context, leftMargin, yPosition);
                yPosition += 5;
            }
            
            if (project.technologies) {
                doc.setFontSize(10);
                doc.setFont(fontFamily, 'bold');
                doc.text('Technologies: ', leftMargin, yPosition);
                doc.setFont(fontFamily, 'normal');
                const techText = doc.splitTextToSize(project.technologies, contentWidth - 30);
                doc.text(techText, leftMargin + 30, yPosition);
                yPosition += techText.length * 5;
            }
            
            if (project.description) {
                doc.setFontSize(10);
                doc.setFont(fontFamily, 'normal');
                const splitDesc = doc.splitTextToSize(project.description, contentWidth);
                doc.text(splitDesc, leftMargin, yPosition);
                yPosition += splitDesc.length * 5 + 2;
            }
            
            if (project.achievements) {
                const lines = project.achievements.split('\n').filter(line => line.trim());
                
                lines.forEach(line => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    
                    const cleanLine = line.replace(/^[•\-]\s*/, '').trim();
                    
                    if (cleanLine) {
                        doc.text('•', leftMargin + 2, yPosition);
                        const splitLine = doc.splitTextToSize(cleanLine, contentWidth - 8);
                        doc.text(splitLine, leftMargin + 6, yPosition);
                        yPosition += splitLine.length * 5;
                    }
                });
            }
            
            yPosition += 6;
        });
    }
    
    // COMPÉTENCES
    const hasSkills = skillsProgramming || skillsFrameworks || skillsTools || skillsMethodologies;
    
    if (hasSkills) {
        if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
        }
        
        yPosition = addATSSection(doc, 'COMPÉTENCES TECHNIQUES', yPosition, fontFamily, rgb);
        
        doc.setFontSize(10);
        
        if (skillsProgramming) {
            doc.setFont(fontFamily, 'bold');
            doc.text('Langages: ', leftMargin, yPosition);
            doc.setFont(fontFamily, 'normal');
            const skillsText = doc.splitTextToSize(skillsProgramming, contentWidth - 25);
            doc.text(skillsText, leftMargin + 25, yPosition);
            yPosition += skillsText.length * 5 + 2;
        }
        
        if (skillsFrameworks) {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFont(fontFamily, 'bold');
            doc.text('Frameworks: ', leftMargin, yPosition);
            doc.setFont(fontFamily, 'normal');
            const skillsText = doc.splitTextToSize(skillsFrameworks, contentWidth - 30);
            doc.text(skillsText, leftMargin + 30, yPosition);
            yPosition += skillsText.length * 5 + 2;
        }
        
        if (skillsTools) {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFont(fontFamily, 'bold');
            doc.text('Outils: ', leftMargin, yPosition);
            doc.setFont(fontFamily, 'normal');
            const skillsText = doc.splitTextToSize(skillsTools, contentWidth - 20);
            doc.text(skillsText, leftMargin + 20, yPosition);
            yPosition += skillsText.length * 5 + 2;
        }
        
        if (skillsMethodologies) {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFont(fontFamily, 'bold');
            doc.text('Méthodologies: ', leftMargin, yPosition);
            doc.setFont(fontFamily, 'normal');
            const skillsText = doc.splitTextToSize(skillsMethodologies, contentWidth - 35);
            doc.text(skillsText, leftMargin + 35, yPosition);
            yPosition += skillsText.length * 5 + 2;
        }
        
        yPosition += 6;
    }
    
    // LANGUES
    if (languages && languages.trim()) {
        if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
        }
        
        yPosition = addATSSection(doc, 'LANGUES', yPosition, fontFamily, rgb);
        
        doc.setFontSize(10);
        doc.setFont(fontFamily, 'normal');
        const splitLang = doc.splitTextToSize(languages, contentWidth);
        doc.text(splitLang, leftMargin, yPosition);
        yPosition += splitLang.length * 5 + 8;
    }
    
    // CERTIFICATIONS
    if (certifications && certifications.trim()) {
        if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
        }
        
        yPosition = addATSSection(doc, 'CERTIFICATIONS', yPosition, fontFamily, rgb);
        
        doc.setFontSize(10);
        doc.setFont(fontFamily, 'normal');
        
        const certLines = certifications.split('\n').filter(line => line.trim());
        certLines.forEach(cert => {
            if (yPosition > 280) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text('•  ' + cert.trim(), leftMargin, yPosition);
            yPosition += 5;
        });
    }
    
    const fileName = `CV-${name.replace(/\s+/g, '-')}-ATS.pdf`;
    doc.save(fileName);
    
    console.log('CV PDF ATS généré !');
    showNotification('CV PDF optimisé ATS généré avec succès !');
}

function addATSSection(doc, title, yPosition, fontFamily, rgb) {
    doc.setFontSize(12);
    doc.setFont(fontFamily, 'bold');
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text(title, 20, yPosition);
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(20, yPosition + 1, 190, yPosition + 1);
    
    doc.setTextColor(0, 0, 0);
    
    return yPosition + 8;
}

// ========================================
// FULLSCREEN PREVIEW
// ========================================

function openFullscreenPreview(type) {
    const modal = document.getElementById('fullscreen-modal');
    const content = document.getElementById('fullscreen-content');
    const title = document.getElementById('fullscreen-title');
    
    if (type === 'invoice') {
        title.textContent = 'Prévisualisation - Facture';
        const previewContent = document.querySelector('#invoice-preview .preview-content');
        if (previewContent) {
            content.innerHTML = previewContent.outerHTML;
        }
    } else {
        title.textContent = 'Prévisualisation - CV';
        const previewContent = document.querySelector('#cv-preview .cv-preview-content-ats');
        if (previewContent) {
            content.innerHTML = previewContent.outerHTML;
        }
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFullscreenPreview() {
    const modal = document.getElementById('fullscreen-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeFullscreenPreview();
    }
});

// ========================================
// UTILITAIRES
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