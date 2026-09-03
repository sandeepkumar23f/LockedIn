import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { Button } from '../../src/components/ui/Button';

export default function HomeScreen() {
  const { user, logout, isLoading } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* Top Bar */}
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              Dashboard
            </Text>
            <Text className="text-2xl font-extrabold text-gray-900 mt-0.5">
              Welcome, {user?.name || 'Friend'}! 👋
            </Text>
          </View>
          <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center border-2 border-indigo-200">
            <Ionicons name="person" size={24} color="#4F46E5" />
          </View>
        </View>

        {/* Status Card */}
        <View className="bg-indigo-600 rounded-2xl p-6 shadow-md mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white/80 font-medium text-sm">
              Authentication Status
            </Text>
            <View className="bg-emerald-400/20 px-2.5 py-1 rounded-full flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
              <Text className="text-emerald-200 text-xs font-semibold">
                Active Session
              </Text>
            </View>
          </View>

          <Text className="text-white text-2xl font-bold mb-1">
            {user?.name || 'LockedIn User'}
          </Text>
          <Text className="text-indigo-200 text-sm mb-4">
            {user?.email || 'user@example.com'}
          </Text>

          <View className="pt-4 border-t border-indigo-500/50 flex-row justify-between items-center">
            <Text className="text-indigo-200 text-xs">
              MERN Stack Architecture
            </Text>
            <Text className="text-white text-xs font-semibold">
              Ready for Express API
            </Text>
          </View>
        </View>

        {/* Feature Preview Card */}
        <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-xl bg-indigo-50 items-center justify-center mr-3">
              <Ionicons name="shield-checkmark" size={22} color="#4F46E5" />
            </View>
            <View>
              <Text className="text-gray-900 font-bold text-base">
                Protected Route Guard
              </Text>
              <Text className="text-gray-500 text-xs">
                Expo Router + AuthContext
              </Text>
            </View>
          </View>
          <Text className="text-gray-600 text-sm leading-relaxed">
            You are currently on the protected <Text className="font-semibold text-gray-900">/(app)</Text> route. Unauthenticated users cannot access this screen and are redirected to <Text className="font-semibold text-gray-900">/(auth)/login</Text>.
          </Text>
        </View>

        {/* Log Out Action */}
        <View className="mt-4">
          <Button
            title="Log Out"
            variant="outline"
            loading={isLoading}
            onPress={logout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
