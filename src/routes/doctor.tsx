import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, ClipboardList, Send, Users } from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { RiskBadge } from "@/components/RiskMeter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/doctor")({
  head: () => ({
    meta: [
      { title: "Doctor Dashboard — AROGYALINK" },
      {
        name: "description",
        content: "Today's consultations, incoming referrals and high-risk patients for rural doctors.",
      },
      { property: "og:title", content: "Doctor Dashboard — AROGYALINK" },
      {
        property: "og:description",
        content: "Today's consultations, incoming referrals and high-risk patients.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DoctorRoute,
});

function DoctorRoute() {
  return (
    <RequireRole roles={["doctor"]} title="Doctor Dashboard">
      <DoctorBody />
    </RequireRole>
  );
}

function DoctorBody() {
  const { consultations, referrals, patients, advanceReferral } = useStore();
  const scheduled = consultations.filter((c) => c.status === "Scheduled");
  const completed = consultations.filter((c) => c.status === "Completed");
  const incoming = referrals.filter((r) => r.status === "Created" || r.status === "Accepted");
  const critical = patients.filter((p) => p.risk === "EMERGENCY" || p.risk === "HIGH");

  const stats = [
    { label: "Scheduled today", value: scheduled.length, icon: CalendarCheck },
    { label: "Completed", value: completed.length, icon: ClipboardList },
    { label: "Incoming referrals", value: incoming.length, icon: Send },
    { label: "Critical patients", value: critical.length, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <s.icon className="size-5" />
              </span>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Consultation queue</CardTitle>
            <CardDescription>Start a video consult and write the prescription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {scheduled.length === 0 && <p className="text-muted-foreground">No patients waiting.</p>}
            {scheduled.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
                <div>
                  <p className="font-semibold">{c.patientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.date} at {c.slot} · {c.mode}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link to="/telemedicine">Open consult</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incoming referrals</CardTitle>
            <CardDescription>Accept and move patients through the pathway</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {incoming.length === 0 && <p className="text-muted-foreground">No pending referrals.</p>}
            {incoming.map((r) => (
              <div key={r.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{r.patientName}</p>
                  <Badge variant={r.priority === "Emergency" ? "destructive" : "secondary"}>{r.priority}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {r.id} · {r.fromFacility} → {r.toFacility}
                </p>
                <p className="text-sm text-muted-foreground">{r.reason}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline">{r.status}</Badge>
                  <Button size="sm" variant="outline" onClick={() => advanceReferral(r.id)}>
                    Move to next stage
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Critical patients</CardTitle>
          <CardDescription>Flagged by AI triage or health worker visits</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {critical.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  {p.healthId} · {p.village}
                </p>
              </div>
              <RiskBadge risk={p.risk} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
