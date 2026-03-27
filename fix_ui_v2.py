import re

path = r'c:\Users\haido\Desktop\HexPay\3.AI\Google antigravity\18.Alert项目需求分析\trading-risk-admin\js\modules\rules.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 优化规则卡片页脚布局
# 我们找到 renderRuleCard 的末尾部分
old_footer_pattern = r'html \+= \'<div class="rule-card-footer">\';\s*html \+= \'<div class="rule-stats">\';\s*html \+= \'<span class="stat-item"><i data-lucide="bar-chart-3"></i> \' \+ I18n\.t\(\'triggered\'\) \+ \': \' \+ rule\.triggered_count \+ \' \' \+ I18n\.t\(\'times\'\) \+ \'</span>\';\s*html \+= \'</div>\';'

new_footer = """        html += '<div class="rule-card-footer" style="flex-direction:column; align-items:stretch; gap:12px; padding:12px;">';
        html += '<div class="rule-stats" style="border-bottom:1px dashed var(--border-color); padding-bottom:8px; width:100%; display:flex; justify-content:flex-start;">';
        html += '<span class="stat-item" style="color:var(--text-muted); font-size:12px;"><i data-lucide="bar-chart-3" style="width:13px; height:13px; vertical-align:-2px; margin-right:4px;"></i> ' + I18n.t('triggered') + ': <strong style="color:var(--text-primary); font-size:14px; margin-left:4px;">' + rule.triggered_count + '</strong> ' + I18n.t('times') + '</span>';
        html += '</div>';"""

content = re.sub(old_footer_pattern, new_footer, content)

# 确保按钮容器也具有 flex-end 样式
content = content.replace('html += \'<div class="rule-actions">\';', 'html += \'<div class="rule-actions" style="width:100%; justify-content:flex-end; gap:8px; margin-top:2px;">\';')


# 2. 增强单条克隆弹窗 showCloneRuleModal
# 插入路径图逻辑
# 寻找 showCloneRuleModal(ruleId) { ... var html = ... }
# 我们在选择器后面直接插入路径图

# 路径图代码块
route_box_code = """
        // 服务器对比路径图
        var currentSource = MockData.dataSources.find(function(s){ return s.source_id === rule.source_id; });
        var currentSourceName = currentSource ? currentSource.source_name + ' (' + currentSource.platform_type + ')' : rule.source_id;
        
        html += '<div class="clone-route-box" style="margin-bottom:20px;">';
        html += '<div class="clone-route-row"><span class="clone-route-label">来源服务器</span><span class="clone-route-val">' + currentSourceName + '</span></div>';
        html += '<div class="clone-route-arrow"><div class="clone-route-arrow-icon">↓ 将克隆到</div></div>';
        html += '<div class="clone-route-row"><span class="clone-route-label">目标服务器</span><span class="clone-route-val" id="cloneSingleRouteTarget">' + defaultTarget.source_name + ' (' + defaultTarget.platform_type + ')</span></div>';
        html += '</div>';
"""

# 寻找插入点：在 html += '</select></div>'; 之后
insert_point = "html += '</select></div>';"
content = content.replace(insert_point, insert_point + route_box_code)

# 更新 onSingleCloneTargetChange 以同步更新路径图
content = content.replace("document.getElementById('cloneSingleTargetName').textContent = targetSource.source_name;", 
                         "document.getElementById('cloneSingleTargetName').textContent = targetSource.source_name;\n        document.getElementById('cloneSingleRouteTarget').textContent = targetSource.source_name + ' (' + targetSource.platform_type + ')';")

# 统一按钮靠右对齐
content = content.replace('html += \'<div class="modal-actions" style="margin-top:20px;">\';', 'html += \'<div class="modal-actions clone-modal-actions" style="margin-top:20px;">\';')

# 写回
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated rules.js successfully")
