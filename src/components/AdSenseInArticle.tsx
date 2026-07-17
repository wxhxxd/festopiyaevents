"use client";

import { useEffect } from "react";

export default function AdSenseInArticle() {
  useEffect(() => {
    try {
      // Safely initialize the Google AdSense push on client load
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense initialization failed:", e);
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-6 my-10 overflow-hidden flex justify-center items-center relative z-10">
      <ins
        className="adsbygoogle w-full"
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-2446676144525840"
        data-ad-slot="1128799709"
      />
    </div>
  );
}
