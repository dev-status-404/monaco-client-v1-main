import Script from "next/script";

const TAWK_ACCOUNT_ID = "69fdf92ddc1fdb1c3ae76860";
const TAWK_WIDGET_ID = "1jo41amj7";
const TAWK_WIDGET_SRC = `https://embed.tawk.to/${TAWK_ACCOUNT_ID}/${TAWK_WIDGET_ID}`;

export function TawkChat() {
  return (
    <Script id="tawk-widget" strategy="afterInteractive">
      {`
        if (!document.getElementById("tawk-embed-script")) {
          window.Tawk_API = window.Tawk_API || {};
          window.Tawk_LoadStart = new Date();
          (function() {
            var script = document.createElement("script");
            var firstScript = document.getElementsByTagName("script")[0];
            script.id = "tawk-embed-script";
            script.async = true;
            script.src = ${JSON.stringify(TAWK_WIDGET_SRC)};
            script.charset = "UTF-8";
            script.setAttribute("crossorigin", "*");
            firstScript.parentNode.insertBefore(script, firstScript);
          })();
        }
      `}
    </Script>
  );
}
