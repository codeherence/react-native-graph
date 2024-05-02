import { Circle, Group, Line, vec } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import type { DerivedValue, SharedValue } from "react-native-reanimated";

export interface CursorProps {
  /** The x position of the cursor */
  x: SharedValue<number>;
  /** The y position of the cursor */
  y: DerivedValue<number>;
  /** The canvas height */
  height: number;
  /** The radius of the cursor */
  cursorRadius: number;
  /** The color of the cursor */
  cursorColor: string;
  /**
   * The color of the cursor line.
   * @default "rgba(0, 0, 0, 0.5)"
   */
  cursorLineColor: string;
  /**
   * The width of the cursor line.
   * @default 2
   */
  cursorLineWidth: number;
  /**
   * Whether to hide the cursor line.
   * @default false
   */
  hideCursorLine: boolean;
}

type CursorLineProps = Pick<CursorProps, "x" | "height" | "cursorLineColor" | "cursorLineWidth">;

const CursorLine: React.FC<CursorLineProps> = ({ x, height, cursorLineColor, cursorLineWidth }) => {
  const transform = useDerivedValue(() => {
    return [{ translateX: x.value }];
  });

  return (
    <Line
      transform={transform}
      p1={vec(0, 0)}
      p2={vec(0, height)}
      color={cursorLineColor}
      strokeWidth={cursorLineWidth}
    />
  );
};

export const Cursor: React.FC<CursorProps> = ({
  x,
  y,
  height,
  cursorRadius,
  cursorColor,
  cursorLineColor,
  cursorLineWidth,
  hideCursorLine,
}) => {
  const cursorTransform = useDerivedValue(() => {
    return [{ translateX: x.value }, { translateY: y.value }];
  }, []);

  return (
    <>
      {!hideCursorLine && (
        <CursorLine
          x={x}
          height={height}
          cursorLineColor={cursorLineColor}
          cursorLineWidth={cursorLineWidth}
        />
      )}
      <Group transform={cursorTransform}>
        <Circle cx={0} cy={0} r={cursorRadius} color={cursorColor} />
      </Group>
    </>
  );
};
