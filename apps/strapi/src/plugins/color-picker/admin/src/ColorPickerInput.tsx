import { useState } from "react";
import { useField, type InputProps } from "@strapi/strapi/admin";
import { Box, Field, Flex } from "@strapi/design-system";
import styled from "styled-components";

const COLORS: { name: string; hex: string; label: string }[] = [
  { name: "red", hex: "#ef4444", label: "Red" },
  { name: "rose", hex: "#f43f5e", label: "Rose" },
  { name: "orange", hex: "#f97316", label: "Orange" },
  { name: "amber", hex: "#f59e0b", label: "Amber" },
  { name: "yellow", hex: "#eab308", label: "Yellow" },
  { name: "lime", hex: "#84cc16", label: "Lime" },
  { name: "green", hex: "#22c55e", label: "Green" },
  { name: "emerald", hex: "#10b981", label: "Emerald" },
  { name: "teal", hex: "#14b8a6", label: "Teal" },
  { name: "cyan", hex: "#06b6d4", label: "Cyan" },
  { name: "sky", hex: "#0ea5e9", label: "Sky" },
  { name: "blue", hex: "#3b82f6", label: "Blue" },
  { name: "indigo", hex: "#6366f1", label: "Indigo" },
  { name: "violet", hex: "#8b5cf6", label: "Violet" },
  { name: "purple", hex: "#a855f7", label: "Purple" },
  { name: "fuchsia", hex: "#d946ef", label: "Fuchsia" },
  { name: "pink", hex: "#ec4899", label: "Pink" },
];

const APP_RESULT: Record<string, string> = {
  red: "red",
  rose: "red",
  orange: "amber",
  amber: "amber",
  yellow: "amber",
  lime: "green",
  green: "green",
  emerald: "green",
  teal: "teal",
  cyan: "teal",
  sky: "blue (primary)",
  blue: "blue (primary)",
  indigo: "purple",
  violet: "purple",
  purple: "purple",
  fuchsia: "pink",
  pink: "pink",
};

const ColorSwatch = styled.button<{
  $hex: string;
  $active: boolean;
  $pressed: boolean;
}>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $hex }) => $hex};
  border: none;
  box-shadow: ${({ $active, theme }) =>
    $active
      ? `0 0 0 2px ${theme.colors.neutral0}, 0 0 0 4px currentColor`
      : `0 0 0 2px transparent, 0 0 0 4px transparent`};
  color: ${({ $hex }) => $hex};
  cursor: pointer;
  padding: 0;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  transform: ${({ $active, $pressed }) =>
    $pressed ? "scale(0.95)" : $active ? "scale(1.1)" : "scale(1)"};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:hover:not(:disabled) {
    box-shadow:
      0 0 0 2px ${({ theme }) => theme.colors.neutral0},
      0 0 0 4px currentColor;
  }
`;

type ColorPickerInputProps = InputProps & {
  onChange: (event: {
    target: { name: string; value: string; type?: string };
  }) => void;
};

const ColorPickerInput = ({
  hint,
  disabled,
  labelAction,
  label,
  name,
  required,
  ...props
}: ColorPickerInputProps) => {
  const field = useField(name);
  const value = typeof field.value === "string" ? field.value : "";
  const [pressed, setPressed] = useState<string | null>(null);

  const handleSelect = (colorName: string) => {
    field.onChange(colorName);
    props.onChange({ target: { name, value: colorName, type: "string" } });
  };

  return (
    <Field.Root
      name={name}
      id={name}
      hint={hint}
      required={required}
      error={field.error}
    >
      <Flex direction="column" alignItems="stretch" gap={2}>
        <Field.Label action={labelAction}>{label}</Field.Label>
        <Box
          padding={3}
          background="neutral0"
          borderColor="neutral200"
          borderStyle="solid"
          borderWidth="1px"
          hasRadius
        >
          <Flex wrap="wrap" gap={1}>
            {COLORS.map((color) => (
              <ColorSwatch
                key={color.name}
                type="button"
                $hex={color.hex}
                $active={value === color.name}
                $pressed={pressed === color.name}
                disabled={disabled}
                title={`${color.label} → app: ${APP_RESULT[color.name]}`}
                aria-label={color.label}
                aria-pressed={value === color.name}
                onPointerDown={() => !disabled && setPressed(color.name)}
                onPointerUp={() => setPressed(null)}
                onPointerLeave={() => setPressed(null)}
                onClick={() => !disabled && handleSelect(color.name)}
              />
            ))}
          </Flex>
        </Box>
        <Field.Hint />
        <Field.Error />
      </Flex>
    </Field.Root>
  );
};

export default ColorPickerInput;
