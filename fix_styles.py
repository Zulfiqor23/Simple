import re

path = r'C:\Users\User\.gemini\antigravity\scratch\Simple\shablonlar.html'
content = open(path, 'r', encoding='utf-8').read()

styles = '''
        /* Added utility classes to remove inline styles */
        .mt-5 { margin-top: 5px; }
        .mt-10 { margin-top: 10px; }
        .mt-15 { margin-top: 15px; }
        .mt-20 { margin-top: 20px; }
        .mt-25 { margin-top: 25px; }
        .mb-0 { margin-bottom: 0 !important; }
        .mb-5 { margin-bottom: 5px; }
        .mb-10 { margin-bottom: 10px; }
        .mb-15 { margin-bottom: 15px; }
        .pt-15 { padding-top: 15px; }
        .py-10 { padding: 10px 0; }
        .p-10 { padding: 10px; }

        .w-40 { width: 40px; }
        .w-60 { width: 60px; }
        .w-150 { width: 150px; }
        .w-200 { width: 200px; }
        .w-15p { width: 15%; }
        .w-20p { width: 20%; }
        .w-25p { width: 25%; }
        .w-40p { width: 40%; }
        .w-55p { width: 55%; }
        .w-70p { width: 70%; }
        .w-80p { width: 80%; }
        .w-100p { width: 100%; }

        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .font-600 { font-weight: 600; }
        .text-11 { font-size: 11px; }
        .text-12 { font-size: 12px; }
        .text-13 { font-size: 13px; }

        .rounded-full { border-radius: 50%; }
        .flex-none { flex: none; }
        .flex-between { justify-content: space-between; }
        .flex-center { justify-content: center; }
        .align-end { align-items: flex-end; }
        .gap-40 { gap: 40px; }
        .border-none { border: none !important; }
        .bg-white { background-color: white !important; }

        .min-h-25 { min-height: 25px; }
        .min-h-80 { min-height: 80px; }
        .border-dotted { border-bottom: 1px dotted #ccc; }
        .border-solid-ccc { border: 1px solid #ccc; }
        .border-dashed-green { border-top: 1px dashed #bbf7d0; }

        .alert-danger { background-color: #ffeaea; border-color: #ffc2c2; }
        .text-danger { color: #b91c1c; }
        .alert-success { background-color: #f0fdf4; border-color: #bbf7d0; }
        .title-success { background-color: #dcfce7; color: #166534; }
        .text-success { color: #166534; }
        .bg-light-gray { background-color: #f8f9fa; }
        .alert-info { background-color: #f0f9ff; border-color: #bae6fd; }
        .alert-gray { background-color: #f1f5f9; }
        .alert-purple { background-color: #fdf4ff; border-color: #f5d0fe; }
        .title-purple { background-color: #fae8ff; color: #86198f; }
        .text-purple { color: #86198f; }
    </style>'''

content = content.replace('    </style>', styles)

replacements = {
    'class=\"check-item\" style=\"margin-top: 15px;\"': 'class=\"check-item mt-15\"',
    'class=\"check-item\" style=\"margin-top: 10px;\"': 'class=\"check-item mt-10\"',
    'class=\"check-item\" style=\"margin-top:5px;\"': 'class=\"check-item mt-5\"',
    
    'class=\"input-line\" style=\"width:150px;\"': 'class=\"input-line w-150\"',
    'class=\"input-line\" style=\"width:200px;\"': 'class=\"input-line w-200\"',
    'class=\"input-line\" style=\"width:40px;\"': 'class=\"input-line w-40\"',
    'class=\"input-line\" style=\"width: 40px;\"': 'class=\"input-line w-40\"',
    'class=\"input-line\" style=\"width: 80%;\"': 'class=\"input-line w-80p\"',
    'class=\"input-line\" style=\"width: 100%;\"': 'class=\"input-line w-100p\"',
    'class=\"input-line\" style=\"width: 70%;\"': 'class=\"input-line w-70p\"',
    
    'class=\"info-panel\" style=\"margin-top: 15px; background-color: #ffeaea; border-color: #ffc2c2;\"': 'class=\"info-panel mt-15 alert-danger\"',
    'class=\"info-item\" style=\"color: #b91c1c;\"': 'class=\"info-item text-danger\"',
    
    'class=\"card\" style=\"margin-top: 20px;\"': 'class=\"card mt-20\"',
    'class=\"card\" style=\"margin-top: 10px;\"': 'class=\"card mt-10\"',
    'class=\"card\" style=\"margin-top: 20px; background-color: #f0fdf4; border-color: #bbf7d0;\"': 'class=\"card mt-20 alert-success\"',
    'class=\"card-title\" style=\"background-color: #dcfce7; color: #166534;\"': 'class=\"card-title title-success\"',
    
    'style=\"font-size: 13px; margin-bottom: 15px; color: #166534;\"': 'class=\"text-13 mb-15 text-success\"',
    'style=\"margin-top: 25px; border-top: 1px dashed #bbf7d0; padding-top: 15px;\"': 'class=\"mt-25 border-dashed-green pt-15\"',
    'style=\"font-size: 13px; font-weight: 600; margin-bottom: 10px;\"': 'class=\"text-13 font-600 mb-10\"',
    
    'class=\"checkbox-box\" style=\"border-radius: 50%;\"': 'class=\"checkbox-box rounded-full\"',
    'class=\"checkbox-box\" style=\"border-radius:50%\"': 'class=\"checkbox-box rounded-full\"',
    
    'class=\"info-panel\" style=\"margin-top: 25px; background: white; border: none; align-items: flex-end;\"': 'class=\"info-panel mt-25 bg-white border-none align-end\"',
    'class=\"info-item\" style=\"text-align: right; color: var(--text-muted); font-size: 11px;\"': 'class=\"info-item text-right text-muted text-11\"',
    
    'style=\"width: 15%;\"': 'class=\"w-15p\"',
    'style=\"width: 55%;\"': 'class=\"w-55p\"',
    'style=\"width: 40%;\"': 'class=\"w-40p\"',
    'style=\"width: 25%;\"': 'class=\"w-25p\"',
    'style=\"width: 20%;\"': 'class=\"w-20p\"',
    'style=\"width:60px;\"': 'class=\"w-60\"',
    
    'style=\"text-align: center;\"': 'class=\"text-center\"',
    'style=\"background-color: #f8f9fa;\"': 'class=\"bg-light-gray\"',
    
    'class=\"info-panel\" style=\"justify-content: space-between;\"': 'class=\"info-panel flex-between\"',
    
    'style=\"font-size:12px; font-weight:bold; margin-bottom: 5px;\"': 'class=\"text-12 font-bold mb-5\"',
    'style=\"margin-bottom: 15px;\"': 'class=\"mb-15\"',
    'style=\"font-size:13px; font-weight:bold;\"': 'class=\"text-13 font-bold\"',
    'style=\"font-size:12px; border-bottom: 1px dotted #ccc; padding: 10px 0; min-height: 25px;\"': 'class=\"text-12 border-dotted py-10 min-h-25\"',
    
    'class=\"info-panel\" style=\"margin-top: 20px; text-align: center; justify-content: center; gap: 40px; background-color: #f1f5f9;\"': 'class=\"info-panel mt-20 text-center flex-center gap-40 alert-gray\"',
    'class=\"info-item\" style=\"flex: none;\"': 'class=\"info-item flex-none\"',
    
    'class=\"table-full\" style=\"font-size: 12px;\"': 'class=\"table-full text-12\"',
    'style=\"font-size:13px; font-weight:bold; margin-bottom: 10px;\"': 'class=\"text-13 font-bold mb-10\"',
    'style=\"font-size:12px; border-bottom: 1px dotted #ccc; padding: 10px 0;\"': 'class=\"text-12 border-dotted py-10\"',
    'style=\"font-size: 11px; margin-bottom: 10px;\"': 'class=\"text-11 mb-10\"',
    
    'class=\"table-full\" style=\"margin-bottom: 0;\"': 'class=\"table-full mb-0\"',
    'style=\"color:var(--text-muted);\"': 'class=\"text-muted\"',
    
    'class=\"info-panel\" style=\"background-color: #f0f9ff; border-color: #bae6fd;\"': 'class=\"info-panel alert-info\"',
    'style=\"min-height: 80px; border: 1px solid #ccc; padding: 10px; font-size: 13px; background: white; margin-bottom: 15px;\"': 'class=\"min-h-80 border-solid-ccc p-10 text-13 bg-white mb-15\"',
    'style=\"font-size: 13px;\"': 'class=\"text-13\"',
    
    'class=\"card\" style=\"background-color: #fdf4ff; border-color: #f5d0fe;\"': 'class=\"card alert-purple\"',
    'class=\"card-title\" style=\"background-color: #fae8ff; color: #86198f;\"': 'class=\"card-title title-purple\"',
    'style=\"font-size: 12px; margin-top: 5px; color: #86198f;\"': 'class=\"text-12 mt-5 text-purple\"'
}

for k, v in replacements.items():
    content = content.replace(k, v)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
