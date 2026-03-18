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
                const wasSelected = chip.classList.contains('selected');
                group.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
                if (!wasSelected) chip.classList.add('selected');
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
    
    const u = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (u) {
        const name = u.first_name + (u.last_name ? ' ' + u.last_name : '');
        const contact = u.username ? `@${u.username}` : name;
        t += `🧑‍💼 Kontakt (TG): <a href="tg://user?id=${u.id}">${contact}</a>\n\n`;
    }

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

// ===== TELEGRAM WEB APP INIT =====
const tg = window.Telegram.WebApp;
tg.expand(); // Opens web app in full height

// DIIQQAT: Shu yerda O'z bot tokeningizni va lichka (Chat ID) ni yozasiz!
// Bularni faqat siz bilasiz, xavfsiz holatda.
const BOT_TOKEN = '8641387756:AAHquNwhbeSD2_0aKTAOp58LMKmnT5c3-ZY'; 
const ADMIN_CHAT_ID = '7548673584'; // @userinfobot dan olasiz

// ===== MAIN BUTTON INIT =====
tg.MainButton.text = "✅ Buyurtmani Yuborish";
tg.MainButton.onClick(() => {
    document.getElementById('submitBtn').click();
});

// Show main button on step 5
const originalShowStep = showStep;
showStep = function(n) {
    originalShowStep(n);
    if (n === TOTAL_STEPS) {
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
};

// ===== SEND TO BOT DIRECLTY =====
document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if(!BOT_TOKEN || BOT_TOKEN === 'SIZNING_BOT_TOKEN_SHU_ERDA') {
        alert("Iltimos, avval script.js ichida BOT_TOKEN va ADMIN_CHAT_ID ni o'zgartiring!");
        return;
    }

    const btn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');
    const progressDiv = document.getElementById('sendProgress');
    const progressFill = document.getElementById('sendProgressFill');
    const statusText = document.getElementById('sendStatus');

    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    progressDiv.style.display = 'block';
    
    tg.MainButton.showProgress();

    const allFiles = getAllFiles();
    const totalSteps = 1 + allFiles.length; 
    let stepsDone = 0;

    function updateProgress(msg) {
        stepsDone++;
        const pct = Math.round((stepsDone / totalSteps) * 100);
        progressFill.style.width = pct + '%';
        statusText.textContent = msg;
    }

    try {
        statusText.textContent = '📤 Buyurtma matni yuborilmoqda...';
        const text = buildMessageText();
        
        const msgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
        
        if (!msgRes.ok) throw new Error('Matn yuborilmadi, Chat ID yoki Token xato bo\'lishi mumkin.');
        
        // Yuboruvchining o'ziga ham xabar yuborish (Task 1)
        const senderChatId = tg.initDataUnsafe?.user?.id;
        if (senderChatId) {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: senderChatId,
                    text: "Sizning buyurtmangiz qabul qilindi ⬇️\n\n" + text,
                    parse_mode: 'HTML'
                })
            });
        }
        
        updateProgress('✅ Matn yuborildi');

        // Buyurtma raqami yaratish (masalan: telefon raqam oxiri + vaqt)
        const orderId = 'ORD-' + Date.now().toString().slice(-6);

        // Google Apps Script orqali Drive ga fayllarni yuklash (Task 2)
        const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw8XCbhqf7MBImCkS36JZlki6wYJACt-42CiE6yp8_3Cf4SR0xfrZMLZjszoP04bovgZQ/exec";

        if (allFiles.length > 0 && GAS_WEB_APP_URL !== "SIZNING_GOOGLE_SCRIPT_WEB_APP_URL") {
            statusText.textContent = `📎 Fayllar Google Drive'ga yuklanmoqda... (Kuting)`;
            
            // Fayllarni Base64 ga o'tkazish
            const filePromises = allFiles.map(f => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve({
                        name: f.name,
                        mimeType: f.type || 'application/octet-stream',
                        base64: reader.result.split(',')[1]
                    });
                    reader.readAsDataURL(f);
                });
            });
            
            const base64Files = await Promise.all(filePromises);
            
            const driveRes = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                // Mode no-cors can be used if CORS issues happen, but we want to read JSON response.
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8' // GAS prefers text/plain for CORS
                },
                body: JSON.stringify({
                    orderId: orderId,
                    files: base64Files
                })
            });
            
            if (driveRes.ok) {
                 updateProgress(`✅ Barcha fayllar Drive'ga yuklandi`);
                 // Papka havolasini yuborish o'chirib tashlandi (shart emas)
            } else {
                 console.warn("Google Drive ga yuklashda xatolik");
                 updateProgress(`⚠️ Fayllar qo'shilmadi (Drive xatosi)`);
            }
        } else if (allFiles.length > 0) {
            // Eskicha botga jo'natish (agar GAS URL kiritilmagan bo'lsa zaxira variant)
            for (let i = 0; i < allFiles.length; i++) {
                const f = allFiles[i];
                statusText.textContent = `📎 Fayl yuborilmoqda: ${f.name} (${i + 1}/${allFiles.length})...`;

                const formData = new FormData();
                formData.append('chat_id', ADMIN_CHAT_ID);
                formData.append('caption', `📎 Fayl: ${f.name}`);
                
                let endpoint = f.type.startsWith('image/') ? 'sendPhoto' : 'sendDocument';
                if(endpoint === 'sendPhoto') formData.append('photo', f);
                else formData.append('document', f);

                const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, {
                    method: 'POST',
                    body: formData
                });

                if (!fileRes.ok) console.warn(`Fayl yuborishda xato: ${f.name}`);
                updateProgress(`✅ ${f.name} yuborildi`);
            }
        }

        progressFill.style.width = '100%';
        statusText.textContent = '🎉 Muvaffaqiyatli yuborildi!';
        statusText.style.color = '#00b894';
        
        saveToLocal();
        
        // Bot ilovasini yopish
        setTimeout(() => {
            tg.close();
        }, 2000);

    } catch (err) {
        console.error('Xato:', err);
        statusText.textContent = `❌ Xato: ${err.message}`;
        statusText.style.color = '#e74c3c';
        tg.MainButton.hideProgress();
    } finally {
        setTimeout(() => {
            btn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }, 3000);
    }
});

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
if(window.lucide) lucide.createIcons();
