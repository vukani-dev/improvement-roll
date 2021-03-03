import * as React from "react";
import { View, StyleSheet } from "react-native";
import Toast from "react-native-simple-toast";
import generalCategory from "../categories/DefaultCategories";
import { Button, Icon, Text } from "@ui-kitten/components";

import AsyncStorage from "@react-native-async-storage/async-storage";

function MainScreen({ route, navigation }) {
  if (route.params != undefined) {
    Toast.show(`Category "${route.params.categoryName}" ${route.params.action}.`);
  }

  React.useEffect(() => {
    AsyncStorage.getAllKeys().then((value) => {
      if (value.indexOf("categories") == -1) {
        const jsonValue = JSON.stringify([generalCategory]);
        AsyncStorage.setItem("categories", jsonValue);
      }
    });

  }, []);

  const RollIcon = (props) => <Icon name="flip-outline" {...props} />;
  const ListIcon = (props) => <Icon name="list-outline" {...props} />;
  const SettingsIcon = (props) => <Icon name="settings-2-outline" {...props} />;

  return (
    <View style={styles.container}>
      <Text style={{ marginTop: 100 }} category="h1">
        Improvement
      </Text>
      <Text style={{ marginBottom: 100 }} category="h1">
        Roll
      </Text>

      <Button
        accessoryLeft={RollIcon}
        onPress={() => navigation.navigate("Categories", { action: "roll" })}
      >
        Roll
      </Button>
      <Button
        style={{ margin: 10 }}
        accessoryLeft={ListIcon}
        onPress={() => navigation.navigate("Categories", { action: "view" })}
      >
        View Categories
      </Button>

      <Button
        accessoryLeft={SettingsIcon}
        onPress={() => navigation.navigate("About")}
      >
        Options
      </Button>
      {/* <Button onPress={() => navigation.navigate("AddCategory")}>Add</Button> */}

      {/* <Button title="Clear Data" onPress={() => _clearData()}></Button> */}
    </View>
  );
}
export default MainScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#ffffee",
  },
  button_container: {
    padding: 30,
  },
});
