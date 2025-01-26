import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import CryptoJS from "crypto-js";

import * as Clipboard from "expo-clipboard";

import AsyncStorage from "@react-native-async-storage/async-storage";

const PasswordManager = () => {
  const [dataList, setDataList] = useState([]);
  const [title, setTitle] = useState("");
  const [data, setData] = useState("");
  const [decryptionKey, setDecryptionKey] = useState("");

  useEffect(() => {
    fetchData();
    checkDecryptionKey();
  }, []);

  // Save decryption key
  async function saveKeyToLocalStorage(key: string) {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.setItem("decryption_key", key);
      } else {
        // mobile
        await SecureStore.setItemAsync("decryption_key", key);
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }

  // Retrieve decryption key
  async function checkDecryptionKey() {
    try {
      if (Platform.OS === "web") {
        const result = await AsyncStorage.getItem("decryption_key");
        if (result) {
          setDecryptionKey(result);
          alert("🔐 Here's your value 🔐 \n" + result);
        } else {
          alert("No values stored under that key.");
        }
      } else {
        const result = await SecureStore.getItemAsync("decryption_key");
        if (result) {
          setDecryptionKey(result);
          alert("🔐 Here's your value 🔐 \n" + result);
        } else {
          alert("No values stored under that key.");
        }
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
    }
  }

  async function fetchData() {
    const response = await axios.get("http://localhost:5000/data");
    setDataList(response.data);
  }

  async function saveData() {
    await axios.post("http://localhost:5000/save", { title, data });
    setTitle("");
    setData("");
    fetchData();
  }

  async function copyToClipboard(text) {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Text copied to clipboard!");
  }

  return (
    <View className="flex-1 p-4 bg-gray-100">
      <Text className="text-lg font-bold text-center mb-4">
        Secure Data Storage
      </Text>

      <TextInput
        className="border p-2 rounded mb-2"
        placeholder="Enter Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        className="border p-2 rounded mb-2"
        placeholder="Enter Data"
        value={data}
        onChangeText={setData}
      />

      <TouchableOpacity className="bg-blue-500 p-2 rounded" onPress={saveData}>
        <Text className="text-white text-center">Save Data</Text>
      </TouchableOpacity>

      <Text className="text-lg font-bold text-center mt-4">Stored Data</Text>

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
            <View className="p-2 border mb-2 rounded">
              <Text className="font-bold">{item.title}</Text>
              <Text>{displayText ? displayText : "🔒 Encrypted"}</Text>

              <TouchableOpacity
                className="bg-green-500 p-2 rounded mt-2"
                onPress={() => copyToClipboard(displayText)}
              >
                <Text className="text-white text-center">Copy</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TextInput
        className="border p-2 rounded mt-4"
        placeholder="Enter Decryption Key"
        onChangeText={saveKeyToLocalStorage}
      />
    </View>
  );
};
export default PasswordManager;

