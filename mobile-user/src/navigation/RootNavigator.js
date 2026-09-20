import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import HomeScreen from '../screens/HomeScreen'
import LoginScreen from '../screens/LoginScreen'
import CartScreen from '../screens/CartScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown:false, tabBarActiveTintColor:'#0F0F0F' }}>
      <Tab.Screen name="Shop" component={HomeScreen} options={{ tabBarLabel:'Shop' }} />
      <Tab.Screen name="Bag" component={CartScreen} options={{ tabBarLabel:'Bag' }} />
    </Tab.Navigator>
  )
}

function AuthStack(){
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="HomeTabs" component={Tabs} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  )
}

export default function RootNavigator(){
  const { loading } = useAuth()
  if(loading) return <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#FFFDFB'}}><Text>Loading VÉLORA…</Text></View>
  return (
    <NavigationContainer>
      <AuthStack />
    </NavigationContainer>
  )
}
