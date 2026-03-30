import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { fileURLToPath } from 'url'

const prisma = new PrismaClient()

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// CSV path
const CSV_PATH = path.join(__dirname, 'skills.csv')

interface CsvSkillRow {
  id: string
  category: string
  sub_category: string
  skill: string
}


async function main() {
  console.log('📥 Reading skills CSV...')

  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')

  // Detect delimiter (comma, semicolon, or tab)
  const firstLine = csvContent.split(/\r?\n/)[0] || ''
  let delimiter = ','
  if (firstLine.includes(';') && !firstLine.includes(',')) {
    delimiter = ';'
  } else if (firstLine.includes('\t') && !firstLine.includes(',')) {
    delimiter = '\t'
  }
  console.log(`ℹ️  Using delimiter: "${delimiter === '\t' ? '\\t' : delimiter}"`)

  const records = parse(csvContent, {
    delimiter,
    columns: (headers: string[]) =>
      headers.map(h =>
        h
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/^"|"$/g, '')
      ),
    skip_empty_lines: true,
    trim: true,
    bom: true
  }) as CsvSkillRow[]

  if (records.length === 0) {
    console.error('❌ CSV is empty. No skills to seed.')
    process.exit(1)
  }

  console.log(` ${records.length} skills found`)

  // Debug: Validate first row structure
  if (records.length > 0 && !records[0].skill) {
    console.error('❌ Critical Error: "skill" column not found in parsed data.')
    console.error('   Detected Headers:', Object.keys(records[0]))
    console.error('   First Row Data:', records[0])
    process.exit(1)
  }

  console.log('🔍 Pre-fetching existing skills...')

  const existingSkills = await prisma.skill.findMany({
    select: { name: true }
  })

  const existingSet = new Set(
    existingSkills.map(s => s.name.toLowerCase())
  )

  let inserted = 0
  let skipped = 0
  const errors: string[] = []

  console.log('\n🚀 Starting Skill Seeding...\n')

  for (const [index, row] of records.entries()) {
    const line = index + 2 // CSV header = line 1
    const skillName = row.skill?.trim()

    if (!skillName) {
      errors.push(`Row ${line}: Missing skill name`)
      continue
    }

    if (existingSet.has(skillName.toLowerCase())) {
      skipped++
      console.log(`[SKIP] ${skillName}`)
      continue
    }

    try {
      await prisma.skill.create({
        data: {
          name: skillName,
          category: row.category?.trim() || null,
          subCategory: row.sub_category?.trim() || null
        }
      })

      existingSet.add(skillName.toLowerCase())
      inserted++
      console.log(`[INSERT] ${skillName}`)
    } catch (e) {
      errors.push(
        `Row ${line}: Failed to insert "${skillName}" → ${e instanceof Error ? e.message : String(e)
        }`
      )
    }
  }

  console.log('\n--- Skill Seeding Summary ---')
  console.log(`Total rows        : ${records.length}`)
  console.log(`Inserted          : ${inserted}`)
  console.log(`Skipped duplicates: ${skipped}`)
  console.log(`Errors            : ${errors.length}`)
  console.log('-----------------------------')

  if (errors.length > 0) {
    console.log('\n⚠️ Errors:')
    errors.forEach(err => console.log(' -', err))
  }
}

main()
  .catch(e => {
    console.error('❌ Fatal error during skill seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
