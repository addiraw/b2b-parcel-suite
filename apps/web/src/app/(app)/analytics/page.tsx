"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RoleGate } from "@/components/layout/role-gate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#4f46e5", "#94a3b8"];

export default function AnalyticsPage() {
  return (
    <DashboardShell title="Analytics">
      <RoleGate allow={["owner", "admin"]}>
        <AnalyticsInner />
      </RoleGate>
    </DashboardShell>
  );
}

function AnalyticsInner() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [payload, setPayload] = React.useState<{
    analytics: {
      successRate: number;
      volumeSeries: { date: string; count: number }[];
      total: number;
      delivered: number;
    };
    logs: { id: string; at: string; action: string; parcelId: string; agentName?: string }[];
  } | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<NonNullable<typeof payload>>("/api/analytics");
        setPayload(data);
      } catch {
        setError("Could not load analytics.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function exportCsv() {
    try {
      const res = await api.get<Blob>("/api/export/parcels", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "parcels-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed.");
    }
  }

  const pieData = payload
    ? [
        { name: "Delivered", value: payload.analytics.delivered },
        {
          name: "Other",
          value: Math.max(0, payload.analytics.total - payload.analytics.delivered),
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Delivery performance and operational volume for your network.
        </p>
        <Button variant="outline" size="sm" onClick={() => void exportCsv()}>
          Export parcels (CSV)
        </Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}
      {payload && !loading && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Delivery success rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums">
                  {payload.analytics.successRate}%
                </p>
                <p className="text-xs text-muted-foreground">Delivered ÷ total parcels</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Outcome mix</CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parcel volume (created by day)</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payload.analytics.volumeSeries}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Parcels"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Logs &amp; tracking history</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 space-y-3 overflow-y-auto">
              {payload.logs.map((l) => (
                <div
                  key={l.id + l.at}
                  className="border-b border-border/60 pb-2 text-sm last:border-0"
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-mono text-xs text-primary">{l.parcelId}</span>
                    <time className="text-xs text-muted-foreground">
                      {new Date(l.at).toLocaleString()}
                    </time>
                  </div>
                  <p className="font-medium">{l.action}</p>
                  {l.agentName && (
                    <p className="text-xs text-muted-foreground">Agent: {l.agentName}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
