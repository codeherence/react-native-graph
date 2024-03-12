import { Canvas, Path } from "@shopify/react-native-skia";
import { useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View, ViewProps } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

import { AxisLabelComponentProps, AxisLabelContainer } from "./AxisLabel";
import { Cursor } from "./Cursor";
import { computePath, type ComputePathProps, computeGraphData } from "./computations";
import { DEFAULT_CURSOR_RADIUS, DEFAULT_CURVE_TYPE, DEFAULT_STROKE_WIDTH } from "./constants";
import {
  HoverGestureHandlerOnBeginEventPayload,
  HoverGestureHandlerOnChangeEventPayload,
  HoverGestureHandlerOnEndEventPayload,
  PanGestureHandlerEventPayload,
  PanGestureHandlerOnBeginEventPayload,
  PanGestureHandlerOnChangeEventPayload,
  useGestures,
} from "./useGestures";

export interface PathFillProps {
  strokeWidth: number;
  height: number;
  width: number;
}

export type LineChartProps = ViewProps & {
  /** Array of [x, y] points for the chart */
  points: [number, number][];
  strokeWidth?: number;
  cursorRadius?: number;
  curveType?: ComputePathProps["curveType"];
  /** A worklet function to format a given price. */
  TopAxisLabel?: React.FC<AxisLabelComponentProps>;
  BottomAxisLabel?: React.FC<AxisLabelComponentProps>;
  PathFill?: React.FC<PathFillProps>;
  /** Callback when the pan gesture begins. This function must be a worklet function. */
  onPanGestureBegin?: ((payload: PanGestureHandlerOnBeginEventPayload) => void) | null;
  onPanGestureChange?: ((payload: PanGestureHandlerOnChangeEventPayload) => void) | null;
  onPanGestureEnd?: ((payload: PanGestureHandlerEventPayload) => void) | null;
  onHoverGestureBegin?: ((payload: HoverGestureHandlerOnBeginEventPayload) => void) | null;
  onHoverGestureChange?: ((payload: HoverGestureHandlerOnChangeEventPayload) => void) | null;
  onHoverGestureEnd?: ((payload: HoverGestureHandlerOnEndEventPayload) => void) | null;
};

export const LineChart: React.FC<LineChartProps> = ({
  points,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  cursorRadius = DEFAULT_CURSOR_RADIUS,
  curveType = DEFAULT_CURVE_TYPE,
  TopAxisLabel = null,
  BottomAxisLabel = null,
  PathFill = null,
  onPanGestureBegin = null,
  onPanGestureChange = null,
  onPanGestureEnd = null,
  onHoverGestureBegin = null,
  onHoverGestureChange = null,
  onHoverGestureEnd = null,
  ...viewProps
}) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  // Initially -cursorRadius so that the cursor is offscreen
  const x = useSharedValue(-cursorRadius);
  const y = useSharedValue(0);

  // We separate the computation of the data from the rendering. This is so that these values are
  // not recomputed when the width or height of the chart changes, but only when the points change.
  const data = useMemo(() => computeGraphData(points), [points]);

  const path = useMemo(() => {
    return computePath({ ...data, width, height, cursorRadius, curveType });
  }, [data, width, height, cursorRadius, curveType]);

  const gestures = useGestures({
    x,
    y,
    path,
    height,
    minValue: data.minValue,
    maxValue: data.maxValue,
    cursorRadius,
    onPanGestureBegin,
    onPanGestureChange,
    onPanGestureEnd,
    onHoverGestureBegin,
    onHoverGestureChange,
    onHoverGestureEnd,
  });

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
            <Path style="stroke" path={path} strokeWidth={strokeWidth} color="white">
              {PathFill && PathFill({ width, height, strokeWidth })}
            </Path>
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
