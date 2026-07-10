import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | DesiSexy.in — Adult Video Streaming',
  description:
    'Read the Privacy Policy of DesiSexy.in. We are committed to protecting your personal data and privacy while you enjoy our adult video content. Learn how we collect, use, and safeguard your information.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://desisexy.in/privacy' },
  openGraph: {
    title: 'Privacy Policy | DesiSexy.in',
    description: 'Our commitment to your privacy and data protection at DesiSexy.in.',
    url: 'https://desisexy.in/privacy',
    siteName: 'DesiSexy.in',
    type: 'website',
  },
}

// ─── Section data ──────────────────────────────────────────────────────────────

const sections = [
  { id: 'introduction',       label: 'Introduction' },
  { id: 'information',        label: 'Information We Collect' },
  { id: 'usage',              label: 'How We Use Your Information' },
  { id: 'cookies',            label: 'Cookies & Tracking' },
  { id: 'third-party',        label: 'Third-Party Services' },
  { id: 'dmca',               label: 'Content & DMCA' },
  { id: 'age-verification',   label: 'Age Verification (18+)' },
  { id: 'data-security',      label: 'Data Security' },
  { id: 'policy-changes',     label: 'Changes to This Policy' },
  { id: 'contact',            label: 'Contact Us' },
]

// ─── Component ─────────────────────────────────────────────────────────────────

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :root {
          --bg:          #0a0a0f;
          --surface:     #111116;
          --card:        #16161e;
          --border:      rgba(255,255,255,0.07);
          --accent:      #dc2626;
          --accent-dim:  #991b1b;
          --accent-glow: rgba(220,38,38,0.15);
          --text:        #e8e8f0;
          --text-muted:  #9191a4;
          --text-faint:  #5a5a72;
          --radius:      14px;
          --radius-sm:   8px;
        }

        html { scroll-behavior: smooth; }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          color: var(--text);
          line-height: 1.7;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Noise overlay ── */
        .noise-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px 180px;
        }

        /* ── Ambient blobs ── */
        .ambient {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.06;
        }
        .blob-1 {
          width: 600px; height: 600px;
          background: var(--accent);
          top: -200px; right: -200px;
        }
        .blob-2 {
          width: 400px; height: 400px;
          background: #7c3aed;
          bottom: 10%; left: -150px;
        }

        /* ── Page wrapper ── */
        .page-wrapper {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }

        /* ── Header ── */
        .site-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 0 0;
        }
        .logo-text {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--text);
          text-decoration: none;
        }
        .logo-accent { color: var(--accent); }

        .badge-18 {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--accent);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          padding: 5px 12px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        /* ── Hero ── */
        .hero {
          margin-top: 64px;
          margin-bottom: 56px;
          text-align: center;
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--accent-glow);
          border: 1px solid rgba(220,38,38,0.25);
          color: #f87171;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: 20px;
          margin-bottom: 24px;
        }
        .hero-title {
          font-size: clamp(32px, 6vw, 52px);
          font-weight: 800;
          letter-spacing: -1.5px;
          line-height: 1.1;
          background: linear-gradient(135deg, #ffffff 0%, #9191a4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 20px;
        }
        .hero-subtitle {
          font-size: 16px;
          color: var(--text-muted);
          max-width: 560px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }
        .hero-meta {
          display: inline-flex;
          align-items: center;
          gap: 24px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 28px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .hero-meta-item { display: flex; align-items: center; gap: 8px; }
        .hero-meta-dot {
          width: 6px; height: 6px;
          background: var(--accent);
          border-radius: 50%;
          flex-shrink: 0;
        }
        .hero-meta-divider {
          width: 1px; height: 20px;
          background: var(--border);
        }

        /* ── Layout ── */
        .layout {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 32px;
          align-items: start;
        }

        /* ── TOC sidebar ── */
        .toc {
          position: sticky;
          top: 32px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .toc-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-faint);
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }
        .toc-list { list-style: none; display: flex; flex-direction: column; gap: 2px; }
        .toc-link {
          display: block;
          font-size: 12.5px;
          color: var(--text-muted);
          text-decoration: none;
          padding: 7px 10px;
          border-radius: var(--radius-sm);
          transition: all 0.2s;
          border-left: 2px solid transparent;
          line-height: 1.4;
        }
        .toc-link:hover {
          color: var(--text);
          background: rgba(255,255,255,0.04);
          border-left-color: var(--accent);
          padding-left: 14px;
        }

        /* ── Article ── */
        .article { display: flex; flex-direction: column; gap: 0; }

        /* ── Section card ── */
        .section-card {
          position: relative;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 36px 36px 32px;
          margin-bottom: 20px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          overflow: hidden;
          transition: border-color 0.3s;
        }
        .section-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .section-card:hover { border-color: rgba(220,38,38,0.2); }
        .section-card:hover::before { opacity: 1; }

        .section-number {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-number::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(220,38,38,0.3), transparent);
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.4px;
          margin-bottom: 20px;
          line-height: 1.3;
        }

        .section-body p {
          font-size: 14.5px;
          color: var(--text-muted);
          line-height: 1.8;
          margin-bottom: 14px;
        }
        .section-body p:last-child { margin-bottom: 0; }

        .section-body ul, .section-body ol {
          margin: 14px 0 18px 0;
          padding-left: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .section-body li {
          font-size: 14px;
          color: var(--text-muted);
          padding-left: 20px;
          position: relative;
          line-height: 1.7;
        }
        .section-body li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 10px;
          width: 5px; height: 5px;
          background: var(--accent);
          border-radius: 50%;
          flex-shrink: 0;
        }
        .section-body ol { counter-reset: list-counter; }
        .section-body ol li { counter-increment: list-counter; }
        .section-body ol li::before {
          content: counter(list-counter) '.';
          background: none;
          border-radius: 0;
          color: var(--accent);
          font-size: 12px;
          font-weight: 700;
          top: 3px;
          width: auto;
          height: auto;
        }

        .section-body strong { color: var(--text); font-weight: 600; }
        .section-body a { color: #f87171; text-decoration: none; }
        .section-body a:hover { text-decoration: underline; }

        /* ── Highlight box ── */
        .highlight-box {
          background: var(--accent-glow);
          border: 1px solid rgba(220,38,38,0.2);
          border-radius: var(--radius-sm);
          padding: 16px 20px;
          margin: 18px 0;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .highlight-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
        .highlight-text { font-size: 13.5px; color: #fca5a5; line-height: 1.6; }
        .highlight-text strong { color: #fecaca; }

        /* ── Info grid ── */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 18px 0;
        }
        .info-cell {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 14px 16px;
        }
        .info-cell-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-faint);
          margin-bottom: 6px;
        }
        .info-cell-value {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        /* ── Contact card ── */
        .contact-card {
          background: linear-gradient(135deg, rgba(220,38,38,0.08) 0%, rgba(17,17,22,0) 60%);
          border: 1px solid rgba(220,38,38,0.2);
          border-radius: var(--radius);
          padding: 28px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        .contact-info-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 6px;
        }
        .contact-info-value {
          font-size: 22px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.5px;
        }
        .contact-info-sub {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .contact-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--accent);
          color: #fff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          padding: 13px 24px;
          border-radius: 10px;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .contact-btn:hover {
          background: #b91c1c;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(220,38,38,0.3);
        }

        /* ── Footer ── */
        .page-footer {
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: gap;
          gap: 16px;
        }
        .footer-copy {
          font-size: 12.5px;
          color: var(--text-faint);
        }
        .footer-links {
          display: flex;
          gap: 20px;
        }
        .footer-link {
          font-size: 12.5px;
          color: var(--text-faint);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link:hover { color: var(--text-muted); }

        /* ── Divider ── */
        .gradient-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(220,38,38,0.4), transparent);
          margin: 8px 0 28px;
        }

        /* ── Responsive ── */
        @media (max-width: 720px) {
          .layout { grid-template-columns: 1fr; }
          .toc { position: static; display: none; }
          .section-card { padding: 24px 20px; }
          .hero-meta { flex-direction: column; gap: 12px; }
          .hero-meta-divider { width: 40px; height: 1px; }
          .info-grid { grid-template-columns: 1fr; }
          .contact-card { flex-direction: column; }
        }
      `}</style>

      <div className="noise-layer" />
      <div className="ambient">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      <div className="page-wrapper">
        {/* ── Header ── */}
        <header className="site-header">
          <a href="/" className="logo-text">
            Desi<span className="logo-accent">Sexy</span>.in
          </a>
          <div className="badge-18">
            <span>🔞</span> Adults Only — 18+
          </div>
        </header>

        {/* ── Hero ── */}
        <div className="hero">
          <div className="hero-eyebrow">
            <span>📋</span> Legal Document
          </div>
          <h1 className="hero-title">Privacy Policy</h1>
          <p className="hero-subtitle">
            Your privacy is important to us. This policy explains exactly how DesiSexy.in
            collects, uses, and protects your personal information.
          </p>
          <div className="hero-meta">
            <div className="hero-meta-item">
              <div className="hero-meta-dot" />
              <span>Effective: July 1, 2026</span>
            </div>
            <div className="hero-meta-divider" />
            <div className="hero-meta-item">
              <div className="hero-meta-dot" />
              <span>Last Updated: July 10, 2026</span>
            </div>
            <div className="hero-meta-divider" />
            <div className="hero-meta-item">
              <div className="hero-meta-dot" />
              <span>v3.1</span>
            </div>
          </div>
        </div>

        <div className="layout">
          {/* ── TOC ── */}
          <nav className="toc" aria-label="Table of contents">
            <div className="toc-title">Contents</div>
            <ul className="toc-list">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="toc-link">
                    {String(i + 1).padStart(2, '0')}. {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Article ── */}
          <article className="article">

            {/* 1. Introduction */}
            <section className="section-card" id="introduction">
              <div className="section-number">Section 01</div>
              <h2 className="section-title">Introduction</h2>
              <div className="section-body">
                <p>
                  Welcome to <strong>DesiSexy.in</strong> ("we", "us", "our", or the "Platform"). We operate the website
                  located at <a href="https://desisexy.in">desisexy.in</a> and provide an adult video streaming service
                  exclusively for persons who are 18 years of age or older.
                </p>
                <p>
                  This Privacy Policy ("Policy") describes how we collect, receive, use, store, share, transfer, and
                  process personal information about you when you access or use our Platform. It also describes your
                  choices regarding use, access, and correction of your personal information.
                </p>
                <div className="highlight-box">
                  <span className="highlight-icon">⚠️</span>
                  <div className="highlight-text">
                    <strong>Important:</strong> By accessing or using DesiSexy.in, you acknowledge that you have
                    read, understood, and agree to this Privacy Policy in full. If you do not agree, please
                    discontinue use of the Platform immediately.
                  </div>
                </div>
                <p>
                  This Policy applies to all users worldwide. However, if you are located in the European Economic
                  Area (EEA), the UK, or California (USA), additional rights and obligations under GDPR, UK-GDPR, or
                  CCPA may apply to you, as outlined in the relevant sections below.
                </p>
                <p>
                  We are committed to protecting your privacy and maintaining the confidentiality of your personal
                  information. Given the sensitive nature of our Platform, we apply heightened care when handling
                  data relating to your use of adult content.
                </p>
              </div>
            </section>

            {/* 2. Information We Collect */}
            <section className="section-card" id="information">
              <div className="section-number">Section 02</div>
              <h2 className="section-title">Information We Collect</h2>
              <div className="section-body">
                <p>
                  We collect information you provide directly, information collected automatically when you use the
                  Platform, and information from third-party sources. The categories of information we may collect include:
                </p>

                <p><strong>A. Information You Provide Directly</strong></p>
                <ul>
                  <li><strong>Account Registration:</strong> Username, email address, password (hashed), date of birth (for age verification), and optional display name or avatar.</li>
                  <li><strong>Payment Information:</strong> If you subscribe to a premium plan, payment details (card number, billing address) are collected and processed exclusively by our PCI-DSS compliant payment processors. We do not store full card numbers on our servers.</li>
                  <li><strong>Communications:</strong> Any messages you send us via email, contact forms, or support tickets, including their content and metadata.</li>
                  <li><strong>User-Generated Content:</strong> Comments, ratings, reviews, playlist titles, or any other content you voluntarily submit on the Platform.</li>
                  <li><strong>DMCA / Legal Notices:</strong> Name, contact information, and statements provided when filing or responding to content removal requests.</li>
                  <li><strong>Age Verification Documents:</strong> If required, identity documents submitted during enhanced age verification (processed securely and deleted promptly after verification).</li>
                </ul>

                <p><strong>B. Information Collected Automatically</strong></p>
                <ul>
                  <li><strong>Device & Technical Data:</strong> IP address, browser type and version, operating system, device identifiers, screen resolution, and time zone.</li>
                  <li><strong>Usage Data:</strong> Pages visited, videos viewed (titles/categories — not stored in identifiable logs unless you are logged in), search queries, playback duration, clicks, and navigation paths.</li>
                  <li><strong>Log Files:</strong> Server logs capturing access timestamps, request types, referring URLs, and HTTP status codes. Logs are retained for a maximum of 90 days.</li>
                  <li><strong>Cookies & Similar Technologies:</strong> Session tokens, preference cookies, analytics identifiers, and third-party advertising cookies (see Section 4 for full details).</li>
                  <li><strong>Geolocation Data:</strong> Country and region-level location derived from your IP address for compliance with regional content restrictions and to serve localised content.</li>
                </ul>

                <div className="info-grid">
                  <div className="info-cell">
                    <div className="info-cell-label">Retention — Account Data</div>
                    <div className="info-cell-value">Duration of account + 30 days post-deletion</div>
                  </div>
                  <div className="info-cell">
                    <div className="info-cell-label">Retention — Server Logs</div>
                    <div className="info-cell-value">Maximum 90 days, then auto-purged</div>
                  </div>
                  <div className="info-cell">
                    <div className="info-cell-label">Retention — Payment Records</div>
                    <div className="info-cell-value">7 years (financial/legal compliance)</div>
                  </div>
                  <div className="info-cell">
                    <div className="info-cell-label">Retention — Age Verification</div>
                    <div className="info-cell-value">Deleted immediately after verification</div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. How We Use Information */}
            <section className="section-card" id="usage">
              <div className="section-number">Section 03</div>
              <h2 className="section-title">How We Use Your Information</h2>
              <div className="section-body">
                <p>
                  We use the information we collect for specific, legitimate purposes. We do not sell your personal
                  information to third parties. We use your data to:
                </p>
                <ul>
                  <li><strong>Provide & Operate the Platform:</strong> Authenticate your account, stream content, process payments, and maintain Platform functionality.</li>
                  <li><strong>Personalise Your Experience:</strong> Recommend content based on your viewing history and preferences (if you are a registered user and have not opted out).</li>
                  <li><strong>Communications:</strong> Send you transactional emails (account confirmations, password resets, subscription receipts), service announcements, and, with your consent, promotional newsletters.</li>
                  <li><strong>Age Verification & Legal Compliance:</strong> Verify that users are 18 years of age or older and comply with applicable laws, including 18 U.S.C. § 2257 (US records requirements) and local equivalents.</li>
                  <li><strong>Security & Fraud Prevention:</strong> Detect, investigate, and prevent fraudulent transactions, abuse, unauthorised access, and other harmful or illegal activity.</li>
                  <li><strong>Analytics & Improvement:</strong> Understand how users interact with the Platform to improve performance, fix bugs, and develop new features.</li>
                  <li><strong>Legal Obligations:</strong> Comply with applicable laws, respond to lawful governmental requests, enforce our Terms of Service, and protect our rights and property.</li>
                  <li><strong>Advertising:</strong> Display relevant advertisements (using aggregated, anonymised, or pseudonymised data where possible). Interest-based advertising is only served in jurisdictions where it is lawfully permitted.</li>
                </ul>
                <p>
                  Where we rely on legitimate interests as our legal basis for processing, we ensure that those
                  interests are not outweighed by your rights and interests. You may object to such processing at
                  any time by contacting us at <a href="mailto:admin@desisexy.in">admin@desisexy.in</a>.
                </p>
              </div>
            </section>

            {/* 4. Cookies */}
            <section className="section-card" id="cookies">
              <div className="section-number">Section 04</div>
              <h2 className="section-title">Cookies &amp; Tracking Technologies</h2>
              <div className="section-body">
                <p>
                  We use cookies, web beacons, pixel tags, local storage, and similar technologies
                  to operate the Platform, remember your preferences, and understand usage patterns.
                </p>
                <p><strong>Types of Cookies We Use</strong></p>
                <ul>
                  <li><strong>Strictly Necessary:</strong> Required for the Platform to function. These include session authentication tokens, CSRF protection cookies, and load-balancing cookies. They cannot be disabled without breaking the Platform.</li>
                  <li><strong>Functional / Preference:</strong> Remember your settings such as video quality preference, language, autoplay behaviour, and dark/light mode. Stored for up to 12 months.</li>
                  <li><strong>Analytics:</strong> We use privacy-respecting analytics tools to count visitor sessions, measure page performance, and identify popular content. Analytics data is aggregated and does not identify individual users.</li>
                  <li><strong>Advertising & Targeting:</strong> Third-party ad networks (see Section 5) may set cookies to measure ad impressions and serve interest-based advertising. You can opt out via industry opt-out mechanisms.</li>
                </ul>
                <p><strong>Managing Your Cookie Preferences</strong></p>
                <p>
                  You may configure your browser to refuse all or some cookies, or to alert you when websites set
                  or access cookies. If you disable or refuse cookies, some parts of the Platform may become
                  inaccessible or not function properly. You may also exercise choices through our
                  <strong> Cookie Preference Centre</strong> (accessible via the cookie banner on first visit).
                </p>
                <p>
                  For opt-out of interest-based advertising, visit the{' '}
                  <a href="https://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer">
                    NAI Opt-Out Tool
                  </a>{' '}
                  or the{' '}
                  <a href="https://youradchoices.com/" target="_blank" rel="noopener noreferrer">
                    DAA Consumer Choice Page
                  </a>.
                </p>
                <p>
                  We honour Global Privacy Control (GPC) signals and Do Not Track (DNT) requests where technically
                  feasible, and we do not use cookies to track users across unaffiliated websites.
                </p>
              </div>
            </section>

            {/* 5. Third-Party Services */}
            <section className="section-card" id="third-party">
              <div className="section-number">Section 05</div>
              <h2 className="section-title">Third-Party Services</h2>
              <div className="section-body">
                <p>
                  We integrate with carefully selected third-party providers to operate, improve, and monetise the
                  Platform. These providers may access limited personal data as necessary to perform their services
                  and are contractually bound to protect it.
                </p>
                <ul>
                  <li><strong>Payment Processors:</strong> Secure, PCI-DSS Level 1 certified providers process all financial transactions. We never receive or store raw card data.</li>
                  <li><strong>Content Delivery Networks (CDN):</strong> Video streams and static assets are delivered via global CDN partners. CDN nodes may log your IP address for performance and security purposes.</li>
                  <li><strong>Cloud Infrastructure:</strong> Hosting, storage, and database services are provided by reputable cloud providers operating in secure, certified data centres.</li>
                  <li><strong>Analytics Providers:</strong> Aggregated, privacy-safe analytics tools help us understand Platform usage without identifying individual users.</li>
                  <li><strong>Advertising Networks:</strong> Adult-oriented advertising networks may serve ads on the Platform. These networks operate under their own privacy policies; we encourage you to review them.</li>
                  <li><strong>Age Verification Providers:</strong> Where legally required, we may partner with licensed age-verification services. These providers operate under strict data minimisation principles.</li>
                  <li><strong>Email Service Providers:</strong> Transactional and marketing emails are sent via trusted email delivery platforms.</li>
                  <li><strong>Anti-Fraud & Security Services:</strong> CAPTCHA, bot-detection, and fraud-scoring services may process technical data (such as IP address and device fingerprint) to protect the Platform.</li>
                </ul>
                <p>
                  We do not sell, rent, or trade your personal information to third parties for their own marketing
                  purposes. Any sharing of data with third parties is strictly limited to what is necessary for the
                  services described above, or as required by law.
                </p>
                <div className="highlight-box">
                  <span className="highlight-icon">🔗</span>
                  <div className="highlight-text">
                    Our Platform may contain links to external websites. We are not responsible for the privacy
                    practices of those sites. We encourage you to read their privacy policies before providing
                    any personal information.
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Content & DMCA */}
            <section className="section-card" id="dmca">
              <div className="section-number">Section 06</div>
              <h2 className="section-title">Content &amp; DMCA</h2>
              <div className="section-body">
                <p>
                  DesiSexy.in takes intellectual property rights very seriously and expects all users and content
                  partners to do the same. We comply with the Digital Millennium Copyright Act (DMCA) and
                  equivalent international copyright laws.
                </p>
                <p><strong>Permitted Content</strong></p>
                <p>
                  All content hosted on the Platform must be legally produced adult content featuring only
                  performers who are 18 years of age or older at the time of production. Content depicting minors,
                  non-consensual acts, or any other illegal material is strictly prohibited and will result in
                  immediate account termination and referral to law enforcement authorities.
                </p>
                <p><strong>DMCA Takedown Notices</strong></p>
                <p>
                  If you believe that content available on DesiSexy.in infringes your copyright, you may submit a
                  DMCA takedown notice to our designated agent. Your notice must include:
                </p>
                <ol>
                  <li>Identification of the copyrighted work claimed to be infringed.</li>
                  <li>Identification of the allegedly infringing material and its URL on our Platform.</li>
                  <li>Your contact information (name, address, telephone number, and email address).</li>
                  <li>A statement that you have a good-faith belief that use of the material is not authorised.</li>
                  <li>A statement that the information in the notice is accurate, under penalty of perjury.</li>
                  <li>Your physical or electronic signature.</li>
                </ol>
                <p>
                  Send DMCA notices to: <a href="mailto:admin@desisexy.in">admin@desisexy.in</a> with the subject
                  line <strong>"DMCA Takedown Request"</strong>. We will respond within 72 hours and expeditiously
                  remove infringing content upon receiving a valid notice.
                </p>
                <p>
                  Counter-notices may be submitted by the alleged infringer in accordance with Section 512(g) of
                  the DMCA. Repeat infringers' accounts will be terminated at our sole discretion.
                </p>
                <p><strong>18 U.S.C. § 2257 Compliance</strong></p>
                <p>
                  All visual depictions of sexually explicit conduct displayed on this website were produced in
                  compliance with the record-keeping requirements of 18 U.S.C. § 2257. Records are maintained by
                  the respective producers of such content. Inquiries regarding such records should be directed to
                  the originating producer of the content in question.
                </p>
              </div>
            </section>

            {/* 7. Age Verification */}
            <section className="section-card" id="age-verification">
              <div className="section-number">Section 07</div>
              <h2 className="section-title">Age Verification (18+)</h2>
              <div className="section-body">
                <div className="highlight-box">
                  <span className="highlight-icon">🔞</span>
                  <div className="highlight-text">
                    <strong>DesiSexy.in is strictly for adults aged 18 years or older.</strong> Accessing this
                    Platform if you are under 18 is prohibited and may be illegal in your jurisdiction.
                  </div>
                </div>
                <p>
                  By entering and using DesiSexy.in, you confirm that:
                </p>
                <ul>
                  <li>You are at least 18 years of age (or the age of majority in your jurisdiction, whichever is greater).</li>
                  <li>You are accessing this content voluntarily and have not been coerced or forced to do so.</li>
                  <li>You are aware of the adult nature of the content available on this Platform.</li>
                  <li>The access to and display of this content is legal in your jurisdiction.</li>
                  <li>You will not permit any minor to access this Platform using your device or account.</li>
                </ul>
                <p>
                  We employ technical measures to enforce age restrictions, including date-of-birth validation at
                  registration and, where required by applicable law (such as the UK Online Safety Act 2023), more
                  robust age assurance mechanisms. If we reasonably suspect that an account belongs to a minor,
                  we reserve the right to suspend or terminate that account without notice.
                </p>
                <p>
                  Parents and guardians wishing to restrict access to adult content should use appropriate
                  parental control software. For a list of free filtering tools, visit{' '}
                  <a href="https://www.net-aware.org.uk" target="_blank" rel="noopener noreferrer">
                    net-aware.org.uk
                  </a>{' '}
                  or your Internet Service Provider's parental controls page.
                </p>
              </div>
            </section>

            {/* 8. Data Security */}
            <section className="section-card" id="data-security">
              <div className="section-number">Section 08</div>
              <h2 className="section-title">Data Security</h2>
              <div className="section-body">
                <p>
                  We implement industry-standard technical and organisational security measures to protect your
                  personal information against unauthorised access, alteration, disclosure, or destruction. These
                  measures include:
                </p>
                <ul>
                  <li><strong>Encryption in Transit:</strong> All data transmitted between your browser and our servers is encrypted using TLS 1.2 or TLS 1.3.</li>
                  <li><strong>Encryption at Rest:</strong> Sensitive data stored in our databases (including passwords, which are stored as salted bcrypt hashes) is encrypted at rest using AES-256.</li>
                  <li><strong>Access Controls:</strong> Strict role-based access controls (RBAC) ensure that only authorised personnel can access personal data, and only to the extent necessary for their role.</li>
                  <li><strong>Intrusion Detection:</strong> We operate automated intrusion detection and prevention systems (IDS/IPS) and conduct regular penetration testing.</li>
                  <li><strong>Vulnerability Management:</strong> We apply security patches promptly and conduct regular security audits of our codebase and infrastructure.</li>
                  <li><strong>Incident Response:</strong> We maintain a documented incident response plan. In the event of a data breach that is likely to result in a high risk to your rights and freedoms, we will notify you and the relevant supervisory authorities within the timeframes required by applicable law.</li>
                </ul>
                <p>
                  While we take strong measures to protect your data, no method of transmission over the Internet
                  or electronic storage is 100% secure. We therefore cannot guarantee absolute security.
                  You are responsible for maintaining the confidentiality of your account credentials and for any
                  activity that occurs under your account.
                </p>
                <p><strong>Your Rights</strong></p>
                <p>
                  Depending on your location, you may have the right to: access, correct, or delete your personal
                  data; restrict or object to our processing of your data; data portability; and to withdraw
                  consent at any time. To exercise these rights, contact us at{' '}
                  <a href="mailto:admin@desisexy.in">admin@desisexy.in</a>. We will respond within 30 days.
                </p>
              </div>
            </section>

            {/* 9. Changes to Policy */}
            <section className="section-card" id="policy-changes">
              <div className="section-number">Section 09</div>
              <h2 className="section-title">Changes to This Policy</h2>
              <div className="section-body">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices,
                  technology, legal requirements, or for other operational reasons. When we make material changes,
                  we will:
                </p>
                <ul>
                  <li>Update the <strong>"Last Updated"</strong> date at the top of this page.</li>
                  <li>Display a prominent notice on the Platform notifying you of the changes.</li>
                  <li>Where required by law or where we deem it appropriate, send you an email notification to the address associated with your account.</li>
                </ul>
                <p>
                  Your continued use of the Platform following the posting of changes constitutes your acceptance of
                  the updated Policy. If you do not agree with the updated Policy, you must stop using the Platform
                  and may request deletion of your account by contacting us.
                </p>
                <p>
                  We encourage you to periodically review this Policy to stay informed about how we are protecting
                  your information. Previous versions of this Policy are available upon written request.
                </p>
              </div>
            </section>

            {/* 10. Contact */}
            <section className="section-card" id="contact">
              <div className="section-number">Section 10</div>
              <h2 className="section-title">Contact Us</h2>
              <div className="section-body">
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data
                  practices, please do not hesitate to reach out. We take all privacy enquiries seriously and
                  aim to respond within <strong>72 hours</strong> on business days.
                </p>
              </div>
              <div className="contact-card">
                <div>
                  <div className="contact-info-label">Primary Contact</div>
                  <div className="contact-info-value">admin@desisexy.in</div>
                  <div className="contact-info-sub">Privacy &amp; Legal Enquiries · DesiSexy.in · desisexy.in</div>
                </div>
                <a href="mailto:admin@desisexy.in" className="contact-btn">
                  ✉️ Send Email
                </a>
              </div>
              <div className="section-body" style={{ marginTop: '20px' }}>
                <p>
                  For DMCA takedown requests, please use the subject line <strong>"DMCA Takedown Request"</strong>.
                  For data deletion or access requests under GDPR / CCPA, use subject line{' '}
                  <strong>"Privacy Rights Request"</strong>. For all other enquiries, use{' '}
                  <strong>"Privacy Policy Enquiry"</strong>.
                </p>
              </div>
            </section>

            <div className="gradient-divider" />

            {/* Footer */}
            <footer className="page-footer">
              <div className="footer-copy">
                © {new Date().getFullYear()} DesiSexy.in — All rights reserved. Adults only (18+).
              </div>
              <nav className="footer-links" aria-label="Legal links">
                <a href="/terms" className="footer-link">Terms of Service</a>
                <a href="/privacy" className="footer-link" aria-current="page">Privacy Policy</a>
                <a href="/dmca" className="footer-link">DMCA</a>
              </nav>
            </footer>

          </article>
        </div>
      </div>
    </>
  )
}
