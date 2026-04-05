import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ParcelFlow error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.box}>
          <Text style={styles.title}>App error</Text>
          <Text style={styles.sub}>
            Expo Go also shows a generic “Something went wrong” for crashes. This screen shows the
            real error:
          </Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.mono}>{this.state.error.message}</Text>
            {this.state.error.stack ? (
              <Text style={styles.stack}>{this.state.error.stack}</Text>
            ) : null}
          </ScrollView>
          <Pressable
            style={styles.btn}
            onPress={() => this.setState({ error: null })}
          >
            <Text style={styles.btnText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 20,
    paddingTop: 56,
    justifyContent: "center",
  },
  title: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 8 },
  sub: { color: colors.muted, marginBottom: 16, lineHeight: 20 },
  scroll: { maxHeight: "50%", marginBottom: 20 },
  mono: { color: colors.danger, fontSize: 14 },
  stack: { color: colors.muted, fontSize: 11, marginTop: 12, fontFamily: "monospace" },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: colors.primaryText, fontWeight: "700" },
});
