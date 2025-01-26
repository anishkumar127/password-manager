import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import axios from "axios";
import * as Clipboard from "expo-clipboard";
import CryptoJS from "crypto-js";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Feather";

const ListScreen = () => {
  const [dataList, setDataList] = useState<
    { _id: string; title: string; encryptedData: string }[]
  >([]);
  const [decryptionKey, setDecryptionKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copying, setCopying] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    checkDecryptionKey();
  }, []);

  async function fetchData() {
    setRefreshing(true);
    try {
      const response = await axios.get("http://192.168.240.217:5000/data");
      if (response?.data) {
        setDataList(response.data);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch data.");
    } finally {
      setRefreshing(false);
    }
  }

  async function copyToClipboard(text: string, id: string) {
    setCopying(id);
    await Clipboard.setStringAsync(text);
    Alert.alert("✅ Copied", "Text copied to clipboard!");
    setCopying(null);
  }

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

  return (
    <View className="flex-1 bg-gray-900 p-4">
      <Text className="text-2xl font-bold text-center text-white mt-6">
        📜 Stored Data
      </Text>

      {/* Decryption Key Input */}
      <View className="flex-row items-center border border-gray-700 bg-gray-800 p-3 rounded-lg mt-6">
        <TextInput
          className="text-white flex-1"
          placeholder="Enter Decryption Key"
          placeholderTextColor="#bbb"
          value={decryptionKey}
          onChangeText={saveKeyToLocalStorage}
          secureTextEntry={!showKey}
        />
        <TouchableOpacity onPress={() => setShowKey(!showKey)}>
          <Icon name={showKey ? "eye" : "eye-off"} size={20} color="#bbb" />
        </TouchableOpacity>
      </View>

      {/* Data List */}
      <FlatList
        data={dataList}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
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
            <View className="p-4 bg-gray-800 rounded-lg mb-4 shadow-lg border border-gray-700">
              <Text className="text-white font-bold text-lg">{item.title}</Text>
              <Text className="text-gray-300 mt-2">
                {displayText ? displayText : "🔒 Encrypted"}
              </Text>

              {/* Copy Button */}
              <TouchableOpacity
                className="bg-green-500 p-3 rounded-lg mt-3 flex-row items-center justify-center"
                onPress={() => copyToClipboard(displayText, item._id)}
                disabled={copying === item._id}
              >
                {copying === item._id ? (
                  <Icon name="loader" size={20} color="white" />
                ) : (
                  <Icon name="copy" size={20} color="white" className="mr-2" />
                )}
                <Text className="text-white text-center font-semibold ml-2">
                  {copying === item._id ? "Copying..." : ""}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
};

export default ListScreen;
