import { Canvas, Path } from "@shopify/react-native-skia";
import { useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";

import { AxisLabelContainer } from "./AxisLabel";
import type { LineChartProps } from "./LineChart";
import { computePath, computeGraphData } from "./computations";
import { batchedUpdates } from "../../libs/batchedUpdates";

export const StaticLineChart: React.FC<LineChartProps<true>> = ({
  points = [],
  precision = 2,
  strokeWidth = 2,
  curveType = "linear",
  TopAxisLabel = null,
  BottomAxisLabel = null,
  PathFill = null,
  // None of these properties are used in StaticLineChart
  ...viewProps
}) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  // We separate the computation of the data from the rendering. This is so that these values are
  // not recomputed when the width or height of the chart changes, but only when the points change.
  const data = useMemo(() => computeGraphData(points), [points]);

  const path = useMemo(() => {
    return computePath({ ...data, width, height, cursorRadius: 0, curveType });
  }, [data, width, height, curveType]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    // Batch the updates to avoid unnecessary re-renders
    batchedUpdates(() => {
      setWidth(e.nativeEvent.layout.width);
      setHeight(e.nativeEvent.layout.height);
    });
  }, []);

  return (
    <View style={[styles.root, viewProps.style]} {...viewProps}>
      {TopAxisLabel && (
        <AxisLabelContainer x={data.maxValueXProportion * width} containerWidth={width}>
          <TopAxisLabel value={data.maxValue} />
        </AxisLabelContainer>
      )}
      <View style={styles.container} onLayout={onLayout}>
        <Canvas style={{ height, width }}>
          <Path style="stroke" path={path} strokeWidth={strokeWidth} color="white">
            {PathFill && PathFill({ width, height, strokeWidth })}
          </Path>
        </Canvas>
      </View>
      {BottomAxisLabel && (
        <AxisLabelContainer x={data.minValueXProportion * width} containerWidth={width}>
          <BottomAxisLabel value={data.minValue} />
        </AxisLabelContainer>
      )}
    </View>
  );
};
StaticLineChart.displayName = "StaticLineChart";

const styles = StyleSheet.create({
  root: { position: "relative", overflow: "hidden" },
  container: { flex: 1 },
  canvas: { flex: 1 },
});
