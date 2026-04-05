"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { ParcelSummary } from "@/lib/types";

type ActivityRow = {
  id: string;
  at: string;
  action: string;
  parcelId: string;
  agentName?: string;
};

type DashboardPayload = {
  summary: ParcelSummary;
  activity: ActivityRow[];
  chart: { daily: { key: string; label: string; scans: number; delivered: number }[] };
  tableRows: { parcelId: string; businessName: string; status: string; updatedAt: string }[];
};

function statusBadge(status: string) {
  const variant =
    status === "delivered" ? "default" : status === "in_transit" ? "secondary" : "outline";
  return (
    <Badge variant={variant} className="capitalize">
      {status.replace("_", " ")}
    </Badge>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = React.useState<DashboardPayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    if (user.role !== "owner" && user.role !== "admin") {
      router.replace("/parcels");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data: d } = await api.get<DashboardPayload>("/api/dashboard");
        if (!cancelled) setData(d);
      } catch {
        if (!cancelled) setError("Could not load dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, router]);

  if (!user || (user.role !== "owner" && user.role !== "admin")) {
    return null;
  }

  return (
    <DashboardShell title="Admin overview">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {loading && (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      )}
      {data && !loading && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Total parcels" value={data.summary.total} hint="All time" />
            <KpiCard title="Created" value={data.summary.created} hint="Awaiting pickup" />
            <KpiCard title="Active deliveries" value={data.summary.inTransit} hint="In transit" />
            <KpiCard title="Completed" value={data.summary.delivered} hint="Delivered" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily activity</CardTitle>
            </CardHeader>
            <CardContent className="h-72 pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chart.daily} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="scans" name="Scans / transit" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delivered" name="Delivered" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent parcel activity</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parcel</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.tableRows.map((row) => (
                    <TableRow key={row.parcelId + row.updatedAt}>
                      <TableCell className="font-mono text-xs">{row.parcelId}</TableCell>
                      <TableCell>{row.businessName}</TableCell>
                      <TableCell>{statusBadge(row.status)}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {new Date(row.updatedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live event log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events yet.</p>
              ) : (
                data.activity.map((a) => (
                  <div
                    key={a.id + a.at}
                    className="flex flex-col gap-1 border-b border-border/60 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <span className="font-mono text-xs text-primary">{a.parcelId}</span>
                      <p className="text-sm font-medium">{a.action}</p>
                      {a.agentName && (
                        <p className="text-xs text-muted-foreground">Agent: {a.agentName}</p>
                      )}
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {new Date(a.at).toLocaleString()}
                    </time>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}

function KpiCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: number;
  hint: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
