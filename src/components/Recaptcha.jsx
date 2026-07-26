import { useEffect, useRef } from "react";

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const SCRIPT_SRC = "https://www.google.com/recaptcha/api.js?render=explicit";

let scriptLoadingPromise = null;

function loadRecaptchaScript() {
  if (window.grecaptcha) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // grecaptcha.ready fires once the library has fully initialized
      window.grecaptcha.ready(resolve);
    };
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA script"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

// Renders a Google reCAPTCHA v2 checkbox widget and reports the verification
// token (or null, once it expires/resets) up to the parent via onChange.
export default function Recaptcha({ onChange }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onChangeRef = useRef(onChange);
  // eslint-disable-next-line react-hooks/refs
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;

    if (!SITE_KEY) {
      console.error(
        "VITE_RECAPTCHA_SITE_KEY is not set — add it to the frontend .env file"
      );
      return;
    }

    loadRecaptchaScript()
      .then(() => {
        if (cancelled || !containerRef.current || widgetIdRef.current !== null) return;
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: (token) => onChangeRef.current?.(token),
          "expired-callback": () => onChangeRef.current?.(null),
          "error-callback": () => onChangeRef.current?.(null),
        });
      })
      .catch((err) => console.error(err.message));

    return () => {
      cancelled = true;
    };
  }, []);

  if (!SITE_KEY) {
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
        CAPTCHA is not configured — set VITE_RECAPTCHA_SITE_KEY in the frontend .env file.
      </p>
    );
  }

  return <div ref={containerRef} />;
}
