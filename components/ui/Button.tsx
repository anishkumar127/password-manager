import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
}

export default function Button({
  title,
  onPress,
  loading = false,
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={`bg-blue-600 p-3 rounded-lg flex-row justify-center items-center ${
        loading ? "opacity-50" : ""
      }`}
      onPress={onPress}
      disabled={loading}
    >
      {loading && <ActivityIndicator color="#fff" className="mr-2" />}
      <Text className="text-white text-lg font-semibold">{title}</Text>
    </TouchableOpacity>
  );
}
