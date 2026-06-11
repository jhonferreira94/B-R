import {
    FormControl,
    FormControlHelperText,
    FormControlLabel,
    FormControlLabelText,
} from '@/components/ui/form-control';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icon';
import {
    InputField,
    InputGlueStackUI,
    InputIcon,
    InputSlot,
} from '@/components/ui/input';
import { ElementType, useState } from 'react';
import {
    Control,
    Controller,
    FieldPath,
    FieldValues,
} from 'react-hook-form';
import { Text } from '@/components/ui/text';

type InputKeyboardType =
  | 'default'
  | 'email-address'
  | 'phone-pad'
  | 'numeric'
  | 'decimal-pad'
  | 'url'
  | 'ascii-capable'
  | 'numbers-and-punctuation'
  | 'number-pad'
  | 'name-phone-pad'
  | 'twitter'
  | 'web-search'
  | 'visible-password';

type MaskType = 'cpf' | 'cnpj' | 'phone' | 'cpf-cnpj' | 'cep' | 'date' | 'currency';

const maskCpf = (numbers: string): string =>
  numbers
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

const maskCnpj = (numbers: string): string =>
  numbers
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');

const applyMask = (value: string, maskType?: MaskType): string => {
  if (!maskType) return value;

  const numbers = value.replace(/\D/g, '');

  switch (maskType) {
    case 'cpf':
      return maskCpf(numbers);

    case 'cnpj':
      return maskCnpj(numbers);

    case 'cpf-cnpj':
      return numbers.length <= 11 ? maskCpf(numbers) : maskCnpj(numbers);

    case 'phone':
      return numbers
        .slice(0, 11)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    
    case 'cep':
      return numbers
        .slice(0, 8)
        .replace(/(\d{5})(\d)/, '$1-$2');
    
    case 'date':
      return numbers
        .slice(0, 8)
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2');
    
    case 'currency': {
      if (numbers.length === 0) return '';
      const cents = parseInt(numbers, 10);
      return (cents / 100).toFixed(2).replace('.', ',');
    }
    
    default:
      return value;
  }
};

interface InputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  className?: string;
  placeholder: string;
  type?: 'text' | 'password';
  radius?: 'full' | 'rounded' | 'none';
  inputSize?: 'sm' | 'md' | 'lg';
  keyboardType?: InputKeyboardType;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  helperText?: string;
  helperTextNode?: React.ReactNode;
  mask?: MaskType;
  prefixIcon?: ElementType;
  prefixText?: string;
  onIconPress?: () => void;
  isDisabled?: boolean;
  readonly?: boolean;
  labelSize?: 'sm' | 'md' | 'lg';
}

export function Input<T extends FieldValues>({
  control,
  name,
  label,
  className,
  placeholder,
  type = 'text',
  radius: _radius = 'none',
  inputSize = 'md',
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  helperText,
  readonly = false,
  helperTextNode,
  mask,
  prefixIcon,
  prefixText,
  onIconPress,
  isDisabled = false,
  labelSize = "md"
}: InputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const errorMessage = fieldState.error?.message;
        const showHelper = errorMessage ?? helperText ?? helperTextNode;

        const handleChangeText = (text: string) => {
          if (type === 'password') {
            field.onChange(text);
            return;
          }

          const maskedValue = applyMask(text, mask);
          field.onChange(maskedValue);
        };

        const displayValue = String(field.value ?? '');

        return (
          <FormControl size={inputSize}>
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
            <InputGlueStackUI 
              className={`${className} ${isDisabled ? 'opacity-60 bg-secondary-100' : 'bg-background-0'}`} 
              size={inputSize}
              isReadOnly={readonly}
            >
              {prefixText && (
                <InputSlot className="pl-2">
                  <Text size="sm" className="text-typography-600">{prefixText}</Text>
                </InputSlot>
              )}
              <InputField
                readOnly={readonly}
                placeholder={placeholder}
                value={displayValue}
                onChangeText={handleChangeText}
                onBlur={field.onBlur}
                keyboardType={keyboardType}
                autoCapitalize={type === 'password' ? 'none' : autoCapitalize}
                autoCorrect={type === 'password' ? false : autoCorrect}
                secureTextEntry={type === 'password' && !showPassword}
                textContentType={type === 'password' ? 'password' : undefined}
                editable={!isDisabled}
              />
              {type === 'password' && (
                <InputSlot className="pr-3" onPress={handleTogglePassword}>
                  <InputIcon 
                    className='text-background-600'
                    as={showPassword ? EyeIcon : EyeOffIcon} 
                  />
                </InputSlot>
              )}

              {prefixIcon && onIconPress && (
                <InputSlot 
                  className='bg-primary-600 mr-1 items-center justify-center p-2 rounded-full'
                  onPress={onIconPress}
                >
                  <InputIcon 
                    as={prefixIcon} 
                    size="sm"
                    className='text-primary-0'
                  />
                </InputSlot>
              )}
            </InputGlueStackUI>
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