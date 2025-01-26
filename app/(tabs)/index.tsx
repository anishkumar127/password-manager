import { StyleSheet, Text, View } from "react-native";
import React from "react";
import PasswordManager from "@/components/PasswordManager";
import MainScreen from "@/components/screens/MainScreen";
import Anish from "@/components/screens/Anish";

const app = () => {
  return (
    <View>
      <PasswordManager />
      {/* <MainScreen /> */}
      {/* <Anish /> */}
    </View>
  );
};

export default app;

const styles = StyleSheet.create({});
