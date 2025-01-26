import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import axios from "axios";
import CryptoJS from "crypto-js";
import * as SecureStore from "expo-secure-store";
import * as Clipboard from "expo-clipboard";

export default function ListScreen() {
  const [dataList, setDataList] = useState([]);
  const [decryptionKey, setDecryptionKey] = useState("");

  useEffect(() => {
    fetchData();
    checkDecryptionKey();
  }, []);

  async function fetchData() {
    const response = await axios.get("http://localhost:5000/data");
    setDataList(response.data);
  }

  async function checkDecryptionKey() {
    try {
      const key = await SecureStore.getItemAsync("decryption_key");
      setDecryptionKey(key);
    } catch (error) {
      console.error("Error retrieving decryption key:", error);
    }
  }

  async function copyToClipboard(text: string) {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Text copied to clipboard!");
  }

  return (
    <View className="flex-1 p-6 bg-gray-900">
      <Text className="text-2xl font-bold text-white text-center mb-6">
        📜 Stored Passwords
      </Text>

      <FlatList
        data={dataList}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          let displayText = item.encryptedData;
          if (decryptionKey) {
            try {
              displayText = CryptoJS.AES.decrypt(
                item.encryptedData,
                decryptionKey,
              ).toString(CryptoJS.enc.Utf8);
            } catch (error) {}
          }

          return (
            <View className="p-4 bg-gray-800 rounded-lg mb-4">
              <Text className="text-white font-bold">{item.title}</Text>
              <Text className="text-gray-300">
                {displayText ? displayText : "🔒 Encrypted"}
              </Text>

              <TouchableOpacity
                className="bg-green-500 p-2 rounded-lg mt-3"
                onPress={() => copyToClipboard(displayText)}
              >
                <Text className="text-white text-center font-semibold">
                  📋 Copy
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TextInput
        className="border border-gray-700 bg-gray-800 p-3 rounded-lg text-white mt-6"
        placeholder="Enter Decryption Key"
        placeholderTextColor="#bbb"
        onChangeText={setDecryptionKey}
      />
    </View>
  );
}
