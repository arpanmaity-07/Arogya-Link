import { createFileRoute } from "@tanstack/react-router";
import { Clock, Hospital, Navigation, Stethoscope } from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientOnly } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FACILITY_COORDS, HOME_POINT, haversineKm } from "@/lib/geo";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const FacilityMap = lazy(() => import("@/components/FacilityMap"));

export const Route = createFileRoute("/facilities")({
  head: () => ({
    meta: [
      { title: "Find a Health Facility — AROGYALINK" },
      {
        name: "description",
        content: "Map of nearby PHCs, CHCs and hospitals with distance, services and waiting times.",
      },
      { property: "og:title", content: "Find a Health Facility — AROGYALINK" },
      {
        property: "og:description",
        content: "Locate the nearest primary health centre or hospital with live waiting times.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FacilitiesPage,
});

function FacilitiesPage() {
  const { facilities } = useStore();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const list = useMemo(() => {
    return facilities
      .map((f) => {
        const c = FACILITY_COORDS[f.id];
        return { ...f, km: c ? haversineKm(HOME_POINT, c) : f.distanceKm };
      })
      .filter(
        (f) =>
          (type === "all" || f.type === type) &&
          (f.name.toLowerCase().includes(query.toLowerCase()) ||
            f.services.some((s) => s.toLowerCase().includes(query.toLowerCase()))),
      )
      .sort((a, b) => a.km - b.km);
  }, [facilities, query, type]);

  return (
    <AppShell title="Find a Health Facility">
      <p className="-mt-3 mb-6 text-muted-foreground">
        Your location: {HOME_POINT.label}. Distances are measured from there.
      </p>

      <div className="mb-6 flex flex-wrap gap-3">
        <Input
          placeholder="Search by name or service (e.g. dialysis)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All facility types</SelectItem>
            <SelectItem value="PHC">PHC</SelectItem>
            <SelectItem value="CHC">CHC</SelectItem>
            <SelectItem value="District Hospital">District Hospital</SelectItem>
            <SelectItem value="Specialist Hospital">Specialist Hospital</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          {list.map((f) => (
            <Card
              key={f.id}
              onClick={() => setSelected(f.id)}
              className={cn(
                "cursor-pointer transition-shadow hover:shadow-lg",
                selected === f.id && "ring-2 ring-primary",
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{f.name}</CardTitle>
                    <CardDescription>
                      {f.type} · {f.km} km away
                    </CardDescription>
                  </div>
                  {f.emergency && <Badge variant="destructive">24×7 Emergency</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="size-4" /> {f.doctors} doctors
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" /> ~{f.waitMinutes} min wait
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Hospital className="size-4" /> {f.type}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {f.services.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://www.openstreetmap.org/directions?from=${HOME_POINT.lat},${HOME_POINT.lng}&to=${FACILITY_COORDS[f.id]?.lat},${FACILITY_COORDS[f.id]?.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Navigation className="size-4" /> Get directions
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
          {list.length === 0 && (
            <p className="text-muted-foreground">No facility matches that search.</p>
          )}
        </div>

        <div className="h-[560px] overflow-hidden rounded-2xl border border-border lg:sticky lg:top-24">
          <ClientOnly fallback={<div className="grid h-full place-items-center text-muted-foreground">Loading map…</div>}>
            <Suspense fallback={<div className="grid h-full place-items-center text-muted-foreground">Loading map…</div>}>
              <FacilityMap facilities={list} selectedId={selected} onSelect={setSelected} />
            </Suspense>
          </ClientOnly>
        </div>
      </div>
    </AppShell>
  );
}
