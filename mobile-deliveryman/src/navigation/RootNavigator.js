import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import DeliveryHome from '../screens/DeliveryHome'
import LoginScreen from '../screens/LoginScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function Tabs(){
  return (
    <Tab.Navigator screenOptions={{headerShown:false, tabBarActiveTintColor:'#0F0F0F'}}>
      <Tab.Screen name="Deliveries" component={DeliveryHome} />
    </Tab.Navigator>
  )
}
export default function RootNavigator(){
  const {loading}=useAuth()
  if(loading) return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Loading VÉLORA Delivery…</Text></View>
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown:false}}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
