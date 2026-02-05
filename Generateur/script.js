// ========================================
// ÉTAPE 1: INITIALISATION & TABS
// ========================================

let invoiceItemCount = 0;
let experienceCount = 0;
let educationCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Initialisation du générateur de PDF...');
    
    // Setup tabs
    setupTabs();
    
    // Initialiser la date du jour
    document.getElementById('invoice-date').value = new Date().toISOString().split('T')[0];
    
    // Ajouter les articles initiaux
    addInvoiceItem();
    addInvoiceItem();
    
    // Ajouter les expériences initiales
    addExperience();
    addEducation();
    
    // Setup listeners pour la prévisualisation en temps réel
    setupInvoiceListeners();
    setupCVListeners();
    
    console.log('✅ Générateur prêt !');
});

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Désactiver tous les tabs
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            
            // Activer le tab sélectionné
            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

// ========================================
// ÉTAPE 2: GESTION DES ARTICLES (FACTURE)
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
                🗑️ Supprimer
            </button>
        </div>
        <div class="form-group">
            <label>Description</label>
            <input type="text" 
                   class="form-input invoice-item-description" 
                   placeholder="Développement web"
                   value="${invoiceItemCount === 1 ? 'Développement web' : ''}"
                   data-item-id="${invoiceItemCount}">
        </div>
        <div class="form-row">
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
        </div>
    `;
    
    container.appendChild(itemDiv);
    
    // Ajouter les listeners
    const inputs = itemDiv.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('input', updateInvoicePreview);
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

// ========================================
// ÉTAPE 3: CALCULS FACTURE
// ========================================

function getInvoiceItems() {
    const items = [];
    const descriptions = document.querySelectorAll('.invoice-item-description');
    
    descriptions.forEach(desc => {
        const itemId = desc.dataset.itemId;
        const quantity = document.querySelector(`.invoice-item-quantity[data-item-id="${itemId}"]`);
        const price = document.querySelector(`.invoice-item-price[data-item-id="${itemId}"]`);
        
        if (desc.value && quantity && price) {
            items.push({
                description: desc.value,
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
    
    const tva = totalHT * 0.20; // TVA à 20%
    const totalTTC = totalHT + tva;
    
    return {
        totalHT: totalHT.toFixed(2),
        tva: tva.toFixed(2),
        totalTTC: totalTTC.toFixed(2)
    };
}

// ========================================
// ÉTAPE 4: PRÉVISUALISATION FACTURE
// ========================================

function setupInvoiceListeners() {
    const fields = [
        'company-name', 'company-address', 'company-zip', 'company-city',
        'company-email', 'company-phone', 'company-siret',
        'client-name', 'client-address', 'client-zip', 'client-city',
        'invoice-number', 'invoice-date', 'invoice-notes'
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
    // Informations entreprise
    const companyName = document.getElementById('company-name').value;
    const companyAddress = document.getElementById('company-address').value;
    const companyZip = document.getElementById('company-zip').value;
    const companyCity = document.getElementById('company-city').value;
    
    document.getElementById('preview-company-name').textContent = companyName;
    document.getElementById('preview-company-address').innerHTML = 
        `${companyAddress}<br>${companyZip} ${companyCity}`;
    
    // Numéro facture
    const invoiceNumber = document.getElementById('invoice-number').value;
    document.getElementById('preview-invoice-number').textContent = `N° ${invoiceNumber}`;
    
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
    document.getElementById('preview-total-ttc').textContent = totals.totalTTC + '€';
}

// ========================================
// ÉTAPE 5: GÉNÉRATION PDF FACTURE
// ========================================

function generateInvoicePDF() {
    console.log('📥 Génération de la facture PDF...');
    
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
    
    const items = getInvoiceItems();
    const totals = calculateInvoiceTotals();
    
    // === HEADER ===
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Entreprise
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(companyName, 15, 15);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(companyAddress, 15, 22);
    doc.text(`${companyZip} ${companyCity}`, 15, 27);
    doc.text(companyEmail, 15, 32);
    doc.text(companyPhone, 15, 37);
    
    // Titre FACTURE
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('FACTURE', 210 - 15, 20, { align: 'right' });
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`N° ${invoiceNumber}`, 210 - 15, 28, { align: 'right' });
    doc.text(`Date: ${new Date(invoiceDate).toLocaleDateString('fr-FR')}`, 210 - 15, 35, { align: 'right' });
    
    // Reset couleur
    doc.setTextColor(0, 0, 0);
    
    // === CLIENT ===
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('CLIENT:', 15, 55);
    
    doc.setFont(undefined, 'normal');
    doc.text(clientName, 15, 62);
    doc.text(clientAddress, 15, 68);
    doc.text(`${clientZip} ${clientCity}`, 15, 74);
    
    // SIRET
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`SIRET: ${companySiret}`, 15, 85);
    doc.setTextColor(0, 0, 0);
    
    // === TABLEAU DES ARTICLES ===
    const tableData = items.map(item => [
        item.description,
        item.quantity.toString(),
        `${item.price.toFixed(2)}€`,
        `${(item.quantity * item.price).toFixed(2)}€`
    ]);
    
    doc.autoTable({
        startY: 95,
        head: [['Description', 'Quantité', 'Prix HT', 'Total HT']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [99, 102, 241],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 11
        },
        styles: {
            fontSize: 10,
            cellPadding: 5
        },
        columnStyles: {
            0: { cellWidth: 90 },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' }
        }
    });
    
    // === TOTAUX ===
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFontSize(11);
    doc.text('Total HT:', 140, finalY);
    doc.text(`${totals.totalHT}€`, 190, finalY, { align: 'right' });
    
    doc.text('TVA (20%):', 140, finalY + 7);
    doc.text(`${totals.tva}€`, 190, finalY + 7, { align: 'right' });
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(13);
    doc.text('Total TTC:', 140, finalY + 15);
    doc.text(`${totals.totalTTC}€`, 190, finalY + 15, { align: 'right' });
    
    // === NOTES ===
    if (invoiceNotes) {
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        
        const notesY = finalY + 30;
        doc.text('Notes:', 15, notesY);
        
        const splitNotes = doc.splitTextToSize(invoiceNotes, 180);
        doc.text(splitNotes, 15, notesY + 5);
    }
    
    // === FOOTER ===
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
        `${companyName} - ${companyAddress}, ${companyZip} ${companyCity}`,
        105,
        285,
        { align: 'center' }
    );
    doc.text(`SIRET: ${companySiret}`, 105, 290, { align: 'center' });
    
    // Télécharger
    doc.save(`Facture-${invoiceNumber}.pdf`);
    
    console.log('✅ Facture PDF générée !');
    showNotification('✅ Facture PDF générée avec succès !');
}

// ========================================
// ÉTAPE 6: GESTION CV - EXPÉRIENCES
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
                🗑️ Supprimer
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
    
    // Listeners
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
// ÉTAPE 7: GESTION CV - FORMATION
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
                🗑️ Supprimer
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
    
    // Listeners
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
// ÉTAPE 8: PRÉVISUALISATION CV
// ========================================

function setupCVListeners() {
    const fields = [
        'cv-name', 'cv-title', 'cv-email', 'cv-phone', 'cv-address',
        'cv-linkedin', 'cv-summary', 'cv-skills', 'cv-languages'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', updateCVPreview);
        }
    });
    
    updateCVPreview();
}

function updateCVPreview() {
    // Informations personnelles
    const name = document.getElementById('cv-name').value;
    const title = document.getElementById('cv-title').value;
    const email = document.getElementById('cv-email').value;
    const phone = document.getElementById('cv-phone').value;
    const address = document.getElementById('cv-address').value;
    
    document.getElementById('preview-cv-name').textContent = name;
    document.getElementById('preview-cv-title').textContent = title;
    document.getElementById('preview-cv-contact').textContent = 
        `📧 ${email} | 📱 ${phone} | 📍 ${address}`;
    
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
    
    // Compétences
    const skills = document.getElementById('cv-skills').value;
    document.getElementById('preview-cv-skills').textContent = skills;
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
// ÉTAPE 9: GÉNÉRATION PDF CV
// ========================================

function generateCVPDF() {
    console.log('📥 Génération du CV PDF...');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
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
    
    const experiences = getCVExperiences();
    const education = getCVEducation();
    
    let yPosition = 20;
    
    // === HEADER ===
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text(name, 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(title, 105, 30, { align: 'center' });
    
    doc.setFontSize(9);
    doc.text(`📧 ${email}  |  📱 ${phone}  |  📍 ${address}`, 105, 38, { align: 'center' });
    
    if (linkedin) {
        doc.text(`🔗 ${linkedin}`, 105, 44, { align: 'center' });
    }
    
    yPosition = 60;
    doc.setTextColor(0, 0, 0);
    
    // === RÉSUMÉ ===
    if (summary) {
        addSection(doc, yPosition, 'RÉSUMÉ PROFESSIONNEL');
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const splitSummary = doc.splitTextToSize(summary, 180);
        doc.text(splitSummary, 15, yPosition);
        yPosition += splitSummary.length * 5 + 10;
    }
    
    // === EXPÉRIENCE ===
    if (experiences.length > 0) {
        addSection(doc, yPosition, 'EXPÉRIENCE PROFESSIONNELLE');
        yPosition += 10;
        
        experiences.forEach((exp, index) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text(exp.title, 15, yPosition);
            
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
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
    
    // === FORMATION ===
    if (education.length > 0) {
        if (yPosition > 230) {
            doc.addPage();
            yPosition = 20;
        }
        
        addSection(doc, yPosition, 'FORMATION');
        yPosition += 10;
        
        education.forEach((edu, index) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text(edu.degree, 15, yPosition);
            
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
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
    
    // === COMPÉTENCES ===
    if (skills) {
        if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
        }
        
        addSection(doc, yPosition, 'COMPÉTENCES');
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const splitSkills = doc.splitTextToSize(skills, 180);
        doc.text(splitSkills, 15, yPosition);
        yPosition += splitSkills.length * 5 + 10;
    }
    
    // === LANGUES ===
    if (languages) {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }
        
        addSection(doc, yPosition, 'LANGUES');
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const splitLang = doc.splitTextToSize(languages, 180);
        doc.text(splitLang, 15, yPosition);
    }
    
    // Télécharger
    const fileName = `CV-${name.replace(/\s+/g, '-')}.pdf`;
    doc.save(fileName);
    
    console.log('✅ CV PDF généré !');
    showNotification('✅ CV PDF généré avec succès !');
}

function addSection(doc, y, title) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text(title, 15, y);
    
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(15, y + 2, 195, y + 2);
    
    doc.setTextColor(0, 0, 0);
}

// ========================================
// ÉTAPE 10: NOTIFICATIONS
// ========================================

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

// Ajouter les animations
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