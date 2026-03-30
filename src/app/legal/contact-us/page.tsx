// ...existing code...
import React from "react";

const ContactUs = () => {
  return (
    <section className="bg-white text-gray-900 flex-grow flex items-center">
      <div className="container px-6 py-8 mx-auto max-w-4xl">
        {/* ---------- Intro ---------- */}
        <div className="text-center">
          <p className="text-sm font-medium text-blue-500 uppercase tracking-wide">
            Contact Us
          </p>

          <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-gray-800">
            We’re here to help!
          </h1>

          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            If you have any questions, concerns, or feedback related to InternHire,
            feel free to reach out to us.
          </p>
        </div>

        {/* ---------- Reasons ---------- */}
        <div className="mt-10 text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Get in Touch
          </h2>

          <p className="mt-2 text-gray-500">
            You can contact us for:
          </p>

          <ul className="mt-4 max-w-md mx-auto list-disc list-outside pl-6 text-left text-gray-500 space-y-1">
            <li>Account or login issues</li>
            <li>Subscription, payment, refund, or cancellation queries</li>
            <li>Access to assessments, scores, or reports</li>
            <li>Employer or recruiter-related inquiries</li>
            <li>General support or feedback</li>
          </ul>
        </div>

        {/* ---------- Contact Details ---------- */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Email */}
          <div className="text-center border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-800">
              Contact Details
            </h3>

            <p className="mt-3 text-gray-500">
              Email us at:
            </p>

            <p className="mt-1 text-blue-500 font-medium">
              contact.internhire@gmail.com
            </p>

            <p className="mt-4 text-sm text-gray-500">
              We aim to respond to all queries within <strong>1–2 business days</strong>.
            </p>
          </div>

          {/* Support Hours */}
          <div className="text-center border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-800">
              Support Hours
            </h3>

            <p className="mt-3 text-gray-500">
              Monday to Friday
            </p>

            <p className="mt-1 text-gray-700 font-medium">
              10:00 AM – 6:00 PM (IST)
            </p>

            <p className="mt-2 text-sm text-gray-500">
              (Excluding public holidays)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
// ...existing code...