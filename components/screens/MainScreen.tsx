import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import StoreScreen from "./StoreScreen";
import ListScreen from "./ListScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function MainScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Store") {
            iconName = "save-outline";
          } else if (route.name === "List") {
            iconName = "list-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: "#111" },
      })}
    >
      <Tab.Screen name="Store" component={StoreScreen} />
      <Tab.Screen name="List" component={ListScreen} />
    </Tab.Navigator>
  );
}
