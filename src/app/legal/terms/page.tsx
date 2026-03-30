import React from 'react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Terms and Conditions</h1>
        
        <p className="mb-6 text-gray-700 leading-relaxed">
          Welcome to InternHire. By accessing or using our website, mobile application, or any services provided through the platform (collectively, the “Platform”), you agree to be bound by these Terms and Conditions (“Terms”). If you do not agree with these Terms, please do not use the Platform.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. About the Platform</h2>
          <p className="mb-4 text-gray-700 leading-relaxed">
            InternHire is an online platform operated by Optroute Logistics Technologies Private Limited, a company registered in India with its registered address at #4/608, V.O.C Street, Perungudi, Chennai, Tamil Nadu 600041.
          </p>
          <p className="mb-2 text-gray-700">The Platform enables:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Discovery of internships, project work, freelance work, and job opportunities</li>
            <li>Interaction between Candidates/Students and Employers/Recruiters</li>
            <li>Assessment-based evaluation of candidates</li>
            <li>Generation of Industry Readiness Scores, reports, rankings, and analytics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Eligibility</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>You must be at least 18 years of age to register and use the Platform.</li>
            <li>By using the Platform, you confirm that you are legally capable of entering into a binding agreement under Indian law.</li>
            <li>If you are using the Platform on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
          
          <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">3.1 Account Registration</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Users must provide accurate, complete, and up-to-date information during registration.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">3.2 Account Responsibility</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Any activity carried out using your account shall be deemed to be performed by you.</li>
            <li>InternHire is not responsible for unauthorized access caused by user negligence.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Assessments & Industry Readiness Score</h2>
          
          <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">4.1 Assessments</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>The Platform conducts assessment tests across multiple domains and sub-domains.</li>
            <li>Assessment content is proprietary and must not be copied, shared, or reproduced.</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">4.2 Industry Readiness Score</h3>
          <p className="mb-2 text-gray-700">Scores are calculated based on performance in assessments conducted on the Platform. Scores may include:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Overall readiness score</li>
            <li>Domain-wise scores</li>
            <li>Sub-domain scores</li>
            <li>Rankings based on city, college, or industry</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">4.3 Disclaimer on Scores</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Industry Readiness Scores are indicative, not absolute.</li>
            <li>Scores do not guarantee employment, internships, or selection.</li>
            <li>Recruiters may use scores as one of many evaluation parameters.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Use of Platform by Candidates / Students</h2>
          <p className="mb-2 text-gray-700">Candidates agree that:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
            <li>All submitted information is truthful and accurate</li>
            <li>They will not attempt to manipulate assessments or scores</li>
            <li>They will not engage in cheating, impersonation, or misuse of the Platform</li>
            <li>They understand that rankings and scores are dynamic and may change over time</li>
          </ul>
          <p className="mb-2 text-gray-700">Violation may result in:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Suspension or termination of account</li>
            <li>Invalidation of scores or assessments</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Use of Platform by Recruiters / Employers</h2>
          <p className="mb-2 text-gray-700">Recruiters agree that:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
            <li>Job postings must be genuine and lawful</li>
            <li>Candidate data shall be used only for recruitment purposes</li>
            <li>No discriminatory, misleading, or unlawful practices shall be followed</li>
            <li>Platform analytics and recommendations are advisory in nature</li>
          </ul>
          <p className="mb-2 text-gray-700">Recruiters must not:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Misuse candidate data</li>
            <li>Share candidate data without consent</li>
            <li>Attempt to reverse engineer platform algorithms</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Usage & Privacy</h2>
          <p className="mb-4 text-gray-700 leading-relaxed">
            InternHire collects and processes personal data in accordance with its Privacy Policy. Assessment results, scores, and analytics may be anonymized and used for:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
            <li>Platform insights</li>
            <li>Industry analysis</li>
            <li>Improving recommendation systems</li>
          </ul>
          <p className="text-gray-700">By using the Platform, you consent to such data processing.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>All content, assessments, algorithms, reports, designs, logos, and software are the intellectual property of Optroute Logistics Technologies Private Limited.</li>
            <li>Users are granted a limited, non-exclusive, non-transferable right to access the Platform.</li>
            <li>Any unauthorized copying, redistribution, or commercial use is strictly prohibited.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Platform Availability</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>We strive to ensure uninterrupted access, but do not guarantee error-free or continuous operation.</li>
            <li>Maintenance, upgrades, or technical issues may result in temporary downtime.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Payments & Subscriptions (If Applicable)</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Certain features may be paid or subscription-based.</li>
            <li>All payments are non-refundable unless explicitly stated.</li>
            <li>Prices may change with prior notice.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Termination</h2>
          <p className="mb-2 text-gray-700">We reserve the right to:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
            <li>Suspend or terminate accounts without notice if these Terms are violated</li>
            <li>Remove content that violates laws or platform policies</li>
          </ul>
          <p className="text-gray-700">Users may also terminate their account at any time.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Limitation of Liability</h2>
          <p className="mb-2 text-gray-700">To the maximum extent permitted by law:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>InternHire shall not be liable for indirect, incidental, or consequential damages</li>
            <li>We do not guarantee placement, hiring, or selection outcomes</li>
            <li>Use of the Platform is at your own risk</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Indemnification</h2>
          <p className="mb-2 text-gray-700">You agree to indemnify and hold harmless Optroute Logistics Technologies Private Limited from any claims, losses, or damages arising out of:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Violation of these Terms</li>
            <li>Misuse of the Platform</li>
            <li>Inaccurate or unlawful content submitted by you</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Governing Law & Jurisdiction</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>These Terms shall be governed by the laws of India.</li>
            <li>Any disputes shall be subject to the exclusive jurisdiction of courts located in [Your Preferred City, India].</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">15. Changes to Terms</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>We may update these Terms from time to time.</li>
            <li>Continued use of the Platform after changes implies acceptance of revised Terms.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">16. Contact Information</h2>
          <p className="text-gray-700">
            For any questions or concerns regarding these Terms, please contact:<br />
            Email: <span className="text-gray-500 italic">contact.internhire@gmail.com</span>
          </p>
        </section>
      </div>
    </main>
  );
}
