# Scalping触发值显示优化 - 实施记录

**实施时间**: 2026-02-09  
**方案**: 完整信息显示 + 更长宽度 + Hover提示

---

## 实施内容

### 1. JavaScript修改

**文件**: `trading-risk-admin/js/modules/alerts.js`

#### 修改1: formatTriggerValue函数 (Line 189-218)

```javascript
// Scalping: 显示完整信息 (持仓时间 | 手数 | 盈利)
if (t === 'scalping') {
    var d = alert.details;
    var parts = [v + 's'];
    
    if (d && d.lots) {
        parts.push(d.lots + I18n.t('lot_unit'));
    }
    
    if (d && d.profit_usd !== undefined) {
        var profit = (d.profit_usd >= 0 ? '+$' : '-$') + Utils.formatNumber(Math.abs(d.profit_usd));
        parts.push(profit);
    }
    
    return parts.join(' | ');
}
```

**效果**: 将原来的`35s`改为`35s | 2.0手 | +$850`

#### 修改2: 表格列渲染 (Line 150)

```javascript
// 添加CSS类和title属性
row += '<td class="trigger-value-cell" title="' + self.formatTriggerValue(alert) + '"><strong>' + self.formatTriggerValue(alert) + '</strong></td>';
```

**效果**: 
- 应用特定CSS类
- hover时显示完整内容

---

### 2. CSS修改

**文件**: `trading-risk-admin/css/styles.css`

**新增**: 触发值列样式 (在Line 551之后)

```css
/* 触发值列特殊样式 */
.trigger-value-cell {
    min-width: 180px;     /* 最小宽度180px */
    max-width: 250px;     /* 最大宽度250px */
    white-space: nowrap;  /* 不换行 */
    overflow: hidden;     /* 隐藏溢出 */
    text-overflow: ellipsis; /* 显示省略号 */
}

.trigger-value-cell strong {
    cursor: help;  /* hover时显示帮助光标 */
}
```

**效果**:
- 给触发值列更多空间(180-250px)
- 内容过长时显示省略号
- hover显示完整内容(通过title属性)

---

## 显示效果

### 优化前
```
触发值
35s
28s
42s
```

### 优化后
```
触发值
35s | 2.0手 | +$850
28s | 1.5手 | +$520
42s | 0.8手 | +$1,200
```

### 如果宽度不够
```
触发值
35s | 2.0手 | +$...  ← hover显示完整内容
```

---

## 技术细节

### 文本溢出处理

CSS三要素配合使用:
1. `white-space: nowrap` - 强制单行显示
2. `overflow: hidden` - 隐藏溢出部分
3. `text-overflow: ellipsis` - 用省略号代替溢出内容

### Hover显示机制

通过HTML的`title`属性实现:
```html
<td class="trigger-value-cell" title="35s | 2.0手 | +$850">
  <strong>35s | 2.0手 | +$850</strong>
</td>
```

浏览器原生支持,无需额外JavaScript。

---

## 其他规则类型

当前修改只影响Scalping,其他规则类型保持不变:

| 规则类型 | 触发值显示 | 是否修改 |
|---------|-----------|---------|
| large_trade_lots | `15.5 手` | ❌ 不变 |
| large_trade_usd | `$125,000` | ❌ 不变 |
| liquidity_trade | `15.5 手` | ❌ 不变 |
| **scalping** | `35s | 2.0手 | +$850` | ✅ **已优化** |
| exposure_alert | `$12,500,000` | ❌ 不变 |

---

## 测试建议

### 浏览器测试
1. 打开告警记录页面
2. 筛选Scalping类型告警
3. 检查触发值列显示格式
4. hover触发值查看title提示
5. 调整浏览器宽度测试响应式

### 数据边界测试
- ✅ 正常数据: `35s | 2.0手 | +$850`
- ✅ 缺少手数: `35s | +$850`
- ✅ 缺少盈利: `35s | 2.0手`
- ✅ 只有时间: `35s`
- ✅ 亏损交易: `35s | 1.5手 | -$120`

---

**状态**: ✅ 实施完成,待测试验证
