import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { API_BASE_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.name}</Text>
        <Text style={[styles.label, { marginTop: 16 }]}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
        <Text style={[styles.label, { marginTop: 16 }]}>Role</Text>
        <Text style={[styles.value, styles.cap]}>{user?.role}</Text>
      </View>

      <Text style={styles.title}>App</Text>
      <View style={styles.card}>
        <Text style={styles.label}>API base URL</Text>
        <Text style={styles.mono}>{API_BASE_URL}</Text>
        <Text style={styles.hint}>
          Set EXPO_PUBLIC_API_URL when building, or use the same Wi‑Fi IP as your dev machine.
        </Text>
      </View>

      <Pressable style={styles.logout} onPress={() => void logout()}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  title: { fontSize: 13, fontWeight: "600", color: colors.muted, textTransform: "uppercase", marginBottom: 8, marginTop: 8 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  label: { fontSize: 12, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  value: { fontSize: 17, color: colors.text, marginTop: 4, fontWeight: "500" },
  cap: { textTransform: "capitalize" },
  mono: { fontSize: 12, color: colors.primary, marginTop: 6 },
  hint: { marginTop: 12, fontSize: 12, color: colors.muted, lineHeight: 18 },
  logout: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  logoutText: { color: colors.danger, fontWeight: "700", fontSize: 16 },
});
