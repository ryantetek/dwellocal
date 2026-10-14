import { useEffect } from "react";

export function TrackingScripts({
  ga4Id,
  gtmId,
  headerCode,
  footerCode,
  allowCustom,
}: {
  ga4Id?: string | null;
  gtmId?: string | null;
  headerCode?: string | null;
  footerCode?: string | null;
  allowCustom: boolean;
}) {
  useEffect(() => {
    const nodes: HTMLElement[] = [];
    if (ga4Id) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
      document.head.appendChild(s);
      const inline = document.createElement("script");
      inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`;
      document.head.appendChild(inline);
      nodes.push(s, inline);
    }
    if (gtmId) {
      const s = document.createElement("script");
      s.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`;
      document.head.appendChild(s);
      nodes.push(s);
    }
    if (allowCustom && headerCode) {
      const wrap = document.createElement("div");
      wrap.innerHTML = headerCode;
      Array.from(wrap.children).forEach((child) => {
        document.head.appendChild(child);
        nodes.push(child as HTMLElement);
      });
    }
    if (allowCustom && footerCode) {
      const wrap = document.createElement("div");
      wrap.innerHTML = footerCode;
      Array.from(wrap.children).forEach((child) => {
        document.body.appendChild(child);
        nodes.push(child as HTMLElement);
      });
    }
    return () => {
      nodes.forEach((n) => n.remove());
    };
  }, [allowCustom, footerCode, ga4Id, gtmId, headerCode]);

  return null;
}
