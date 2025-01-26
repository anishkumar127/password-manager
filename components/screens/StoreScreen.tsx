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
        padding: 16,
        backgroundColor: isDarkMode ? "#121212" : "#F5F5F5",
      }}
    >
      {/* Secure Password Manager Card */}
      <Card
        className={`w-full max-w-md p-6 rounded-lg shadow-lg border ${
          isDarkMode
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-300"
        }`}
      >
        {/* Header */}
        <Text
          className={`text-2xl font-bold mb-2 text-center ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          <Icon name="lock" size={24} color="black" /> Secure Password Manager
        </Text>
        <Text className="text-center text-gray-600 mb-4 px-2">
          A zero-knowledge password manager that encrypts your data locally.
          Your encryption key never leaves your device, ensuring only you can
          access your data.
        </Text>

        {/* Encryption Security Notice */}
        <View className="bg-gray-100 border border-gray-300 p-3 rounded-lg mb-4 flex-row items-center">
          <Icon name="info" size={18} color="black" />
          <Text className="text-gray-700 text-sm ml-2">
            Your data is encrypted locally before being stored. We cannot access
            or recover your data without your encryption key.
          </Text>
        </View>

        {/* Input Fields */}
        <Input
          placeholder="Enter Title"
          value={title}
          onChangeText={setTitle}
        />
        <Input
          placeholder="Enter Encryption Key"
          value={encryptionKey}
          onChangeText={setEncryptionKey}
          secureTextEntry={true}
        />

        {/* Encryption Key Warning */}
        <View className="bg-red-100 border border-red-400 p-3 rounded-lg mt-2 mb-2 w-full">
          <View className="flex-row items-center">
            <Icon name="alert-triangle" size={18} color="red" />
            <Text className="text-red-600 text-sm ml-2 flex-1 flex-wrap">
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
        />

        {/* Save Entry Button */}
        <TouchableOpacity className="bg-black p-3 rounded-lg flex-row justify-center items-center mt-4">
          <Icon name="save" size={20} color="white" />
          <Text className="text-white ml-2 font-semibold"> Save Entry </Text>
        </TouchableOpacity>

        {/* Bulk Upload Button */}
        <TouchableOpacity className="bg-gray-200 p-3 rounded-lg flex-row justify-center items-center mt-4">
          <Icon name="upload" size={18} color="black" />
          <Text className="text-black ml-2 font-semibold">
            Bulk Upload via Excel
          </Text>
        </TouchableOpacity>

        {/* How It Works Section */}
        <View className="bg-gray-100 border border-gray-300 p-4 rounded-lg mt-6">
          <Text className="text-gray-500 font-semibold mb-2">
            How it works:
          </Text>
          <View className="flex-row items-start mb-2">
            <Text className="text-gray-600 text-sm">• </Text>
            <Text className="text-gray-600 text-sm">
              Your data is encrypted locally using your encryption key.
            </Text>
          </View>
          <View className="flex-row items-start mb-2">
            <Text className="text-gray-600 text-sm">• </Text>
            <Text className="text-gray-600 text-sm">
              The encryption key never leaves your device.
            </Text>
          </View>
          <View className="flex-row items-start mb-2">
            <Text className="text-gray-600 text-sm">• </Text>
            <Text className="text-gray-600 text-sm">
              Store individual entries or bulk upload via Excel.
            </Text>
          </View>
          <View className="flex-row items-start">
            <Text className="text-gray-600 text-sm">• </Text>
            <Text className="text-gray-600 text-sm">
              We cannot read your encrypted data.
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}
