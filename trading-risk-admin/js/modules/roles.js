// 角色管理模块

var RolesModule = {
    render: function () {
        var currentUser = MockData.currentUser;
        var canManage = Permissions.canManageRoles(currentUser);

        if (!canManage) {
            return '<div class="empty-state"><div class="empty-state-icon">🔒</div><div class="empty-state-title">' + I18n.t('no_access') + '</div><div class="empty-state-desc">' + I18n.t('no_role_manage_permission') + '</div></div>';
        }

        var roles = MockData.roles;
        var systemRoles = roles.filter(function (r) { return r.is_system; });
        var customRoles = roles.filter(function (r) { return !r.is_system; });

        return '\
            <div class="grid grid-3" style="margin-bottom: var(--spacing-lg);">\
                <div class="stat-card">\
                    <div class="stat-icon">🔐</div>\
                    <div class="stat-value">' + roles.length + '</div>\
                    <div class="stat-label">' + I18n.t('total_roles') + '</div>\
                </div>\
                <div class="stat-card info">\
                    <div class="stat-icon">🔒</div>\
                    <div class="stat-value">' + systemRoles.length + '</div>\
                    <div class="stat-label">' + I18n.t('system_roles') + '</div>\
                </div>\
                <div class="stat-card success">\
                    <div class="stat-icon">✨</div>\
                    <div class="stat-value">' + customRoles.length + '</div>\
                    <div class="stat-label">' + I18n.t('custom_roles') + '</div>\
                </div>\
            </div>\
            ' + this.renderPermissionList() + '\
            <div class="card">\
                <div class="card-header">\
                    <h3 class="card-title">🔐 ' + I18n.t('role_list') + '</h3>\
                    <button class="btn btn-primary" onclick="RolesModule.addRole()">+ ' + I18n.t('add_role') + '</button>\
                </div>\
                <div class="card-body" style="padding: 0;">\
                    <div class="table-container">\
                        <table class="table">\
                            <thead>\
                                <tr>\
                                    <th>' + I18n.t('role_id_header') + '</th>\
                                    <th>' + I18n.t('role_key_header') + '</th>\
                                    <th>' + I18n.t('role_name_header') + '</th>\
                                    <th>' + I18n.t('perm_level_header') + '</th>\
                                    <th>' + I18n.t('type_header') + '</th>\
                                    <th>' + I18n.t('perm_count_header') + '</th>\
                                    <th>' + I18n.t('created_time_header') + '</th>\
                                    <th>' + I18n.t('actions_header') + '</th>\
                                </tr>\
                            </thead>\
                            <tbody>' + this.renderTableRows(roles) + '</tbody>\
                        </table>\
                    </div>\
                </div>\
            </div>';
    },

    renderPermissionList: function () {
        var permissions = MockData.permissionDefinitions;
        return '\
            <div class="card" style="margin-bottom: var(--spacing-lg);">\
                <div class="card-header">\
                    <h3 class="card-title">📋 ' + I18n.t('available_perm_list') + '</h3>\
                </div>\
                <div class="card-body">\
                    <div class="grid grid-5">\
                        ' + permissions.map(function (p) {
            return '<div class="permission-item" style="display: flex; align-items: center; gap: 8px; padding: 12px; background: var(--bg-tertiary); border-radius: var(--border-radius-sm);">\
                                <span style="font-size: 20px;">' + p.icon + '</span>\
                                <div>\
                                    <div style="font-weight: 500;">' + I18n.t('perm_' + p.key) + '</div>\
                                    <div style="font-size: 12px; color: var(--text-muted);">' + I18n.t(p.menu_key || p.key) + '</div>\
                                </div>\
                            </div>';
        }).join('') + '\
                    </div>\
                </div>\
            </div>';
    },

    renderTableRows: function (roles) {
        return roles.map(function (r) {
            var permCount = r.permissions.length;
            var canEdit = !r.is_system || Permissions.isSuperAdmin(MockData.currentUser);
            var canDelete = !r.is_system;

            return '\
                <tr>\
                    <td><code>' + r.role_id + '</code></td>\
                    <td><code>' + r.role_key + '</code></td>\
                    <td><span class="badge badge-' + r.color + '">' + I18n.t(r.role_key) + '</span></td>\
                    <td>' + r.level + '</td>\
                    <td>' + (r.is_system ? '<span class="badge badge-secondary">' + I18n.t('system_builtin') + '</span>' : '<span class="badge badge-success">' + I18n.t('custom_type') + '</span>') + '</td>\
                    <td><span class="badge badge-info">' + permCount + ' ' + I18n.t('unit_items') + '</span></td>\
                    <td>' + r.created_at + '</td>\
                    <td>\
                        <button class="btn btn-sm btn-secondary" onclick="RolesModule.viewRole(\'' + r.role_id + '\')">' + I18n.t('view') + '</button>\
                        ' + (canEdit ? '<button class="btn btn-sm btn-primary" style="margin-left: 4px;" onclick="RolesModule.editRole(\'' + r.role_id + '\')">' + I18n.t('edit') + '</button>' : '') + '\
                        ' + (canDelete ? '<button class="btn btn-sm btn-danger" style="margin-left: 4px;" onclick="RolesModule.deleteRole(\'' + r.role_id + '\')">' + I18n.t('delete') + '</button>' : '') + '\
                    </td>\
                </tr>';
        }).join('');
    },

    viewRole: function (roleId) {
        var role = MockData.roles.find(function (r) { return r.role_id === roleId; });
        if (!role) {
            App.showToast('error', I18n.t('error_role_not_found'));
            return;
        }

        var permissionsHtml = role.permissions.map(function (pKey) {
            var pDef = MockData.permissionDefinitions.find(function (p) { return p.key === pKey; });
            if (pDef) {
                return '<div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: var(--bg-tertiary); border-radius: var(--border-radius-sm); margin-bottom: 4px;">\
                    <span>' + pDef.icon + '</span>\
                    <span>' + I18n.t('perm_' + pDef.key) + '</span>\
                    <span style="color: var(--text-muted); font-size: 12px;">(' + I18n.t(pDef.menu_key || pDef.key) + ')</span>\
                </div>';
            }
            return '';
        }).join('');

        App.showModal(I18n.t('view_role') + ' - ' + I18n.t(role.role_key), '\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('role_key_label') + '</label>\
                <div style="padding: 12px; background: var(--bg-tertiary); border-radius: var(--border-radius-sm);"><code>' + role.role_key + '</code></div>\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('role_name_label') + '</label>\
                <div style="padding: 12px; background: var(--bg-tertiary); border-radius: var(--border-radius-sm);"><span class="badge badge-' + role.color + '">' + I18n.t(role.role_key) + '</span></div>\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('perm_level_label') + '</label>\
                <div style="padding: 12px; background: var(--bg-tertiary); border-radius: var(--border-radius-sm);">' + role.level + '</div>\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('type_label') + '</label>\
                <div style="padding: 12px; background: var(--bg-tertiary); border-radius: var(--border-radius-sm);">' + (role.is_system ? I18n.t('system_builtin') : I18n.t('custom_role')) + '</div>\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('owned_permissions') + ' (' + role.permissions.length + ' ' + I18n.t('unit_items') + ')</label>\
                <div style="max-height: 200px; overflow-y: auto;">' + (permissionsHtml || '<div style="color: var(--text-muted); padding: 8px;">' + I18n.t('no_perms') + '</div>') + '</div>\
            </div>\
        ');

        // 隐藏确认按钮
        var confirmBtn = document.getElementById('modalConfirm');
        if (confirmBtn) confirmBtn.style.display = 'none';
        var cancelBtn = document.getElementById('modalCancel');
        if (cancelBtn) cancelBtn.textContent = I18n.t('close');
    },

    addRole: function () {
        var permissionsHtml = this.renderPermissionCheckboxes('add', []);
        var colorOptions = this.renderColorOptions('');

        App.showModal(I18n.t('add_role'), '\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('role_key_label') + ' <span style="color: var(--danger);">*</span></label>\
                <input type="text" class="form-input" id="addRoleKey" placeholder="' + I18n.t('placeholder_role_key') + '">\
                <small style="color: var(--text-muted); margin-top: 4px; display: block;">' + I18n.t('role_key_help') + '</small>\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('role_name_label') + ' <span style="color: var(--danger);">*</span></label>\
                <input type="text" class="form-input" id="addRoleName" placeholder="' + I18n.t('placeholder_role_name') + '">\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('perm_level_label') + '</label>\
                <input type="number" class="form-input" id="addRoleLevel" value="50" min="1" max="99">\
                <small style="color: var(--text-muted); margin-top: 4px; display: block;">' + I18n.t('perm_level_help') + '</small>\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('badge_color_label') + '</label>\
                <select class="form-select" id="addRoleColor">' + colorOptions + '</select>\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('bind_perms_label') + ' <span style="color: var(--danger);">*</span></label>\
                <div id="addPermissions" class="checkbox-group">' + permissionsHtml + '</div>\
            </div>\
        ');

        var confirmBtn = document.getElementById('modalConfirm');
        if (confirmBtn) {
            confirmBtn.style.display = '';
            confirmBtn.onclick = function () {
                RolesModule.saveNewRole();
            };
        }
    },

    renderPermissionCheckboxes: function (prefix, selectedPermissions) {
        return MockData.permissionDefinitions.map(function (p) {
            var checked = selectedPermissions.indexOf(p.key) >= 0 ? 'checked' : '';
            return '\
                <label class="checkbox-item" style="display: flex; align-items: center; gap: 8px; padding: 8px 0;">\
                    <input type="checkbox" value="' + p.key + '" ' + checked + '>\
                    <span style="font-size: 18px;">' + p.icon + '</span>\
                    <span>' + I18n.t('perm_' + p.key) + '</span>\
                    <span style="color: var(--text-muted); font-size: 12px;">(' + I18n.t(p.menu_key || p.key) + ')</span>\
                </label>';
        }).join('');
    },

    renderColorOptions: function (selectedColor) {
        var colors = [
            { value: 'primary', name: I18n.t('color_purple') },
            { value: 'success', name: I18n.t('color_green') },
            { value: 'warning', name: I18n.t('color_orange') },
            { value: 'danger', name: I18n.t('color_red') },
            { value: 'info', name: I18n.t('color_blue') },
            { value: 'secondary', name: I18n.t('color_grey') }
        ];
        return colors.map(function (c) {
            return '<option value="' + c.value + '" ' + (selectedColor === c.value ? 'selected' : '') + '>' + c.name + '</option>';
        }).join('');
    },

    saveNewRole: function () {
        var roleKey = document.getElementById('addRoleKey').value.trim();
        var roleName = document.getElementById('addRoleName').value.trim();
        var roleLevel = parseInt(document.getElementById('addRoleLevel').value) || 50;
        var roleColor = document.getElementById('addRoleColor').value;

        // 获取选中的权限
        var permissionCheckboxes = document.querySelectorAll('#addPermissions input[type="checkbox"]:checked');
        var permissions = [];
        permissionCheckboxes.forEach(function (cb) {
            permissions.push(cb.value);
        });

        // 验证
        if (!roleKey) {
            App.showToast('error', I18n.t('error_role_key_required'));
            return;
        }
        if (!/^[a-z][a-z0-9_]*$/.test(roleKey)) {
            App.showToast('error', I18n.t('error_role_key_format'));
            return;
        }
        if (!roleName) {
            App.showToast('error', '请输入角色名称');
            return;
        }
        if (permissions.length === 0) {
            App.showToast('error', I18n.t('error_perm_required'));
            return;
        }

        // 检查角色标识是否已存在
        var existingRole = MockData.roles.find(function (r) { return r.role_key === roleKey; });
        if (existingRole) {
            App.showToast('error', I18n.t('error_role_key_exists'));
            return;
        }

        // 创建角色
        var newRole = MockData.addRole({
            role_key: roleKey,
            role_name: roleName,
            level: roleLevel,
            color: roleColor,
            permissions: permissions
        });

        App.hideModal();
        App.showToast('success', I18n.t('role') + ' ' + (newRole.role_name || I18n.t(newRole.role_key)) + ' ' + I18n.t('created_success_suffix'));
        Router.refresh();
    },

    editRole: function (roleId) {
        var role = MockData.roles.find(function (r) { return r.role_id === roleId; });
        if (!role) {
            App.showToast('error', '角色不存在');
            return;
        }

        var permissionsHtml = this.renderPermissionCheckboxes('edit', role.permissions);
        var colorOptions = this.renderColorOptions(role.color);

        App.showModal(I18n.t('edit_role') + ' - ' + I18n.t(role.role_key), '\
            <input type="hidden" id="editRoleId" value="' + role.role_id + '">\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('role_key_label') + '</label>\
                <div style="padding: 12px; background: var(--bg-tertiary); border-radius: var(--border-radius-sm);"><code>' + role.role_key + '</code></div>\
                <small style="color: var(--text-muted); margin-top: 4px; display: block;">' + I18n.t('role_key_no_change_help') + '</small>\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('role_name_label') + ' <span style="color: var(--danger);">*</span></label>\
                <input type="text" class="form-input" id="editRoleName" value="' + (role.is_system ? I18n.t(role.role_key) : role.role_name) + '">\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('perm_level_label') + '</label>\
                <input type="number" class="form-input" id="editRoleLevel" value="' + role.level + '" min="1" max="99" ' + (role.is_system ? 'disabled' : '') + '>\
                ' + (role.is_system ? '<small style="color: var(--text-muted); margin-top: 4px; display: block;">' + I18n.t('system_role_level_no_change') + '</small>' : '') + '\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('badge_color_label') + '</label>\
                <select class="form-select" id="editRoleColor">' + colorOptions + '</select>\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('bind_perms_label') + '</label>\
                <div id="editPermissions" class="checkbox-group">' + permissionsHtml + '</div>\
            </div>\
        ');

        var confirmBtn = document.getElementById('modalConfirm');
        confirmBtn.onclick = function () {
            RolesModule.saveEditRole();
        };
    },

    saveEditRole: function () {
        var roleId = document.getElementById('editRoleId').value;
        var roleName = document.getElementById('editRoleName').value.trim();
        var roleLevel = parseInt(document.getElementById('editRoleLevel').value) || 50;
        var roleColor = document.getElementById('editRoleColor').value;

        // 获取选中的权限
        var permissionCheckboxes = document.querySelectorAll('#editPermissions input[type="checkbox"]:checked');
        var permissions = [];
        permissionCheckboxes.forEach(function (cb) {
            permissions.push(cb.value);
        });

        // 验证
        if (!roleName) {
            App.showToast('error', '请输入角色名称');
            return;
        }

        var role = MockData.roles.find(function (r) { return r.role_id === roleId; });

        // 系统角色只能修改名称和颜色
        var updateData = {
            role_name: roleName,
            color: roleColor
        };

        if (!role.is_system) {
            updateData.level = roleLevel;
            updateData.permissions = permissions;
        } else {
            // 系统角色也允许修改权限（仅超级管理员）
            if (Permissions.isSuperAdmin(MockData.currentUser)) {
                updateData.permissions = permissions;
            }
        }

        var updatedRole = MockData.updateRole(roleId, updateData);

        if (updatedRole) {
            App.hideModal();
            App.showToast('success', I18n.t('role') + ' ' + (updatedRole.role_name || I18n.t(updatedRole.role_key)) + ' ' + I18n.t('updated_success_suffix'));
            Router.refresh();
        } else {
            App.showToast('error', I18n.t('error_update_failed'));
        }
    },

    deleteRole: function (roleId) {
        var role = MockData.roles.find(function (r) { return r.role_id === roleId; });
        if (!role) {
            App.showToast('error', '角色不存在');
            return;
        }

        if (role.is_system) {
            App.showToast('error', I18n.t('error_system_role_no_delete'));
            return;
        }

        // 检查是否有用户在使用此角色
        var usersWithRole = MockData.users.filter(function (u) { return u.role === role.role_key; });
        if (usersWithRole.length > 0) {
            App.showToast('error', I18n.t('error_role_in_use_prefix') + ' ' + usersWithRole.length + ' ' + I18n.t('error_role_in_use_suffix'));
            return;
        }

        App.showModal(I18n.t('confirm_delete'), '\
            <div style="text-align: center; padding: 20px 0;">\
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>\
                <p style="font-size: 16px; margin-bottom: 8px;">' + I18n.t('confirm_delete_role_prefix') + ' <strong>' + (role.role_name || I18n.t(role.role_key)) + '</strong> ' + I18n.t('confirm_delete_role_suffix') + '</p>\
                <p style="color: var(--text-muted);">' + I18n.t('action_irreversible') + '</p>\
            </div>\
        ');

        var confirmBtn = document.getElementById('modalConfirm');
        confirmBtn.className = 'btn btn-danger';
        confirmBtn.textContent = I18n.t('confirm_delete');
        confirmBtn.onclick = function () {
            var success = MockData.deleteRole(roleId);
            if (success) {
                App.hideModal();
                App.showToast('success', I18n.t('role_deleted'));
                Router.refresh();
            } else {
                App.showToast('error', I18n.t('error_delete_failed'));
            }
        };
    }
};
