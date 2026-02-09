# Watch List alert_priority字段移除记录

**修改时间**: 2026-02-09 14:32  
**修改原因**: 用户要求去掉alert_priority字段

---

## 修改内容

### 修改文件
- `trading-risk-admin/js/modules/rules.js`

### 删除位置1: 配置对话框

**Line 596-599** (已删除):
```javascript
html += '<div class="form-group"><label>' + I18n.t('alert_priority_label') + '</label><select name="alert_priority" class="form-control">';
html += '<option value="HIGH"' + (p && p.alert_priority === 'HIGH' ? ' selected' : '') + '>' + I18n.t('high') + ' (' + I18n.t('red') + ')</option>';
html += '<option value="INFO"' + (p && p.alert_priority === 'INFO' ? ' selected' : '') + '>' + I18n.t('normal') + ' (' + I18n.t('blue') + ')</option>';
html += '</select></div>';
```

**作用**: 配置规则时选择告警优先级(HIGH/INFO)

### 删除位置2: 规则卡片显示

**Line 142** (已删除):
```javascript
html += '<div class="param-item"><strong>' + I18n.t('priority_label') + '：</strong>' + p.alert_priority + '</div>';
```

**作用**: 规则列表卡片中显示"优先级: HIGH/INFO"字段

---

## 修改后的配置界面

Watch List配置项:
1. ✅ 监控账号 (逗号分隔ID) - 保留
2. ✅ 监控动作 (开仓/挂单) - 保留
3. ❌ ~~告警优先级~~ - **已删除**
4. ✅ 最小手数限制 - 保留

## 修改后的卡片显示

Watch List卡片显示:
1. ✅ 监控账号数量 - 保留
2. ❌ ~~优先级~~ - **已删除**

---

## 影响

### UI变化
- 配置对话框不再显示"alert_priority_label"下拉框
- 规则卡片不再显示"优先级: HIGH/INFO"
- 界面更简洁

### 数据结构
如果后端仍需要此字段,可能需要:
- 使用默认值(如统一为HIGH)
- 或在后端自动设置

---

**状态**: ✅ 两处都已删除完成
