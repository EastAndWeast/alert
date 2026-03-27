path = r'c:\Users\haido\Desktop\HexPay\3.AI\Google antigravity\18.Alert项目需求分析\trading-risk-admin\js\modules\rules.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 重新提取 _showBatchStep1 方法的正确代码
# 我们知道它原本应该的样子，现在我们要把 1490 到 1542 行左右的东西整理好。
# 1490: _showBatchStep1(rules, otherSources, currentSourceId, ruleType) {

start_idx = -1
for i, line in enumerate(lines):
    if '_showBatchStep1(rules, otherSources, currentSourceId, ruleType) {' in line:
        start_idx = i
        break

if start_idx != -1:
    # 找到该方法的结尾
    end_idx = -1
    for i in range(start_idx, len(lines)):
        if '    _showBatchStep2(ruleType) {' in lines[i]:
            end_idx = i - 1
            break
    
    if end_idx != -1:
        new_step1 = [
            '    _showBatchStep1(rules, otherSources, currentSourceId, ruleType) {\n',
            '        var currentSource = MockData.dataSources.find(function(s){ return s.source_id === currentSourceId; });\n',
            '        var currentSourceName = currentSource ? currentSource.source_name + \' (\' + currentSource.platform_type + \')\' : currentSourceId;\n',
            '        var html = \'<div class="clone-modal-wrap">\';\n',
            '        html += \'<div class="clone-steps"><span class="clone-step-active">\u2460 \u9009\u62e9\u76ee\u6807</span><span class="clone-step">\u2461 \u9884\u89c8\u89c4\u5219</span><span class="clone-step">\u2462 \u786e\u8ba4\u514b\u9686</span></div>\';\n',
            '        html += \'<div class="clone-route-box">\';\n',
            '        html += \'<div class="clone-route-row"><span class="clone-route-label">\u6765\u6e90\u670d\u52a1\u5668</span><span class="clone-route-val">\' + currentSourceName + \'</span></div>\';\n',
            '        html += \'<div class="clone-route-arrow"><div class="clone-route-arrow-icon">\u2193 \u5c06\u514b\u9686\u5230</div></div>\';\n',
            '        html += \'<div class="clone-route-row"><span class="clone-route-label">\u76ee\u6807\u670d\u52a1\u5668</span>\';\n',
            '        html += \'<select class="form-control clone-route-select" id="batchCloneTarget">\';\n',
            '        otherSources.forEach(function (s) {\n',
            '            html += \'<option value="\' + s.source_id + \'">\' + s.source_name + \' (\' + s.platform_type + \')</option>\';\n',
            '        });\n',
            '        html += \'</select></div></div>\';\n',
            '        html += \'<div class="clone-info-box" style="margin-top:12px;">\u5c06\u514b\u9686\u5f53\u524d\u6570\u636e\u6e90\u4e0b <strong>\' + rules.length + \'</strong> \u6761\u300c\' + I18n.t(ruleType) + \'\u300d\u89c4\u5219</div>\';\n',
            '        html += \'<div class="modal-actions clone-modal-actions">\';\n',
            '        html += \'<button class="btn btn-secondary" onclick="RulesModule._restoreModalFooter();App.hideModal()">\u53d6\u6d88</button>\';\n',
            '        html += \'<button class="btn btn-primary" onclick="RulesModule._showBatchStep2(\\\'\' + ruleType + \'\\\')">\u4e0b\u4e00\u6b65\uff1a\u9884\u89c8\u89c4\u5219 \u2192</button>\';\n',
            '        html += \'</div></div>\';\n',
            '\n',
            '        App.showModal(\'\u6279\u91cf\u514b\u9686\u89c4\u5219\', html);\n',
            '        this._hideModalFooter();\n',
            '        this._injectCloneStyles();\n',
            '    },\n',
            '\n'
        ]
        lines[start_idx:end_idx+1] = new_step1
        print("Fixed _showBatchStep1")

# 写回
with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Done")
