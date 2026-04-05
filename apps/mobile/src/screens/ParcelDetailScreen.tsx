import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../api/client";
import type { RootStackParamList } from "../navigation/AppNavigator";
import type { Parcel } from "../types";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "ParcelDetail">;

export default function ParcelDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.get<{ parcel: Parcel }>(`/api/parcels/${encodeURIComponent(id)}`);
      setParcel(data.parcel);
    } catch {
      setError("Could not load parcel.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function markDelivered() {
    if (!parcel) return;
    setActionPending(true);
    setActionMsg(null);
    try {
      await api.patch(`/api/parcels/${encodeURIComponent(parcel.id)}`, {
        status: "delivered",
        action: "Marked delivered (mobile)",
      });
      setActionMsg("Parcel marked as delivered.");
      await load();
    } catch {
      setActionMsg("Update failed.");
    } finally {
      setActionPending(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !parcel) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error ?? "Not found"}</Text>
        <Pressable style={styles.btnSecondary} onPress={() => navigation.goBack()}>
          <Text style={styles.btnSecondaryText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const timeline = [...parcel.history].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.pid}>{parcel.parcelId}</Text>
      <Text style={styles.biz}>{parcel.businessName}</Text>
      <View style={[styles.statusPill, { marginTop: 12 }]}>
        <Text style={styles.statusText}>{parcel.status.replace("_", " ")}</Text>
      </View>

      {actionMsg ? <Text style={styles.msg}>{actionMsg}</Text> : null}

      {parcel.status !== "delivered" ? (
        <Pressable
          style={[styles.btn, actionPending && styles.btnDisabled]}
          onPress={() => void markDelivered()}
          disabled={actionPending}
        >
          {actionPending ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={styles.btnText}>Mark as delivered</Text>
          )}
        </Pressable>
      ) : null}

      <Text style={styles.section}>Status timeline</Text>
      {timeline.map((h, i) => (
        <View key={h.id} style={styles.timelineRow}>
          <View style={styles.dotCol}>
            <View style={styles.dot} />
            {i < timeline.length - 1 ? <View style={styles.line} /> : null}
          </View>
          <View style={styles.timelineBody}>
            <Text style={styles.tAction}>{h.action}</Text>
            {h.status ? (
              <Text style={styles.tMeta}>{h.status.replace("_", " ")}</Text>
            ) : null}
            {h.location ? <Text style={styles.tMeta}>{h.location}</Text> : null}
            {h.agentName ? <Text style={styles.tMeta}>Agent: {h.agentName}</Text> : null}
            <Text style={styles.tTime}>{new Date(h.at).toLocaleString()}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.section}>History log</Text>
      {[...parcel.history]
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .map((h) => (
          <View key={h.id} style={styles.logRow}>
            <Text style={styles.logTime}>{new Date(h.at).toLocaleString()}</Text>
            <Text style={styles.logAction}>{h.action}</Text>
            <Text style={styles.logMeta}>
              {[h.location, h.agentName].filter(Boolean).join(" · ")}
            </Text>
          </View>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center", padding: 24 },
  pid: { fontSize: 24, fontWeight: "700", color: colors.text },
  biz: { marginTop: 6, color: colors.muted, fontSize: 16 },
  statusPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(99,102,241,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: { color: colors.text, fontWeight: "600", textTransform: "capitalize" },
  section: { marginTop: 24, marginBottom: 12, fontSize: 17, fontWeight: "600", color: colors.text },
  timelineRow: { flexDirection: "row", marginBottom: 4 },
  dotCol: { width: 20, alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  line: { width: 2, flex: 1, minHeight: 24, backgroundColor: colors.border, marginVertical: 2 },
  timelineBody: { flex: 1, paddingBottom: 16, paddingLeft: 8 },
  tAction: { color: colors.text, fontWeight: "600" },
  tMeta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  tTime: { color: colors.muted, fontSize: 12, marginTop: 4 },
  logRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logTime: { fontSize: 12, color: colors.muted },
  logAction: { color: colors.text, marginTop: 4, fontWeight: "500" },
  logMeta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  btn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: colors.primaryText, fontWeight: "700", fontSize: 16 },
  btnSecondary: { marginTop: 12, padding: 12 },
  btnSecondaryText: { color: colors.primary },
  error: { color: colors.danger, textAlign: "center", marginBottom: 12 },
  msg: { marginTop: 12, color: colors.success, fontWeight: "500" },
});
