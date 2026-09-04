import { createFileRoute } from "@tanstack/react-router";
import { Activity, Hospital, Send, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RequireRole } from "@/components/RequireRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMON_SYMPTOMS, FACILITY_USAGE, HEALTH_WORKERS, MONTHLY_CONSULTATIONS } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "District Health Analytics — AROGYALINK" },
      {
        name: "description",
        content: "District-level analytics on consultations, referrals, common symptoms and facility usage.",
      },
      { property: "og:title", content: "District Health Analytics — AROGYALINK" },
      {
        property: "og:description",
        content: "Analytics on consultations, referrals, symptoms and facility usage across the district.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminRoute,
});

const RISK_COLORS = ["var(--color-success)", "var(--color-warning)", "var(--color-primary)", "var(--color-emergency)"];

function AdminRoute() {
  return (
    <RequireRole roles={["admin"]} title="District Health Analytics">
      <AdminBody />
    </RequireRole>
  );
}

function AdminBody() {
  const { patients, referrals, consultations, facilities } = useStore();

  const riskData = (["LOW", "MODERATE", "HIGH", "EMERGENCY"] as const).map((risk) => ({
    name: risk,
    value: patients.filter((p) => p.risk === risk).length,
  }));

  const stats = [
    { label: "Registered patients", value: patients.length, icon: Users },
    { label: "Consultations", value: consultations.length, icon: Activity },
    { label: "Referrals", value: referrals.length, icon: Send },
    { label: "Facilities covered", value: facilities.length, icon: Hospital },
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
            <CardTitle>Consultations per month</CardTitle>
            <CardDescription>Teleconsultations delivered across the district</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_CONSULTATIONS}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip />
                <Line type="monotone" dataKey="consultations" stroke="var(--color-primary)" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most reported symptoms</CardTitle>
            <CardDescription>Signals for outbreak monitoring</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COMMON_SYMPTOMS}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="symptom" stroke="var(--color-muted-foreground)" hide />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient risk distribution</CardTitle>
            <CardDescription>Based on latest AI triage results</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {riskData.map((entry, i) => (
                    <Cell key={entry.name} fill={RISK_COLORS[i % RISK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Facility usage</CardTitle>
            <CardDescription>Patient visits per centre</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FACILITY_USAGE} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-muted-foreground)" />
                <YAxis type="category" dataKey="facility" width={130} stroke="var(--color-muted-foreground)" />
                <Tooltip />
                <Bar dataKey="visits" fill="var(--color-primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health worker coverage</CardTitle>
          <CardDescription>Families supported by each ASHA worker</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {HEALTH_WORKERS.map((w) => (
            <div key={w.id} className="rounded-xl border border-border p-4">
              <p className="font-semibold">{w.name}</p>
              <p className="text-sm text-muted-foreground">
                {w.village} · {w.patients} families
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
