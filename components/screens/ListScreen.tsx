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
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [dataList, setDataList] = useState<
    { _id: string; title: string; encryptedData: string }[]
  >([]);
  const [decryptionKey, setDecryptionKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showKeyModel, setShowKeyModel] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copying, setCopying] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(dataList);

  // 🔓 Per-item decryption modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    title: string;
    encryptedData: string;
  } | null>(null);
  const [customKey, setCustomKey] = useState("");
  const [decryptedItemText, setDecryptedItemText] = useState("");

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
        setFilteredData(response.data);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch data.");
    } finally {
      setRefreshing(false);
    }
  }

  async function copyToClipboard(text: string) {
    await Clipboard.setStringAsync(text);
    Alert.alert("✅ Copied", "Text copied to clipboard!");
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
      console.error("Error saving key:", error);
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
      console.error("Error retrieving key:", error);
    }
  }

  function openDecryptionModal(item: {
    id: string;
    title: string;
    encryptedData: string;
  }) {
    setSelectedItem(item);
    setCustomKey("");
    setDecryptedItemText("");
    setModalVisible(true);
  }

  function decryptData(encryptedData: string, key: string) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key).toString(
        CryptoJS.enc.Utf8,
      );
      return decrypted || "🔒 Encrypted";
    } catch (error) {
      return "🔒 Encrypted";
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(dataList);
    } else {
      setFilteredData(
        dataList.filter((item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    }
  }, [searchQuery, dataList]);

  return (
    <View
      className={`flex-1 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"} p-4`}
    >
      <Text
        className={`text-3xl font-bold text-center ${isDarkMode ? "text-white" : "text-black"} mt-6`}
      >
        🔐 Secure Vault
      </Text>

      {/* Search Input */}
      <View
        className={`flex-row items-center border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"} p-3 rounded-lg mt-4`}
      >
        <TextInput
          className={`flex-1 ${isDarkMode ? "text-white" : "text-black"}`}
          placeholder="Search..."
          placeholderTextColor={isDarkMode ? "#bbb" : "#555"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Icon
              name="x-circle"
              size={20}
              color={isDarkMode ? "#bbb" : "#777"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Global Decryption Key Input */}
      <View
        className={`flex-row items-center border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"} p-3 rounded-lg mt-4`}
      >
        <TextInput
          className={`flex-1 ${isDarkMode ? "text-white" : "text-black"}`}
          placeholder="Enter Global Decryption Key"
          placeholderTextColor={isDarkMode ? "#bbb" : "#555"}
          value={decryptionKey}
          onChangeText={saveKeyToLocalStorage}
          secureTextEntry={!showKey}
        />
        <TouchableOpacity onPress={() => setShowKey(!showKey)}>
          <Icon
            name={showKey ? "eye" : "eye-off"}
            size={20}
            color={isDarkMode ? "#bbb" : "#777"}
          />
        </TouchableOpacity>
      </View>

      {/* List Items */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          let decryptedText = decryptData(item.encryptedData, decryptionKey);
          const isDecrypted = decryptedText !== "🔒 Encrypted";

          return (
            <View
              className={`p-4 rounded-lg mb-4 shadow-lg border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}
            >
              <View className="flex-row justify-between items-center">
                <Text
                  className={`${isDarkMode ? "text-white" : "text-black"} font-bold text-lg`}
                >
                  {item.title}
                </Text>
                <TouchableOpacity
                  onPress={() => !isDecrypted && openDecryptionModal(item)}
                >
                  <Icon
                    name={isDecrypted ? "unlock" : "lock"}
                    size={22}
                    color={
                      isDecrypted ? (isDarkMode ? "white" : "black") : "yellow"
                    }
                  />
                </TouchableOpacity>
              </View>

              <Text
                className={`${isDarkMode ? "text-gray-300" : "text-gray-700"} mt-2 overflow-hidden`}
                numberOfLines={3}
              >
                {decryptedText}
              </Text>

              <TouchableOpacity
                className="bg-green-500 p-3 rounded-lg mt-3 flex-row items-center justify-center w-full"
                onPress={() => copyToClipboard(decryptedText)}
              >
                <Icon name="copy" size={20} color="white" />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Decryption Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className={`p-6 rounded-lg w-80 shadow-lg ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
          >
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="absolute right-3 top-3"
            >
              <Icon name="x" size={24} color={isDarkMode ? "white" : "black"} />
            </TouchableOpacity>
            <Text
              className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-black"}`}
            >
              Decrypt "{selectedItem?.title}"
            </Text>

            <View
              className={`flex-row items-center border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"} p-3 rounded-lg mb-4`}
            >
              <TextInput
                className={`flex-1 ${isDarkMode ? "text-white" : "text-black"}`}
                placeholder="Enter Key"
                placeholderTextColor={isDarkMode ? "#bbb" : "#555"}
                onChangeText={setCustomKey}
                secureTextEntry={!showKeyModel}
              />
              <TouchableOpacity onPress={() => setShowKeyModel(!showKeyModel)}>
                <Icon
                  name={showKeyModel ? "eye" : "eye-off"}
                  size={20}
                  color={isDarkMode ? "#bbb" : "#777"}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="bg-blue-600 p-3 rounded-lg"
              onPress={() =>
                setDecryptedItemText(
                  decryptData(selectedItem?.encryptedData || "", customKey),
                )
              }
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
