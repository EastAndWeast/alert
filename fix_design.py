path = r'c:\Users\haido\Desktop\HexPay\3.AI\Google antigravity\18.Alert项目需求分析\trading-risk-admin\js\modules\rules.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 修复 modal-actions 的行内样式和 CSS 类
# 把 style="margin-top:16px;" 从 modal-actions 里面拿掉（通过 CSS 设定），或者保留然后在 CSS 里也加 flex
old_html1 = "html += '<div class=\"modal-actions\" style=\"margin-top:16px;\">';"
new_html1 = "html += '<div class=\"modal-actions clone-modal-actions\">';"
content = content.replace(old_html1, new_html1)

old_html2_1 = "html += '<div class=\"modal-actions\">';"
content = content.replace(old_html2_1, new_html1)

# 2. 修改 clone-route-arrow HTML
old_arrow = "html += '<div class=\"clone-route-arrow\">\u2193 \u5c06\u514b\u9686\u5230</div>';"
new_arrow = "html += '<div class=\"clone-route-arrow\"><div class=\"clone-route-arrow-icon\">\u2193 \u5c06\u514b\u9686\u5230</div></div>';"
content = content.replace(old_arrow, new_arrow, 1)

# 3. 增强 CSS 样式
old_css = """        .clone-route-box { background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:8px; padding:12px 16px; margin-top:12px; }
        .clone-route-row { display:flex; flex-direction:column; gap:4px; margin-bottom:6px; }
        .clone-route-row:last-child { margin-bottom:0; }
        .clone-route-label { font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; }
        .clone-route-val { font-size:14px; font-weight:500; color:var(--text-primary); }
        .clone-route-select { margin-top:4px; }
        .clone-route-arrow { text-align:center; color:var(--primary-color); font-size:16px; font-weight:600; padding:4px 0; }"""

new_css = """        .clone-route-box { background:var(--bg-secondary); border:1px solid rgba(0,0,0,0.05); border-radius:12px; padding:20px; margin-top:16px; box-shadow:0 2px 12px rgba(0,0,0,0.02); }
        .clone-route-row { display:flex; flex-direction:column; gap:6px; margin-bottom:0; }
        .clone-route-label { font-size:12px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
        .clone-route-val { font-size:15px; font-weight:600; color:var(--text-primary); }
        .clone-route-select { margin-top:8px; font-size:14px; padding:10px; border-radius:8px; }
        .clone-route-arrow { display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:12px; padding:16px 0; margin: 8px 0; }
        .clone-route-arrow::before, .clone-route-arrow::after { content:\"\"; flex:1; height:1px; background:var(--border-color); opacity:0.6; }
        .clone-route-arrow-icon { margin:0 16px; background:var(--card-bg); border:1px solid var(--border-color); border-radius:50px; padding:4px 12px; font-weight:500; box-shadow:0 2px 6px rgba(0,0,0,0.04); }
        .clone-modal-actions { display:flex; justify-content:flex-end; gap:12px; padding-top:16px; margin-top:24px; border-top:1px solid var(--border-color); padding-bottom:4px; }
        .clone-steps { display:flex; gap:16px; align-items:center; font-size:14px; margin-bottom:12px; flex-wrap:wrap; font-weight:500; }
        .clone-step-done { color:var(--success-color); }
        .clone-step-active { color:var(--primary-color); font-weight:600; }
        .clone-step { color:var(--text-muted); }"""

if old_css in content:
    content = content.replace(old_css, new_css, 1)
    print('OK: CSS replaced')
else:
    print('WARNING: CSS not exactly matched')

# Write back
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Task complete.')
