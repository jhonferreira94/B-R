import {
    FormControl,
    FormControlHelperText,
    FormControlLabel,
    FormControlLabelText,
} from '@/components/ui/form-control';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import {
    Control,
    Controller,
    FieldPath,
    FieldValues,
} from 'react-hook-form';

interface TextAreaProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  className?: string;
  placeholder: string;
  size?: 'sm' | 'md' | 'lg';
  helperText?: string;
  helperTextNode?: React.ReactNode;
  isDisabled?: boolean;
  readonly?: boolean;
  maxLength?: number;
  rounded?: "rounded-2xl" | "rounded-md" | "rounded-sm";
  labelSize?: 'sm' | 'md' | 'lg';
}

export function TextArea<T extends FieldValues>({
  control,
  name,
  label,
  className,
  placeholder,
  size = 'md',
  helperText,
  helperTextNode,
  isDisabled = false,
  readonly = false,
  maxLength,
  rounded = "rounded-2xl",
  labelSize = "md"
}: TextAreaProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const errorMessage = fieldState.error?.message;
        const showHelper = errorMessage ?? helperText ?? helperTextNode;

        return (
          <FormControl size={size}>
            {label && (
              <FormControlLabel>
                <FormControlLabelText
                  size={labelSize}
                  className="text-typography-900"
                >
                  {label}
                </FormControlLabelText>
              </FormControlLabel>
            )}
            <Textarea
              size={size}
              className={`${rounded} ${className ?? ''} ${isDisabled ? 'opacity-60 bg-background-100' : ''}`}
              isDisabled={isDisabled}
              isReadOnly={readonly}
            >
              <TextareaInput
                placeholder={placeholder}
                value={String(field.value ?? '')}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                editable={!isDisabled}
                maxLength={maxLength}
              />
            </Textarea>
            {showHelper && (
              <FormControlHelperText
                size="sm"
                className={errorMessage ? 'text-error-500' : 'text-typography-500'}
              >
                {errorMessage ?? helperTextNode ?? helperText}
              </FormControlHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
}
