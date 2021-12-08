import * as React from 'react';
import Toast from 'react-native-simple-toast';
import generalCategory from '../categories/DefaultCategories';

import { ThemeContext } from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Kitten from '../utility_components/ui-kitten.component.js';

const SearchIcon = (props) => (
    <Kitten.Icon {...props} name='search-outline' />
);
const BackIcon = (props) => <Kitten.Icon {...props} name="arrow-back" />;

export default ({ route, navigation }) => {
    const themeContext = React.useContext(ThemeContext);
    const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

    const [searchString, setSearchString] = React.useState('');


    const BackAction = () => (
        <Kitten.TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
    );

    React.useEffect(() => {

    })


    return (<Kitten.Layout style={{ flex: 1, backgroundColor: themeContext.backgroundColor }}>

        <Kitten.TopNavigation
            alignment="center"
            style={{ backgroundColor: themeContext.backgroundColor }}
            title='Community Categories'
            accessoryLeft={BackAction}
        />
        <Kitten.Input
            value={searchString}
            placeholder='Search'
            accessoryRight={SearchIcon}
            keyboardType={'visible-password'}
            secureTextEntry={true}
            onChangeText={nextValue => setSearchString(nextValue)}
        />
        <Kitten.Text>
            COMM CATS
        </Kitten.Text>

    </Kitten.Layout>)
}