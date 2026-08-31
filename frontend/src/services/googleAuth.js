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

export const signInWithGoogle = async () => {
  await initializeGoogleIdentity();

  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
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
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: true,
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        reject(new Error('Google sign-in is not available right now. Please try again.'));
      }
    });
  });
};
