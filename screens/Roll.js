import * as React from "react";
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SortableList from "react-native-sortable-list";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Categories from "./Categories";

import {
  Card,
  List,
  Text,
  Divider,
  Button,
  Icon,
  Modal,
} from "@ui-kitten/components";

var decks = [
  { key: "General", splitByTime: true },
  { key: "Training", splitByTime: true },
  { key: "Creative", splitByTime: false },
  { key: "Organization", splitByTime: true },
];

const _rollAndPickTask = (tasks) => {
  var randomIndex = Math.floor(Math.random() * tasks.length);
  return tasks[randomIndex];
};

const Roll = ({ route, navigation }) => {
  const tasks = route.params.tasks;
  const [lastRolledTask, setLastRolledTask] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setTimeout(() => {
      var selectedTask = _rollAndPickTask(tasks);
      setLastRolledTask(selectedTask);
      setLoading(false);
    }, 2000);
  }, []);

  const _reRoll = () => {
    setLoading(true);
    setTimeout(() => {
      if (tasks.length > 1) {
        var filteredTasks = tasks.filter((e) => e.name != lastRolledTask.name);
        setLastRolledTask(_rollAndPickTask(filteredTasks));
        setLoading(false);
      }
    }, 3000);
  };

  const renderRerollIcon = (props) => <Icon {...props} name="flip-2-outline" />;

  const homeIcon = (props) => <Icon {...props} name="home" />;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#ffffee",
        padding: 15,
        paddingTop: 50,
        alignContent: "center",
      }}
    >
      {loading ? (
        <ActivityIndicator
          style={{ alignSelf: "center" }}
          size="large"
          color="#0000ff"
          animating={loading}
        />
      ) : (
        <View>
          <Text
            category="h3"
            style={{ marginBottom: 40, marginTop: 50, textAlign: "center" }}
          >
            {lastRolledTask.name}
          </Text>
          <Text
            category="h5"
            style={{ marginBottom: 70, marginTop: 50, textAlign: "center" }}
          >
            {lastRolledTask.desc}
          </Text>

          <Button
            accessoryLeft={renderRerollIcon}
            style={{ marginHorizontal: 30, marginBottom: 25 }}
            onPress={_reRoll}
          >
            Re-roll
          </Button>
          <Button
            accessoryLeft={homeIcon}
            title="Home"
            onPress={navigation.popToTop}
          >
            Home
          </Button>
        </View>
      )}
    </View>
  );
};
export default Roll;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
});
