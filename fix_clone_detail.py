path = r'c:\Users\haido\Desktop\HexPay\3.AI\Google antigravity\18.Alert项目需求分析\trading-risk-admin\js\modules\rules.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. 在第1555行（var r = item.rule;）之后，插入 var rType = r.rule_type;
# 行号从0起，第1555行 = index 1554
line_1555 = lines[1554]
if 'var r = item.rule;' in line_1555:
    lines[1554] = line_1555.rstrip() + '\r\n            var rType = r.rule_type;\r\n'
    print(f'Step1 OK: inserted rType after line 1555')
else:
    print(f'Step1 FAIL: line 1555 = {repr(line_1555[:80])}')

# 2. 在第1561行（</div> 关闭 clone-side-left）之前，插入参数行
# 但行号会因为我们刚刚插入了一行而变化，所以重新扫描
new_lines = lines
for i, line in enumerate(new_lines):
    if i < 1550 or i > 1580:
        continue
    # 找到 '</div>' 紧接着 clone-side-left 结束的那一行
    # 特征：这一行只有 html += '</div>';  且上一行包含 enabled
    if "html += '<\\/div>';\\r\\n" in repr(line) or "html += '</div>';" in line:
        prev = new_lines[i-1] if i > 0 else ''
        if 'enabled' in prev or '\u72b6\u6001' in prev:
            # 在这里插入规则参数行
            insert_line = "            html += '<div class=\"clone-params-section\">' + RulesModule.renderRuleParams(r, rType) + '</div>';\r\n"
            new_lines.insert(i, insert_line)
            print(f'Step2 OK: inserted renderRuleParams before line {i+1}')
            break

# 3. 在克隆后右侧面板底部加一个提示
for i, line in enumerate(new_lines):
    if i < 1560 or i > 1590:
        continue
    if 'batch-enable-sel' in line and 'form-group' in line:
        next_line = new_lines[i+1] if i+1 < len(new_lines) else ''
        if '</div></div></details>' in next_line:
            insert_line = "            html += '<div class=\"clone-params-note\">\\U0001f4cb \\u53c2\\u6570\\u5c06\\u539f\\u6837\\u590d\\u5236</div>';\r\n"
            new_lines.insert(i+1, insert_line)
            print(f'Step3 OK: inserted clone-params-note')
            break

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print('File saved.')
