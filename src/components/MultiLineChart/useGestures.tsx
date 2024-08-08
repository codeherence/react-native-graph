import { SkPath } from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import {
  Gesture,
  type PanGestureHandlerEventPayload as ReanimatedPanGestureHandlerEventPayload,
  type PanGestureChangeEventPayload,
} from "react-native-gesture-handler";
import { interpolate, useSharedValue } from "react-native-reanimated";

import { useMultiLineChartContext } from "./context";
import { computeGraphData, computePath, getYForX } from "../../utils/math";

export type PanGestureHandlerEventPayload = ReanimatedPanGestureHandlerEventPayload;
export type PanGestureHandlerOnBeginEventPayload<Data extends Record<string, [number, number][]>> =
  {
    points: Record<keyof Data, number>;
    event: PanGestureHandlerEventPayload;
  };
export type PanGestureHandlerOnChangeEventPayload<Data extends Record<string, [number, number][]>> =
  {
    points: Record<keyof Data, number>;
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
  /** The precision of the y value. */
  precision: number;
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
  precision,
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
      const yValues = {} as Record<keyof Data, number>;
      for (const key of pathKeys) {
        const path = paths.value[key]!;
        const rawYValue = getYForX({ path, x: event.x, precision });
        const { minValue, maxValue } = graphData[key];
        const yValue = interpolate(rawYValue, [0, height], [maxValue, minValue]);
        yValues[key] = yValue;
      }

      if (onPanGestureBegin) onPanGestureBegin({ event, points: yValues });
    })
    .onChange((event) => {
      const pathKeys = Object.keys(paths.value) as (keyof Data)[];
      const yValues = {} as Record<keyof Data, number>;
      for (const key of pathKeys) {
        const path = paths.value[key]!;
        const rawYValue = getYForX({ path, x: event.x, precision });
        const { minValue, maxValue } = graphData[key];
        const yValue = interpolate(rawYValue, [0, height], [maxValue, minValue]);
        yValues[key] = yValue;
      }

      if (onPanGestureChange) onPanGestureChange({ event, points: yValues });
    })
    .onEnd((event) => {
      if (onPanGestureEnd) onPanGestureEnd(event);
    });

  return panGesture;
};
