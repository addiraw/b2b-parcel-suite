import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

export default function ScanScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [message, setMessage] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const lastScan = useRef<number>(0);

  const onBarcodeScanned = useCallback(
    async (result: { data: string }) => {
      if (!scanning || user?.role !== "agent") return;
      const now = Date.now();
      if (now - lastScan.current < 2500) return;
      lastScan.current = now;
      setScanning(false);
      setErr(null);
      setMessage(null);
      try {
        const { data } = await api.post<{ success: boolean; message?: string; error?: string }>(
          "/api/scan",
          { data: result.data },
        );
        if (data.success) {
          setMessage(data.message ?? "Scan recorded.");
        } else {
          setErr(data.error ?? "Scan failed.");
        }
      } catch (e: unknown) {
        const msg =
          e && typeof e === "object" && "response" in e
            ? String((e as { response?: { data?: { error?: string } } }).response?.data?.error)
            : "Network error";
        setErr(msg || "Scan failed.");
      }
      setTimeout(() => {
        setScanning(true);
      }, 2000);
    },
    [scanning, user?.role],
  );

  if (user?.role !== "agent") {
    return (
      <View style={styles.centered}>
        <Text style={styles.info}>QR scanning is available for agent accounts only.</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.info}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.info}>Camera access is required to scan parcel QR codes.</Text>
        <Pressable style={styles.btn} onPress={() => void requestPermission()}>
          <Text style={styles.btnText}>Grant permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={onBarcodeScanned}
      />
      <View style={styles.overlay}>
        <Text style={styles.hint}>Align QR within the frame</Text>
        {message ? <Text style={styles.ok}>{message}</Text> : null}
        {err ? <Text style={styles.bad}>{err}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: "rgba(15,23,42,0.92)",
  },
  hint: { color: colors.text, textAlign: "center", fontSize: 15 },
  ok: { marginTop: 10, color: colors.success, textAlign: "center", fontWeight: "600" },
  bad: { marginTop: 10, color: colors.danger, textAlign: "center" },
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  info: { color: colors.muted, textAlign: "center", fontSize: 16, lineHeight: 24 },
  btn: { marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  btnText: { color: colors.primaryText, fontWeight: "700" },
});
