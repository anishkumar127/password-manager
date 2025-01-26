import { useState } from "react";
import {
  TextInput,
  TextInputProps,
  View,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

interface InputProps extends TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
}

export default function Input({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  multiline,
  ...props
}: InputProps) {
  const [height, setHeight] = useState<number>(40); // Default height
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false); // Toggle visibility

  return (
    <View className="relative">
      <TextInput
        className="border border-gray-700 bg-gray-800 p-3 rounded-lg text-white mb-4 pr-10"
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !isPasswordVisible} // Toggle visibility
        multiline={multiline}
        onContentSizeChange={(event) => {
          const newHeight = event.nativeEvent.contentSize.height;
          setHeight(newHeight < 40 ? 40 : newHeight > 150 ? 150 : newHeight); // Resize with limit
        }}
        style={{ height, textAlignVertical: "top" }}
        {...props}
      />
      {/* Toggle Button for Secure Text */}
      {secureTextEntry && (
        <TouchableOpacity
          className="absolute right-3 top-4"
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Icon
            name={isPasswordVisible ? "eye" : "eye-off"}
            size={20}
            color="#bbb"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
