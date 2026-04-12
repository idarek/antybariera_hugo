const initCookieBanner = () => {
    const banner = document.getElementById('CookieBanner');
    const consentKey = "cookie_consent_status";

    if (!banner) return;

    // 1. Strict Check for Consent
    const currentConsent = localStorage.getItem(consentKey);
    const hasValidChoice = (currentConsent === 'granted' || currentConsent === 'denied');

    if (!hasValidChoice) {
        // Force the banner and its children to be visible
        banner.style.setProperty('display', 'flex', 'important');
        banner.style.opacity = "1";
        banner.style.visibility = "visible";
        banner.removeAttribute('inert');
        banner.setAttribute('aria-hidden', 'false');
        banner.setAttribute('data-processing', 'false');
    } else {
        // If choice exists, ensure it is hidden
        banner.style.display = "none";
        banner.setAttribute('inert', '');
        banner.setAttribute('aria-hidden', 'true');
        return;
    }

    // 2. The Main Handler
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

        // Move focus back and hide
        document.body.focus();
        banner.style.display = "none";
        banner.setAttribute('inert', '');
        banner.setAttribute('aria-hidden', 'true');
    };

    // 3. Attach Listeners 
    // We use IDs to ensure we are grabbing the specific buttons
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

// --- THE FIXES FOR iOS BLANK STATE ---

// 1. Pageshow handles the navigation/back-button logic
window.addEventListener('pageshow', (event) => {
    // Reset the processing state on new page show
    const banner = document.getElementById('CookieBanner');
    if (banner) banner.setAttribute('data-processing', 'false');
    initCookieBanner();
});

// 2. DOMContentLoaded handles the initial cold load
if (document.readyState !== 'loading') {
    initCookieBanner();
} else {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
}