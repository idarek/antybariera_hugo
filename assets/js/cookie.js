const initCookieBanner = () => {
    const banner = document.getElementById('CookieBanner');
    const consentKey = "cookie_consent_status";
    const expiryDays = 365;

    const CONSENT = {
        GRANTED: 'granted',
        DENIED: 'denied'
    };

    if (!banner) return;

    let currentConsent = null;
    const storedDataString = localStorage.getItem(consentKey);

    // 1. Check, Parse, and Migrate Data
    if (storedDataString) {
        try {
            // Attempt to read as new JSON format
            const storedData = JSON.parse(storedDataString);
            
            // Safeguard if someone manipulated the JSON to remove the timestamp
            if (!storedData || !storedData.timestamp) throw new Error("Invalid JSON structure");

            const isExpired = (Date.now() - storedData.timestamp) > (expiryDays * 24 * 60 * 60 * 1000);
            
            if (isExpired) {
                localStorage.removeItem(consentKey);
            } else {
                currentConsent = storedData.status;
            }
        } catch (e) {
            // THE MIGRATION FIX: Catch old strings (or broken data)
            if (storedDataString === CONSENT.GRANTED || storedDataString === CONSENT.DENIED) {
                currentConsent = storedDataString;
                
                // Actively migrate legacy users to the new JSON format with a fresh 365-day clock
                const migratedData = {
                    status: currentConsent,
                    timestamp: Date.now()
                };
                localStorage.setItem(consentKey, JSON.stringify(migratedData));
                console.log("Legacy cookie consent successfully migrated to new 365-day format.");
            } else {
                // If the data is complete rubbish, nuke it
                localStorage.removeItem(consentKey);
            }
        }
    }

    // 2. Display Logic
    if (!currentConsent) {
        banner.style.display = "flex";
        banner.removeAttribute('inert');
        banner.setAttribute('aria-hidden', 'false');
    } else {
        banner.setAttribute('inert', '');
        banner.setAttribute('aria-hidden', 'true');
        banner.style.display = "none";
        return; // Exit early if valid consent exists
    }

    // 3. The Global Handler
    window.handleConsent = function(status) {
        if (banner.getAttribute('data-processing') === 'true') return;
        banner.setAttribute('data-processing', 'true');

        // Save new consent status with timestamp
        const consentData = {
            status: status,
            timestamp: Date.now()
        };
        localStorage.setItem(consentKey, JSON.stringify(consentData));
        
        // CRITICAL: gtag update must happen BEFORE firing Google Analytics
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': status,
                'ad_user_data': status,
                'ad_personalization': status,
                'analytics_storage': status
            });
        }

        if (status === CONSENT.GRANTED && typeof window.fireMinimalGA4 === 'function') {
            window.fireMinimalGA4();
        }

        // Accessibility & Cleanup
        banner.style.display = "none";
        banner.setAttribute('inert', '');
        banner.setAttribute('aria-hidden', 'true');
        
        if (document.activeElement) {
            document.activeElement.blur();
        }
    };

    // 4. Attach Event Listeners
    const btnAccept = banner.querySelector('.btn-accept');
    const btnReject = banner.querySelector('.btn-reject');

    if (btnAccept) {
        btnAccept.addEventListener('click', (e) => {
            e.preventDefault();
            window.handleConsent(CONSENT.GRANTED);
        });
    }
    
    if (btnReject) {
        btnReject.addEventListener('click', (e) => {
            e.preventDefault();
            window.handleConsent(CONSENT.DENIED);
        });
    }
};

// --- The "Bulletproof" Trigger & bfcache Fix ---

// Handle iOS Back-Forward Cache (bfcache) navigation
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        const banner = document.getElementById('CookieBanner');
        if (banner) banner.setAttribute('data-processing', 'false');
        initCookieBanner();
    }
});

// Handle standard page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
} else {
    initCookieBanner();
}