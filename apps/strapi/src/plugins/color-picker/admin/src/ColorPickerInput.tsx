import { useState } from "react";
import { useField, type InputProps } from "@strapi/strapi/admin";
import { Box, Field, Flex } from "@strapi/design-system";
import styled from "styled-components";

const COLORS: { name: string; hex: string; label: string }[] = [
  { name: "red",    hex: "#EF4444", label: "Red" },
  { name: "amber",  hex: "#F59E0B", label: "Amber" },
  { name: "green",  hex: "#22C55E", label: "Green" },
  { name: "teal",   hex: "#06B6D4", label: "Teal" },
  { name: "purple", hex: "#8B5CF6", label: "Purple" },
  { name: "pink",   hex: "#EC4899", label: "Pink" },
];

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
                title={color.label}
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
