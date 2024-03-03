/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import Reanimated from "react-native-reanimated";

interface AxisLabelContainerProps {
  children: React.ReactNode;
}

export const AxisLabelContainer: React.FC<AxisLabelContainerProps> = ({ children }) => {
  const [_, setWidth] = useState(0);
  const [__, setHeight] = useState(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
    setHeight(event.nativeEvent.layout.height);
  }, []);

  return <Reanimated.View onLayout={onLayout}>{children}</Reanimated.View>;
};
