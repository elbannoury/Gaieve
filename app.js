// حالة التطبيق
const AppState = {
    currentPage: 'home',
    isOffline: false,
    deferredPrompt: null,
    isDarkMode: false,
    notificationsEnabled: false
};

// تهيئة التطبيق عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    registerEventListeners();
    checkConnectivity();
    loadSettings();
    
    // إخفاء شاشة التحميل بعد 2 ثانية
    setTimeout(() => {
        document.getElementById('splash-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('splash-screen').classList.add('hidden');
            document.getElementById('app').classList.remove('hidden');
        }, 500);
    }, 2000);
});

// تهيئة التطبيق
function initializeApp() {
    // التحقق من دعم PWA
    checkPWASupport();
    
    // إعداد الوضع الداكن
    setupDarkMode();
    
    // تحديث حالة الاتصال
    updateConnectionStatus();
    
    // إعداد Service Worker
    setupServiceWorker();
}

// تسجيل مستمعي الأحداث
function registerEventListeners() {
    // أزرار القائمة
    document.getElementById('menuBtn').addEventListener('click', toggleSidebar);
    document.getElementById('closeBtn').addEventListener('click', toggleSidebar);
    
    // أزرار التنقل
    document.querySelectorAll('.nav-links a, .nav-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const page = button.getAttribute('data-page') || 
                        button.parentElement.getAttribute('data-page');
            navigateTo(page);
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        });
    });
    
    // زر التثبيت
    document.getElementById('installBtn').addEventListener('click', installPWA);
    
    // أحداث الصفحة الرئيسية
    document.getElementById('openWebsite').addEventListener('click', () => {
        navigateTo('website');
    });
    
    document.getElementById('refreshContent').addEventListener('click', () => {
        showToast('جاري تحديث المحتوى...');
        if (AppState.currentPage === 'website') {
            document.getElementById('websiteFrame').src += '';
        }
        location.reload();
    });
    
    document.getElementById('shareApp').addEventListener('click', shareApp);
    
    // أحداث صفحة الموقع
    document.getElementById('reloadFrame').addEventListener('click', () => {
        document.getElementById('websiteFrame').src += '';
        showToast('جاري إعادة تحميل الموقع...');
    });
    
    document.getElementById('openInBrowser').addEventListener('click', () => {
        window.open('https://gaieve.vercel.app/', '_blank');
    });
    
    // أحداث صفحة الإعدادات
    document.getElementById('themeSelect').addEventListener('change', (e) => {
        changeTheme(e.target.value);
    });
    
    document.getElementById('notificationsToggle').addEventListener('change', (e) => {
        AppState.notificationsEnabled = e.target.checked;
        saveSettings();
        showToast(e.target.checked ? 'تم تمكين الإشعارات' : 'تم تعطيل الإشعارات');
    });
    
    document.getElementById('offlineMode').addEventListener('change', (e) => {
        AppState.isOffline = e.target.checked;
        saveSettings();
        updateOfflineStatus();
    });
    
    document.getElementById('cacheSize').addEventListener('change', (e) => {
        saveSettings();
        showToast('سيتم تطبيق حجم التخزين بعد إعادة التحميل');
    });
    
    document.getElementById('clearCache').addEventListener('click', clearCache);
    document.getElementById('checkUpdate').addEventListener('click', checkForUpdates);
    
    // أحداث الاتصال
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    
    // حدث تثبيت PWA
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        AppState.deferredPrompt = e;
        document.getElementById('installBtn').classList.add('available');
        showToast('التطبيق جاهز للتثبيت!');
    });
}

// التنقل بين الصفحات
function navigateTo(page) {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    
    // إظهار الصفحة المطلوبة
    const pageElement = document.getElementById(`${page}Page`);
    if (pageElement) {
        pageElement.classList.add('active');
        AppState.currentPage = page;
        
        // تحديث أزرار التنقل النشطة
        document.querySelectorAll(`[data-page="${page}"]`).forEach(el => {
            el.classList.add('active');
        });
        
        // تحديث عنوان الصفحة
        document.title = `Gaieve | ${getPageTitle(page)}`;
    }
}

function getPageTitle(page) {
    const titles = {
        'home': 'الرئيسية',
        'website': 'الموقع',
        'about': 'عن التطبيق',
        'settings': 'الإعدادات'
    };
    return titles[page] || 'Gaieve';
}

// التحقق من دعم PWA
function checkPWASupport() {
    const supportsPWA = 'serviceWorker' in navigator && 'PushManager' in window;
    document.getElementById('pwaSupport').textContent = 
        supportsPWA ? 'مدعوم ✓' : 'غير مدعوم ✗';
    document.getElementById('pwaSupport').className = 
        supportsPWA ? 'stat-value' : 'stat-value offline';
}

// إدارة حالة الاتصال
function checkConnectivity() {
    AppState.isOffline = !navigator.onLine;
    updateConnectionStatus();
}

function updateConnectionStatus() {
    const isOnline = navigator.onLine;
    const statusElement = document.getElementById('connectionStatus');
    
    if (isOnline) {
        statusElement.textContent = 'متصل بالإنترنت';
        statusElement.className = 'stat-value online';
    } else {
        statusElement.textContent = 'غير متصل بالإنترنت';
        statusElement.className = 'stat-value offline';
        showToast('أنت غير متصل بالإنترنت');
    }
    
    AppState.isOffline = !isOnline;
    updateOfflineStatus();
}

function updateOfflineStatus() {
    const offlineBtn = document.getElementById('offlineToggle');
    if (offlineBtn) {
        const icon = AppState.isOffline ? '📴' : '🌐';
        const text = AppState.isOffline ? 'وضع عدم الاتصال' : 'وضع الاتصال';
        offlineBtn.innerHTML = `<span>${icon} ${text}</span>`;
    }
}

// إدارة القائمة الجانبية
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// تثبيت PWA
async function installPWA() {
    if (AppState.deferredPrompt) {
        AppState.deferredPrompt.prompt();
        const { outcome } = await AppState.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            showToast('تم تثبيت التطبيق بنجاح!');
            document.getElementById('installBtn').style.display = 'none';
        }
        
        AppState.deferredPrompt = null;
    } else {
        showToast('استخدم زر القائمة في المتصفح لتثبيت التطبيق');
    }
}

// مشاركة التطبيق
async function shareApp() {
    const shareData = {
        title: 'تطبيق Gaieve',
        text: 'جرب تطبيق Gaieve كتطبيق ويب تقدمي!',
        url: window.location.href
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
            showToast('تمت المشاركة بنجاح!');
        } else {
            // نسخ الرابط إذا لم يكن المشاركة مدعومة
            await navigator.clipboard.writeText(window.location.href);
            showToast('تم نسخ الرابط إلى الحافظة!');
        }
    } catch (err) {
        console.log('Error sharing:', err);
    }
}

// إدارة السمات
function setupDarkMode() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    AppState.isDarkMode = prefersDark.matches;
    
    const savedTheme = localStorage.getItem('theme') || 'auto';
    changeTheme(savedTheme);
    document.getElementById('themeSelect').value = savedTheme;
    
    prefersDark.addEventListener('change', (e) => {
        if (document.getElementById('themeSelect').value === 'auto') {
            AppState.isDarkMode = e.matches;
            applyTheme();
        }
    });
}

function changeTheme(theme) {
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
        AppState.isDarkMode = true;
    } else if (theme === 'light') {
        AppState.isDarkMode = false;
    } else {
        AppState.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    applyTheme();
    showToast(`تم تطبيق السمة: ${theme === 'auto' ? 'تلقائي' : theme}`);
}

function applyTheme() {
    if (AppState.isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

// إدارة الإعدادات
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    
    AppState.isOffline = settings.isOffline || false;
    AppState.notificationsEnabled = settings.notificationsEnabled || false;
    
    document.getElementById('offlineMode').checked = AppState.isOffline;
    document.getElementById('notificationsToggle').checked = AppState.notificationsEnabled;
    
    if (settings.cacheSize) {
        document.getElementById('cacheSize').value = settings.cacheSize;
    }
    
    updateOfflineStatus();
}

function saveSettings() {
    const settings = {
        isOffline: AppState.isOffline,
        notificationsEnabled: AppState.notificationsEnabled,
        cacheSize: document.getElementById('cacheSize').value,
        theme: document.getElementById('themeSelect').value
    };
    
    localStorage.setItem('appSettings', JSON.stringify(settings));
}

// إدارة الذاكرة المؤقتة
async function clearCache() {
    if (confirm('هل أنت متأكد من مسح الذاكرة المؤقتة؟')) {
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            
            // مسح localStorage
            localStorage.clear();
            saveSettings();
            
            showToast('تم مسح الذاكرة المؤقتة بنجاح');
            setTimeout(() => location.reload(), 1500);
        } catch (error) {
            showToast('حدث خطأ أثناء مسح الذاكرة المؤقتة');
            console.error('Error clearing cache:', error);
        }
    }
}

async function checkForUpdates() {
    showToast('جاري التحقق من التحديثات...');
    
    try {
        const registration = await navigator.serviceWorker?.ready;
        if (registration) {
            await registration.update();
            showToast('التطبيق محدّث إلى أحدث إصدار');
        } else {
            showToast('Service Worker غير نشط');
        }
    } catch (error) {
        showToast('تعذر التحقق من التحديثات');
        console.error('Update check failed:', error);
    }
}

// إعداد Service Worker
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            showToast('تم تحديث التطبيق، أعد التحميل لرؤية التغييرات');
        });
    }
}

// عرض رسائل التنبيه
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// تصدير الوظائف للاستخدام العالمي
window.AppState = AppState;
window.navigateTo = navigateTo;
window.showToast = showToast;
