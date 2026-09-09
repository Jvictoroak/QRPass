import { colors, radius, spacing, typography } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type DateFieldProps = {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder: string;
  maximumDate?: Date;
  minimumDate?: Date;
};

export function DateField({
  value,
  onChange,
  placeholder,
  maximumDate,
  minimumDate,
}: DateFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <>
      <Pressable onPress={() => setShow(true)} style={styles.inputWrap}>
        <Ionicons name="calendar-outline" size={16} color={colors.grayMuted} />
        <Text
          style={[
            styles.input,
            { color: value ? colors.white : colors.grayMuted },
          ]}
        >
          {value ? value.toLocaleDateString("pt-BR") : placeholder}
        </Text>
      </Pressable>

      {show && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display="spinner"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={(_event, selectedDate) => {
            setShow(false);
            if (selectedDate) onChange(selectedDate);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  input: {
    flex: 1,
    ...typography.body,
    padding: 0,
  },
});
