// ==========================================
// 1. FUNGSI TOMBOL MATA (AMAN & TERPISAH)
// ==========================================
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('toggle-password')) {
        const inputField = e.target.closest('.input-field').querySelector('input');
        if (inputField) {
            if (inputField.type === 'password') {
                inputField.type = 'text';
                e.target.classList.remove('fa-eye');
                e.target.classList.add('fa-eye-slash');
            } else {
                inputField.type = 'password';
                e.target.classList.remove('fa-eye-slash');
                e.target.classList.add('fa-eye');
            }
        }
    }
});

// ==========================================
// 2. SISTEM POP-UP KUSTOM
// ==========================================
function showCustomPopup(type, title, message, redirectUrl = null) {
    const popup = document.getElementById('customPopup');
    if (!popup) {
        alert(title + "\n" + message);
        if (redirectUrl) window.location.replace(redirectUrl);
        return;
    }

    const icon = popup.querySelector('i');
    const titleEl = popup.querySelector('h3');
    const messageEl = popup.querySelector('p');

    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        icon.style.color = '#00ffcc';
    } else {
        icon.className = 'fas fa-exclamation-circle';
        icon.style.color = '#ff4d4d';
    }

    titleEl.textContent = title;
    messageEl.textContent = message;
    popup.classList.add('show');

    if (redirectUrl) {
        setTimeout(() => { window.location.replace(redirectUrl); }, 2000);
    } else {
        setTimeout(() => { popup.classList.remove('show'); }, 2000);
    }
}

// ==========================================
// 3. SISTEM LOGIN (LOCALSTORAGE)
// ==========================================
const loginForm = document.querySelector('#loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('email').value.trim().toLowerCase();
        const passwordInput = document.getElementById('password').value.trim();
        const btn = this.querySelector('.login-btn');
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> MEMERIKSA...';
        btn.disabled = true;

        if (emailInput === 'admin@tabungkan.com' && passwordInput === 'admin123') {
            sessionStorage.setItem('active_session', 'admin');
            sessionStorage.setItem('user_name', 'Admin');
            window.location.replace('admin.html');
            return;
        }

        const users = JSON.parse(localStorage.getItem('tabungkan_users')) || [];
        const foundUser = users.find(u => u.email === emailInput);

        if (!foundUser) {
            showCustomPopup('error', 'Belum Terdaftar!', 'Email belum terdaftar. Mengalihkan...', 'register.html');
            btn.innerHTML = 'MASUK';
            btn.disabled = false;
        } else if (foundUser.password !== passwordInput) {
            showCustomPopup('error', 'Sandi Salah!', 'Kata sandi yang kamu masukkan salah.');
            btn.innerHTML = 'MASUK';
            btn.disabled = false;
        } else {
            sessionStorage.setItem('active_session', 'user');
            sessionStorage.setItem('user_name', foundUser.nama);
            sessionStorage.setItem('user_email', foundUser.email);
            window.location.replace('dashboard.html'); 
        }
    });
}

// ==========================================
// 4. SISTEM REGISTER (LOCALSTORAGE)
// ==========================================
const registerForm = document.querySelector('#registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        
        const name = document.getElementById('reg-fullname').value.trim();
        const email = document.getElementById('reg-email').value.trim().toLowerCase();
        const password = document.getElementById('reg-password').value.trim();
        const btn = this.querySelector('.login-btn');
        
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            showCustomPopup('error', 'Gagal Daftar!', 'Sandi min 8 karakter (huruf & angka).');
            return; 
        }
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> MENYIMPAN...';
        btn.disabled = true;

        let users = JSON.parse(localStorage.getItem('tabungkan_users')) || [];
        const existing = users.find(u => u.email === email);

        if (existing) {
            showCustomPopup('error', 'Email Terdaftar!', 'Email sudah ada. Silakan login.', 'index.html');
            btn.innerHTML = 'DAFTAR SEKARANG';
            btn.disabled = false;
            return;
        }

        users.push({ nama: name, email: email, password: password });
        localStorage.setItem('tabungkan_users', JSON.stringify(users));

        showCustomPopup('success', 'Berhasil!', 'Akun terdaftar! Silakan Login.', 'index.html');
    });
}

// ==========================================
// 5. LOGOUT
// ==========================================
const logoutBtn = document.querySelector('#logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
        sessionStorage.clear();
        window.location.replace('index.html');
    });
}

// ==========================================
// 6. DASHBOARD & TRANSAKSI (LOCALSTORAGE)
// ==========================================
const transactionForm = document.querySelector('#transactionForm');
const transactionList = document.querySelector('#transactionList');
const totalBalanceEl = document.querySelector('#totalBalance');
const totalIncomeEl = document.querySelector('#totalIncome');
const totalExpenseEl = document.querySelector('#totalExpense');

const incomeCategories = [
    { value: 'Gaji / Upah', text: 'Gaji / Upah' },
    { value: 'Transfer Masuk', text: 'Transfer Masuk' },
    { value: 'Bonus / Hadiah', text: 'Bonus / Hadiah' },
    { value: 'Pemasukan Lainnya', text: 'Lainnya' }
];

const expenseCategories = [
    { value: 'Makan & Minum (Jajan)', text: 'Makan & Minum (Jajan)' },
    { value: 'Transportasi / Bensin', text: 'Transportasi / Bensin' },
    { value: 'Belanja / Kebutuhan', text: 'Belanja / Kebutuhan' },
    { value: 'Tagihan & Cicilan', text: 'Tagihan & Cicilan' },
    { value: 'Pengeluaran Lainnya', text: 'Lainnya' }
];

const transNameSelect = document.querySelector('#trans-name');
const radioBtns = document.querySelectorAll('input[name="trans-type"]');

function updateDropdownOptions() {
    if (!transNameSelect) return;
    const selectedType = document.querySelector('input[name="trans-type"]:checked').value;
    const options = selectedType === 'income' ? incomeCategories : expenseCategories;
    
    transNameSelect.innerHTML = '';
    options.forEach(opt => {
        const optionEl = document.createElement('option');
        optionEl.value = opt.value;
        optionEl.textContent = opt.text;
        transNameSelect.appendChild(optionEl);
    });
}
updateDropdownOptions();
if (radioBtns.length > 0) radioBtns.forEach(btn => btn.addEventListener('change', updateDropdownOptions));

function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

// Muat Data Transaksi berdasarkan User yang Login
if (transactionList) {
    function loadTransactions() {
        const userEmail = sessionStorage.getItem('user_email');
        if (!userEmail) return;

        const allTrans = JSON.parse(localStorage.getItem('tabungkan_transactions')) || {};
        const userTrans = allTrans[userEmail] || [];

        let balance = 0, income = 0, expense = 0;
        transactionList.innerHTML = '';

        if (userTrans.length === 0) {
            transactionList.innerHTML = '<p class="empty-state">Belum ada transaksi tercatat.</p>';
        } else {
            userTrans.forEach((trans) => {
                const amount = parseFloat(trans.amount);
                if (trans.type === 'income') {
                    income += amount;
                    balance += amount;
                } else {
                    expense += amount;
                    balance -= amount;
                }

                const li = document.createElement('div');
                li.classList.add('transaction-item');
                
                const amountClass = trans.type === 'income' ? 'amount-income' : 'amount-expense';
                const sign = trans.type === 'income' ? '+' : '-';

                li.innerHTML = `
                    <div class="trans-info">
                        <h4>${trans.name}</h4>
                        <small><i class="far fa-clock"></i> ${trans.date}</small>
                    </div>
                    <div class="trans-amount ${amountClass}">
                        ${sign} ${formatRupiah(amount)}
                    </div>
                `;
                transactionList.appendChild(li);
            });
        }

        if (totalBalanceEl) totalBalanceEl.textContent = formatRupiah(balance);
        if (totalIncomeEl) totalIncomeEl.textContent = formatRupiah(income);
        if (totalExpenseEl) totalExpenseEl.textContent = formatRupiah(expense);
    }
    loadTransactions();
}

// Simpan Transaksi Baru ke LocalStorage
if (transactionForm) {
    transactionForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const userEmail = sessionStorage.getItem('user_email');
        if (!userEmail) return;

        const name = document.querySelector('#trans-name').value;
        const amount = parseFloat(document.querySelector('#trans-amount').value);
        const type = document.querySelector('input[name="trans-type"]:checked').value;
        const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

        let allTrans = JSON.parse(localStorage.getItem('tabungkan_transactions')) || {};
        if (!allTrans[userEmail]) allTrans[userEmail] = [];

        allTrans[userEmail].unshift({ name, amount, type, date });
        localStorage.setItem('tabungkan_transactions', JSON.stringify(allTrans));

        transactionForm.reset();
        updateDropdownOptions();
        loadTransactions();
    });
}

// ==========================================
// 7. HALAMAN ADMIN (LOCALSTORAGE)
// ==========================================
const adminUserList = document.getElementById('adminUserList');
const totalUsersCounter = document.getElementById('totalUsersCounter');

if (adminUserList && totalUsersCounter) {
    const users = JSON.parse(localStorage.getItem('tabungkan_users')) || [];
    totalUsersCounter.textContent = users.length;

    if (users.length > 0) {
        adminUserList.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('div');
            li.classList.add('transaction-item');
            li.innerHTML = `
                <div class="trans-info">
                    <h4>${user.nama}</h4>
                    <small><i class="fas fa-envelope"></i> ${user.email}</small>
                </div>
                <div class="trans-amount" style="color: #64748b; font-size: 12px;">
                    <i class="fas fa-check-circle" style="color: #00ffcc;"></i> Lokal HP
                </div>
            `;
            adminUserList.appendChild(li);
        });
    } else {
        adminUserList.innerHTML = '<p class="empty-state">Belum ada user yang mendaftar.</p>';
    }
}

// ==========================================
// 8. PROTEKSI HALAMAN
// ==========================================
const currentPage = window.location.pathname.split("/").pop();
const activeSession = sessionStorage.getItem('active_session');
if (currentPage === 'dashboard.html' && activeSession !== 'user') window.location.replace('index.html');
if (currentPage === 'admin.html' && activeSession !== 'admin') window.location.replace('index.html');
