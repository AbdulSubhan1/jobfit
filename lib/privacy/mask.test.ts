import { describe, expect, test } from "vitest";
import { findPersonalData, maskForAi, maskPersonalData, unmask } from "./mask";

const CV = `Abdul Subhan
abdul.s@gmail.com | +92 300 1234567 | linkedin.com/in/abdul
House 12, Street 4, Block B, Gulshan, Karachi

Frontend Engineer at Alfred, 2019-2023
• Built React dashboards used by 40,000 users with 5+ years of experience on v16.4.6
• Abdul led the migration to TypeScript`;

describe("maskPersonalData", () => {
  test("replaces name, email, phone and link with tags", () => {
    const { masked, map } = maskPersonalData(CV);
    for (const raw of ["Abdul Subhan", "abdul.s@gmail.com", "+92 300 1234567", "linkedin.com/in/abdul"]) {
      expect(masked).not.toContain(raw);
    }
    expect(masked).toContain("[NAME-1]");
    expect(masked).toContain("[EMAIL-1]");
    expect(masked).toContain("[PHONE-1]");
    expect(masked).toContain("[LINK-1]");
    expect(map["[EMAIL-1]"]).toBe("abdul.s@gmail.com");
  });

  test("hides the name's parts where they appear alone", () => {
    expect(maskPersonalData(CV).masked).not.toMatch(/\bAbdul\b/);
  });

  test.each(["+971 50 123 4567", "0300-1234567", "(021) 3456 7890", "+971501234567"])("masks phone %s", (phone) => {
    expect(maskPersonalData(`Call ${phone} today`).masked).toBe("Call [PHONE-1] today");
  });

  test.each(["2019-2023", "5+ years", "40,000 users", "v16.4.6", "Jan 2020 - Mar 2023"])("keeps %s", (text) => {
    expect(maskPersonalData(`Note: ${text}`).masked).toBe(`Note: ${text}`);
  });

  test.each(["42101-1234567-1", "784-1990-1234567-1"])("masks ID number %s", (id) => {
    expect(maskPersonalData(`ID ${id}`).masked).toBe("ID [ID-1]");
  });

  test("keeps tech names that look like domains", () => {
    const skills = "Skills: React, Next.js, Node.js, socket.io, ASP.NET, Vue.js";
    expect(maskPersonalData(skills).masked).toBe(skills);
  });

  test("masks a postal address line", () => {
    expect(maskPersonalData(CV).masked).toContain("[ADDRESS-1]");
    expect(maskPersonalData(CV).masked).not.toContain("Gulshan");
  });

  test("masks extra terms the user picks, every time they appear", () => {
    const { masked } = maskPersonalData("Alfred and Alfred again", { extraTerms: ["Alfred"] });
    expect(masked).toBe("[HIDDEN-1] and [HIDDEN-1] again");
  });

  test("the same value always gets the same tag", () => {
    const { masked } = maskPersonalData("a@b.co then a@b.co and c@d.co");
    expect(masked).toBe("[EMAIL-1] then [EMAIL-1] and [EMAIL-2]");
  });
});

describe("unmask", () => {
  test("restores tags even when the AI changes case or spacing", () => {
    const { map } = maskPersonalData(CV);
    expect(unmask("Hi [ name-1 ], mail [EMAIL-1]", map)).toBe("Hi Abdul Subhan, mail abdul.s@gmail.com");
  });

  test("leaves unknown tags as they are", () => {
    expect(unmask("Call [PHONE-9]", {})).toBe("Call [PHONE-9]");
  });

  test("round-trips the CV", () => {
    const { masked, map } = maskPersonalData(CV);
    expect(unmask(masked, map)).toBe(CV);
  });
});

describe("findPersonalData", () => {
  test("finds nothing in masked text", () => {
    expect(findPersonalData(maskPersonalData(CV).masked)).toEqual([]);
  });

  test("finds raw contact details", () => {
    expect(findPersonalData("call +971501234567")).toEqual(["PHONE"]);
    expect(findPersonalData("mail me: x@y.com")).toEqual(["EMAIL"]);
    expect(findPersonalData("see https://abdul.dev")).toEqual(["LINK"]);
  });
});

describe("maskForAi", () => {
  const JOB = "Senior Frontend Engineer\nApply: jobs@acme.io or call +971 4 123 4567. We'd love Abdul's skills.";

  test("masks the CV fully and the job's contact details, with shared tag numbers", () => {
    const r = maskForAi(CV, JOB);
    expect(r.cv).toContain("[EMAIL-1]");
    expect(r.job).toContain("[EMAIL-2]");
    expect(r.job).toContain("Senior Frontend Engineer");
    expect(r.job).not.toContain("+971 4 123 4567");
    expect(r.job).not.toMatch(/\bAbdul\b/);
    expect(findPersonalData(`${r.job}\n${r.cv}`)).toEqual([]);
  });

  test("extra terms apply to both texts", () => {
    const r = maskForAi(CV, "We use Alfred too", ["Alfred"]);
    expect(r.cv).not.toContain("Alfred");
    expect(r.job).toBe("We use [HIDDEN-1] too");
  });

  test("unmask restores both", () => {
    const r = maskForAi(CV, JOB);
    expect(unmask(r.cv, r.map)).toBe(CV);
    expect(unmask(r.job, r.map)).toBe(JOB);
  });
});

describe("realistic CV headers (review findings)", () => {
  test.each([
    [
      "phone above a line starting with a year",
      "Abdul Subhan\n+92 300 1234567\n2019 - 2023 Frontend Engineer",
      "+92 300 1234567",
    ],
    ["phone above a blank line and a year range", "+971 50 123 4567\n\n2019-2023", "+971 50 123 4567"],
    ["two phones separated by a space", "0300 1234567 0321 7654321", "0321 7654321"],
    ["US dashes", "Call 555-123-4567", "555-123-4567"],
    ["US dots", "Call 555.123.4567", "555.123.4567"],
    ["labelled phone without + or 0", "Phone: 971 50 123 4567", "971 50 123 4567"],
    ["Mob label", "Mob 92 300 1234567", "92 300 1234567"],
    ["https link on another domain", "Portfolio https://myportfolio.eu", "myportfolio.eu"],
    ["https link with path", "See https://abdul.de/about.", "abdul.de/about"],
    ["bare .ca domain", "abdul.ca", "abdul.ca"],
    ["upper-case www", "WWW.ABDUL.DEV", "ABDUL.DEV"],
    ["mixed-case profile link", "GitHub.com/Abdul", "GitHub.com/Abdul"],
  ])("masks %s", (_, text, raw) => {
    const { masked } = maskPersonalData(text);
    expect(masked).not.toContain(raw);
    expect(findPersonalData(masked)).toEqual([]);
  });

  test("the server check catches what the browser would mask", () => {
    expect(findPersonalData("Call 555-123-4567")).toEqual(["PHONE"]);
    expect(findPersonalData("Phone: 971 50 123 4567")).toEqual(["PHONE"]);
    expect(findPersonalData("https://myportfolio.eu")).toEqual(["LINK"]);
    expect(findPersonalData("+92 300 1234567\n2019 - 2023")).toEqual(["PHONE"]);
  });

  test.each(["(01.2019 - 03.2023)", "(2019-2020) 2021", "Jan 2019 – Mar 2023"])("keeps date range %s", (dates) => {
    expect(maskPersonalData(`Engineer ${dates}`).masked).toBe(`Engineer ${dates}`);
  });

  test.each([
    ["Curriculum Vitae\nAbdul Subhan\nabdul@x.com", "Abdul Subhan"],
    ["Senior Software Engineer\nAbdul Subhan", "Abdul Subhan"],
    ["Abdul Subhan | Senior Frontend Engineer", "Abdul Subhan"],
    ["Abdul Subhan — Frontend Engineer", "Abdul Subhan"],
    ["Name: Abdul Subhan", "Abdul Subhan"],
    ["Dubai, UAE\nAbdul Subhan", "Abdul Subhan"],
    ["عبد السبحان\nمهندس واجهات", "عبد السبحان"],
  ])("finds the name in %j", (cv, name) => {
    expect(maskPersonalData(cv).masked).not.toContain(name);
  });

  test("does not hide heading or job-title words as a name", () => {
    const r = maskForAi("Senior Software Engineer\nAbdul Subhan", "We need a Software Engineer");
    expect(r.job).toBe("We need a Software Engineer");
    expect(r.cv).toBe("Senior Software Engineer\n[NAME-1]");
  });

  test("hides name parts written in capitals elsewhere", () => {
    expect(maskPersonalData("Abdul Subhan\nABDUL led the team").masked).not.toContain("ABDUL");
  });

  test("hiding the word 'job' does not break the job text", () => {
    const r = maskForAi(CV, "Job: Frontend at Acme", ["job"]);
    expect(typeof r.job).toBe("string");
    expect(r.job).toBe("[HIDDEN-1]: Frontend at Acme");
    expect(r.cv).not.toContain("⁣");
  });

  test.each([
    ["digits", "0".repeat(27_000)],
    ["letters", "a".repeat(27_000)],
    ["letter-dash", "a-".repeat(13_500)],
    ["dots", "a.".repeat(13_500)],
  ])("stays fast on 27k chars of %s", (_, text) => {
    const start = performance.now();
    findPersonalData(text);
    maskPersonalData(text);
    expect(performance.now() - start).toBeLessThan(300);
  });
});
