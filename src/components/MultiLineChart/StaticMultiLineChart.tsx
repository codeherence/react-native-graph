import { Canvas } from "@shopify/react-native-skia";
import React, { useCallback, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";

import type { MultiLineChartProps } from "./MultiLineChart";
import { useMultiLineChartContext } from "./context";
import { batchedUpdates } from "../../libs/batchedUpdates";

export const StaticMultiLineChart = <Data extends Record<string, [number, number][]>>({
  points,
  children,
  onCanvasResize,
  ...viewProps
}: MultiLineChartProps<Data, true>) => {
  const [layoutComputed, setLayoutComputed] = useState(false);
  const { height, width, minY, maxY, setCanvasSize } = useMultiLineChartContext();

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
        </Canvas>
      </View>
    </View>
  );
};
StaticMultiLineChart.displayName = "StaticMultiLineChart";

const styles = StyleSheet.create({
  root: { position: "relative", overflow: "hidden" },
  container: { flex: 1 },
  canvas: { flex: 1 },
});

// : React.Children.map(children, (child) => {
//     if (!React.isValidElement(child)) return null;
//     if (child.type === React.Fragment) {
//       // If the child is a fragment, iteratively clone all children
//       return React.Children.map(child.props.children, (c) => {
//         if (!React.isValidElement(c)) return null;
//         return React.cloneElement(c, {
//           // @ts-ignore
//           ...c.props,
//           width,
//           height,
//           // @ts-ignore
//           points: points[c.props.dataKey] ?? [],
//         });
//       });
//     }

//     return React.cloneElement(child, {
//       ...child.props,
//       width,
//       height,
//       points: points[child.props.dataKey] ?? [],
//     });
//   })
