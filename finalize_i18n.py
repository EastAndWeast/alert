import re
import os

i18n_path = r'c:\Users\haido\Desktop\HexPay\3.AI\Google antigravity\18.Alert项目需求分析\trading-risk-admin\js\i18n.js'
rules_path = r'c:\Users\haido\Desktop\HexPay\3.AI\Google antigravity\18.Alert项目需求分析\trading-risk-admin\js\modules\rules.js'

# 1. Update i18n.js
new_en_keys = {
    'batch_clone_tip': 'Bulk clone all rules to other servers',
    'clone_this_to_other_tip': 'Clone this rule to other servers',
    'source_server': 'Source Server',
    'target_server': 'Target Server',
    'will_clone_to': 'Will Clone To',
    'original_rule_readonly': '📋 Original Rule (Read Only)',
    'cloned_preview_editable': '✏️ Cloned Rule (Editable)',
    'initial_status': 'Initial Status',
    'disable_recommended': 'Disabled (Recommended, review before enabling)',
    'confirm_clone': 'Confirm Clone',
    'clone_success_to': '✅ Successfully cloned rule to ',
    'no_rules_to_clone': 'No rules found for this type to clone.',
    'no_other_servers': 'No other servers available, please add data sources first.',
    'step_1_select_target': '① Select Target',
    'step_2_preview_rules': '② Preview Rules',
    'step_3_confirm_clone': '③ Confirm Clone',
    'step_1_done': '✓ Select Target',
    'step_2_done': '✓ Preview Rules',
    'will_clone_count_prefix': 'Cloning ',
    'will_clone_count_unit': ' rules under current source',
    'next_preview_rules': 'Next: Preview Rules →',
    'next_confirm_clone': 'Next: Confirm Clone →',
    'total_prefix': 'Total ',
    'rules_will_clone_to': ' rules will be cloned to ',
    'enable_all': 'Enable All',
    'expand_details': 'Expand Details ▼',
    'collapse_details': 'Collapse Details ▲',
    'successfully_cloned': '✅ Successfully cloned ',
    'rules_to_server': ' rules to ',
    'about_to_clone': 'About to clone ',
    'input_target_name_to_confirm': 'Please enter target server name below to confirm:',
    'match_name_to_enable': '* Enter identical server name to enable confirm button',
    'start_execute_clone': 'Start Execute Clone',
    'return': '← Back',
    'return_preview': '← Back to Preview',
    'clone_preview_note': '📋 Parameters will be copied as-is'
}

new_zh_keys = {
    'batch_clone_tip': '批量克隆全部规则到其他服务器',
    'clone_this_to_other_tip': '克隆此规则到其他服务器',
    'source_server': '来源服务器',
    'target_server': '目标服务器',
    'will_clone_to': '将克隆到',
    'original_rule_readonly': '📋 原始规则（只读）',
    'cloned_preview_editable': '✏️ 克隆后（可调整）',
    'initial_status': '初始状态',
    'disable_recommended': '禁用（推荐，审查后再开启）',
    'confirm_clone': '确认克隆',
    'clone_success_to': '✅ 成功克隆规则到 ',
    'no_rules_to_clone': '当前规则类型下没有可克隆的规则。',
    'no_other_servers': '暂无其他服务器可选，请先添加数据源。',
    'step_1_select_target': '① 选择目标',
    'step_2_preview_rules': '② 预览规则',
    'step_3_confirm_clone': '③ 确认克隆',
    'step_1_done': '✓ 选择目标',
    'step_2_done': '✓ 预览规则',
    'will_clone_count_prefix': '将克隆当前数据源下 ',
    'will_clone_count_unit': ' 条规则',
    'next_preview_rules': '下一步：预览规则 →',
    'next_confirm_clone': '下一步：确认克隆 →',
    'total_prefix': '共 ',
    'rules_will_clone_to': ' 条规则将克隆至 ',
    'enable_all': '全部启用',
    'expand_details': '展开详情 ▼',
    'collapse_details': '收起详情 ▲',
    'successfully_cloned': '✅ 成功克隆 ',
    'rules_to_server': ' 条规则至 ',
    'about_to_clone': '即将克隆 ',
    'input_target_name_to_confirm': '请在下方输入目标服务器名称以确认操作：',
    'match_name_to_enable': '* 输入内容与服务器名称完全一致后，方可点击确认',
    'start_execute_clone': '开始执行克隆',
    'return': '← 返回',
    'return_preview': '← 返回预览',
    'clone_preview_note': '📋 参数将原样复制'
}

with open(i18n_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Append keys to en
en_match = re.search(r"\'en\'\:\s*\{", content)
if en_match:
    pos = en_match.end()
    en_entries = ""
    for k, v in new_en_keys.items():
        if f"'{k}':" not in content:
            en_entries += f"\n            '{k}': '{v}',"
    content = content[:pos] + en_entries + content[pos:]

# Append keys to zh
zh_match = re.search(r"\'zh\'\:\s*\{", content)
if zh_match:
    pos = zh_match.end()
    zh_entries = ""
    for k, v in new_zh_keys.items():
        if f"'{k}':" not in content:
            zh_entries += f"\n            '{k}': '{v}',"
    content = content[:pos] + zh_entries + content[pos:]

with open(i18n_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated i18n.js successfully")

# 2. Update rules.js
with open(rules_path, 'r', encoding='utf-8') as f:
    rcontent = f.read()

# Replacements for rules.js
replacements = [
    ('title="批量克隆全部规则到其他服务器"', "title=\"' + I18n.t('batch_clone_tip') + '\""),
    ('> 批量克隆</button>', "> ' + I18n.t('batch_clone') + '</button>"),
    ('title="克隆此规则到其他服务器"', "title=\"' + I18n.t('clone_this_to_other_tip') + '\""),
    ('> 克隆</button>', "> ' + I18n.t('clone') + '</button>"),
    ('来源服务器</span>', "' + I18n.t('source_server') + '</span>"),
    ('目标服务器</span>', "' + I18n.t('target_server') + '</span>"),
    ('↓ 将克隆到', "↓ ' + I18n.t('will_clone_to') + '"),
    ('📋 原始规则（只读）', "' + I18n.t('original_rule_readonly') + '"),
    ('🟢 启用', "🟢 ' + I18n.t('enabled') + '"),
    ('⚪ 禁用', "⚪ ' + I18n.t('disabled') + '"),
    ('✏️ 克隆后（可调整）', "' + I18n.t('cloned_preview_editable') + '"),
    ('<label>规则名称</label>', "<label>' + I18n.t('rule_custom_name_label') + '</label>"),
    ('<label>规则类型</label>', "<label>' + I18n.t('rule_type_label') + '</label>"),
    ('<label>初始状态</label>', "<label>' + I18n.t('initial_status') + '</label>"),
    ('禁用（推荐，审查后再开启）', "' + I18n.t('disable_recommended') + '"),
    ('启用</option>', "' + I18n.t('enable') + '</option>"),
    ('禁用</option>', "' + I18n.t('disable') + '</option>"),
    ('onclick="App.hideModal()">取消</button>', "onclick=\"App.hideModal()\">' + I18n.t('cancel') + '</button>"),
    ("App.showModal('克隆规则'", "App.showModal(I18n.t('clone_rules')"),
    ("App.showModal('批量克隆规则'", "App.showModal(I18n.t('batch_clone')"),
    ('确认克隆</button>', "' + I18n.t('confirm_clone') + '</button>"),
    ("'✅ 成功克隆规则到 '", "I18n.t('clone_success_to')"),
    ("'当前规则类型下没有可克隆的规则。'", "I18n.t('no_rules_to_clone')"),
    ("'暂无其他服务器可选，请先添加数据源。'", "I18n.t('no_other_servers')"),
    ('① 选择目标', "' + I18n.t('step_1_select_target') + '"),
    ('② 预览规则', "' + I18n.t('step_2_preview_rules') + '"),
    ('③ 确认克隆', "' + I18n.t('step_3_confirm_clone') + '"),
    ('将克隆当前数据源下', "' + I18n.t('will_clone_count_prefix') + '"),
    ('条「', "' + I18n.t('will_clone_count_unit') + '「"),
    ('下一步：预览规则 →', "' + I18n.t('next_preview_rules') + '"),
    ('共 <strong>', "' + I18n.t('total_prefix') + ' <strong>"),
    ('条规则将克隆至', "' + I18n.t('rules_will_clone_to') + '"),
    ('全部启用', "' + I18n.t('enable_all') + '"),
    ('展开详情 ▼', "' + I18n.t('expand_details') + '"),
    ('收起详情 ▲', "' + I18n.t('collapse_details') + '"),
    ('← 返回</button>', "' + I18n.t('return') + '</button>"),
    ('← 返回预览</button>', "' + I18n.t('return_preview') + '</button>"),
    ('下一步：确认克隆 →', "' + I18n.t('next_confirm_clone') + '"),
    ('开始执行克隆', "' + I18n.t('start_execute_clone') + '"),
    ("'✅ 成功克隆 '", "I18n.t('successfully_cloned')"),
    ("' 条规则至 '", "I18n.t('rules_to_server')"),
    ('即将克隆', "' + I18n.t('about_to_clone') + '"),
    ('请在下方输入目标服务器名称以确认操作：', "' + I18n.t('input_target_name_to_confirm') + '"),
    ('输入内容与服务器名称完全一致后，方可点击确认', "' + I18n.t('match_name_to_enable') + '"),
    ('✓ 选择目标', "' + I18n.t('step_1_done') + '"),
    ('✓ 预览规则', "' + I18n.t('step_2_done') + '"),
    ('📋 参数将原样复制', "' + I18n.t('clone_preview_note') + '")
]

for target, replacement in replacements:
    rcontent = rcontent.replace(target, replacement)

with open(rules_path, 'w', encoding='utf-8') as f:
    f.write(rcontent)

print("Updated rules.js successfully")
