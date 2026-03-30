import React from 'react'

export default function ShippingPolicy() {
  return (
    <main className="min-h-screen bg-white text-gray-900 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          Shipping Policy
        </h1>

        <p className="mb-6 text-gray-700 leading-relaxed">
          This Shipping Policy explains how services purchased on InternHire are
          delivered. InternHire is owned and operated by Optroute Logistics
          Technologies Private Limited, registered at #4/608, V.O.C Street,
          Perungudi, Chennai, Tamil Nadu 600041, India.
        </p>

        {/* Section 1 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            1. Nature of Services
          </h2>
          <p className="text-gray-700 mb-3">
            InternHire provides digital products and services only, including:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Access to our web-based platform</li>
            <li>Internship, project, and freelance opportunity exploration</li>
            <li>Industry Readiness Assessments and scoring</li>
            <li>Reports, analytics, and related digital features</li>
          </ul>
          <p className="mt-3 text-gray-700">
            We do not sell or ship any physical products.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            2. Delivery of Services
          </h2>
          <p className="text-gray-700 leading-relaxed">
            All services are delivered electronically through the InternHire
            platform. Upon successful payment, users are granted access to the
            purchased service via their registered account and/or confirmation
            email.
          </p>
        </section>

        {/* Section 3 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            3. Delivery Timeline
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Access is typically enabled immediately after payment</li>
            <li>
              In rare technical cases, access may take up to 24 hours
            </li>
          </ul>
          <p className="mt-3 text-gray-700">
            If access is not enabled within this timeframe, users should contact
            our support team.
          </p>
        </section>

        {/* Section 4 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            4. Shipping Charges
          </h2>
          <p className="text-gray-700">
            Since InternHire does not deliver physical goods, no shipping or
            delivery charges are applicable.
          </p>
        </section>

        {/* Section 5 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            5. Service Availability
          </h2>
          <p className="text-gray-700 mb-3">
            Access to services is subject to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Successful payment confirmation</li>
            <li>Platform availability</li>
            <li>Compliance with our Terms & Conditions and Privacy Policy</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            6. Failed or Delayed Access
          </h2>
          <p className="text-gray-700 mb-3">
            Users should contact us immediately if they experience:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Payment completed but access not enabled</li>
            <li>Incorrect or incomplete service access</li>
            <li>Login or account-related issues</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            7. Related Policies
          </h2>
          <p className="text-gray-700">
            For details regarding refunds, cancellations, or subscription
            termination, please refer to our Refund and Cancellation Policy.
          </p>
        </section>

        {/* Section 8 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            8. Contact Information
          </h2>
          <p className="text-gray-700">
            For any questions related to this Shipping Policy or delivery of
            digital services, please contact:
          </p>
          <p className="mt-2 text-gray-600 italic">
            Email: contact.internhire@gmail.com
          </p>
        </section>
      </div>
    </main>
  )
}
