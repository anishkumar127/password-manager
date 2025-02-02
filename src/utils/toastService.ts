import Toast from "react-native-toast-message";

// Define toast types
type ToastType = "success" | "error" | "info";

// Create a reusable function for displaying Toast messages
export const showToast = (
  type: ToastType,
  title: string,
  message?: string,
  position: "top" | "bottom" = "top",
) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position,
  });
};
