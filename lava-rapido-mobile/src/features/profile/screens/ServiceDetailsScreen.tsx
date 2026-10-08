
import React, { useCallback, useContext, useRef, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useFocusEffect } from '@react-navigation/native'

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '../../../components/common/BackButton'

import { ThemeContext } from '../../../theme/ThemeContext'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../../../utils/formatters'
import { reservationService } from '../../reservations/services/reservationService'
import { ratingService, type RatingResponse } from '../../../services/ratingService'

import type { RootStackParamList } from '../../../navigation/types'

import type { ReservationResponse } from '../../reservations/types/reservation.types'

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ServiceDetails'
>

export default function ServiceDetailsScreen({
  route,
  navigation,
}: Props) {

  const { theme } = useContext(ThemeContext)
  const { t } = useTranslation()

  const [reservation, setReservation] = useState(route.params.reservation)
  const [rating, setRating] = useState<RatingResponse | null>(null)
  const [ratingLoading, setRatingLoading] = useState(true)
  const [ratingLoadError, setRatingLoadError] = useState(false)
  const [ratingModalVisible, setRatingModalVisible] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [ratingError, setRatingError] = useState<string | null>(null)
  const [ratingSuccess, setRatingSuccess] = useState(false)
  const submitLock = useRef(false)

  const loadRatingState = useCallback(async (isActive: () => boolean) => {
    setRatingLoading(true)
    setRatingLoadError(false)
    try {
      const latestReservation = await reservationService.getById(reservation.idReserva)
      if (!isActive()) return
      setReservation(latestReservation)

      if (latestReservation.estado !== 'FINALIZADA') {
        setRating(null)
        setRatingSuccess(false)
        return
      }

      try {
        const existingRating = await ratingService.getByReservation(latestReservation.idReserva)
        if (isActive()) {
          setRating(existingRating)
          setRatingSuccess(false)
        }
      } catch (error) {
        if ((error as { response?: { status?: number } }).response?.status === 404) {
          if (isActive()) {
            setRating(null)
            setRatingSuccess(false)
          }
        } else {
          throw error
        }
      }
    } catch {
      if (isActive()) setRatingLoadError(true)
    } finally {
      if (isActive()) setRatingLoading(false)
    }
  }, [reservation.idReserva])

  useFocusEffect(useCallback(() => {
    let active = true
    void loadRatingState(() => active)
    return () => { active = false }
  }, [loadRatingState]))

  const canRate = reservation.estado === 'FINALIZADA' && !rating && !ratingLoading && !ratingLoadError

  const submitRating = async () => {
    if (submitLock.current || selectedRating < 1 || selectedRating > 5 || !canRate) {
      if (selectedRating < 1 || selectedRating > 5) setRatingError('selectRating')
      return
    }

    submitLock.current = true
    setSubmitting(true)
    setRatingError(null)
    try {
      const created = await ratingService.submit({
        reservaId: reservation.idReserva,
        puntuacion: selectedRating,
        comentario: comment.trim() || null,
      })
      setRating(created)
      setRatingSuccess(true)
      setRatingModalVisible(false)
      setComment('')
    } catch (error) {
      const failure = error as { response?: { status?: number; data?: { error?: unknown } } }
      const status = failure.response?.status
      const message = failure.response?.data?.error
      if (typeof message === 'string' && message.toLowerCase().includes('finalizadas')) {
        setRatingError('notFinished')
      } else if (typeof message === 'string' && message.toLowerCase().includes('ya tiene una calificacion')) {
        setRatingModalVisible(false)
        void loadRatingState(() => true)
      } else if (status === 401 || status === 403) {
        setRatingError('unauthorized')
      } else if (status === 404) {
        setRatingError('notFound')
      } else if (!status) {
        setRatingError('connectionError')
      } else {
        setRatingError('genericError')
      }
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  const renderStatusColors = (status: ReservationResponse['estado']) => {
    switch (status) {
      case 'EN_PROCESO':
        return { background: theme.processBackground, foreground: theme.inProgressText }
      case 'PENDIENTE':
        return { background: theme.warningBackground, foreground: theme.warningText }
      case 'ASIGNADA':
        return { background: theme.infoBackground, foreground: theme.infoText }
      case 'FINALIZADA':
        return { background: theme.successBackground, foreground: theme.successText }
      case 'CANCELADA':
        return { background: theme.errorBackground, foreground: theme.errorText }
      default:
        return { background: theme.interactiveSurface, foreground: theme.textSecondary }
    }
  }


  const renderStatusText = (
    status: ReservationResponse['estado']
  ) => {

    switch (status) {

      case 'EN_PROCESO':
        return t('mobile.reservationDetail.status.inProcess')

      case 'PENDIENTE':
        return t('mobile.reservationDetail.status.pending')

      case 'ASIGNADA':
        return t('mobile.reservationDetail.status.assigned')

      case 'FINALIZADA':
        return t('mobile.reservationDetail.status.finished')

      case 'CANCELADA':
        return t('mobile.reservationDetail.status.cancelled')

      default:
        return t('mobile.reservationDetail.status.unknown')
    }
  }

  const formatDate = (date: string) => {

    if (!date) {
      return t('mobile.services.notAvailable')
    }

    const [year, month, day] = date.split('-')

    return `${day}/${month}/${year}`
  }

  const formatTime = (time: string) => {

    if (!time) {
      return t('mobile.services.notAvailable')
    }

    return time.substring(0, 5)
  }

  const isInProcess =
    reservation.estado === 'EN_PROCESO' ||
    reservation.estado === 'FINALIZADA'

  const isFinished =
    reservation.estado === 'FINALIZADA'
  const statusColors = renderStatusColors(reservation.estado)

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.topBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <BackButton onPress={() => navigation.goBack()} accessibilityLabel={t('mobile.serviceDetail.back')} />
          <View style={styles.topBarText}><Text style={[styles.pageTitle, { color: theme.text }]}>{t('mobile.reservationDetail.title')}</Text><Text style={[styles.pageSubtitle, { color: theme.textSecondary }]} numberOfLines={2}>{reservation.nombreServicio || t('mobile.services.serviceFallback')}</Text></View>
        </View>
        <View style={[styles.hero, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.heroIcon, { backgroundColor: theme.primarySoft }]}><Ionicons name="car-sport" size={28} color={theme.primary} /></View>
          <View style={styles.heroText}><Text style={[styles.heroTitle, { color: theme.text }]} numberOfLines={2}>{reservation.nombreServicio || t('mobile.services.serviceFallback')}</Text><Text style={[styles.reservationId, { color: theme.textSecondary }]} numberOfLines={1}>{t('mobile.reservationDetail.reservation')} #{reservation.idReserva}</Text></View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.background }]}><Text style={[styles.statusText, { color: statusColors.foreground }]}>{renderStatusText(reservation.estado)}</Text></View>
        </View>
        {!!reservation.descripcionServicio && <Text style={[styles.serviceDescription, { color: theme.textSecondary }]}>{reservation.descripcionServicio}</Text>}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SectionHeading icon="reader-outline" title={t('mobile.reservationDetail.serviceInfo')} theme={theme} />
          <View style={styles.infoGrid}>
            <InfoTile icon="calendar-outline" label={t('mobile.reservationDetail.date')} value={formatDate(reservation.fechaReserva)} theme={theme} />
            <InfoTile icon="time-outline" label={t('mobile.reservationDetail.time')} value={formatTime(reservation.horaReserva)} theme={theme} />
            <InfoTile icon="car-outline" label={t('mobile.reservationDetail.vehicle')} value={reservation.tipoVehiculo} theme={theme} />
            <InfoTile icon="pricetag-outline" label={t('mobile.reservationDetail.plate')} value={reservation.placaVehiculo} theme={theme} />
            <InfoTile icon="cash-outline" label={t('mobile.reservationDetail.price')} value={formatCurrency(reservation.precioServicio)} theme={theme} />
            <InfoTile icon="hourglass-outline" label={t('mobile.reservationDetail.duration')} value={String(reservation.duracionServicio) + ' ' + t('mobile.reservationDetail.minutes')} theme={theme} />
          </View>
        </View>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SectionHeading icon="git-branch-outline" title={t('mobile.reservationDetail.processStatus')} theme={theme} />
          <View style={styles.timeline}><TimelineStep label={t('mobile.reservationDetail.confirmed')} active color={theme.success} theme={theme} /><View style={[styles.line, { backgroundColor: theme.border }]} /><TimelineStep label={t('mobile.reservationDetail.inService')} active={isInProcess} color={theme.inProgress} theme={theme} /><View style={[styles.line, { backgroundColor: theme.border }]} /><TimelineStep label={t('mobile.reservationDetail.finished')} active={isFinished} color={theme.success} theme={theme} /></View>
        </View>
        {reservation.estado === 'FINALIZADA' && <View style={[styles.ratingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SectionHeading icon="star-outline" title={t('ratingFlow.rateService')} theme={theme} />
          {ratingLoading ? <ActivityIndicator color={theme.primary} /> : ratingLoadError ? <><Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.ratingMessage, { color: theme.textSecondary }]}>{t('ratingFlow.loadError')}</Text><TouchableOpacity accessibilityRole="button" style={[styles.ratingButton, { backgroundColor: theme.primary }]} onPress={() => { void loadRatingState(() => true) }}><Text style={[styles.ratingButtonText, { color: theme.onPrimary }]}>{t('mobile.services.retry')}</Text></TouchableOpacity></> : rating ? <><Text accessibilityLiveRegion="polite" style={[styles.ratingMessage, { color: theme.text }]}>{ratingSuccess ? t('ratingFlow.success') : t('ratingFlow.alreadyRatedLabel')}</Text><View style={styles.ratingStars}>{[1,2,3,4,5].map(star => <Ionicons key={star} name={star <= rating.puntuacion ? 'star' : 'star-outline'} size={25} color={theme.warning} />)}<Text style={[styles.ratingValue,{color:theme.text}]}>{rating.puntuacion}/5</Text></View>{!!rating.comentario && <Text style={[styles.ratingComment,{color:theme.textSecondary}]}>{rating.comentario}</Text>}</> : canRate ? <><Text style={[styles.ratingMessage,{color:theme.textSecondary}]}>{t('ratingFlow.question')}</Text><TouchableOpacity accessibilityRole="button" style={[styles.ratingButton,styles.fullButton,{backgroundColor:theme.primary}]} onPress={() => {setSelectedRating(0);setComment('');setRatingError(null);setRatingModalVisible(true)}} activeOpacity={0.85}><Ionicons name="star" size={19} color={theme.onPrimary}/><Text style={[styles.ratingButtonText,{color:theme.onPrimary}]}>{t('ratingFlow.rateService')}</Text></TouchableOpacity></> : null}
        </View>}
      </ScrollView>
      <Modal visible={ratingModalVisible} transparent animationType="slide" onRequestClose={() => !submitting && setRatingModalVisible(false)}>
        <KeyboardAvoidingView style={[styles.modalBackdrop,{backgroundColor:theme.overlay}]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.ratingModal,{backgroundColor:theme.card,borderColor:theme.border}]}><View style={[styles.modalHandle,{backgroundColor:theme.border}]}/>
            <View style={styles.modalHeader}><View style={styles.modalTitleWrap}><Text style={[styles.modalTitle,{color:theme.text}]}>{t('ratingFlow.title')}</Text><Text style={[styles.modalSubtitle,{color:theme.textSecondary}]} numberOfLines={2}>{reservation.nombreServicio || t('mobile.services.serviceFallback')}</Text></View><Pressable onPress={() => !submitting && setRatingModalVisible(false)} disabled={submitting} accessibilityRole="button" accessibilityLabel={t('ratingFlow.close')} hitSlop={8} style={styles.closeButton}><Ionicons name="close" size={22} color={theme.textSecondary}/></Pressable></View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}><Text style={[styles.ratingQuestion,{color:theme.textSecondary}]}>{t('ratingFlow.question')}</Text>
              <View style={[styles.starSelector,{backgroundColor:theme.inputBackground,borderColor:theme.border}]}>{[1,2,3,4,5].map(star => <Pressable key={star} onPress={() => {setSelectedRating(star);setRatingError(null)}} accessibilityRole="radio" accessibilityLabel={t('ratingFlow.stars',{count:star})} accessibilityState={{selected:selectedRating===star}} hitSlop={7} style={styles.starPressable}><Ionicons name={star<=selectedRating?'star':'star-outline'} size={36} color={star<=selectedRating?theme.warning:theme.textSecondary}/></Pressable>)}</View>
              <Text style={[styles.inputLabel,{color:theme.text}]}>{t('ratingFlow.comment')}</Text><TextInput accessibilityLabel={t('ratingFlow.comment')} value={comment} onChangeText={setComment} maxLength={300} multiline editable={!submitting} placeholder={t('ratingFlow.commentPlaceholder')} placeholderTextColor={theme.placeholder} textAlignVertical="top" style={[styles.commentInput,{color:theme.text,backgroundColor:theme.inputBackground,borderColor:theme.border}]}/><Text style={[styles.characterCount,{color:theme.textSecondary}]}>{comment.length}/300</Text>
              {!!ratingError && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.formError,{color:theme.errorText}]}>{t('ratingFlow.' + ratingError)}</Text>}
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={submitting ? `${t('ratingFlow.submit')}, ${t('accessibility.inProgress')}` : t('ratingFlow.submit')} accessibilityState={{ disabled: submitting, busy: submitting }} accessibilityLiveRegion="polite" style={[styles.ratingButton,styles.submitButton,{backgroundColor:theme.primary,opacity:submitting?0.65:1}]} onPress={() => {void submitRating()}} disabled={submitting} activeOpacity={0.85}>{submitting?<ActivityIndicator color={theme.onPrimary}/>:<Text style={[styles.ratingButtonText,{color:theme.onPrimary}]}>{t('ratingFlow.submit')}</Text>}</TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  )
}

function SectionHeading({icon,title,theme}:{icon:React.ComponentProps<typeof Ionicons>['name'];title:string;theme:any}) { return <View style={styles.sectionHeading}><View style={[styles.sectionIcon,{backgroundColor:theme.primaryLight}]}><Ionicons name={icon} size={19} color={theme.primary}/></View><Text style={[styles.sectionTitle,{color:theme.text}]}>{title}</Text></View> }
function InfoTile({icon,label,value,theme}:{icon:React.ComponentProps<typeof Ionicons>['name'];label:string;value:string;theme:any}) { return <View style={[styles.infoTile,{backgroundColor:theme.inputBackground,borderColor:theme.border}]}><View style={styles.tileLabelRow}><Ionicons name={icon} size={16} color={theme.primary}/><Text style={[styles.label,{color:theme.textSecondary}]} numberOfLines={1}>{label}</Text></View><Text style={[styles.value,{color:theme.text}]}>{value}</Text></View> }
function TimelineStep({label,active,color,theme}:{label:string;active:boolean;color:string;theme:any}) { return <View style={styles.step}><View style={[styles.dot,{backgroundColor:active?color:theme.border}]}/><Text style={[styles.stepText,{color:active?theme.text:theme.textSecondary}]}>{label}</Text>{active&&<Ionicons name="checkmark-circle" size={18} color={color}/>}</View> }

const styles=StyleSheet.create({
 safeArea:{flex:1},pageContent:{paddingHorizontal:18,paddingTop:10,paddingBottom:32,gap:14},topBar:{minHeight:74,borderWidth:1,borderRadius:18,padding:12,flexDirection:'row',alignItems:'center',gap:12},topBarText:{flex:1,minWidth:0},pageTitle:{fontSize:20,fontWeight:'800'},pageSubtitle:{fontSize:13,marginTop:3},
 hero:{borderWidth:1,borderRadius:20,padding:16,flexDirection:'row',alignItems:'center',gap:12},heroIcon:{width:52,height:52,borderRadius:16,alignItems:'center',justifyContent:'center'},heroText:{flex:1,minWidth:0},heroTitle:{fontSize:17,fontWeight:'800'},reservationId:{fontSize:11,marginTop:5},statusBadge:{paddingHorizontal:11,paddingVertical:8,borderRadius:20,maxWidth:'42%'},statusText:{fontWeight:'700',fontSize:11,textAlign:'center'},serviceDescription:{fontSize:14,lineHeight:20,paddingHorizontal:3},
 card:{borderWidth:1,borderRadius:20,padding:16},sectionHeading:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:14},sectionIcon:{width:34,height:34,borderRadius:11,alignItems:'center',justifyContent:'center'},sectionTitle:{flex:1,fontSize:16,fontWeight:'800'},infoGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},infoTile:{width:'48%',minWidth:130,flexGrow:1,borderWidth:1,borderRadius:14,padding:11,minHeight:78,justifyContent:'center'},tileLabelRow:{flexDirection:'row',alignItems:'center',gap:6,marginBottom:7},label:{flex:1,fontSize:11,fontWeight:'600'},value:{fontSize:14,fontWeight:'700',flexShrink:1},
 timeline:{paddingLeft:5},step:{minHeight:30,flexDirection:'row',alignItems:'center'},dot:{width:13,height:13,borderRadius:7},line:{width:2,height:18,marginLeft:5.5,marginVertical:2},stepText:{marginLeft:13,fontSize:14,flex:1},ratingCard:{borderWidth:1,borderRadius:20,padding:16,gap:10},ratingButton:{minHeight:50,borderRadius:14,paddingHorizontal:18,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:9},fullButton:{alignSelf:'stretch',marginTop:3},ratingButtonText:{fontSize:15,fontWeight:'800'},ratingMessage:{fontSize:14,lineHeight:20,fontWeight:'600',textAlign:'center'},ratingStars:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:3},ratingValue:{marginLeft:7,fontWeight:'800'},ratingComment:{fontSize:14,alignSelf:'stretch',lineHeight:20},
 modalBackdrop:{flex:1,justifyContent:'flex-end'},ratingModal:{maxHeight:'92%',borderWidth:1,borderTopLeftRadius:26,borderTopRightRadius:26,paddingHorizontal:20,paddingTop:10,paddingBottom:28},modalHandle:{alignSelf:'center',width:38,height:4,borderRadius:4,marginBottom:16},modalHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:12},modalTitleWrap:{flex:1,minWidth:0},modalTitle:{fontSize:21,fontWeight:'800'},modalSubtitle:{fontSize:13,marginTop:3},closeButton:{width:40,height:40,borderRadius:13,alignItems:'center',justifyContent:'center'},ratingQuestion:{textAlign:'center',marginTop:4,fontSize:15,lineHeight:21},starSelector:{flexDirection:'row',alignItems:'center',justifyContent:'space-evenly',borderWidth:1,borderRadius:18,paddingHorizontal:7,paddingVertical:12,marginVertical:16},starPressable:{flex:1,alignItems:'center',paddingVertical:3},inputLabel:{fontSize:14,fontWeight:'700',marginBottom:8},commentInput:{minHeight:116,maxHeight:180,borderWidth:1,borderRadius:15,padding:14,fontSize:15,lineHeight:21},characterCount:{textAlign:'right',fontSize:12,marginTop:6},formError:{fontSize:13,textAlign:'center',marginTop:10},submitButton:{marginTop:16,marginBottom:5}
})
