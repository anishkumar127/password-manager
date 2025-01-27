import { BaseToast, ErrorToast } from "react-native-toast-message";
import { ToastConfig } from "react-native-toast-message/lib/src/types";

// Define toastConfig with proper TypeScript type
export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#22c55e", // Green left border
        backgroundColor: "#f0fdf4", // Light green background
        borderRadius: 10, // Rounded corners
        paddingVertical: 15, // More vertical padding
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 18,
        fontWeight: "bold",
        color: "#166534", // Dark green text
      }}
      text2Style={{
        fontSize: 16,
        color: "#065f46", // Lighter green
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#ef4444", // Red left border
        backgroundColor: "#fee2e2", // Light red background
        borderRadius: 10,
        paddingVertical: 15,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 18,
        fontWeight: "bold",
        color: "#7f1d1d", // Dark red text
      }}
      text2Style={{
        fontSize: 16,
        color: "#b91c1c", // Lighter red
      }}
    />
  ),
};
