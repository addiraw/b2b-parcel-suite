import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import AuthScreen from "../screens/AuthScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ParcelDetailScreen from "../screens/ParcelDetailScreen";
import ParcelsScreen from "../screens/ParcelsScreen";
import ScanScreen from "../screens/ScanScreen";
import SettingsScreen from "../screens/SettingsScreen";

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  ParcelDetail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.card,
    primary: colors.primary,
    text: colors.text,
    border: colors.border,
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Parcels"
        component={ParcelsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="qr-code-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: colors.bg } }}>
        {user == null ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="ParcelDetail"
              component={ParcelDetailScreen}
              options={{ title: "Parcel details", headerBackTitle: "Back" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" },
});
