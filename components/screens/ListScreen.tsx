import { PROD_URL } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import CryptoJS from "crypto-js";
import * as Clipboard from "expo-clipboard";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
const ListScreen = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [dataList, setDataList] = useState<
    {
      _id: string;
      title: string;
      encryptedData: string;
      isDecrypted: boolean;
    }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0)); // Animation for menu fade-in
  const [decryptionKey, setDecryptionKey] = useState(""); // Stores the key
  const [isKeyVisible, setIsKeyVisible] = useState(false); // Toggle key visibility
  // 🔓 Per-item decryption modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    _id: string;
    title: string;
    encryptedData: string;
  } | null>(null);
  const [customKey, setCustomKey] = useState("");
  const [decryptedItemText, setDecryptedItemText] = useState<string>("");
  const [whenKeyChange, setWhenKeyChange] = useState<boolean>(false);
  useEffect(() => {
    fetchData();
  }, [whenKeyChange]);

  async function fetchData() {
    setRefreshing(true);
    try {
      const response = await axios.get(`${PROD_URL}/data`);
      if (response?.data) {
        let result;
        if (Platform.OS === "web") {
          result = await AsyncStorage.getItem("decryption_key");
        } else {
          result = await SecureStore.getItemAsync("decryption_key");
        }
        if (result) {
          setDecryptionKey(result);
        }

        const dataGenerate = [];
        function Decryption(encryptedData: string, key: string) {
          try {
            if (!key) return "🔒 Encrypted";
            const bytes = CryptoJS.AES.decrypt(encryptedData, key);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            return decrypted ? decrypted : "🔒 Encrypted";
          } catch (error) {
            return "🔒 Encrypted";
          }
        }

        for (let i = 0; i < response?.data?.length; i++) {
          const isDecrypted =
            Decryption(response.data[i].encryptedData, result ?? "") ===
            "🔒 Encrypted"
              ? true
              : false;
          const obj = {
            _id: response?.data[i]?._id,
            title: response?.data[i]?.title,
            encryptedData: result
              ? Decryption(response.data[i].encryptedData, result)
              : "🔒 Encrypted",
            isDecrypted,
          };
          dataGenerate.push(obj);
        }
        setDataList(dataGenerate);
      }
    } catch (error) {
      alert("Error fetching data.");
    } finally {
      setRefreshing(false);
    }
  }

  async function copyToClipboard(text: string) {
    await Clipboard.setStringAsync(text);
    alert("✅ Copied to clipboard!");
  }

  const deletePassword = async (id: String) => {
    Alert.alert("success", "deleted");
    setWhenKeyChange(!whenKeyChange);
  };

  async function saveKeyToLocalStorage() {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.setItem("decryption_key", decryptionKey);

        Alert.alert("🔐 Decryption Key Saved: " + decryptionKey);
        setModalVisible(false);
      } else {
        await SecureStore.setItemAsync("decryption_key", decryptionKey);

        Alert.alert("🔐 Decryption Key Saved: " + decryptionKey);
        setModalVisible(false);
      }
      setDecryptionKey(decryptionKey);
      setWhenKeyChange(!whenKeyChange);
    } catch (error) {
      console.error("Error saving key:", error);
    }
  }

  // async function checkDecryptionKey() {
  //   try {
  //     let result;
  //     if (Platform.OS === "web") {
  //       result = await AsyncStorage.getItem("decryption_key");
  //     } else {
  //       result = await SecureStore.getItemAsync("decryption_key");
  //     }
  //     if (result) {
  //       setDecryptionKey(result);
  //     }
  //   } catch (error) {
  //     console.error("Error retrieving key:", error);
  //   }
  // }
  function openDecryptionModal(item: {
    _id: string;
    title: string;
    encryptedData: string;
    // isDecrypted:boolean;
  }) {
    setSelectedItem(item);
    setCustomKey("");
    setDecryptedItemText("");
    setModalVisible(true);
  }
  //
  // function decryptData(encryptedData: string, key: string) {
  //   try {
  //     if (!key) return Alert.alert("Error", "🔒 Encrypted (No Key)");
  //     const decrypted = CryptoJS.AES.decrypt(encryptedData, key).toString(
  //       CryptoJS.enc.Utf8,
  //     );
  //
  //     return decrypted || "🔒 Encrypted";
  //   } catch (error) {
  //     return "🔒 Encrypted";
  //   }
  // }
  //
  // useEffect(() => {
  //   if (searchQuery.trim() === "") {
  //     setFilteredData(dataList);
  //   } else {
  //     setFilteredData(
  //       dataList.filter((item) =>
  //         item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  //       ),
  //     );
  //   }
  // }, [searchQuery, dataList]);

  function toggleMenu() {
    if (menuVisible) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? "#0D0D0D" : "#F9F9F9",
        paddingHorizontal: 16,
        paddingTop: 40,
      }}
    >
      {/* Title & Settings */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon
            name="lock"
            size={28}
            color={isDarkMode ? "#FFFFFF" : "#000000"}
          />
          <Text
            style={{
              fontSize: 26,
              fontWeight: "bold",
              marginLeft: 10,
              width: "70%",
              color: isDarkMode ? "#FFFFFF" : "#000000",
            }}
          >
            Secure Vault
          </Text>
        </View>

        {/* Settings Icon */}
        <TouchableOpacity onPress={toggleMenu}>
          <Icon
            name="settings"
            size={28}
            color={isDarkMode ? "#FFFFFF" : "#000000"}
          />
        </TouchableOpacity>
      </View>
      {/* Search Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#F5F5F5",
          padding: 12,
          borderRadius: 12,
          marginBottom: 15,
        }}
      >
        <Icon name="search" size={18} color={isDarkMode ? "#BBBBBB" : "#777"} />
        <TextInput
          placeholder="Search vault..."
          placeholderTextColor={isDarkMode ? "#BBBBBB" : "#777"}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            flex: 1,
            color: isDarkMode ? "#FFFFFF" : "#000",
            marginLeft: 8,
            fontSize: 16,
          }}
        />
      </View>
      {/* List Items */}
      <FlatList
        data={dataList.filter((item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()),
        )}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: isDarkMode ? "#1A1A1A" : "#FFFFFF",
              padding: 16,
              borderRadius: 16,
              marginBottom: 10,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              shadowColor: isDarkMode ? "rgba(0,0,0,0.3)" : "#CCC",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4, // For Android shadow
            }}
          >
            {/* Title & Description */}
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: isDarkMode ? "#FFFFFF" : "#000000",
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: isDarkMode ? "#BBBBBB" : "#666",
                  marginTop: 2,
                  // wordWrap: "wrap",
                }}
                className="max-w-xs"
                ellipsizeMode="tail"
                numberOfLines={1}
              >
                {item.encryptedData || "No description"}
              </Text>
            </View>

            {/* Actions */}
            <View className="flex-row gap-4 justify-center items-center">
              <TouchableOpacity className="mr-2">
                {item?.isDecrypted ? (
                  <Icon
                    name="lock"
                    size={20}
                    color={isDarkMode ? "#BBBBBB" : "#777"}
                    onPress={() => openDecryptionModal(item)}
                  />
                ) : (
                  <Icon
                    name="unlock"
                    size={20}
                    color={isDarkMode ? "#BBBBBB" : "#777"}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-2"
                onPress={() => copyToClipboard(item.encryptedData)}
              >
                <Icon
                  name="copy"
                  size={20}
                  color={isDarkMode ? "#BBBBBB" : "#777"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                className="ml-2"
                onPress={() => deletePassword(item._id)}
              >
                <Icon
                  name="delete"
                  size={20}
                  color={isDarkMode ? "#BBBBBB" : "#777"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      {/* Modern Dropdown Menu */}
      {menuVisible && (
        <Animated.View
          style={{
            position: "absolute",
            top: 80,
            right: 16,
            backgroundColor: isDarkMode ? "#212121" : "#FFF",
            paddingVertical: 12,
            width: 200,
            borderRadius: 12,
            shadowColor: isDarkMode ? "#000" : "#CCC",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 5,
            opacity: fadeAnim,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 12,
            }}
            onPress={() => {
              setModalVisible(true);
              toggleMenu();
            }}
          >
            <Icon
              name="key"
              size={20}
              color={isDarkMode ? "#FFD700" : "#FF9500"}
            />
            <Text
              style={{
                marginLeft: 10,
                color: isDarkMode ? "#FFFFFF" : "#000000",
              }}
            >
              View Decryption Key
            </Text>
          </TouchableOpacity>

          <View
            style={{
              height: 1,
              backgroundColor: isDarkMode ? "rgba(255,255,255,0.2)" : "#EEE",
              marginHorizontal: 10,
            }}
          />

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 12,
            }}
            onPress={() => {
              alert("📥 Exporting to Excel...");
              toggleMenu();
            }}
          >
            <Icon
              name="download"
              size={20}
              color={isDarkMode ? "#00C853" : "#007AFF"}
            />
            <Text
              style={{
                marginLeft: 10,
                color: isDarkMode ? "#FFFFFF" : "#000000",
              }}
            >
              Export to Excel
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      {/* Decryption Key Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: isDarkMode ? "#1A1A1A" : "#FFFFFF",
              padding: 20,
              borderRadius: 10,
              width: "90%",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 10,
                color: isDarkMode ? "#FFFFFF" : "#000000",
              }}
            >
              🔐 Manage Decryption Key
            </Text>

            {/* Key Input Field */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: isDarkMode ? "#BBBBBB" : "#CCC",
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 8,
                marginBottom: 15,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: isDarkMode ? "#FFFFFF" : "#000",
                }}
                placeholder="Enter or edit key"
                placeholderTextColor={isDarkMode ? "#BBBBBB" : "#777"}
                secureTextEntry={!isKeyVisible}
                value={decryptionKey}
                onChangeText={setDecryptionKey}
              />
              <TouchableOpacity onPress={() => setIsKeyVisible(!isKeyVisible)}>
                <Icon
                  name={isKeyVisible ? "eye-off" : "eye"}
                  size={22}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#007AFF",
                  padding: 12,
                  borderRadius: 8,
                  flex: 1,
                  marginRight: 10,
                }}
                onPress={saveKeyToLocalStorage}
              >
                <Text
                  style={{
                    color: "#FFF",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Save
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "#FF3B30",
                  padding: 12,
                  borderRadius: 8,
                  flex: 1,
                }}
                onPress={() => setModalVisible(false)}
              >
                <Text
                  style={{
                    color: "#FFF",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ListScreen;
