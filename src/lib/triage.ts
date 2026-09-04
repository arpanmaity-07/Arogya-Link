import type { RiskLevel } from "./types";

export const SYMPTOMS = [
  "Fever",
  "Cough",
  "Headache",
  "Chest pain",
  "Breathing difficulty",
  "Stomach pain",
  "Weakness",
  "Dizziness",
  "Vomiting",
  "Rash",
] as const;

export const CONDITIONS = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Heart disease",
  "Pregnancy",
  "Tuberculosis",
] as const;

export interface TriageInput {
  symptoms: string[];
  duration: string; // "<1", "1-3", "4-7", ">7" days
  severity: number; // 1-10
  age: number;
  conditions: string[];
}

export interface TriageResult {
  risk: RiskLevel;
  score: number;
  urgency: string;
  action: string;
  facilityType: string;
  reasons: string[];
}

export function runTriage(input: TriageInput): TriageResult {
  const reasons: string[] = [];
  let score = 0;

  const has = (s: string) => input.symptoms.includes(s);

  if (has("Chest pain")) {
    score += 45;
    reasons.push("Chest pain is a red-flag symptom (rule: chest pain -> emergency pathway)");
  }
  if (has("Breathing difficulty") && input.severity >= 6) {
    score += 45;
    reasons.push("Severe breathing difficulty (severity >= 6) -> emergency pathway");
  } else if (has("Breathing difficulty")) {
    score += 25;
    reasons.push("Breathing difficulty reported");
  }
  if (has("Fever") && (input.duration === "4-7" || input.duration === ">7")) {
    score += 25;
    reasons.push("Fever persisting for multiple days -> escalated risk");
  } else if (has("Fever")) {
    score += 8;
    reasons.push("Fever reported");
  }
  if (has("Dizziness") && has("Weakness")) {
    score += 12;
    reasons.push("Dizziness with weakness may indicate dehydration or anaemia");
  }
  if (has("Vomiting") && input.duration !== "<1") {
    score += 10;
    reasons.push("Prolonged vomiting increases dehydration risk");
  }

  score += Math.round(input.severity * 2.2);
  reasons.push(`Reported severity ${input.severity}/10 contributes ${Math.round(input.severity * 2.2)} points`);

  if (input.age >= 60) {
    score += 12;
    reasons.push("Age 60+ -> higher vulnerability weighting");
  } else if (input.age <= 5) {
    score += 12;
    reasons.push("Child under 5 -> higher vulnerability weighting");
  }

  if (input.conditions.length) {
    score += input.conditions.length * 8;
    reasons.push(`Existing conditions (${input.conditions.join(", ")}) add ${input.conditions.length * 8} points`);
  }

  if (input.symptoms.length >= 4) {
    score += 8;
    reasons.push("Four or more concurrent symptoms");
  }

  score = Math.min(100, score);

  let risk: RiskLevel = "LOW";
  if (score >= 70) risk = "EMERGENCY";
  else if (score >= 48) risk = "HIGH";
  else if (score >= 25) risk = "MODERATE";

  const map: Record<RiskLevel, { urgency: string; action: string; facilityType: string }> = {
    LOW: {
      urgency: "Non-urgent — can be managed locally",
      action: "Rest, hydration and monitoring. Visit your nearest PHC within 48 hours if symptoms persist.",
      facilityType: "PHC",
    },
    MODERATE: {
      urgency: "Needs review within 24 hours",
      action: "Book a teleconsultation today or visit your PHC/CHC for an in-person check-up.",
      facilityType: "PHC or CHC",
    },
    HIGH: {
      urgency: "Needs same-day clinical attention",
      action: "Travel to the CHC or District Hospital today. Ask your ASHA worker to raise a referral.",
      facilityType: "CHC / District Hospital",
    },
    EMERGENCY: {
      urgency: "Immediate attention required",
      action: "Go to the nearest emergency hospital now or call 108 for an ambulance.",
      facilityType: "Emergency Hospital",
    },
  };

  return { risk, score, ...map[risk], reasons };
}

export const RISK_META: Record<RiskLevel, { label: string; emoji: string; className: string; bar: string }> = {
  LOW: { label: "Low Risk", emoji: "🟢", className: "bg-success/12 text-success border-success/30", bar: "bg-success" },
  MODERATE: {
    label: "Moderate Risk",
    emoji: "🟡",
    className: "bg-warning/15 text-warning-foreground border-warning/40",
    bar: "bg-warning",
  },
  HIGH: {
    label: "High Risk",
    emoji: "🔴",
    className: "bg-destructive/12 text-destructive border-destructive/30",
    bar: "bg-destructive",
  },
  EMERGENCY: {
    label: "Emergency",
    emoji: "🚨",
    className: "bg-emergency/15 text-emergency border-emergency/40",
    bar: "bg-emergency",
  },
};
