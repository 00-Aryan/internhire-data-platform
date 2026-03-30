Based on the code in src/core/scoring/scorePipeline.ts, here is exactly what the ETL (Extract, Transform, Load) pipeline does, step-by-step.

The 4-Step Process
Step 1: Calculate Subdomain Stats (processSubdomainScores)

What it does: It looks at every raw score (answers) for every candidate.
Math: It calculates the Mean (average) and Standard Deviation for each subdomain. Then, it calculates a Z-Score (statistical performance) and Percentile for every candidate.
Where it saves: It updates the SubdomainDerivedScore table.
What to check: Look for populated zScore, percentile, and subdomainScore columns.
Step 2: Roll up to Domain Scores (computeDomainScores)

What it does: It groups subdomains into their parent "Domains" (e.g., grouping "React" and "CSS" into "Frontend").
Math: It calculates a weighted average of the subdomain scores.
Where it saves: It updates the DomainScore table.
What to check: Look for domainScore values for candidates.
Step 3: Calculate Global Score (computeGlobalScores)

What it does: It takes all the Domain scores for a candidate and combines them into one final score.
Where it saves: It updates the GlobalScore table.
What to check: Look for globalScore values.
Step 4: Assign Ranks (assignRanks)

What it does: Once all scores are calculated, it sorts everyone from highest to lowest and assigns a number (1, 2, 3...).
Where it saves: It updates the subdomainRank, domainRank, and globalRank columns in the respective tables.