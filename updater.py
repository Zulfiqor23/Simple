import os
import re

html_path = r"c:\Users\User\.gemini\antigravity\scratch\Simple\index.html"
css_path = r"c:\Users\User\.gemini\antigravity\scratch\Simple\style.css"
js_path = r"c:\Users\User\.gemini\antigravity\scratch\Simple\script.js"

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

if 'lucide@latest' not in html:
    html = html.replace('<script src="https://telegram.org/js/telegram-web-app.js"></script>',
                        '<script src="https://telegram.org/js/telegram-web-app.js"></script>\n    <script src="https://unpkg.com/lucide@latest"></script>')

emojis = {
    '👤': '<i data-lucide="user"></i>',
    '🪑': '<i data-lucide="armchair"></i>',
    '⚙️': '<i data-lucide="settings"></i>',
    '📎': '<i data-lucide="paperclip"></i>',
    '📩': '<i data-lucide="mail"></i>',
    '📋': '<i data-lucide="clipboard-list"></i>',
    '💬': '<i data-lucide="message-square"></i>',
    '🔥': '<i data-lucide="flame"></i>',
    '⏳': '<i data-lucide="loader-circle" class="lucide-spin"></i>',
    '✅': '<i data-lucide="check-circle-2"></i>',
    '❌': '<i data-lucide="x-circle"></i>',
    '💳': '<i data-lucide="credit-card"></i>',
    '🤝': '<i data-lucide="users"></i>',
    '📸': '<i data-lucide="camera"></i>',
    '✏️': '<i data-lucide="pencil"></i>',
    '🎨': '<i data-lucide="palette"></i>',
    '🔩': '<i data-lucide="nut"></i>',
    '🛏️': '<i data-lucide="bed-double"></i>',
    '🍳': '<i data-lucide="chef-hat"></i>',
    '🚪': '<i data-lucide="door-open"></i>',
    '🪞': '<i data-lucide="rectangle-vertical"></i>',
    '🗄️': '<i data-lucide="archive"></i>',
    '🖼️': '<i data-lucide="image"></i>',
    '📚': '<i data-lucide="book-open"></i>',
    '📐': '<i data-lucide="ruler"></i>',
    '📄': '<i data-lucide="file-text"></i>',
    '🖥️': '<i data-lucide="monitor-play"></i>',
    '👁️': '<i data-lucide="eye"></i>',
    '📏': '<i data-lucide="ruler-horizontal"></i>',
    '😕': '<i data-lucide="frown"></i>',
    '🔧': '<i data-lucide="wrench"></i>'
}

for e, icon in emojis.items():
    html = html.replace(e, icon)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)


with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

if '.lucide' not in css:
    css += "\n/* Lucide Icons */\n.lucide { width: 1.25em; height: 1.25em; stroke-width: 2; vertical-align: middle; margin-right: 6px; }\n.lucide-spin { animation: spin 2s linear infinite; }\n@keyframes spin { 100% { transform: rotate(360deg); } }\n"
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css)


with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

old_logic = "group.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));\n                chip.classList.toggle('selected');"
new_logic = "const wasSelected = chip.classList.contains('selected');\n                group.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));\n                if (!wasSelected) chip.classList.add('selected');"
if old_logic in js:
    js = js.replace(old_logic, new_logic)

if 'lucide.createIcons();' not in js:
    js = js.replace('showStep(1);', 'showStep(1);\nif(window.lucide) lucide.createIcons();')

if 'updateConditionals();' in js and 'if(window.lucide) lucide.createIcons();' not in js.split('updateConditionals();')[1]:
    js = js.replace('updateConditionals();\n        });', 'updateConditionals();\n            if(window.lucide) lucide.createIcons();\n        });')

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("Updates applied.")
