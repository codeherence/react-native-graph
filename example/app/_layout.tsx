/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default () => (
  <GestureHandlerRootView style={styles.container}>
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="chart" />
    </Stack>
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({ container: { flex: 1 } });
