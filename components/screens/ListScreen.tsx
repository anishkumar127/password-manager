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
  Modal,
  useColorScheme,
} from "react-native";
import axios from "axios";
import * as Clipboard from "expo-clipboard";
import CryptoJS from "crypto-js";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Feather";

const ListScreen = () => {
  const colorScheme = useColorScheme(); // 🔥 Detects system theme

  const [dataList, setDataList] = useState<
    { _id: string; title: string; encryptedData: string }[]
  >([]);
  const [decryptionKey, setDecryptionKey] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [copying, setCopying] = useState<string | null>(null);

  // 🔓 Per-item decryption modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [customKey, setCustomKey] = useState("");

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

  function openDecryptionModal(itemId: string, title: string) {
    setSelectedItem({ id: itemId, title });
    setCustomKey("");
    setModalVisible(true);
  }

  function decryptData(encryptedData: string, key: string) {
    try {
      return CryptoJS.AES.decrypt(encryptedData, key).toString(
        CryptoJS.enc.Utf8,
      );
    } catch (error) {
      return "🔒 Encrypted";
    }
  }

  return (
    <View
      className={`flex-1 ${colorScheme === "dark" ? "bg-gray-900" : "bg-gray-100"} p-4`}
    >
      <Text
        className={`text-3xl font-bold text-center ${colorScheme === "dark" ? "text-white" : "text-black"} mt-6`}
      >
        🔐 Secure Vault
      </Text>

      {/* Decryption Key Input */}
      <View
        className={`flex-row items-center border ${colorScheme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-white"} p-3 rounded-lg mt-6`}
      >
        <TextInput
          className={`flex-1 ${colorScheme === "dark" ? "text-white" : "text-black"}`}
          placeholder="Enter Global Decryption Key"
          placeholderTextColor={colorScheme === "dark" ? "#bbb" : "#555"}
          value={decryptionKey}
          onChangeText={saveKeyToLocalStorage}
          secureTextEntry={true}
        />
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
          let decryptedText = decryptData(item.encryptedData, decryptionKey);

          return (
            <View
              className={`p-4 rounded-lg mb-4 shadow-lg border ${colorScheme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}
            >
              {/* Title with Unlock Icon */}
              <View className="flex-row justify-between items-center">
                <Text
                  className={`${colorScheme === "dark" ? "text-white" : "text-black"} font-bold text-lg`}
                >
                  {item.title}
                </Text>
                <TouchableOpacity
                  onPress={() => openDecryptionModal(item._id, item.title)}
                >
                  <Icon
                    name="unlock"
                    size={22}
                    color={colorScheme === "dark" ? "white" : "black"}
                  />
                </TouchableOpacity>
              </View>

              {/* Encrypted/Decrypted Text */}
              <Text
                className={`${colorScheme === "dark" ? "text-gray-300" : "text-gray-700"} mt-2`}
              >
                {decryptedText ? decryptedText : "🔒 Encrypted"}
              </Text>

              {/* Copy Button - Full Width */}
              <TouchableOpacity
                className="bg-green-500 p-3 rounded-lg mt-3 flex-row items-center justify-center w-full"
                onPress={() => copyToClipboard(decryptedText, item._id)}
                disabled={copying === item._id}
              >
                {copying === item._id ? (
                  <Icon name="loader" size={20} color="white" />
                ) : (
                  <Icon name="copy" size={20} color="white" className="mr-2" />
                )}
                <Text className="text-white text-center font-semibold ml-2">
                  {copying === item._id ? "Copying..." : "Copy"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Decryption Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-80 shadow-lg">
            <Text className="text-lg font-bold mb-4">
              Decrypt "{selectedItem?.title}"
            </Text>
            <TextInput
              className="border border-gray-300 p-3 rounded-lg w-full mb-4"
              placeholder="Enter Key"
              value={customKey}
              onChangeText={setCustomKey}
              secureTextEntry={true}
            />
            <TouchableOpacity
              className="bg-blue-600 p-3 rounded-lg"
              onPress={() => {
                let decrypted = decryptData(
                  dataList.find((item) => item._id === selectedItem?.id)
                    ?.encryptedData || "",
                  customKey,
                );
                Alert.alert(
                  "Decrypted Data",
                  decrypted || "🔒 Unable to decrypt",
                );
                setModalVisible(false);
              }}
            >
              <Text className="text-white text-center font-semibold">
                Decrypt
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ListScreen;
