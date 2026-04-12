const initCookieBanner = () => {
    const banner = document.getElementById('CookieBanner');
    const consentKey = "cookie_consent_status";
    const legacyKey = "cookieBannerDisplayed";

    if (!banner) {
        console.warn("CookieBanner element not found in DOM.");
        return;
    }

    // 1. Migration & Cleanup
    if (localStorage.getItem(legacyKey)) {
        localStorage.removeItem(legacyKey);
    }

    // 2. Strict Check
    const currentConsent = localStorage.getItem(consentKey);
    const hasMadeChoice = (currentConsent === 'granted' || currentConsent === 'denied');

    if (!hasMadeChoice) {
        // FORCE visibility on iOS
        banner.style.setProperty('display', 'flex', 'important');
        banner.removeAttribute('inert');
        banner.setAttribute('data-processing', 'false');
        console.log("iOS Status: No choice found. Banner forced to flex.");
    } else {
        banner.style.display = "none";
        banner.setAttribute('inert', '');
        return;
    }

    // 3. The Global Handler
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
                window.fireMinimalGA4();
            } else {
                console.warn("Local Dev: Minimal GA4 would trigger.");
            }
        }

        document.body.focus();
        banner.style.display = "none";
        
        // Slight delay for iOS UI transition
        setTimeout(() => {
            banner.remove();
        }, 150);
    };

    // 4. Attach Event Listeners
    const btnAccept = banner.querySelector('.btn-accept');
    const btnReject = banner.querySelector('.btn-reject');

    // Use 'click' but also 'touchstart' for faster response on iOS
    const triggerEvent = (e, status) => {
        e.preventDefault();
        window.handleConsent(status);
    };

    if (btnAccept) {
        btnAccept.onclick = (e) => triggerEvent(e, 'granted');
    }
    
    if (btnReject) {
        btnReject.onclick = (e) => triggerEvent(e, 'denied');
    }
};

// --- THE iOS FIX: pageshow ---
// 'pageshow' fires even when moving through history or internal links on iOS
window.addEventListener('pageshow', (event) => {
    initCookieBanner();
});

// Fallback for standard desktop browsers
if (document.readyState !== 'loading') {
    initCookieBanner();
} else {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
}