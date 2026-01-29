// 主应用

var App = {
    init: function () {
        // 检查登录状态
        var storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            window.location.href = 'login.html';
            return;
        }

        try {
            MockData.currentUser = JSON.parse(storedUser);
        } catch (e) {
            console.error('User data parse error', e);
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
            return;
        }

        this.initSidebar();
        this.initModal();
        this.initTime();
        this.initTheme(); // 初始化主题
        I18n.init(); // 初始化翻译
        Router.init();

        // 初始 UI 更新
        this.updateUserDisplay();
        this.updateMenuVisibility();
        this.updateAlertBadge();

        // 设置用户切换器状态 (如果有)
        var switcher = document.getElementById('userSwitcher');
        if (switcher && MockData.currentUser) {
            switcher.value = MockData.currentUser.user_id;
        }
    },

    switchUser: function (userId) {
        var user = MockData.users.find(function (u) { return u.user_id === userId; });
        if (user) {
            MockData.currentUser = user;
            // 更新本地存储，保持登录状态
            localStorage.setItem('currentUser', JSON.stringify(user));

            this.updateUserDisplay();
            this.updateMenuVisibility();
            this.updateAlertBadge();

            // 更新用户切换器选中状态
            var switcher = document.getElementById('userSwitcher');
            if (switcher) switcher.value = userId;

            // 刷新当前页面
            if (Router.currentRoute) {
                Router.refresh();
            }

            MockData.addAuditLog('SWITCH_USER', I18n.t('switch_user_log') + ': ' + user.display_name);
            this.showToast('info', I18n.t('switched_to') + ': ' + user.display_name);
        }
    },

    updateUserDisplay: function () {
        var user = MockData.currentUser;
        if (!user) return;

        var avatar = document.querySelector('.user-avatar');
        var userName = document.querySelector('.user-name');
        var userRole = document.querySelector('.user-role');

        if (avatar) {
            avatar.textContent = user.display_name.charAt(0);
            avatar.style.cursor = 'pointer';
            avatar.onclick = function () { window.location.hash = 'profile'; };
        }
        if (userName) {
            userName.textContent = user.display_name;
            userName.style.cursor = 'pointer';
            userName.onclick = function () { window.location.hash = 'profile'; };
        }
        if (userRole) {
            userRole.textContent = I18n.t(user.role);
        }
    },

    updateMenuVisibility: function () {
        var user = MockData.currentUser;

        // 公司管理 - 仅超级管理员
        var navCompanies = document.getElementById('navCompanies');
        var adminDivider = document.getElementById('adminDivider');
        if (navCompanies) {
            navCompanies.style.display = Permissions.isSuperAdmin(user) ? '' : 'none';
        }
        if (adminDivider) {
            adminDivider.style.display = Permissions.can(user, 'manage_datasources') ? '' : 'none';
        }

        // 数据源管理
        var navDatasources = document.getElementById('navDatasources');
        if (navDatasources) {
            navDatasources.style.display = Permissions.can(user, 'manage_datasources') ? '' : 'none';
        }

        // 用户管理
        var navUsers = document.getElementById('navUsers');
        if (navUsers) {
            navUsers.style.display = Permissions.can(user, 'manage_users') ? '' : 'none';
        }

        // 角色管理
        var navRoles = document.getElementById('navRoles');
        if (navRoles) {
            navRoles.style.display = Permissions.canManageRoles(user) ? '' : 'none';
        }
    },

    initSidebar: function () {
        var sidebar = document.getElementById('sidebar');
        var toggle = document.getElementById('sidebarToggle');

        toggle.addEventListener('click', function () {
            sidebar.classList.toggle('collapsed');
        });

        // 导航组展开/折叠
        var headers = document.querySelectorAll('.nav-group-header');
        for (var i = 0; i < headers.length; i++) {
            headers[i].addEventListener('click', function () {
                this.parentElement.classList.toggle('open');
            });
        }

        // 默认展开规则管理
        var navGroup = document.querySelector('.nav-group');
        if (navGroup) navGroup.classList.add('open');

        // 导航链接点击
        var links = document.querySelectorAll('.nav-link');
        for (var j = 0; j < links.length; j++) {
            links[j].addEventListener('click', function (e) {
                e.preventDefault();
                var page = this.dataset.page;
                if (page) {
                    window.location.hash = page;
                }
            });
        }
    },

    initModal: function () {
        var overlay = document.getElementById('modalOverlay');
        var closeBtn = document.getElementById('modalClose');
        var cancelBtn = document.getElementById('modalCancel');
        var self = this;

        closeBtn.addEventListener('click', function () { self.hideModal(); });
        cancelBtn.addEventListener('click', function () { self.hideModal(); });
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) self.hideModal();
        });
    },

    initTime: function () {
        var self = this;
        var updateTime = function () {
            var now = new Date();
            var locale = I18n.currentLang === 'zh' ? 'zh-CN' : 'en-US';
            var options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
            document.getElementById('headerTime').textContent = now.toLocaleString(locale, options);
        };
        updateTime();
        setInterval(updateTime, 1000);
    },

    showModal: function (title, content) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modalOverlay').classList.add('active');
    },

    hideModal: function () {
        document.getElementById('modalOverlay').classList.remove('active');
    },

    initTheme: function () {
        var theme = localStorage.getItem('theme') || 'dark';
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            var btn = document.getElementById('themeToggle');
            if (btn) btn.textContent = '☀️';
        }
    },

    toggleTheme: function () {
        var isLight = document.body.classList.toggle('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        var btn = document.getElementById('themeToggle');
        if (btn) btn.textContent = isLight ? '☀️' : '🌙';
    },

    showToast: function (type, message) {
        var container = document.getElementById('toastContainer');
        var icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        var toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.innerHTML = '<span class="toast-icon">' + icons[type] + '</span><span class="toast-message">' + message + '</span>';
        container.appendChild(toast);
        setTimeout(function () {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(function () { toast.remove(); }, 300);
        }, 3000);
    },

    refresh: function () {
        Router.refresh();
        this.showToast('success', I18n.t('data_refreshed'));
    },

    logout: function () {
        if (confirm(I18n.t('logout_confirm'))) {
            localStorage.removeItem('currentUser');
            MockData.currentUser = null;
            this.showToast('info', I18n.t('logout_success'));
            setTimeout(function () { window.location.href = 'login.html'; }, 500);
        }
    },

    toggleRule: function (ruleId) {
        var rule = MockData.rules.find(function (r) { return r.rule_id === ruleId; });
        if (rule) {
            if (Permissions.isReadOnly(MockData.currentUser)) {
                this.showToast('warning', I18n.t('readonly_warning'));
                return;
            }
            rule.enabled = !rule.enabled;
            var statusText = rule.enabled ? I18n.t('enabled') : I18n.t('disabled');
            this.showToast(rule.enabled ? 'success' : 'warning', I18n.t('rule') + ' ' + rule.name + ' ' + I18n.t('status_changed_to') + statusText);
            this.updateAlertBadge();
        }
    },

    updateAlertBadge: function () {
        var user = MockData.currentUser;
        var sourceIds = MockData.getUserSourceIds(user);
        var alerts = MockData.filterBySource(MockData.alerts, sourceIds);
        var newAlerts = alerts.filter(function (a) { return a.status === 'new'; }).length;
        document.getElementById('alertBadge').textContent = newAlerts;
    }
};

// 添加slideOut动画
var styleEl = document.createElement('style');
styleEl.textContent = '@keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }';
document.head.appendChild(styleEl);

// 应用初始化
document.addEventListener('DOMContentLoaded', function () { App.init(); });
