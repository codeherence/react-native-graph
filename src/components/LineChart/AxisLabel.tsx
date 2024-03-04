/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import Reanimated, {
  clamp,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";

export interface AxisLabelComponentProps {
  value: number;
}

interface AxisLabelContainerProps {
  children: React.ReactNode;
  x: number;
  containerWidth: number;
}

export const AxisLabelContainer: React.FC<AxisLabelContainerProps> = ({
  x,
  containerWidth,
  children,
}) => {
  const [width, setWidth] = useState(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

  const translateX = useDerivedValue(() => {
    const halfWidth = Math.round(width / 2);
    const minX = 0;
    const maxX = containerWidth - width;

    return withTiming(clamp(x - halfWidth, minX, maxX));
  }, [x, containerWidth, width]);

  const transform = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Reanimated.View style={[styles.child, transform]} onLayout={onLayout}>
        {children}
      </Reanimated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flexDirection: "row",
    width: "100%",
    overflow: "hidden",
  },
  child: {
    justifyContent: "center",
    alignItems: "center",
  },
});
