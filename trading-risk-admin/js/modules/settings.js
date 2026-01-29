// 全局配置模块

const SettingsModule = {
    render() {
        const settings = MockData.globalSettings;
        return `
            <div class="grid grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">💱 ${I18n.t('currency_settings')}</h3>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">${I18n.t('base_currency_label')}</label>
                            <select class="form-select" id="baseCurrency">
                                <option ${settings.base_currency === 'USD' ? 'selected' : ''}>USD</option>
                                <option ${settings.base_currency === 'EUR' ? 'selected' : ''}>EUR</option>
                                <option ${settings.base_currency === 'GBP' ? 'selected' : ''}>GBP</option>
                                <option ${settings.base_currency === 'JPY' ? 'selected' : ''}>JPY</option>
                            </select>
                            <small style="color: var(--text-muted); margin-top: 4px; display: block;">${I18n.t('base_currency_help')}</small>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${I18n.t('rate_source_label')}</label>
                            <select class="form-select" id="rateSource">
                                <option ${settings.exchange_rate_source === 'Reuters' ? 'selected' : ''}>Reuters</option>
                                <option ${settings.exchange_rate_source === 'Bloomberg' ? 'selected' : ''}>Bloomberg</option>
                                <option ${settings.exchange_rate_source === 'ECB' ? 'selected' : ''}>ECB</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🕐 ${I18n.t('timezone_settings')}</h3>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">${I18n.t('default_timezone_label')}</label>
                            <select class="form-select" id="timezone">
                                <option ${settings.default_time_zone === 'Asia/Shanghai' ? 'selected' : ''}>Asia/Shanghai (UTC+8)</option>
                                <option ${settings.default_time_zone === 'Asia/Tokyo' ? 'selected' : ''}>Asia/Tokyo (UTC+9)</option>
                                <option ${settings.default_time_zone === 'Europe/London' ? 'selected' : ''}>Europe/London (UTC+0)</option>
                                <option ${settings.default_time_zone === 'America/New_York' ? 'selected' : ''}>America/New_York (UTC-5)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📊 ${I18n.t('data_settings')}</h3>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">${I18n.t('alert_retention_label')}</label>
                            <input type="number" class="form-input" id="retentionDays" value="${settings.alert_retention_days}">
                            <small style="color: var(--text-muted); margin-top: 4px; display: block;">${I18n.t('alert_retention_help')}</small>
                        </div>
                        <div class="form-group">
                            <label class="form-label">${I18n.t('auto_refresh_label')}</label>
                            <input type="number" class="form-input" id="refreshInterval" value="${settings.auto_refresh_interval}">
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🔔 ${I18n.t('notification_settings')}</h3>
                    </div>
                    <div class="card-body">
                        <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <div style="font-weight: 500;">${I18n.t('email_notify')}</div>
                                <small style="color: var(--text-muted);">${I18n.t('email_notify_desc')}</small>
                            </div>
                            <label class="switch">
                                <input type="checkbox" checked>
                                <span class="switch-slider"></span>
                            </label>
                        </div>
                        <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <div style="font-weight: 500;">${I18n.t('sound_notify')}</div>
                                <small style="color: var(--text-muted);">${I18n.t('sound_notify_desc')}</small>
                            </div>
                            <label class="switch">
                                <input type="checkbox" checked>
                                <span class="switch-slider"></span>
                            </label>
                        </div>
                        <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <div style="font-weight: 500;">${I18n.t('desktop_notify')}</div>
                                <small style="color: var(--text-muted);">${I18n.t('desktop_notify_desc')}</small>
                            </div>
                            <label class="switch">
                                <input type="checkbox">
                                <span class="switch-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="card" style="grid-column: span 2;">
                    <div class="card-header">
                        <h3 class="card-title">🔗 ${I18n.t('webhook_settings')}</h3>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-3">
                            <div>
                                <div class="form-group" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                                    <div style="font-weight: 500;">${I18n.t('lark_notify')}</div>
                                    <label class="switch">
                                        <input type="checkbox" id="larkEnabled" ${settings.lark_enabled ? 'checked' : ''}>
                                        <span class="switch-slider"></span>
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">${I18n.t('lark_webhook_label')}</label>
                                    <input type="text" class="form-input" id="larkWebhook" value="${settings.lark_webhook || ''}" placeholder="https://open.feishu.cn/...">
                                    <small style="color: var(--text-muted); margin-top: 4px; display: block;">${I18n.t('lark_webhook_help')}</small>
                                </div>
                            </div>
                            <div>
                                <div class="form-group" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                                    <div style="font-weight: 500;">${I18n.t('slack_notify')}</div>
                                    <label class="switch">
                                        <input type="checkbox" id="slackEnabled" ${settings.slack_enabled ? 'checked' : ''}>
                                        <span class="switch-slider"></span>
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">${I18n.t('slack_webhook_label')}</label>
                                    <input type="text" class="form-input" id="slackWebhook" value="${settings.slack_webhook || ''}" placeholder="https://hooks.slack.com/...">
                                    <small style="color: var(--text-muted); margin-top: 4px; display: block;">${I18n.t('slack_webhook_help')}</small>
                                </div>
                            </div>
                            <div>
                                <div class="form-group" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                                    <div style="font-weight: 500;">${I18n.t('teams_notify')}</div>
                                    <label class="switch">
                                        <input type="checkbox" id="teamsEnabled" ${settings.teams_enabled ? 'checked' : ''}>
                                        <span class="switch-slider"></span>
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">${I18n.t('teams_webhook_label')}</label>
                                    <input type="text" class="form-input" id="teamsWebhook" value="${settings.teams_webhook || ''}" placeholder="https://outlook.office.com/...">
                                    <small style="color: var(--text-muted); margin-top: 4px; display: block;">${I18n.t('teams_webhook_help')}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: var(--spacing-md); margin-top: var(--spacing-lg);">
                <button class="btn btn-secondary">${I18n.t('reset_defaults')}</button>
                <button class="btn btn-primary" onclick="SettingsModule.saveSettings()">${I18n.t('save_settings')}</button>
            </div>
        `;
    },

    saveSettings() {
        const settings = MockData.globalSettings;
        settings.base_currency = document.getElementById('baseCurrency').value;
        settings.exchange_rate_source = document.getElementById('rateSource').value;
        settings.default_time_zone = document.getElementById('timezone').value;
        settings.alert_retention_days = parseInt(document.getElementById('retentionDays').value);
        settings.auto_refresh_interval = parseInt(document.getElementById('refreshInterval').value);

        // 保存 Webhook 配置
        settings.lark_enabled = document.getElementById('larkEnabled').checked;
        settings.lark_webhook = document.getElementById('larkWebhook').value;
        settings.slack_enabled = document.getElementById('slackEnabled').checked;
        settings.slack_webhook = document.getElementById('slackWebhook').value;
        settings.teams_enabled = document.getElementById('teamsEnabled').checked;
        settings.teams_webhook = document.getElementById('teamsWebhook').value;

        App.showToast('success', I18n.t('settings_saved_success'));
        Router.refresh();
    }
};
