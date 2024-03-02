import { LineChart } from "@codeherence/react-native-graph";
import { useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Banner } from "../components/Banner";

export default () => {
  const { top, bottom } = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const data: [number, number][] = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => [i, Math.random() * 200]);
  }, []);

  return (
    <View
      style={{
        paddingTop: top,
        paddingBottom: bottom,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LineChart
        points={data}
        width={width}
        height={height - (top + bottom)}
        BannerComponent={Banner}
      />
    </View>
  );
};
