"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RoleGate } from "@/components/layout/role-gate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { Business, Parcel, ParcelStatus, PublicUser } from "@/lib/types";
import { QRCodeSVG } from "qrcode.react";

export default function ManagePage() {
  return (
    <DashboardShell title="Parcel management">
      <RoleGate allow={["owner", "admin"]}>
        <ManageInner />
      </RoleGate>
    </DashboardShell>
  );
}

function ManageInner() {
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [users, setUsers] = React.useState<PublicUser[]>([]);
  const [parcels, setParcels] = React.useState<Parcel[]>([]);
  const [businessId, setBusinessId] = React.useState("");
  const [agentId, setAgentId] = React.useState<string | undefined>(undefined);
  const [manualId, setManualId] = React.useState("");
  const [manualStatus, setManualStatus] = React.useState<ParcelStatus>("in_transit");
  const [created, setCreated] = React.useState<Parcel | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const [b, u, p] = await Promise.all([
          api.get<{ businesses: Business[] }>("/api/businesses"),
          api.get<{ users: PublicUser[] }>("/api/users"),
          api.get<{ parcels: Parcel[] }>("/api/parcels"),
        ]);
        setBusinesses(b.data.businesses);
        setUsers(u.data.users);
        setParcels(p.data.parcels);
        if (b.data.businesses[0]) setBusinessId(b.data.businesses[0].id);
      } catch {
        setError("Failed to load reference data.");
      }
    })();
  }, []);

  const agents = users.filter((u) => u.role === "agent");

  async function createParcel() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const { data } = await api.post<{ parcel: Parcel }>("/api/parcels", {
        businessId,
        assignedAgentId: agentId || undefined,
      });
      setCreated(data.parcel);
      setMessage(`Created ${data.parcel.parcelId}`);
      const { data: p } = await api.get<{ parcels: Parcel[] }>("/api/parcels");
      setParcels(p.parcels);
    } catch {
      setError("Could not create parcel.");
    } finally {
      setLoading(false);
    }
  }

  async function patchStatus() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const target = parcels.find((x) => x.parcelId === manualId.trim());
      if (!target) {
        setError("Parcel ID not found in current list. Refresh parcels page.");
        return;
      }
      await api.patch(`/api/parcels/${encodeURIComponent(target.id)}`, {
        status: manualStatus,
      });
      setMessage(`Updated ${manualId} → ${manualStatus}`);
      const { data: p } = await api.get<{ parcels: Parcel[] }>("/api/parcels");
      setParcels(p.parcels);
    } catch {
      setError("Status update failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {error && (
        <Alert variant="destructive" className="lg:col-span-2">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {message && (
        <Alert className="border-primary/30 bg-primary/5 lg:col-span-2">
          <AlertTitle>Done</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create parcel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Business</Label>
            <Select value={businessId} onValueChange={setBusinessId}>
              <SelectTrigger>
                <SelectValue placeholder="Select business" />
              </SelectTrigger>
              <SelectContent>
                {businesses.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Assign agent (optional)</Label>
            <Select
              value={agentId ?? "__none__"}
              onValueChange={(v) => setAgentId(v === "__none__" ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Unassigned</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => void createParcel()} disabled={loading || !businessId}>
            Create &amp; generate QR payload
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">QR code</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {created ? (
            <>
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <QRCodeSVG value={created.qrPayload} size={180} level="M" />
              </div>
              <div className="text-center text-sm">
                <p className="font-mono text-xs text-primary">{created.parcelId}</p>
                <p className="text-muted-foreground">Encodes: {created.qrPayload}</p>
              </div>
            </>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Create a parcel to render a QR code agents can scan in the field.
            </p>
          )}
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Manual status update</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="pid">Parcel ID</Label>
            <Input
              id="pid"
              placeholder="PRCL-10001"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
            />
          </div>
          <div className="w-full space-y-2 md:w-48">
            <Label>Status</Label>
            <Select
              value={manualStatus}
              onValueChange={(v) => setManualStatus(v as ParcelStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="in_transit">In transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => void patchStatus()} disabled={loading || !manualId.trim()}>
            Apply
          </Button>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Recent parcels</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {parcels.slice(0, 12).map((p) => (
            <Badge key={p.id} variant="outline" className="font-mono text-xs">
              {p.parcelId} · {p.status.replace("_", " ")}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
