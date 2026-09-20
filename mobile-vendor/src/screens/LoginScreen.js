import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { apiFetch } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen({ navigation }) {
  const { login } = useAuth()
  const [mode, setMode] = useState('password') // password | otp
  const [email, setEmail] = useState('user@shop.com')
  const [password, setPassword] = useState('user123')
  const [identifier, setIdentifier] = useState('9876543210')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState('request')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const handlePassword = async () => {
    setLoading(true); setMsg(null)
    try{
      const data=await apiFetch('/api/auth/login',{method:'POST', body:{email,password}})
      await login(data)
      setMsg({type:'success', text:'Welcome back!'})
    }catch(e){ setMsg({type:'error', text:e.message}) }
    finally{ setLoading(false)}
  }
  const requestOtp=async()=>{
    setLoading(true); setMsg(null)
    try{
      const data=await apiFetch('/api/auth/otp/request',{method:'POST', body:{identifier}})
      setMsg({type:'success', text:`OTP: ${data.otp || 'check console'} (5m)`})
      setStep('verify')
    }catch(e){ setMsg({type:'error', text:e.message})}
    finally{ setLoading(false)}
  }
  const verifyOtp=async()=>{
    setLoading(true); setMsg(null)
    try{
      const data=await apiFetch('/api/auth/otp/verify',{method:'POST', body:{identifier, otp, name}})
      await login(data)
    }catch(e){ setMsg({type:'error', text:e.message})}
    finally{ setLoading(false)}
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.sub}>Demo: user@shop.com / user123 or OTP 9876543210</Text>
      <View style={styles.tabs}>
        <TouchableOpacity onPress={()=>setMode('password')} style={[styles.tab, mode==='password'&&styles.tabActive]}><Text style={mode==='password'?styles.tabTextActive:styles.tabText}>Password</Text></TouchableOpacity>
        <TouchableOpacity onPress={()=>{setMode('otp'); setStep('request')}} style={[styles.tab, mode==='otp'&&styles.tabActive]}><Text style={mode==='otp'?styles.tabTextActive:styles.tabText}>OTP</Text></TouchableOpacity>
      </View>
      {msg && <View style={[styles.alert, msg.type==='error'?styles.alertError:styles.alertSuccess]}><Text>{msg.text}</Text></View>}
      {mode==='password' ? (
        <View style={styles.form}>
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={styles.input} />
          <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
          <TouchableOpacity onPress={handlePassword} disabled={loading} style={styles.btn}><Text style={styles.btnText}>{loading?'Signing in…':'Sign In →'}</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>navigation.navigate('Signup')}><Text style={styles.link}>Create account</Text></TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          {step==='request' ? (
            <>
              <TextInput placeholder="Email or phone" value={identifier} onChangeText={setIdentifier} style={styles.input} />
              <TouchableOpacity onPress={requestOtp} disabled={loading} style={styles.btn}><Text style={styles.btnText}>{loading?'Sending…':'Send OTP'}</Text></TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.sub}>Code sent to {identifier}</Text>
              <TextInput placeholder="123456" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} style={[styles.input, {letterSpacing:8, textAlign:'center', fontWeight:'700'}]} />
              <TextInput placeholder="Name (if new account)" value={name} onChangeText={setName} style={styles.input} />
              <TouchableOpacity onPress={verifyOtp} disabled={loading} style={styles.btn}><Text style={styles.btnText}>{loading?'Verifying…':'Verify & Sign In'}</Text></TouchableOpacity>
              <TouchableOpacity onPress={()=>setStep('request')}><Text style={styles.link}>Use different email/phone</Text></TouchableOpacity>
            </>
          )}
        </View>
      )}
      {loading && <ActivityIndicator style={{marginTop:16}} />}
    </View>
  )
}
const styles=StyleSheet.create({
  container:{flex:1, backgroundColor:'#FFFDFB', padding:20, paddingTop:60},
  title:{fontSize:28, fontWeight:'800', fontFamily:'System'},
  sub:{fontSize:12, color:'#6B6B6B', marginTop:6, marginBottom:12},
  tabs:{flexDirection:'row', backgroundColor:'#F7F3EF', borderRadius:999, padding:4, gap:6, marginBottom:16},
  tab:{flex:1, paddingVertical:10, alignItems:'center', borderRadius:999},
  tabActive:{backgroundColor:'#fff', shadowColor:'#000', shadowOpacity:0.06, shadowRadius:8},
  tabText:{fontSize:13, fontWeight:'600', color:'#6B6B6B'},
  tabTextActive:{color:'#0F0F0F'},
  alert:{padding:10, borderRadius:12, marginBottom:12},
  alertError:{backgroundColor:'#FEF3F2', borderWidth:1, borderColor:'#FECDCA'},
  alertSuccess:{backgroundColor:'#ECFDF3', borderWidth:1, borderColor:'#ABEFC6'},
  form:{gap:12},
  input:{backgroundColor:'#fff', borderWidth:1, borderColor:'#E8E0D8', borderRadius:12, padding:12, fontSize:14},
  btn:{backgroundColor:'#0F0F0F', paddingVertical:14, borderRadius:999, alignItems:'center'},
  btnText:{color:'#fff', fontWeight:'700'},
  link:{textAlign:'center', color:'#0F0F0F', textDecorationLine:'underline', marginTop:8}
})
