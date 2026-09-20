import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Linking } from 'react-native'
import { apiFetch } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function DeliveryHome(){
  const {user}=useAuth()
  const [orders,setOrders]=useState([])
  const [loading,setLoading]=useState(true)
  const [refreshing,setRefreshing]=useState(false)
  const [filter,setFilter]=useState('all')

  const load=async()=>{
    setLoading(true)
    try{ const d=await apiFetch('/api/orders',{auth:true}); setOrders(d.orders)}catch(e){ console.warn(e.message)}
    finally{ setLoading(false)}
  }
  useEffect(()=>{load()},[])
  const onRefresh=async()=>{ setRefreshing(true); await load(); setRefreshing(false)}
  const updateStatus=async(id,status)=>{
    try{ await apiFetch(`/api/orders/${id}/status`,{method:'PATCH', auth:true, body:{status}}); load()}catch(e){ alert(e.message)}
  }

  const myOrders=orders.filter(o=>!o.deliveryManId || o.deliveryManId===user?.id)
  const filtered=filter==='all'? myOrders : myOrders.filter(o=>o.status===filter)

  if(loading) return <View style={styles.center}><ActivityIndicator/><Text>Loading deliveries…</Text></View>

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>VÉLORA Delivery</Text>
        <Text style={styles.sub}>{user?.name} • {myOrders.length} visible • GPS ready (expo-location)</Text>
        <View style={styles.pills}>
          {['all','pending','processing','shipped','delivered'].map(f=> (
            <TouchableOpacity key={f} onPress={()=>setFilter(f)} style={[styles.pill, filter===f&&styles.pillActive]}><Text style={[styles.pillText, filter===f&&styles.pillTextActive]}>{f}</Text></TouchableOpacity>
          ))}
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i=>i.id}
        contentContainerStyle={{padding:12, gap:12}}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({item})=> (
          <View style={styles.card}>
            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
              <Text style={styles.title}>#{item.id.slice(0,8)}</Text>
              <Text style={[styles.badge, styles[item.status]]}>{item.status}</Text>
            </View>
            <Text style={styles.muted}>{item.userName} • {item.userEmail}</Text>
            <Text style={styles.muted}>{item.shippingAddress?.address}, {item.shippingAddress?.city} • ${item.total}</Text>
            <Text style={styles.items}>{item.items.map(i=>`${i.title.slice(0,18)} x${i.qty}`).join(', ')}</Text>
            <View style={{flexDirection:'row', gap:8, flexWrap:'wrap', marginTop:8}}>
              <TouchableOpacity onPress={()=>updateStatus(item.id,'shipped')} style={styles.btn}><Text style={styles.btnText}>Shipped</Text></TouchableOpacity>
              <TouchableOpacity onPress={()=>updateStatus(item.id,'delivered')} style={[styles.btn,{backgroundColor:'#fff', borderWidth:1, borderColor:'#0F0F0F'}]}><Text style={{color:'#0F0F0F', fontWeight:'700'}}>Delivered</Text></TouchableOpacity>
              <TouchableOpacity onPress={()=>Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.shippingAddress?.address+' '+item.shippingAddress?.city)}`)} style={[styles.btn,{backgroundColor:'#F7F3EF'}]}><Text style={{color:'#0F0F0F'}}>Navigate ↗</Text></TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No {filter} deliveries</Text>}
      />
    </View>
  )
}
const styles=StyleSheet.create({
  container:{flex:1, backgroundColor:'#FFFDFB'},
  center:{flex:1, justifyContent:'center', alignItems:'center'},
  header:{padding:16, paddingTop:48, backgroundColor:'#0F0F0F'},
  brand:{color:'#fff', fontSize:20, fontWeight:'800', letterSpacing:2},
  sub:{color:'#CFCFCF', fontSize:11, marginTop:4},
  pills:{flexDirection:'row', gap:8, flexWrap:'wrap', marginTop:10},
  pill:{paddingVertical:6, paddingHorizontal:12, borderRadius:999, backgroundColor:'#1A1A1A', borderWidth:1, borderColor:'#333'},
  pillActive:{backgroundColor:'#fff', borderColor:'#fff'},
  pillText:{color:'#CFCFCF', fontSize:11, fontWeight:'600'},
  pillTextActive:{color:'#0F0F0F'},
  card:{backgroundColor:'#fff', borderWidth:1, borderColor:'#E8E0D8', borderRadius:16, padding:12, gap:4},
  title:{fontWeight:'700'},
  muted:{fontSize:11, color:'#6B6B6B'},
  items:{fontSize:12, marginTop:4},
  badge:{fontSize:10, fontWeight:'800', paddingVertical:4, paddingHorizontal:8, borderRadius:999, overflow:'hidden'},
  pending:{backgroundColor:'#FFF7ED', color:'#9A3412'},
  processing:{backgroundColor:'#EFF6FF', color:'#1E40AF'},
  shipped:{backgroundColor:'#F0F9FF', color:'#0C4A6E'},
  delivered:{backgroundColor:'#ECFDF3', color:'#065F46'},
  btn:{paddingVertical:8, paddingHorizontal:12, borderRadius:999, backgroundColor:'#0F0F0F', alignItems:'center'},
  btnText:{color:'#fff', fontWeight:'700', fontSize:12},
  empty:{textAlign:'center', marginTop:40, color:'#6B6B6B'}
})
