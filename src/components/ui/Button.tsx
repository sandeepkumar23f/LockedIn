import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  ...props
}) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 active:bg-gray-200 border border-gray-200';
      case 'outline':
        return 'bg-transparent border border-indigo-600 active:bg-indigo-50';
      case 'primary':
      default:
        return 'bg-indigo-600 active:bg-indigo-700 shadow-sm';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'text-gray-800 font-semibold';
      case 'outline':
        return 'text-indigo-600 font-semibold';
      case 'primary':
      default:
        return 'text-white font-semibold';
    }
  };

  return (
    <TouchableOpacity
      className={`w-full py-3.5 px-4 rounded-xl items-center justify-center flex-row ${getButtonStyles()} ${
        disabled || loading ? 'opacity-60' : ''
      }`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#4F46E5'}
        />
      ) : (
        <Text className={`text-base tracking-wide ${getTextStyles()}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
