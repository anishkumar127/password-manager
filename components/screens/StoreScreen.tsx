import React, { useCallback, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
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

  const [bulkLoading, setBulkLoading] = useState<boolean>(false);
  const [bulkData, setBulkData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]); // Track errors

  const [isBulkUpload, setIsBulkUpload] = useState<boolean>(false);

  const [refreshing, setRefreshing] = useState<boolean>(false); // ⬅️ Swipe to Refresh State

  const REQUIRED_COLUMNS = ["Title", "Data", "EncryptionKey"];

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
        const validationErrors: string[] = [];

        if (parsedData.length === 0) {
          Alert.alert(
            "❌ Error",
            "The file is empty or incorrectly formatted.",
          );
          return;
        }

        // Validate Columns
        // @ts-ignore
        const fileColumns = Object.keys(parsedData[0]);
        const missingColumns = REQUIRED_COLUMNS.filter(
          (col) => !fileColumns.includes(col),
        );

        if (missingColumns.length > 0) {
          Alert.alert(
            "❌ Column Mismatch",
            `Missing required columns: ${missingColumns.join(", ")}`,
          );
          return;
        }

        // Validate Each Row
        const validData = parsedData
          .map((row: any, index: number) => {
            const title = row.Title ? String(row.Title).trim() : "";
            const data = row.Data ? String(row.Data).trim() : "";
            const encryptionKey = row.EncryptionKey
              ? String(row.EncryptionKey).trim()
              : "";

            if (!title || !data || !encryptionKey) {
              validationErrors.push(
                `❌ Row ${index + 1}: Missing required fields`,
              );
              return null;
            }

            return { title, data, encryptionKey };
          })
          .filter(Boolean); // Remove invalid rows

        setErrors(validationErrors);

        if (validationErrors.length > 0) {
          Alert.alert(
            "⚠️ Warning",
            `Some rows have errors. Check the list below.`,
          );
        } else {
          Alert.alert(
            "✅ Success",
            `Loaded ${validData.length} valid entries.`,
          );
        }

        setBulkData(validData);
        setIsBulkUpload(true);
      };

      reader.readAsArrayBuffer(blob);
    } catch (error) {
      console.error("Error reading file:", error);
      Alert.alert("❌ Error", "Failed to process the file.");
    }
  }

  async function bulkUpload() {
    if (bulkData.length === 0) {
      Alert.alert("❌ No Data", "Please upload a valid Excel file first.");
      return;
    }

    setBulkLoading(true);
    try {
      await axios.post("http://192.168.240.217:5000/bulk-save", {
        records: bulkData,
      });

      setBulkData([]);
      setIsBulkUpload(false);
      Alert.alert("✅ Success", "Bulk data uploaded successfully!");
    } catch (error) {
      Alert.alert("❌ Error", "Failed to upload bulk data.");
    } finally {
      setBulkLoading(false);
    }
  }
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTitle("");
    setData("");
    setEncryptionKey("");
    setBulkData([]);
    setErrors([]);
    setIsBulkUpload(false);
    setRefreshing(false);
  }, []);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
            disable={isBulkUpload ? true : false}
            icon="save-outline"
          />

          {/* Bulk Upload */}
          <TouchableOpacity
            onPress={pickExcelFile}
            className="bg-blue-600 p-3 rounded-lg flex-row justify-center items-center mt-4"
          >
            <Icon
              name="upload"
              size={20}
              color={isDarkMode ? "white" : "white"}
            />
            <Text
              className={`${isDarkMode ? "text-white" : "text-white"} ml-2 font-semibold`}
            >
              Upload Excel File
            </Text>
          </TouchableOpacity>

          {errors.length > 0 && (
            <View className="mt-4">
              <Text
                className={`${isDarkMode ? "text-red-400" : "text-red-600"} text-center`}
              >
                ⚠️ Errors Found:
              </Text>
              {errors.slice(0, 5).map((error, index) => (
                <Text key={index} className="text-red-400 text-sm text-center">
                  {error}
                </Text>
              ))}
            </View>
          )}

          {bulkData.length > 0 && (
            <View className="mt-4">
              <Text
                className={`${isDarkMode ? "text-gray-300" : "text-gray-700"} text-center mb-2`}
              >
                Loaded {bulkData.length} valid entries
              </Text>
              <Button
                title="Bulk Upload"
                onPress={bulkUpload}
                loading={bulkLoading}
                icon="save-outline"
              />
            </View>
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
