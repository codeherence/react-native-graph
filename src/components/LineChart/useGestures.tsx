import { Gesture } from "react-native-gesture-handler";
import { SharedValue } from "react-native-reanimated";

interface UseGestureProps {
  x: SharedValue<number>;
  cursorRadius: number;
}

export const useGestures = ({ x, cursorRadius }: UseGestureProps) => {
  const panGesture = Gesture.Pan()
    .onBegin((evt) => (x.value = evt.x))
    .onChange((evt) => (x.value = evt.x))
    .onEnd(() => (x.value = -cursorRadius));

  const hoverGesture = Gesture.Hover()
    .onBegin((evt) => (x.value = evt.x))
    .onChange((evt) => (x.value = evt.x))
    .onEnd(() => (x.value = -cursorRadius));

  return Gesture.Race(hoverGesture, panGesture);
};
