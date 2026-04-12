const initCookieBanner = () => {
    const banner = document.getElementById('CookieBanner');
    const consentKey = "cookie_consent_status";
    const legacyKey = "cookieBannerDisplayed"; // Cleanup for old script versions

    if (!banner) return;

    // 1. Migration & Cleanup
    // If the old "Ok!" script left a key, remove it to prevent logic conflicts
    if (localStorage.getItem(legacyKey)) {
        localStorage.removeItem(legacyKey);
    }

    // 2. Strict Validation
    // Safari can sometimes store the string "null" or "undefined". 
    // We only skip the banner if we have a valid, intentional choice.
    const currentConsent = localStorage.getItem(consentKey);
    const isConsentValid = (currentConsent === 'granted' || currentConsent === 'denied');

    if (!isConsentValid) {
        // If no valid choice is found, force the banner to show
        banner.style.display = "flex";
        banner.removeAttribute('inert');
        banner.setAttribute('data-processing', 'false');
    } else {
        // User has already decided; ensure banner stays hidden and non-interactive
        banner.setAttribute('inert', '');
        banner.style.display = "none";
        return; // Exit early
    }

    // 3. The Global Handler
    window.handleConsent = function(status) {
        // Prevent accidental double-taps on mobile
        if (banner.getAttribute('data-processing') === 'true') return;
        banner.setAttribute('data-processing', 'true');

        console.log("Consent decision recorded:", status);
        localStorage.setItem(consentKey, status);
        
        // Relay signal to GCM v2
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': status,
                'ad_user_data': status,
                'ad_personalization': status,
                'analytics_storage': status
            });
        }

        // Trigger Analytics path
        if (status === 'granted') {
            if (typeof window.fireMinimalGA4 === 'function') {
                console.log("Production Logic: window.fireMinimalGA4() triggered.");
                window.fireMinimalGA4();
            } else {
                console.warn("Local Dev Notice: Minimal GA4 would trigger now, but 'analytics-ga4-alt.html' is not loaded.");
            }
        }

        // Accessibility: Shift focus back to the page before removing the element
        document.body.focus();
        banner.style.display = "none";
        
        // Delay removal slightly to ensure storage and GCM signals are processed
        setTimeout(() => {
            banner.remove();
        }, 100);
    };

    // 4. Attach Event Listeners
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

// --- The "Bulletproof" Trigger ---
// Ensures the banner initializes even if Safari loads the script after DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
} else {
    initCookieBanner();
}