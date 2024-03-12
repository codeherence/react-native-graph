import { SkPath } from "@shopify/react-native-skia";
import {
  Gesture,
  type PanGestureHandlerEventPayload as ReanimatedPanGestureHandlerEventPayload,
  type PanGestureChangeEventPayload,
} from "react-native-gesture-handler";
import { SharedValue, interpolate } from "react-native-reanimated";

import { getYForX } from "./computations";

export type PanGestureHandlerEventPayload = ReanimatedPanGestureHandlerEventPayload;
export type PanGestureHandlerOnBeginEventPayload = {
  point: number;
  event: PanGestureHandlerEventPayload;
};
export type PanGestureHandlerOnChangeEventPayload = {
  point: number;
  event: PanGestureHandlerEventPayload & PanGestureChangeEventPayload;
};

// Extract Hover Gesture onBegin args since it isn't exported by rngh
export type HoverGestureOnBegin = ReturnType<typeof Gesture.Hover>["onBegin"];
export type HoverGestureOnBeginCallBack = Parameters<HoverGestureOnBegin>[0];
export type HoverGestureHandlerOnBeginEventPayload = {
  point: number;
  event: Parameters<HoverGestureOnBeginCallBack>[0];
};

// Extract Hover Gesture onChange args since it isn't exported by rngh
export type HoverGestureOnChange = ReturnType<typeof Gesture.Hover>["onChange"];
export type HoverGestureOnChangeCallBack = Parameters<HoverGestureOnChange>[0];
export type HoverGestureHandlerOnChangeEventPayload = {
  point: number;
  event: Parameters<HoverGestureOnChangeCallBack>[0];
};

// Extract Hover Gesture onEnd args since it isn't exported by rngh
export type HoverGestureOnEnd = ReturnType<typeof Gesture.Hover>["onEnd"];
export type HoverGestureOnEndCallBack = Parameters<HoverGestureOnEnd>[0];
export type HoverGestureHandlerOnEndEventPayload = Parameters<HoverGestureOnEndCallBack>[0];

export interface UseGestureProps {
  x: SharedValue<number>;
  y: SharedValue<number>;
  path: SkPath;
  height: number;
  minValue: number;
  maxValue: number;
  cursorRadius: number;
  /** Callback when the pan gesture begins. This function must be a worklet function. */
  onPanGestureBegin: ((payload: PanGestureHandlerOnBeginEventPayload) => void) | null;
  onPanGestureChange: ((payload: PanGestureHandlerOnChangeEventPayload) => void) | null;
  onPanGestureEnd: ((payload: PanGestureHandlerEventPayload) => void) | null;
  onHoverGestureBegin: ((payload: HoverGestureHandlerOnBeginEventPayload) => void) | null;
  onHoverGestureChange: ((payload: HoverGestureHandlerOnChangeEventPayload) => void) | null;
  onHoverGestureEnd: ((payload: HoverGestureHandlerOnEndEventPayload) => void) | null;
}

/**
 * Returns the gesture handlers for the LineChart component.
 * @param param0 - The props to allow the gesture handlers to interact with the LineChart component.
 * @returns The gesture handlers for the LineChart component.
 */
export const useGestures = ({
  x,
  y,
  path,
  height,
  minValue,
  maxValue,
  cursorRadius,
  onPanGestureBegin,
  onPanGestureChange,
  onPanGestureEnd,
  onHoverGestureBegin,
  onHoverGestureChange,
  onHoverGestureEnd,
}: UseGestureProps) => {
  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      x.value = event.x;
      y.value = getYForX({ path, x: event.x });
      const point = interpolate(
        y.value,
        [cursorRadius, height - cursorRadius],
        [maxValue, minValue]
      );
      if (onPanGestureBegin) onPanGestureBegin({ event, point });
    })
    .onChange((event) => {
      x.value = event.x;
      y.value = getYForX({ path, x: event.x });
      const point = interpolate(
        y.value,
        [cursorRadius, height - cursorRadius],
        [maxValue, minValue]
      );
      if (onPanGestureChange) onPanGestureChange({ event, point });
    })
    .onEnd((event) => {
      x.value = -cursorRadius;
      if (onPanGestureEnd) onPanGestureEnd(event);
    });

  const hoverGesture = Gesture.Hover()
    .onBegin((event) => {
      x.value = event.x;
      y.value = getYForX({ path, x: event.x });
      const point = interpolate(
        y.value,
        [cursorRadius, height - cursorRadius],
        [maxValue, minValue]
      );
      if (onHoverGestureBegin) onHoverGestureBegin({ event, point });
    })
    .onChange((event) => {
      x.value = event.x;
      y.value = getYForX({ path, x: event.x });
      const point = interpolate(
        y.value,
        [cursorRadius, height - cursorRadius],
        [maxValue, minValue]
      );
      if (onHoverGestureChange) onHoverGestureChange({ event, point });
    })
    .onEnd((event) => {
      x.value = -cursorRadius;
      if (onHoverGestureEnd) onHoverGestureEnd(event);
    });

  // We return a composed gesture that listens to both pan and hover gestures. This is to
  // allow the chart component to work on both touch and mouse devices.
  return Gesture.Race(hoverGesture, panGesture);
};
