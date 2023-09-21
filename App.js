import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './src/screen/HomeScreen';
import DecodeScreen from './src/screen/DecodeScreen';
import EncodeBismillah from './src/screen/EncodeBismillah';
import {PaperProvider} from 'react-native-paper';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Encode" component={EncodeBismillah} />
          <Stack.Screen name="Decode" component={DecodeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;
