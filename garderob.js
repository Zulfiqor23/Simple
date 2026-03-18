// ===== CONFIGURATION =====
const BOT_TOKEN = '8353264846:AAHlGhCK7z7iNG8cwOCt6Sff6gDEcr3VSvM';
const ADMIN_CHAT_ID = '7548673584';
const tg = window.Telegram?.WebApp;

let cart = JSON.parse(localStorage.getItem('garderob_cart') || '[]');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    if (tg) {
        tg.expand();
        tg.ready();
    }
    
    // Load persisted contact info
    const savedName = localStorage.getItem('garderob_cust_name');
    const savedPhone = localStorage.getItem('garderob_cust_phone');
    if (savedName) document.getElementById('formName').value = savedName;
    if (savedPhone) document.getElementById('formPhone').value = savedPhone;

    renderCatalog();
    updateCartUI();
    
    // Event Listeners
    document.getElementById('openCartBtn').onclick = () => document.body.classList.add('cart-open');
    document.getElementById('closeCartBtn').onclick = () => document.body.classList.remove('cart-open');
    document.getElementById('cartOverlay').onclick = () => document.body.classList.remove('cart-open');
    document.getElementById('sendOrderBtn').onclick = handleOrderSubmit;

    // Phone Formatting
    const phoneInput = document.getElementById('formPhone');
    phoneInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, ''); // digit only
        if (!val.startsWith('998')) val = '998' + val;
        val = val.slice(0, 12); // max 12 digits

        let formatted = '+';
        if (val.length > 0) formatted += val.substring(0, 3); // +998
        if (val.length > 3) formatted += ' ' + val.substring(3, 5); // 90
        if (val.length > 5) formatted += ' ' + val.substring(5, 8); // 123
        if (val.length > 8) formatted += '-' + val.substring(8, 10); // 45
        if (val.length > 10) formatted += '-' + val.substring(10, 12); // 67
        
        e.target.value = formatted;
        localStorage.setItem('garderob_cust_phone', formatted);
    });

    document.getElementById('formName').addEventListener('input', (e) => {
        localStorage.setItem('garderob_cust_name', e.target.value);
    });
});

// ===== CATALOG RENDERING =====
function renderCatalog() {
    const grid = document.getElementById('catalogGrid');
    grid.innerHTML = G_MODULES.map((m, index) => `
        <div class="module-card" style="animation-delay: ${index * 0.1}s">
            <div class="module-image">
                <img src="modules/${m.image}.jpg" alt="${m.name}" onerror="this.src='https://placehold.co/600x600?text=No+Image'">
            </div>
            <div class="module-info">
                <div class="module-tag">Premium Modul</div>
                <h3 class="module-name">${m.name}</h3>
                <p class="module-desc">${m.description}</p>
                <div class="module-bottom">
                    <div class="module-price">
                        ${m.price.toLocaleString()} <span>so'm</span>
                    </div>
                    <button class="add-btn" onclick="addToCart('${m.id}')">
                        <i data-lucide="plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

// ===== CART LOGIC =====
function addToCart(moduleId) {
    const module = G_MODULES.find(m => m.id === moduleId);
    const existing = cart.find(item => item.id === moduleId);
    
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...module, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    
    // Small feedback
    const btn = event.currentTarget;
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="check" style="color:#10b981"></i>';
    if (window.lucide) lucide.createIcons();
    setTimeout(() => {
        btn.innerHTML = originalContent;
        if (window.lucide) lucide.createIcons();
    }, 1000);
}

function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('cartCount').textContent = count;
    document.getElementById('cartTotalSum').textContent = total.toLocaleString() + " so'm";
    
    const list = document.getElementById('cartItemsList');
    if (cart.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:40px; color:#9ca3af; font-style:italic;">Savat bo\'sh</div>';
    } else {
        list.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="modules/${item.image}.jpg" class="cart-item-img" onerror="this.src='https://placehold.co/100x100?text=IMG'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()} so'm</div>
                    <div style="display:flex; align-items:center; gap:10px; margin-top:5px;">
                        <button onclick="changeQty('${item.id}', -1)" style="border:none; background:#f3f4f6; border-radius:4px; width:24px; height:24px;">-</button>
                        <span style="font-weight:bold; font-size:14px;">${item.quantity}</span>
                        <button onclick="changeQty('${item.id}', 1)" style="border:none; background:#f3f4f6; border-radius:4px; width:24px; height:24px;">+</button>
                    </div>
                </div>
                <button onclick="removeFromCart('${item.id}')" style="border:none; background:none; color:#ef4444; padding:5px;">
                    <i data-lucide="trash-2" style="width:18px; height:18px;"></i>
                </button>
            </div>
        `).join('');
    }
    if (window.lucide) lucide.createIcons();
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity < 1) removeFromCart(id);
        else {
            saveCart();
            updateCartUI();
        }
    }
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('garderob_cart', JSON.stringify(cart));
}

// ===== ORDER SUBMISSION =====
function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[m]);
}

async function handleOrderSubmit() {
    if (cart.length === 0) {
        alert("Savat bo'sh!");
        return;
    }

    const name = document.getElementById('formName').value.trim();
    const phone = document.getElementById('formPhone').value.trim();

    if (!name) { alert("Iltimos, ismingizni kiriting"); return; }
    if (phone.length < 9) { alert("Iltimos, telefon raqamingizni to'liq kiriting"); return; }

    const btn = document.getElementById('sendOrderBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Yuborilmoqda...';

    try {
        const orderId = 'G-' + Date.now().toString().slice(-6);
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Build message
        let message = `🆕 <b>YANGI GARDEROB BUYURTMASI</b>\n`;
        message += `🆔 Buyurtma ID: <code>${orderId}</code>\n\n`;
        message += `👤 <b>Mijoz:</b> ${escapeHTML(name)}\n`;
        message += `📞 <b>Tel:</b> ${escapeHTML(phone)}\n`;
        
        const senderUser = tg?.initDataUnsafe?.user;
        if (senderUser) {
            const contactLabel = senderUser.username ? `@${senderUser.username}` : (senderUser.first_name || "Mijoz");
            message += `🔹 <b>Telegram:</b> <a href="tg://user?id=${senderUser.id}">${escapeHTML(contactLabel)}</a>\n`;
        }
        
        message += `\n📦 <b>Buyurtma tarkibi:</b>\n`;
        cart.forEach((item, idx) => {
            message += `${idx + 1}. ${escapeHTML(item.name)} x ${item.quantity} dona - <i>${(item.price * item.quantity).toLocaleString()} so'm</i>\n`;
        });
        
        message += `\n💰 <b>JAMI: ${total.toLocaleString()} so'm</b>`;

        // Send to Admin
        const adminRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (!adminRes.ok) {
            const errData = await adminRes.json();
            throw new Error(`Telegram Error: ${errData.description || adminRes.statusText}`);
        }

        // Send to User
        const senderId = tg?.initDataUnsafe?.user?.id;
        if (senderId) {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: senderId,
                    text: `✅ <b>Buyurtmangiz qabul qilindi!</b>\n\nID: ${orderId}\nTez orada operatorlarimiz siz bilan bog'lanishadi.`,
                    parse_mode: 'HTML'
                })
            });
        }

        // Success
        cart = [];
        saveCart();
        updateCartUI();
        document.body.classList.remove('cart-open');
        
        alert("Buyurtmangiz muvaffaqiyatli yuborildi!");
        
        if (tg) tg.close();

    } catch (err) {
        console.error(err);
        alert("Xatolik: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}
