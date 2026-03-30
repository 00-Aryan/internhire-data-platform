import React from 'react'

export default function RefundAndCancellationPolicy() {
  return (
    <main className="min-h-screen bg-white text-gray-900 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          Refund and Cancellation Policy
        </h1>

        <p className="mb-6 text-gray-700 leading-relaxed">
          This Refund and Cancellation Policy applies to all purchases made on
          InternHire, which is owned and operated by Optroute Logistics
          Technologies Private Limited, registered at #4/608, V.O.C Street,
          Perungudi, Chennai, Tamil Nadu 600041, India.
        </p>

        {/* Section 1 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            1. Nature of Services
          </h2>
          <p className="text-gray-700 leading-relaxed">
            InternHire provides digital products and services only, including
            platform access, assessments, industry readiness scores, reports,
            and analytics. No physical goods are sold or shipped.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            2. Subscription Cancellation
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>
              Users may cancel their subscription at any time through their
              account settings or by contacting our support team.
            </li>
            <li>
              Cancellation will stop future renewals of the subscription.
            </li>
            <li>
              Access to the platform will remain active until the end of the
              current billing period, unless stated otherwise.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            3. Refund Policy
          </h2>
          <p className="mb-4 text-gray-700">
            Once a subscription is activated and digital access is provided,
            refunds are generally not applicable, as services are delivered
            instantly.
          </p>

          <p className="mb-3 text-gray-700">
            Refunds may be considered only in the following cases:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Payment deducted but access not granted</li>
            <li>Duplicate or excess payment made due to a technical error</li>
            <li>
              Service not delivered as described due to a verified platform
              issue
            </li>
          </ul>

          <p className="mt-4 text-gray-700">
            All approved refunds will be processed to the original payment
            method within <strong>10–15 business days</strong>, subject to
            payment gateway and bank processing timelines.
          </p>
        </section>

        {/* Section 4 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            4. Non-Refundable Cases
          </h2>
          <p className="mb-3 text-gray-700">
            Refunds will not be provided in the following situations:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Partial usage of the subscription period</li>
            <li>
              User dissatisfaction after accessing assessments, scores, or
              reports
            </li>
            <li>
              Failure to use the service during the subscription validity
            </li>
            <li>
              Violation of platform Terms and Conditions
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            5. Contact for Refunds & Cancellations
          </h2>
          <p className="text-gray-700">
            For cancellation requests or refund-related queries, users must
            contact us with valid transaction details at:
          </p>
          <p className="mt-2 text-gray-600 italic">
            Email: contact.internhire@gmail.com
          </p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            6. Policy Updates
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Optroute Logistics Technologies Private Limited reserves the right
            to modify this policy at any time. Changes will be effective upon
            posting on the InternHire website.
          </p>
        </section>
      </div>
    </main>
  )
}
