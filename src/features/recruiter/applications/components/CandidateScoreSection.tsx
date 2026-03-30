'use client';

interface CandidateScoreSectionProps {
  candidate: any;
}

export default function CandidateScoreSection({
  candidate,
}: CandidateScoreSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Rank & Score</h2>

      {candidate.globalScore ? (
        <div className="space-y-3">
          <div>
            <span className="text-gray-600">Overall Rank:</span>
            <span className="ml-3 text-xl font-bold text-gray-900">
              #{candidate.globalScore.globalRank}
            </span>
            <span className="ml-4 text-gray-600">
              Score: {candidate.globalScore.globalScore}
            </span>
          </div>

          {candidate.domainScores && candidate.domainScores.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">By Domain:</p>
              <ul className="ml-4 text-sm space-y-1">
                {candidate.domainScores.map((ds: any) => (
                  <li key={ds.domainId} className="text-gray-700">
                    <span className="font-medium">
                      {ds.domain?.name || ds.domainId}
                    </span>{' '}
                    — Rank #{ds.domainRank}, Score {ds.domainScore}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-400">No scoring data available.</p>
      )}
    </div>
  );
}
