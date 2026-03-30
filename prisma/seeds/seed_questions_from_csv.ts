import { PrismaClient, DifficultyLevel } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your CSV file
const CSV_PATH = path.join(__dirname, 'questions.csv');

interface CsvQuestionRow {
  domain: string;
  subdomain: string;
  questionType: string;
  difficultyLevel?: string;
  timeLimitSeconds?: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOption: string;
  explanation?: string;
}

async function main() {  
  // Read and parse CSV
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const records = parse(csvContent, {
    columns: (header: string[]) => header.map(column => {
      // Normalize headers to camelCase to match the CsvQuestionRow interface.
      // This handles variations like "Domain", "Question Text", and " difficultyLevel".
      const noSpaces = column.trim().replace(/\s+/g, ' ');
      return noSpaces.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      ).replace(/\s/g, '');
    }),
    skip_empty_lines: true,
  }) as CsvQuestionRow[];

  // --- Pre-fetch all required data for performance and case-insensitive lookups ---
  console.log('Performing Database Health Check & Pre-fetching data...');
  const allDomains = await prisma.domain.findMany();
  const allSubdomains = await prisma.subdomain.findMany();
  const allQuestionTypes = await prisma.questionType.findMany();
  const validQuestionTypeNames = new Set(allQuestionTypes.map(qt => qt.name.toLowerCase()));
  console.log(' Pre-fetching complete.');

  // =================================================================
  // PHASE 1: VALIDATION
  // =================================================================
  console.log('\n--- Starting Phase 1: Data Validation ---');
  const validationErrors: string[] = [];
  const validatedRecords: (CsvQuestionRow & { csvLineNumber: number })[] = [];

  for (const [index, row] of records.entries()) {
    const rowIndex = index + 2; // CSV rows are 1-based, plus 1 for the header
    const errorPrefix = `CSV Row ${rowIndex}:`;
    const issues: string[] = [];

    // Handle phantom/empty rows
    if (!row.questionText?.trim() && !row.correctOption?.trim()) {
      continue;
    }

    // --- Data Integrity & Type Validation ---
    if (!row.domain?.trim()) issues.push('Missing "domain".');
    if (!row.subdomain?.trim()) issues.push('Missing "subdomain".');
    if (!row.questionText?.trim()) issues.push('Missing "questionText".');
    
    const questionTypeName = (row.questionType || 'MCQStandard').trim().toLowerCase();
    if (!questionTypeName) {
      issues.push('Missing "questionType".');
    } else if (!validQuestionTypeNames.has(questionTypeName)) {
      issues.push(`Invalid Question Type "${row.questionType}". Must be one of: ${Array.from(validQuestionTypeNames).join(', ')}.`);
    }

    const difficulty = (row.difficultyLevel || 'MEDIUM').trim().toUpperCase();
    if (!Object.values(DifficultyLevel).includes(difficulty as DifficultyLevel)) {
      issues.push(`Invalid difficulty level: '${row.difficultyLevel}'. Must be one of [EASY, MEDIUM, HARD].`);
    }

    // --- MCQStandard Specific Validation ---
    if (questionTypeName === 'mcqstandard') {
      const options = [row.option1, row.option2, row.option3, row.option4].filter(opt => opt != null && String(opt).trim() !== '');
      if (options.length < 2) {
        issues.push('At least two options (e.g., "Option 1", "Option 2") must be provided.');
      }

      const correctOptionRaw = row.correctOption;
      if (correctOptionRaw == null || String(correctOptionRaw).trim() === '') {
        issues.push('Missing "Correct Option".');
      } else {
        const strVal = String(correctOptionRaw).trim();
        let correctOptionNum = parseInt(strVal, 10);

        const optionMatch = strVal.match(/Option\s*(\d+)/i);
        if (optionMatch) {
          correctOptionNum = parseInt(optionMatch[1], 10);
        }

        if (isNaN(correctOptionNum) || correctOptionNum < 1 || correctOptionNum > 4) {
          issues.push(`"Correct Option" must be a number (1-4) or format "Option X", but received "${correctOptionRaw}".`);
        } else {
          const correspondingOptionKey = `option${correctOptionNum}` as keyof CsvQuestionRow;
          const correspondingOptionValue = row[correspondingOptionKey];
          if (correspondingOptionValue == null || String(correspondingOptionValue).trim() === '') {
            issues.push(`"Correct Option" is ${correctOptionNum}, but the corresponding column "Option ${correctOptionNum}" is empty.`);
          }
        }
      }
    }

    if (issues.length > 0) {
      validationErrors.push(`${errorPrefix} ${issues.join(' ')}`);
    } else {
      validatedRecords.push({ ...row, csvLineNumber: rowIndex }); // Add to the list for seeding
    }
  }

  // --- Final Validation Report ---
  if (validationErrors.length > 0) {
    console.error(`\n\n--- ❌ Validation Failed: Found ${validationErrors.length} critical issues ---`);
    validationErrors.forEach(error => console.error(`  - ${error}`));
    console.error('\nNo data was seeded. Please fix the issues in the CSV file and run the script again.');
    await prisma.$disconnect();
    process.exit(1); // Exit with an error code
  }

  console.log(` Validation successful. ${validatedRecords.length} rows are ready to be seeded.`);

  // =================================================================
  // PHASE 2: SEEDING
  // =================================================================
  console.log('\n--- Starting Phase 2: Database Seeding ---');
  let processedCount = 0;
  let skippedForDuplicate = 0;
  const skippedDetails: string[] = [];

  for (const row of validatedRecords) {
    try {
      // Find or create domain
      const domainName = row.domain.trim();
      let domain = allDomains.find(d => d.name.toLowerCase() === domainName.toLowerCase());
      if (!domain) {
        domain = await prisma.domain.create({ data: { name: domainName, weight: 1.0 } });
        allDomains.push(domain);
      }

      // Find or create subdomain
      const subdomainName = row.subdomain.trim();
      let subdomain = allSubdomains.find(s => s.domainId === domain!.id && s.name.toLowerCase() === subdomainName.toLowerCase());
      if (!subdomain) {
        subdomain = await prisma.subdomain.create({ data: { name: subdomainName, domainId: domain.id, weightInDomain: 1.0 } });
        allSubdomains.push(subdomain);
      }

      // Find question type (already validated to exist)
      const questionTypeName = (row.questionType || 'MCQStandard').trim();
      const questionType = allQuestionTypes.find(qt => qt.name.toLowerCase() === questionTypeName.toLowerCase())!;

      // Get difficulty
      const difficulty = (row.difficultyLevel || 'MEDIUM').trim().toUpperCase() as DifficultyLevel;

      // Check for duplicates before creating
      if (questionType.name === 'MCQStandard') {
        const existingQuestion = await prisma.question.findFirst({
          where: {
            domainId: domain.id,
            subdomainId: subdomain.id,
            mcqStandard: {
              questionText: row.questionText.trim(),
            },
          },
        });

        if (existingQuestion) {
          skippedForDuplicate++;
          const msg = `Row ${row.csvLineNumber}: Duplicate - "${row.questionText.substring(0, 50)}..."`;
          console.log(`[SKIPPING] ${msg}`);
          skippedDetails.push(msg);
          continue;
        }
      }

      // Create Question and its specific type in a single, atomic transaction
      await prisma.$transaction(async (tx) => {
        const question = await tx.question.create({
          data: {
            domainId: domain.id,
            subdomainId: subdomain.id,
            questionTypeId: questionType.id,
            difficultyLevel: difficulty,
            isActive: true,
            timeLimitSeconds: row.timeLimitSeconds ? Number(row.timeLimitSeconds) : 60,
          },
        });

        if (questionType.name === 'MCQStandard') {
          const strVal = String(row.correctOption).trim();
          let correctOptionNum = parseInt(strVal, 10);
          const optionMatch = strVal.match(/Option\s*(\d+)/i);
          if (optionMatch) {
            correctOptionNum = parseInt(optionMatch[1], 10);
          }

          await tx.mCQStandard.create({
            data: {
              questionId: question.id,
              questionText: row.questionText.trim(),
              option1: row.option1?.trim(),
              option2: row.option2?.trim(),
              option3: row.option3?.trim(),
              option4: row.option4?.trim(),
              correctOption: correctOptionNum,
              explanation: row.explanation?.trim() || null,
            },
          });
        }
        // Add more types as needed with `else if (questionType.name === '...')`
      });

      processedCount++;
      console.log(`Seeded question: "${row.questionText.substring(0, 50)}..."`);
    } catch (e) {
      // The specific error is now a warning, but we keep this for other unexpected errors.
      const errorMsg = `Row ${row.csvLineNumber}: Database Error - ${e instanceof Error ? e.message : String(e)}`;
      console.error(errorMsg);
      skippedDetails.push(errorMsg);
    }
  }

  // --- Final Summary ---
  console.log('\n--- Seeding Summary ---');
  console.log(`Total valid rows from CSV: ${validatedRecords.length}`);
  console.log(`Successfully inserted: ${processedCount}`);
  console.log(`Skipped (Duplicate Question): ${skippedForDuplicate}`);

  if (skippedDetails.length > 0) {
    console.log('\n--- Skipped Rows Details ---');
    skippedDetails.forEach((msg) => console.log(msg));
  }

  console.log('-----------------------\n');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
