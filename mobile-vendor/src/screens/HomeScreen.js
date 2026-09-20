import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, TextInput } from 'react-native'
import { apiFetch } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/products', { params: { search: search || undefined, category: category==='all'? undefined : category, limit: 20 } })
      setProducts(data.products)
    } catch (e) { console.warn(e.message) }
    finally { setLoading(false) }
  }, [search, category])

  useEffect(()=>{ load() }, [load])

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false) }

  const addToCart = async (id) => {
    const { isAuthenticated } = useAuth ? { isAuthenticated: false } : {}
    try {
      // naive: require auth, else navigate to login
      await apiFetch('/api/cart', { method:'POST', auth:true, body:{ productId:id, qty:1 } })
      alert('Added to bag')
    } catch (e) {
      if (e.status===401) navigation.navigate('Login')
      else alert(e.message)
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0F0F0F" /><Text>Loading VÉLORA…</Text></View>

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>VÉLORA</Text>
        <Text style={styles.subtitle}>Fashion House • Single Backend</Text>
        <TextInput placeholder="Search dresses, sneakers…" value={search} onChangeText={setSearch} onSubmitEditing={load} style={styles.search} returnKeyType="search" />
        <View style={styles.pills}>
          {['all','women','men','kids','footwear','accessories','sale'].map(c=> (
            <TouchableOpacity key={c} onPress={()=>setCategory(c)} style={[styles.pill, category===c && styles.pillActive]}>
              <Text style={[styles.pillText, category===c && styles.pillTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FlatList
        data={products}
        keyExtractor={i=>i.id}
        numColumns={2}
        columnWrapperStyle={{gap:12}}
        contentContainerStyle={{padding:12, gap:12}}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({item})=> (
          <View style={styles.card}>
            <Image source={{uri: item.images[0]}} style={styles.image} />
            {item.originalPrice > item.price && <View style={styles.discount}><Text style={styles.discountText}>{Math.round((1-item.price/item.originalPrice)*100)}% OFF</Text></View>}
            <View style={styles.cardBody}>
              <Text style={styles.brandLabel}>{item.brand}</Text>
              <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
              <Text style={styles.rating}>★ {item.rating} ({item.reviewsCount})</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>${item.price}</Text>
                {item.originalPrice>item.price && <Text style={styles.original}>${item.originalPrice}</Text>}
              </View>
              <TouchableOpacity onPress={()=>addToCart(item.id)} style={styles.addBtn}><Text style={styles.addBtnText}>Add to Bag</Text></TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No products</Text>}
      />
    </View>
  )
}

const styles=StyleSheet.create({
  container:{flex:1, backgroundColor:'#FFFDFB'},
  center:{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#FFFDFB'},
  header:{padding:16, paddingTop:48, backgroundColor:'#FFFDFB', borderBottomWidth:1, borderBottomColor:'#E8E0D8'},
  brand:{fontSize:22, fontWeight:'800', letterSpacing:4, color:'#0F0F0F'},
  subtitle:{fontSize:11, letterSpacing:1.2, color:'#6B6B6B', marginBottom:10},
  search:{backgroundColor:'#fff', borderWidth:1, borderColor:'#E8E0D8', borderRadius:12, padding:10, fontSize:14},
  pills:{flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:10},
  pill:{paddingVertical:6, paddingHorizontal:12, borderRadius:999, borderWidth:1, borderColor:'#E8E0D8', backgroundColor:'#fff'},
  pillActive:{backgroundColor:'#0F0F0F', borderColor:'#0F0F0F'},
  pillText:{fontSize:12, fontWeight:'600', color:'#6B6B6B'},
  pillTextActive:{color:'#fff'},
  card:{flex:1, backgroundColor:'#fff', borderRadius:16, overflow:'hidden', borderWidth:1, borderColor:'#E8E0D8', maxWidth:'48%'},
  image:{height:180, backgroundColor:'#F7F3EF'},
  discount:{position:'absolute', top:8, left:8, backgroundColor:'#fff', paddingVertical:4, paddingHorizontal:8, borderRadius:999},
  discountText:{fontSize:10, fontWeight:'700'},
  cardBody:{padding:10, gap:4},
  brandLabel:{fontSize:10, letterSpacing:1.2, color:'#6B6B6B', fontWeight:'600'},
  title:{fontSize:13, fontWeight:'600', lineHeight:16},
  rating:{fontSize:11, color:'#6B6B6B'},
  priceRow:{flexDirection:'row', gap:6, alignItems:'center'},
  price:{fontWeight:'700', fontSize:14},
  original:{fontSize:11, color:'#6B6B6B', textDecorationLine:'line-through'},
  addBtn:{marginTop:6, backgroundColor:'#0F0F0F', paddingVertical:8, borderRadius:999, alignItems:'center'},
  addBtnText:{color:'#fff', fontSize:12, fontWeight:'700'},
  empty:{textAlign:'center', marginTop:40, color:'#6B6B6B'}
})
