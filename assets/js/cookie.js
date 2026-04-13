const initCookieBanner = () => {
    const banner = document.getElementById('CookieBanner');
    const consentKey = "cookie_consent_status";

    if (!banner) return;

    // 1. Initial State Check
    const currentConsent = localStorage.getItem(consentKey);

    if (!currentConsent) {
        banner.style.display = "flex";
        banner.removeAttribute('inert');
    } else {
        banner.setAttribute('inert', '');
        banner.style.display = "none";
        return; // Exit early if already decided
    }

    // 2. The Global Handler
    window.handleConsent = function(status) {
        if (banner.getAttribute('data-processing') === 'true') return;
        banner.setAttribute('data-processing', 'true');

        console.log("Consent decision recorded:", status);
        localStorage.setItem(consentKey, status);
        
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': status,
                'ad_user_data': status,
                'ad_personalization': status,
                'analytics_storage': status
            });
        }

        if (status === 'granted') {
            if (typeof window.fireMinimalGA4 === 'function') {
                console.log("Production Logic: window.fireMinimalGA4() triggered.");
                window.fireMinimalGA4();
            } else {
                console.warn("Local Dev Notice: Minimal GA4 would trigger now, but 'analytics-ga4-alt.html' is not loaded.");
            }
        }

        document.body.focus();
        banner.style.display = "none";
        banner.remove();
    };

    // 3. Attach Event Listeners
    const btnAccept = banner.querySelector('.btn-accept');
    const btnReject = banner.querySelector('.btn-reject');

    if (btnAccept) {
        btnAccept.addEventListener('click', (e) => {
            e.preventDefault();
            window.handleConsent('granted');
        });
    }
    
    if (btnReject) {
        btnReject.addEventListener('click', (e) => {
            e.preventDefault();
            window.handleConsent('denied');
        });
    }
};

// --- The "Bulletproof" Trigger & bfcache Fix ---

// 1. Handle iOS Back-Forward Cache (bfcache) navigation
window.addEventListener('pageshow', (event) => {
    // e.persisted is true if the page was loaded from the frozen bfcache
    if (event.persisted) {
        initCookieBanner();
    }
});

// 2. Handle standard page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
} else {
    initCookieBanner();
}