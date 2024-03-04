import { LineChart } from "@codeherence/react-native-graph";
import { useCallback, useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Banner } from "../components/Banner";

const generateRandomData = (): [number, number][] => {
  return Array.from({ length: 100 }, (_, i) => [i, Math.random() * 2000]);
};

export default () => {
  const { top, bottom } = useSafeAreaInsets();
  const [data, setData] = useState<[number, number][]>(generateRandomData());

  const handlePress = useCallback(() => {
    setData(generateRandomData());
  }, []);

  return (
    <View style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}>
      <Button title="Randomize data" onPress={handlePress} />
      <LineChart points={data} style={styles.chart} BannerComponent={Banner} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  chart: { flex: 1 },
});
