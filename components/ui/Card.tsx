import { View } from "react-native";

import { ReactNode } from "react";
interface CardProps {
  children: ReactNode;
}

export default function Card({ children }: CardProps) {
  return (
    <View className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg w-full">
      {children}
    </View>
  );
}
