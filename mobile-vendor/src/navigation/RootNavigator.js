import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import VendorHome from '../screens/VendorHome'
import VendorOrders from '../screens/VendorOrders'
import LoginScreen from '../screens/LoginScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function Tabs(){
  return (
    <Tab.Navigator screenOptions={{headerShown:false, tabBarActiveTintColor:'#0F0F0F'}}>
      <Tab.Screen name="Products" component={VendorHome} />
      <Tab.Screen name="Orders" component={VendorOrders} />
    </Tab.Navigator>
  )
}
function AuthStack(){
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  )
}
export default function RootNavigator(){
  const {loading}=useAuth()
  if(loading) return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Loading VÉLORA Vendor…</Text></View>
  return <NavigationContainer><AuthStack/></NavigationContainer>
}
