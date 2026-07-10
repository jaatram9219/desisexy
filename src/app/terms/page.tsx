import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | DesiSexy.in',
  description: 'Read the Terms of Service for DesiSexy.in — rules, usage policies, content guidelines, and legal information for adult content platform.',
}

export default function TermsPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        .terms-page {
          min-height: 100vh;
          background: #0a0a0f;
          color: #e5e7eb;
          font-family: 'Inter', sans-serif;
          padding: 0 0 4rem;
        }
        .terms-hero {
          background: linear-gradient(135deg, #0f0f1a 0%, #1a0a0a 100%);
          border-bottom: 1px solid rgba(220,38,38,0.2);
          padding: 4rem 1.5rem 3rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .terms-hero::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%);
          top: -150px; left: 50%; transform: translateX(-50%);
          border-radius: 50%; pointer-events: none;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.3);
          border-radius: 99px; padding: 0.35rem 1rem;
          color: #f87171; font-size: 0.78rem; font-weight: 600;
          margin-bottom: 1.25rem; letter-spacing: 0.05em; text-transform: uppercase;
        }
        .hero-title {
          font-size: clamp(2rem, 5vw, 3rem); font-weight: 800;
          color: #fff; letter-spacing: -0.03em; margin-bottom: 0.75rem;
        }
        .hero-subtitle { color: rgba(255,255,255,0.45); font-size: 0.95rem; }
        .terms-container { max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem 0; }
        .toc-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 1.5rem 2rem; margin-bottom: 2.5rem;
        }
        .toc-title { font-size: 0.75rem; font-weight: 700; color: #dc2626; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1rem; }
        .toc-list { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; }
        .toc-list li a { color: rgba(255,255,255,0.55); font-size: 0.85rem; text-decoration: none; transition: color 0.2s; display: flex; align-items: center; gap: 0.4rem; }
        .toc-list li a:hover { color: #f87171; }
        .section { margin-bottom: 2.5rem; }
        .section-card {
          background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 1.75rem 2rem; transition: border-color 0.2s;
        }
        .section-card:hover { border-color: rgba(220,38,38,0.2); }
        .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
        .section-num {
          width: 32px; height: 32px; background: rgba(220,38,38,0.12);
          border: 1px solid rgba(220,38,38,0.3); border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #f87171; font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
        }
        .section-title { font-size: 1.05rem; font-weight: 700; color: #fff; }
        .section-body { color: rgba(255,255,255,0.6); font-size: 0.9rem; line-height: 1.8; }
        .section-body p { margin-bottom: 0.9rem; }
        .section-body p:last-child { margin-bottom: 0; }
        .section-body ul { padding-left: 1.25rem; margin: 0.5rem 0 0.9rem; }
        .section-body ul li { margin-bottom: 0.4rem; }
        .highlight-box {
          background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.25);
          border-radius: 10px; padding: 1rem 1.25rem; margin: 1rem 0;
          color: #fca5a5; font-size: 0.88rem; line-height: 1.7; font-weight: 500;
        }
        .info-box {
          background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.2);
          border-radius: 10px; padding: 1rem 1.25rem; margin: 1rem 0;
          color: #93c5fd; font-size: 0.88rem; line-height: 1.7;
        }
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
        .contact-item {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 1rem;
        }
        .contact-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.35); margin-bottom: 0.3rem; }
        .contact-value { font-size: 0.88rem; color: #f87171; font-weight: 500; }
        .footer-note {
          text-align: center; margin-top: 3rem; padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.3); font-size: 0.8rem;
        }
        @media (max-width: 640px) {
          .toc-list { grid-template-columns: 1fr; }
          .contact-grid { grid-template-columns: 1fr; }
          .section-card { padding: 1.25rem; }
        }
      `}</style>
      <div className="terms-page">
        <div className="terms-hero">
          <div className="hero-badge">⚖️ Legal</div>
          <h1 className="hero-title">Terms of Service</h1>
          <p className="hero-subtitle">Last updated: July 2026 &nbsp;·&nbsp; Effective immediately upon use</p>
        </div>

        <div className="terms-container">
          <div className="toc-card">
            <div className="toc-title">📋 Table of Contents</div>
            <ul className="toc-list">
              <li><a href="#acceptance">→ 1. Acceptance of Terms</a></li>
              <li><a href="#eligibility">→ 2. Age Eligibility (18+)</a></li>
              <li><a href="#use">→ 3. Permitted Use</a></li>
              <li><a href="#prohibited">→ 4. Prohibited Activities</a></li>
              <li><a href="#content">→ 5. Content Policy</a></li>
              <li><a href="#dmca">→ 6. DMCA & Copyright</a></li>
              <li><a href="#disclaimer">→ 7. Disclaimer of Warranties</a></li>
              <li><a href="#liability">→ 8. Limitation of Liability</a></li>
              <li><a href="#changes">→ 9. Changes to Terms</a></li>
              <li><a href="#contact">→ 10. Contact Information</a></li>
            </ul>
          </div>

          <div className="section" id="acceptance">
            <div className="section-card">
              <div className="section-header">
                <div className="section-num">1</div>
                <div className="section-title">Acceptance of Terms</div>
              </div>
              <div className="section-body">
                <p>By accessing or using DesiSexy.in ("the Site", "we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use the Site.</p>
                <p>These Terms constitute a legally binding agreement between you and DesiSexy.in. Your continued use of the Site after any changes to these Terms constitutes your acceptance of the revised Terms.</p>
              </div>
            </div>
          </div>

          <div className="section" id="eligibility">
            <div className="section-card">
              <div className="section-header">
                <div className="section-num">2</div>
                <div className="section-title">Age Eligibility — Adults Only (18+)</div>
              </div>
              <div className="section-body">
                <div className="highlight-box">
                  🔞 This website contains adult content intended exclusively for individuals who are 18 years of age or older. By accessing this site, you confirm that you are at least 18 years old, or the age of majority in your jurisdiction, whichever is greater.
                </div>
                <p>If you are under 18 years old, you are strictly prohibited from accessing this Site. Parents and guardians are responsible for ensuring minors do not access adult content. We recommend using parental control software to block access.</p>
                <p>By using this Site, you represent and warrant that:</p>
                <ul>
                  <li>You are at least 18 years of age</li>
                  <li>You are legally permitted to view adult content in your jurisdiction</li>
                  <li>You will not allow minors to access this Site through your devices</li>
                  <li>Accessing adult content is not illegal in your location</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="section" id="use">
            <div className="section-card">
              <div className="section-header">
                <div className="section-num">3</div>
                <div className="section-title">Permitted Use</div>
              </div>
              <div className="section-body">
                <p>DesiSexy.in grants you a limited, non-exclusive, non-transferable license to access and use the Site for personal, non-commercial purposes.</p>
                <p>You may:</p>
                <ul>
                  <li>Browse and stream videos available on the Site</li>
                  <li>Share links to content pages on the Site</li>
                  <li>Save videos to your browser favorites for personal use</li>
                  <li>Submit content takedown requests via our DMCA process</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="section" id="prohibited">
            <div className="section-card">
              <div className="section-header">
                <div className="section-num">4</div>
                <div className="section-title">Prohibited Activities</div>
              </div>
              <div className="section-body">
                <p>The following activities are strictly prohibited and may result in permanent account termination and/or legal action:</p>
                <ul>
                  <li>Downloading, reproducing, or redistributing content without authorization</li>
                  <li>Using bots, scrapers, or automated tools to access the Site</li>
                  <li>Attempting to hack, disrupt, or compromise Site security</li>
                  <li>Uploading or sharing illegal content of any kind</li>
                  <li>Sharing content involving minors in any sexual context (zero tolerance)</li>
                  <li>Using the Site for commercial purposes without written permission</li>
                  <li>Circumventing any technical measures to access restricted content</li>
                  <li>Misrepresenting your identity or age</li>
                </ul>
                <div className="highlight-box">
                  🚫 Any content involving minors is strictly prohibited and will be reported to law enforcement immediately. We have zero tolerance for such content.
                </div>
              </div>
            </div>
          </div>

          <div className="section" id="content">
            <div className="section-card">
              <div className="section-header">
                <div className="section-num">5</div>
                <div className="section-title">Content Policy</div>
              </div>
              <div className="section-body">
                <p>DesiSexy.in hosts links to and embeds of adult video content. We do not host or store the underlying video files — all content is streamed from third-party platforms including EPorner and other licensed sources.</p>
                <p>All content displayed on this Site is intended to feature consenting adults. We take content moderation seriously and actively review reports of policy-violating content.</p>
                <div className="info-box">
                  ℹ️ If you believe any content on the Site violates our policies or your rights, please use the DMCA removal process described in Section 6, or contact us at admin@desisexy.in.
                </div>
              </div>
            </div>
          </div>

          <div className="section" id="dmca">
            <div className="section-card">
              <div className="section-header">
                <div className="section-num">6</div>
                <div className="section-title">DMCA & Copyright Policy</div>
              </div>
              <div className="section-body">
                <p>DesiSexy.in respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA). If you believe content on the Site infringes your copyright, please submit a takedown notice to admin@desisexy.in including:</p>
                <ul>
                  <li>Your name and contact information</li>
                  <li>Identification of the copyrighted work</li>
                  <li>URL of the infringing content on our Site</li>
                  <li>A statement of good faith belief that the use is unauthorized</li>
                  <li>Your physical or electronic signature</li>
                </ul>
                <p>We will process valid DMCA requests within 5–10 business days and remove infringing content promptly.</p>
              </div>
            </div>
          </div>

          <div className="section" id="disclaimer">
            <div className="section-card">
              <div className="section-header">
                <div className="section-num">7</div>
                <div className="section-title">Disclaimer of Warranties</div>
              </div>
              <div className="section-body">
                <p>The Site is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that the Site will be uninterrupted, error-free, or free of viruses.</p>
                <p>We make no warranties regarding the accuracy, completeness, or reliability of any content available through the Site. Your use of the Site is at your sole risk.</p>
              </div>
            </div>
          </div>

          <div className="section" id="liability">
            <div className="section-card">
              <div className="section-header">
                <div className="section-num">8</div>
                <div className="section-title">Limitation of Liability</div>
              </div>
              <div className="section-body">
                <p>To the maximum extent permitted by law, DesiSexy.in shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Site.</p>
                <p>Our total liability to you for any claims arising from use of the Site shall not exceed the amount you paid us in the past 12 months, or $0 if you have not made any payments.</p>
              </div>
            </div>
          </div>

          <div className="section" id="changes">
            <div className="section-card">
              <div className="section-header">
                <div className="section-num">9</div>
                <div className="section-title">Changes to These Terms</div>
              </div>
              <div className="section-body">
                <p>We reserve the right to modify these Terms at any time. When we make material changes, we will update the "Last Updated" date at the top of this page. Your continued use of the Site after any changes constitutes acceptance of the new Terms.</p>
                <p>We encourage you to review these Terms periodically to stay informed about your rights and obligations.</p>
              </div>
            </div>
          </div>

          <div className="section" id="contact">
            <div className="section-card">
              <div className="section-header">
                <div className="section-num">10</div>
                <div className="section-title">Contact Information</div>
              </div>
              <div className="section-body">
                <p>If you have questions, concerns, or legal inquiries regarding these Terms, please contact us:</p>
                <div className="contact-grid">
                  <div className="contact-item">
                    <div className="contact-label">Email</div>
                    <div className="contact-value">admin@desisexy.in</div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-label">DMCA Requests</div>
                    <div className="contact-value">dmca@desisexy.in</div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-label">Website</div>
                    <div className="contact-value">desisexy.in</div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-label">Response Time</div>
                    <div className="contact-value">Within 5 business days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-note">
            © 2026 DesiSexy.in · These terms are governed by applicable laws · All rights reserved
          </div>
        </div>
      </div>
    </>
  )
}
