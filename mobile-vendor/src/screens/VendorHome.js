import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native'
import { apiFetch } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function VendorHome(){
  const {user}=useAuth()
  const [products,setProducts]=useState([])
  const [loading,setLoading]=useState(true)
  const [refreshing,setRefreshing]=useState(false)
  const [form,setForm]=useState({title:'', price:'', category:'women', stock:'10'})

  const load=async()=>{
    setLoading(true)
    try{ const d=await apiFetch('/api/products'); setProducts(d.products)}catch(e){ console.warn(e.message)}
    finally{ setLoading(false)}
  }
  useEffect(()=>{load()},[])
  const onRefresh=async()=>{ setRefreshing(true); await load(); setRefreshing(false)}

  const create=async()=>{
    if(!form.title||!form.price) return Alert.alert('Validation','Title & price required')
    try{
      await apiFetch('/api/products',{method:'POST', auth:true, body:{ title:form.title, price:Number(form.price), category:form.category, stock:Number(form.stock), brand: user?.name || 'Vendor'}})
      setForm({title:'', price:'', category:'women', stock:'10'})
      load()
      Alert.alert('Created','Product added')
    }catch(e){ Alert.alert('Error', e.message)}
  }
  const remove=async(id)=>{
    try{ await apiFetch(`/api/products/${id}`,{method:'DELETE', auth:true}); load() }catch(e){ Alert.alert('Error', e.message)}
  }

  const myProducts=products.filter(p=>!p.vendorId || p.vendorId===user?.id)

  if(loading) return <View style={styles.center}><ActivityIndicator/><Text>Loading vendor catalog…</Text></View>

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>VÉLORA Vendor</Text>
        <Text style={styles.sub}>{user?.name} • {myProducts.length} products • Single backend</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.formTitle}>Add Product (mobile)</Text>
        <TextInput placeholder="Title" value={form.title} onChangeText={v=>setForm({...form,title:v})} style={styles.input} />
        <View style={{flexDirection:'row', gap:8}}>
          <TextInput placeholder="Price" value={form.price} onChangeText={v=>setForm({...form,price:v})} keyboardType="numeric" style={[styles.input,{flex:1}]} />
          <TextInput placeholder="Stock" value={form.stock} onChangeText={v=>setForm({...form,stock:v})} keyboardType="numeric" style={[styles.input,{flex:1}]} />
        </View>
        <View style={{flexDirection:'row', gap:8}}>
          {['women','men','kids','footwear','accessories'].map(c=> (
            <TouchableOpacity key={c} onPress={()=>setForm({...form, category:c})} style={[styles.chip, form.category===c && styles.chipActive]}><Text style={{fontSize:11, color: form.category===c?'#fff':'#0F0F0F'}}>{c}</Text></TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={create} style={styles.btn}><Text style={styles.btnText}>Create →</Text></TouchableOpacity>
      </View>
      <FlatList
        data={products}
        keyExtractor={i=>i.id}
        contentContainerStyle={{padding:12, gap:10}}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({item})=>{
          const mine=!item.vendorId || item.vendorId===user?.id
          return (
            <View style={[styles.card, !mine&&{opacity:0.6}]}>
              <View style={{flex:1}}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.muted}>{item.category} • ${item.price} • {item.stock} stock • {mine?'You':'admin/other'}</Text>
              </View>
              {mine && <TouchableOpacity onPress={()=>remove(item.id)}><Text style={styles.remove}>Delete</Text></TouchableOpacity>}
            </View>
          )
        }}
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
  form:{backgroundColor:'#fff', margin:12, padding:12, borderRadius:16, borderWidth:1, borderColor:'#E8E0D8', gap:8},
  formTitle:{fontWeight:'700', fontSize:13},
  input:{borderWidth:1, borderColor:'#E8E0D8', borderRadius:10, padding:10, backgroundColor:'#FFFDFB'},
  chip:{paddingVertical:6, paddingHorizontal:10, borderRadius:999, borderWidth:1, borderColor:'#E8E0D8', backgroundColor:'#FFFDFB'},
  chipActive:{backgroundColor:'#0F0F0F', borderColor:'#0F0F0F'},
  btn:{backgroundColor:'#0F0F0F', paddingVertical:12, borderRadius:999, alignItems:'center'},
  btnText:{color:'#fff', fontWeight:'700'},
  card:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:'#fff', padding:12, borderRadius:12, borderWidth:1, borderColor:'#E8E0D8'},
  cardTitle:{fontWeight:'600', fontSize:13},
  muted:{fontSize:11, color:'#6B6B6B'},
  remove:{color:'#B42318', fontWeight:'700', fontSize:12}
})
