import { Canvas, Path } from "@shopify/react-native-skia";
import { useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View, ViewProps } from "react-native";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

import type { BannerComponentProps } from "./Banner";
import { Cursor } from "./Cursor";
import { computePath, getYForX, type ComputePathProps } from "./Math";
import {
  DEFAULT_CURSOR_RADIUS,
  DEFAULT_CURVE_TYPE,
  DEFAULT_FORMATTER,
  DEFAULT_STROKE_WIDTH,
} from "./constants";
import { useGestureHandler } from "./useGestureHandler";

export type LineChartProps = ViewProps & {
  /** Array of [x, y] points for the chart */
  points: [number, number][];
  strokeWidth?: number;
  cursorRadius?: number;
  curveType?: ComputePathProps["curveType"];
  /** A worklet function to format a given price. */
  formatter?: (price: number) => string;
  BannerComponent?: React.FC<BannerComponentProps>;
  TopAxisLabel?: React.FC;
  BottomAxisLabel?: React.FC;
};

export const LineChart: React.FC<LineChartProps> = ({
  points: _points,
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
  const onTouch = useGestureHandler({ x, cursorRadius });

  // We separate the computation of the data from the rendering. This is so that these values are
  // not recomputed when the width or height of the chart changes, but only when the points change.
  const computedData = useMemo(() => {
    const timestamps = _points.map(([timestamp]) => timestamp);
    const values = _points.map(([, value]) => value);
    const minTimestamp = Math.min(...timestamps);
    const maxTimestamp = Math.max(...timestamps);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    return { points: _points, minTimestamp, maxTimestamp, minValue, maxValue };
  }, [_points]);

  const path = useMemo(() => {
    return computePath({ ...computedData, width, height, cursorRadius, curveType });
  }, [computedData, width, height]);

  const y = useDerivedValue(() => {
    return path ? getYForX({ path, x: x.value }) ?? 0 : 0;
  }, [path]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
    setHeight(e.nativeEvent.layout.height);
  }, []);

  return (
    <View {...viewProps}>
      <View style={styles.container} onLayout={onLayout}>
        <Canvas style={styles.canvas} onTouch={onTouch}>
          <Path style="stroke" path={path} strokeWidth={strokeWidth} color="black" />
          <Cursor x={x} y={y} height={height} cursorRadius={cursorRadius} />
        </Canvas>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  canvas: { flex: 1 },
});
