import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("agent@acme.com");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    setError(null);
    setPending(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }
        await register(email.trim(), password, name.trim() || email.split("@")[0] || "Agent");
      }
    } catch {
      setError(
        mode === "login"
          ? "Invalid credentials. Try agent@acme.com / password123"
          : "Could not sign up (email taken or server unreachable).",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>ParcelFlow</Text>
          <Text style={styles.sub}>B2B parcel tracking</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabs}>
            <Pressable
              onPress={() => setMode("login")}
              style={[styles.tab, mode === "login" && styles.tabActive]}
            >
              <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>Log in</Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("register")}
              style={[styles.tab, mode === "register" && styles.tabActive]}
            >
              <Text style={[styles.tabText, mode === "register" && styles.tabTextActive]}>
                Sign up
              </Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {mode === "register" ? (
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === "login" ? "password" : "password-new"}
          />

          <Pressable
            style={[styles.button, pending && styles.buttonDisabled]}
            onPress={() => void submit()}
            disabled={pending}
          >
            {pending ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.buttonText}>{mode === "login" ? "Sign in" : "Create account"}</Text>
            )}
          </Pressable>

          <Text style={styles.hint}>
            Sign up creates an agent account. Start the web app ({Platform.OS === "android" ? "10.0.2.2:3000" : "localhost:3000"}) first.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  header: { marginBottom: 28, alignItems: "center" },
  logo: { fontSize: 28, fontWeight: "700", color: colors.text },
  sub: { marginTop: 6, color: colors.muted, fontSize: 15 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabs: { flexDirection: "row", marginBottom: 20, gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.bg,
    alignItems: "center",
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.muted, fontWeight: "600" },
  tabTextActive: { color: colors.primaryText },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: "600" },
  error: { color: colors.danger, marginBottom: 12, textAlign: "center" },
  hint: { marginTop: 16, fontSize: 12, color: colors.muted, textAlign: "center", lineHeight: 18 },
});
