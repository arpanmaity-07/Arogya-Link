import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { RiskMeter } from "@/components/RiskMeter";
import { VoiceInputButton } from "@/components/VoiceInputButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useStore } from "@/lib/store";
import { CONDITIONS, SYMPTOMS, runTriage } from "@/lib/triage";
import type { RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "AI Health Assessment — AROGYALINK" },
      {
        name: "description",
        content: "Describe symptoms by tap or voice and get an explainable risk score with next steps.",
      },
      { property: "og:title", content: "AI Health Assessment — AROGYALINK" },
      {
        property: "og:description",
        content: "Explainable symptom triage with clear next steps for rural patients.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssessmentPage,
});

const DURATIONS = [
  { value: "<1", label: "Less than a day" },
  { value: "1-3", label: "1 to 3 days" },
  { value: "4-7", label: "4 to 7 days" },
  { value: ">7", label: "More than a week" },
];

function AssessmentPage() {
  const { user, patients, addAssessment, patientById } = useStore();
  const [patientId, setPatientId] = useState(user?.patientId ?? patients[0]?.id ?? "");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState("1-3");
  const [severity, setSeverity] = useState(5);
  const [conditions, setConditions] = useState<string[]>([]);
  const [result, setResult] = useState<null | {
    risk: RiskLevel;
    score: number;
    urgency: string;
    action: string;
    facilityType: string;
    reasons: string[];
  }>(null);

  const patient = patientById(patientId);
  const toggle = (list: string[], set: (v: string[]) => void, item: string) =>
    set(list.includes(item) ? list.filter((s) => s !== item) : [...list, item]);

  const submit = () => {
    if (symptoms.length === 0) {
      toast.error("Please choose at least one symptom.");
      return;
    }
    const r = runTriage({ symptoms, duration, severity, age: patient?.age ?? 35, conditions });
    setResult(r);
    if (patient) {
      addAssessment({
        patientId: patient.id,
        symptoms,
        duration,
        severity,
        conditions,
        risk: r.risk,
        score: r.score,
        action: r.action,
        facilityType: r.facilityType,
        reasons: r.reasons,
      });
    }
    toast.success("Assessment complete");
  };

  const reset = () => {
    setSymptoms([]);
    setConditions([]);
    setSeverity(5);
    setDuration("1-3");
    setResult(null);
  };

  const voiceMatch = (text: string) => {
    const found = SYMPTOMS.filter((s) => text.toLowerCase().includes(s.toLowerCase().split(" ")[0] ?? ""));
    if (found.length) {
      setSymptoms((prev) => Array.from(new Set([...prev, ...found])));
      toast.success(`Heard: ${found.join(", ")}`);
    } else {
      toast.info("Could not match a symptom — please tap the buttons below.");
    }
  };

  return (
    <AppShell title="AI Health Assessment">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tell us what is wrong</CardTitle>
            <CardDescription>
              Tap the symptoms or use the microphone. This takes about a minute.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-7">
            <div className="space-y-2">
              <Label>Who is this check for?</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} · {p.age}y · {p.village}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Symptoms</Label>
                <VoiceInputButton onResult={voiceMatch} label="Speak symptoms" />
              </div>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggle(symptoms, setSymptoms, s)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-base font-medium transition-colors",
                      symptoms.includes(s)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-secondary",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>How long has this been going on?</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>How bad does it feel? ({severity}/10)</Label>
              <Slider
                value={[severity]}
                min={1}
                max={10}
                step={1}
                onValueChange={(v) => setSeverity(v[0] ?? 5)}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Mild</span>
                <span>Unbearable</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Existing conditions</Label>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggle(conditions, setConditions, c)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-base font-medium transition-colors",
                      conditions.includes(c)
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-card hover:bg-secondary",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="lg" onClick={submit} className="flex-1">
                Get my risk result
              </Button>
              <Button size="lg" variant="outline" onClick={reset}>
                <RotateCcw className="size-4" /> Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
              <CardDescription>
                {result ? result.urgency : "Your risk score will appear here."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {result ? (
                <>
                  <RiskMeter score={result.score} risk={result.risk} />
                  <div className="rounded-xl bg-secondary p-4">
                    <p className="font-semibold">Recommended action</p>
                    <p className="mt-1 text-secondary-foreground">{result.action}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Suggested facility level: {result.facilityType}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Why this score</p>
                    <ul className="mt-2 space-y-1.5">
                      {result.reasons.map((r) => (
                        <li key={r} className="flex gap-2 text-muted-foreground">
                          <span className="text-primary">•</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link to="/facilities">
                        Find a facility <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/telemedicine">Book a doctor</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Choose the symptoms on the left and press the button to see an explainable risk
                  score.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-warning/50 bg-warning/10">
            <CardContent className="flex gap-3 p-5">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
              <p className="text-sm">
                This assessment is preliminary decision support and is not a medical diagnosis.
                Always consult a qualified healthcare professional.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
