import {
  type AxisLabelComponentProps,
  LineChart,
  type PanGestureHandlerOnChangeEventPayload,
  HoverGestureHandlerOnChangeEventPayload,
} from "@codeherence/react-native-graph";
import { LinearGradient, vec } from "@shopify/react-native-skia";
import { useCallback, useMemo } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useAnimatedProps, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AnimatedText from "../components/AnimatedText";
import msft_prices from "../data/msft_prices.json";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const AxisLabel: React.FC<AxisLabelComponentProps> = ({ value }) => (
  <Text selectable={false}>{formatter.format(value)}</Text>
);

const uiFormatter = (price: number) => {
  "worklet";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

export default () => {
  const { width } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const data: [number, number][] = useMemo(
    () =>
      msft_prices.results
        .reverse()
        .map<[number, number]>((r) => [new Date(r.date).getTime(), r.close]),
    []
  );

  const latestPrice = useSharedValue("0");

  const onHoverChangeWorklet = useCallback((evt: HoverGestureHandlerOnChangeEventPayload) => {
    "worklet";
    latestPrice.value = uiFormatter(evt.point);
  }, []);

  const onGestureChangeWorklet = useCallback((evt: PanGestureHandlerOnChangeEventPayload) => {
    "worklet";
    latestPrice.value = uiFormatter(evt.point);
  }, []);

  const onEndWorklet = useCallback(() => {
    "worklet";
    latestPrice.value = uiFormatter(data[data.length - 1]![1]);
  }, [data]);

  const animatedProps = useAnimatedProps(() => {
    return { text: latestPrice.value };
  }, []);

  return (
    <View style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}>
      <AnimatedText style={styles.price} animatedProps={animatedProps} />
      <LineChart
        points={data}
        style={[styles.chart, { width }]}
        TopAxisLabel={AxisLabel}
        BottomAxisLabel={AxisLabel}
        onPanGestureChange={onGestureChangeWorklet}
        onPanGestureEnd={onEndWorklet}
        onHoverGestureEnd={onEndWorklet}
        onHoverGestureChange={onHoverChangeWorklet}
        strokeWidth={2}
        PathFill={({ width }) => (
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width, 0)}
            colors={["blue", "red", "purple"]}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  chart: { flex: 1, maxHeight: 400 },
  price: { fontSize: 32 },
});
