import { Canvas, Path } from "@shopify/react-native-skia";
import { useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View, ViewProps } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

import { AxisLabelProps, AxisLabelContainer } from "./AxisLabel";
import { Cursor } from "./Cursor";
import { computePath, type ComputePathProps, computeGraphData } from "./computations";
import {
  HoverGestureHandlerOnBeginEventPayload,
  HoverGestureHandlerOnChangeEventPayload,
  HoverGestureHandlerOnEndEventPayload,
  PanGestureHandlerEventPayload,
  PanGestureHandlerOnBeginEventPayload,
  PanGestureHandlerOnChangeEventPayload,
  useGestures,
} from "./useGestures";
import { batchedUpdates } from "../../libs/batchedUpdates";

interface PathFillProps {
  /* The width of the line */
  strokeWidth: number;
  /* The height of the chart */
  height: number;
  /* The width of the chart */
  width: number;
}

export interface LineChartProps extends ViewProps {
  /**
   * Array of [x, y] points for the chart.
   */
  points: [number, number][];
  /**
   * The precision of the y value's rounding.
   * @default 2
   */
  precision?: number;
  /**
   * The stroke width of the line
   * @default 2
   * */
  strokeWidth?: number;
  /**
   * The radius of the cursor
   * @default 8
   */
  cursorRadius?: number;
  /**
   * The color of the cursor.
   * @default "black"
   */
  cursorColor?: string;
  /**
   * Whether to hide the cursor
   * @default false
   */
  hideCursor?: boolean;
  /**
   * The color of the cursor line.
   * @default "rgba(0, 0, 0, 0.5)"
   */
  cursorLineColor?: string;
  /**
   * The width of the cursor line.
   * @default 2
   */
  cursorLineWidth?: number;
  /**
   * Whether to hide the cursor line.
   * @default false
   */
  hideCursorLine?: boolean;
  /**
   * The component to render as the top axis label.
   * @default null
   *
   * @note This compnent should not be a Skia component since it is not rendered
   * in the Canvas.
   */
  TopAxisLabel?: React.FC<AxisLabelProps>;
  /**
   * The component to render as the bottom axis label.
   * @default null
   *
   * @note This compnent should not be a Skia component since it is not rendered
   * in the Canvas.
   */
  BottomAxisLabel?: React.FC<AxisLabelProps>;
  /**
   * The type of curve to use for the line chart. Currently, only "linear" is supported.
   *
   * @type "linear"
   * @default "linear"
   */
  curveType?: ComputePathProps["curveType"];
  /**
   * The component to render as the path fill. This is rendered as the child of
   * the Path, enabling you to style the path with Skia components.
   *
   * @note This component must be a Skia component.
   * 
   * @example A simple example of a path fill using a *Paint* component:
   * ```tsx
     import { Paint } from "@shopify/react-native-skia";
     
     <LineChart 
      // ...
      PathFill={({ width }) => (
        <Paint style="stroke" strokeWidth={strokeWidth} color="lightblue" />
      )}
     />
   * ```
   * @example The example below shows how to use a *LinearGradient* to fill the path.
   * ```tsx
     import { LinearGradient } from "@shopify/react-native-skia";
     
     <LineChart 
      // ...
      PathFill={({ width }) => (
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, 0)}
          colors={["blue", "red", "purple"]}
        />
      )}
     />
   * ```
   */
  PathFill?: React.FC<PathFillProps>;
  /**
   * A worklet function that is executed when the pan gesture begins.
   * @note This must be a [worklet](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) function.
   */
  onPanGestureBegin?: ((payload: PanGestureHandlerOnBeginEventPayload) => void) | null;
  /**
   * A worklet function that is executed during the pan gesture.
   * @note This must be a [worklet](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) function.
   */
  onPanGestureChange?: ((payload: PanGestureHandlerOnChangeEventPayload) => void) | null;
  /**
   * A worklet function that is executed when the pan gesture ends.
   * @note This must be a [worklet](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) function.
   */
  onPanGestureEnd?: ((payload: PanGestureHandlerEventPayload) => void) | null;
  /**
   * A worklet function that is executed when the hover gesture begins.
   * @note This must be a [worklet](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) function.
   */
  onHoverGestureBegin?: ((payload: HoverGestureHandlerOnBeginEventPayload) => void) | null;
  /**
   * A worklet function that is executed during the hover gesture.
   * @note This must be a [worklet](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) function.
   */
  onHoverGestureChange?: ((payload: HoverGestureHandlerOnChangeEventPayload) => void) | null;
  /**
   * A worklet function that is executed when the hover gesture ends.
   * @note This must be a [worklet](https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/worklets/) function.
   */
  onHoverGestureEnd?: ((payload: HoverGestureHandlerOnEndEventPayload) => void) | null;
}

export const LineChart: React.FC<LineChartProps> = ({
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
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

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
LineChart.displayName = "LineChart";

const styles = StyleSheet.create({
  root: { position: "relative", overflow: "hidden" },
  container: { flex: 1 },
  canvas: { flex: 1 },
});
