'use client';

type Props = {
  candidateId: string;
  globalScore: any;
  domainScores: any[];
  subdomainScores: any[];
};

export default function IndustryReadinessClient({ 
  candidateId, 
  globalScore, 
  domainScores, 
  subdomainScores 
}: Props) {
  // Helper to format score
  const fmt = (n: number | null | undefined) => 
    (n !== null && n !== undefined) ? n.toFixed(3) : '0.000';

  // Get subdomains for a specific domain
  const getSubdomainsForDomain = (domainId: string) => {
    return subdomainScores.filter(s => s.subdomain.domainId === domainId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
          Industry Readiness Score
        </h1>
        <p className="text-gray-600 text-lg">
          A comprehensive scoring system for every profile. Give assessments to improve your scores and know your rank among all candidates.
        </p>
      </div>

      {/* Global Score Card - Prominent Display */}
      <div className="bg-[#F4F4F4] text-black rounded-3xl p-10 mb-10 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">My Score / Rank</h2>
            <p className="text- text-sm">Overall Industry Readiness Performance</p>
          </div>
          
          <div className="flex items-center gap-16">
            {/* Score Display */}
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-2 font-medium tracking-widest uppercase">
                Overall | Score
              </div>
              <div className="text-6xl font-mono font-bold tracking-tight">
                {fmt(globalScore?.globalScore)}
              </div>
            </div>
            
            {/* Divider */}
            <div className="h-20 w-px bg-gray-600"></div>
            
            {/* Rank Display */}
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-2 font-medium tracking-widest uppercase">
                Rank
              </div>
              <div className="text-5xl font-mono font-bold">
                #{globalScore?.globalRank || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Detailed score / ranks in domains and sub-domains
        </h2>
      </div>

      {/* Domain & Subdomain List */}
      <div className="space-y-6 mb-16">
        {domainScores.length === 0 && (
          <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
            <div className="text-gray-400 text-lg mb-2">
              No domain scores found
            </div>
            <p className="text-gray-500 text-sm">
              Take an assessment to get started
            </p>
          </div>
        )}
        
        {domainScores.map((domain, idx) => {
          const subs = getSubdomainsForDomain(domain.domainId);
          
          return (
            <div 
              key={domain.domainId} 
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {/* Domain Header */}
              <div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {domain.domain.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">Domain</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-8 items-center">
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">
                        Score
                      </div>
                      <div className="text-2xl font-mono font-bold text-gray-900">
                        {fmt(domain.domainScore)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">
                        Rank
                      </div>
                      <div className="text-2xl font-mono font-bold text-gray-900">
                        #{domain.domainRank}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Subdomains Table */}
              {subs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Sub-Domain
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Rank
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {subs.map((sub) => (
                        <tr 
                          key={sub.subdomainId}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {sub.subdomain.name}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-mono font-semibold text-gray-900 text-sm">
                              {fmt(sub.subdomainScore)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-mono font-semibold text-gray-900 text-sm">
                              {sub.subdomainRank}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-gray-500 text-sm italic">
                  No subdomain details available for this domain.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
