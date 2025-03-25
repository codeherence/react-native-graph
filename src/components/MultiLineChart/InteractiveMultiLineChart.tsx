import { Canvas } from "@shopify/react-native-skia";
import React, { useCallback, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";

import type { MultiLineChartProps } from "./MultiLineChart";
import { useMultiLineChartContext } from "./context";
import { UseGestureProps, useGestures } from "./useGestures";
import { batchedUpdates } from "../../libs/batchedUpdates";

export interface InteractiveLineChartProps<Data extends Record<string, [number, number][]>> {
  gestureLongPressDelay?: number;
  /**
   * Extra elements to render on the canvas. This prop is separated from the children prop to allow
   * for clear separation between line chart elements and extra elements.
   */
  ExtraCanvasElements?: JSX.Element;
  onPanGestureBegin?: UseGestureProps<Data>["onPanGestureBegin"];
  onPanGestureChange?: UseGestureProps<Data>["onPanGestureChange"];
  onPanGestureEnd?: UseGestureProps<Data>["onPanGestureEnd"];
}

export const InteractiveMultiLineChart = <Data extends Record<string, [number, number][]>>({
  points,
  children,
  gestureLongPressDelay = 200,
  ExtraCanvasElements,
  onCanvasResize,
  onPanGestureBegin,
  onPanGestureChange,
  onPanGestureEnd,
  ...viewProps
}: MultiLineChartProps<Data, false>) => {
  const [layoutComputed, setLayoutComputed] = useState(false);
  const { height, width, minY, maxY, setCanvasSize } = useMultiLineChartContext();

  const gestures = useGestures({
    points,
    height,
    gestureLongPressDelay,
    onPanGestureBegin,
    onPanGestureChange,
    onPanGestureEnd,
  });

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    // Batch the updates to avoid unnecessary re-renders
    batchedUpdates(() => {
      setLayoutComputed(true);
      onCanvasResize?.(e.nativeEvent.layout.width, e.nativeEvent.layout.height);
      setCanvasSize(e.nativeEvent.layout);
    });
  }, []);

  return (
    <View style={[styles.root, viewProps.style]} {...viewProps}>
      <GestureDetector gesture={gestures}>
        <View style={styles.container} onLayout={onLayout}>
          <Canvas style={{ height, width }}>
            {!layoutComputed
              ? null
              : // Since the children need to be invoked, we invoke the children then inject the width and height manually.
                (() => {
                  const invokedChildren = children({ height, width, points });
                  if (!React.isValidElement(invokedChildren)) return null;

                  if (invokedChildren.type === React.Fragment) {
                    // If the child is a fragment, iteratively clone all children
                    return React.Children.map(invokedChildren.props.children, (c) => {
                      if (!React.isValidElement(c)) return null;
                      return React.cloneElement(c, {
                        // @ts-ignore
                        ...c.props,
                        width,
                        height,
                        minValue: minY,
                        maxValue: maxY,
                      });
                    });
                  }

                  return React.cloneElement(invokedChildren, {
                    ...invokedChildren.props,
                    width,
                    height,
                    minValue: minY,
                    maxValue: maxY,
                  });
                })()}

            {ExtraCanvasElements}
          </Canvas>
        </View>
      </GestureDetector>
    </View>
  );
};
InteractiveMultiLineChart.displayName = "StaticMultiLineChart";

const styles = StyleSheet.create({
  root: { position: "relative", overflow: "hidden" },
  container: { flex: 1 },
  canvas: { flex: 1 },
});
