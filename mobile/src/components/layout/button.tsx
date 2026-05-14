import { ButtonGlueStackUI, ButtonGroup, ButtonIcon, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { JSX } from "react";

type ButtonSizeProps = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined;

interface ButtonProps {
    labelText: string;
    prefixLabelIcon?: React.ElementType<unknown, keyof JSX.IntrinsicElements> | undefined;
    suffixLabelIcon?: React.ElementType<unknown, keyof JSX.IntrinsicElements> | undefined;
    classNameButton?: string;
    classNameButtonText?: string;
    variant?: 'link' | 'outline' | 'solid' | undefined;
    buttonSize?: ButtonSizeProps;
    buttonTextSize?: ButtonSizeProps;
    action?: 'primary' | 'secondary' | 'positive' | 'negative' | 'default' | undefined;
    onPress?: () => void;
    isLoading?: boolean;
    isDisabled?: boolean;
}

export function Button({ 
    labelText,
    prefixLabelIcon,
    suffixLabelIcon,
    classNameButton,
    classNameButtonText = 'font-medium text-typography-0',
    buttonSize = 'xl',
    variant = 'solid',
    buttonTextSize = 'lg',
    action = 'primary',
    onPress,
    isLoading = false,
    isDisabled = false,
} : ButtonProps) {
  return (
    <ButtonGroup>
      <ButtonGlueStackUI 
          className={`${classNameButton ?? ''}`}
          action={action}
          variant={variant}
          size={buttonSize}
          onPress={onPress}
          isDisabled={isDisabled}
      >
        {prefixLabelIcon && <ButtonIcon as={prefixLabelIcon} />}
        <ButtonText
          className={classNameButtonText}
          size={buttonTextSize}
        >
          {isLoading ? (
            <ButtonSpinner />
          ) : (
            <>
              {labelText}
            </>
          )}
        </ButtonText>
        {suffixLabelIcon && <ButtonIcon as={suffixLabelIcon} />}
      </ButtonGlueStackUI>
    </ButtonGroup>
  )
}