'use client';

interface CandidateEducationSectionProps {
  candidate: any;
}

export default function CandidateEducationSection({
  candidate,
}: CandidateEducationSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Education</h2>

      <div className="space-y-4">
        {/* Undergraduate */}
        {candidate.ugEducation && candidate.ugEducation.length > 0 && (
          <div className="border-l-4 border-blue-600 pl-4">
            <p className="font-bold text-gray-900">
              {candidate.ugEducation[0].courseName}
            </p>
            {candidate.ugEducation[0].department && (
              <p className="text-sm text-gray-600">
                {candidate.ugEducation[0].department}
              </p>
            )}
            {candidate.ugEducation[0].establishment && (
              <p className="text-sm text-gray-600">
                {candidate.ugEducation[0].establishment.name}
              </p>
            )}
            <p className="text-sm text-gray-600">
              Completed {candidate.ugEducation[0].completionYear}
              {typeof candidate.ugEducation[0].cgpa === 'number' &&
                ` — CGPA: ${candidate.ugEducation[0].cgpa}`}
            </p>
          </div>
        )}

        {/* Class XII */}
        {candidate.twelfthEducation && (
          <div>
            <p className="font-bold text-gray-900">Class XII</p>
            {candidate.twelfthEducation.stream && (
              <p className="text-sm text-gray-600">
                {candidate.twelfthEducation.stream}
              </p>
            )}
            {candidate.twelfthEducation.establishment && (
              <p className="text-sm text-gray-600">
                {candidate.twelfthEducation.establishment.name}
              </p>
            )}
            <p className="text-sm text-gray-600">
              Passed {candidate.twelfthEducation.passingYear}
              {typeof candidate.twelfthEducation.percentageMarks === 'number' &&
                ` — ${candidate.twelfthEducation.percentageMarks}%`}
            </p>
          </div>
        )}

        {/* Class X */}
        {candidate.tenthEducation && (
          <div>
            <p className="font-bold text-gray-900">Class X</p>
            {candidate.tenthEducation.stream && (
              <p className="text-sm text-gray-600">
                {candidate.tenthEducation.stream}
              </p>
            )}
            {candidate.tenthEducation.establishment && (
              <p className="text-sm text-gray-600">
                {candidate.tenthEducation.establishment.name}
              </p>
            )}
            <p className="text-sm text-gray-600">
              Passed {candidate.tenthEducation.passingYear}
              {typeof candidate.tenthEducation.percentageMarks === 'number' &&
                ` — ${candidate.tenthEducation.percentageMarks}%`}
            </p>
          </div>
        )}

        {/* Handle case where no education data exists */}
        {!candidate.tenthEducation &&
          !candidate.twelfthEducation &&
          (!candidate.ugEducation || candidate.ugEducation.length === 0) && (
            <p className="text-gray-400">No education details added.</p>
          )}
      </div>
    </div>
  );
}
