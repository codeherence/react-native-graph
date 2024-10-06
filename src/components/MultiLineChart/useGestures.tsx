import { SkPath } from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import {
  Gesture,
  type PanGestureHandlerEventPayload as ReanimatedPanGestureHandlerEventPayload,
  type PanGestureChangeEventPayload,
} from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

import { useMultiLineChartContext } from "./context";
import { computeGraphData, computePath, getClosestPointForX } from "../../utils/math";

export type PanGestureHandlerEventPayload = ReanimatedPanGestureHandlerEventPayload;
export type PanGestureHandlerOnBeginEventPayload<Data extends Record<string, [number, number][]>> =
  {
    points: Record<
      keyof Data,
      {
        /**
         * The raw x value of the cursor. Keep in mind that this chooses the closest valid x
         * value - interpolation is not used.
         */
        x: number;
        /**
         * The raw y value of the cursor. This is chosen based on the x value and the generated
         * path.
         */
        y: number;
        /**
         * The x-data value corresponding to the cursor. This is the actual x value of the data
         * point.
         */
        xData: number;
        /**
         * The y-data value corresponding to the cursor. This is the actual y value of the data
         * point.
         */
        yData: number;
      }
    >;
    event: PanGestureHandlerEventPayload;
  };
export type PanGestureHandlerOnChangeEventPayload<Data extends Record<string, [number, number][]>> =
  {
    points: Record<
      keyof Data,
      {
        /**
         * The raw x value of the cursor. Keep in mind that this chooses the closest valid x
         * value - interpolation is not used.
         */
        x: number;
        /**
         * The raw y value of the cursor. This is chosen based on the x value and the generated
         * path.
         */
        y: number;
        /**
         * The x-data value corresponding to the cursor. This is the actual x value of the data
         * point.
         */
        xData: number;
        /**
         * The y-data value corresponding to the cursor. This is the actual y value of the data
         * point.
         */
        yData: number;
      }
    >;
    event: PanGestureHandlerEventPayload & PanGestureChangeEventPayload;
  };

// Extract Hover Gesture onBegin args since it isn't exported by rngh
export type HoverGestureOnBegin = ReturnType<typeof Gesture.Hover>["onBegin"];
export type HoverGestureOnBeginCallBack = Parameters<HoverGestureOnBegin>[0];
export type HoverGestureHandlerOnBeginEventPayload = {
  point: number;
  event: Parameters<HoverGestureOnBeginCallBack>[0];
};

export type UseGestureProps<Data extends Record<string, [number, number][]>> = {
  /** The path of the chart. */
  points: Data;
  /** The height of the chart. */
  height: number;
  curveType?: "linear";
  gestureLongPressDelay?: number;
  onPanGestureBegin?: ((payload: PanGestureHandlerOnBeginEventPayload<Data>) => void) | null;
  onPanGestureChange?: ((payload: PanGestureHandlerOnChangeEventPayload<Data>) => void) | null;
  onPanGestureEnd?: ((payload: PanGestureHandlerEventPayload) => void) | null;
};

/**
 * Returns the gesture handlers for the LineChart component.
 * @param param0 - The props to allow the gesture handlers to interact with the
 * LineChart component.
 * @returns The gesture handlers for the LineChart component.
 */
export const useGestures = <Data extends Record<string, [number, number][]>>({
  points,
  height,
  curveType = "linear",
  gestureLongPressDelay = 100,
  onPanGestureBegin,
  onPanGestureChange,
  onPanGestureEnd,
}: UseGestureProps<Data>) => {
  const { width } = useMultiLineChartContext();

  const graphData = useMemo(() => {
    return Object.entries(points).reduce(
      (acc, [key, value]) => {
        return { ...acc, [key]: computeGraphData(value) };
      },
      {} as Record<keyof Data, ReturnType<typeof computeGraphData>>
    );
  }, [points]);

  const pathsJS = useMemo(() => {
    const results = {} as Record<keyof Data, SkPath>;

    const pathKeys = Object.keys(graphData) as (keyof Data)[];
    for (const key of pathKeys) {
      const value = graphData[key];
      results[key] = computePath({ ...value, height, width, curveType });
    }

    return results;
  }, [graphData, height, width, curveType]);

  const paths = useSharedValue<Record<keyof Data, SkPath>>(pathsJS);
  useEffect(() => {
    paths.value = pathsJS;
  }, [pathsJS]);

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(gestureLongPressDelay)
    .onStart((event) => {
      const pathKeys = Object.keys(paths.value) as (keyof Data)[];
      const yValues = {} as Record<
        keyof Data,
        { x: number; y: number; xData: number; yData: number }
      >;
      for (const key of pathKeys) {
        const path = paths.value[key]!;
        const [xValue, yValue, idx] = getClosestPointForX(path, event.x);
        yValues[key] = {
          x: xValue,
          y: yValue,
          xData: points[key]![idx]![0] ?? 0,
          yData: points[key]![idx]![1] ?? 0,
        };
      }

      if (onPanGestureBegin) onPanGestureBegin({ event, points: yValues });
    })
    .onChange((event) => {
      const pathKeys = Object.keys(paths.value) as (keyof Data)[];
      const yValues = {} as Record<
        keyof Data,
        { x: number; y: number; xData: number; yData: number }
      >;
      for (const key of pathKeys) {
        const path = paths.value[key]!;
        const [xValue, yValue, idx] = getClosestPointForX(path, event.x);
        // const { minValue, maxValue } = graphData[key];
        // const yData = round(interpolate(yValue, [0, height], [maxValue, minValue]), precision);
        yValues[key] = {
          x: xValue,
          y: yValue,
          xData: points[key]![idx]![0] ?? 0,
          yData: points[key]![idx]![1] ?? 0,
        };
      }

      if (onPanGestureChange) onPanGestureChange({ event, points: yValues });
    })
    .onEnd((event) => {
      if (onPanGestureEnd) onPanGestureEnd(event);
    });

  return panGesture;
};
