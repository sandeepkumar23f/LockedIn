import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await login({ email, password });
      // Upon successful login, the Auth Guard in app/_layout.tsx will automatically
      // redirect to the protected (app) home screen.
    } catch (error: any) {
      Alert.alert('Login Failed', error?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            className="px-6 py-4"
          >
            {/* Header / Brand */}
            <View className="items-center mt-8 mb-8">
              <View className="w-16 h-16 rounded-2xl bg-indigo-600 items-center justify-center mb-3 shadow-md">
                <Ionicons name="lock-closed" size={32} color="#FFFFFF" />
              </View>
              <Text className="text-3xl font-extrabold text-gray-900 tracking-tight">
                LockedIn
              </Text>
              <Text className="text-gray-500 text-sm mt-1 text-center font-normal">
                Sign in to stay focused and track your progress
              </Text>
            </View>

            {/* Form Fields */}
            <View className="w-full">
              <Input
                label="Email Address"
                placeholder="name@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                iconName="mail-outline"
                error={errors.email}
              />

              <Input
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                isPassword
                iconName="lock-closed-outline"
                error={errors.password}
              />

              {/* Forgot Password */}
              <TouchableOpacity
                className="self-end mb-6"
                onPress={() => Alert.alert('Forgot Password', 'Password reset flow can be added here!')}
              >
                <Text className="text-sm font-semibold text-indigo-600">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <Button
                title="Sign In"
                loading={loading}
                onPress={handleLogin}
              />

              {/* Demo Hint */}
              <View className="mt-4 p-3 bg-indigo-50/70 rounded-xl border border-indigo-100">
                <Text className="text-xs text-indigo-700 text-center">
                  💡 <Text className="font-semibold">Quick test:</Text> Type any valid email & 6+ character password to sign in.
                </Text>
              </View>
            </View>

            {/* Footer / Register Link */}
            <View className="flex-1 justify-end pb-4 pt-8">
              <View className="flex-row justify-center items-center">
                <Text className="text-gray-500 text-sm">
                  {"Don't have an account? "}
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                  <Text className="text-sm font-bold text-indigo-600">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
