import { describe, expect, test } from "vitest";
import { extractSkills } from "./extract";
import { matchCv } from "./score";

describe("matchCv", () => {
  test("weights must-have lines 1.5x and reports have and missing", () => {
    const job = "Must have React, Next.js and TypeScript.\nNice to have: GraphQL, AWS";
    const result = matchCv(job, "Built apps in React, NextJS, TS");
    expect(result.have).toEqual(["React", "Next.js", "TypeScript"]);
    expect(result.missing).toEqual(["GraphQL", "AWS"]);
    expect(result.score).toBe(69);
    expect(result.jobSkillCount).toBe(5);
  });

  test("returns a null score when the job names fewer than 3 skills", () => {
    expect(matchCv("We want a nice person", "React developer").score).toBeNull();
  });

  test("a CV with every skill scores 100", () => {
    expect(matchCv("Skills: Python, Django, PostgreSQL", "Python, Django and Postgres").score).toBe(100);
  });
});

describe("extractSkills", () => {
  const ids = (text: string) => [...extractSkills(text).keys()];

  test("resolves aliases", () => {
    expect(ids("k8s, JS and node")).toEqual(expect.arrayContaining(["kubernetes", "javascript", "nodejs"]));
  });

  test("Java does not match inside JavaScript", () => {
    expect(ids("JavaScript")).not.toContain("java");
  });

  test("Go matches the language but not the word go", () => {
    expect(ids("ready to go and grow")).not.toContain("go");
    expect(ids("Services in Go, Rust")).toContain("go");
    expect(ids("golang microservices")).toContain("go");
  });

  test("C++ and C# are found with their symbols", () => {
    expect(ids("C++ and C# experience")).toEqual(expect.arrayContaining(["cpp", "csharp"]));
  });

  test("required lines weigh 1.5, others 1", () => {
    const skills = extractSkills("Required: Docker\nBonus: Terraform");
    expect(skills.get("docker")).toBe(1.5);
    expect(skills.get("terraform")).toBe(1);
  });
});
