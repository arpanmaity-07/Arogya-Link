import { createFileRoute } from "@tanstack/react-router";
import { Check, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RequireRole } from "@/components/RequireRole";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { REFERRAL_FLOW, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/referrals")({
  head: () => ({
    meta: [
      { title: "Referral Tracking — AROGYALINK" },
      {
        name: "description",
        content: "Create referrals between health centres and track every stage from creation to treatment.",
      },
      { property: "og:title", content: "Referral Tracking — AROGYALINK" },
      {
        property: "og:description",
        content: "Create referrals between health centres and track each stage to treatment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReferralsRoute,
});

function ReferralsRoute() {
  return (
    <RequireRole roles={["asha", "doctor", "admin"]} title="Referral Tracking">
      <ReferralsBody />
    </RequireRole>
  );
}

function ReferralsBody() {
  const { referrals, patients, facilities, addReferral, advanceReferral, user } = useStore();
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [toFacility, setToFacility] = useState(facilities[1]?.name ?? "");
  const [priority, setPriority] = useState<"Routine" | "Urgent" | "Emergency">("Urgent");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("All");

  const visible = filter === "All" ? referrals : referrals.filter((r) => r.status === filter);

  const submit = () => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient || !reason.trim()) {
      toast.error("Choose a patient and give a reason");
      return;
    }
    const ref = addReferral({
      patientId: patient.id,
      patientName: patient.name,
      fromFacility: user?.facility ?? "Jangipur PHC",
      toFacility,
      reason: reason.trim(),
      priority,
      notes: notes.trim(),
    });
    setReason("");
    setNotes("");
    setOpen(false);
    toast.success(`Referral ${ref.id} created`, { description: `${ref.fromFacility} → ${ref.toFacility}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All referrals</SelectItem>
            {REFERRAL_FLOW.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Send className="size-4" /> New referral
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create a referral</DialogTitle>
              <DialogDescription>Send a patient to a higher centre with a trackable reference.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Patient</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} · {p.village}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Refer to</Label>
                <Select value={toFacility} onValueChange={setToFacility}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((f) => (
                      <SelectItem key={f.id} value={f.name}>
                        {f.name} · {f.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Routine", "Urgent", "Emergency"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reason for referral</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Clinical notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </div>
              <Button size="lg" className="w-full" onClick={submit}>
                Send referral
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {visible.map((r) => {
          const stage = REFERRAL_FLOW.indexOf(r.status);
          return (
            <Card key={r.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-lg">{r.patientName}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.priority === "Emergency" ? "destructive" : "secondary"}>{r.priority}</Badge>
                    <Badge variant="outline">{r.status}</Badge>
                  </div>
                </div>
                <CardDescription>
                  {r.id} · {r.fromFacility} → {r.toFacility} · created {r.createdAt}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  <span className="font-medium">Reason:</span> {r.reason}
                </p>
                {r.notes && <p className="text-sm text-muted-foreground">{r.notes}</p>}

                <ol className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {REFERRAL_FLOW.map((s, i) => (
                    <li
                      key={s}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-2 text-xs font-medium",
                        i <= stage
                          ? "border-success/40 bg-success/10 text-success"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {i <= stage ? (
                        <Check className="size-3.5" />
                      ) : (
                        <span className="size-3.5 rounded-full border border-current" />
                      )}
                      {s}
                    </li>
                  ))}
                </ol>

                {r.status !== "Completed" && (
                  <Button size="sm" variant="outline" onClick={() => advanceReferral(r.id)}>
                    Mark next stage
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
        {visible.length === 0 && <p className="text-muted-foreground">No referrals in this stage.</p>}
      </div>
    </div>
  );
}
