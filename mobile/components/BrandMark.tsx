import React from "react";
import { Image, StyleSheet, ViewStyle } from "react-native";

interface BrandMarkProps {
  size?: number;
  style?: ViewStyle;
}

// The Hulu Service logo mark — the location-pin + checkmark icon from
// assets/icon.png, used everywhere the brand appears (top bar, auth
// screens, etc). Rounded to match the icon's own rounded-square shape.
export default function BrandMark({ size = 30, style }: BrandMarkProps) {
  return (
    <Image
      source={require("../assets/icon.png")}
      style={[
        styles.mark,
        { width: size, height: size, borderRadius: size * 0.22 },
      ]}
      resizeMode='cover'
    />
  );
}

const styles = StyleSheet.create({
  mark: { overflow: "hidden" },
});
