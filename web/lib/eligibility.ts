// Haq Dilao — Eligibility Engine (pure functions, no I/O, no LLM)
// Implements exact logic from docs/data-model.md

import type { User, Scheme, SchemeRule, EligibilityResult, RuleResult, ApplyScoreResult, WhyYouQualifyResult } from "./types";

function getUserField(user: User, field: string): unknown {
  // Direct field access
  if (field in user) {
    return (user as Record<string, unknown>)[field];
  }
  return undefined;
}

function evaluateRule(user: User, rule: SchemeRule): RuleResult {
  const userValue = getUserField(user, rule.field);

  // Missing field counts as failed with reason "unknown"
  if (userValue === undefined || userValue === null || userValue === "") {
    return {
      field: rule.field,
      label: rule.label,
      passed: false,
      reason: "unknown",
    };
  }

  const ruleValue = rule.value;
  const op = rule.op;
  let passed = false;
  let reason = "";

  try {
    switch (op) {
      case "eq":
        passed = userValue === ruleValue;
        reason = passed ? "matches" : `expected ${ruleValue}, got ${userValue}`;
        break;

      case "neq":
        passed = userValue !== ruleValue;
        reason = passed ? "differs" : `unexpected match: ${userValue}`;
        break;

      case "lt":
        passed = Number(userValue) < Number(ruleValue);
        reason = passed ? `${userValue} < ${ruleValue}` : `${userValue} not < ${ruleValue}`;
        break;

      case "lte":
        passed = Number(userValue) <= Number(ruleValue);
        reason = passed ? `${userValue} ≤ ${ruleValue}` : `${userValue} > ${ruleValue}`;
        break;

      case "gt":
        passed = Number(userValue) > Number(ruleValue);
        reason = passed ? `${userValue} > ${ruleValue}` : `${userValue} not > ${ruleValue}`;
        break;

      case "gte":
        passed = Number(userValue) >= Number(ruleValue);
        reason = passed ? `${userValue} ≥ ${ruleValue}` : `${userValue} < ${ruleValue}`;
        break;

      case "in":
        passed = Array.isArray(ruleValue) && ruleValue.includes(userValue);
        reason = passed ? `one of [${ruleValue.join(", ")}]` : `${userValue} not in [${ruleValue.join(", ")}]`;
        break;

      case "not_in":
        passed = Array.isArray(ruleValue) && !ruleValue.includes(userValue);
        reason = passed ? `not in [${ruleValue.join(", ")}]` : `${userValue} is in excluded list`;
        break;

      case "between": {
        const [min, max] = Array.isArray(ruleValue) ? ruleValue : [0, 0];
        const numVal = Number(userValue);
        passed = numVal >= Number(min) && numVal <= Number(max);
        reason = passed ? `${numVal} between ${min} and ${max}` : `${numVal} outside ${min}-${max}`;
        break;
      }

      default:
        passed = false;
        reason = `unknown operator: ${op}`;
    }
  } catch {
    passed = false;
    reason = "evaluation error";
  }

  return {
    field: rule.field,
    label: rule.label,
    passed,
    reason: passed ? rule.label : reason,
  };
}

export function evaluate(user: User, scheme: Scheme): EligibilityResult {
  const results = scheme.rules.map(rule => evaluateRule(user, rule));

  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed && r.reason !== "unknown");
  const unknown = results.filter(r => r.reason === "unknown");

  let status: EligibilityResult["status"] = "not_eligible";

  if (failed.length === 0 && unknown.length === 0) {
    status = "eligible";
  } else if (failed.length === 1 && unknown.length === 0) {
    // Check if the single failed rule is numeric
    const failedRule = scheme.rules.find(r => r.field === failed[0].field);
    const numericOps = ["lt", "lte", "gt", "gte", "between"];
    if (failedRule && numericOps.includes(failedRule.op)) {
      status = "near_miss";
    }
  }
  // Otherwise not_eligible

  return { status, passed, failed, unknown };
}

export function applyScore(user: User, scheme: Scheme): ApplyScoreResult {
  const evalResult = evaluate(user, scheme);
  const passedRules = evalResult.passed.length;
  const totalRules = scheme.rules.length;

  // Documents owned vs required
  const docsRequired = scheme.documents.length;
  const docsOwned = scheme.documents.filter(doc =>
    user.documents_have.some(have => have.toLowerCase() === doc.toLowerCase())
  ).length;

  const ruleScore = totalRules > 0 ? (passedRules / totalRules) : 1;
  const docScore = docsRequired > 0 ? (docsOwned / docsRequired) : 1;

  const score = Math.round(70 * ruleScore + 30 * docScore);

  // Build reason text
  let reasonParts: string[] = [];
  if (passedRules < totalRules) {
    const failedLabels = evalResult.failed.map(f => f.label);
    const unknownLabels = evalResult.unknown.map(u => u.label);
    const allMissing = [...failedLabels, ...unknownLabels];
    if (allMissing.length > 0) {
      reasonParts.push(`missing ${allMissing.join(", ")}`);
    }
  }
  if (docsOwned < docsRequired) {
    const missingDocs = scheme.documents.filter(doc =>
      !user.documents_have.some(have => have.toLowerCase() === doc.toLowerCase())
    );
    if (missingDocs.length > 0) {
      reasonParts.push(`missing ${missingDocs.join(", ")}`);
    }
  }
  const reason = reasonParts.length > 0
    ? `${score}% ready: ${reasonParts.join("; ")}`
    : `${score}% ready`;

  return {
    score,
    reason,
    passed_rules: passedRules,
    total_rules: totalRules,
    docs_owned: docsOwned,
    docs_required: docsRequired,
  };
}

export function whyYouQualify(user: User, scheme: Scheme): WhyYouQualifyResult {
  const evalResult = evaluate(user, scheme);
  return {
    labels: evalResult.passed.map(p => p.label),
  };
}