import { createContext, useContext, PropsWithChildren } from "react";
import { View } from "react-native";

type RadioButtonContextType = {
  value: string;
  onValueChange: (value: string) => void;
};

export const RadioButtonContext = createContext<RadioButtonContextType | null>(null);

export function useRadioButtonContext() {
  return useContext(RadioButtonContext);
}

type RadioButtonGroupProps = {
  value: string;
  onValueChange: (value: string) => void;
};

export function RadioButtonGroup({
  value,
  onValueChange,
  children,
}: PropsWithChildren<RadioButtonGroupProps>) {
  return (
    <RadioButtonContext.Provider value={{ value, onValueChange }}>
      <View accessibilityRole="radiogroup">{children}</View>
    </RadioButtonContext.Provider>
  );
}
