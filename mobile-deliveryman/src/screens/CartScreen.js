import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { apiFetch } from '../api/client'

export default function CartScreen() {
  const [cart, setCart] = useState({ items:[], total:0 })
  const [loading, setLoading] = useState(true)

  const load=async()=>{
    setLoading(true)
    try{ const d=await apiFetch('/api/cart',{auth:true}); setCart(d)}catch(e){ console.warn(e.message)}
    finally{ setLoading(false)}
  }
  useEffect(()=>{ load() },[])

  const updateQty=async(productId, qty)=>{
    try{ await apiFetch(`/api/cart/${productId}`,{method:'PUT', auth:true, body:{qty}}); load()}catch(e){ Alert.alert('Error', e.message)}
  }
  const remove=async(productId)=>{
    try{ await apiFetch(`/api/cart/${productId}`,{method:'DELETE', auth:true}); load()}catch(e){ Alert.alert('Error', e.message)}
  }
  const checkout=async()=>{
    try{
      await apiFetch('/api/orders',{method:'POST', auth:true, body:{ shippingAddress:{ address:'Expo Street 1', city:'Mumbai', zip:'400001' }, paymentMethod:'COD' }})
      Alert.alert('Order placed','Your order is pending!')
      load()
    }catch(e){ Alert.alert('Checkout failed', e.message)}
  }

  if(loading) return <View style={styles.center}><ActivityIndicator/></View>
  if(!cart.items.length) return <View style={styles.center}><Text>Bag is empty</Text><TouchableOpacity onPress={load} style={styles.btn}><Text style={styles.btnText}>Refresh</Text></TouchableOpacity></View>

  return (
    <View style={styles.container}>
      <FlatList data={cart.items} keyExtractor={i=>i.productId} contentContainerStyle={{padding:16, gap:12}}
        renderItem={({item})=> (
          <View style={styles.row}>
            <View style={{flex:1}}>
              <Text style={styles.title}>{item.product?.title}</Text>
              <Text style={styles.muted}>${item.product?.price} x {item.qty}</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity onPress={()=>updateQty(item.productId, Math.max(1, item.qty-1))} style={styles.qtyBtn}><Text>-</Text></TouchableOpacity>
              <Text>{item.qty}</Text>
              <TouchableOpacity onPress={()=>updateQty(item.productId, item.qty+1)} style={styles.qtyBtn}><Text>+</Text></TouchableOpacity>
              <TouchableOpacity onPress={()=>remove(item.productId)}><Text style={styles.remove}>Remove</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <Text style={styles.total}>Total: ${cart.total.toFixed(2)}</Text>
        <TouchableOpacity onPress={checkout} style={styles.checkoutBtn}><Text style={styles.checkoutText}>Checkout (COD) →</Text></TouchableOpacity>
      </View>
    </View>
  )
}
const styles=StyleSheet.create({
  container:{flex:1, backgroundColor:'#FFFDFB'},
  center:{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#FFFDFB', padding:20},
  row:{backgroundColor:'#fff', borderWidth:1, borderColor:'#E8E0D8', borderRadius:12, padding:12, flexDirection:'row', justifyContent:'space-between', alignItems:'center', gap:12},
  title:{fontWeight:'600', fontSize:13},
  muted:{fontSize:11, color:'#6B6B6B'},
  qtyRow:{flexDirection:'row', alignItems:'center', gap:8},
  qtyBtn:{width:28,height:28, borderRadius:999, borderWidth:1, borderColor:'#E8E0D8', alignItems:'center', justifyContent:'center', backgroundColor:'#fff'},
  remove:{color:'#B42318', fontSize:12, fontWeight:'600'},
  footer:{padding:16, borderTopWidth:1, borderTopColor:'#E8E0D8', backgroundColor:'#fff'},
  total:{fontWeight:'700', fontSize:16, marginBottom:10},
  btn:{backgroundColor:'#0F0F0F', padding:12, borderRadius:999, marginTop:12},
  btnText:{color:'#fff', fontWeight:'700', textAlign:'center'},
  checkoutBtn:{backgroundColor:'#0F0F0F', paddingVertical:14, borderRadius:999, alignItems:'center'},
  checkoutText:{color:'#fff', fontWeight:'700'}
})
