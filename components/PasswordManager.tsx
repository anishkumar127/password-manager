import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import CryptoJS from "crypto-js";

import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PasswordManager() {
  const [dataList, setDataList] = useState<
    { _id: string; title: string; encryptedData: string }[]
  >([]);
  const [title, setTitle] = useState("");
  const [data, setData] = useState("");
  const [decryptionKey, setDecryptionKey] = useState("");

  useEffect(() => {
    fetchData();
    checkDecryptionKey();
  }, []);

  async function saveKeyToLocalStorage(key: string) {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.setItem("decryption_key", key);
      } else {
        await SecureStore.setItemAsync("decryption_key", key);
      }
      setDecryptionKey(key);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }

  async function checkDecryptionKey() {
    try {
      let result;
      if (Platform.OS === "web") {
        result = await AsyncStorage.getItem("decryption_key");
      } else {
        result = await SecureStore.getItemAsync("decryption_key");
      }

      if (result) {
        setDecryptionKey(result);
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  }

  async function fetchData() {
    const response = await axios.get("http://192.168.240.217:5000/data");
    if (response && response?.data) {
      setDataList(response.data);
    }
  }

  async function saveData() {
    await axios.post("http://192.168.240.217:5000/save", { title, data });
    setTitle("");
    setData("");
    fetchData();
  }

  async function copyToClipboard(text: string) {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Text copied to clipboard!");
  }

  return (
    <ScrollView
      className="bg-gray-900"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
    >
      <View className="p-6">
        <Text className="text-2xl font-bold text-center text-white mb-6">
          🔒 Secure Password Manager
        </Text>

        <TextInput
          className="border border-gray-700 bg-gray-800 p-3 rounded-lg text-white mb-4"
          placeholder="Enter Title"
          placeholderTextColor="#bbb"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          className="border border-gray-700 bg-gray-800 p-3 rounded-lg text-white mb-4"
          placeholder="Enter Data"
          placeholderTextColor="#bbb"
          value={data}
          onChangeText={setData}
        />

        <TouchableOpacity
          className="bg-blue-600 p-3 rounded-lg"
          onPress={saveData}
        >
          <Text className="text-white text-center font-semibold">
            💾 Save Data
          </Text>
        </TouchableOpacity>

        <Text className="text-xl font-bold text-center text-white mt-6">
          📜 Stored Data
        </Text>

        <FlatList
          data={dataList}
          keyExtractor={(item) => item?._id}
          scrollEnabled={false} // Prevents nested scrolling issues
          renderItem={({ item }) => {
            let displayText = item?.encryptedData;
            if (decryptionKey) {
              try {
                displayText = CryptoJS.AES.decrypt(
                  item?.encryptedData,
                  decryptionKey,
                ).toString(CryptoJS.enc.Utf8);
              } catch (error) {}
            }

            return (
              <View className="p-4 bg-gray-800 rounded-lg mb-4">
                <Text className="text-white font-bold">{item?.title}</Text>
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
          onChangeText={saveKeyToLocalStorage}
        />
      </View>
    </ScrollView>
  );
}

