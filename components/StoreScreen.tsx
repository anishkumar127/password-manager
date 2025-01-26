import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import axios from "axios";

export default function StoreScreen() {
  const [title, setTitle] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function saveData() {
    if (!title || !data || !encryptionKey) {
      Alert.alert(
        "❌ Missing Fields",
        "Please enter title, data, and encryption key.",
      );
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://192.168.240.217:5000/save", {
        title,
        data,
        encryptionKey,
      });

      setTitle("");
      setData("");
      setEncryptionKey("");

      Alert.alert("✅ Success", "Your data has been securely stored.");
    } catch (error) {
      Alert.alert("❌ Error", "Failed to save data. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // style={{ flex: 1 }}
      className="bg-gray-900"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          minHeight: "100%",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Card className="w-full max-w-md p-2 py-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          {/* Title */}
          <Text className="text-2xl font-bold text-center text-white mb-6">
            🔒 Secure Password Manager
          </Text>

          {/* Inputs */}
          <Input
            placeholder="Enter Title"
            value={title}
            onChangeText={setTitle}
          />

          <Input
            placeholder="Enter Encryption Key"
            value={encryptionKey}
            onChangeText={setEncryptionKey}
            secureTextEntry={true}
          />

          <Input
            placeholder="Enter Data"
            value={data}
            onChangeText={setData}
            multiline={true}
          />

          {/* Save Button */}
          <Button
            title={loading ? "Saving..." : "Save Data"}
            onPress={saveData}
            loading={loading}
            icon="save-outline"
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
