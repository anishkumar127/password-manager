import Button from "@/components/ui/Button";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import * as XLSX from "xlsx";
import Card from "../ui/Card";
import Input from "../ui/Input";
import { PROD_URL } from "@/utils/constants";
import { useFocusEffect } from "expo-router";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/utils/toastConfig";
import { showToast } from "@/utils/toastService";
import CryptoJS from "crypto-js";

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
      const encryptedData = CryptoJS.AES.encrypt(
        data,
        encryptionKey,
      ).toString();
      await axios.post(`${PROD_URL}/save`, {
        title,
        data: encryptedData,
      });

      setTitle("");
      setData("");
      setEncryptionKey("");

      showToast(
        "success",
        "✅ Success!",
        "Your data has been securely stored.",
      );
    } catch (error) {
      showToast("error", "❌ Error!", "Failed to save data. Try again.");
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

            const encryptedData = CryptoJS.AES.encrypt(
              data,
              encryptionKey,
            ).toString();
            return { title, data: encryptedData };
          })
          .filter(Boolean); // Remove invalid rows

        setErrors(validationErrors);

        if (validationErrors.length > 0) {
          Alert.alert(
            "⚠️ Warning",
            `Some rows have errors. Check the list below.`,
          );
        } else {
          showToast(
            "success",
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
      await axios.post(`${PROD_URL}/bulk-save`, {
        records: bulkData,
      });

      setBulkData([]);
      setIsBulkUpload(false);
      showToast("success", "✅ Success", "Bulk data uploaded successfully!");
    } catch (error) {
      showToast("error", "❌ Error", "Failed to upload bulk data.");
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

  useEffect(() => {
    setLoading(false);
    setBulkLoading(false);
  }, [refreshing]);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBackgroundColor(
        colorScheme === "dark" ? "#252525" : "#F9F9F9",
      );
      StatusBar.setBarStyle(
        colorScheme === "light" ? "dark-content" : "light-content",
      );
    }, []),
  );
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 0,
        backgroundColor: isDarkMode ? "#0D0D0D" : "#F9F9F9", // 🌙 Dark mode softer background
      }}
    >
      <StatusBar
        animated={true}
        barStyle={colorScheme === "light" ? "dark-content" : "light-content"}
        showHideTransition={"fade"}
        backgroundColor={colorScheme === "dark" ? "#252525" : "#F9F9F9"}
      />
      {/* Secure Password Manager Card */}
      <Card
        className={`w-full max-w-full p-3 h-full border-0 ${
          isDarkMode
            ? "bg-[#252525] border-[#333333]" // 🌙 Dark mode: softer black, subtle border
            : "bg-[#F9F9F9] border-gray-300"
        }`}
      >
        {/* Header */}
        <Text
          className={`text-2xl font-bold mb-2 text-center ${
            isDarkMode ? "text-[#E0E0E0]" : "text-black"
          }`}
        >
          <Icon
            name="lock"
            size={24}
            color={isDarkMode ? "#E0E0E0" : "black"}
          />{" "}
          Secure Password Manager
        </Text>
        <Text
          className={`text-center px-2 mb-4 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          A zero-knowledge password manager that encrypts your data locally.
          Your encryption key never leaves your device.
        </Text>

        {/* Encryption Security Notice */}
        <View
          className={`p-3 rounded-lg mb-4 flex-row items-center ${
            isDarkMode
              ? "bg-[#333333] border-[#444444]"
              : "bg-gray-100 border-gray-300"
          }`}
        >
          <Icon
            name="info"
            size={18}
            color={isDarkMode ? "#E0E0E0" : "black"}
          />
          <Text
            className={`text-sm ml-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Your data is encrypted locally before being stored. We cannot access
            or recover your data without your encryption key.
          </Text>
        </View>

        {/* Input Fields */}
        <Input
          placeholder="Enter Title"
          value={title}
          onChangeText={setTitle}
          style={{
            backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
            color: isDarkMode ? "#EDEDED" : "#000",
            borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#CCC",
            borderWidth: 1,
            padding: 12,
            borderRadius: 8,
            width: "100%",
            marginBottom: 10,
          }}
        />
        <Input
          placeholder="Enter Encryption Key"
          value={encryptionKey}
          onChangeText={setEncryptionKey}
          secureTextEntry={true}
          style={{
            backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
            color: isDarkMode ? "#EDEDED" : "#000",
            borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#CCC",
            borderWidth: 1,
            padding: 12,
            borderRadius: 8,
            width: "100%",
            marginBottom: 10,
          }}
        />

        {/* Encryption Key Warning */}
        <View
          className={`p-3 rounded-lg mt-2 mb-2 w-full ${
            isDarkMode
              ? "bg-[#522020] border-[#752525]"
              : "bg-red-100 border-red-400"
          }`}
        >
          <View className="flex-row items-center">
            <Icon
              name="alert-triangle"
              size={18}
              color={isDarkMode ? "#FF6B6B" : "red"}
            />
            <Text
              className={`text-sm ml-2 flex-1 ${
                isDarkMode ? "text-[#FFBABA]" : "text-red-600"
              }`}
            >
              Remember your encryption key! Without it, your data cannot be
              decrypted.
            </Text>
          </View>
        </View>

        <Input
          placeholder="Enter Data"
          value={data}
          onChangeText={setData}
          multiline={true}
          style={{
            backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
            color: isDarkMode ? "#EDEDED" : "#000",
            borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#CCC",
            borderWidth: 1,
            padding: 12,
            borderRadius: 8,
            width: "100%",
            marginBottom: 10,
          }}
        />

        {/* Save Entry Button */}

        <Button
          title={loading ? "Saving..." : "Save Entry"}
          onPress={saveData}
          loading={loading}
          disable={isBulkUpload ? true : false}
          icon="save"
        />
        {/* Bulk Upload Button */}

        <Button
          title={loading ? "Uploading..." : "Bulk Excel"}
          onPress={pickExcelFile}
          disable={isBulkUpload ? true : false}
          icon="upload"
        />
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
              title={bulkLoading ? "Uploading..." : "Bulk Save"}
              onPress={bulkUpload}
              loading={bulkLoading}
              icon="save"
            />
          </View>
        )}
        {/* How It Works Section */}
        <View
          className={`p-4 rounded-lg mt-6 ${
            isDarkMode
              ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]"
              : "bg-gray-100 border-gray-300"
          }`}
        >
          <Text
            className={`font-semibold mb-2 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            How it works:
          </Text>
          {[
            "Your data is encrypted locally using your encryption key.",
            "The encryption key never leaves your device.",
            "Store individual entries or bulk upload via Excel.",
            "We cannot read your encrypted data.",
          ].map((item, index) => (
            <View key={index} className="flex-row items-start mb-2">
              <Text
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                • {item}
              </Text>
            </View>
          ))}
        </View>
      </Card>
      <Toast config={toastConfig} />
    </ScrollView>
  );
}
