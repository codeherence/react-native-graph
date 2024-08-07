import { createContext, useContext, useState } from "react";
import { LayoutRectangle } from "react-native";

interface MultiLineChartContextState {
  width: number;
  height: number;
  setCanvasSize: React.Dispatch<React.SetStateAction<LayoutRectangle>>;
}

export const MultiLineChartContext = createContext<MultiLineChartContextState | undefined>(
  undefined
);

interface MultiLineChartProviderProps {
  width?: number;
  height?: number;
}

export const MultiLineChartProvider: React.FC<
  React.PropsWithChildren<MultiLineChartProviderProps>
> = ({ children }) => {
  const [canvasSize, setCanvasSize] = useState<LayoutRectangle>({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  });

  return (
    <MultiLineChartContext.Provider
      value={{
        width: canvasSize.width,
        height: canvasSize.height,
        setCanvasSize,
      }}
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
