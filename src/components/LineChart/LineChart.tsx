import type { ViewProps } from "react-native";

import type { AxisLabelProps } from "./AxisLabel";
import { InteractiveLineChart } from "./InteractiveLineChart";
import { StaticLineChart } from "./StaticLineChart";
import type { ComputePathProps } from "./computations";
import {
  HoverGestureHandlerOnBeginEventPayload,
  HoverGestureHandlerOnChangeEventPayload,
  HoverGestureHandlerOnEndEventPayload,
  PanGestureHandlerEventPayload,
  PanGestureHandlerOnBeginEventPayload,
  PanGestureHandlerOnChangeEventPayload,
} from "./useGestures";

export interface PathFillProps {
  /* The width of the line */
  strokeWidth: number;
  /* The height of the chart */
  height: number;
  /* The width of the chart */
  width: number;
}

export interface InteractiveLineChartProps {
  /**
   * Whether the chart is static or interactive. If true, the chart will not respond to gestures.
   * @default false
   */
  isStatic?: false;
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

export type LineChartProps<Static extends boolean = false> = ViewProps & {
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
} & (Static extends true
    ? {
        /**
         * Whether the chart is static or interactive. If true, the chart will not respond to gestures
         * @default false
         */
        isStatic: true;
      }
    : InteractiveLineChartProps);

export const LineChart = <S extends boolean>({ isStatic = false, ...props }: LineChartProps<S>) => {
  return isStatic ? <StaticLineChart isStatic {...props} /> : <InteractiveLineChart {...props} />;
};
LineChart.displayName = "LineChart";
