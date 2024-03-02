import { useTouchHandler } from "@shopify/react-native-skia";
import type { SharedValueType } from "@shopify/react-native-skia";

interface UseGestureHandlerProps {
  x: SharedValueType;
  cursorRadius: number;
  width: number;
}

export const useGestureHandler = ({ x, width, cursorRadius }: UseGestureHandlerProps) => {
  return useTouchHandler(
    {
      onStart: (ti) => {
        x.value = ti.x;
      },
      onActive: (ti) => {
        x.value = ti.x;
      },
      onEnd: () => {
        // Hide the cursor when the touch ends
        x.value = width + cursorRadius;
      },
    },
    [x]
  );
};
