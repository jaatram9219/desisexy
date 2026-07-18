import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { dbService } from "@/lib/dbService";
import PopupNotification from "@/components/PopupNotification";
import AdsterraPopunder from "@/components/AdsterraPopunder";
import StickyMobileBanner from "@/components/StickyMobileBanner";
import { headers, cookies } from 'next/headers'

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
  // Check if this is the admin's own session to prevent tracking own views/visits
  const cookieStore = await cookies()
  const adminSessionToken = cookieStore.get('admin_session')?.value
  const adminKey = process.env.ADMIN_SECRET_KEY || 'edb1e1d2340985f9b5c86dfafa10d5c3cbfb1fede40ee17097e4c35111aae50f'
  const isAdmin = adminSessionToken && adminSessionToken === adminKey

  if (!isAdmin) {
    const headersList = await headers()
    const rawIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1'
    const ip = rawIp.split(',')[0].trim()
    dbService.logVisit(ip).catch(err => console.error('Failed to log visit:', err))
  }

  // Fetch raw HTML scripts / ad network snippets from Settings database
  const headCode = await dbService.getSetting("ad_injection_head", "");
  const bodyCode = await dbService.getSetting("ad_injection_body", "");
  const footCode = await dbService.getSetting("ad_injection_foot", "");

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-brand-bg text-white">
        {/* Head script injection helper executed in body to prevent overriding Next.js automatic head stylesheet injections */}
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
                    if (node.nodeType !== 1) return; // Skip text nodes to prevent them from showing at the top of the page
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
          {/* Global Smartlink popunder trigger */}
          <AdsterraPopunder />
          {/* Floating Mobile sticky banner */}
          <StickyMobileBanner />
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
