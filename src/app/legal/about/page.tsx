import React from 'react';

export default function AboutUs() {
  return (
    <main className="min-h-screen bg-white text-gray-900 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-6">About Us</h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            InternHire is a career discovery and talent intelligence platform built to help students, freshers, and early-career professionals become industry-ready — and to help companies hire smarter.
          </p>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            We bring candidates and recruiters together through real opportunities like internships, project work, freelance roles, and entry-level jobs, backed by data, assessments, and actionable insights.
          </p>
        </div>

        {/* Industry Readiness Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">Built for Industry Readiness</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Traditional resumes don’t tell the full story — especially for students and freshers. That’s where Industry Readiness Score comes in.
            </p>
            <p>
              Our platform conducts structured assessment tests to measure how prepared a candidate is for real-world industry roles. The result is a clear, objective score that reflects:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Overall industry readiness</li>
              <li>Domain-wise performance</li>
              <li>Sub-domain level strengths and gaps</li>
            </ul>
            <p className="italic text-gray-500">
              These scores evolve as candidates grow, learn, and upskill.
            </p>
          </div>
        </section>

        {/* Two Column Layout for Candidates and Recruiters */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Candidates */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">For Candidates & Students</h2>
            <p className="mb-4 text-gray-700">
              InternHire helps you understand where you stand and where you can go next. With us, you can:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
              <li>Assess yourself across 250+ industry domains and roles</li>
              <li>Get a detailed readiness scorecard and performance report</li>
              <li>See how you rank by industry, city, or college</li>
              <li>Identify skill gaps before entering the job market</li>
              <li>Build credibility even without prior industry experience</li>
            </ul>
            <p className="text-gray-900 font-medium">
              Whether you’re a student, fresher, or career starter — we help you prepare with clarity and confidence.
            </p>
          </section>

          {/* Recruiters */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b border-gray-200 pb-2">For Recruiters & Companies</h2>
            <p className="mb-4 text-gray-700">
              Hiring early-career talent doesn’t have to be slow or subjective. InternHire enables a data-driven recruitment workflow where decisions are backed by real performance data. Recruiters can:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
              <li>Discover candidates based on verified readiness scores</li>
              <li>Filter and shortlist talent by domain, college, city, or skill level</li>
              <li>Analyze aggregated data to identify top talent pools</li>
              <li>Rank candidates objectively and engage the right profiles faster</li>
              <li>Send targeted notifications and invitations to relevant candidates</li>
            </ul>
            <p className="text-gray-900 font-medium">
              The result: faster hiring, better matches, and higher recruitment efficiency.
            </p>
          </section>
        </div>

        {/* Vision Section */}
        <section className="bg-gray-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
          <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">
            We believe talent should be evaluated on skills and readiness, not just resumes or degrees. InternHire is building an ecosystem where candidates grow with purpose and recruiters hire with confidence — powered by assessments, insights, and real-world relevance.
          </p>
        </section>
      </div>
    </main>
  );
}