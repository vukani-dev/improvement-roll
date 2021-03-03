import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Main from "./screens/Main";
import Roll from "./screens/Roll";
import About from "./screens/About";
import Categories from "./screens/Categories";
import AddCategory from "./screens/AddCategory";
import Toast from "react-native-simple-toast";
import * as eva from "@eva-design/eva";
import {
  ApplicationProvider,
  Layout,
  Text,
  IconRegistry,
} from "@ui-kitten/components";
import { default as theme } from "./theme.json"; // <-- Import app theme

import { EvaIconsPack } from "@ui-kitten/eva-icons";

const Stack = createStackNavigator();

const test = () => {
  return <Button>hello</Button>;
};

const App = () => {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={{ ...eva.light, ...theme }}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Main"
              component={Main}
              options={{
                title: "Improvement Roll",
                headerTitleAlign: "center",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Roll"
              component={Roll}
              options={{
                title: "Select a Category",
                headerShown: false
              }}
            />
            <Stack.Screen
              name="Categories"
              component={Categories}
              options={{ title: "categories", headerShown: false }}
            />
            <Stack.Screen
              name="AddCategory"
              component={AddCategory}
              options={{ title: "Add a Category", headerShown: false }}
            />
            <Stack.Screen
              name="About"
              component={About}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ApplicationProvider>
    </>
  );
};

export default App;