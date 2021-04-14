import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { ThemeContext } from './utility_components/theme-context';
import { AppNavigator } from './utility_components/navigation.component';
import {default as mapping} from './utility_components/mapping.json'


export default () => {

  const [theme, setTheme] = React.useState('light');
  const [backgroundColor, setBackgroundColor] = React.useState('#ffffee');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    const color = nextTheme === 'dark'? '#222B45': '#ffffee'

    setTheme(nextTheme);
    setBackgroundColor(color);
    
  };

  return (
    <>
      <IconRegistry icons={EvaIconsPack}/>
      <ThemeContext.Provider value={{ theme, toggleTheme, backgroundColor }}>
        <ApplicationProvider customMapping={mapping} {...eva} theme={eva[theme]}>
            <AppNavigator/>
        </ApplicationProvider>
      </ThemeContext.Provider>
    </>
  );
};