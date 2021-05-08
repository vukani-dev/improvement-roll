import * as React from 'react';
import {
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  Icon,
  Button,
  Select,
  SelectItem,
  IndexPath,
} from '@ui-kitten/components';

import {ThemeContext} from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';

const exportTypes = ['JSON', 'TOML', 'YAML'];

export default ({navigation}) => {
  const [selectedIndex, setSelectedIndex] = React.useState(new IndexPath(0));
  const displayValue = exportTypes[selectedIndex.row];
  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
  );
  const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
  const themeContext = React.useContext(ThemeContext);
  const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);
  return (
    <Layout style={styleSheet.columned_container}>
      <TopNavigation
        alignment="center"
        style={{backgroundColor: themeContext.backgroundColor}}
        title="Import / Export"
        accessoryLeft={BackAction}
      />
      <Layout>
        <Button
          style={{
            marginTop: 100,
            marginBottom: 70,
            height: 90,
            marginHorizontal: 60,
          }}>
          Import
        </Button>

        <Layout style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
          <Button
            onPress={() =>
              navigation.navigate('Categories', {
                action: 'export',
                type: displayValue,
              })
            }>
            Export as...
          </Button>
          <Select
            style={{width: 200}}
            selectedIndex={selectedIndex}
            onSelect={(index) => setSelectedIndex(index)}
            value={displayValue}>
            <SelectItem title="JSON" />
            <SelectItem title="TOML" />
            <SelectItem title="YAML" />
          </Select>
        </Layout>
      </Layout>
    </Layout>
  );
};
