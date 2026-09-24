/**
 * Prevents third-party browser extensions (such as MetaMask or wallet extensions)
 * from triggering the Next.js development runtime error overlay when their internal
 * background connections fail.
 *
 * Rendered synchronously in <head> so it captures and silences extension errors
 * before the Next.js error overlay listeners or hydration scripts register.
 */
export function ExtensionErrorSuppressor() {
  const suppressionScript = `
(function () {
  function isExtensionError(item) {
    if (!item) return false;
    var str = "";
    if (typeof item === "string") {
      str = item;
    } else if (typeof item === "object") {
      str = [item.message, item.stack, item.name, String(item)].filter(Boolean).join(" ");
    } else {
      str = String(item);
    }
    return (
      str.indexOf("chrome-extension://") !== -1 ||
      str.indexOf("moz-extension://") !== -1 ||
      str.indexOf("MetaMask") !== -1 ||
      str.indexOf("metamask") !== -1 ||
      str.indexOf("Failed to connect to MetaMask") !== -1 ||
      str.indexOf("nkbihfbeogaeaoehlefnkodbefgpgknn") !== -1 ||
      str.indexOf("inpage.js") !== -1 ||
      str.indexOf("ethereum") !== -1
    );
  }

  function handleEvent(e) {
    if (!e) return;
    var reason = e.reason;
    var error = e.error;
    if (
      isExtensionError(e.message) ||
      isExtensionError(e.filename) ||
      isExtensionError(error) ||
      isExtensionError(reason)
    ) {
      if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
      if (typeof e.stopPropagation === "function") e.stopPropagation();
      if (typeof e.preventDefault === "function") e.preventDefault();
      return true;
    }
  }

  window.addEventListener("error", handleEvent, true);
  window.addEventListener("unhandledrejection", handleEvent, true);

  if (typeof console !== "undefined") {
    var origError = console.error;
    console.error = function () {
      for (var i = 0; i < arguments.length; i++) {
        if (isExtensionError(arguments[i])) return;
      }
      origError.apply(console, arguments);
    };

    var origWarn = console.warn;
    console.warn = function () {
      for (var i = 0; i < arguments.length; i++) {
        if (isExtensionError(arguments[i])) return;
      }
      origWarn.apply(console, arguments);
    };
  }

  if (typeof window.reportError === "function") {
    var origReportError = window.reportError;
    window.reportError = function (err) {
      if (isExtensionError(err)) return;
      origReportError.call(window, err);
    };
  }

  // Observer to dismiss any Next.js overlay triggered by extension scripts
  if (typeof MutationObserver !== "undefined") {
    var observer = new MutationObserver(function () {
      var portals = document.querySelectorAll("nextjs-portal");
      for (var i = 0; i < portals.length; i++) {
        var portal = portals[i];
        var root = portal.shadowRoot || portal;
        var text = (root && root.textContent) || "";
        if (isExtensionError(text)) {
          var closeBtn = root.querySelector && root.querySelector('button[aria-label="Close"], button');
          if (closeBtn) {
            closeBtn.click();
          } else {
            portal.style.display = "none";
          }
        }
      }
    });

    if (document.documentElement) {
      observer.observe(document.documentElement, { childList: true, subtree: true });
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        observer.observe(document.documentElement, { childList: true, subtree: true });
      });
    }
  }
})();
`.trim();

  return (
    <script
      id="extension-error-suppressor"
      dangerouslySetInnerHTML={{ __html: suppressionScript }}
    />
  );
}
