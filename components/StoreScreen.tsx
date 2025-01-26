import axios from "axios";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function StoreScreen() {
  const [title, setTitle] = useState("");
  const [data, setData] = useState("");
  async function saveData() {
    await axios.post("http://192.168.240.217:5000/save", { title, data });
    setTitle("");
    setData("");
  }

  return (
    <ScrollView
      className="bg-gray-900"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
    >
      <View className="p-6">
        <Text className="text-2xl font-bold text-center text-white mb-6">
          🔒 Secure Password Manager
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
    </ScrollView>
  );
}
