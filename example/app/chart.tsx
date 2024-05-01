import {
  type AxisLabelComponentProps,
  LineChart,
  type PanGestureHandlerOnChangeEventPayload,
  HoverGestureHandlerOnChangeEventPayload,
} from "@codeherence/react-native-graph";
import { LinearGradient, vec } from "@shopify/react-native-skia";
import { useCallback, useMemo, useReducer } from "react";
import { Button, ScrollView, StyleSheet, Text } from "react-native";
import { useAnimatedProps, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AnimatedText from "../components/AnimatedText";
import aapl_prices from "../data/aapl_prices.json";
import msft_prices from "../data/msft_prices.json";
import nvda_prices from "../data/nvda_prices.json";
import unity_prices from "../data/unity_prices.json";

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

const priceMap = {
  msft: msft_prices.results
    .reverse()
    .map<[number, number]>((r) => [new Date(r.date).getTime(), r.close]),
  aapl: aapl_prices.results
    .reverse()
    .map<[number, number]>((r) => [new Date(r.date).getTime(), r.close]),
  nvda: nvda_prices.results
    .reverse()
    .map<[number, number]>((r) => [new Date(r.date).getTime(), r.close]),
  unity: unity_prices.results
    .reverse()
    .map<[number, number]>((r) => [new Date(r.date).getTime(), r.close]),
};

const priceMapKeys = Object.keys(priceMap) as (keyof typeof priceMap)[];

export default () => {
  const [counter, increment] = useReducer((s: number) => s + 1, 0);

  const { bottom, left, right } = useSafeAreaInsets();

  const latestPrice = useSharedValue("0");
  const symbol = priceMapKeys[counter % priceMapKeys.length]!;
  const data: [number, number][] = useMemo(() => {
    latestPrice.value = uiFormatter(priceMap[symbol][priceMap[symbol].length - 1]![1]);
    return priceMap[symbol];
  }, [symbol]);

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: bottom,
        paddingLeft: left,
        paddingRight: right,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Button title={`Showing ${symbol}. Click to switch.`} onPress={increment} />
      <AnimatedText style={styles.price} animatedProps={animatedProps} />
      <LineChart
        points={data}
        style={styles.chart}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  chart: { flex: 1, minHeight: 400 },
  price: { fontSize: 32 },
});
