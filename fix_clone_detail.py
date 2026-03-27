path = r'c:\Users\haido\Desktop\HexPay\3.AI\Google antigravity\18.Alert项目需求分析\trading-risk-admin\js\modules\rules.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f'Total lines: {len(lines)}')

# --------  修复1：步骤1加来源→目标服务器说明 (1488-1508行) --------
# 当前行1488 = index 1487，替换整段 _showBatchStep1 的前半部分
# 用整个方法替换的方式，精准修改第1488-1508行

step1_start = 1487  # 0-indexed
step1_end = 1507    # 0-indexed inclusive

new_step1 = [
    '    _showBatchStep1(rules, otherSources, currentSourceId, ruleType) {\r\n',
    '        var currentSource = MockData.dataSources.find(function(s){ return s.source_id === currentSourceId; });\r\n',
    '        var currentSourceName = currentSource ? currentSource.source_name + \' (\' + currentSource.platform_type + \')\' : currentSourceId;\r\n',
    '        var html = \'<div class="clone-modal-wrap">\';\r\n',
    '        html += \'<div class="clone-steps"><span class="clone-step-active">\u2460 \u9009\u62e9\u76ee\u6807</span><span class="clone-step">\u2461 \u9884\u89c8\u89c4\u5219</span><span class="clone-step">\u2462 \u786e\u8ba4\u514b\u9686</span></div>\';\r\n',
    '        html += \'<div class="clone-route-box">\';\r\n',
    '        html += \'<div class="clone-route-row"><span class="clone-route-label">\u6765\u6e90\u670d\u52a1\u5668</span><span class="clone-route-val">\' + currentSourceName + \'</span></div>\';\r\n',
    '        html += \'<div class="clone-route-arrow">\u2193 \u5c06\u514b\u9686\u5230</div>\';\r\n',
    '        html += \'<div class="clone-route-row"><span class="clone-route-label">\u76ee\u6807\u670d\u52a1\u5668</span>\';\r\n',
    '        html += \'<select class="form-control clone-route-select" id="batchCloneTarget">\';\r\n',
    '        otherSources.forEach(function (s) {\r\n',
    '            html += \'<option value="\' + s.source_id + \'">\' + s.source_name + \' (\' + s.platform_type + \')</option>\';\r\n',
    '        });\r\n',
    '        html += \'</select></div></div>\';\r\n',
    '        html += \'<div class="clone-info-box" style="margin-top:12px;">\u5c06\u514b\u9686\u5f53\u524d\u6570\u636e\u6e90\u4e0b <strong>\' + rules.length + \'</strong> \u6761\u300c\' + I18n.t(ruleType) + \'\u300d\u89c4\u5219</div>\';\r\n',
    '        html += \'<div class="modal-actions" style="margin-top:16px;">\';\r\n',
    '        html += \'<button class="btn btn-secondary" onclick="RulesModule._restoreModalFooter();App.hideModal()">\u53d6\u6d88</button>\';\r\n',
    '        html += \'<button class="btn btn-primary" onclick="RulesModule._showBatchStep2(\\\'\' + ruleType + \'\\\')">\u4e0b\u4e00\u6b65\uff1a\u9884\u89c8\u89c4\u5219 \u2192</button>\';\r\n',
    '        html += \'</div></div>\';\r\n',
    '\r\n',
    '        App.showModal(\'\u6279\u91cf\u514b\u9686\u89c4\u5219\', html);\r\n',
    '        this._injectCloneStyles();\r\n',
    '        this._hideModalFooter();\r\n',
    '    },\r\n',
]

lines[step1_start:step1_end+1] = new_step1
print(f'Fix1 OK: replaced step1 method (lines 1488-1508), new total = {len(lines)}')

# --------  修复2：步骤3"返回"按钮改为调用 _showBatchStep2FromState --------
# 先找到步骤3弹窗中"返回"按钮所在行
# 它调用的是 _showBatchStep2，需要改成 _showBatchStep2FromState
for i, line in enumerate(lines):
    if '_showBatchStep2' in line and '\u2190' in line and 'onclick' in line and '_showBatchStep3' not in line:
        if '_showBatchStep2FromState' not in line:
            old_line = line
            lines[i] = line.replace('_showBatchStep2(', '_showBatchStep2FromState(')
            print(f'Fix2 OK: line {i+1} changed return button to call _showBatchStep2FromState')
            print(f'  FROM: {old_line.strip()[:80]}')
            print(f'  TO:   {lines[i].strip()[:80]}')
            break

# --------  修复3：在 _injectCloneStyles 前插入 _hideModalFooter 方法 --------
# 找到 _injectCloneStyles 方法的起始行
inject_start = None
for i, line in enumerate(lines):
    if '_injectCloneStyles' in line and 'if (document.getElementById' in (lines[i+1] if i+1 < len(lines) else ''):
        inject_start = i
        break

if inject_start is not None:
    helper_methods = [
        '\r\n',
        '    _hideModalFooter() {\r\n',
        '        var footer = document.getElementById(\'modalFooter\');\r\n',
        '        if (footer) footer.style.display = \'none\';\r\n',
        '    },\r\n',
        '\r\n',
        '    _restoreModalFooter() {\r\n',
        '        var footer = document.getElementById(\'modalFooter\');\r\n',
        '        if (footer) footer.style.display = \'\';\r\n',
        '    },\r\n',
        '\r\n',
    ]
    lines[inject_start:inject_start] = helper_methods
    print(f'Fix3 OK: inserted _hideModalFooter/_restoreModalFooter before _injectCloneStyles at line {inject_start+1}')
else:
    print('Fix3 FAIL: could not find _injectCloneStyles')

# --------  修复4: 在 step2 和 step3 的 App.showModal 后加 _hideModalFooter --------
# 找到 step2 和 step3 的 showModal 调用（在确认克隆 和 批量预览弹窗中）
# 使用更精确的匹配：找到 App.showModal('批量克隆规则', html); 且其后没有 _hideModalFooter
changes = 0
for i, line in enumerate(lines):
    if "App.showModal('\u6279\u91cf\u514b\u9686\u89c4\u5219', html);" in line:
        next_line = lines[i+1] if i+1 < len(lines) else ''
        if '_hideModalFooter' not in next_line:
            lines.insert(i+1, '        this._hideModalFooter();\r\n')
            changes += 1
            print(f'Fix4 OK: added _hideModalFooter after App.showModal at line {i+1}')
print(f'Fix4 total: {changes} hideModalFooter calls added')

# --------  修复5: 在 confirmSingleClone 和 _executeBatchClone 的 hideModal 前加 _restoreModalFooter --------
for i, line in enumerate(lines):
    if 'App.hideModal();' in line and i > 0:
        prev_line = lines[i-1] if i > 0 else ''
        # 只处理 confirmSingleClone 和 _executeBatchClone 里面的
        if ('_restoreModalFooter' not in prev_line and
            ('executeClone' in '\n'.join([l for l in lines[max(0,i-10):i]])) ):
            lines.insert(i, '        this._restoreModalFooter();\r\n')
            print(f'Fix5 OK: added _restoreModalFooter before hideModal at line {i+1}')

# --------  修复6: 添加 _showBatchStep2FromState 方法 --------
# 在 _toggleCloneMode 前插入
toggle_start = None
for i, line in enumerate(lines):
    if '    _toggleCloneMode() {' in line:
        toggle_start = i
        break

if toggle_start is not None:
    step2_from_state = [
        '    _showBatchStep2FromState(ruleType) {\r\n',
        '        // 从已保存状态恢复步骤2，无需重新读取 DOM\r\n',
        '        var targetSource = this._batchTargetSource;\r\n',
        '        var clonesPreview = this._batchClonesPreview;\r\n',
        '        if (!targetSource || !clonesPreview) {\r\n',
        '            this.showBatchCloneModal(ruleType);\r\n',
        '            return;\r\n',
        '        }\r\n',
        '        // 重用 _showBatchStep2 的核心渲染逻辑，但直接用已有 targetSource 和 clonesPreview\r\n',
        '        this._renderBatchStep2UI(ruleType, targetSource, clonesPreview);\r\n',
        '    },\r\n',
        '\r\n',
        '    _renderBatchStep2UI(ruleType, targetSource, clonesPreview) {\r\n',
        '        var html = \'<div class="clone-modal-wrap">\';\r\n',
        '        html += \'<div class="clone-steps"><span class="clone-step-done">\u2713 \u9009\u62e9\u76ee\u6807</span><span class="clone-step-active">\u2461 \u9884\u89c8\u89c4\u5219</span><span class="clone-step">\u2462 \u786e\u8ba4\u514b\u9686</span></div>\';\r\n',
        '        html += \'<div class="clone-batch-header">\';\r\n',
        '        html += \'<div class="clone-batch-title">\u5171 <strong>\' + clonesPreview.length + \'</strong> \u6761\u89c4\u5219\u5c06\u514b\u9686\u81f3 <strong>\' + targetSource.source_name + \'</strong></div>\';\r\n',
        '        html += \'<div class="clone-batch-controls">\';\r\n',
        '        html += \'<label class="checkbox-inline"><input type="checkbox" id="batchEnableAll" onchange="RulesModule._toggleBatchEnable(this)"> \u5168\u90e8\u542f\u7528</label>\';\r\n',
        '        html += \'<button class="btn btn-sm btn-secondary clone-mode-btn" id="cloneModeToggle" onclick="RulesModule._toggleCloneMode()">\u5c55\u5f00\u8be6\u60c5 \u25bc</button>\';\r\n',
        '        html += \'</div></div>\';\r\n',
        '        html += \'<div id="cloneBatchFastMode">\';\r\n',
        '        html += \'<div class="clone-fast-list">\';\r\n',
        '        clonesPreview.forEach(function (item, idx) {\r\n',
        '            html += \'<div class="clone-fast-item"><div class="clone-fast-left">\';\r\n',
        '            html += \'<label class="checkbox-inline"><input type="checkbox" class="batch-enable-cb" data-idx="\' + idx + \'"' + ('" + (item.enabled ? " checked" : "") + "') + '> \u542f\u7528</label>\';\r\n',
        '            html += \'<span class="clone-fast-name">\' + (item.rule.custom_name || I18n.t(item.rule.rule_type)) + \'</span>\';\r\n',
        '            html += \'<span class="clone-fast-arrow">\u2192</span>\';\r\n',
        '            html += \'<input type="text" class="clone-fast-input batch-name-input" data-idx="\' + idx + \'" value="\' + item.newName + \'" maxlength="50">\';\r\n',
        '            html += \'</div></div>\';\r\n',
        '        });\r\n',
        '        html += \'</div></div>\';\r\n',
        '        html += \'<div id="cloneBatchDetailMode" style="display:none;">\';\r\n',
        '        clonesPreview.forEach(function (item, idx) {\r\n',
        '            var r = item.rule;\r\n',
        '            var rType = r.rule_type;\r\n',
        '            html += \'<details class="clone-detail-card"><summary>\' + (r.custom_name || I18n.t(r.rule_type)) + \' \u2192 \' + item.newName + \'</summary>\';\r\n',
        '            html += \'<div class="clone-compare-panel">\';\r\n',
        '            html += \'<div class="clone-side clone-side-left"><div class="clone-side-title">\u539f\u59cb\uff08\u53ea\u8bfb\uff09</div>\';\r\n',
        '            html += \'<div class="clone-field-row"><span class="clone-label">\u540d\u79f0</span><span class="clone-val">\' + (r.custom_name || I18n.t(r.rule_type)) + \'</span></div>\';\r\n',
        '            html += \'<div class="clone-field-row"><span class="clone-label">\u72b6\u6001</span><span class="clone-val">\' + (r.enabled ? \'\U0001f7e2 \u542f\u7528\' : \'\u26aa \u7981\u7528\') + \'</span></div>\';\r\n',
        '            html += \'<div class="clone-params-section">\' + RulesModule.renderRuleParams(r, rType) + \'</div>\';\r\n',
        '            html += \'</div>\';\r\n',
        '            html += \'<div class="clone-side clone-side-right"><div class="clone-side-title">\u514b\u9686\u540e</div>\';\r\n',
        '            html += \'<div class="form-group"><label>\u540d\u79f0</label><input type="text" class="form-control batch-name-input" data-idx="\' + idx + \'" value="\' + item.newName + \'" maxlength="50"></div>\';\r\n',
        '            html += \'<div class="form-group"><label>\u521d\u59cb\u72b6\u6001</label><select class="form-control batch-enable-sel" data-idx="\' + idx + \'"><option value="false"\' + (item.enabled ? \'\' : \' selected\') + \'>\u7981\u7528</option><option value="true"\' + (item.enabled ? \' selected\' : \'\') + \'>\u542f\u7528</option></select></div>\';\r\n',
        '            html += \'</div></div></details>\';\r\n',
        '        });\r\n',
        '        html += \'</div>\';\r\n',
        '        html += \'<div class="modal-actions" style="margin-top:16px;">\';\r\n',
        '        html += \'<button class="btn btn-secondary" onclick="RulesModule._showBatchStep1(RulesModule.getRulesByType(\\\'\' + ruleType + \'\\\'), MockData.dataSources.filter(function(s){return s.source_id!==RulesModule.getRulesByType(\\\'\' + ruleType + \'\\\')[0].source_id;}), RulesModule.getRulesByType(\\\'\' + ruleType + \'\\\')[0].source_id, \\\'\' + ruleType + \'\\\')">\u2190 \u8fd4\u56de</button>\';\r\n',
        '        html += \'<button class="btn btn-primary" onclick="RulesModule._showBatchStep3(\\\'\' + ruleType + \'\\\')">\u4e0b\u4e00\u6b65\uff1a\u786e\u8ba4\u514b\u9686 \u2192</button>\';\r\n',
        '        html += \'</div></div>\';\r\n',
        '        App.showModal(\'\u6279\u91cf\u514b\u9686\u89c4\u5219\', html);\r\n',
        '        this._hideModalFooter();\r\n',
        '    },\r\n',
        '\r\n',
    ]
    lines[toggle_start:toggle_start] = step2_from_state
    print(f'Fix6 OK: inserted _showBatchStep2FromState + _renderBatchStep2UI before _toggleCloneMode at line {toggle_start+1}')
else:
    print('Fix6 FAIL: could not find _toggleCloneMode')

# ====  最终写回  ====
with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print(f'\nAll fixes applied. Total lines now: {len(lines)}')
