import {
    FormControlHelperText,
    FormControlLabel,
    FormControlLabelText,
} from '@/components/ui/form-control';
import {
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectIcon,
    SelectInputGlueStackUI,
    SelectItem,
    SelectPortal,
    SelectTrigger,
    Select
} from '@/components/ui/select';
import {
    Control,
    Controller,
    FieldPath,
    FieldValues,
} from 'react-hook-form';
import { View } from 'react-native';
import { ChevronDownIcon } from '../ui/icon';
import React from 'react';

interface SelectInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  className?: string;
  placeholder: string;
  items: { label: string; value: string; isDisabled?: boolean }[];
  selectedValue: string;
  helperText?: string;
  helperTextNode?: React.ReactNode;
}

export function SelectInput<T extends FieldValues>({
    control,
    name,
    label,
    className,
    items,
    selectedValue: _selectedValue,
    placeholder,
    helperText,
    helperTextNode,
}: SelectInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const errorMessage = fieldState.error?.message;
        const showHelper = errorMessage ?? helperText ?? helperTextNode;

        // Busca a label correspondente ao valor selecionado
        const selectedItem = items.find(item => item.value === field.value);
        const displayLabel = selectedItem?.label ?? '';

        return (
          <View>
            {label && (
              <FormControlLabel className={className}>
                <FormControlLabelText
                  size="md"
                  className="text-typography-900"
                >
                  {label}
                </FormControlLabelText>
              </FormControlLabel>
            )}
            <Select selectedValue={field.value} onValueChange={field.onChange}>
                <SelectTrigger variant="outline" size="md" className="w-full justify-between bg-background-0">
                    <SelectInputGlueStackUI 
                        placeholder={placeholder}
                        value={displayLabel}
                    />
                    <SelectIcon 
                        className="mr-3" 
                        as={ChevronDownIcon} 
                        size='sm'
                    />
                </SelectTrigger>
                <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                        <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        {items.map((item) => (
                            <SelectItem
                                key={item.value}
                                value={item.value}
                                disabled={item.isDisabled}
                                label={item.label}        
                            />
                        ))}
                    </SelectContent>
                </SelectPortal>
            </Select>
            {showHelper && (
              <FormControlHelperText
                size="sm"
                className={errorMessage ? 'text-error-500' : 'text-typography-500'}
              >
                {errorMessage ?? helperTextNode ?? helperText}
              </FormControlHelperText>
            )}
          </View>
        );
      }}
    />
  );
}