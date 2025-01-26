import { useState } from "react";
import { TextInput, TextInputProps } from "react-native";

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
  const [height, setHeight] = useState<number>(40); // Initial height

  return (
    <TextInput
      className="border border-gray-700 bg-gray-800 p-3 rounded-lg text-white mb-4"
      placeholder={placeholder}
      placeholderTextColor="#bbb"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      onContentSizeChange={(event) => {
        const newHeight = event.nativeEvent.contentSize.height;
        setHeight(newHeight < 40 ? 40 : newHeight > 150 ? 150 : newHeight); // Limit height between 40 - 150
      }}
      style={{ height, textAlignVertical: "top" }}
      {...props}
    />
  );
}
