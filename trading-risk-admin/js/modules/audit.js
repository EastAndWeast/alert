// 审计日志模块

var AuditModule = {
    render: function () {
        var logs = MockData.auditLogs;

        return '\
            <div class="page-content">\
                <div class="card">\
                    <div class="card-header">\
                        <h3 class="card-title">📜 ' + I18n.t('operation_records') + '</h3>\
                    </div>\
                    <div class="card-body" style="padding: 0;">\
                        <div class="table-container">\
                            <table class="table">\
                                <thead>\
                                    <tr>\
                                        <th>' + I18n.t('time_header') + '</th>\
                                        <th>' + I18n.t('operator_header') + '</th>\
                                        <th>' + I18n.t('action_header') + '</th>\
                                        <th>' + I18n.t('detail_desc_header') + '</th>\
                                        <th>' + I18n.t('ip_header') + '</th>\
                                    </tr>\
                                </thead>\
                                <tbody>' + this.renderLogRows(logs) + '</tbody>\
                            </table>\
                        </div>\
                    </div>\
                </div>\
            </div>';
    },

    renderLogRows: function (logs) {
        if (logs.length === 0) {
            return '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">' + I18n.t('no_records') + '</td></tr>';
        }
        return logs.map(function (log) {
            var user = MockData.users.find(function (u) { return u.user_id === log.user_id; });
            var userName = user ? user.display_name : log.user_id;

            return '\
                <tr>\
                    <td style="white-space: nowrap;">' + log.time + '</td>\
                    <td><strong>' + userName + '</strong></td>\
                    <td><span class="badge badge-info">' + log.action + '</span></td>\
                    <td>' + log.detail + '</td>\
                    <td>' + log.ip + '</td>\
                </tr>';
        }).join('');
    }
};
