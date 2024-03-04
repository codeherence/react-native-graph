import { type AxisLabelComponentProps, LineChart } from "@codeherence/react-native-graph";
import { useCallback, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Banner } from "../components/Banner";

const generateRandomData = (): [number, number][] => {
  return Array.from({ length: 30 }, (_, i) => [i, Math.random() * 2000]);
};

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const AxisLabel: React.FC<AxisLabelComponentProps> = ({ value }) => (
  <Text>{formatter.format(value)}</Text>
);

export default () => {
  const { top, bottom } = useSafeAreaInsets();
  const [data, setData] = useState<[number, number][]>(generateRandomData());

  const handlePress = useCallback(() => {
    setData(generateRandomData());
  }, []);

  return (
    <View style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}>
      <Button title="Randomize data" onPress={handlePress} />
      <LineChart
        points={data}
        style={styles.chart}
        BannerComponent={Banner}
        TopAxisLabel={AxisLabel}
        BottomAxisLabel={AxisLabel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  chart: { flex: 1, maxHeight: "40%" },
});
