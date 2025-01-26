import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  useColorScheme,
} from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";

import Icon from "react-native-vector-icons/Feather";
interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disable?: boolean;
  icon?: string; // Icon name (optional)
}

export default function Button({
  title,
  onPress,
  loading = false,
  disable = false,
  icon,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  return (
    <TouchableOpacity
      className={`p-3 rounded-lg flex-row justify-center items-center mt-4 w-full ${
        disable
          ? isDarkMode
            ? "bg-[#2C2C2C]" // Dark Mode Disabled
            : "bg-[#E0E0E0]" // Light Mode Disabled
          : isDarkMode
            ? "bg-[#444444]" // Dark Mode Active
            : "bg-black" // Light Mode Active
      }`}
      onPress={!disable ? onPress : undefined}
      disabled={disable}
    >
      {/* Show Spinner When Loading */}
      {loading ? (
        <ActivityIndicator color="#fff" className="mr-2" />
      ) : (
        // Show Icon Only If Provided
        icon && (
          <View className="mr-2">
            <Icon
              name={icon}
              size={20}
              color={disable ? (isDarkMode ? "#777777" : "#A0A0A0") : "white"}
            />
          </View>
        )
      )}

      <Text
        className={`text-lg font-semibold  ${
          disable
            ? isDarkMode
              ? "text-[#777777]"
              : "text-[#A0A0A0]"
            : "text-white"
        }`}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
