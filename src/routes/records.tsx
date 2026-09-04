import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, FileText, Pill, Stethoscope, TrendingUp, Truck } from "lucide-react";
import { useState } from "react";
import { RequireRole } from "@/components/RequireRole";
import { RiskBadge } from "@/components/RiskMeter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import type { HealthRecord } from "@/lib/types";

export const Route = createFileRoute("/records")({
  head: () => ({
    meta: [
      { title: "Health Records — AROGYALINK" },
      {
        name: "description",
        content: "A single timeline of assessments, consultations, prescriptions and referrals.",
      },
      { property: "og:title", content: "Health Records — AROGYALINK" },
      {
        property: "og:description",
        content: "One digital health timeline per patient, available to the whole care team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RecordsPage,
});

const ICONS: Record<HealthRecord["type"], typeof FileText> = {
  Consultation: Stethoscope,
  Assessment: TrendingUp,
  Prescription: Pill,
  Report: FileText,
  Referral: Truck,
  "Follow-up": ClipboardList,
};

function RecordsPage() {
  return (
    <RequireRole roles={["patient", "asha", "doctor", "admin"]} title="Health Records">
      <RecordsBody />
    </RequireRole>
  );
}

function RecordsBody() {
  const { user, patients, records, patientById } = useStore();
  const locked = user?.role === "patient";
  const [patientId, setPatientId] = useState(user?.patientId ?? patients[0]?.id ?? "");
  const patient = patientById(patientId);
  const list = records
    .filter((r) => r.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      {!locked && (
        <Select value={patientId} onValueChange={setPatientId}>
          <SelectTrigger className="max-w-sm">
            <SelectValue placeholder="Choose patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} · {p.healthId}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {patient && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-3 p-6">
            <div>
              <p className="text-2xl font-bold">{patient.name}</p>
              <p className="text-muted-foreground">
                {patient.age}y · {patient.gender} · {patient.bloodGroup} · {patient.village},{" "}
                {patient.district}
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="font-mono">
                {patient.healthId}
              </Badge>
              <RiskBadge risk={patient.risk} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative space-y-4 border-l-2 border-border pl-6">
        {list.map((r) => {
          const Icon = ICONS[r.type];
          return (
            <div key={r.id} className="relative">
              <span className="absolute -left-[35px] flex size-8 items-center justify-center rounded-full border-2 border-border bg-card">
                <Icon className="size-4 text-primary" />
              </span>
              <Card>
                <CardContent className="space-y-1 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{r.type}</Badge>
                    <span className="text-sm text-muted-foreground">{r.date}</span>
                  </div>
                  <p className="text-lg font-semibold">{r.title}</p>
                  <p className="text-muted-foreground">{r.detail}</p>
                </CardContent>
              </Card>
            </div>
          );
        })}
        {list.length === 0 && (
          <p className="text-muted-foreground">No records yet for this patient.</p>
        )}
      </div>
    </div>
  );
}
