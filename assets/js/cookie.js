const initCookieBanner = () => {
    const consentKey = "cookie_consent_status";
    const originalBanner = document.getElementById('CookieBanner');

    // If the banner isn't on the page, exit
    if (!originalBanner) return;

    // Safeguard: Prevent the script from running twice on a cloned banner
    if (originalBanner.getAttribute('data-cloned') === 'true') return;

    const currentConsent = localStorage.getItem(consentKey);
    const hasValidChoice = (currentConsent === 'granted' || currentConsent === 'denied');

    if (hasValidChoice) {
        // If a choice is already made, completely erase the banner from the DOM
        originalBanner.remove();
        return;
    }

    // --- THE "CLONE & NUKE" FIX FOR iOS ---
    // Create a pristine, unrendered copy of the banner
    const freshBanner = originalBanner.cloneNode(true);
    
    // Set it up to be visible BEFORE adding it to the page
    freshBanner.style.display = "flex";
    freshBanner.removeAttribute('inert');
    freshBanner.setAttribute('aria-hidden', 'false');
    freshBanner.setAttribute('data-cloned', 'true');

    // Destroy the old, buggy Safari node and swap in the fresh one
    originalBanner.replaceWith(freshBanner);

    // ----------------------------------------

    // The Global Handler (Now targeting the freshBanner)
    window.handleConsent = function(status) {
        if (freshBanner.getAttribute('data-processing') === 'true') return;
        freshBanner.setAttribute('data-processing', 'true');

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
                console.warn("Local Dev: GA4 would trigger.");
            }
        }

        document.body.focus();
        
        // Completely destroy the banner once a choice is made
        freshBanner.remove();
    };

    // Attach Listeners to the new, cloned buttons
    const btnAccept = freshBanner.querySelector('.btn-accept');
    const btnReject = freshBanner.querySelector('.btn-reject');

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

// Listen for pageshow (handles mobile navigation/back buttons)
window.addEventListener('pageshow', initCookieBanner);

// Listen for standard DOM load
if (document.readyState !== 'loading') {
    initCookieBanner();
} else {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
}