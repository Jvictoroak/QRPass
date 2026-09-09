import { colors, radius, spacing, typography } from "@/constants/theme";

type DateFieldProps = {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder: string;
  maximumDate?: Date;
  minimumDate?: Date;
};

function toInputValue(date: Date | null | undefined) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DateField({
  value,
  onChange,
  placeholder,
  maximumDate,
  minimumDate,
}: DateFieldProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        paddingLeft: spacing.md,
        paddingRight: spacing.md,
        height: 50,
      }}
    >
      <input
        type="date"
        value={toInputValue(value)}
        max={toInputValue(maximumDate) || undefined}
        min={toInputValue(minimumDate) || undefined}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value;
          if (!raw) return;
          const [year, month, day] = raw.split("-").map(Number);
          onChange(new Date(year, month - 1, day));
        }}
        style={{
          flex: 1,
          width: "100%",
          border: "none",
          outline: "none",
          background: "transparent",
          fontFamily: typography.body.fontFamily,
          fontSize: typography.body.fontSize,
          color: value ? colors.white : colors.grayMuted,
          colorScheme: "dark",
        }}
      />
    </div>
  );
}
