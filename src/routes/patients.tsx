import { createFileRoute } from "@tanstack/react-router";
import { CloudOff, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RequireRole } from "@/components/RequireRole";
import { RiskBadge } from "@/components/RiskMeter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/patients")({
  head: () => ({
    meta: [
      { title: "Patient Registry — AROGYALINK" },
      {
        name: "description",
        content: "Register new patients with a digital health ID and search the village patient registry.",
      },
      { property: "og:title", content: "Patient Registry — AROGYALINK" },
      {
        property: "og:description",
        content: "Register patients with a digital health ID and search the village registry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PatientsRoute,
});

function PatientsRoute() {
  return (
    <RequireRole roles={["asha", "doctor", "admin"]} title="Patient Registry">
      <PatientsBody />
    </RequireRole>
  );
}

const EMPTY = {
  name: "",
  age: "",
  gender: "Female",
  mobile: "",
  village: "",
  district: "Murshidabad",
  state: "West Bengal",
  bloodGroup: "O+",
  emergencyContact: "",
};

function PatientsBody() {
  const { patients, addPatient, user, online } = useStore();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.healthId.toLowerCase().includes(q) ||
        p.mobile.includes(q),
    );
  }, [patients, query]);

  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name.trim() || !form.age.trim() || !form.village.trim()) {
      toast.error("Please fill name, age and village");
      return;
    }
    const p = addPatient({
      name: form.name.trim(),
      age: Number(form.age) || 0,
      gender: form.gender,
      mobile: form.mobile.trim(),
      village: form.village.trim(),
      district: form.district,
      state: form.state,
      bloodGroup: form.bloodGroup,
      emergencyContact: form.emergencyContact.trim(),
      assignedWorker: user?.name ?? "Unassigned",
    });
    setForm(EMPTY);
    setOpen(false);
    toast.success(`${p.name} registered`, {
      description: online ? `Health ID ${p.healthId}` : `Saved offline — will sync later (${p.healthId})`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, village, health ID or mobile"
            className="pl-9"
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <UserPlus className="size-4" /> Register patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register a new patient</DialogTitle>
              <DialogDescription>
                A digital health ID is created automatically. Works offline — records sync when back online.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.name} onChange={(v) => set("name", v)} />
              <Field label="Age" value={form.age} onChange={(v) => set("age", v)} type="number" />
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Female", "Male", "Other"].map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Blood group</Label>
                <Select value={form.bloodGroup} onValueChange={(v) => set("bloodGroup", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field label="Mobile" value={form.mobile} onChange={(v) => set("mobile", v)} />
              <Field label="Village" value={form.village} onChange={(v) => set("village", v)} />
              <Field label="District" value={form.district} onChange={(v) => set("district", v)} />
              <Field label="State" value={form.state} onChange={(v) => set("state", v)} />
              <Field
                label="Emergency contact"
                value={form.emergencyContact}
                onChange={(v) => set("emergencyContact", v)}
              />
            </div>
            <Button size="lg" onClick={submit}>
              Create health ID
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{filtered.length} patients</CardTitle>
          <CardDescription>Tap a card to see health ID, risk level and assigned worker</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{p.name}</p>
                <div className="flex items-center gap-2">
                  {p.pendingSync && (
                    <Badge variant="outline" className="gap-1">
                      <CloudOff className="size-3" /> Offline
                    </Badge>
                  )}
                  <RiskBadge risk={p.risk} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {p.healthId} · {p.age} yrs · {p.gender} · {p.bloodGroup}
              </p>
              <p className="text-sm text-muted-foreground">
                {p.village}, {p.district} · {p.mobile}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">ASHA: {p.assignedWorker}</p>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-muted-foreground">No patients match your search.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
