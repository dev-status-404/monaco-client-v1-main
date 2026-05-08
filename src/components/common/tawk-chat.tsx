import Script from "next/script";

const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID?.trim();
const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID?.trim() || "default";
const widgetSrc = propertyId
  ? `https://embed.tawk.to/${propertyId}/${widgetId}`
  : "";

export function TawkChat() {
  if (!propertyId) {
    return null;
  }

  return (
    <Script id="tawk-widget" strategy="afterInteractive">
      {`
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();
        (function() {
          var script = document.createElement("script");
          var firstScript = document.getElementsByTagName("script")[0];
          script.async = true;
          script.src = ${JSON.stringify(widgetSrc)};
          script.charset = "UTF-8";
          script.setAttribute("crossorigin", "*");
          firstScript.parentNode.insertBefore(script, firstScript);
        })();
      `}
    </Script>
  );
}
