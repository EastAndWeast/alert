path_rules = r'c:\Users\haido\Desktop\HexPay\3.AI\Google antigravity\18.Alert项目需求分析\trading-risk-admin\js\modules\rules.js'

with open(path_rules, 'r', encoding='utf-8') as f:
    rules_content = f.read()

# 替换硬编码的 "克隆" 文本为国际化
rules_content = rules_content.replace('onclick="RulesModule.cloneRule(\'' + r"'+ r.rule_id +'" + '\')" title="\u514b\u9686">\u514b<br>\u9686',
                                      'onclick="RulesModule.cloneRule(\'' + r"'+ r.rule_id +'" + '\')" title="\' + I18n.t(\'clone\') + \'"><i data-lucide="copy"></i><span class="btn-text">\' + I18n.t(\'clone\') + \'</span>')
rules_content = rules_content.replace('<button class="btn btn-primary" onclick="RulesModule._toggleBatchCloneMode()">\u25f1 \u6279\u91cf\u514b\u9686</button>',
                                      '<button class="btn btn-primary" onclick="RulesModule._toggleBatchCloneMode()"><i data-lucide="copy-check"></i> \' + I18n.t(\'batch_clone\') + \'</button>')

# 我们替换底部的按钮区样式
rules_content = rules_content.replace('>\u5220<br>\u9664</button>', '><i data-lucide="trash-2"></i></button>') # 纯 Icon 按钮，不再需要文字换行
rules_content = rules_content.replace('>\u7f16<br>\u8f91</button>', '><i data-lucide="edit"></i></button>')
rules_content = rules_content.replace('>\u542f<br>\u7528</button>', '><i data-lucide="play"></i></button>')
rules_content = rules_content.replace('>\u7981<br>\u7528</button>', '><i data-lucide="pause"></i></button>')
rules_content = rules_content.replace('>\u514b<br>\u9686</button>', '><i data-lucide="copy"></i></button>')

# 统计触发次数不换行
old_stats = "html += '<span>' + I18n.t('triggered') + ': ' + Math.floor(Math.random() * 50) + '<br><small>' + I18n.t('times') + '</small></span>';"
new_stats = "html += '<div style=\"display:flex;flex-direction:column;align-items:flex-start;\"><span style=\"font-size:11px;color:var(--text-muted);\">' + I18n.t('triggered') + '</span><strong style=\"font-size:14px;color:var(--text-primary);\">' + Math.floor(Math.random() * 50) + ' <small style=\"font-size:11px;font-weight:normal;color:var(--text-muted);\">' + I18n.t('times') + '</small></strong></div>';"
rules_content = rules_content.replace(old_stats, new_stats)

old_step3_modal = """        var html = '<div class="clone-modal-wrap">';
        html += '<div class="clone-steps"><span class="clone-step-done">\u2713 选择目标</span><span class="clone-step-done">\u2713 预览规则</span><span class="clone-step-active">③ 确认克隆</span></div>';
        html += '<div class="clone-confirm-box">';
        html += '<div class="clone-confirm-icon">\u26a0\ufe0f</div>';
        html += '<div class="clone-confirm-desc">即将克隆 <strong>\' + data.length + \'</strong> 条规则到 <strong>"\' + targetName + \'"</strong></div>';
        html += '<div class="clone-confirm-note">请在下方输入目标服务器名称以确认操作：</div>';
        html += '<input type="text" class="form-control" id="batchCloneConfirmInput" placeholder="\' + targetName + \'" autocomplete="off">';
        html += '<div class="clone-confirm-tip">* 输入内容与服务器名称完全一致后，方可点击确认</div>';
        html += '</div>';
        html += '<div class="modal-actions clone-modal-actions">';
        html += '<button class="btn btn-secondary" onclick="RulesModule._showBatchStep2FromState(\\\'' + ruleType + '\\\')">\u2190 \u8fd4\u56de</button>';
        html += '<button class="btn btn-danger" id="batchCloneConfirmBtn" onclick="RulesModule._executeBatchClone(\\\'' + ruleType + '\\\')" disabled>\u6211\u786e\u8ba4\uff0c\u5f00\u59cb\u514b\u9686</button>';
        html += '</div></div>';"""

new_step3_modal = """        var html = '<div class="clone-modal-wrap">';
        html += '<div class="clone-steps"><span class="clone-step-done">\u2713 选择目标</span><span class="clone-step-done">\u2713 预览规则</span><span class="clone-step-active">③ 确认克隆</span></div>';
        html += '<div class="clone-confirm-box" style="border-color:var(--danger-color); background:rgba(239, 68, 68, 0.04);">';
        html += '<div class="clone-confirm-icon" style="color:var(--danger-color);"><i data-lucide="alert-triangle" style="width:40px;height:40px;"></i></div>';
        html += '<div class="clone-confirm-desc" style="font-size:16px; margin: 16px 0;">即将克隆 <strong>\' + data.length + \'</strong> 条规则到 <strong style="color:var(--danger-color);">"\' + targetName + \'"</strong></div>';
        html += '<div class="clone-confirm-note" style="margin-bottom:12px;">此操作将立即在目标服务器生成规则配置。<br>请在下方手动输入目标服务器名称以防误操作：</div>';
        html += '<input type="text" class="form-control" id="batchCloneConfirmInput" placeholder="输入：\' + targetName + \'" autocomplete="off" style="text-align:center; font-size:16px; padding:12px; font-weight:bold; letter-spacing:1px; max-width:280px; margin:0 auto;">';
        html += '<div class="clone-confirm-tip" style="margin-top:12px;">* 内容完全匹配后，克隆按钮将被激活</div>';
        html += '</div>';
        html += '<div class="modal-actions clone-modal-actions">';
        html += '<button class="btn btn-secondary" onclick="RulesModule._showBatchStep2FromState(\\\'' + ruleType + '\\\')">\u2190 返回预览</button>';
        html += '<button class="btn btn-danger" id="batchCloneConfirmBtn" onclick="RulesModule._executeBatchClone(\\\'' + ruleType + '\\\')" disabled><i data-lucide="zap"></i> 开始执行克隆</button>';
        html += '</div></div>';"""

if old_step3_modal in rules_content:
    rules_content = rules_content.replace(old_step3_modal, new_step3_modal)
    print("Updated step 3 modal")
else:
    print("Warning: old_step3_modal not found! Try searching with regex")
    # let's write a regex that matches the block loosely
    import re
    pat = re.compile(r"var html = '<div class=\"clone-modal-wrap\">';\s*html \+= '<div class=\"clone-steps\">[\s\S]*?</div></div>';", re.MULTILINE)
    m = pat.search(rules_content)
    if m:
        original = m.group(0)
        # However, there are multiple "var html = '<div class=\"clone-modal-wrap\">';" in the file! (Step 1, Step 2, Step 3)
        # So we should only replace the one for Step 3. Step 3 has '✓ 预览规则' and '③ 确认克隆'
        if '③ 确认克隆' in original:
            rules_content = rules_content.replace(original, new_step3_modal)
            print("Updated step 3 modal via regex fallback 1")
    
    # second try: since it might fail because of \u... escapes or single quotes, let's locate the method _showBatchStep3
    start_idx = rules_content.find('_showBatchStep3(ruleType) {')
    if start_idx != -1:
        end_idx = rules_content.find('App.showModal(', start_idx)
        if end_idx != -1:
            method_body = rules_content[start_idx:end_idx]
            old_method = method_body
            new_method = old_method.replace('⚠️', '<i data-lucide="alert-triangle" style="width:40px;height:40px;color:var(--danger-color);"></i>')
            new_method = new_method.replace('<div class="clone-confirm-box">', '<div class="clone-confirm-box" style="border-color:var(--danger-color); background:rgba(239, 68, 68, 0.04);">')
            new_method = new_method.replace('id="batchCloneConfirmInput"', 'id="batchCloneConfirmInput" style="text-align:center; font-size:16px; padding:12px; font-weight:bold; letter-spacing:1px; max-width:280px; margin:0 auto;"')
            new_method = new_method.replace('<button class="btn btn-secondary" onclick="RulesModule._showBatchStep2FromState(\\\'\' + ruleType + \'\\\')">← 返回</button>', '<button class="btn btn-secondary" onclick="RulesModule._showBatchStep2FromState(\\\'\' + ruleType + \'\\\')">← 返回预览</button>')
            new_method = new_method.replace('我确认，开始克隆', '<i data-lucide="zap"></i> 开始执行克隆')
            
            rules_content = rules_content.replace(method_body, new_method)
            print("Updated step 3 modal via _showBatchStep3 body replacement")

# write back rules_content
with open(path_rules, 'w', encoding='utf-8') as f:
    f.write(rules_content)

print("Updated rules.js")
