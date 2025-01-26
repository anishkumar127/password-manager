import { View } from "react-native";
import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <View
      className={cn(
        "bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg w-full",
        className,
      )}
    >
      {children}
    </View>
  );
}
