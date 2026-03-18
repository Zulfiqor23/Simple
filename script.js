// ===== CONFIGURATION =====
const TELEGRAM_USERNAME = 'Bazis_proyekt';
const TOTAL_STEPS = 5;
let currentStep = 1;
const fileStore = {};

// ===== STEP NAVIGATION =====
function showStep(n) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const target = document.querySelector(`.step[data-step="${n}"]`);
    if (target) target.classList.add('active');

    document.getElementById('progressFill').style.width = `${(n / TOTAL_STEPS) * 100}%`;

    document.querySelectorAll('.dot').forEach(d => {
        const s = +d.dataset.step;
        d.classList.remove('active', 'done');
        if (s === n) d.classList.add('active');
        else if (s < n) d.classList.add('done');
    });
    document.querySelectorAll('.progress-labels span').forEach((l, i) => {
        l.classList.remove('active', 'done');
        if (i + 1 === n) l.classList.add('active');
        else if (i + 1 < n) l.classList.add('done');
    });

    if (n === TOTAL_STEPS) {
        buildSummary();
        // Show share button if files exist
        const hasFiles = getAllFiles().length > 0;
        document.getElementById('shareFilesBtn').style.display = hasFiles ? 'block' : 'none';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goNext() {
    if (currentStep === 1) {
        const name = document.getElementById('fName');
        const phone = document.getElementById('fPhone');
        if (!name.value.trim()) { shake(name); return; }
        const digits = phone.value.replace(/\D/g, '');
        if (digits.length < 12) { shake(phone); return; }
    }
    if (currentStep === 2) {
        const sel = document.querySelectorAll('#mebelTypeGroup .chip.selected');
        if (!sel.length) {
            document.getElementById('mebelTypeGroup').scrollIntoView({ behavior: 'smooth' });
            return;
        }
    }
    if (currentStep < TOTAL_STEPS) { currentStep++; showStep(currentStep); }
}
function goPrev() {
    if (currentStep > 1) { currentStep--; showStep(currentStep); }
}

function shake(el) {
    el.style.borderColor = 'var(--danger)';
    el.style.animation = 'shakeX 0.4s ease';
    el.focus();
    setTimeout(() => { el.style.borderColor = ''; el.style.animation = ''; }, 600);
}
const ss = document.createElement('style');
ss.textContent = `@keyframes shakeX{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`;
document.head.appendChild(ss);

// Dot click
document.querySelectorAll('.dot').forEach(d => {
    d.addEventListener('click', () => {
        const target = +d.dataset.step;
        if (target <= currentStep) { currentStep = target; showStep(currentStep); }
    });
});

// ===== CHIP GROUPS =====
document.querySelectorAll('.chip-group').forEach(group => {
    const isSingle = group.classList.contains('single');
    group.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            if (isSingle) {
                group.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
                chip.classList.toggle('selected');
            } else {
                chip.classList.toggle('selected');
            }
            updateConditionals();
        });
    });
});

// ===== CONDITIONAL FIELDS =====
function updateConditionals() {
    const selectedTypes = getChipValues('mebelTypeGroup');
    toggle('condDekor', selectedTypes.includes('Dekorativ panel'));
    toggle('condStol', selectedTypes.includes('Oshxona'));
    toggle('condDevor', selectedTypes.includes('Oshxona'));
    toggle('condMatras', selectedTypes.includes('Krovat'));
    const kromka = getChipValues('kromkaGroup');
    toggle('kromkaStyleField', kromka.includes('Kromka bor'));
    const pay = getChipValues('payGroup');
    toggle('barterField', pay.includes('Ayirboshlash'));
}
function toggle(id, show) {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? 'block' : 'none';
}
function getChipValues(groupId) {
    return Array.from(document.querySelectorAll(`#${groupId} .chip.selected`)).map(c => c.dataset.val);
}
function getChipText(groupId) {
    return getChipValues(groupId).join(', ') || '—';
}

// ===== PHONE MASK =====
document.getElementById('fPhone').addEventListener('input', function () {
    let d = this.value.replace(/\D/g, '');
    if (d.startsWith('998')) d = d.slice(3);
    if (d.length > 9) d = d.slice(0, 9);
    let f = '+998';
    if (d.length > 0) f += ' ' + d.slice(0, 2);
    if (d.length > 2) f += ' ' + d.slice(2, 5);
    if (d.length > 5) f += ' ' + d.slice(5, 7);
    if (d.length > 7) f += ' ' + d.slice(7, 9);
    this.value = f;
});

// ===== FILE UPLOADS =====
document.querySelectorAll('.upload-box').forEach(box => {
    const key = box.dataset.key;
    const input = box.querySelector('input[type="file"]');
    const list = box.querySelector('.file-list');
    fileStore[key] = [];

    box.addEventListener('dragover', e => { e.preventDefault(); box.classList.add('dragover'); });
    box.addEventListener('dragleave', () => box.classList.remove('dragover'));
    box.addEventListener('drop', e => {
        e.preventDefault(); box.classList.remove('dragover');
        addFiles(key, e.dataTransfer.files, list);
    });
    input.addEventListener('change', () => {
        addFiles(key, input.files, list);
        input.value = '';
    });
});

function addFiles(key, files, list) {
    Array.from(files).forEach(f => {
        const idx = fileStore[key].length;
        fileStore[key].push(f);
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `<span class="fn">📄 ${f.name} (${(f.size / 1024).toFixed(0)}KB)</span>
            <button class="fr" onclick="removeFile('${key}',${idx},this)">✕</button>`;
        list.appendChild(div);
    });
}
function removeFile(key, idx, btn) {
    fileStore[key][idx] = null;
    btn.closest('.file-item').remove();
}
function countFiles(key) {
    return (fileStore[key] || []).filter(f => f !== null).length;
}
function getAllFiles() {
    const files = [];
    Object.keys(fileStore).forEach(key => {
        fileStore[key].filter(f => f !== null).forEach(f => files.push(f));
    });
    return files;
}

// ===== BUILD SUMMARY =====
function buildSummary() {
    const rows = getSummaryRows();
    const html = rows
        .filter(([, v]) => v && v !== '—' && v !== '0 ta')
        .map(([l, v]) => `<div class="s-row"><span class="s-l">${l}</span><span class="s-v">${v}</span></div>`)
        .join('');
    document.getElementById('summaryContent').innerHTML = html;
}

function getSummaryRows() {
    const rows = [
        ['Ism', document.getElementById('fName').value],
        ['Telefon', document.getElementById('fPhone').value],
        ["Ro'li", getChipText('roleGroup')],
        ['Tushunchasi', getChipText('levelGroup')],
        ['Mebel turi', getChipText('mebelTypeGroup')],
        ['Buyurtma turi', getChipText('orderTypeGroup')],
        ['Natija', getChipText('resultGroup')],
        ['Material', getChipText('materialGroup')],
        ['Kromka', getChipText('kromkaGroup')],
        ['Kromka bosish', getChipText('kromkaStyleGroup')],
        ['Furnitura', getChipText('fastenerGroup')],
        ['Petlya', document.getElementById('fPetlya').value || '—'],
        ['Mexanizm', document.getElementById('fMexanizm').value || '—'],
        ['Nojka', document.getElementById('fNojka').value || '—'],
        ['Ruchka', document.getElementById('fRuchka').value || '—'],
        ['Tortma', document.getElementById('fTortma').value || '—'],
        ['Profil', document.getElementById('fProfil').value || '—'],
        ['Muddat', document.getElementById('fDeadline').value || '—'],
        ['Shoshilinch', document.getElementById('fUrgent').checked ? 'Ha (+50 000)' : "Yo'q"],
        ["To'lov", getChipText('payGroup')],
    ];
    const types = getChipValues('mebelTypeGroup');
    if (types.includes('Krovat')) rows.splice(17, 0, ['Matras', document.getElementById('fMatras').value || '—']);
    if (types.includes('Oshxona')) {
        rows.splice(17, 0, ['Stoleshnitsa', document.getElementById('fStolType').value || '—']);
        rows.splice(18, 0, ['Devorga osish', document.getElementById('fDevor').value || '—']);
    }
    if (types.includes('Dekorativ panel')) rows.splice(17, 0, ['Dekor material', document.getElementById('fDekorMat').value || '—']);
    return rows;
}

function buildMessageText() {
    const rows = getSummaryRows();
    let t = '📐 BAZIS MEBELSHIK — TEXNIK TOPSHIRIQ\n\n';
    rows.filter(([, v]) => v && v !== '—')
        .forEach(([l, v]) => t += `${l}: ${v}\n`);
    const notes = document.getElementById('fNotes').value;
    if (notes) t += `\nIzoh: ${notes}`;
    const barter = document.getElementById('fBarter')?.value;
    if (barter) t += `\nAyirboshlash: ${barter}`;

    // File info
    const fileCount = getAllFiles().length;
    if (fileCount > 0) {
        t += `\n\n📎 ${fileCount} ta fayl ilova qilingan (alohida yuboriladi)`;
    }
    return t;
}

// ===== SEND VIA TELEGRAM DEEP LINK =====
function sendViaTelegram() {
    // Save to localStorage backup
    saveToLocal();

    // Build the message text
    const text = buildMessageText();

    // Open Telegram deep link
    // This will: 1) Open in browser  2) Browser asks to open Telegram app  3) Opens chat with pre-filled message
    const tgUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(text)}`;
    window.open(tgUrl, '_blank');
}

// ===== SHARE FILES VIA WEB SHARE API =====
async function shareFiles() {
    const files = getAllFiles();
    if (files.length === 0) {
        alert("Hech qanday fayl yuklanmagan");
        return;
    }

    // Check if Web Share API with files is supported
    if (navigator.canShare && navigator.canShare({ files })) {
        try {
            await navigator.share({
                title: 'Bazis Mebelshik — Fayllar',
                text: `📐 Texnik topshiriq fayllari (${files.length} ta)`,
                files: files
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Share xatosi:', err);
                fallbackFileShare();
            }
        }
    } else {
        // Fallback for devices that don't support file sharing
        fallbackFileShare();
    }
}

function fallbackFileShare() {
    // If Web Share API not supported, try sharing just text via Telegram
    const text = `📎 Fayllar alohida yuboriladi. Jami: ${getAllFiles().length} ta fayl.`;
    const tgUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(text)}`;
    window.open(tgUrl, '_blank');
    alert("📱 Fayllarni Telegram chatga qo'lda yuklang.\nTelegram ochilgandan keyin 📎 tugmasini bosing.");
}

// ===== SAVE TO LOCAL =====
function saveToLocal() {
    const data = {};
    document.querySelectorAll('input[type="text"],input[type="tel"],input[type="date"],textarea').forEach(el => {
        if (el.id && el.value) data[el.id] = el.value;
    });
    data.mebelType = getChipText('mebelTypeGroup');
    data.orderType = getChipText('orderTypeGroup');
    data.result = getChipText('resultGroup');
    data.material = getChipText('materialGroup');
    data.urgent = document.getElementById('fUrgent').checked;
    data.payment = getChipText('payGroup');
    data.timestamp = new Date().toISOString();

    const orders = JSON.parse(localStorage.getItem('bazis_orders') || '[]');
    orders.push(data);
    localStorage.setItem('bazis_orders', JSON.stringify(orders));
}

// ===== INIT =====
showStep(1);
