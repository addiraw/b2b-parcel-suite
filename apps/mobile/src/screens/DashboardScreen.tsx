import React, { useCallback, useState } from "react";
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../api/client";
import { API_BASE_URL } from "../config";
import type { ParcelSummary } from "../types";
import { colors } from "../theme";

type StatsResponse = {
  summary: ParcelSummary;
  recentParcels: { parcelId: string; status: string; businessName: string; updatedAt: string }[];
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data: d } = await api.get<StatsResponse>("/api/stats");
      setData(d);
    } catch {
      setError(`Cannot reach API at ${API_BASE_URL}. Is the web app running?`);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
    >
      <Text style={styles.title}>Overview</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {data && (
        <>
          <View style={styles.row}>
            <StatCard label="Total parcels" value={data.summary.total} />
            <StatCard label="In transit" value={data.summary.inTransit} />
          </View>
          <View style={styles.row}>
            <StatCard label="Delivered" value={data.summary.delivered} />
            <StatCard label="Created" value={data.summary.created} />
          </View>
          <Text style={styles.section}>Recent activity</Text>
          {data.recentParcels.length === 0 ? (
            <Text style={styles.muted}>No recent parcels.</Text>
          ) : (
            data.recentParcels.map((p) => (
              <View key={p.parcelId + p.updatedAt} style={styles.activityRow}>
                <View>
                  <Text style={styles.pid}>{p.parcelId}</Text>
                  <Text style={styles.biz}>{p.businessName}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.status}>{p.status.replace("_", " ")}</Text>
                  <Text style={styles.time}>{new Date(p.updatedAt).toLocaleString()}</Text>
                </View>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 16 },
  row: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { fontSize: 28, fontWeight: "700", color: colors.text },
  statLabel: { marginTop: 4, color: colors.muted, fontSize: 13 },
  section: { marginTop: 20, marginBottom: 12, fontSize: 17, fontWeight: "600", color: colors.text },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pid: { fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }), color: colors.primary, fontSize: 13 },
  biz: { color: colors.muted, fontSize: 13, marginTop: 2 },
  status: { color: colors.text, fontSize: 13, textTransform: "capitalize" },
  time: { color: colors.muted, fontSize: 11, marginTop: 4 },
  muted: { color: colors.muted },
  error: { color: colors.danger, marginBottom: 12 },
});
