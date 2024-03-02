import { Canvas, Path } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { useSharedValue } from "react-native-reanimated";

import type { BannerComponentProps } from "./Banner";
import { Cursor } from "./Cursor";
import { computePath } from "./Math";
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
    const timestamps = _points.map(([timestamp]) => timestamp);
    const values = _points.map(([, value]) => value);
    const minTimestamp = Math.min(...timestamps);
    const maxTimestamp = Math.max(...timestamps);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    return { points: _points, minTimestamp, maxTimestamp, minValue, maxValue };
  }, [_points]);

  const path = useMemo(() => {
    return computePath({ ...computedData, width, height });
  }, [computedData, width, height]);

  return (
    <Canvas style={{ width, height }} onTouch={onTouch}>
      <Path style="stroke" path={path} strokeWidth={strokeWidth} color="black" />
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
