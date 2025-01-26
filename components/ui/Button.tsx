import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  icon?: string; // Icon name (optional)
}

export default function Button({
  title,
  onPress,
  loading = false,
  icon,
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={`bg-blue-600 p-3 rounded-lg flex-row justify-center items-center ${
        loading ? "opacity-50" : ""
      }`}
      onPress={onPress}
      disabled={loading}
    >
      {/* Show Spinner When Loading */}
      {loading ? (
        <ActivityIndicator color="#fff" className="mr-2" />
      ) : (
        // Show Icon Only If Provided
        icon && (
          <View className="mr-2">
            <Icon name={icon} size={20} color="white" />
          </View>
        )
      )}

      {/* Button Text */}
      <Text className="text-white text-lg font-semibold">{title}</Text>
    </TouchableOpacity>
  );
}
