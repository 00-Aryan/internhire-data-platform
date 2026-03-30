import { PrismaClient, EstablishmentType } from '@prisma/client';
import XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Toggle this to false to actually write to the database
const DRY_RUN = true;

/**
 * Helper to determine the EstablishmentType based on the name.
 * Adjust these keywords based on your specific Enum values in schema.prisma
 */
function getEstablishmentType(name: string): EstablishmentType {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('university')) return 'UNIVERSITY' as EstablishmentType;
  if (lowerName.includes('polytechnic') || lowerName.includes('institute')) return 'INSTITUTE' as EstablishmentType;
  if (lowerName.includes('school') && !lowerName.includes('business school')) return 'SCHOOL' as EstablishmentType;
  
  // Default fallback
  return 'COLLEGE' as EstablishmentType;
}

/**
 * Helper to validate email format
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function main() {
  // 1. Resolve the file path (expects 'establishments.xlsx' in the prisma folder)
  const filePath = path.join(__dirname, 'establishments.xlsx');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.log('Please place your "establishments.xlsx" file in the prisma directory.');
    process.exit(1);
  }

  console.log(`📖 Reading file: ${filePath}`);
  
  // 2. Read the Excel file
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Assume data is in the first sheet
  const sheet = workbook.Sheets[sheetName];

  // 3. Convert to JSON (Array of Arrays) to handle raw data
  // header: 1 results in an array of arrays: [['Col1', 'Col2'], ['Val1', 'Val2']]
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log(`🌱 Found ${rows.length} rows. Starting ${DRY_RUN ? 'DRY RUN' : 'import'}...`);

  let successCount = 0;
  let updatedCount = 0;

  // Track issues for reporting
  const errorLogs: { row: number; name: string; issue: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1; // Excel row numbers are 1-based

    // Map columns based on your sample data structure:
    // [0] Category, [1] Name, [2] City, [3] District, [4] State, [5] Address, [6] Website, [7] Phone, [8] Email
    const name = row[1]?.toString().trim();
    
    // Skip empty rows or header rows if they exist
    if (!name || name.toLowerCase() === 'name' || name.toLowerCase().includes('college name')) {
      continue;
    }

    if (name.length < 2) {
      errorLogs.push({ row: rowNum, name, issue: 'Name too short, skipped' });
      continue;
    }

    const city = row[2]?.toString().trim() || null;
    const district = row[3]?.toString().trim() || null;
    const state = row[4]?.toString().trim() || null;
    const address = row[5]?.toString().trim() || null;
    
    let website = row[6]?.toString().trim() || null;
    // Basic URL cleanup: ensure it starts with http/https if it looks like a domain
    if (website && !website.startsWith('http') && website.includes('.')) {
      website = `https://${website}`;
    }

    const phone = row[7]?.toString().trim() || null;
    
    let email = row[8]?.toString().trim() || null;
    
    // Handle multiple emails (comma, semicolon, or space separated) - keep all valid ones
    if (email) {
      const candidates = email.split(/[,;\s]+/).filter(Boolean);
      const validEmails = candidates.filter((e: string) => isValidEmail(e));
      
      if (validEmails.length > 0) {
        email = validEmails.join(', ');
      } else {
        errorLogs.push({ row: rowNum, name, issue: `Invalid email format: "${email}" (Imported as null)` });
        email = null;
      }
    }

    const type = getEstablishmentType(name);

    // 4. Upsert or Create (Check for duplicates by Name + City OR Website)
    const duplicateChecks: any[] = [
      { name: name, city: city }
    ];

    if (website) {
      duplicateChecks.push({ website: website });
    }

    const existing = await prisma.establishment.findFirst({
      where: { OR: duplicateChecks }
    });

    if (existing) {
      if (!DRY_RUN) {
        await prisma.establishment.update({
          where: { id: existing.id },
          data: { name, type, city, district, state, address, website, phone, email }
        });
      }
      updatedCount++;
    } else {
      if (!DRY_RUN) {
        await prisma.establishment.create({
          data: { name, type, city, district, state, address, website, phone, email }
        });
      }
      successCount++;
    }
  }

  console.log(` ${DRY_RUN ? 'Dry run' : 'Import'} completed.`);
  console.log(`   Added: ${successCount}`);
  console.log(`   Updated: ${updatedCount}`);

  if (errorLogs.length > 0) {
    console.log(`\n⚠️  Issues found (${errorLogs.length}):`);
    console.table(errorLogs);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());