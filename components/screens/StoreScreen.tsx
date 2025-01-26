import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Card from "../ui/Card";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import * as XLSX from "xlsx";
import Icon from "react-native-vector-icons/Feather";

export default function StoreScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [title, setTitle] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [bulkData, setBulkData] = useState<any[]>([]);

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

  async function pickExcelFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
      });

      if (result.canceled || !result.assets) {
        return;
      }

      const fileUri = result.assets[0].uri;
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const parsedData = XLSX.utils.sheet_to_json(sheet);

        if (parsedData.length === 0) {
          Alert.alert(
            "❌ Error",
            "The file is empty or incorrectly formatted.",
          );
          return;
        }

        setBulkData(parsedData);
        Alert.alert("✅ Success", `Loaded ${parsedData.length} entries.`);
      };

      reader.readAsArrayBuffer(blob);
    } catch (error) {
      console.error("Error reading file:", error);
      Alert.alert("❌ Error", "Failed to process the file.");
    }
  }

  async function bulkUpload() {
    if (bulkData.length === 0) {
      Alert.alert("❌ No Data", "Please upload an Excel file first.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://192.168.240.217:5000/bulk-save", {
        records: bulkData,
      });

      setBulkData([]);
      Alert.alert("✅ Success", "Bulk data uploaded successfully!");
    } catch (error) {
      Alert.alert("❌ Error", "Failed to upload bulk data.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          minHeight: "100%",
          backgroundColor: isDarkMode ? "#1E1E1E" : "#F5F5F5",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Card
          className={`w-full max-w-md p-2 py-6 rounded-lg shadow-lg border ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-300"
          }`}
        >
          <Text
            className={`text-2xl font-bold text-center ${isDarkMode ? "text-white" : "text-black"} mb-6`}
          >
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

          {/* Bulk Upload */}
          <TouchableOpacity
            onPress={pickExcelFile}
            className="flex-row items-center justify-center mt-4"
          >
            <Icon
              name="upload"
              size={20}
              color={isDarkMode ? "white" : "black"}
            />
            <Text
              className={`${isDarkMode ? "text-white" : "text-black"} ml-2`}
            >
              Upload Excel File
            </Text>
          </TouchableOpacity>

          {bulkData.length > 0 && (
            <View className="mt-4">
              <Text
                className={`${isDarkMode ? "text-gray-300" : "text-gray-700"} text-center`}
              >
                Loaded {bulkData.length} entries
              </Text>
              <Button
                title="Bulk Upload"
                onPress={bulkUpload}
                loading={loading}
                icon="database"
              />
            </View>
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
