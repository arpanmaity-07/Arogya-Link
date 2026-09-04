import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  CloudOff,
  Cloud,
  HeartPulse,
  LogOut,
  Menu,
  PhoneCall,
  RefreshCw,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LANGUAGES, useI18n, type Lang } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV: Record<Role, { to: string; label: string }[]> = {
  patient: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/assessment", label: "Health Check" },
    { to: "/facilities", label: "Find Facility" },
    { to: "/telemedicine", label: "Telemedicine" },
    { to: "/records", label: "Records" },
  ],
  asha: [
    { to: "/asha", label: "Dashboard" },
    { to: "/patients", label: "Patients" },
    { to: "/assessment", label: "Health Check" },
    { to: "/referrals", label: "Referrals" },
    { to: "/facilities", label: "Facilities" },
  ],
  doctor: [
    { to: "/doctor", label: "Dashboard" },
    { to: "/telemedicine", label: "Consultations" },
    { to: "/referrals", label: "Referrals" },
    { to: "/patients", label: "Patients" },
  ],
  admin: [
    { to: "/admin", label: "Analytics" },
    { to: "/referrals", label: "Referrals" },
    { to: "/patients", label: "Patients" },
    { to: "/facilities", label: "Facilities" },
  ],
};

export function AppShell({ children, title }: { children: ReactNode; title?: string | undefined }) {
  const { user, logout, online, toggleOnline, syncing, pendingCount, syncNow } = useStore();
  const { lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [emergency, setEmergency] = useState(false);
  const [menu, setMenu] = useState(false);

  const links = user ? NAV[user.role] : [];

  const navLinks = (
    <>
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          onClick={() => setMenu(false)}
          className="rounded-lg px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          activeProps={{ className: "bg-secondary text-secondary-foreground" }}
        >
          {l.label}
        </Link>
      ))}
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HeartPulse className="size-5" />
            </span>
            <span className="text-lg tracking-tight">AROGYALINK</span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex">{navLinks}</nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleOnline}
              className={cn(
                "hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold sm:flex",
                online
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-warning/50 bg-warning/15 text-warning-foreground",
              )}
            >
              {online ? <Cloud className="size-3.5" /> : <CloudOff className="size-3.5" />}
              {online ? "Online" : "Offline mode"}
            </button>

            {pendingCount > 0 && (
              <Button size="sm" variant="outline" onClick={syncNow} disabled={syncing}>
                <RefreshCw className={cn("size-4", syncing && "animate-spin")} />
                {syncing ? "Syncing" : `Sync ${pendingCount}`}
              </Button>
            )}

            <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
              <SelectTrigger className="hidden w-[110px] sm:flex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="destructive" size="sm" onClick={() => setEmergency(true)}>
              <PhoneCall className="size-4" />
              <span className="hidden sm:inline">Emergency</span>
            </Button>

            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  navigate({ to: "/auth" });
                }}
              >
                <LogOut className="size-4" />
                <span className="hidden md:inline">Sign out</span>
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
            )}

            <Sheet open={menu} onOpenChange={setMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-4">
                <div className="mt-8 flex flex-col gap-1">{navLinks}</div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {title && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {user && (
              <Badge variant="secondary" className="text-sm">
                <Activity className="mr-1 size-3.5" />
                {user.name} · {user.role.toUpperCase()}
              </Badge>
            )}
          </div>
        )}
        {children}
      </main>

      <footer className="border-t border-border bg-card py-6 text-center text-sm text-muted-foreground">
        AROGYALINK · Smart digital healthcare for rural and underserved communities
      </footer>

      <Dialog open={emergency} onOpenChange={setEmergency}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-emergency">Emergency help</DialogTitle>
            <DialogDescription>
              If this is a life-threatening situation, call an ambulance immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { label: "Ambulance (108)", num: "108" },
              { label: "Health helpline (104)", num: "104" },
              { label: "Jangipur PHC", num: "03483 255 100" },
            ].map((c) => (
              <a
                key={c.num}
                href={`tel:${c.num.replace(/\s/g, "")}`}
                className="flex items-center justify-between rounded-xl border border-border p-4 text-lg font-semibold hover:bg-secondary"
              >
                {c.label}
                <span className="text-primary">{c.num}</span>
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
