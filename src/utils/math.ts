import type { Vector, SkPath } from "@shopify/react-native-skia";
import { PathVerb, Skia, vec } from "@shopify/react-native-skia";
import { scaleSqrt, scaleTime } from "d3";
import { CurveFactory, curveLinear, line } from "d3-shape";

/**
 * Rounds a number to a specified precision.
 *
 * @param value The value to round
 * @param precision The precision to round the value to. Defaults to 15.
 * @returns The rounded value
 */
export const round = (value: number, precision: number = 15): number => {
  "worklet";
  const p = Math.pow(10, precision);
  return Math.round(value * p) / p;
};

/**
 * Given a linear path and x value, computes the:
 *  1. real x value on the path closest to the input x value
 *  2. real y value on the path closest to the input x value
 *  3. index of the x value in the path
 *
 * @param path The path to process. This path must have been created using a linear curve.
 * @param x The x value being evaluated. This is the raw x value of the gesture.
 * @returns A tuple containing the x, y, and index values
 */
const linearYForX = (path: SkPath, x: number): [number, number, number] => {
  "worklet";
  const cmds = path.toCmds();
  let from: Vector = vec(0, 0);
  let dataIndex = 0;

  for (let i = 0; i < cmds.length; ++i) {
    const cmd = cmds[i];
    if (cmd == null) break;
    if (cmd[0] === PathVerb.Move) {
      // If the path starts with a move command, set the from point
      from = vec(cmd[1], cmd[2]);
    } else if (cmd[0] === PathVerb.Line) {
      // If the path contains a line command, check if the x value is within the bounds of the line
      const to = vec(cmd[1], cmd[2]);
      if ((x >= from.x && x <= to.x) || (x <= from.x && x >= to.x)) {
        // If x is closer to left point, use left point's y value, otherwise use right point's y value
        const closerToLeft = Math.abs(x - from.x) < Math.abs(x - to.x);
        const xValue = closerToLeft ? from.x : to.x;
        const yValue = closerToLeft ? from.y : to.y;
        return [round(xValue, 15), round(yValue, 15), closerToLeft ? dataIndex : dataIndex + 1];
      }
      from = to;
      ++dataIndex;
    }
  }

  return [0, 0, 0];
};

/**
 * Given a path and an x value, gets the closest x and y values on the path for the x value, and
 * the index of the x value in the path.
 * @param path The path to get the x and y values from
 * @param x The raw x value of the gesture
 * @returns A tuple containing the x, y, and index values
 */
export const getClosestPointForX = (path: SkPath, x: number) => {
  "worklet";
  return linearYForX(path, x);
};

export interface ComputePathProps {
  width: number;
  height: number;
  points: [number, number][];
  cursorRadius?: number;
  minValue: number;
  maxValue: number;
  minTimestamp: number;
  maxTimestamp: number;
  curveType: "linear";
}

/**
 * Computes the path of the chart based on the points array. If the points array is empty, a
 * horizontal straight line across the center of the chart is returned.
 * @param param0
 * @returns
 */
export const computePath = ({
  width,
  height,
  points,
  cursorRadius = 0,
  minTimestamp,
  maxTimestamp,
  minValue,
  maxValue,
}: ComputePathProps): SkPath => {
  "worklet";

  const straightLine = Skia.Path.Make()
    .moveTo(0, height / 2)
    .lineTo(width, height / 2);
  if (points.length === 0) return straightLine; // No data, return a straight line

  const scaleX = scaleTime().domain([minTimestamp, maxTimestamp]).range([0, width]);
  const scaleY = scaleSqrt()
    .domain([minValue, maxValue])
    .range([height - cursorRadius, cursorRadius]);
  const curve: CurveFactory = curveLinear;
  const rawPath = line()
    .x(([x]) => scaleX(x))
    .y(([, y]) => scaleY(y))
    .curve(curve)(points);

  if (rawPath === null) return straightLine;
  return Skia.Path.MakeFromSVGString(rawPath) ?? straightLine;
};

/**
 * Get the index and value of the minimum value in the points array
 * @returns The index and value of the minimum value in the points array
 */
const getMinValue = (points: [number, number][]): [number, number] => {
  if (points.length === 0) return [0, 0];

  return points.reduce<[number, number]>(
    (acc, [_, value], index) => {
      if (value < acc[1]) return [index, value];
      return acc;
    },
    [0, Number.MAX_SAFE_INTEGER]
  );
};

/**
 * Get the index and value of the maximum value in the points array
 * @returns The index and value of the maximum value in the points array
 */
const getMaxValue = (points: [number, number][]): [number, number] => {
  if (points.length === 0) return [0, 0];

  return points.reduce<[number, number]>(
    (acc, [_, value], index) => {
      if (value > acc[1]) return [index, value];
      return acc;
    },
    [0, Number.MIN_SAFE_INTEGER]
  );
};

/**
 * Computes the data needed to render the graph.
 *
 * @param points The points to render on the graph
 * @returns The data used by the graph
 */
export const computeGraphData = (points: [number, number][]) => {
  "worklet";

  if (points.length === 0) {
    return {
      points: [],
      minTimestamp: 0,
      maxTimestamp: 0,
      minValue: 0,
      minValueIndex: 0,
      minValueXProportion: 0,
      maxValue: 0,
      maxValueIndex: 0,
      maxValueXProportion: 0,
    };
  }

  const timestamps = points.map(([timestamp]) => timestamp);
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const [minValueIndex, minValue] = getMinValue(points);
  const [maxValueIndex, maxValue] = getMaxValue(points);

  // We subtract 1 since the index is 0-based
  const minValueXProportion = minValueIndex / (points.length - 1);
  const maxValueXProportion = maxValueIndex / (points.length - 1);

  return {
    points,
    minTimestamp,
    maxTimestamp,
    minValue,
    minValueIndex,
    minValueXProportion,
    maxValue,
    maxValueIndex,
    maxValueXProportion,
  };
};
