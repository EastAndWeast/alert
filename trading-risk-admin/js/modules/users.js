// 用户管理模块

var UsersModule = {
    render: function () {
        var currentUser = MockData.currentUser;
        var canManage = Permissions.can(currentUser, 'manage_users');

        if (!canManage) {
            return '<div class="empty-state"><div class="empty-state-icon">🔒</div><div class="empty-state-title">' + I18n.t('no_access') + '</div><div class="empty-state-desc">' + I18n.t('no_user_manage_permission') + '</div></div>';
        }

        var users;
        if (Permissions.isSuperAdmin(currentUser)) {
            users = MockData.users;
        } else {
            users = MockData.users.filter(function (u) { return u.company_id === currentUser.company_id; });
        }

        return '\
            <div class="grid grid-4" style="margin-bottom: var(--spacing-lg);">\
                <div class="stat-card">\
                    <div class="stat-icon">👥</div>\
                    <div class="stat-value">' + users.length + '</div>\
                    <div class="stat-label">' + I18n.t('total_users') + '</div>\
                </div>\
                <div class="stat-card danger">\
                    <div class="stat-icon">👑</div>\
                    <div class="stat-value">' + users.filter(function (u) { return u.role === 'super_admin' || u.role === 'company_admin'; }).length + '</div>\
                    <div class="stat-label">' + I18n.t('admins') + '</div>\
                </div>\
                <div class="stat-card info">\
                    <div class="stat-icon">👤</div>\
                    <div class="stat-value">' + users.filter(function (u) { return u.role === 'company_user'; }).length + '</div>\
                    <div class="stat-label">' + I18n.t('operators') + '</div>\
                </div>\
                <div class="stat-card secondary">\
                    <div class="stat-icon">👁️</div>\
                    <div class="stat-value">' + users.filter(function (u) { return u.role === 'viewer'; }).length + '</div>\
                    <div class="stat-label">' + I18n.t('readonly_users') + '</div>\
                </div>\
            </div>\
            ' + this.renderRolePermissions() + '\
            <div class="card">\
                <div class="card-header">\
                    <h3 class="card-title">👤 ' + I18n.t('user_list') + '</h3>\
                    <button class="btn btn-primary" onclick="UsersModule.addUser()">+ ' + I18n.t('add_user') + '</button>\
                </div>\
                <div class="card-body" style="padding: 0;">\
                    <div class="table-container">\
                        <table class="table">\
                            <thead>\
                                <tr>\
                                    <th>' + I18n.t('user_id_header') + '</th>\
                                    <th>' + I18n.t('username_header') + '</th>\
                                    <th>' + I18n.t('display_name_header') + '</th>\
                                    <th>' + I18n.t('email_header') + '</th>\
                                    <th>' + I18n.t('role_header') + '</th>\
                                    ' + (Permissions.isSuperAdmin(currentUser) ? '<th>' + I18n.t('company_header') + '</th>' : '') + '\
                                    <th>' + I18n.t('datasources_header') + '</th>\
                                    <th>' + I18n.t('status_header') + '</th>\
                                    <th>' + I18n.t('created_time_header') + '</th>\
                                    <th>' + I18n.t('actions_header') + '</th>\
                                </tr>\
                            </thead>\
                            <tbody>' + this.renderTableRows(users, currentUser) + '</tbody>\
                        </table>\
                    </div>\
                </div>\
            </div>';
    },

    renderRolePermissions: function () {
        return '\
            <div class="card" style="margin-bottom: var(--spacing-lg);">\
                <div class="card-header">\
                    <h3 class="card-title">🔐 ' + I18n.t('role_perm_desc') + '</h3>\
                </div>\
                <div class="card-body">\
                    <div class="table-container">\
                        <table class="table">\
                            <thead>\
                                <tr>\
                                    <th>' + I18n.t('role_header') + '</th>\
                                    <th>' + I18n.t('company_manage_perm') + '</th>\
                                    <th>' + I18n.t('datasource_manage_perm') + '</th>\
                                    <th>' + I18n.t('user_manage_perm') + '</th>\
                                    <th>' + I18n.t('rule_config_perm') + '</th>\
                                    <th>' + I18n.t('product_map_perm') + '</th>\
                                    <th>' + I18n.t('view_alert_perm') + '</th>\
                                    <th>' + I18n.t('description_header') + '</th>\
                                </tr>\
                            </thead>\
                            <tbody>\
                                <tr>\
                                    <td><span class="badge badge-danger">' + I18n.t('super_admin') + '</span></td>\
                                    <td><span class="badge badge-success">✓</span></td>\
                                    <td><span class="badge badge-success">✓</span></td>\
                                    <td><span class="badge badge-success">✓</span></td>\
                                    <td><span class="badge badge-success">✓</span></td>\
                                    <td><span class="badge badge-success">✓</span></td>\
                                    <td><span class="badge badge-success">✓</span></td>\
                                    <td>' + I18n.t('super_admin_desc_text') + '</td>\
                                </tr>\
                                <tr>\
                                    <td><span class="badge badge-warning">' + I18n.t('company_admin') + '</span></td>\
                                    <td><span class="badge badge-secondary">✗</span></td>\
                                    <td><span class="badge badge-success">✓</span></td>\
                                    <td><span class="badge badge-success">✓</span></td>\
                                    <td><span class="badge badge-success">✓</span></td>\
                                    <td><span class="badge badge-success">✓</span></td>\
                                    <td><span class="badge badge-success">✓</span></td>\
                                    <td>' + I18n.t('company_admin_desc_text') + '</td>\
                                </tr>\
                                <tr>\
                                    <td><span class="badge badge-info">' + I18n.t('company_user') + '</span></td>\
                                    <td><span class="badge badge-secondary">✗</span></td>\
                                    <td><span class="badge badge-secondary">✗</span></td>\
                                    <td><span class="badge badge-secondary">✗</span></td>\
                                    <td><span class="badge badge-success">✓</span></td>\
                                    <td><span class="badge badge-success">✓</span></td>\
                                    <td><span class="badge badge-success">✓</span></td>\
                                    <td>' + I18n.t('company_user_desc_text') + '</td>\
                                </tr>\
                                <tr>\
                                    <td><span class="badge badge-secondary">' + I18n.t('viewer') + '</span></td>\
                                    <td><span class="badge badge-secondary">✗</span></td>\
                                    <td><span class="badge badge-secondary">✗</span></td>\
                                    <td><span class="badge badge-secondary">✗</span></td>\
                                    <td><span class="badge badge-secondary">✗</span></td>\
                                    <td><span class="badge badge-secondary">✗</span></td>\
                                    <td><span class="badge badge-success">✓</span></td>\
                                    <td>' + I18n.t('viewer_desc_text') + '</td>\
                                </tr>\
                            </tbody>\
                        </table>\
                    </div>\
                </div>\
            </div>';
    },

    renderTableRows: function (users, currentUser) {
        return users.map(function (u) {
            var roleInfo = Permissions.roles[u.role] || { name: u.role, color: 'info' };
            var companyName = u.company_id ? Utils.getCompanyName(u.company_id) : I18n.t('global');
            var datasourceNames = (u.datasource_ids || []).map(function (dsId) {
                return Utils.getSourceName(dsId);
            }).join(', ') || '-';

            // 不能删除自己，超级管理员不能被普通管理员删除
            var canDelete = u.user_id !== currentUser.user_id;
            if (u.role === 'super_admin' && !Permissions.isSuperAdmin(currentUser)) {
                canDelete = false;
            }

            return '\
                <tr>\
                    <td><code>' + u.user_id + '</code></td>\
                    <td>' + u.username + '</td>\
                    <td><strong>' + u.display_name + '</strong></td>\
                    <td>' + u.email + '</td>\
                    <td><span class="badge badge-' + roleInfo.color + '">' + I18n.t(u.role) + '</span></td>\
                    ' + (Permissions.isSuperAdmin(currentUser) ? '<td>' + companyName + '</td>' : '') + '\
                    <td><span class="badge badge-info" style="font-size: 11px;">' + datasourceNames + '</span></td>\
                    <td><span class="status-dot ' + (u.status === 'active' ? 'active' : 'danger') + '"></span>' + (u.status === 'active' ? I18n.t('status_active') : I18n.t('status_disabled')) + '</td>\
                    <td>' + (u.created_at || '-') + '</td>\
                    <td>\
                        <button class="btn btn-sm btn-secondary" onclick="UsersModule.editUser(\'' + u.user_id + '\')">' + I18n.t('edit') + '</button>\
                        ' + (canDelete ? '<button class="btn btn-sm btn-danger" style="margin-left: 4px;" onclick="UsersModule.deleteUser(\'' + u.user_id + '\')">' + I18n.t('delete') + '</button>' : '') + '\
                    </td>\
                </tr>';
        }).join('');
    },

    addUser: function () {
        var currentUser = MockData.currentUser;
        var companyOptions;
        var isSuperAdmin = Permissions.isSuperAdmin(currentUser);

        if (isSuperAdmin) {
            companyOptions = '<option value="">全局（超级管理员）</option>' +
                MockData.companies.map(function (c) { return '<option value="' + c.company_id + '">' + c.company_name + '</option>'; }).join('');
        } else {
            companyOptions = '<option value="' + currentUser.company_id + '">' + Utils.getCompanyName(currentUser.company_id) + '</option>';
        }

        var roleOptions = '';
        MockData.roles.forEach(function (r) {
            // 超级管理员角色只有超级管理员可以分配
            if (r.role_key === 'super_admin' && !isSuperAdmin) {
                return;
            }
            roleOptions += '<option value="' + r.role_key + '">' + r.role_name + '</option>';
        });

        App.showModal('添加用户', '\
            <div class="form-group">\
                <label class="form-label">用户名 <span style="color: var(--danger);">*</span></label>\
                <input type="text" class="form-input" id="addUsername" placeholder="输入用户名">\
            </div>\
            <div class="form-group">\
                <label class="form-label">显示名称 <span style="color: var(--danger);">*</span></label>\
                <input type="text" class="form-input" id="addDisplayName" placeholder="输入显示名称">\
            </div>\
            <div class="form-group">\
                <label class="form-label">邮箱 <span style="color: var(--danger);">*</span></label>\
                <input type="email" class="form-input" id="addEmail" placeholder="user@example.com">\
            </div>\
            <div class="form-group">\
                <label class="form-label">密码 <span style="color: var(--danger);">*</span></label>\
                <input type="password" class="form-input" id="addPassword" placeholder="输入初始密码">\
            </div>\
            <div class="form-group">\
                <label class="form-label">确认密码 <span style="color: var(--danger);">*</span></label>\
                <input type="password" class="form-input" id="addPasswordConfirm" placeholder="再次输入密码">\
            </div>\
            <div class="form-group">\
                <label class="form-label">角色 <span style="color: var(--danger);">*</span></label>\
                <select class="form-select" id="addRole">' + roleOptions + '</select>\
            </div>\
            <div class="form-group">\
                <label class="form-label">所属公司</label>\
                <select class="form-select" id="addCompany" onchange="UsersModule.onCompanyChange(\'add\')">' + companyOptions + '</select>\
            </div>\
            <div class="form-group">\
                <label class="form-label">绑定数据源</label>\
                <div id="addDatasources" class="checkbox-group">' + this.renderDatasourceCheckboxes('add', isSuperAdmin ? '' : currentUser.company_id, []) + '</div>\
                <small style="color: var(--text-muted); margin-top: 4px; display: block;">选择用户可访问的数据源</small>\
            </div>\
            <div class="form-group">\
                <label class="form-label">状态</label>\
                <select class="form-select" id="addStatus">\
                    <option value="active" selected>活跃</option>\
                    <option value="inactive">禁用</option>\
                </select>\
            </div>\
        ');

        // 替换确认按钮事件
        var confirmBtn = document.getElementById('modalConfirm');
        confirmBtn.onclick = function () {
            UsersModule.saveNewUser();
        };
    },

    renderDatasourceCheckboxes: function (prefix, companyId, selectedIds) {
        var currentUser = MockData.currentUser;
        var dataSources = MockData.getAvailableDatasources(companyId, currentUser);

        if (dataSources.length === 0) {
            return '<div style="color: var(--text-muted); padding: 8px 0;">无可用数据源</div>';
        }

        return dataSources.map(function (ds) {
            var checked = selectedIds.indexOf(ds.source_id) >= 0 ? 'checked' : '';
            return '\
                <label class="checkbox-item" style="display: flex; align-items: center; gap: 8px; padding: 6px 0;">\
                    <input type="checkbox" value="' + ds.source_id + '" ' + checked + '>\
                    <span class="badge badge-' + (ds.platform_type === 'MT4' ? 'primary' : 'success') + '">' + ds.platform_type + '</span>\
                    ' + ds.source_name + '\
                </label>';
        }).join('');
    },

    onCompanyChange: function (prefix) {
        var companySelect = document.getElementById(prefix + 'Company');
        var datasourcesContainer = document.getElementById(prefix + 'Datasources');
        var companyId = companySelect.value;

        datasourcesContainer.innerHTML = this.renderDatasourceCheckboxes(prefix, companyId, []);
    },

    saveNewUser: function () {
        var username = document.getElementById('addUsername').value.trim();
        var displayName = document.getElementById('addDisplayName').value.trim();
        var email = document.getElementById('addEmail').value.trim();
        var password = document.getElementById('addPassword').value;
        var passwordConfirm = document.getElementById('addPasswordConfirm').value;
        var role = document.getElementById('addRole').value;
        var companyId = document.getElementById('addCompany').value || null;
        var status = document.getElementById('addStatus').value;

        // 获取选中的数据源
        var datasourceCheckboxes = document.querySelectorAll('#addDatasources input[type="checkbox"]:checked');
        var datasourceIds = [];
        datasourceCheckboxes.forEach(function (cb) {
            datasourceIds.push(cb.value);
        });

        // 验证
        if (!username) {
            App.showToast('error', '请输入用户名');
            return;
        }
        if (!displayName) {
            App.showToast('error', '请输入显示名称');
            return;
        }
        if (!email) {
            App.showToast('error', '请输入邮箱');
            return;
        }
        if (!this.validateEmail(email)) {
            App.showToast('error', '邮箱格式不正确');
            return;
        }
        if (!password) {
            App.showToast('error', '请输入密码');
            return;
        }
        if (password.length < 6) {
            App.showToast('error', '密码长度至少6位');
            return;
        }
        if (password !== passwordConfirm) {
            App.showToast('error', '两次输入的密码不一致');
            return;
        }

        // 检查用户名是否已存在
        var existingUser = MockData.users.find(function (u) { return u.username === username; });
        if (existingUser) {
            App.showToast('error', '用户名已存在');
            return;
        }

        // 超级管理员必须没有公司
        if (role === 'super_admin') {
            companyId = null;
        }

        // 创建用户
        var newUser = MockData.addUser({
            username: username,
            display_name: displayName,
            email: email,
            password: password,
            role: role,
            company_id: companyId,
            datasource_ids: datasourceIds,
            status: status
        });

        App.hideModal();
        App.showToast('success', '用户 ' + newUser.display_name + ' 创建成功');
        Router.refresh();
    },

    validateEmail: function (email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    editUser: function (userId) {
        var u = MockData.users.find(function (user) { return user.user_id === userId; });
        var currentUser = MockData.currentUser;

        if (!u) {
            App.showToast('error', '用户不存在');
            return;
        }

        var isSuperAdmin = Permissions.isSuperAdmin(currentUser);
        var companyOptions;

        if (isSuperAdmin) {
            companyOptions = '<option value="" ' + (!u.company_id ? 'selected' : '') + '>全局（超级管理员）</option>' +
                MockData.companies.map(function (c) {
                    return '<option value="' + c.company_id + '" ' + (u.company_id === c.company_id ? 'selected' : '') + '>' + c.company_name + '</option>';
                }).join('');
        } else {
            companyOptions = '<option value="' + currentUser.company_id + '" selected>' + Utils.getCompanyName(currentUser.company_id) + '</option>';
        }

        var roleOptions = '';
        MockData.roles.forEach(function (r) {
            // 超级管理员角色只有超级管理员可以分配
            if (r.role_key === 'super_admin' && !isSuperAdmin) {
                return;
            }
            var selected = u.role === r.role_key ? 'selected' : '';
            roleOptions += '<option value="' + r.role_key + '" ' + selected + '>' + r.role_name + '</option>';
        });

        App.showModal('编辑用户 - ' + u.display_name, '\
            <input type="hidden" id="editUserId" value="' + u.user_id + '">\
            <div class="form-group">\
                <label class="form-label">用户名 <span style="color: var(--danger);">*</span></label>\
                <input type="text" class="form-input" id="editUsername" value="' + u.username + '">\
            </div>\
            <div class="form-group">\
                <label class="form-label">显示名称 <span style="color: var(--danger);">*</span></label>\
                <input type="text" class="form-input" id="editDisplayName" value="' + u.display_name + '">\
            </div>\
            <div class="form-group">\
                <label class="form-label">邮箱 <span style="color: var(--danger);">*</span></label>\
                <input type="email" class="form-input" id="editEmail" value="' + u.email + '">\
            </div>\
            <div class="form-group">\
                <label class="form-label">新密码</label>\
                <input type="password" class="form-input" id="editPassword" placeholder="留空则不修改密码">\
                <small style="color: var(--text-muted); margin-top: 4px; display: block;">如需修改密码请输入新密码</small>\
            </div>\
            <div class="form-group">\
                <label class="form-label">角色</label>\
                <select class="form-select" id="editRole">' + roleOptions + '</select>\
            </div>\
            <div class="form-group">\
                <label class="form-label">所属公司</label>\
                <select class="form-select" id="editCompany" onchange="UsersModule.onCompanyChange(\'edit\')">' + companyOptions + '</select>\
            </div>\
            <div class="form-group">\
                <label class="form-label">绑定数据源</label>\
                <div id="editDatasources" class="checkbox-group">' + this.renderDatasourceCheckboxes('edit', u.company_id, u.datasource_ids || []) + '</div>\
            </div>\
            <div class="form-group">\
                <label class="form-label">状态</label>\
                <select class="form-select" id="editStatus">\
                    <option value="active" ' + (u.status === 'active' ? 'selected' : '') + '>活跃</option>\
                    <option value="inactive" ' + (u.status === 'inactive' ? 'selected' : '') + '>禁用</option>\
                </select>\
            </div>\
        ');

        // 替换确认按钮事件
        var confirmBtn = document.getElementById('modalConfirm');
        confirmBtn.onclick = function () {
            UsersModule.saveEditUser();
        };
    },

    saveEditUser: function () {
        var userId = document.getElementById('editUserId').value;
        var username = document.getElementById('editUsername').value.trim();
        var displayName = document.getElementById('editDisplayName').value.trim();
        var email = document.getElementById('editEmail').value.trim();
        var password = document.getElementById('editPassword').value;
        var role = document.getElementById('editRole').value;
        var companyId = document.getElementById('editCompany').value || null;
        var status = document.getElementById('editStatus').value;

        // 获取选中的数据源
        var datasourceCheckboxes = document.querySelectorAll('#editDatasources input[type="checkbox"]:checked');
        var datasourceIds = [];
        datasourceCheckboxes.forEach(function (cb) {
            datasourceIds.push(cb.value);
        });

        // 验证
        if (!username) {
            App.showToast('error', '请输入用户名');
            return;
        }
        if (!displayName) {
            App.showToast('error', '请输入显示名称');
            return;
        }
        if (!email) {
            App.showToast('error', '请输入邮箱');
            return;
        }
        if (!this.validateEmail(email)) {
            App.showToast('error', '邮箱格式不正确');
            return;
        }
        if (password && password.length < 6) {
            App.showToast('error', '密码长度至少6位');
            return;
        }

        // 检查用户名是否已被其他用户使用
        var existingUser = MockData.users.find(function (u) {
            return u.username === username && u.user_id !== userId;
        });
        if (existingUser) {
            App.showToast('error', '用户名已被使用');
            return;
        }

        // 超级管理员必须没有公司
        if (role === 'super_admin') {
            companyId = null;
        }

        // 更新用户
        var userData = {
            username: username,
            display_name: displayName,
            email: email,
            role: role,
            company_id: companyId,
            datasource_ids: datasourceIds,
            status: status
        };

        if (password) {
            userData.password = password;
        }

        var updatedUser = MockData.updateUser(userId, userData);

        if (updatedUser) {
            App.hideModal();
            App.showToast('success', '用户 ' + updatedUser.display_name + ' 更新成功');
            Router.refresh();
        } else {
            App.showToast('error', '更新失败');
        }
    },

    deleteUser: function (userId) {
        var u = MockData.users.find(function (user) { return user.user_id === userId; });
        if (!u) {
            App.showToast('error', '用户不存在');
            return;
        }

        // 不能删除自己
        if (userId === MockData.currentUser.user_id) {
            App.showToast('error', '不能删除当前登录用户');
            return;
        }

        App.showModal('确认删除', '\
            <div style="text-align: center; padding: 20px 0;">\
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>\
                <p style="font-size: 16px; margin-bottom: 8px;">确定要删除用户 <strong>' + u.display_name + '</strong> 吗？</p>\
                <p style="color: var(--text-muted);">此操作不可恢复</p>\
            </div>\
        ');

        // 替换确认按钮事件
        var confirmBtn = document.getElementById('modalConfirm');
        confirmBtn.className = 'btn btn-danger';
        confirmBtn.textContent = '确认删除';
        confirmBtn.onclick = function () {
            var success = MockData.deleteUser(userId);
            if (success) {
                App.hideModal();
                App.showToast('success', '用户已删除');
                Router.refresh();
            } else {
                App.showToast('error', '删除失败');
            }
        };
    }
};
