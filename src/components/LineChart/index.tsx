import { Canvas, Path } from '@shopify/react-native-skia';
import type { SkFont, Vector } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { interpolate, useSharedValue } from 'react-native-reanimated';

import type { BannerComponentProps } from './Banner';
import { Cursor } from './Cursor';
import { curveLinesBezier } from './Math';
import { useGestureHandler } from './useGestureHandler';

export type LineChartProps = {
  width: number;
  height: number;
  /** Array of [x, y] points for the chart */
  points: [number, number][];
  cursorRadius?: number;
  strokeWidth?: number;
  BannerComponent?: React.FC<BannerComponentProps>;
};

// const COLORS = [
//   "#FF0000",
//   "#00FF00",
//   "#0000FF",
//   "#FFFF00",
//   "#00FFFF",
//   "#FF00FF",
// ];

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
      return null;
    }

    const { points, minTimestamp, maxTimestamp, minValue, maxValue } =
      computedData;

    const skPoints: Vector[] = points.map(([x, y]) => ({
      x: interpolate(x, [minTimestamp, maxTimestamp], [0, width]),
      y: interpolate(
        y,
        [minValue, maxValue],
        [height - cursorRadius, cursorRadius]
      ),
    }));

    return curveLinesBezier({ points: skPoints });
  }, [computedData, width]);

  return (
    <Canvas style={{ width, height }} onTouch={onTouch}>
      {path && (
        <Path
          style="stroke"
          path={path}
          strokeWidth={strokeWidth}
          color="black"
        >
          {/* <LinearGradient
            start={vec(0, 0)}
            end={vec(width, 0)}
            colors={COLORS}
          /> */}
        </Path>
      )}

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
