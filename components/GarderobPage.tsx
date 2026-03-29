'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Image from 'next/image'
import { Plus, Check, Trash2, ShoppingCart, X } from 'lucide-react'
import { G_MODULES, type Module } from '@/lib/modules'

interface CartItem extends Module {
  quantity: number
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  let val = digits.startsWith('998') ? digits : '998' + digits
  val = val.slice(0, 12)
  let formatted = '+998'
  if (val.length > 3) formatted += ' ' + val.substring(3, 5)
  if (val.length > 5) formatted += ' ' + val.substring(5, 8)
  if (val.length > 8) formatted += '-' + val.substring(8, 10)
  if (val.length > 10) formatted += '-' + val.substring(10, 12)
  return formatted
}

function escapeHTML(str: string): string {
  return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m] ?? m))
}

export default function GarderobPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [addedId, setAddedId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load cart from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('garderob_cart')
      if (stored) setCart(JSON.parse(stored))
    } catch {}

    // Telegram WebApp init
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.expand()
      tg.ready()
    }

    // Add garderob body class
    document.body.classList.add('garderob-page')
    return () => {
      document.body.classList.remove('garderob-page')
    }
  }, [])

  // Persist cart
  useEffect(() => {
    try {
      sessionStorage.setItem('garderob_cart', JSON.stringify(cart))
    } catch {}
  }, [cart])

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart])
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart])

  const addToCart = useCallback((module: Module) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === module.id)
      if (existing) return prev.map((i) => i.id === module.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...module, quantity: 1 }]
    })

    setAddedId(module.id)
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current)
    addedTimerRef.current = setTimeout(() => setAddedId(null), 1000)
  }, [])

  const changeQty = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => i.id === id ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    )
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const handlePhoneInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
  }, [])

  const handleSubmit = async () => {
    if (cart.length === 0) { alert("Savat bo'sh!"); return }
    if (!name.trim()) { alert('Iltimos, ismingizni kiriting'); return }
    if (phone.replace(/\D/g, '').length < 12) { alert("Iltimos, telefon raqamingizni to'liq kiriting"); return }

    setSubmitting(true)
    try {
      const orderId = 'G-' + Date.now().toString().slice(-6)
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
      const senderId = tgUser?.id

      let message = `🆕 <b>YANGI GARDEROB BUYURTMASI</b>\n`
      message += `🆔 Buyurtma ID: <code>${orderId}</code>\n\n`
      message += `👤 <b>Mijoz:</b> ${escapeHTML(name.trim())}\n`
      message += `📞 <b>Tel:</b> <a href="tel:${phone.replace(/\s/g, '')}">${escapeHTML(phone)}</a>\n`

      if (tgUser) {
        const label = tgUser.username ? `@${tgUser.username}` : (tgUser.first_name || 'Mijoz')
        message += `🔹 <b>Telegram:</b> <a href="tg://user?id=${senderId}">${escapeHTML(label)}</a>\n`
        if (tgUser.username) {
          message += `🔗 <b>Bog'lanish:</b> <a href="https://t.me/${tgUser.username}">Profil ochish</a>\n`
        }
      }

      message += `\n📦 <b>Buyurtma tarkibi:</b>\n`
      cart.forEach((item, idx) => {
        message += `${idx + 1}. ${escapeHTML(item.name)} x ${item.quantity} dona - <i>${(item.price * item.quantity).toLocaleString()} so'm</i>\n`
      })
      message += `\n💰 <b>JAMI: ${cartTotal.toLocaleString()} so'm</b>`

      const res = await fetch('/api/send-garderob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, senderId }),
      })

      const data = await res.json()
      if (data.ok) {
        setCart([])
        setCartOpen(false)
        try { sessionStorage.removeItem('garderob_cart') } catch {}
        alert('✅ Buyurtmangiz muvaffaqiyatli yuborildi!')
        window.Telegram?.WebApp?.close()
      } else {
        alert(`❌ Xatolik: ${data.error || 'Noma\'lum xato'}`)
      }
    } catch (err) {
      alert('Xatolik: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="garderob-header">
        <div className="garderob-header-inner">
          <div className="garderob-logo">
            <span className="garderob-logo-icon">🚪</span>
            <div>
              <div className="garderob-logo-title">Garderob Modullari</div>
              <div className="garderob-logo-sub">Bazis Proyekt</div>
            </div>
          </div>
          <button className="cart-btn" onClick={() => setCartOpen(true)} aria-label="Savat">
            <ShoppingCart size={22} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* Catalog */}
      <main className="catalog-main">
        <div className="catalog-grid">
          {G_MODULES.map((module, idx) => (
            <div key={module.id} className="module-card" style={{ animationDelay: `${idx * 0.08}s` }}>
              <div className="module-image">
                <Image
                  src={`/modules/${module.image}.jpg`}
                  alt={module.name}
                  width={600}
                  height={600}
                  className="module-img"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = 'https://placehold.co/600x600?text=No+Image'
                  }}
                />
              </div>
              <div className="module-info">
                <div className="module-tag">Premium Modul</div>
                <h3 className="module-name">{module.name}</h3>
                <p className="module-desc">{module.description}</p>
                <div className="module-dims">
                  {module.dimensions.w} × {module.dimensions.h} × {module.dimensions.d} mm
                </div>
                <div className="module-bottom">
                  <div className="module-price">
                    {module.price.toLocaleString()} <span>so'm</span>
                  </div>
                  <button
                    className={`add-btn${addedId === module.id ? ' added' : ''}`}
                    onClick={() => addToCart(module)}
                    aria-label={`${module.name} savatga qo'shish`}
                  >
                    {addedId === module.id ? <Check size={18} color="#10b981" /> : <Plus size={18} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Overlay */}
      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)} aria-hidden="true" />
      )}

      {/* Cart Sidebar */}
      <aside className={`cart-sidebar${cartOpen ? ' open' : ''}`} aria-label="Savat">
        <div className="cart-header">
          <h2 className="cart-title">Savat</h2>
          <button className="cart-close-btn" onClick={() => setCartOpen(false)} aria-label="Yopish">
            <X size={20} />
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">Savat bo&apos;sh</div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img-wrap">
                  <Image
                    src={`/modules/${item.image}.jpg`}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="cart-item-img"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=IMG'
                    }}
                  />
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{item.price.toLocaleString()} so'm</div>
                  <div className="cart-item-qty">
                    <button onClick={() => changeQty(item.id, -1)} aria-label="Kamaytirish">−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => changeQty(item.id, 1)} aria-label="Ko'paytirish">+</button>
                  </div>
                </div>
                <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)} aria-label="O'chirish">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Order Form */}
        <div className="cart-form">
          <div className="cart-total">
            Jami: <strong>{cartTotal.toLocaleString()} so'm</strong>
          </div>
          <input
            type="text"
            className="form-input"
            placeholder="Ismingiz"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="tel"
            className="form-input"
            placeholder="+998 __ ___-__-__"
            value={phone}
            onChange={handlePhoneInput}
            inputMode="numeric"
          />
          <button
            className="send-order-btn"
            onClick={handleSubmit}
            disabled={submitting || cart.length === 0}
          >
            {submitting ? 'Yuborilmoqda...' : '📦 Buyurtma berish'}
          </button>
        </div>
      </aside>
    </>
  )
}
