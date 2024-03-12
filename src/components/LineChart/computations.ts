import type { Vector, SkPath } from "@shopify/react-native-skia";
import { PathVerb, Skia, vec } from "@shopify/react-native-skia";
import { scaleSqrt, scaleTime } from "d3";
import { CurveFactory, curveLinear, line } from "d3-shape";

interface RoundProps {
  value: number;
  precision?: number;
}

const round = ({ value, precision = 0 }: RoundProps): number => {
  "worklet";

  const p = Math.pow(10, precision);
  return Math.round(value * p) / p;
};

interface LinearYForXProps {
  path: SkPath;
  x: number;
  precision?: number;
}

const linearYForX = ({ path, x, precision = 2 }: LinearYForXProps): number => {
  "worklet";

  const cmds = path.toCmds();
  let from: Vector = vec(0, 0);
  for (let i = 0; i < cmds.length; i++) {
    const cmd = cmds[i];
    if (cmd == null) return 0;
    if (cmd[0] === PathVerb.Move) {
      from = vec(cmd[1], cmd[2]);
    } else if (cmd[0] === PathVerb.Line) {
      const to = vec(cmd[1], cmd[2]);
      // If the x is between the two points, return the rounded interpolation of the y value
      if (x >= from.x && x <= to.x) {
        const t = (x - from.x) / (to.x - from.x);
        return round({ value: from.y + t * (to.y - from.y), precision });
      }
      from = to;
    }
  }
  return 0;
};

export interface GetYForXProps {
  path: SkPath;
  x: number;
  precision?: number;
}

export const getYForX = ({ path, x, precision = 2 }: GetYForXProps): number => {
  "worklet";
  return linearYForX({ path, x, precision });
};

export interface ComputePathProps {
  width: number;
  height: number;
  points: [number, number][];
  cursorRadius: number;
  minValue: number;
  maxValue: number;
  minTimestamp: number;
  maxTimestamp: number;
  curveType: "linear";
}

export const computePath = ({
  width,
  height,
  points,
  cursorRadius,
  minTimestamp,
  maxTimestamp,
  minValue,
  maxValue,
  curveType,
}: ComputePathProps): SkPath => {
  "worklet";

  const straightLine = Skia.Path.Make()
    .moveTo(0, height / 2)
    .lineTo(width, height / 2);

  // If the dates array is empty, return a Path as a horizontal straight line
  // in the center of the chart
  if (points.length === 0) return straightLine;

  const scaleX = scaleTime().domain([minTimestamp, maxTimestamp]).range([0, width]);
  const scaleY = scaleSqrt()
    .domain([minValue, maxValue])
    .range([height - cursorRadius, cursorRadius]);
  const curve: CurveFactory = curveType === "linear" ? curveLinear : curveLinear;
  const rawPath = line()
    .x(([x]) => scaleX(x))
    .y(([, y]) => scaleY(y))
    .curve(curve)(points);

  if (rawPath === null) return straightLine;
  return Skia.Path.MakeFromSVGString(rawPath) ?? straightLine;
};

interface GetMinValueProps {
  points: [number, number][];
}

/**
 * Get the index and value of the minimum value in the points array
 * @returns The index and value of the minimum value in the points array
 */
const getMinValue = ({ points }: GetMinValueProps): [number, number] => {
  if (points.length === 0) return [0, 0];

  return points.reduce<[number, number]>(
    (acc, [_, value], index) => {
      if (value < acc[1]) return [index, value];
      return acc;
    },
    [0, Number.MAX_SAFE_INTEGER]
  );
};

interface GetMaxValueProps {
  points: [number, number][];
}

/**
 * Get the index and value of the maximum value in the points array
 * @returns The index and value of the maximum value in the points array
 */
const getMaxValue = ({ points }: GetMaxValueProps): [number, number] => {
  if (points.length === 0) return [0, 0];

  return points.reduce<[number, number]>(
    (acc, [_, value], index) => {
      if (value > acc[1]) return [index, value];
      return acc;
    },
    [0, Number.MIN_SAFE_INTEGER]
  );
};

export const computeGraphData = (points: [number, number][]) => {
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
  const [minValueIndex, minValue] = getMinValue({ points });
  const [maxValueIndex, maxValue] = getMaxValue({ points });

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
