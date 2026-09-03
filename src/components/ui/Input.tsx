import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  iconName,
  error,
  isPassword = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="text-gray-700 text-sm font-semibold mb-1.5 ml-0.5">
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center bg-gray-50 border rounded-xl px-3.5 py-3 ${
          error
            ? 'border-red-500'
            : isFocused
            ? 'border-indigo-600 bg-white'
            : 'border-gray-200'
        }`}
      >
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            color={error ? '#EF4444' : isFocused ? '#4F46E5' : '#9CA3AF'}
            style={{ marginRight: 10 }}
          />
        )}

        <TextInput
          className="flex-1 text-gray-900 text-base p-0"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">
          {error}
        </Text>
      )}
    </View>
  );
};
