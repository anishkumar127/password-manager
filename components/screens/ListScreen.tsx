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

  const [dataList, setDataList] = useState<
    { _id: string; title: string; encryptedData: string }[]
  >([]);
  const [decryptionKey, setDecryptionKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copying, setCopying] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(dataList);

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
      className={`flex-1 ${colorScheme === "dark" ? "bg-gray-900" : "bg-gray-100"} p-4`}
    >
      <Text
        className={`text-3xl font-bold text-center ${colorScheme === "dark" ? "text-white" : "text-black"} mt-6`}
      >
        🔐 Secure Vault
      </Text>

      {/* Search Input */}
      <View className="flex-row items-center border border-gray-700 bg-gray-800 p-3 rounded-lg mt-4">
        <TextInput
          className="flex-1 text-white"
          placeholder="Search..."
          placeholderTextColor="#bbb"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Icon name="x-circle" size={20} color="#bbb" />
          </TouchableOpacity>
        )}
      </View>

      {/* Global Decryption Key Input */}
      <View className="flex-row items-center border border-gray-700 bg-gray-800 p-3 rounded-lg mt-4">
        <TextInput
          className="flex-1 text-white"
          placeholder="Enter Global Decryption Key"
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
            <View className="p-4 rounded-lg mb-4 shadow-lg border border-gray-700 bg-gray-800">
              <View className="flex-row justify-between items-center">
                <Text className="text-white font-bold text-lg">
                  {item.title}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    !isDecrypted && openDecryptionModal(item._id, item.title)
                  }
                >
                  <Icon
                    name={isDecrypted ? "unlock" : "lock"}
                    size={22}
                    color="white"
                  />
                </TouchableOpacity>
              </View>

              <Text
                className="text-gray-300 mt-2 overflow-hidden"
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
          <View className="bg-white p-6 rounded-lg w-80 shadow-lg">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="absolute right-3 top-3"
            >
              <Icon name="x" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-lg font-bold mb-4">
              Decrypt "{selectedItem?.title}"
            </Text>
            <TextInput
              className="border p-3 rounded-lg w-full mb-4"
              placeholder="Enter Key"
              secureTextEntry={true}
            />
            <TouchableOpacity className="bg-blue-600 p-3 rounded-lg">
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
