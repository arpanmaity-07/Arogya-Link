import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, FileText, Hospital, Stethoscope } from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { RiskBadge } from "@/components/RiskMeter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Health Dashboard — AROGYALINK" },
      {
        name: "description",
        content: "Your health ID, upcoming consultations, risk level and recent medical records.",
      },
      { property: "og:title", content: "My Health Dashboard — AROGYALINK" },
      {
        property: "og:description",
        content: "Your health ID, upcoming consultations, risk level and recent medical records.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PatientDashboard,
});

function PatientDashboard() {
  return (
    <RequireRole roles={["patient"]} title="My Health Dashboard">
      <DashboardBody />
    </RequireRole>
  );
}

function DashboardBody() {
  const { user, patientById, consultations, records, referrals } = useStore();
  const patient = user?.patientId ? patientById(user.patientId) : undefined;
  const myConsults = consultations.filter((c) => c.patientId === patient?.id);
  const upcoming = myConsults.filter((c) => c.status === "Scheduled");
  const myRecords = records.filter((r) => r.patientId === patient?.id).slice(0, 6);
  const myReferrals = referrals.filter((r) => r.patientId === patient?.id);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-hero-gradient p-6 text-primary-foreground">
          <p className="text-sm opacity-90">Digital Health ID</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{patient?.healthId ?? "—"}</p>
          <p className="mt-2 text-sm opacity-90">
            {patient?.name} · {patient?.age} yrs · {patient?.gender} · Blood group {patient?.bloodGroup}
          </p>
          <p className="text-sm opacity-90">
            {patient?.village}, {patient?.district}, {patient?.state}
          </p>
        </div>
        <CardContent className="flex flex-wrap items-center gap-3 p-5">
          <span className="text-sm text-muted-foreground">Current risk level</span>
          {patient && <RiskBadge risk={patient.risk} />}
          <span className="text-sm text-muted-foreground">ASHA worker: {patient?.assignedWorker}</span>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/assessment", label: "Health Check", desc: "Check symptoms", icon: Stethoscope },
          { to: "/facilities", label: "Find Facility", desc: "Nearest care", icon: Hospital },
          { to: "/telemedicine", label: "Book Doctor", desc: "Video consult", icon: CalendarDays },
          { to: "/records", label: "My Records", desc: "Full history", icon: FileText },
        ].map((a) => (
          <Link key={a.to} to={a.to}>
            <Card className="card-hover h-full">
              <CardContent className="flex items-center gap-3 p-5">
                <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <a.icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{a.label}</p>
                  <p className="text-sm text-muted-foreground">{a.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming consultations</CardTitle>
            <CardDescription>Appointments booked with doctors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 && (
              <p className="text-muted-foreground">
                No upcoming appointments.{" "}
                <Link to="/telemedicine" className="text-primary underline">
                  Book one now
                </Link>
                .
              </p>
            )}
            {upcoming.map((c) => (
              <div key={c.id} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{c.doctorName}</p>
                  <Badge variant="secondary">{c.mode}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {c.date} at {c.slot}
                </p>
              </div>
            ))}
            {myReferrals.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-secondary/40 p-4">
                <p className="font-semibold">{r.id}</p>
                <p className="text-sm text-muted-foreground">
                  {r.toFacility} · {r.status}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent records</CardTitle>
            <CardDescription>Your latest health activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {myRecords.length === 0 && <p className="text-muted-foreground">No records yet.</p>}
            {myRecords.map((r) => (
              <div key={r.id} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{r.title}</p>
                  <Badge variant="outline">{r.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{r.detail}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.date}</p>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link to="/records">View all records</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
