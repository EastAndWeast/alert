// 推送样式管理模块
const PushStylesModule = {
    // 默认模板数据 (模拟持久化)
    templates: {
        zh: {
            teams: `🔴 **紧急告警：{rule_name}**\n\n**告警ID**: {alert_id}\n**触发时间**: {trigger_time}\n**账户ID**: {account_id}\n**产品**: {product}\n**触发值**: {trigger_value}\n**详情**: {details}`,
            lark: `🔴 **紧急告警：{rule_name}**\n\n**告警ID**: {alert_id}\n**触发时间**: {trigger_time}\n**账户ID**: {account_id}\n**产品**: {product}\n**触发值**: {trigger_value}\n**详情**: {details}`,
            telegram: `<b>🔴 紧急告警：{rule_name}</b>\n\n<code>告警ID: {alert_id}</code>\n<code>触发时间: {trigger_time}</code>\n<code>账户ID: {account_id}</code>\n<code>产品: {product}</code>\n<code>触发值: {trigger_value}</code>\n<code>详情: {details}</code>`,
            slack: `*🔴 紧急告警：{rule_name}*\n\n> *告警ID*: {alert_id}\n> *触发时间*: {trigger_time}\n> *账户ID*: {account_id}\n> *产品*: {product}\n> *触发值*: {trigger_value}\n> *详情*: {details}`
        },
        en: {
            teams: `🔴 **Urgent Alert: {rule_name}**\n\n**Alert ID**: {alert_id}\n**Trigger Time**: {trigger_time}\n**Account ID**: {account_id}\n**Product**: {product}\n**Triggered Value**: {trigger_value}\n**Details**: {details}`,
            lark: `🔴 **Urgent Alert: {rule_name}**\n\n**Alert ID**: {alert_id}\n**Trigger Time**: {trigger_time}\n**Account ID**: {account_id}\n**Product**: {product}\n**Triggered Value**: {trigger_value}\n**Details**: {details}`,
            telegram: `<b>🔴 Urgent Alert: {rule_name}</b>\n\n<code>Alert ID: {alert_id}</code>\n<code>Trigger Time: {trigger_time}</code>\n<code>Account ID: {account_id}</code>\n<code>Product: {product}</code>\n<code>Triggered Value: {trigger_value}</code>\n<code>Details: {details}</code>`,
            slack: `*🔴 Urgent Alert: {rule_name}*\n\n> *Alert ID*: {alert_id}\n> *Trigger Time*: {trigger_time}\n> *Account ID*: {account_id}\n> *Product*: {product}\n> *Triggered Value*: {trigger_value}\n> *Details*: {details}`
        }
    },

    activeTab: 'zh', // 当前正在编辑的语言页签

    init() {
        // 注入模块专用样式
        if (!document.getElementById('push-styles-css')) {
            const style = document.createElement('style');
            style.id = 'push-styles-css';
            style.textContent = `
                .tabs-header .btn { padding: 10px 24px; font-weight: 500; transition: all 0.2s; }
                .tabs-header .btn-primary { border-bottom: 2px solid var(--primary-color); border-radius: 4px 4px 0 0; }
                .card-body textarea { border: 1px solid var(--border-color); background: var(--bg-hover); color: var(--text-main); }
                .card-body textarea:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(58, 110, 238, 0.1); }
            `;
            document.head.appendChild(style);
        }
    },

    render() {
        this.init();
        return `
            <div class="push-styles-container">
                <div class="tabs-header" style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-lg); border-bottom: 1px solid var(--border-color);">
                    <button class="btn ${this.activeTab === 'zh' ? 'btn-primary' : 'btn-secondary'}" onclick="PushStylesModule.switchTab('zh')" style="border-bottom-left-radius: 0; border-bottom-right-radius: 0;">${I18n.t('chinese_template')}</button>
                    <button class="btn ${this.activeTab === 'en' ? 'btn-primary' : 'btn-secondary'}" onclick="PushStylesModule.switchTab('en')" style="border-bottom-left-radius: 0; border-bottom-right-radius: 0;">${I18n.t('english_template')}</button>
                </div>

                <div class="grid grid-2">
                    ${this.renderPlatformCard('teams', '👥', 'platform_teams')}
                    ${this.renderPlatformCard('lark', '🐦', 'platform_lark')}
                    ${this.renderPlatformCard('telegram', '✈️', 'platform_telegram')}
                    ${this.renderPlatformCard('slack', '💬', 'platform_slack')}
                </div>

                <div style="display: flex; justify-content: flex-end; gap: var(--spacing-md); margin-top: var(--spacing-xl);">
                    <button class="btn btn-secondary" onclick="PushStylesModule.reset()">${I18n.t('reset_defaults')}</button>
                    <button class="btn btn-primary" onclick="PushStylesModule.save()">${I18n.t('save_settings')}</button>
                </div>
            </div>
        `;
    },

    renderPlatformCard(platform, icon, i18nKey) {
        const content = this.templates[this.activeTab][platform];
        return `
            <div class="card">
                <div class="card-header" style="display: flex; align-items: center; justify-content: space-between;">
                    <h3 class="card-title">${icon} ${I18n.t(i18nKey)}</h3>
                </div>
                <div class="card-body">
                    <div class="form-group">
                        <label class="form-label">${I18n.t('template_edit')}</label>
                        <textarea class="form-input" id="tpl-${platform}" style="height: 120px; font-family: monospace; font-size: 13px; line-height: 1.5;" placeholder="${I18n.t('placeholder_template')}">${content}</textarea>
                    </div>
                </div>
            </div>
        `;
    },

    switchTab(lang) {
        this.activeTab = lang;
        Router.refresh();
    },

    save() {
        const platforms = ['teams', 'lark', 'telegram', 'slack'];
        platforms.forEach(p => {
            const el = document.getElementById(`tpl-${p}`);
            if (el) {
                this.templates[this.activeTab][p] = el.value;
            }
        });
        App.showToast('success', I18n.t('template_saved'));
    },

    reset() {
        if (confirm(I18n.currentLang === 'en' ? 'Are you sure to reset all templates?' : '确定要重置所有模板吗？')) {
            Router.refresh();
        }
    }
};
