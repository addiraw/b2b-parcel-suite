import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/AppNavigator";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../api/client";
import type { Parcel } from "../types";
import { colors } from "../theme";

export default function ParcelsScreen() {
  const navigation = useNavigation();
  const parentNav = navigation.getParent<NavigationProp<RootStackParamList>>();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.get<{ parcels: Parcel[] }>("/api/parcels");
      setParcels(data.parcels);
    } catch {
      setError("Failed to load parcels.");
    } finally {
      setLoading(false);
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

  if (loading && parcels.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Assigned parcels</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={parcels}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
        ListEmptyComponent={<Text style={styles.muted}>No parcels assigned to you.</Text>}
        contentContainerStyle={parcels.length === 0 ? styles.emptyList : undefined}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => parentNav?.navigate("ParcelDetail", { id: item.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.pid}>{item.parcelId}</Text>
              <Text style={styles.biz}>{item.businessName}</Text>
            </View>
            <View style={[styles.badge, badgeStyle(item.status)]}>
              <Text style={styles.badgeText}>{item.status.replace("_", " ")}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

function badgeStyle(s: string) {
  if (s === "delivered") return { backgroundColor: "rgba(34,197,94,0.2)" };
  if (s === "in_transit") return { backgroundColor: "rgba(99,102,241,0.25)" };
  return { backgroundColor: "rgba(148,163,184,0.2)" };
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: 16 },
  centered: { flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", color: colors.text, paddingHorizontal: 16, marginBottom: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  pid: { fontSize: 16, fontWeight: "600", color: colors.text },
  biz: { marginTop: 4, color: colors.muted, fontSize: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: "600", color: colors.text, textTransform: "capitalize" },
  muted: { color: colors.muted, textAlign: "center", marginTop: 24 },
  emptyList: { flexGrow: 1, justifyContent: "center", padding: 24 },
  error: { color: colors.danger, paddingHorizontal: 16, marginBottom: 8 },
});
