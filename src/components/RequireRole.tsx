import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

export function RequireRole({
  roles,
  title,
  children,
}: {
  roles: Role[];
  title?: string;
  children: ReactNode;
}) {
  const { user } = useStore();

  if (!user || !roles.includes(user.role)) {
    return (
      <AppShell>
        <Card className="mx-auto mt-12 max-w-md text-center">
          <CardContent className="space-y-4 p-8">
            <ShieldAlert className="mx-auto size-12 text-warning" />
            <h2 className="text-xl font-semibold">
              {user ? "This area is for a different role" : "Please sign in to continue"}
            </h2>
            <p className="text-muted-foreground">
              {user
                ? `You are signed in as ${user.role}. This page is available to: ${roles.join(", ")}.`
                : "Choose your role on the sign-in screen to open your dashboard."}
            </p>
            <Button asChild size="lg">
              <Link to="/auth">Go to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return <AppShell title={title}>{children}</AppShell>;
}
