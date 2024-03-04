import { Canvas, Path } from "@shopify/react-native-skia";
import { useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View, ViewProps } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

import { AxisLabelComponentProps, AxisLabelContainer } from "./AxisLabel";
import type { BannerComponentProps } from "./Banner";
import { Cursor } from "./Cursor";
import { computePath, getYForX, type ComputePathProps, computeGraphData } from "./Math";
import {
  DEFAULT_CURSOR_RADIUS,
  DEFAULT_CURVE_TYPE,
  DEFAULT_FORMATTER,
  DEFAULT_STROKE_WIDTH,
} from "./constants";
import { useGestures } from "./useGestures";

export type LineChartProps = ViewProps & {
  /** Array of [x, y] points for the chart */
  points: [number, number][];
  strokeWidth?: number;
  cursorRadius?: number;
  curveType?: ComputePathProps["curveType"];
  /** A worklet function to format a given price. */
  formatter?: (price: number) => string;
  BannerComponent?: React.FC<BannerComponentProps>;
  TopAxisLabel?: React.FC<AxisLabelComponentProps>;
  BottomAxisLabel?: React.FC<AxisLabelComponentProps>;
};

export const LineChart: React.FC<LineChartProps> = ({
  points,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  cursorRadius = DEFAULT_CURSOR_RADIUS,
  curveType = DEFAULT_CURVE_TYPE,
  BannerComponent = null,
  formatter = DEFAULT_FORMATTER,
  TopAxisLabel = null,
  BottomAxisLabel = null,
  ...viewProps
}) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  // Initially -cursorRadius so that the cursor is offscreen
  const x = useSharedValue(-cursorRadius);
  const gestures = useGestures({ x, cursorRadius });

  // We separate the computation of the data from the rendering. This is so that these values are
  // not recomputed when the width or height of the chart changes, but only when the points change.
  const data = useMemo(() => computeGraphData(points), [points]);

  const path = useMemo(() => {
    return computePath({ ...data, width, height, cursorRadius, curveType });
  }, [data, width, height]);

  const y = useDerivedValue(() => {
    return path ? getYForX({ path, x: x.value }) ?? 0 : 0;
  }, [path]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
    setHeight(e.nativeEvent.layout.height);
  }, []);

  return (
    <View style={[styles.root, viewProps.style]} {...viewProps}>
      {TopAxisLabel && (
        <AxisLabelContainer x={data.maxValueXProportion * width} containerWidth={width}>
          <TopAxisLabel value={data.maxValue} />
        </AxisLabelContainer>
      )}
      <GestureDetector gesture={gestures}>
        <View style={styles.container} onLayout={onLayout}>
          <Canvas style={{ height, width }}>
            <Path style="stroke" path={path} strokeWidth={strokeWidth} color="black" />
            <Cursor x={x} y={y} height={height} cursorRadius={cursorRadius} />
          </Canvas>
        </View>
      </GestureDetector>
      {BottomAxisLabel && (
        <AxisLabelContainer x={data.minValueXProportion * width} containerWidth={width}>
          <BottomAxisLabel value={data.minValue} />
        </AxisLabelContainer>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { position: "relative", overflow: "hidden" },
  container: { flex: 1 },
  canvas: { flex: 1 },
});
