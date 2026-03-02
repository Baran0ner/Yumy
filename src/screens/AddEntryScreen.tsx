import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMealContext } from '../context/MealContext';

type AddEntryScreenProps = {
  onDone: () => void;
};

export const AddEntryScreen = ({ onDone }: AddEntryScreenProps): React.JSX.Element => {
  const { addMeal } = useMealContext();
  const [description, setDescription] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async () => {
    const value = description.trim();
    if (!value || isSaving) {
      return;
    }

    setIsSaving(true);
    await addMeal(value);
    setIsSaving(false);
    onDone();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Yeni Öğün Ekle</Text>
        <Text style={styles.label}>Yediğin öğünü yaz</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Örn: 2 yumurta ve tam buğday tost"
          style={styles.input}
          multiline
          autoFocus
        />
        <Pressable
          style={[styles.button, (!description.trim() || isSaving) && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={!description.trim() || isSaving}>
          <Text style={styles.buttonLabel}>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAF5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1D2910',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    textAlignVertical: 'top',
    marginBottom: 16,
    fontSize: 15,
  },
  button: {
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
