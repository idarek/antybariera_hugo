const initCookieBanner = () => {
    const banner = document.getElementById('CookieBanner');
    const consentKey = "cookie_consent_status";

    if (!banner) return;

    const currentConsent = localStorage.getItem(consentKey);
    const hasValidChoice = (currentConsent === 'granted' || currentConsent === 'denied');

    if (!hasValidChoice) {
        // Use requestAnimationFrame to ensure the browser is ready to paint
        window.requestAnimationFrame(() => {
            banner.style.setProperty('visibility', 'visible', 'important');
            banner.style.setProperty('opacity', '1', 'important');
            banner.removeAttribute('inert');
            banner.setAttribute('aria-hidden', 'false');
            banner.setAttribute('data-processing', 'false');
            
            // Trigger a tiny layout shift to wake up the Safari renderer
            banner.style.zIndex = "10001"; 
        });
    } else {
        banner.style.visibility = "hidden";
        banner.style.opacity = "0";
        banner.setAttribute('inert', '');
        banner.setAttribute('aria-hidden', 'true');
        return;
    }

    // The Global Handler
    window.handleConsent = function(status) {
        if (banner.getAttribute('data-processing') === 'true') return;
        banner.setAttribute('data-processing', 'true');

        localStorage.setItem(consentKey, status);
        
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': status,
                'ad_user_data': status,
                'ad_personalization': status,
                'analytics_storage': status
            });
        }

        if (status === 'granted' && typeof window.fireMinimalGA4 === 'function') {
            window.fireMinimalGA4();
        }

        document.body.focus();
        banner.style.visibility = "hidden";
        banner.style.opacity = "0";
        banner.setAttribute('inert', '');
    };

    const btnAccept = banner.querySelector('.btn-accept');
    const btnReject = banner.querySelector('.btn-reject');

    if (btnAccept && !btnAccept.getAttribute('data-has-listener')) {
        btnAccept.addEventListener('click', (e) => {
            e.preventDefault();
            window.handleConsent('granted');
        });
        btnAccept.setAttribute('data-has-listener', 'true');
    }
    
    if (btnReject && !btnReject.getAttribute('data-has-listener')) {
        btnReject.addEventListener('click', (e) => {
            e.preventDefault();
            window.handleConsent('denied');
        });
        btnReject.setAttribute('data-has-listener', 'true');
    }
};

// --- Execution ---
window.addEventListener('pageshow', (event) => {
    initCookieBanner();
});

if (document.readyState !== 'loading') {
    initCookieBanner();
} else {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
}