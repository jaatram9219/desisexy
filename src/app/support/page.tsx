import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support Center | DesiSexy.in',
  description: 'Get help with DesiSexy.in — FAQs, video playback issues, DMCA takedowns, content reports, and contact support.',
}

export default function SupportPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        .support-page {
          min-height: 100vh;
          background: #0a0a0f;
          color: #e5e7eb;
          font-family: 'Inter', sans-serif;
          padding: 0 0 4rem;
        }
        .support-hero {
          background: linear-gradient(135deg, #0f0f1a 0%, #0a0a0f 100%);
          border-bottom: 1px solid rgba(220,38,38,0.15);
          padding: 4rem 1.5rem 3rem;
          text-align: center;
          position: relative; overflow: hidden;
        }
        .support-hero::before {
          content: '';
          position: absolute; width: 600px; height: 400px;
          background: radial-gradient(ellipse, rgba(220,38,38,0.1) 0%, transparent 70%);
          top: -100px; left: 50%; transform: translateX(-50%);
          pointer-events: none;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.3);
          border-radius: 99px; padding: 0.35rem 1rem;
          color: #f87171; font-size: 0.78rem; font-weight: 600;
          margin-bottom: 1.25rem; letter-spacing: 0.05em; text-transform: uppercase;
        }
        .hero-title { font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; color: #fff; letter-spacing: -0.03em; margin-bottom: 0.75rem; }
        .hero-subtitle { color: rgba(255,255,255,0.45); font-size: 0.95rem; }
        .support-container { max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem 0; }

        .contact-banner {
          background: linear-gradient(135deg, rgba(220,38,38,0.1), rgba(139,92,246,0.07));
          border: 1px solid rgba(220,38,38,0.2);
          border-radius: 16px; padding: 1.75rem 2rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 1.5rem; flex-wrap: wrap; margin-bottom: 2.5rem;
        }
        .contact-banner-text h3 { font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem; }
        .contact-banner-text p { font-size: 0.85rem; color: rgba(255,255,255,0.5); }
        .contact-btn {
          background: #dc2626; color: #fff; border: none; border-radius: 10px;
          padding: 0.75rem 1.5rem; font-size: 0.88rem; font-weight: 600;
          cursor: pointer; white-space: nowrap; text-decoration: none;
          display: inline-block; transition: opacity 0.2s;
        }
        .contact-btn:hover { opacity: 0.85; }

        .section-title { font-size: 0.75rem; font-weight: 700; color: #dc2626; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1.25rem; }
        .cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2.5rem; }
        .help-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 1.5rem; cursor: default;
          transition: border-color 0.2s, background 0.2s;
        }
        .help-card:hover { border-color: rgba(220,38,38,0.25); background: rgba(220,38,38,0.04); }
        .card-icon { font-size: 1.75rem; margin-bottom: 0.75rem; }
        .card-title { font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem; }
        .card-desc { font-size: 0.82rem; color: rgba(255,255,255,0.5); line-height: 1.6; }

        .faq-section { margin-bottom: 2.5rem; }
        .faq-item {
          background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 0.75rem;
          transition: border-color 0.2s;
        }
        .faq-item:hover { border-color: rgba(220,38,38,0.2); }
        .faq-q { font-size: 0.92rem; font-weight: 600; color: #fff; margin-bottom: 0.6rem; display: flex; align-items: flex-start; gap: 0.6rem; }
        .faq-q::before { content: 'Q'; background: rgba(220,38,38,0.15); color: #f87171; width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; flex-shrink: 0; margin-top: 1px; }
        .faq-a { font-size: 0.85rem; color: rgba(255,255,255,0.55); line-height: 1.75; padding-left: 1.625rem; }

        .contact-section {
          background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 2rem; margin-bottom: 2.5rem;
        }
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.25rem; }
        .contact-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; padding: 1.25rem;
        }
        .contact-card-icon { font-size: 1.3rem; margin-bottom: 0.5rem; }
        .contact-card-label { font-size: 0.7rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 0.25rem; }
        .contact-card-value { font-size: 0.88rem; font-weight: 500; color: #f87171; }
        .contact-card-note { font-size: 0.78rem; color: rgba(255,255,255,0.35); margin-top: 0.2rem; }

        .footer-note { text-align: center; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.3); font-size: 0.8rem; }
        @media (max-width: 640px) {
          .cards-grid, .contact-grid { grid-template-columns: 1fr; }
          .contact-banner { flex-direction: column; text-align: center; }
        }
      `}</style>

      <div className="support-page">
        <div className="support-hero">
          <div className="hero-badge">🎧 Support</div>
          <h1 className="hero-title">Support Center</h1>
          <p className="hero-subtitle">Find answers to common questions or reach out to our team</p>
        </div>

        <div className="support-container">
          <div className="contact-banner">
            <div className="contact-banner-text">
              <h3>Need direct help?</h3>
              <p>Our support team responds within 24–48 hours on business days</p>
            </div>
            <a href="mailto:admin@desisexy.in" className="contact-btn">✉️ Email Support</a>
          </div>

          <div className="section-title">⚡ Quick Help Topics</div>
          <div className="cards-grid">
            <div className="help-card">
              <div className="card-icon">▶️</div>
              <div className="card-title">Video Playback Issues</div>
              <div className="card-desc">Having trouble playing videos? Check your browser settings and internet connection. Try disabling browser extensions or ad blockers.</div>
            </div>
            <div className="help-card">
              <div className="card-icon">🔞</div>
              <div className="card-title">Age Verification</div>
              <div className="card-desc">This site is strictly 18+. By using it, you confirm you are of legal age. No accounts or verification is needed to browse.</div>
            </div>
            <div className="help-card">
              <div className="card-icon">⚖️</div>
              <div className="card-title">DMCA / Takedown</div>
              <div className="card-desc">Copyright holder? Submit a DMCA takedown request to dmca@desisexy.in with proof of ownership and the content URL.</div>
            </div>
            <div className="help-card">
              <div className="card-icon">🚩</div>
              <div className="card-title">Report Content</div>
              <div className="card-desc">Found illegal or policy-violating content? Email report@desisexy.in with the video URL. We review all reports within 24 hours.</div>
            </div>
            <div className="help-card">
              <div className="card-icon">🍪</div>
              <div className="card-title">Cookies & Privacy</div>
              <div className="card-desc">We use essential cookies for site functionality. Read our Privacy Policy for details on data collection and your rights.</div>
            </div>
            <div className="help-card">
              <div className="card-icon">💻</div>
              <div className="card-title">Technical Issues</div>
              <div className="card-desc">Site not loading? Try clearing your browser cache, disabling VPN, or switching to a different browser like Chrome or Firefox.</div>
            </div>
          </div>

          <div className="faq-section">
            <div className="section-title">❓ Frequently Asked Questions</div>

            {[
              { q: 'Is DesiSexy.in free to use?', a: 'Yes! DesiSexy.in is completely free. No account, subscription, or payment is required to browse and watch videos.' },
              { q: 'Why is a video not loading?', a: 'Videos are embedded from third-party platforms. If a video doesn\'t load, the source may be temporarily down or geo-restricted in your region. Try refreshing the page or using a VPN.' },
              { q: 'How do I report illegal content?', a: 'Email report@desisexy.in immediately with the video page URL. We take all reports seriously and remove illegal content within 24 hours. Content involving minors is reported to law enforcement.' },
              { q: 'Can I download videos from the site?', a: 'No. Downloading videos is not permitted. All content is for streaming only. Downloading or redistributing content without authorization violates our Terms of Service and copyright law.' },
              { q: 'How do I submit a DMCA copyright takedown?', a: 'Send an email to dmca@desisexy.in with: your contact info, identification of the copyrighted work, the URL of the infringing content, and a signed statement of good faith belief. We process valid requests within 5–10 business days.' },
              { q: 'The site is not accessible in my country. What can I do?', a: 'Some ISPs or governments block adult content sites. You may be able to access the site using a reputable VPN service. Note that accessing adult content must be legal in your jurisdiction.' },
              { q: 'Why do I see ads on the site?', a: 'Advertising helps us keep DesiSexy.in free. All ads comply with our content policies. If you experience intrusive or malicious ads, please report them to admin@desisexy.in.' },
              { q: 'Is my browsing activity tracked?', a: 'We use standard analytics to understand site usage. We do not sell personal data. Read our Privacy Policy for full details on data handling and your rights.' },
            ].map((faq, i) => (
              <div key={i} className="faq-item">
                <div className="faq-q">{faq.q}</div>
                <div className="faq-a">{faq.a}</div>
              </div>
            ))}
          </div>

          <div className="contact-section">
            <div className="section-title">📬 Contact Us Directly</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>Reach out to the right department for faster resolution:</p>
            <div className="contact-grid">
              <div className="contact-card">
                <div className="contact-card-icon">✉️</div>
                <div className="contact-card-label">General Support</div>
                <div className="contact-card-value">admin@desisexy.in</div>
                <div className="contact-card-note">Response within 24–48 hours</div>
              </div>
              <div className="contact-card">
                <div className="contact-card-icon">⚖️</div>
                <div className="contact-card-label">DMCA Takedowns</div>
                <div className="contact-card-value">dmca@desisexy.in</div>
                <div className="contact-card-note">Processed in 5–10 business days</div>
              </div>
              <div className="contact-card">
                <div className="contact-card-icon">🚩</div>
                <div className="contact-card-label">Content Reports</div>
                <div className="contact-card-value">report@desisexy.in</div>
                <div className="contact-card-note">Reviewed within 24 hours</div>
              </div>
              <div className="contact-card">
                <div className="contact-card-icon">💼</div>
                <div className="contact-card-label">Business / Ads</div>
                <div className="contact-card-value">business@desisexy.in</div>
                <div className="contact-card-note">Advertising partnerships</div>
              </div>
            </div>
          </div>

          <div className="footer-note">
            © 2026 DesiSexy.in · Support Center · We respond to all genuine inquiries
          </div>
        </div>
      </div>
    </>
  )
}
