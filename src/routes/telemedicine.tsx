import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Languages, Star, Video } from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { Doctor } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/telemedicine")({
  head: () => ({
    meta: [
      { title: "Telemedicine — AROGYALINK" },
      {
        name: "description",
        content: "Book a video or in-person consultation with a doctor who speaks your language.",
      },
      { property: "og:title", content: "Telemedicine — AROGYALINK" },
      {
        property: "og:description",
        content: "Village-to-doctor video consultations with prescriptions saved to health records.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TelePage,
});

function TelePage() {
  return (
    <RequireRole roles={["patient", "asha", "doctor"]} title="Telemedicine">
      <TeleBody />
    </RequireRole>
  );
}

function TeleBody() {
  const { user, doctors, patients, consultations, addConsultation, completeConsultation } = useStore();
  const [booking, setBooking] = useState<Doctor | null>(null);
  const [slot, setSlot] = useState("");
  const [mode, setMode] = useState<"Video" | "In-person">("Video");
  const [patientId, setPatientId] = useState(user?.patientId ?? patients[0]?.id ?? "");
  const [completing, setCompleting] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [followUp, setFollowUp] = useState("After 7 days");

  const mine = consultations.filter((c) =>
    user?.role === "patient" ? c.patientId === user.patientId : true,
  );

  const confirmBooking = () => {
    const patient = patients.find((p) => p.id === patientId);
    if (!booking || !patient || !slot) {
      toast.error("Please choose a time slot.");
      return;
    }
    addConsultation({
      patientId: patient.id,
      patientName: patient.name,
      doctorName: booking.name,
      date: new Date().toISOString().slice(0, 10),
      slot,
      mode,
    });
    toast.success(`Appointment booked with ${booking.name} at ${slot}`);
    setBooking(null);
    setSlot("");
  };

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-xl font-semibold">Available doctors</h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((d) => (
            <Card key={d.id} className="transition-shadow hover:shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{d.name}</CardTitle>
                <CardDescription>
                  {d.specialization} · {d.facility}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Star className="size-4 text-warning" /> {d.rating}
                  </span>
                  <span>{d.experience} yrs experience</span>
                  <span className="flex items-center gap-1.5">
                    <Languages className="size-4" /> {d.languages.join(", ")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {d.slots.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setBooking(d);
                    setSlot(d.slots[0] ?? "");
                  }}
                >
                  <CalendarCheck className="size-4" /> Book appointment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Appointments</h2>
        <div className="space-y-4">
          {mine.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-wrap items-center gap-4 p-5">
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl",
                    c.status === "Completed" ? "bg-success/15 text-success" : "bg-secondary text-primary",
                  )}
                >
                  <Video className="size-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold">
                    {c.patientName} with {c.doctorName}
                  </p>
                  <p className="text-muted-foreground">
                    {c.date} at {c.slot} · {c.mode}
                  </p>
                  {c.prescription && (
                    <p className="mt-1 text-sm text-muted-foreground">Rx: {c.prescription}</p>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <Badge variant={c.status === "Completed" ? "secondary" : "default"}>{c.status}</Badge>
                  {c.status === "Scheduled" && (
                    <>
                      <Button variant="outline" onClick={() => toast.info("Starting secure video call…")}>
                        Join call
                      </Button>
                      {user?.role === "doctor" && (
                        <Button onClick={() => setCompleting(c.id)}>Complete</Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {mine.length === 0 && <p className="text-muted-foreground">No appointments yet.</p>}
        </div>
      </section>

      <Dialog open={!!booking} onOpenChange={(o) => !o && setBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book with {booking?.name}</DialogTitle>
            <DialogDescription>{booking?.specialization}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {user?.role !== "patient" && (
              <div className="space-y-2">
                <Label>Patient</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Time slot</Label>
              <div className="flex flex-wrap gap-2">
                {booking?.slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={cn(
                      "rounded-full border px-4 py-2 font-medium",
                      slot === s ? "border-primary bg-primary text-primary-foreground" : "border-border",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Consultation type</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as "Video" | "In-person")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Video">Video call</SelectItem>
                  <SelectItem value="In-person">In-person visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={confirmBooking}>Confirm booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!completing} onOpenChange={(o) => !o && setCompleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete consultation</DialogTitle>
            <DialogDescription>Notes and prescription are saved to the health record.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Clinical notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Prescription</Label>
              <Textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                rows={2}
                placeholder="Paracetamol 500mg twice daily for 3 days"
              />
            </div>
            <div className="space-y-2">
              <Label>Follow-up</Label>
              <Select value={followUp} onValueChange={setFollowUp}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not required">Not required</SelectItem>
                  <SelectItem value="After 3 days">After 3 days</SelectItem>
                  <SelectItem value="After 7 days">After 7 days</SelectItem>
                  <SelectItem value="After 1 month">After 1 month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!completing) return;
                completeConsultation(completing, notes, prescription, followUp);
                toast.success("Consultation completed and record saved");
                setCompleting(null);
                setNotes("");
                setPrescription("");
              }}
            >
              Save and complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
