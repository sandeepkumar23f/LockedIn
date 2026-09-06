import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string, date: string, time: string) => Promise<void>;
  isLoading: boolean;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  visible,
  onClose,
  onCreate,
  isLoading,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(new Date());
    setTime(new Date());
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    const formattedDate = date.toISOString().split('T')[0];
    const formattedTime = time.toTimeString().split(' ')[0].substring(0, 5);

    await onCreate(title, description, formattedDate, formattedTime);
    resetForm();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10 min-h-[60%]">
          {/* Handle Bar */}
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">Create Event</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
            {/* Title */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">Event Title *</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200"
                placeholder="e.g., Study React Native"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">Description (Optional)</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 min-h-[80px]"
                placeholder="Add some notes..."
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Date */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">Date</Text>
              <TouchableOpacity
                className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 flex-row justify-between items-center"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="text-gray-800">{formatDate(date)}</Text>
                <Ionicons name="calendar-outline" size={22} color="#6B7280" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}
            </View>

            {/* Time */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-1">Time</Text>
              <TouchableOpacity
                className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 flex-row justify-between items-center"
                onPress={() => setShowTimePicker(true)}
              >
                <Text className="text-gray-800">{formatTime(time)}</Text>
                <Ionicons name="time-outline" size={22} color="#6B7280" />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) setTime(selectedTime);
                  }}
                />
              )}
            </View>

            {/* Create Button */}
            <TouchableOpacity
              className={`bg-indigo-600 rounded-xl py-4 items-center ${isLoading ? 'opacity-70' : ''}`}
              onPress={handleCreate}
              disabled={isLoading || !title.trim()}
            >
              {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold text-lg">Create Event</Text>}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};