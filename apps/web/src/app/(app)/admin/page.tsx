"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RoleGate } from "@/components/layout/role-gate";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Business, PublicUser, UserRole } from "@/lib/types";

export default function AdminPage() {
  return (
    <DashboardShell title="Tenants & users">
      <RoleGate allow={["owner", "admin"]}>
        <AdminInner />
      </RoleGate>
    </DashboardShell>
  );
}

function AdminInner() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [users, setUsers] = React.useState<PublicUser[]>([]);
  const [bizName, setBizName] = React.useState("");
  const [uEmail, setUEmail] = React.useState("");
  const [uPassword, setUPassword] = React.useState("password123");
  const [uName, setUName] = React.useState("");
  const [uRole, setURole] = React.useState<UserRole>("agent");
  const [uBusiness, setUBusiness] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const [b, u] = await Promise.all([
        api.get<{ businesses: Business[] }>("/api/businesses"),
        api.get<{ users: PublicUser[] }>("/api/users"),
      ]);
      setBusinesses(b.data.businesses);
      setUsers(u.data.users);
    } catch {
      setError("Failed to refresh data.");
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function addBusiness() {
    setError(null);
    setOk(null);
    try {
      await api.post("/api/businesses", { name: bizName });
      setBizName("");
      setOk("Business created.");
      await load();
    } catch {
      setError("Could not create business.");
    }
  }

  async function addUser() {
    setError(null);
    setOk(null);
    try {
      await api.post("/api/users", {
        email: uEmail,
        password: uPassword,
        name: uName || uEmail.split("@")[0],
        role: uRole,
        businessId: uBusiness || undefined,
      });
      setUEmail("");
      setUName("");
      setOk("User created.");
      await load();
    } catch {
      setError("Could not create user (duplicate email?).");
    }
  }

  async function removeBusiness(id: string) {
    if (!confirm("Delete this tenant? Only owners can delete.")) return;
    setError(null);
    try {
      await api.delete(`/api/businesses/${id}`);
      setOk("Business removed.");
      await load();
    } catch {
      setError("Delete failed (owner only).");
    }
  }

  async function removeUser(id: string) {
    if (!confirm("Remove this user?")) return;
    setError(null);
    try {
      await api.delete(`/api/users/${id}`);
      setOk("User removed.");
      await load();
    } catch {
      setError("Could not delete user.");
    }
  }

  const roleOptions: UserRole[] =
    user?.role === "owner"
      ? ["owner", "admin", "agent", "business"]
      : ["admin", "agent", "business"];

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {ok && (
        <Alert className="border-primary/30 bg-primary/5">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{ok}</AlertDescription>
        </Alert>
      )}
      <Tabs defaultValue="businesses">
        <TabsList>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="users">Users &amp; roles</TabsTrigger>
        </TabsList>
        <TabsContent value="businesses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add business (tenant)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="bn">Name</Label>
                <Input
                  id="bn"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="Northwind Trading"
                />
              </div>
              <Button onClick={() => void addBusiness()} disabled={!bizName.trim()}>
                Add business
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All businesses</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell className="text-right">
                        {user?.role === "owner" && (
                          <Button variant="ghost" size="sm" onClick={() => void removeBusiness(b.id)}>
                            Delete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invite user</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="em">Email</Label>
                <Input id="em" type="email" value={uEmail} onChange={(e) => setUEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw">Temp password</Label>
                <Input id="pw" type="text" value={uPassword} onChange={(e) => setUPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nm">Display name</Label>
                <Input id="nm" value={uName} onChange={(e) => setUName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Role (RBAC)</Label>
                <Select value={uRole} onValueChange={(v) => setURole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Business</Label>
                <Select
                  value={uBusiness || "__none__"}
                  onValueChange={(v) => setUBusiness(v === "__none__" || !v ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {businesses.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={() => void addUser()} disabled={!uEmail.trim()}>
                  Create user
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Directory</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => void removeUser(u.id)}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
