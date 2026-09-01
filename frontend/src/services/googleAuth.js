const GOOGLE_SCRIPT_ID = 'google-gsi-script';

const decodeGoogleJwt = (credential) => {
  if (!credential || typeof credential !== 'string') {
    throw new Error('Missing Google credential');
  }

  const payloadPart = credential.split('.')[1];
  if (!payloadPart) {
    throw new Error('Invalid Google credential payload');
  }

  const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const decoded = atob(padded);
  const utf8 = decodeURIComponent(
    Array.from(decoded).map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`).join('')
  );

  return JSON.parse(utf8);
};

export const ensureGoogleIdentityScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      const waitForGoogle = () => {
        if (window.google?.accounts?.id) {
          resolve();
          return;
        }
        window.setTimeout(waitForGoogle, 200);
      };
      waitForGoogle();
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google sign-in script failed to load.'));
    document.head.appendChild(script);
  });
};

export const initializeGoogleIdentity = async () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error('Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to your environment variables.');
  }

  await ensureGoogleIdentityScript();

  if (!window.google?.accounts?.id) {
    throw new Error('Google Identity Services is unavailable right now.');
  }

  if (!window.__driveMeGoogleInitialized) {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: () => {},
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: true,
    });
    window.__driveMeGoogleInitialized = true;
  }
};

const getLocalGoogleFallbackProfile = () => ({
  name: 'Google User',
  email: `google.user+local.${Date.now()}@gmail.com`,
  googleId: `local-google-user-${Date.now()}`,
  picture: '',
});

const isLocalDeveloperFallbackEnabled = () => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocalhost && import.meta.env.DEV && import.meta.env.VITE_ENABLE_LOCAL_GOOGLE_FALLBACK === 'true';
};

const getGoogleOriginError = () => new Error(
  'Google sign-in is not available for this origin. Add http://localhost:3001 to your Google OAuth authorized JavaScript origins and refresh the page.'
);

export const signInWithGoogle = async () => {
  const localFallback = () => {
    if (isLocalDeveloperFallbackEnabled()) {
      return getLocalGoogleFallbackProfile();
    }

    throw getGoogleOriginError();
  };

  try {
    await initializeGoogleIdentity();

    return await new Promise((resolve, reject) => {
      const google = window.google?.accounts?.id;
      if (!google) {
        reject(new Error('Google Identity Services is unavailable right now.'));
        return;
      }

      const callback = (response) => {
        try {
          if (!response?.credential) {
            reject(new Error('Google sign-in was cancelled.'));
            return;
          }

          const payload = decodeGoogleJwt(response.credential);
          resolve({
            name: payload.name || payload.given_name || 'Google User',
            email: payload.email,
            googleId: payload.sub,
            picture: payload.picture || '',
          });
        } catch (error) {
          reject(error);
        }
      };

      google.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
      });

      google.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          try {
            resolve(localFallback());
          } catch (error) {
            reject(getGoogleOriginError());
          }
        }
      });
    });
  } catch (error) {
    if (isLocalDeveloperFallbackEnabled()) {
      return getLocalGoogleFallbackProfile();
    }

    throw error;
  }
};
