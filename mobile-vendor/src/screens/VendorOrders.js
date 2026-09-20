import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { apiFetch } from '../api/client'

export default function VendorOrders(){
  const [orders,setOrders]=useState([])
  const [loading,setLoading]=useState(true)
  const load=async()=>{
    setLoading(true)
    try{ const d=await apiFetch('/api/orders',{auth:true}); setOrders(d.orders)}catch(e){ console.warn(e.message)}
    finally{ setLoading(false)}
  }
  useEffect(()=>{load()},[])
  const updateStatus=async(id,status)=>{
    try{ await apiFetch(`/api/orders/${id}/status`,{method:'PATCH', auth:true, body:{status}}); load()}catch(e){ Alert.alert('Error', e.message)}
  }
  if(loading) return <View style={styles.center}><ActivityIndicator/></View>
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Vendor Orders • {orders.length}</Text>
      <FlatList data={orders} keyExtractor={i=>i.id} contentContainerStyle={{padding:12, gap:10}}
        renderItem={({item})=> (
          <View style={styles.card}>
            <Text style={styles.title}>#{item.id.slice(0,8)} • {item.userName}</Text>
            <Text style={styles.muted}>{item.items.map(i=>`${i.title.slice(0,20)} x${i.qty}`).join(', ')}</Text>
            <Text style={styles.total}>${item.total} • <Text style={[styles.badge, styles[item.status]]}>{item.status}</Text></Text>
            <View style={{flexDirection:'row', gap:8, marginTop:8}}>
              <TouchableOpacity onPress={()=>updateStatus(item.id,'processing')} style={styles.btn}><Text style={styles.btnText}>Processing</Text></TouchableOpacity>
              <TouchableOpacity onPress={()=>updateStatus(item.id,'shipped')} style={[styles.btn, {backgroundColor:'#fff', borderWidth:1, borderColor:'#0F0F0F'}]}><Text style={{color:'#0F0F0F', fontWeight:'700'}}>Shipped</Text></TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.muted}>No orders</Text>}
      />
    </View>
  )
}
const styles=StyleSheet.create({
  container:{flex:1, backgroundColor:'#FFFDFB', paddingTop:48},
  center:{flex:1, justifyContent:'center', alignItems:'center'},
  header:{fontSize:16, fontWeight:'800', padding:12},
  card:{backgroundColor:'#fff', borderWidth:1, borderColor:'#E8E0D8', borderRadius:12, padding:12},
  title:{fontWeight:'700', fontSize:13},
  muted:{fontSize:11, color:'#6B6B6B', marginTop:4},
  total:{fontWeight:'700', marginTop:6},
  badge:{paddingVertical:2, paddingHorizontal:6, borderRadius:6, fontSize:10, fontWeight:'700'},
  pending:{backgroundColor:'#FFF7ED', color:'#9A3412'},
  processing:{backgroundColor:'#EFF6FF', color:'#1E40AF'},
  shipped:{backgroundColor:'#F0F9FF', color:'#0C4A6E'},
  delivered:{backgroundColor:'#ECFDF3', color:'#065F46'},
  btn:{backgroundColor:'#0F0F0F', paddingVertical:8, paddingHorizontal:12, borderRadius:999},
  btnText:{color:'#fff', fontWeight:'700', fontSize:12}
})
