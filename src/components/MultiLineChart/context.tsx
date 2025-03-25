import { createContext, useContext, useMemo, useState } from "react";
import { LayoutRectangle } from "react-native";

interface MultiLineChartContextState {
  width: number;
  height: number;
  setCanvasSize: React.Dispatch<React.SetStateAction<LayoutRectangle>>;
  minY: number;
  maxY: number;
}

export const MultiLineChartContext = createContext<MultiLineChartContextState | undefined>(
  undefined
);

interface MultiLineChartProviderProps {
  points: Record<string, [number, number][]>;
  width?: number;
  height?: number;
}

export const MultiLineChartProvider: React.FC<
  React.PropsWithChildren<MultiLineChartProviderProps>
> = ({ points, children }) => {
  const [canvasSize, setCanvasSize] = useState<LayoutRectangle>({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  });

  const { minY, maxY } = useMemo(() => {
    const minY = Math.min(...Object.values(points).map((p) => Math.min(...p.map(([, y]) => y))));
    const maxY = Math.max(...Object.values(points).map((p) => Math.max(...p.map(([, y]) => y))));
    return { minY, maxY };
  }, [points]);

  return (
    <MultiLineChartContext.Provider
      value={{ width: canvasSize.width, height: canvasSize.height, setCanvasSize, minY, maxY }}
    >
      {children}
    </MultiLineChartContext.Provider>
  );
};

export const useMultiLineChartContext = () => {
  const context = useContext(MultiLineChartContext);
  if (!context) {
    throw new Error("useMultiLineChartContext must be used within a MultiLineChartProvider");
  }
  return context;
};
