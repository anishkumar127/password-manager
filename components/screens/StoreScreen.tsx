import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";

export default function StoreScreen() {
  const [title, setTitle] = useState("");
  const [data, setData] = useState("");

  async function saveData() {
    if (!title || !data) {
      Alert.alert("Error", "Title and Data cannot be empty.");
      return;
    }

    await axios.post("http://localhost:5000/save", { title, data });
    setTitle("");
    setData("");
    Alert.alert("Success", "Data Saved Successfully!");
  }

  return (
    <View className="flex-1 p-6 bg-gray-900">
      <Text className="text-2xl font-bold text-white text-center mb-6">
        🔐 Store Password
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
    </View>
  );
}
