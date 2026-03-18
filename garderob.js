// ===== CONFIGURATION =====
const BOT_TOKEN = '8353264846:AAHlGhCK7z7iNG8cwOCt6Sff6gDEcr3VSvM';
const ADMIN_CHAT_ID = '6690357035';
const tg = window.Telegram?.WebApp;

let cart = JSON.parse(sessionStorage.getItem('garderob_cart') || '[]');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    if (tg) {
        tg.expand();
        tg.ready();
    }
    
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
        let cursor = e.target.selectionStart;
        let oldVal = e.target.value;
        let val = e.target.value.replace(/\D/g, ''); 
        
        if (!val.startsWith('998')) val = '998' + val;
        val = val.slice(0, 12); 

        let formatted = '+998';
        if (val.length > 3) formatted += ' ' + val.substring(3, 5); 
        if (val.length > 5) formatted += ' ' + val.substring(5, 8); 
        if (val.length > 8) formatted += '-' + val.substring(8, 10); 
        if (val.length > 10) formatted += '-' + val.substring(10, 12); 
        
        e.target.value = formatted;
    });

    document.getElementById('formName').addEventListener('input', (e) => {
        // No persistence
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
    sessionStorage.setItem('garderob_cart', JSON.stringify(cart));
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
        message += `📞 <b>Tel:</b> <a href="tel:${phone.replace(/\s+/g, '')}">${escapeHTML(phone)}</a>\n`;
        
        const senderUser = tg?.initDataUnsafe?.user;
        const senderId = senderUser?.id;

        if (senderUser) {
            const contactLabel = senderUser.username ? `@${senderUser.username}` : (senderUser.first_name || "Mijoz");
            message += `🔹 <b>Telegram:</b> <a href="tg://user?id=${senderId}">${escapeHTML(contactLabel)}</a>\n`;
            message += `🔗 <b>Bog'lanish:</b> <a href="https://t.me/${senderUser.username || ''}">Profil ochish</a>\n`;
        }
        
        message += `\n📦 <b>Buyurtma tarkibi:</b>\n`;
        cart.forEach((item, idx) => {
            message += `${idx + 1}. ${escapeHTML(item.name)} x ${item.quantity} dona - <i>${(item.price * item.quantity).toLocaleString()} so'm</i>\n`;
        });
        
        message += `\n💰 <b>JAMI: ${total.toLocaleString()} so'm</b>`;

        // Send function with individual error handling
        const sendToId = async (id, label) => {
            if (!id) return false;
            const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: id, text: message, parse_mode: 'HTML' })
            });
            if (!res.ok) {
                const err = await res.json();
                console.error(`Failed to send to ${label}:`, err);
                return err.description;
            }
            return true;
        };

        // Try Admin
        const adminStatus = await sendToId(ADMIN_CHAT_ID, "Admin");
        
        // Try Sender fallback
        const senderStatus = await sendToId(senderId, "Sender");

        if (adminStatus === true || senderStatus === true) {
            // Success if at least one reached
            cart = [];
            saveCart();
            updateCartUI();
            document.body.classList.remove('cart-open');
            alert("✅ Buyurtmangiz muvaffaqiyatli yuborildi!");
            if (tg) tg.close();
        } else {
            // Both failed
            let errMsg = "❌ Buyurtma yuborilmadi.";
            errMsg += `\nAdmin Status: ${adminStatus}`;
            errMsg += `\nSender Status: ${senderStatus}`;
            errMsg += `\nSizning ID: ${senderId || "Noma'lum"}`;
            
            if (adminStatus.toString().includes("chat not found")) {
                errMsg += "\n\n⚠️ Admin botni start qilmagan yoki ID xato!";
            }
            alert(errMsg);
        }

    } catch (err) {
        console.error(err);
        alert("Xatolik: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}
