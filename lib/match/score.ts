import { extractSkills } from "./extract";
import { SKILLS } from "./skills";

export type MatchResult = {
  /** 0–100, or null when the job names too few skills to score fairly. */
  score: number | null;
  have: string[];
  missing: string[];
  jobSkillCount: number;
};

const MIN_SKILLS_TO_SCORE = 3;
const LABELS = new Map(SKILLS.map((s) => [s.id, s.label]));

export function matchCv(job: string, cv: string): MatchResult {
  const wanted = extractSkills(job);
  const cvSkills = extractSkills(cv);
  const have: string[] = [];
  const missing: string[] = [];
  let total = 0;
  let got = 0;

  for (const [id, weight] of wanted) {
    total += weight;
    if (cvSkills.has(id)) {
      got += weight;
      have.push(LABELS.get(id)!);
    } else {
      missing.push(LABELS.get(id)!);
    }
  }

  return {
    score: wanted.size < MIN_SKILLS_TO_SCORE ? null : Math.round((100 * got) / total),
    have,
    missing,
    jobSkillCount: wanted.size,
  };
}
