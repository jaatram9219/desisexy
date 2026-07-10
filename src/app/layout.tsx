import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { dbService } from "@/lib/dbService";
import PopupNotification from "@/components/PopupNotification";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DesiSexy.in - Watch Premium Desi & Indian Videos in HD",
  description: "DesiSexy.in is a premium video CMS and curation aggregator. Stream the hottest Indian videos, clips, and HLS movies in HD.",
};

export const revalidate = 0; // Disable layout-level cache to fetch fresh dynamic script injections

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch raw HTML scripts / ad network snippets from Settings database
  const headCode = await dbService.getSetting("ad_injection_head", "");
  const bodyCode = await dbService.getSetting("ad_injection_body", "");
  const footCode = await dbService.getSetting("ad_injection_foot", "");

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        {/* Dynamic Head Ad Script / Meta injection */}
        {headCode && (
          <script
            id="ad-injection-head"
            dangerouslySetInnerHTML={{
              __html: `(function(){
                try {
                  const html = ${JSON.stringify(headCode)};
                  const placeholder = document.createElement('div');
                  placeholder.innerHTML = html;
                  Array.from(placeholder.childNodes).forEach(node => {
                    if (node.tagName === 'SCRIPT') {
                      const s = document.createElement('script');
                      if (node.src) s.src = node.src;
                      if (node.innerHTML) s.innerHTML = node.innerHTML;
                      Array.from(node.attributes).forEach(attr => s.setAttribute(attr.name, attr.value));
                      document.head.appendChild(s);
                    } else {
                      document.head.appendChild(node.cloneNode(true));
                    }
                  });
                } catch(e){ console.error("Head injection error:", e); }
              })();`
            }}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-brand-bg text-white">
        {/* Dynamic Body Header Ad Script injection */}
        {bodyCode && (
          <div 
            id="ad-injection-body"
            dangerouslySetInnerHTML={{ __html: bodyCode }} 
          />
        )}

        <AppProvider>
          {children}
          {/* Visitor announcements/notification popup */}
          <PopupNotification />
        </AppProvider>

        {/* Dynamic Footer Ad Script injection */}
        {footCode && (
          <div 
            id="ad-injection-foot"
            dangerouslySetInnerHTML={{ __html: footCode }} 
          />
        )}
      </body>
    </html>
  );
}
