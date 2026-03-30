-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "Subdomain" ALTER COLUMN "maxScore" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SubdomainRawScore" ADD COLUMN     "maxScore" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "QuestionType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "QuestionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "subdomainId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "difficultyLevel" "DifficultyLevel" NOT NULL,
    "skillTags" JSONB,
    "timeLimitSeconds" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MCQStandard" (
    "questionId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "option1" TEXT NOT NULL,
    "option2" TEXT NOT NULL,
    "option3" TEXT NOT NULL,
    "option4" TEXT NOT NULL,
    "correctOption" INTEGER NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "MCQStandard_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "MCQMultiSelect" (
    "questionId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "option1" TEXT NOT NULL,
    "option2" TEXT NOT NULL,
    "option3" TEXT NOT NULL,
    "option4" TEXT NOT NULL,
    "isOption1Correct" BOOLEAN NOT NULL,
    "isOption2Correct" BOOLEAN NOT NULL,
    "isOption3Correct" BOOLEAN NOT NULL,
    "isOption4Correct" BOOLEAN NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "MCQMultiSelect_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "MCQAssertionReason" (
    "questionId" TEXT NOT NULL,
    "assertionText" TEXT NOT NULL,
    "reasonText" TEXT NOT NULL,
    "correctOption" TEXT NOT NULL,

    CONSTRAINT "MCQAssertionReason_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "MatchTheFollowing" (
    "questionId" TEXT NOT NULL,
    "colAItem1" TEXT NOT NULL,
    "colAItem2" TEXT NOT NULL,
    "colAItem3" TEXT NOT NULL,
    "colAItem4" TEXT NOT NULL,
    "colBItem1" TEXT NOT NULL,
    "colBItem2" TEXT NOT NULL,
    "colBItem3" TEXT NOT NULL,
    "colBItem4" TEXT NOT NULL,
    "correctMatches" JSONB NOT NULL,

    CONSTRAINT "MatchTheFollowing_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "CaseMini" (
    "questionId" TEXT NOT NULL,
    "caseText" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "option1" TEXT NOT NULL,
    "option2" TEXT NOT NULL,
    "option3" TEXT NOT NULL,
    "option4" TEXT NOT NULL,
    "correctOption" INTEGER NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "CaseMini_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "SJT" (
    "questionId" TEXT NOT NULL,
    "situationText" TEXT NOT NULL,
    "option1" TEXT NOT NULL,
    "option2" TEXT NOT NULL,
    "option3" TEXT NOT NULL,
    "option4" TEXT NOT NULL,
    "bestOption" INTEGER NOT NULL,
    "worstOption" INTEGER NOT NULL,
    "rationale" TEXT,

    CONSTRAINT "SJT_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "RoleScenario" (
    "questionId" TEXT NOT NULL,
    "roleContext" TEXT NOT NULL,
    "taskDescription" TEXT NOT NULL,
    "option1" TEXT NOT NULL,
    "option2" TEXT NOT NULL,
    "option3" TEXT NOT NULL,
    "option4" TEXT NOT NULL,
    "correctOption" INTEGER NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "RoleScenario_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "DataInterpretation" (
    "questionId" TEXT NOT NULL,
    "dataBlob" JSONB NOT NULL,
    "questionText" TEXT NOT NULL,
    "option1" TEXT NOT NULL,
    "option2" TEXT NOT NULL,
    "option3" TEXT NOT NULL,
    "option4" TEXT NOT NULL,
    "correctOption" INTEGER NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "DataInterpretation_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "LogicalPuzzle" (
    "questionId" TEXT NOT NULL,
    "puzzleText" TEXT NOT NULL,
    "option1" TEXT NOT NULL,
    "option2" TEXT NOT NULL,
    "option3" TEXT NOT NULL,
    "option4" TEXT NOT NULL,
    "correctOption" INTEGER NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "LogicalPuzzle_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "AppliedMath" (
    "questionId" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "inputValues" JSONB NOT NULL,
    "formulaUsed" TEXT,
    "correctNumericAnswer" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "AppliedMath_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "CodeOutput" (
    "questionId" TEXT NOT NULL,
    "codeBlock" TEXT NOT NULL,
    "option1" TEXT NOT NULL,
    "option2" TEXT NOT NULL,
    "option3" TEXT NOT NULL,
    "option4" TEXT NOT NULL,
    "correctOption" INTEGER NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "CodeOutput_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "SQLTask" (
    "questionId" TEXT NOT NULL,
    "tableStructure" JSONB NOT NULL,
    "questionPrompt" TEXT NOT NULL,
    "correctQuery" TEXT NOT NULL,
    "expectedOutput" JSONB NOT NULL,

    CONSTRAINT "SQLTask_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "BusinessCase" (
    "questionId" TEXT NOT NULL,
    "caseText" TEXT NOT NULL,
    "dataPoints" JSONB NOT NULL,
    "metricToCompute" TEXT NOT NULL,
    "correctValue" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "BusinessCase_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "FinanceModel" (
    "questionId" TEXT NOT NULL,
    "financialInputs" JSONB NOT NULL,
    "metric" TEXT NOT NULL,
    "correctValue" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "FinanceModel_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "MarketingOptimization" (
    "questionId" TEXT NOT NULL,
    "campaignData" JSONB NOT NULL,
    "option1" TEXT NOT NULL,
    "option2" TEXT NOT NULL,
    "option3" TEXT NOT NULL,
    "option4" TEXT NOT NULL,
    "correctOption" INTEGER NOT NULL,
    "reason" TEXT,

    CONSTRAINT "MarketingOptimization_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "ShortAnswer" (
    "questionId" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "idealAnswer" TEXT NOT NULL,
    "gradingRubric" JSONB NOT NULL,

    CONSTRAINT "ShortAnswer_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "EmailTask" (
    "questionId" TEXT NOT NULL,
    "scenarioText" TEXT NOT NULL,
    "idealStructure" JSONB NOT NULL,
    "sampleIdealEmail" TEXT NOT NULL,

    CONSTRAINT "EmailTask_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "IdeaTask" (
    "questionId" TEXT NOT NULL,
    "challengeStatement" TEXT NOT NULL,
    "idealPoints" JSONB NOT NULL,

    CONSTRAINT "IdeaTask_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "CodeChallenge" (
    "questionId" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "constraints" JSONB NOT NULL,
    "referenceSolution" TEXT NOT NULL,
    "testCases" JSONB NOT NULL,

    CONSTRAINT "CodeChallenge_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "CodeTestCases" (
    "questionId" TEXT NOT NULL,
    "testcases" JSONB NOT NULL,
    "expectedResults" JSONB NOT NULL,

    CONSTRAINT "CodeTestCases_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "DragDrop" (
    "questionId" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "correctSequence" JSONB NOT NULL,

    CONSTRAINT "DragDrop_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "FileUpload" (
    "questionId" TEXT NOT NULL,
    "instructionsText" TEXT NOT NULL,
    "fileTypeAllowed" TEXT NOT NULL,
    "evaluationCriteria" JSONB NOT NULL,
    "sampleOutput" TEXT,

    CONSTRAINT "FileUpload_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "PortfolioEvaluation" (
    "questionId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "evaluationMetrics" JSONB NOT NULL,

    CONSTRAINT "PortfolioEvaluation_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "Personality" (
    "questionId" TEXT NOT NULL,
    "statementText" TEXT NOT NULL,
    "trait" TEXT NOT NULL,

    CONSTRAINT "Personality_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "CognitiveAbility" (
    "questionId" TEXT NOT NULL,
    "stimulusData" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,

    CONSTRAINT "CognitiveAbility_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "RandomizedNumeric" (
    "questionId" TEXT NOT NULL,
    "formula" TEXT NOT NULL,
    "variableRanges" JSONB NOT NULL,
    "correctAnswer" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RandomizedNumeric_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "DynamicCase" (
    "questionId" TEXT NOT NULL,
    "caseVersions" JSONB NOT NULL,
    "solutionKey" JSONB NOT NULL,

    CONSTRAINT "DynamicCase_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "RapidFire" (
    "questionId" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,

    CONSTRAINT "RapidFire_pkey" PRIMARY KEY ("questionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionType_name_key" ON "QuestionType"("name");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "QuestionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MCQStandard" ADD CONSTRAINT "MCQStandard_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MCQMultiSelect" ADD CONSTRAINT "MCQMultiSelect_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MCQAssertionReason" ADD CONSTRAINT "MCQAssertionReason_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchTheFollowing" ADD CONSTRAINT "MatchTheFollowing_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseMini" ADD CONSTRAINT "CaseMini_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SJT" ADD CONSTRAINT "SJT_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleScenario" ADD CONSTRAINT "RoleScenario_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataInterpretation" ADD CONSTRAINT "DataInterpretation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogicalPuzzle" ADD CONSTRAINT "LogicalPuzzle_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppliedMath" ADD CONSTRAINT "AppliedMath_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeOutput" ADD CONSTRAINT "CodeOutput_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SQLTask" ADD CONSTRAINT "SQLTask_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessCase" ADD CONSTRAINT "BusinessCase_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceModel" ADD CONSTRAINT "FinanceModel_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingOptimization" ADD CONSTRAINT "MarketingOptimization_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortAnswer" ADD CONSTRAINT "ShortAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTask" ADD CONSTRAINT "EmailTask_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeaTask" ADD CONSTRAINT "IdeaTask_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeChallenge" ADD CONSTRAINT "CodeChallenge_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeTestCases" ADD CONSTRAINT "CodeTestCases_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DragDrop" ADD CONSTRAINT "DragDrop_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileUpload" ADD CONSTRAINT "FileUpload_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioEvaluation" ADD CONSTRAINT "PortfolioEvaluation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personality" ADD CONSTRAINT "Personality_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CognitiveAbility" ADD CONSTRAINT "CognitiveAbility_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RandomizedNumeric" ADD CONSTRAINT "RandomizedNumeric_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicCase" ADD CONSTRAINT "DynamicCase_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RapidFire" ADD CONSTRAINT "RapidFire_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
