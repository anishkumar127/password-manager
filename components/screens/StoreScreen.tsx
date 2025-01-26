import React, { useCallback, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
} from "react-native";
import Input from "../ui/Input";
import Card from "../ui/Card";
import Icon from "react-native-vector-icons/Feather";

export default function StoreScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [title, setTitle] = useState("");
  const [data, setData] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTitle("");
    setData("");
    setEncryptionKey("");
    setRefreshing(false);
  }, []);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        backgroundColor: isDarkMode ? "#181818" : "#F5F5F5", // 🌙 Dark mode softer background
      }}
    >
      {/* Secure Password Manager Card */}
      <Card
        className={`w-full max-w-md p-6 rounded-lg shadow-lg border ${
          isDarkMode
            ? "bg-[#252525] border-[#333333]" // 🌙 Dark mode: softer black, subtle border
            : "bg-white border-gray-300"
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
        <TouchableOpacity
          className={`p-3 rounded-lg flex-row justify-center items-center mt-4 ${
            isDarkMode ? "bg-[#444] text-[#E0E0E0]" : "bg-black"
          }`}
        >
          <Icon name="save" size={20} color="white" />
          <Text className="text-white ml-2 font-semibold"> Save Entry </Text>
        </TouchableOpacity>

        {/* Bulk Upload Button */}
        <TouchableOpacity
          className={`p-3 rounded-lg flex-row justify-center items-center mt-4 ${
            isDarkMode ? "bg-[#333333]" : "bg-gray-200"
          }`}
        >
          <Icon
            name="upload"
            size={18}
            color={isDarkMode ? "#E0E0E0" : "black"}
          />
          <Text
            className={`ml-2 font-semibold ${
              isDarkMode ? "text-[#E0E0E0]" : "text-black"
            }`}
          >
            Bulk Upload via Excel
          </Text>
        </TouchableOpacity>

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
    </ScrollView>
  );
}
