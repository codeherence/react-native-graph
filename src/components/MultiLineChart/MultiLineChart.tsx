import React from "react";
import type { ViewProps } from "react-native";

import { InteractiveLineChartProps, InteractiveMultiLineChart } from "./InteractiveMultiLineChart";
import { StaticMultiLineChart } from "./StaticMultiLineChart";
import { MultiLineChartProvider } from "./context";

export type MultiLineChartProps<
  Data extends Record<string, [number, number][]>,
  Static extends boolean = false,
> = React.PropsWithChildren<
  {
    points: Data;
    onCanvasResize?: (width: number, height: number) => void;
  } & Exclude<ViewProps, "children"> & {
      children: (args: { points: Data; height: number; width: number }) => React.ReactNode;
    } & (Static extends true
      ? { isStatic: true }
      : { isStatic: false } & InteractiveLineChartProps<Data>)
>;

export const MultiLineChart = <
  Data extends Record<string, [number, number][]>,
  Static extends boolean = false,
>({
  isStatic = false,
  ...props
}: MultiLineChartProps<Data, Static>) => {
  return (
    <MultiLineChartProvider points={props.points}>
      {/* <StaticMultiLineChart {...props} /> */}
      {isStatic ? (
        <StaticMultiLineChart isStatic {...props} />
      ) : (
        <InteractiveMultiLineChart isStatic={false} {...props} />
      )}
    </MultiLineChartProvider>
  );
};
MultiLineChart.displayName = "MultiLineChart";
