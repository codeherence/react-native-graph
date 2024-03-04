/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import "react-native-gesture-handler";
import { Slot } from "expo-router";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default () => (
  <GestureHandlerRootView style={styles.container}>
    <Slot />
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({ container: { flex: 1 } });
