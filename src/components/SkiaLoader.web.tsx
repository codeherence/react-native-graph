import { useEffect, useState } from "react";
import { Text } from "react-native";
import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import Breathe from "./Breathe";

export default function SkiaLoader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await LoadSkiaWeb();
        setLoaded(true);
      } catch (error) {
        console.error(error);
        setLoaded(false);
      }
    })();
  }, []);

  if (!loaded) return <Text>Loading Skia...</Text>;

  return <Breathe />;
}
