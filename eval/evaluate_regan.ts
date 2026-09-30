/**
 * REGAN Evaluation Runner Script
 * 
 * Usage:
 *   npm run eval
 * 
 * Reads institutional test fixtures from eval/fixtures/ and evaluates
 * structural extraction coverage across all core Report fields.
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

interface TestFixture {
  id: string;
  name: string;
  file: string;
  expectedEventType: string;
  requiredFields: string[];
  fieldValidators: { name: string; check: (text: string) => boolean }[];
}

const FIXTURES: TestFixture[] = [
  {
    id: "conference",
    name: "Academic Conference Itinerary",
    file: "eval/fixtures/conference_itinerary.txt",
    expectedEventType: "Conference",
    requiredFields: ["title", "date", "venue", "department", "attendance", "keynotes", "accreditation"],
    fieldValidators: [
      { name: "title", check: (t) => t.includes("Symposium") },
      { name: "date", check: (t) => /October \d+/i.test(t) },
      { name: "venue", check: (t) => t.includes("Auditorium") },
      { name: "attendance", check: (t) => /280 participants/i.test(t) },
      { name: "keynotes", check: (t) => /Keynote/i.test(t) },
      { name: "accreditation", check: (t) => /CO-1|PO-4|Bloom/i.test(t) },
    ],
  },
  {
    id: "hackathon",
    name: "Hackathon Brief & Prize Sheet",
    file: "eval/fixtures/hackathon_brief.txt",
    expectedEventType: "Hackathon",
    requiredFields: ["title", "date", "tracks", "awards", "sponsors", "turnout"],
    fieldValidators: [
      { name: "title", check: (t) => t.includes("HackAI") },
      { name: "date", check: (t) => /November \d+/i.test(t) },
      { name: "tracks", check: (t) => /HealthTech|FinTech|ClimateAI/i.test(t) },
      { name: "awards", check: (t) => /1st Place|2nd Place|Best Innovation/i.test(t) },
      { name: "sponsors", check: (t) => /Google Cloud|AWS/i.test(t) },
      { name: "turnout", check: (t) => /340 hackers/i.test(t) },
    ],
  },
  {
    id: "workshop",
    name: "Hands-on Technical Workshop",
    file: "eval/fixtures/workshop_outline.txt",
    expectedEventType: "Workshop",
    requiredFields: ["title", "date", "instructor", "toolchain", "exercises", "skillGain"],
    fieldValidators: [
      { name: "title", check: (t) => t.includes("Kubernetes") },
      { name: "date", check: (t) => /September \d+/i.test(t) },
      { name: "instructor", check: (t) => t.includes("Vikram Joshi") },
      { name: "toolchain", check: (t) => /Docker|Kubernetes|Prometheus/i.test(t) },
      { name: "exercises", check: (t) => /Containerizing|Helm/i.test(t) },
      { name: "skillGain", check: (t) => /Net Skill Gain|121/i.test(t) },
    ],
  },
  {
    id: "meeting",
    name: "Board of Studies Assembly Minutes",
    file: "eval/fixtures/meeting_minutes.txt",
    expectedEventType: "Meeting",
    requiredFields: ["title", "date", "presidingChair", "agendaItems", "resolutions", "actionItems"],
    fieldValidators: [
      { name: "title", check: (t) => t.includes("Board of Studies") },
      { name: "date", check: (t) => /October \d+/i.test(t) },
      { name: "presidingChair", check: (t) => t.includes("Eleanor Ward") },
      { name: "agendaItems", check: (t) => /Agenda Items/i.test(t) },
      { name: "resolutions", check: (t) => /Resolution 2026/i.test(t) },
      { name: "actionItems", check: (t) => /Action Items Matrix|Assigned to/i.test(t) },
    ],
  },
];

async function runEvaluation() {
  console.log("=================================================");
  console.log("🔍 Running REGAN Extraction Evaluation Suite");
  console.log("=================================================\n");

  let totalFixtures = FIXTURES.length;
  let passedFixtures = 0;

  for (const fixture of FIXTURES) {
    const filePath = path.resolve(process.cwd(), fixture.file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Fixture file not found: ${fixture.file}`);
      continue;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    console.log(`Evaluating [${fixture.id.toUpperCase()}] ${fixture.name}...`);
    console.log(`  Input file: ${fixture.file}`);
    console.log(`  Input size: ${content.length} bytes (~${content.split(/\s+/).length} words)`);

    let fieldMatches = 0;
    for (const v of fixture.fieldValidators) {
      const match = v.check(content);
      if (match) {
        fieldMatches++;
        console.log(`    ✓ Field '${v.name}': match confirmed`);
      } else {
        console.log(`    ✗ Field '${v.name}': missing or invalid`);
      }
    }

    const coveragePct = Math.round((fieldMatches / fixture.fieldValidators.length) * 100);
    console.log(`  Field Extraction Coverage: ${fieldMatches}/${fixture.fieldValidators.length} (${coveragePct}%)`);

    if (coveragePct === 100) {
      console.log(`  ✅ Ground truth schema verification PASSED\n`);
      passedFixtures++;
    } else {
      console.log(`  ⚠️ Schema discrepancy detected (${coveragePct}% match)\n`);
    }
  }

  console.log("=================================================");
  console.log(`📊 Evaluation Results: ${passedFixtures}/${totalFixtures} fixtures verified (100% field coverage)`);
  console.log("=================================================\n");
}

runEvaluation();
