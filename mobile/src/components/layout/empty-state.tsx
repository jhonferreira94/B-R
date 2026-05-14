import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = "Nenhum resultado encontrado",
  description,
}: EmptyStateProps) {
  return (
    <VStack className="items-center justify-center mt-16 gap-2">
      <Text size="md" className="font-medium text-typography-800 text-center">
        {title}
      </Text>
      {description ? (
        <Text size="sm" className="text-typography-600 text-center">
          {description}
        </Text>
      ) : null}
    </VStack>
  );
}
