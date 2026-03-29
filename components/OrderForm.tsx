'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Ruler, User, Armchair, Settings, Paperclip, Mail,
  ClipboardList, MessageSquare, CheckCircle2, XCircle,
  Flame, CreditCard, Users, BedDouble, ChefHat, DoorOpen,
  Archive, BookOpen, Frown, Palette, Wrench, Nut, Camera,
  Pencil, FileText, MonitorPlay, Eye, Loader2,
} from 'lucide-react'

// ===== TYPES =====
interface FormState {
  name: string; phone: string; role: string; level: string
  mebelTypes: string[]; orderType: string; results: string[]
  materials: string[]; dekorMat: string; stolType: string
  kromka: string; kromkaStyle: string; fastener: string
  petlya: string; mexanizm: string; nojka: string; ruchka: string
  matras: string; devor: string; tortma: string; profil: string
  notes: string; deadline: string; urgent: boolean
  payment: string; barter: string
}

type FileKey = 'roomPhotos' | 'sketchFiles' | 'designFiles' | 'matFiles'
type FileStore = Record<FileKey, (File | null)[]>

const INITIAL_FORM: FormState = {
  name: '', phone: '', role: '', level: '',
  mebelTypes: [], orderType: '', results: [],
  materials: [], dekorMat: '', stolType: '',
  kromka: '', kromkaStyle: '', fastener: '',
  petlya: '', mexanizm: '', nojka: '', ruchka: '',
  matras: '', devor: '', tortma: '', profil: '',
  notes: '', deadline: '', urgent: false,
  payment: '', barter: '',
}

const INITIAL_FILES: FileStore = {
  roomPhotos: [], sketchFiles: [], designFiles: [], matFiles: [],
}

// ===== CHIP GROUP =====
interface ChipOption {
  value: string
  label: React.ReactNode
  sublabel?: string
}

function ChipGroup({
  id, options, selected, multi, className, onChange,
}: {
  id?: string
  options: ChipOption[]
  selected: string | string[]
  multi?: boolean
  className?: string
  onChange: (val: string | string[]) => void
}) {
  const handleClick = (val: string) => {
    if (multi) {
      const arr = selected as string[]
      onChange(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
    } else {
      onChange((selected as string) === val ? '' : val)
    }
  }
  const isSelected = (val: string) =>
    multi ? (selected as string[]).includes(val) : selected === val

  return (
    <div id={id} className={`chip-group${className ? ' ' + className : ''}`}>
      {options.map(({ value, label, sublabel }) => (
        <button
          key={value}
          type="button"
          className={`chip${isSelected(value) ? ' selected' : ''}`}
          onClick={() => handleClick(value)}
        >
          {sublabel ? (<><span>{label}</span><small>{sublabel}</small></>) : label}
        </button>
      ))}
    </div>
  )
}

// ===== UPLOAD BOX =====
function UploadBox({
  label, subLabel, icon, accept, files, onAdd, onRemove,
}: {
  label: string; subLabel: string; icon: React.ReactNode
  accept: string; files: (File | null)[]
  onAdd: (files: FileList) => void
  onRemove: (idx: number) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    boxRef.current?.classList.add('dragover')
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    boxRef.current?.classList.remove('dragover')
    if (e.dataTransfer.files.length) onAdd(e.dataTransfer.files)
  }

  return (
    <div
      ref={boxRef}
      className="upload-box"
      onDragOver={handleDragOver}
      onDragLeave={() => boxRef.current?.classList.remove('dragover')}
      onDrop={handleDrop}
    >
      <div className="upload-inner" onClick={() => inputRef.current?.click()}>
        <span className="upload-inner-icon">{icon}</span>
        <p>{label}</p>
        <small>{subLabel}</small>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="upload-input"
          onClick={e => e.stopPropagation()}
          onChange={e => { if (e.target.files?.length) onAdd(e.target.files); e.target.value = '' }}
        />
      </div>
      {files.some(Boolean) && (
        <div className="file-list">
          {files.map((f, i) => f ? (
            <div key={i} className="file-item">
              <span className="fn">📄 {f.name} ({(f.size / 1024).toFixed(0)}KB)</span>
              <button type="button" className="fr" onClick={() => onRemove(i)}>✕</button>
            </div>
          ) : null)}
        </div>
      )}
    </div>
  )
}

// ===== MAIN COMPONENT =====
export default function OrderForm() {
  const TOTAL_STEPS = 5
  const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [fileStore, setFileStore] = useState<FileStore>(INITIAL_FILES)
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info')

  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)

  // Telegram init
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) { tg.expand(); tg.ready() }
  }, [])

  // Telegram main button
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return
    tg.MainButton.text = '✅ Buyurtmani Yuborish'
    if (step === TOTAL_STEPS) {
      tg.MainButton.show()
      const handler = () => (document.getElementById('orderForm') as HTMLFormElement)?.requestSubmit()
      tg.MainButton.onClick(handler)
      return () => tg.MainButton.offClick(handler)
    } else {
      tg.MainButton.hide()
    }
  }, [step])

  // Scroll to top on step change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [step])

  // Phone mask
  const handlePhoneInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let d = e.target.value.replace(/\D/g, '')
    if (d.startsWith('998')) d = d.slice(3)
    if (d.length > 9) d = d.slice(0, 9)
    let f = '+998'
    if (d.length > 0) f += ' ' + d.slice(0, 2)
    if (d.length > 2) f += ' ' + d.slice(2, 5)
    if (d.length > 5) f += ' ' + d.slice(5, 7)
    if (d.length > 7) f += ' ' + d.slice(7, 9)
    setForm(p => ({ ...p, phone: f }))
  }, [])

  const setField = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }))

  const setSingle = useCallback((key: keyof FormState) => (val: string | string[]) =>
    setForm(p => ({ ...p, [key]: val as string })), [])

  const setMulti = useCallback((key: keyof FormState) => (val: string | string[]) =>
    setForm(p => ({ ...p, [key]: val as string[] })), [])

  const getAllFiles = useCallback(() =>
    Object.values(fileStore).flat().filter((f): f is File => f !== null), [fileStore])

  const addFiles = (key: FileKey) => (list: FileList) =>
    setFileStore(p => ({ ...p, [key]: [...p[key], ...Array.from(list)] }))

  const removeFile = (key: FileKey) => (idx: number) =>
    setFileStore(p => { const next = [...p[key]]; next[idx] = null; return { ...p, [key]: next } })

  const shake = (el: HTMLElement | null) => {
    if (!el) return
    el.classList.add('shake')
    el.focus()
    setTimeout(() => el.classList.remove('shake'), 600)
  }

  const goNext = () => {
    if (step === 1) {
      if (!form.name.trim()) { shake(nameRef.current); return }
      if (form.phone.replace(/\D/g, '').length < 12) { shake(phoneRef.current); return }
    }
    if (step === 2 && form.mebelTypes.length === 0) {
      document.getElementById('mebelTypeGroup')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (step < TOTAL_STEPS) setStep(s => s + 1)
  }

  const goPrev = () => { if (step > 1) setStep(s => s - 1) }
  const goToStep = (n: number) => { if (n <= step) setStep(n) }

  // Derived summary rows
  const summaryRows = useMemo((): [string, string][] => {
    const allFiles = Object.values(fileStore).flat().filter(Boolean)
    const rows: [string, string][] = [
      ['Ism', form.name], ['Telefon', form.phone],
      ["Ro'li", form.role], ['Tushunchasi', form.level],
      ['Mebel turi', form.mebelTypes.join(', ')],
      ['Buyurtma turi', form.orderType],
      ['Natija', form.results.join(', ')],
      ['Material', form.materials.join(', ')],
      ['Kromka', form.kromka], ['Kromka bosish', form.kromkaStyle],
      ['Furnitura', form.fastener],
      ['Petlya', form.petlya], ['Mexanizm', form.mexanizm],
      ['Nojka', form.nojka], ['Ruchka', form.ruchka],
      ['Tortma', form.tortma], ['Profil', form.profil],
      ['Muddat', form.deadline],
      ['Shoshilinch', form.urgent ? 'Ha (+50 000)' : ''],
      ["To'lov", form.payment],
    ]
    if (form.mebelTypes.includes('Krovat')) rows.splice(17, 0, ['Matras', form.matras])
    if (form.mebelTypes.includes('Oshxona')) {
      rows.splice(17, 0, ['Stoleshnitsa', form.stolType])
      rows.splice(18, 0, ['Devorga osish', form.devor])
    }
    if (form.mebelTypes.includes('Dekorativ panel')) rows.splice(17, 0, ['Dekor material', form.dekorMat])
    if (allFiles.length) rows.push(['Fayllar', `${allFiles.length} ta`])
    return rows
  }, [form, fileStore])

  // Build Telegram message
  const buildMessage = (fileCount: number, driveLink?: string): string => {
    let t = '📐 BAZIS MEBELSHIK — TEXNIK TOPSHIRIQ\n\n'
    const u = window.Telegram?.WebApp?.initDataUnsafe?.user
    if (u) {
      const contact = u.username ? `@${u.username}` : u.first_name + (u.last_name ? ' ' + u.last_name : '')
      t += `🧑‍💼 Kontakt (TG): <a href="tg://user?id=${u.id}">${contact}</a>\n\n`
    }
    summaryRows
      .filter(([, v]) => v && v !== '—' && !v.includes(' ta'))
      .forEach(([l, v]) => (t += `${l}: ${v}\n`))
    if (form.notes) t += `\nIzoh: ${form.notes}`
    if (form.barter) t += `\nAyirboshlash: ${form.barter}`
    if (driveLink) t += `\n\n📁 Fayllar: ${driveLink}`
    else if (fileCount > 0) t += `\n\n📎 ${fileCount} ta fayl ilova qilingan`
    return t
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true); setProgress(0)
    setStatusMsg('Tayyorlanmoqda...'); setStatusType('info')
    const tg = window.Telegram?.WebApp
    tg?.MainButton.showProgress()

    try {
      const allFiles = getAllFiles()
      let driveLink = ''

      if (allFiles.length > 0 && GAS_URL) {
        setStatusMsg("📎 Fayllar Drive'ga yuklanmoqda..."); setProgress(20)
        const base64Files = await Promise.all(
          allFiles.map(f => new Promise<{ name: string; mimeType: string; base64: string }>(resolve => {
            const reader = new FileReader()
            reader.onload = () => resolve({
              name: f.name, mimeType: f.type || 'application/octet-stream',
              base64: (reader.result as string).split(',')[1],
            })
            reader.readAsDataURL(f)
          }))
        )
        try {
          const res = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ orderId: 'ORD-' + Date.now().toString().slice(-6), files: base64Files }),
          })
          if (res.ok) {
            const data = await res.json().catch(() => null)
            if (data?.folderUrl) driveLink = data.folderUrl
          }
        } catch { console.warn('Drive upload failed') }
        setProgress(60)
        setStatusMsg(driveLink ? "✅ Fayllar yuklandi" : '⚠️ Fayllar yuklanmadi')
      }

      setStatusMsg('📤 Yuborilmoqda...')
      const res = await fetch('/api/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: buildMessage(allFiles.length, driveLink), senderId: tg?.initDataUnsafe?.user?.id }),
      })
      const result = await res.json()
      if (!res.ok || !result.ok) throw new Error(result.error || 'Yuborishda xatolik')

      setProgress(100); setStatusMsg('🎉 Muvaffaqiyatli yuborildi!'); setStatusType('success')
      const orders = JSON.parse(localStorage.getItem('bazis_orders') || '[]')
      orders.push({ name: form.name, phone: form.phone, timestamp: new Date().toISOString() })
      localStorage.setItem('bazis_orders', JSON.stringify(orders))
      setTimeout(() => tg?.close(), 2000)
    } catch (err) {
      setStatusMsg(`❌ Xato: ${(err as Error).message}`); setStatusType('error')
      tg?.MainButton.hideProgress()
    } finally {
      setTimeout(() => { setSubmitting(false); tg?.MainButton.hideProgress() }, 3000)
    }
  }

  // Conditional visibility
  const showDekor = form.mebelTypes.includes('Dekorativ panel')
  const showOshxona = form.mebelTypes.includes('Oshxona')
  const showKrovat = form.mebelTypes.includes('Krovat')
  const showKromkaStyle = form.kromka === 'Kromka bor'
  const showBarter = form.payment === 'Ayirboshlash'

  return (
    <>
      <header className="app-header">
        <div className="header-bg" />
        <div className="header-content">
          <div className="logo-icon"><Ruler size={28} /></div>
          <h1>Bazis Mebelshik</h1>
          <p className="header-sub">Texnik Topshiriqlarni to&apos;ldirish</p>
        </div>
      </header>

      <nav className="progress-nav">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
        </div>
        <div className="progress-dots">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button"
              className={`dot${step === n ? ' active' : step > n ? ' done' : ''}`}
              onClick={() => goToStep(n)}>
              <span>{n}</span>
            </button>
          ))}
        </div>
        <div className="progress-labels">
          {["Ma'lumot", 'Loyiha', 'Tafsilot', 'Fayllar', 'Topshiriq'].map((label, i) => (
            <span key={label} className={step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}>{label}</span>
          ))}
        </div>
      </nav>

      <main className="app-main">
        <form id="orderForm" onSubmit={handleSubmit} noValidate>

          {/* STEP 1 */}
          <section className={`step${step === 1 ? ' active' : ''}`}>
            <div className="card glass-card">
              <div className="card-header">
                <span className="card-icon"><User size={20} /></span>
                <h2>Buyurtmachi ma&apos;lumotlari</h2>
              </div>
              <div className="field">
                <label>Ism, Familiya <span className="req">*</span></label>
                <input ref={nameRef} type="text" value={form.name} placeholder="Ismingizni kiriting" required
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="field">
                <label>Telefon raqam <span className="req">*</span></label>
                <input ref={phoneRef} type="tel" value={form.phone} placeholder="+998 XX XXX XX XX" required
                  onChange={handlePhoneInput} />
              </div>
              <div className="field">
                <label>Buyurtmadagi ro&apos;li</label>
                <ChipGroup
                  options={[
                    { value: 'Dizayner', label: 'Dizayner' },
                    { value: 'Mebelchi', label: 'Mebelchi' },
                    { value: 'Prorap', label: 'Prorap' },
                    { value: 'Boshqa', label: 'Boshqa' },
                  ]}
                  selected={form.role} onChange={setSingle('role')} />
              </div>
              <div className="field">
                <label>Mebel borasida tushunchasi</label>
                <ChipGroup
                  options={[
                    { value: 'Tushunmayman', label: <><Frown size={16} /> Tushunmayman</> },
                    { value: 'Dizayner', label: <><Palette size={16} /> Dizayner darajasida</> },
                    { value: 'Ustanovshik', label: <><Wrench size={16} /> Ustanovshik darajasida</> },
                    { value: 'Konstruktor', label: <><Ruler size={16} /> Konstruktor darajasida</> },
                  ]}
                  selected={form.level} onChange={setSingle('level')} />
              </div>
            </div>
            <div className="nav-row">
              <div />
              <button type="button" className="btn-primary" onClick={goNext}>Keyingisi →</button>
            </div>
          </section>

          {/* STEP 2 */}
          <section className={`step${step === 2 ? ' active' : ''}`}>
            <div className="card glass-card">
              <div className="card-header">
                <span className="card-icon"><Armchair size={20} /></span>
                <h2>Loyiha</h2>
              </div>
              <div className="field">
                <label>Mebel turi <span className="req">*</span></label>
                <ChipGroup id="mebelTypeGroup" multi
                  options={[
                    { value: 'Krovat', label: <><BedDouble size={16} /> Krovat</> },
                    { value: 'Oshxona', label: <><ChefHat size={16} /> Oshxona</> },
                    { value: 'Shkaf', label: <><DoorOpen size={16} /> Shkaf</> },
                    { value: 'Tryumo', label: 'Tryumo' },
                    { value: 'Komod', label: <><Archive size={16} /> Komod</> },
                    { value: 'Dekorativ panel', label: 'Dekor panel' },
                    { value: 'Parta', label: <><BookOpen size={16} /> Parta</> },
                  ]}
                  selected={form.mebelTypes} onChange={setMulti('mebelTypes')} />
              </div>
              <div className="field">
                <label>Buyurtma turi</label>
                <ChipGroup
                  options={[
                    { value: 'Individual', label: <><User size={16} /> Individual (yakka shaxs)</> },
                    { value: 'Konveyr', label: '🏭 Konveyr ishlab chiqarish' },
                    { value: '3D loyiha', label: '🎮 3D loyiha uchun' },
                  ]}
                  selected={form.orderType} onChange={setSingle('orderType')} />
              </div>
              <div className="field">
                <label>Natija (bir nechtasini tanlash mumkin)</label>
                <ChipGroup multi className="price-chips"
                  options={[
                    { value: 'Bazis model', label: <><Ruler size={16} /> Bazis model</>, sublabel: "13 000 so'm/kv.m" },
                    { value: 'Smeta', label: <><FileText size={16} /> Smeta hujjatlari</>, sublabel: "2 000 so'm/kv.m" },
                    { value: '3D dizayn', label: <><Palette size={16} /> 3D dizayn</>, sublabel: "1 000 so'm/kv.m" },
                    { value: 'KDT fayllar', label: <><MonitorPlay size={16} /> KDT stanok fayllar</>, sublabel: "1 000 so'm/kv.m" },
                  ]}
                  selected={form.results} onChange={setMulti('results')} />
              </div>
            </div>
            <div className="nav-row">
              <button type="button" className="btn-ghost" onClick={goPrev}>← Orqaga</button>
              <button type="button" className="btn-primary" onClick={goNext}>Keyingisi →</button>
            </div>
          </section>

          {/* STEP 3 */}
          <section className={`step${step === 3 ? ' active' : ''}`}>
            <div className="card glass-card">
              <div className="card-header">
                <span className="card-icon"><Settings size={20} /></span>
                <h2>Tafsilotlar</h2>
              </div>
              <div className="field">
                <label>Korpus / Fasad materiali</label>
                <ChipGroup multi
                  options={[
                    { value: 'LDSP 16mm', label: 'ЛДСП 16mm' },
                    { value: 'LDSP 18mm', label: 'ЛДСП 18mm' },
                    { value: 'LMDF 16mm', label: 'ЛМДФ 16mm' },
                    { value: 'LMDF 18mm', label: 'ЛМДФ 18mm' },
                    { value: 'Akril 16mm', label: 'Akril 16mm' },
                  ]}
                  selected={form.materials} onChange={setMulti('materials')} />
              </div>
              {showDekor && (
                <div className="field cond-field">
                  <label>Dekorativ panel materiali</label>
                  <input type="text" value={form.dekorMat} placeholder="Dekorativ panel materiali..." onChange={setField('dekorMat')} />
                </div>
              )}
              {showOshxona && (
                <div className="field cond-field">
                  <label>Stoleshnitsa turi</label>
                  <input type="text" value={form.stolType} placeholder="Stoleshnitsa turi va qalinligi..." onChange={setField('stolType')} />
                </div>
              )}
              <div className="field">
                <label>Kromka turi</label>
                <ChipGroup
                  options={[
                    { value: 'Kromka bor', label: <><CheckCircle2 size={16} /> Kromka bor</> },
                    { value: "Kromka yo'q", label: <><XCircle size={16} /> Kromka yo&apos;q</> },
                  ]}
                  selected={form.kromka} onChange={setSingle('kromka')} />
              </div>
              {showKromkaStyle && (
                <div className="field cond-field">
                  <label>Kromka bosish usuli</label>
                  <ChipGroup
                    options={[
                      { value: "Ko'rinadigan tomon", label: <><Eye size={16} /> Faqat ko&apos;rinadigan tomon</> },
                      { value: 'Standart', label: <><Ruler size={16} /> Standartga muvofiq</> },
                    ]}
                    selected={form.kromkaStyle} onChange={setSingle('kromkaStyle')} />
                </div>
              )}
              <div className="field">
                <label>Mahkamlovchi furnitura</label>
                <ChipGroup
                  options={[
                    { value: 'Yevrovint', label: <><Nut size={16} /> Yevrovint</> },
                    { value: 'Ekssentrik shkant', label: <><Settings size={16} /> Ekssentrik shkant</> },
                  ]}
                  selected={form.fastener} onChange={setSingle('fastener')} />
              </div>
              {[
                ['Petlya turi', 'petlya', 'Masalan: Blum clip-top, oddiy...'],
                ['Ochilish mexanizmlari', 'mexanizm', 'Masalan: Gaz lift, tortma napravlyayushiy...'],
                ['Nojka (oyoq)', 'nojka', 'Masalan: Reguliruemiy, dekorativ...'],
                ['Ruchka (Tutqichlar)', 'ruchka', 'Masalan: Profil ruchka, oddiy, integrirovanniy...'],
              ].map(([label, key, placeholder]) => (
                <div key={key} className="field">
                  <label>{label}</label>
                  <input type="text" value={form[key as keyof FormState] as string}
                    placeholder={placeholder}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              {showKrovat && (
                <div className="field cond-field">
                  <label>Matras o&apos;lchami</label>
                  <input type="text" value={form.matras} placeholder="Masalan: 160x200, 180x200..." onChange={setField('matras')} />
                </div>
              )}
              {showOshxona && (
                <div className="field cond-field">
                  <label>Devorga osish usuli</label>
                  <input type="text" value={form.devor} placeholder="Masalan: shin reyka, dubel anker..." onChange={setField('devor')} />
                </div>
              )}
              {[
                ['Tortma (yaslik) sisteyasi', 'tortma', 'Masalan: Teleskopik, tandem, roldangli...'],
                ["Profil sistema (shkaf bo'lsa)", 'profil', 'Masalan: Alyuminiy profil, S-400...'],
              ].map(([label, key, placeholder]) => (
                <div key={key} className="field">
                  <label>{label}</label>
                  <input type="text" value={form[key as keyof FormState] as string}
                    placeholder={placeholder}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="nav-row">
              <button type="button" className="btn-ghost" onClick={goPrev}>← Orqaga</button>
              <button type="button" className="btn-primary" onClick={goNext}>Keyingisi →</button>
            </div>
          </section>

          {/* STEP 4 */}
          <section className={`step${step === 4 ? ' active' : ''}`}>
            <div className="card glass-card">
              <div className="card-header">
                <span className="card-icon"><Paperclip size={20} /></span>
                <h2>Fayllar yuklash</h2>
              </div>
              <UploadBox label="Xona rasmi" subLabel="Rasmni tanlang yoki tashlang"
                icon={<Camera size={24} />} accept="image/*,.pdf"
                files={fileStore.roomPhotos} onAdd={addFiles('roomPhotos')} onRemove={removeFile('roomPhotos')} />
              <UploadBox label="O'lchamlar va chizma rasmi" subLabel="O'lchamlar yozilgan chizma"
                icon={<Pencil size={24} />} accept="image/*,.pdf,.dwg"
                files={fileStore.sketchFiles} onAdd={addFiles('sketchFiles')} onRemove={removeFile('sketchFiles')} />
              <UploadBox label="Dizayn rasmi" subLabel="Agar dizayn asosida bo'lsa"
                icon={<Palette size={24} />} accept="image/*,.pdf"
                files={fileStore.designFiles} onAdd={addFiles('designFiles')} onRemove={removeFile('designFiles')} />
              <UploadBox label="Furnitura va material rasmlari" subLabel="Bo'lsa yuklang"
                icon={<Nut size={24} />} accept="image/*,.pdf"
                files={fileStore.matFiles} onAdd={addFiles('matFiles')} onRemove={removeFile('matFiles')} />
            </div>
            <div className="nav-row">
              <button type="button" className="btn-ghost" onClick={goPrev}>← Orqaga</button>
              <button type="button" className="btn-primary" onClick={goNext}>Keyingisi →</button>
            </div>
          </section>

          {/* STEP 5 */}
          <section className={`step${step === 5 ? ' active' : ''}`}>
            <div className="card glass-card">
              <div className="card-header">
                <span className="card-icon"><Mail size={20} /></span>
                <h2>Topshiriq</h2>
              </div>
              <div className="field">
                <label>Qo&apos;shimcha izoh va takliflar</label>
                <textarea rows={4} value={form.notes}
                  placeholder="Maxsus talablar, o'lcham cheklovi va boshqa..."
                  onChange={setField('notes')} />
              </div>
              <div className="field">
                <label>Yakunlash muddati</label>
                <input type="date" value={form.deadline} onChange={setField('deadline')} />
              </div>
              <div className="field toggle-field">
                <label
                  className={`toggle-label${form.urgent ? ' checked' : ''}`}
                  onClick={() => setForm(p => ({ ...p, urgent: !p.urgent }))}>
                  <div className="toggle-switch" />
                  <span><Flame size={16} /> Shoshilinch (+50 000 so&apos;m)</span>
                </label>
              </div>
              <div className="field">
                <label>To&apos;lov usuli</label>
                <ChipGroup
                  options={[
                    { value: 'Click', label: <><CreditCard size={16} /> Click: Uzcard / Humo</> },
                    { value: 'Ayirboshlash', label: <><Users size={16} /> Teng qiymatli ayirboshlash</> },
                  ]}
                  selected={form.payment} onChange={setSingle('payment')} />
              </div>
              {showBarter && (
                <div className="field cond-field">
                  <label>Ayirboshlash tafsiloti</label>
                  <textarea rows={2} value={form.barter}
                    placeholder="Nima bilan ayirboshlasiz..." onChange={setField('barter')} />
                </div>
              )}
            </div>

            <div className="card glass-card summary-card">
              <div className="card-header">
                <span className="card-icon"><ClipboardList size={20} /></span>
                <h2>Buyurtma kartasi</h2>
              </div>
              {summaryRows.filter(([, v]) => v && v !== '—').map(([label, val]) => (
                <div key={label} className="s-row">
                  <span className="s-l">{label}</span>
                  <span className="s-v">{val}</span>
                </div>
              ))}
            </div>

            <div className="card glass-card send-card">
              <p className="send-title"><MessageSquare size={18} /> Buyurtmani yuborish</p>
              <p className="send-desc">Buyurtma va fayllar to&apos;g&apos;ridan-to&apos;g&apos;ri bo&apos;limga yuboriladi</p>
              {submitting && (
                <div className="send-progress">
                  <div className="send-progress-bar">
                    <div className="send-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <p className={`send-status ${statusType}`}>{statusMsg}</p>
                </div>
              )}
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting
                  ? <><Loader2 size={20} style={{ animation: 'spin 2s linear infinite' }} /> Yuborilmoqda...</>
                  : <><CheckCircle2 size={20} /> Bot orqali yuborish</>
                }
              </button>
            </div>

            <div className="nav-row">
              <button type="button" className="btn-ghost" onClick={goPrev}>← Orqaga</button>
              <div />
            </div>
          </section>
        </form>
      </main>
    </>
  )
}
