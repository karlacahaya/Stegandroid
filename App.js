import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screen/HomeScreen';
import EncodeScreen from './src/screen/EncodeScreen';
import DecodeScreen from './src/screen/DecodeScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Encode" component={EncodeScreen} />
          <Stack.Screen name="Decode" component={DecodeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;