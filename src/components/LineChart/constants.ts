import { ComputePathProps } from "./Math";

export const DEFAULT_COLOR = "black";
export const DEFAULT_STROKE_WIDTH = 2;
export const DEFAULT_CURSOR_RADIUS = 8;
export const DEFAULT_CURVE_TYPE: ComputePathProps["curveType"] = "linear";
export const DEFAULT_BANNER_COMPONENT = null;
export const DEFAULT_FORMATTER = (price: number) => {
  "worklet";
  return price.toString();
};
