import { createFileRoute, Link } from "@tanstack/react-router";
import { CloudOff, Send, Stethoscope, UserPlus, Users } from "lucide-react";
import { RequireRole } from "@/components/RequireRole";
import { RiskBadge } from "@/components/RiskMeter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/asha")({
  head: () => ({
    meta: [
      { title: "ASHA Worker Dashboard — AROGYALINK" },
      {
        name: "description",
        content: "Track assigned families, high-risk cases, offline records pending sync and referrals.",
      },
      { property: "og:title", content: "ASHA Worker Dashboard — AROGYALINK" },
      {
        property: "og:description",
        content: "Track assigned families, high-risk cases and offline records pending sync.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AshaRoute,
});

function AshaRoute() {
  return (
    <RequireRole roles={["asha"]} title="ASHA Worker Dashboard">
      <AshaBody />
    </RequireRole>
  );
}

function AshaBody() {
  const { patients, referrals, assessments, pendingCount, syncNow, syncing } = useStore();
  const highRisk = patients.filter((p) => p.risk === "HIGH" || p.risk === "EMERGENCY");
  const openReferrals = referrals.filter((r) => r.status !== "Completed");

  const stats = [
    { label: "Families assigned", value: patients.length, icon: Users },
    { label: "High-risk patients", value: highRisk.length, icon: Stethoscope },
    { label: "Open referrals", value: openReferrals.length, icon: Send },
    { label: "Pending sync", value: pendingCount, icon: CloudOff },
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

      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/patients">
            <UserPlus className="size-4" /> Register patient
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/assessment">Run health check</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/referrals">Create referral</Link>
        </Button>
        {pendingCount > 0 && (
          <Button size="lg" variant="secondary" onClick={syncNow} disabled={syncing}>
            {syncing ? "Syncing…" : `Sync ${pendingCount} offline record(s)`}
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Priority follow-ups</CardTitle>
            <CardDescription>Patients needing a visit first</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {highRisk.length === 0 && <p className="text-muted-foreground">No high-risk patients right now.</p>}
            {highRisk.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.age} yrs · {p.village}
                  </p>
                </div>
                <RiskBadge risk={p.risk} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent health checks</CardTitle>
            <CardDescription>Latest AI triage results in your area</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assessments.slice(0, 6).map((a) => (
              <div key={a.id} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{a.symptoms.join(", ")}</p>
                  <RiskBadge risk={a.risk} />
                </div>
                <p className="text-sm text-muted-foreground">{a.action}</p>
                <p className="mt-1 text-xs text-muted-foreground">{a.createdAt}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
