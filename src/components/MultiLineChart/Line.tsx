import { Path, PathProps } from "@shopify/react-native-skia";
import { useMemo } from "react";

import { computeGraphData, computePath, ComputePathProps } from "../../utils/math";

interface LineProps extends Pick<PathProps, "children" | "color" | "strokeWidth" | "stroke"> {
  /** An array of tuples representing [time, value] pairs. */
  points?: [number, number][];
  /**
   * The width of the canvas. This value is not modifiable and will be injected by the parent component.
   */
  width?: number;
  /**
   * The height of the canvas. This value is not modifiable and will be injected by the parent component.
   */
  height?: number;
  strokeWidth?: number;
  curveType?: ComputePathProps["curveType"];
  minValue?: number;
  maxValue?: number;
}

export const Line: React.FC<LineProps> = ({
  points = [],
  width = 0,
  height = 0,
  strokeWidth = 2,
  curveType = "linear",
  minValue,
  maxValue,
  ...pathProps
}) => {
  const data = useMemo(() => {
    return computeGraphData(points);
  }, [points]);

  const path = useMemo(() => {
    return computePath({
      ...data,
      width,
      height,
      cursorRadius: 0,
      curveType,
      minValue: minValue ?? data.minValue,
      maxValue: maxValue ?? data.maxValue,
    });
  }, [data, width, height, curveType]);

  return <Path style="stroke" strokeWidth={strokeWidth} color="gray" {...pathProps} path={path} />;
};
