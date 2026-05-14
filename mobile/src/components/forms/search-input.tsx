import { SearchIcon } from '@/components/ui/icon';
import {
    InputField,
    InputGlueStackUI,
    InputIcon,
    InputSlot,
} from '@/components/ui/input';

interface SearchInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    inputSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export function SearchInput({
    value,
    onChangeText,
    placeholder = 'Buscar...',
    inputSize = 'xl',
}: SearchInputProps) {
    return (
        <InputGlueStackUI size={inputSize} className="rounded-full bg-background-0 border border-background-200">
            <InputField
                placeholder={placeholder}
                value={value}
                className='text-sm'
                onChangeText={onChangeText}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />
            <InputSlot className="rounded-full bg-primary-500 p-2 m-1 items-center justify-center self-center">
                <InputIcon as={SearchIcon} className="text-primary-0" />
            </InputSlot>
        </InputGlueStackUI>
    );
}
