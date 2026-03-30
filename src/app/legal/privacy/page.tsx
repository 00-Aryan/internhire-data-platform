import React from 'react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        
        <p className="mb-6 text-gray-700 leading-relaxed">
          This Privacy Policy explains how InternHire (“Platform”, “we”, “our”, “us”) collects, uses, stores, shares, and protects your personal data when you use our website, mobile application, and related services. By accessing or using the Platform, you agree to the practices described in this Privacy Policy.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Who We Are</h2>
          <p className="text-gray-700 leading-relaxed">
            InternHire is owned and operated by Optroute Logistics Technologies Private Limited, a company registered in India with its registered address at #4/608, V.O.C Street, Perungudi, Chennai, Tamil Nadu 600041.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
          <p className="mb-4 text-gray-700">We collect information to provide, improve, and secure our services.</p>
          
          <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">2.1 Information You Provide Directly</h3>
          <p className="mb-2 text-gray-700">Depending on whether you are a Candidate/Student or Recruiter/Employer, we may collect:</p>
          
          <div className="mb-4">
            <p className="font-medium text-gray-900 mb-1">For Candidates / Students:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Name, email address, phone number</li>
              <li>Date of birth (if required for eligibility)</li>
              <li>Educational details (college, course, graduation year)</li>
              <li>City, location</li>
              <li>Resume, portfolio links, skills</li>
              <li>Assessment responses and scores</li>
            </ul>
          </div>

          <div className="mb-4">
            <p className="font-medium text-gray-900 mb-1">For Recruiters / Employers:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Company name and details</li>
              <li>Contact person details</li>
              <li>Job postings and hiring preferences</li>
              <li>Search, filter, and recruitment activity</li>
            </ul>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">2.2 Assessment & Performance Data</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Assessment attempts and responses</li>
            <li>Industry Readiness Score (overall, domain, sub-domain)</li>
            <li>Rankings (city-wise, college-wise, domain-wise)</li>
            <li>Time taken, completion status, and performance trends</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">2.3 Automatically Collected Information</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>IP address</li>
            <li>Device type, browser, operating system</li>
            <li>Log data, cookies, and usage analytics</li>
            <li>Pages visited and actions taken on the Platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <p className="mb-2 text-gray-700">We use collected data to:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Create and manage user accounts</li>
            <li>Conduct assessments and calculate Industry Readiness Scores</li>
            <li>Generate scorecards, reports, rankings, and analytics</li>
            <li>Match candidates with relevant opportunities</li>
            <li>Enable recruiters to search, filter, and analyze candidates</li>
            <li>Improve platform accuracy, recommendations, and performance</li>
            <li>Send important notifications, updates, and platform-related communication</li>
            <li>Ensure security, prevent fraud, and enforce platform policies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Industry Readiness Score & Analytics</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Scores are generated algorithmically based on assessment performance.</li>
            <li>Scores, rankings, and reports are indicative, not guarantees of employment.</li>
            <li>Recruiters may view candidate scores only when permitted by platform settings or candidate consent.</li>
            <li>
              Aggregated and anonymized data may be used for:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Industry insights</li>
                <li>Talent distribution analysis</li>
                <li>Platform improvements</li>
              </ul>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Sharing & Disclosure</h2>
          <p className="mb-4 text-gray-700">We do not sell personal data. We may share data only in the following cases:</p>

          <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">5.1 With Recruiters / Employers</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Candidate profiles, scores, and reports as per platform permissions</li>
            <li>Only for recruitment and evaluation purposes</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">5.2 Service Providers</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Hosting, analytics, email, payment, and technical service providers</li>
            <li>Bound by confidentiality and data protection obligations</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">5.3 Legal & Compliance</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>When required by law, regulation, court order, or government authority</li>
            <li>To protect the rights, safety, or property of users or the Platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies & Tracking Technologies</h2>
          <p className="mb-2 text-gray-700">We use cookies and similar technologies to:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
            <li>Maintain user sessions</li>
            <li>Analyze traffic and usage patterns</li>
            <li>Improve user experience</li>
          </ul>
          <p className="text-gray-700">You may control cookies through your browser settings. Disabling cookies may affect platform functionality.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>We retain personal data only as long as necessary to fulfill the purposes outlined in this policy.</li>
            <li>Assessment data and scores may be retained for analytics, reporting, and user history unless deletion is requested or required by law.</li>
            <li>Data may be anonymized for long-term analysis.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Data Security</h2>
          <p className="mb-2 text-gray-700">We implement reasonable technical and organizational measures to protect your data, including:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
            <li>Secure servers and access controls</li>
            <li>Encrypted connections where applicable</li>
            <li>Restricted internal access to personal data</li>
          </ul>
          <p className="text-gray-700">However, no system is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. User Rights (India – DPDP Act, 2023)</h2>
          <p className="mb-2 text-gray-700">You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
            <li>Access your personal data</li>
            <li>Request correction or updating of inaccurate data</li>
            <li>Request deletion of your personal data (subject to legal and operational requirements)</li>
            <li>Withdraw consent for data processing (where applicable)</li>
          </ul>
          <p className="text-gray-700">Requests can be made via the contact details below.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Children’s Privacy</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>The Platform is not intended for users under 18 years of age.</li>
            <li>We do not knowingly collect personal data from minors.</li>
            <li>If such data is discovered, it will be deleted promptly.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Third-Party Links</h2>
          <p className="text-gray-700 leading-relaxed">
            The Platform may contain links to third-party websites or services. We are not responsible for the privacy practices or content of such third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>We may update this Privacy Policy from time to time.</li>
            <li>Changes will be posted on this page with an updated “Last Updated” date.</li>
            <li>Continued use of the Platform constitutes acceptance of the revised policy.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
          <p className="text-gray-700">
            For any questions, concerns, or requests related to this Privacy Policy or your personal data, please contact:<br />
            Email: <span className="text-gray-500 italic">contact.internhire@gmail.com</span>
          </p>
        </section>
      </div>
    </main>
  );
}