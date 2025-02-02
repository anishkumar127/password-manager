import { View } from "react-native";
import { ReactNode } from "react";
import { cn } from "@/src/utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return <View className={cn("w-full", className)}>{children}</View>;
}
