import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Ambulance,
  BrainCircuit,
  ClipboardList,
  MapPin,
  ShieldCheck,
  Stethoscope,
  Users,
  WifiOff,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AROGYALINK — Smart Healthcare for Rural India" },
      {
        name: "description",
        content:
          "AI health assessment, nearest PHC and hospital finder, telemedicine and referral tracking for rural and underserved communities.",
      },
      { property: "og:title", content: "AROGYALINK — Smart Healthcare for Rural India" },
      {
        property: "og:description",
        content:
          "AI health assessment, nearest PHC and hospital finder, telemedicine and referral tracking for rural and underserved communities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "AI health assessment",
    text: "Answer simple questions by tap or voice and get an explainable risk score in seconds.",
  },
  {
    icon: MapPin,
    title: "Nearest facility on a map",
    text: "See PHCs, CHCs and hospitals around you with real distances, services and waiting times.",
  },
  {
    icon: Stethoscope,
    title: "Telemedicine",
    text: "Book a video or in-person slot with a doctor who speaks your language.",
  },
  {
    icon: ClipboardList,
    title: "Referral tracking",
    text: "Follow a referral from creation to treatment, so nobody is lost between facilities.",
  },
  {
    icon: WifiOff,
    title: "Works offline",
    text: "Health workers can register patients without a network and sync when signal returns.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    text: "Patients, ASHA workers, doctors and district officers each see only what they need.",
  },
];

const JOURNEY = [
  "Patient describes symptoms",
  "AI assessment scores the risk",
  "Nearest right-level facility suggested",
  "Teleconsultation or referral raised",
  "Treatment tracked to completion",
];

function Landing() {
  const { t } = useI18n();

  return (
    <AppShell>
      <section
        className="relative overflow-hidden rounded-3xl px-6 py-16 text-white sm:px-12"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
            <Activity className="size-4" /> Smart India Hackathon prototype
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">AROGYALINK</h1>
          <p className="mt-3 text-xl opacity-95">{t("tagline")}</p>
          <p className="mt-4 text-lg opacity-90">
            One connected journey — from a villager&apos;s first symptom to treatment at the right
            hospital, with health workers, doctors and district officers on the same platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link to="/auth">{t("getStarted")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/60 bg-transparent text-base text-white hover:bg-white/15 hover:text-white"
            >
              <Link to="/assessment">Try the health check</Link>
            </Button>
          </div>
        </div>
        <Ambulance className="pointer-events-none absolute -right-6 bottom--4 hidden size-56 opacity-15 lg:block" />
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold">The complete care journey</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-5">
          {JOURNEY.map((step, i) => (
            <li key={step} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <p className="mt-3 font-medium">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold">Built for villages, not just cities</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="transition-shadow hover:shadow-lg">
              <CardContent className="space-y-3 p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <f.icon className="size-5" />
                </span>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-muted-foreground">{f.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { k: "10", v: "Registered patients" },
          { k: "5", v: "Linked facilities" },
          { k: "24/7", v: "Emergency guidance" },
          { k: "3", v: "Languages supported" },
        ].map((s) => (
          <div key={s.v} className="rounded-2xl bg-secondary p-6 text-center">
            <p className="text-3xl font-bold text-primary">{s.k}</p>
            <p className="mt-1 text-secondary-foreground">{s.v}</p>
          </div>
        ))}
      </section>

      <section className="mt-14 flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-10 text-center">
        <Users className="size-10 text-primary" />
        <h2 className="text-2xl font-bold">Four roles, one platform</h2>
        <p className="max-w-xl text-muted-foreground">
          Sign in as a patient, ASHA worker, doctor or district health officer to explore the full
          demo with ready-made accounts.
        </p>
        <Button asChild size="lg">
          <Link to="/auth">Open the demo sign-in</Link>
        </Button>
      </section>
    </AppShell>
  );
}
