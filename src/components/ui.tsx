import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { toDateStr } from '../utils/format';
import { Colors, useColors, useIsDark, useThemedStyles } from './theme';

export const Field = ({ label, ...props }: { label: string } & TextInputProps) => {
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput style={s.input} placeholderTextColor={colors.muted} {...props} />
    </View>
  );
};

export const Button = ({ title, onPress, danger, secondary }: { title: string; onPress: () => void; danger?: boolean; secondary?: boolean }) => {
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={[s.btn, secondary && s.btnSecondary, danger && { backgroundColor: colors.expense }]}
    >
      <Text style={[s.btnText, secondary && { color: colors.primary }]}>{title}</Text>
    </Pressable>
  );
};

export const Fab = ({ onPress }: { onPress: () => void }) => {
  const s = useThemedStyles(makeStyles);
  return (
    <Pressable onPress={onPress} style={s.fab}>
      <Text style={s.fabText}>+</Text>
    </Pressable>
  );
};

export const Card = ({ children }: { children: React.ReactNode }) => {
  const s = useThemedStyles(makeStyles);
  return <View style={s.card}>{children}</View>;
};

export const Empty = ({ text }: { text: string }) => {
  const s = useThemedStyles(makeStyles);
  return <Text style={s.empty}>{text}</Text>;
};

export function FormModal({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const s = useThemedStyles(makeStyles);
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.backdrop}>
        <View style={s.sheet}>
          <Text style={s.title}>{title}</Text>
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Chips<T extends number | string>({ items, selected, onSelect, label }: {
  items: { id: T; name: string; color?: string }[];
  selected: T | null;
  onSelect: (id: T | null) => void;
  label: string;
}) {
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.label}>{label}</Text>
      <View style={s.chips}>
        {items.map((i) => {
          const on = i.id === selected;
          return (
            <Pressable key={String(i.id)} onPress={() => onSelect(on ? null : i.id)}
              style={[s.chip, on && { backgroundColor: i.color ?? colors.primary, borderColor: i.color ?? colors.primary }]}>
              <Text style={[s.chipText, on && { color: '#fff' }]}>{i.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const colors = useColors();
  const dark = useIsDark();
  const s = useThemedStyles(makeStyles);
  const [open, setOpen] = React.useState(false);
  const parsed = new Date(`${value}T12:00:00`);
  const date = isNaN(parsed.getTime()) ? new Date() : parsed;
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.label}>{label}</Text>
      <Pressable style={s.input} onPress={() => setOpen(true)}>
        <Text style={{ fontSize: 16, color: colors.text }}>{value}</Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={date}
          mode="date"
          themeVariant={dark ? 'dark' : 'light'}
          onChange={(e, d) => {
            setOpen(false);
            if (e.type === 'set' && d) onChange(toDateStr(d));
          }}
        />
      ) : null}
    </View>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  label: { fontSize: 13, color: colors.muted, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, fontSize: 16, color: colors.text, backgroundColor: colors.card },
  btn: { backgroundColor: colors.primary, borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 8 },
  btnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabText: { color: '#fff', fontSize: 30, marginTop: -2 },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginHorizontal: 12, marginBottom: 10 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: '90%' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  chipText: { color: colors.text },
});
