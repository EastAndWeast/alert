// 个人资料模块

var ProfileModule = {
    render: function () {
        var user = MockData.currentUser;
        if (!user) return '<div class="empty-state">' + I18n.t('error_user_not_found') + '</div>';

        return '\
            <div class="page-content">\
                <div class="grid grid-2">\
                    <div class="card">\
                        <div class="card-header">\
                            <h3 class="card-title">👤 ' + I18n.t('basic_info') + '</h3>\
                        </div>\
                        <div class="card-body">\
                            <div class="profile-info-grid">\
                                <div class="info-item">\
                                    <label>' + I18n.t('display_name_label') + '</label>\
                                    <div class="info-value">' + user.display_name + '</div>\
                                </div>\
                                <div class="info-item">\
                                    <label>' + I18n.t('username_label') + '</label>\
                                    <div class="info-value">' + user.username + '</div>\
                                </div>\
                                <div class="info-item">\
                                    <label>' + I18n.t('email_label') + '</label>\
                                    <div class="info-value">' + user.email + '</div>\
                                </div>\
                                <div class="info-item">\
                                    <label>' + I18n.t('system_role_label') + '</label>\
                                    <div class="info-value"><span class="badge badge-primary">' + I18n.t(user.role) + '</span></div>\
                                </div>\
                                <div class="info-item">\
                                    <label>' + I18n.t('company_label') + '</label>\
                                    <div class="info-value">' + (Utils.getCompanyName(user.company_id) || I18n.t('system_direct')) + '</div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                    <div class="card">\
                        <div class="card-header">\
                            <h3 class="card-title">🔐 ' + I18n.t('change_password') + '</h3>\
                        </div>\
                        <div class="card-body">\
                            <form id="passwordForm" onsubmit="ProfileModule.handlePasswordChange(event)">\
                                <div class="form-group">\
                                    <label class="form-label">' + I18n.t('old_password_label') + '</label>\
                                    <input type="password" name="old_password" class="form-input" required placeholder="' + I18n.t('placeholder_old_password') + '">\
                                </div>\
                                <div class="form-group">\
                                    <label class="form-label">' + I18n.t('new_password_label') + '</label>\
                                    <input type="password" name="new_password" id="new_password" class="form-input" required placeholder="' + I18n.t('placeholder_new_password') + '">\
                                </div>\
                                <div class="form-group">\
                                    <label class="form-label">' + I18n.t('confirm_password_label') + '</label>\
                                    <input type="password" name="confirm_password" class="form-input" required placeholder="' + I18n.t('placeholder_confirm_password') + '">\
                                </div>\
                                <button type="submit" class="btn btn-primary w-full">' + I18n.t('confirm_change') + '</button>\
                            </form>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <style>\
                .profile-info-grid { display: grid; gap: 20px; }\
                .info-item label { color: var(--text-muted); font-size: 12px; margin-bottom: 4px; display: block; }\
                .info-value { font-size: 16px; font-weight: 500; color: var(--text-primary); }\
                .w-full { width: 100%; }\
            </style>';
    },

    handlePasswordChange: function (e) {
        e.preventDefault();
        var form = e.target;
        var formData = new FormData(form);
        var oldPass = formData.get('old_password');
        var newPass = formData.get('new_password');
        var confirmPass = formData.get('confirm_password');

        var user = MockData.currentUser;

        if (oldPass !== user.password) {
            App.showToast('error', I18n.t('error_old_password_incorrect'));
            return;
        }

        if (newPass !== confirmPass) {
            App.showToast('error', I18n.t('error_password_mismatch'));
            return;
        }

        if (newPass.length < 6) {
            App.showToast('error', I18n.t('error_password_too_short'));
            return;
        }

        // 更新 MockData
        user.password = newPass;
        MockData.addAuditLog('CHANGE_PASSWORD', I18n.t('audit_change_password_self'));
        App.showToast('success', I18n.t('password_changed_success'));
        form.reset();
    }
};
