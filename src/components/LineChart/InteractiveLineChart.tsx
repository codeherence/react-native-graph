import { Canvas, Path } from "@shopify/react-native-skia";
import { useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

import { AxisLabelContainer } from "./AxisLabel";
import { Cursor } from "./Cursor";
import { LineChartProps } from "./LineChart";
import { computePath, computeGraphData } from "./computations";
import { useGestures } from "./useGestures";

export const InteractiveLineChart: React.FC<LineChartProps<false>> = ({
  points = [],
  precision = 2,
  strokeWidth = 2,
  cursorRadius = 8,
  cursorColor = "black",
  hideCursor = false,
  cursorLineColor = "rgba(0, 0, 0, 0.5)",
  cursorLineWidth = 2,
  hideCursorLine = false,
  curveType = "linear",
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
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 });

  // Initially -cursorRadius so that the cursor is hidden
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
    minYValue: data.minValue,
    maxYValue: data.maxValue,
    cursorRadius,
    precision,
    onPanGestureBegin,
    onPanGestureChange,
    onPanGestureEnd,
    onHoverGestureBegin,
    onHoverGestureChange,
    onHoverGestureEnd,
  });

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    // Batch the updates to avoid unnecessary re-renders
    setSize(e.nativeEvent.layout);
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
            {!hideCursor ? (
              <Cursor
                x={x}
                y={y}
                height={height}
                cursorRadius={cursorRadius}
                cursorColor={cursorColor}
                cursorLineColor={cursorLineColor}
                cursorLineWidth={cursorLineWidth}
                hideCursorLine={hideCursorLine}
              />
            ) : null}
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
InteractiveLineChart.displayName = "InteractiveLineChart";

const styles = StyleSheet.create({
  root: { position: "relative", overflow: "hidden" },
  container: { flex: 1 },
  canvas: { flex: 1 },
});
