// Haq Dilao — Deterministic Intent Parser (Command Bar)
// Pure functions, no LLM, works offline

import type { ParsedIntent, Intent, User, Scheme } from "./types";
import { evaluate, applyScore } from "./eligibility";

const INTENT_KEYWORDS: Record<Intent, string[]> = {
  list_all: ["show all", "my schemes", "all schemes", "everything", "list all", "show me"],
  closing_soon: ["closing", "deadline", "deadlines", "this week", "soon", "ending", "expire", "last date"],
  new_schemes: ["new", "what's new", "newly added", "recent", "latest", "fresh"],
  best_matches: ["best", "apply today", "what can i apply", "best for me", "top", "recommended"],
  missing_documents: ["missing", "documents", "docs i need", "what documents", "missing docs", "need to submit"],
  explain_scheme: ["explain", "tell me about", "details", "what is", "how does", "describe"],
  my_applications: ["my applications", "my apps", "applications", "status", "tracker", "applied"],
  search_text: [], // fallback - handled by text search
  unknown: [],
};

function normalizeQuery(query: string): string {
  return query.toLowerCase().trim();
}

function matchKeywords(query: string): Intent {
  const normalized = normalizeQuery(query);

  // Check for explain_scheme first (might contain scheme name)
  if (INTENT_KEYWORDS.explain_scheme.some(kw => normalized.includes(kw))) {
    return "explain_scheme";
  }

  // Check other intents
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (intent === "explain_scheme" || intent === "search_text" || intent === "unknown") continue;
    if (keywords.some(kw => normalized.includes(kw))) {
      return intent as Intent;
    }
  }

  return "search_text";
}

function extractSchemeName(query: string, eligibleSchemes: Scheme[]): string | undefined {
  const normalized = normalizeQuery(query);

  // Check if query contains a scheme name
  for (const scheme of eligibleSchemes) {
    const schemeWords = scheme.name.toLowerCase().split(" ");
    if (schemeWords.some(word => word.length > 3 && normalized.includes(word))) {
      return scheme.name;
    }
  }
  return undefined;
}

export function parseIntent(query: string, eligibleSchemes: Scheme[] = []): ParsedIntent {
  if (!query || query.trim().length === 0) {
    return { intent: "unknown" };
  }

  if (query.length > 500) {
    return { intent: "unknown" };
  }

  const intent = matchKeywords(query);

  // For explain_scheme, try to extract which scheme
  if (intent === "explain_scheme") {
    const schemeName = extractSchemeName(query, eligibleSchemes);
    return { intent, term: schemeName };
  }

  // For search_text, the term is the query itself
  if (intent === "search_text") {
    return { intent, term: query };
  }

  return { intent };
}

// --- Intent Execution ---

export interface IntentResult {
  intent: Intent;
  schemes: Scheme[];
  summary: string;
  term?: string;
}

function filterEligibleSchemes(schemes: Scheme[], user: User): Scheme[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0); // noon UTC for date-only comparison

  return schemes
    .filter(s => s.role === user.role)
    .filter(s => {
      const evalResult = evaluate(user, s);
      if (evalResult.status !== "eligible") return false;

      // Hide closed schemes from main results
      if (s.last_date) {
        const lastDate = new Date(s.last_date + "T12:00:00Z");
        if (lastDate < today) return false;
      }
      return true;
    });
}

function sortByClosingSoon(schemes: Scheme[]): Scheme[] {
  return [...schemes].sort((a, b) => {
    const aDays = a.last_date ? Math.ceil((new Date(a.last_date + "T12:00:00Z").getTime() - Date.now()) / 86400000) : 999;
    const bDays = b.last_date ? Math.ceil((new Date(b.last_date + "T12:00:00Z").getTime() - Date.now()) / 86400000) : 999;
    return aDays - bDays;
  });
}

function sortByNew(schemes: Scheme[]): Scheme[] {
  return [...schemes].sort((a, b) => {
    const aPosted = a.posted_date ? new Date(a.posted_date + "T12:00:00Z").getTime() : 0;
    const bPosted = b.posted_date ? new Date(b.posted_date + "T12:00:00Z").getTime() : 0;
    return bPosted - aPosted;
  });
}

function sortByApplyScore(user: User, schemes: Scheme[]): Scheme[] {
  return [...schemes].sort((a, b) => {
    const scoreA = applyScore(user, a).score;
    const scoreB = applyScore(user, b).score;
    return scoreB - scoreA;
  });
}

function getAlreadyAppliedSchemes(user: User): Set<string> {
  // This would need applications data - for now return empty
  // In real implementation, read from applications.json
  return new Set<string>();
}

export function executeIntent(
  parsed: ParsedIntent,
  user: User,
  allSchemes: Scheme[]
): IntentResult {
  const eligible = filterEligibleSchemes(allSchemes, user);
  const appliedSet = getAlreadyAppliedSchemes(user);
  const notApplied = eligible.filter(s => !appliedSet.has(s.id));

  let schemes: Scheme[] = [];
  let summary = "";

  switch (parsed.intent) {
    case "list_all": {
      schemes = notApplied;
      summary = `${schemes.length} scheme${schemes.length !== 1 ? "s" : ""} match you`;
      break;
    }

    case "closing_soon": {
      const closing = notApplied.filter(s => {
        if (!s.last_date) return false;
        const days = Math.ceil((new Date(s.last_date + "T12:00:00Z").getTime() - Date.now()) / 86400000);
        return days >= 0 && days <= 7;
      });
      schemes = sortByClosingSoon(closing);
      summary = `${schemes.length} scheme${schemes.length !== 1 ? "s" : ""} close${schemes.length === 1 ? "s" : ""} this week`;
      break;
    }

    case "new_schemes": {
      const weekAgo = Date.now() - 7 * 86400000;
      const newSchemes = notApplied.filter(s => {
        if (!s.posted_date) return false;
        const posted = new Date(s.posted_date + "T12:00:00Z").getTime();
        return posted >= weekAgo;
      });
      schemes = sortByNew(newSchemes);
      summary = `${schemes.length} new scheme${schemes.length !== 1 ? "s" : ""} posted this week`;
      break;
    }

    case "best_matches": {
      const scored = sortByApplyScore(user, notApplied);
      schemes = scored.slice(0, 3);
      summary = schemes.length > 0
        ? `Top ${schemes.length} match${schemes.length !== 1 ? "es" : ""} for you`
        : "No schemes to apply for today";
      break;
    }

    case "missing_documents": {
      const withMissing = notApplied.filter(s => {
        const score = applyScore(user, s);
        return score.docs_owned < score.docs_required;
      });
      schemes = withMissing;
      const totalMissing = schemes.reduce((sum, s) => sum + (applyScore(user, s).docs_required - applyScore(user, s).docs_owned), 0);
      summary = `You have ${totalMissing} document${totalMissing !== 1 ? "s" : ""} to collect across ${schemes.length} scheme${schemes.length !== 1 ? "s" : ""}`;
      break;
    }

    case "explain_scheme": {
      if (parsed.term) {
        const found = notApplied.find(s => s.name.toLowerCase().includes(parsed.term!.toLowerCase()));
        if (found) schemes = [found];
      }
      summary = schemes.length > 0 ? `Showing ${schemes[0].name}` : "Scheme not found in your eligible list";
      break;
    }

    case "my_applications": {
      schemes = [];
      summary = "Opening your applications…";
      break;
    }

    case "search_text": {
      if (parsed.term) {
        const term = parsed.term.toLowerCase();
        schemes = notApplied.filter(s =>
          s.name.toLowerCase().includes(term) ||
          s.benefit.toLowerCase().includes(term)
        );
      }
      summary = schemes.length > 0
        ? `Found ${schemes.length} scheme${schemes.length !== 1 ? "s" : ""} matching "${parsed.term}"`
        : `No schemes matching "${parsed.term}"`;
      break;
    }

    case "unknown":
    default: {
      schemes = [];
      summary = "I didn't understand that. Try a quick prompt below or type a question.";
    }
  }

  return { intent: parsed.intent, schemes, summary, term: parsed.term };
}

// Quick-prompt pills
export const QUICK_PROMPTS = [
  "What can I apply for today?",
  "Closing this week",
  "Documents I'm missing",
  "Show all my schemes",
];