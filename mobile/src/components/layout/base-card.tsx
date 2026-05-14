import { View } from "react-native";

interface BaseCardProps {
    children: React.ReactNode;
    padding?: "p-2" | "p-3" | "p-4";
    variant?: "primary" | "secondary";
    className?: string;
}

export default function BaseCard({ children, padding = "p-2", variant = "primary", className }: BaseCardProps) {
    const backgroundClass = variant === "primary" ? "bg-background-0 border border-background-100" : "bg-primary-200";

    return (
        <View className={`w-full h-fit ${backgroundClass} rounded-xl ${padding} ${className}`}>
            {children}
        </View>
    );
}