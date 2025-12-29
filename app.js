// تطبيق PWA شامل لأي موقع
class PWAWrapper {
    constructor() {
        this.currentUrl = '';
        this.appName = 'تطبيق الويب';
        this.deferredPrompt = null;
        this.init();
    }
    
    init() {
        this.checkSettings();
        this.initServiceWorker();
        this.setupEventListeners();
        this.checkPWAStatus();
        this.setupInstallPrompt();
    }
    
    checkSettings() {
        const savedUrl = localStorage.getItem('pwa_target_url');
        const savedName = localStorage.getItem('pwa_app_name');
        
        if (savedUrl && savedName) {
            this.currentUrl = savedUrl;
            this.appName = savedName;
            this.loadWebsite();
        } else {
            this.showSetup();
        }
    }
    
    showSetup() {
        document.getElementById('setupModal').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
        
        // تعبئة الحقول إذا كانت هناك بيانات سابقة
        const savedUrl = localStorage.getItem('pwa_target_url') || '';
        const savedName = localStorage.getItem('pwa_app_name') || '';
        
        if (savedUrl) document.getElementById('urlInput').value = savedUrl;
        if (savedName) document.getElementById('appNameInput').value = savedName;
        
        // تركيز على حقل الرابط
        document.getElementById('urlInput').focus();
    }
    
    saveSettings() {
        const urlInput = document.getElementById('urlInput').value.trim();
        const nameInput = document.getElementById('appNameInput').value.trim();
        
        if (!urlInput) {
            alert('الرجاء إدخال رابط الموقع');
            return;
        }
        
        // إضافة https:// إذا لم يكن موجوداً
        let finalUrl = urlInput;
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
        }
        
        // حفظ الإعدادات
        localStorage.setItem('pwa_target_url', finalUrl);
        localStorage.setItem('pwa_app_name', nameInput || 'تطبيق الويب');
        
        // تحديث Manifest ديناميكياً
        this.updateManifest(nameInput || 'تطبيق الويب');
        
        // إخفاء واجهة الإعدادات
        document.getElementById('setupModal').style.display = 'none';
        
        // تحميل الموقع
        this.currentUrl = finalUrl;
        this.appName = nameInput || 'تطبيق الويب';
        this.loadWebsite();
    }
    
    updateManifest(appName) {
        const manifest = {
            "name": appName,
            "short_name": appName,
            "description": `تطبيق ${appName}`,
            "start_url": window.location.origin + window.location.pathname,
            "scope": "/",
            "display": "standalone",
            "background_color": "#2196F3",
            "theme_color": "#2196F3",
            "orientation": "any",
            "icons": [
                {
                    "src": "./assets/icon-72.png",
                    "sizes": "72x72",
                    "type": "image/png"
                },
                {
                    "src": "./assets/icon-96.png",
                    "sizes": "96x96",
                    "type": "image/png"
                },
                {
                    "src": "./assets/icon-128.png",
                    "sizes": "128x128",
                    "type": "image/png"
                },
                {
                    "src": "./assets/icon-144.png",
                    "sizes": "144x144",
                    "type": "image/png"
                },
                {
                    "src": "./assets/icon-152.png",
                    "sizes": "152x152",
                    "type": "image/png"
                },
                {
                    "src": "./assets/icon-192.png",
                    "sizes": "192x192",
                    "type": "image/png"
                },
                {
                    "src": "./assets/icon-384.png",
                    "sizes": "384x384",
                    "type": "image/png"
                },
                {
                    "src": "./assets/icon-512.png",
                    "sizes": "512x512",
                    "type": "image/png"
                }
            ],
            "categories": ["utilities", "productivity"],
            "shortcuts": [
                {
                    "name": "الصفحة الرئيسية",
                    "url": window.location.origin + window.location.pathname,
                    "description": "فتح التطبيق"
                }
            ]
        };
        
        // تحديث رابط Manifest
        const manifestElement = document.querySelector('link[rel="manifest"]');
        if (manifestElement) {
            const blob = new Blob([JSON.stringify(manifest)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            manifestElement.href = url;
        }
    }
    
    loadWebsite() {
        const iframe = document.getElementById('webview');
        const loadingOverlay = document.getElementById('loadingOverlay');
        const currentUrlDisplay = document.getElementById('currentUrl');
        const appNameDisplay = document.getElementById('displayAppName');
        
        // إظهار التطبيق
        document.getElementById('appContainer').style.display = 'flex';
        appNameDisplay.textContent = this.appName;
        
        // إظهار شاشة التحميل
        loadingOverlay.style.display = 'flex';
        currentUrlDisplay.textContent = this.currentUrl;
        
        // تعيين مصدر iframe
        iframe.src = this.currentUrl;
        
        // إضافة مستمعين للأحداث
        iframe.onload = () => {
            loadingOverlay.style.display = 'none';
            this.updateNavigationState();
        };
        
        iframe.onerror = () => {
            loadingOverlay.style.display = 'none';
            this.showError('فشل تحميل الموقع. تأكد من الرابط وتوفر الإنترنت.');
        };
    }
    
    updateNavigationState() {
        const iframe = document.getElementById('webview');
        const currentUrlDisplay = document.getElementById('currentUrl');
        
        try {
            // محاولة الوصول إلى عنوان URL الحالي
            const currentSrc = iframe.contentWindow.location.href;
            currentUrlDisplay.textContent = currentSrc;
            
            // تحديث زر الرجوع والتقدم
            const backBtn = document.querySelector('.back-btn');
            const forwardBtn = document.querySelector('.forward-btn');
            
            if (iframe.contentWindow.history.length > 1) {
                backBtn.style.opacity = '1';
                backBtn.style.cursor = 'pointer';
            } else {
                backBtn.style.opacity = '0.5';
                backBtn.style.cursor = 'not-allowed';
            }
        } catch (e) {
            // CORS error - لا يمكن الوصول إلى التاريخ
            currentUrlDisplay.textContent = this.currentUrl;
        }
    }
    
    goBack() {
        const iframe = document.getElementById('webview');
        try {
            iframe.contentWindow.history.back();
            setTimeout(() => this.updateNavigationState(), 300);
        } catch (e) {
            console.log('لا يمكن الرجوع بسبب قيود الأمان');
        }
    }
    
    goForward() {
        const iframe = document.getElementById('webview');
        try {
            iframe.contentWindow.history.forward();
            setTimeout(() => this.updateNavigationState(), 300);
        } catch (e) {
            console.log('لا يمكن التقدم بسبب قيود الأمان');
        }
    }
    
    refreshPage() {
        const iframe = document.getElementById('webview');
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        loadingOverlay.style.display = 'flex';
        iframe.contentWindow.location.reload();
        
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 2000);
    }
    
    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = '❌ ' + message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
    
    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(registration => {
                        console.log('✅ Service Worker مسجل:', registration.scope);
                    })
                    .catch(error => {
                        console.log('❌ فشل تسجيل Service Worker:', error);
                    });
            });
        }
    }
    
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            
            // إظهار زر التثبيت بعد 5 ثواني
            setTimeout(() => {
                if (this.deferredPrompt) {
                    this.showInstallPrompt();
                }
            }, 5000);
        });
        
        // عند تثبيت التطبيق
        window.addEventListener('appinstalled', () => {
            console.log('🎉 تم تثبيت PWA بنجاح!');
            this.hideInstallPrompt();
            this.deferredPrompt = null;
        });
        
        // زر التثبيت
        document.getElementById('installButton').addEventListener('click', () => {
            this.installPWA();
        });
    }
    
    showInstallPrompt() {
        const prompt = document.getElementById('installPrompt');
        prompt.style.display = 'block';
        
        // إخفاء تلقائي بعد 30 ثانية
        setTimeout(() => {
            if (prompt.style.display === 'block') {
                this.hideInstallPrompt();
            }
        }, 30000);
    }
    
    hideInstallPrompt() {
        document.getElementById('installPrompt').style.display = 'none';
    }
    
    installPWA() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            
            this.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('✅ قبل تثبيت PWA');
                } else {
                    console.log('❌ رفض المستخدم التثبيت');
                }
                this.deferredPrompt = null;
            });
        }
    }
    
    checkPWAStatus() {
        // التحقق من وضع standalone
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('✅ يعمل في وضع PWA');
            document.querySelector('.controls').style.display = 'none';
        }
        
        // التحقق من iOS
        this.detectIOS();
    }
    
    detectIOS() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
        if (isIOS && isSafari) {
            // إضافة تعليمات iOS
            setTimeout(() => {
                if (!window.navigator.standalone) {
                    alert('لتثبيت التطبيق على iOS:\n1. اضغط زر المشاركة 📤\n2. اختر "أضف إلى الشاشة الرئيسية"\n3. اضغط "إضافة"');
                }
            }, 3000);
        }
    }
    
    openExternal() {
        window.open(this.currentUrl, '_blank');
    }
    
    toggleFullscreen() {
        const iframe = document.getElementById('webview');
        
        if (!document.fullscreenElement) {
            if (iframe.requestFullscreen) {
                iframe.requestFullscreen();
            } else if (iframe.webkitRequestFullscreen) {
                iframe.webkitRequestFullscreen();
            } else if (iframe.msRequestFullscreen) {
                iframe.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    useDefault() {
        // مواقع مقترحة
        const sites = [
            { name: "جوجل", url: "https://www.google.com" },
            { name: "يوتيوب", url: "https://www.youtube.com" },
            { name: "ويكيبيديا", url: "https://ar.wikipedia.org" },
            { name: "تويتر", url: "https://twitter.com" },
            { name: "فيسبوك", url: "https://www.facebook.com" }
        ];
        
        const randomSite = sites[Math.floor(Math.random() * sites.length)];
        document.getElementById('urlInput').value = randomSite.url;
        document.getElementById('appNameInput').value = randomSite.name;
    }
}

// وظائف مساعدة
function saveSettings() {
    window.pwaApp.saveSettings();
}

function showSetup() {
    window.pwaApp.showSetup();
}

function useDefault() {
    window.pwaApp.useDefault();
}

function goBack() {
    window.pwaApp.goBack();
}

function goForward() {
    window.pwaApp.goForward();
}

function refreshPage() {
    window.pwaApp.refreshPage();
}

function openExternal() {
    window.pwaApp.openExternal();
}

function toggleFullscreen() {
    window.pwaApp.toggleFullscreen();
}

// تهيئة التطبيق عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    window.pwaApp = new PWAWrapper();
});
