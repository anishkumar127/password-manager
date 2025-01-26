import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import * as Clipboard from "expo-clipboard";
import axios from "axios";

const ListScreen = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [dataList, setDataList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setRefreshing(true);
    try {
      const response = await axios.get("http://192.168.240.217:5000/data");
      if (response?.data) {
        setDataList(response.data);
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

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? "#0D0D0D" : "#F9F9F9",
        paddingHorizontal: 16,
        paddingTop: 40,
      }}
    >
      {/* Title */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
      >
        <Icon
          name="lock"
          size={28}
          color={isDarkMode ? "#FFFFFF" : "#000000"}
        />
        <Text
          className="w-full"
          style={{
            fontSize: 26,
            fontWeight: "bold",
            marginLeft: 10,
            color: isDarkMode ? "#FFFFFF" : "#000000",
          }}
        >
          Secure Vault
        </Text>
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
                }}
              >
                {item.description || "No description"}
              </Text>
            </View>

            {/* Actions */}
            <View className="flex-row gap-4 justify-center items-center">
              <TouchableOpacity
                className="mr-2"
                onPress={() => copyToClipboard(item.title)}
              >
                <Icon
                  name="lock"
                  size={20}
                  color={isDarkMode ? "#BBBBBB" : "#777"}
                />

                {/* <Icon */}
                {/*   name="unlock" */}
                {/*   size={20} */}
                {/*   color={isDarkMode ? "#BBBBBB" : "#777"} */}
                {/* /> */}
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-2"
                onPress={() => copyToClipboard(item.title)}
              >
                <Icon
                  name="copy"
                  size={20}
                  color={isDarkMode ? "#BBBBBB" : "#777"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default ListScreen;
