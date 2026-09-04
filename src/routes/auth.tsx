import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HeartPulse, ShieldCheck, Stethoscope, UserRound, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEMO_ACCOUNTS, ROLE_HOME, useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — AROGYALINK" },
      {
        name: "description",
        content: "Sign in to AROGYALINK as a patient, ASHA worker, doctor or district health officer.",
      },
      { property: "og:title", content: "Sign in — AROGYALINK" },
      {
        property: "og:description",
        content: "Role-based sign in for patients, ASHA workers, doctors and health officers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const ROLES: { role: Role; label: string; icon: typeof UserRound; blurb: string }[] = [
  { role: "patient", label: "Patient", icon: UserRound, blurb: "Check symptoms, book doctors, view records." },
  { role: "asha", label: "ASHA Worker", icon: Users, blurb: "Register villagers, triage and raise referrals." },
  { role: "doctor", label: "Doctor", icon: Stethoscope, blurb: "Run consultations and accept referrals." },
  { role: "admin", label: "Health Officer", icon: ShieldCheck, blurb: "District analytics and facility load." },
];

function AuthPage() {
  const { signIn } = useStore();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("patient");

  return (
    <AppShell>
      <div className="mx-auto grid max-w-5xl gap-8 py-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <HeartPulse className="size-7" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to AROGYALINK</h1>
          <p className="text-lg text-muted-foreground">
            Choose your role and sign in. Each role opens its own dashboard, and pages you are not
            allowed to open stay locked.
          </p>
          <div className="space-y-3">
            {ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => setRole(r.role)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                  role === r.role ? "border-primary bg-secondary" : "border-border hover:bg-muted"
                }`}
              >
                <r.icon className="mt-0.5 size-5 text-primary" />
                <span>
                  <span className="block font-semibold">{r.label}</span>
                  <span className="text-sm text-muted-foreground">{r.blurb}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use the demo credentials shown under each role.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={(v) => setRole(v as Role)}>
              <TabsList className="grid w-full grid-cols-4">
                {ROLES.map((r) => (
                  <TabsTrigger key={r.role} value={r.role} className="text-xs sm:text-sm">
                    {r.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {ROLES.map((r) => (
                <TabsContent key={r.role} value={r.role} className="pt-4">
                  <LoginForm
                    role={r.role}
                    onSubmit={(email, password) => {
                      const u = signIn(email, password, r.role);
                      if (!u) {
                        toast.error("Those details did not match this role. Try the demo login.");
                        return;
                      }
                      toast.success(`Signed in as ${u.name}`);
                      navigate({ to: ROLE_HOME[u.role] });
                    }}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function LoginForm({
  role,
  onSubmit,
}: {
  role: Role;
  onSubmit: (email: string, password: string) => void;
}) {
  const demo = DEMO_ACCOUNTS[role];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`email-${role}`}>Email or phone</Label>
        <Input
          id={`email-${role}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={demo.email}
          autoComplete="username"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`pw-${role}`}>Password</Label>
        <Input
          id={`pw-${role}`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••"
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" size="lg" className="w-full">
        Sign in as {demo.name}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => {
          setEmail(demo.email);
          setPassword(demo.password);
          onSubmit(demo.email, demo.password);
        }}
      >
        Use demo login ({demo.hint})
      </Button>
    </form>
  );
}
