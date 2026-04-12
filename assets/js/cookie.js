const initCookieBanner = () => {
    const banner = document.getElementById('CookieBanner');
    const consentKey = "cookie_consent_status";

    if (!banner) return;

    const currentConsent = localStorage.getItem(consentKey);
    const hasValidChoice = (currentConsent === 'granted' || currentConsent === 'denied');

    if (!hasValidChoice) {
        // 1. Show the banner
        banner.style.display = "flex";
        
        // 2. THE "DOM KICK" (Fixes iOS White Box)
        // Reading offsetHeight forces Safari to render the children immediately.
        const forceRender = banner.offsetHeight; 
        
        // 3. Set states
        banner.removeAttribute('inert');
        banner.setAttribute('aria-hidden', 'false');
        banner.setAttribute('data-processing', 'false');
    } else {
        banner.style.display = "none";
        banner.setAttribute('inert', '');
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

        if (status === 'granted') {
            if (typeof window.fireMinimalGA4 === 'function') {
                window.fireMinimalGA4();
            } else {
                console.warn("Local Dev: GA4 would trigger.");
            }
        }

        document.body.focus();
        banner.style.display = "none";
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

// --- THE "HUNTING" TRIGGER ---

const startBanner = () => {
    // If iOS Safari executed the script before drawing the HTML, wait 50ms and try again.
    if (!document.getElementById('CookieBanner')) {
        setTimeout(startBanner, 50);
        return;
    }
    initCookieBanner();
};

// 1. Standard Page Loads
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    startBanner();
} else {
    document.addEventListener('DOMContentLoaded', startBanner);
}

// 2. iOS Back/Forward Cache (bfcache)
window.addEventListener('pageshow', (e) => {
    // e.persisted means the page was pulled from Safari's frozen memory
    if (e.persisted) startBanner();
});

// 3. Hugo Theme Seamless Transitions (Pjax/Turbo)
// If your theme intercepts links, these events force the banner to check its state
document.addEventListener('turbolinks:load', startBanner);
document.addEventListener('turbo:load', startBanner);