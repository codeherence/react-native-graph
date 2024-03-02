import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { scaleSqrt, scaleTime } from "d3";
import { curveBasis, line } from "d3-shape";
import { useMemo } from "react";
import { useSharedValue } from "react-native-reanimated";

import type { BannerComponentProps } from "./Banner";
import { Cursor } from "./Cursor";
import { useGestureHandler } from "./useGestureHandler";

export type LineChartProps = {
  width: number;
  height: number;
  /** Array of [x, y] points for the chart */
  points: [number, number][];
  cursorRadius?: number;
  strokeWidth?: number;
  BannerComponent?: React.FC<BannerComponentProps>;
};

export const LineChart: React.FC<LineChartProps> = ({
  width,
  height,
  strokeWidth = 2,
  cursorRadius = 8,
  points: _points,
  BannerComponent = null,
}) => {
  const x = useSharedValue(0);
  const onTouch = useGestureHandler({ x, width, cursorRadius });

  // We separate the computation of the data from the rendering. This is so that these values are
  // not recomputed when the width or height of the chart changes, but only when the points change.
  const computedData = useMemo(() => {
    const dates = _points.map(([timestamp]) => timestamp);
    const values = _points.map(([, value]) => value);
    const minTimestamp = Math.min(...dates);
    const maxTimestamp = Math.max(...dates);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    return {
      points: _points,
      dates,
      values,
      minTimestamp,
      maxTimestamp,
      minValue,
      maxValue,
    };
  }, [_points]);

  const path = useMemo(() => {
    const { dates } = computedData;
    // If the dates array is empty, return a Path as a horizontal straight line
    // in the center of the chart
    if (dates.length === 0) {
      return Skia.Path.Make()
        .moveTo(0, height / 2)
        .lineTo(width, height / 2);
    }

    const { points, minTimestamp, maxTimestamp, minValue, maxValue } = computedData;
    const scaleX = scaleTime().domain([minTimestamp, maxTimestamp]).range([0, width]);
    const scaleY = scaleSqrt().domain([minValue, maxValue]).range([height, 0]);
    const rawPath = line()
      .x(([x]) => scaleX(x) as number)
      .y(([, y]) => scaleY(y) as number)
      .curve(curveBasis)(points) as string;

    return Skia.Path.MakeFromSVGString(rawPath);
  }, [computedData, width]);

  return (
    <Canvas style={{ width, height }} onTouch={onTouch}>
      {path && <Path style="stroke" path={path} strokeWidth={strokeWidth} color="black" />}

      <Cursor
        x={x}
        path={path}
        height={height}
        cursorRadius={cursorRadius}
        BannerComponent={BannerComponent}
      />
    </Canvas>
  );
};
