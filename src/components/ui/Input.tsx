import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  Pressable,
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
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="text-gray-700 text-sm font-semibold mb-1.5 ml-0.5">
          {label}
        </Text>
      )}

      <Pressable
        onPress={() => inputRef.current?.focus()}
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
          ref={inputRef}
          className="flex-1 text-gray-900 text-base p-0"
          style={[{ color: '#111827', fontSize: 16 }, style]}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </Pressable>

      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">
          {error}
        </Text>
      )}
    </View>
  );
};

