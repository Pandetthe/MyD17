import React from "react";
import { G, Path, Rect, Svg } from "react-native-svg";

const PATHS = [
  "m43.15,30.36h4.96l9.26,14.45v-14.45h5.16v24.33h-4.96l-9.26-14.42v14.42h-5.16v-24.33Z",
  "m68.11,30.36h13.85v5.09h-8.36v4.56h8.17v5.09h-8.17v9.59h-5.49v-24.33Z",
  "m84.81,42.53c0-7.44,5.42-12.66,12.7-12.66s12.73,5.22,12.73,12.66-5.46,12.66-12.73,12.66-12.7-5.22-12.7-12.66Zm12.7,7.44c4,0,7.04-2.98,7.04-7.44s-3.04-7.44-7.04-7.44-7.01,2.98-7.01,7.44,3.01,7.44,7.01,7.44Z",
  "m119.92,45.17v9.52h-5.49v-24.33h8.27c5.16,0,8.33,2.58,8.33,7.57,0,3.34-2.02,5.85-5.46,6.71l6.98,10.05h-6.61l-6.02-9.52Zm2.51-4.4c1.85,0,3.01-1.09,3.01-2.84s-1.16-2.84-3.01-2.84h-2.51v5.69h2.51Z",
  "m136.48,30.36h5.39l7.11,11.97,7.01-11.97h5.29v24.33h-5.16v-14.94l-5.55,9.52h-3.31l-5.62-9.59v15.01h-5.16v-24.33Z",
  "m172.98,30.36h5.36l8.27,24.33h-5.72l-1.12-3.67h-8.2l-1.12,3.67h-5.65l8.2-24.33Zm5.32,15.97l-2.68-8.63-2.64,8.63h5.32Z",
  "m191.99,35.45h-5.49v-5.09h16.47v5.09h-5.49v19.24h-5.49v-19.24Z",
  "m213.05,45.21l-7.77-14.85h6.18l4.36,8.96,4.33-8.96h5.75l-7.37,14.85v9.49h-5.49v-9.49Z",
  "m233.87,44.58v10.12h-5.49v-24.33h5.49v9.42l6.65-9.22h6.45l-8.36,11.41,8.83,12.73h-6.68l-6.88-10.12Z",
  "m256.16,30.36h5.36l8.27,24.33h-5.72l-1.12-3.67h-8.2l-1.12,3.67h-5.65l8.2-24.33Zm5.32,15.97l-2.68-8.63-2.64,8.63h5.32Z",
];

type ColorVariant = {
  text: string;
  pixelLeft: [string, string, string, string, string];
  pixelMid: [string, string, string, string, string];
  dot: string;
  bar: string;
};

const VARIANTS: Record<"color" | "white" | "black", ColorVariant> = {
  color: {
    text: "#212c3f",
    pixelLeft: ["#0c65af", "#4978bb", "#5c8bc8", "#6fa1d6", "#85b9e5"],
    pixelMid: ["#0c65af", "#4978bb", "#5c8bc8", "#6fa1d6", "#85b9e5"],
    dot: "#212c3f",
    bar: "#212c3f",
  },
  white: {
    text: "#ffffff",
    pixelLeft: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"],
    pixelMid: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"],
    dot: "#ffffff",
    bar: "#ffffff",
  },
  black: {
    text: "#1d1d1b",
    pixelLeft: ["#1d1d1b", "#1d1d1b", "#1d1d1b", "#1d1d1b", "#1d1d1b"],
    pixelMid: ["#1d1d1b", "#1d1d1b", "#1d1d1b", "#1d1d1b", "#1d1d1b"],
    dot: "#1d1d1b",
    bar: "#1d1d1b",
  },
};

type Props = {
  height?: number;
  variant?: "color" | "white" | "black";
};

export default function Logo({ height = 36, variant = "color" }: Props) {
  const w = height * (283.46 / 85.04);
  const v = VARIANTS[variant];

  return (
    <Svg width={w} height={height} viewBox="0 0 283.46 85.04">
      <G>
        {PATHS.map((d, i) => (
          <Path key={i} fill={v.text} d={d} />
        ))}

        <Rect fill={v.pixelLeft[0]} x="13.69" y="30.34" width="6.38" height="6.38" />
        <Rect fill={v.pixelLeft[1]} x="13.69" y="39.33" width="6.38" height="6.38" />
        <Rect fill={v.pixelLeft[2]} x="13.69" y="48.31" width="6.38" height="6.38" />
        <Rect fill={v.pixelLeft[3]} x="13.69" y="57.32" width="6.38" height="6.38" />
        <Rect fill={v.pixelLeft[4]} x="13.69" y="66.27" width="6.38" height="6.38" />

        <Rect fill={v.pixelMid[0]} x="22.66" y="21.37" width="6.38" height="6.38" />
        <Rect fill={v.pixelMid[1]} x="22.64" y="30.35" width="6.38" height="6.38" />
        <Rect fill={v.pixelMid[2]} x="22.64" y="39.32" width="6.38" height="6.38" />
        <Rect fill={v.pixelMid[3]} x="22.64" y="48.31" width="6.38" height="6.38" />
        <Rect fill={v.pixelMid[4]} x="22.64" y="57.29" width="6.38" height="6.38" />

        <Rect fill={v.dot} x="31.68" y="12.4" width="6.38" height="6.38" />
        <Rect fill={v.bar} x="31.84" y="30.36" width="6.22" height="24.33" />
      </G>
    </Svg>
  );
}
