// 登录逻辑
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // 检查是否已登录，如果已登录则直接跳转首页
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = 'index.html';
        return;
    }

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const btn = loginForm.querySelector('button');

        if (!username || !password) {
            showError('请输入邮箱和密码');
            return;
        }

        // 模拟网络请求延迟
        btn.textContent = '登录中...';
        btn.disabled = true;
        errorMessage.classList.remove('visible');

        setTimeout(() => {
            const user = MockData.users.find(u => u.username === username && u.password === password);

            if (user) {
                if (user.status !== 'active') {
                    showError('该账号已被禁用，请联系管理员');
                    resetBtn();
                    return;
                }

                // 登录成功
                localStorage.setItem('currentUser', JSON.stringify(user));

                // 记录登录日志 (模拟)
                console.log('Login success:', user.username);

                window.location.href = 'index.html';
            } else {
                showError('邮箱或密码不正确');
                resetBtn();
            }
        }, 600);
    });

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.add('visible');
    }

    function resetBtn() {
        const btn = loginForm.querySelector('button');
        btn.textContent = '登 录';
        btn.disabled = false;
    }
});
