import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Atolyem() {
    const [renkler, setRenkler] = useState(['#6C63FF', '#A29BFE']);
    const [modalGorunur, setModalGorunur] = useState(false);
    const [seciliIndeks, setSeciliIndeks] = useState<number | null>(null);
    const [gecerliRenk, setGecerliRenk] = useState('#6C63FF');


    const kayitliPaletler = useQuery(api.renkler.getAtolye);
    const paletEkleMutation = useMutation(api.renkler.ekleAtolye);
    const paletSilMutation = useMutation(api.renkler.silAtolye);


    const COLOR_PICKER_MATRIX = [
        ['#FF7675', '#FAB1A0', '#FFEAA7', '#55E6C1', '#74B9FF', '#A29BFE', '#D288FC'],
        ['#E84393', '#E17055', '#FDCB6E', '#00B894', '#0984E3', '#6C63FF', '#B33771'],
        ['#D63031', '#D5A6BD', '#F39C12', '#2ECC71', '#2980B9', '#4834D4', '#6D214F'],
        ['#1A1A1A', '#2D3436', '#636E72', '#B2BEC3', '#DFE6E9', '#FFFFFF', '#ECE0D1']
    ];


    const paletiEkle = async () => {
        try {
            const saatBilgisi = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            await paletEkleMutation({
                renkler: [...renkler],
                tarih: saatBilgisi
            });
        } catch (e) {
            console.log("Convex kaydetme hatası:", e);
        }
    };


    const paletSil = async (id: any) => {
        try {
            await paletSilMutation({ id });
        } catch (e) {
            console.log("Convex silme hatası:", e);
        }
    };


    const renkSil = (index: number) => {
        if (renkler.length > 1) {
            const yeniRenkler = renkler.filter((_, i) => i !== index);
            setRenkler(yeniRenkler);
        }
    };

    const renkSeciciyiAc = (index: number, anlikRenk: string) => {
        setSeciliIndeks(index);
        setGecerliRenk(anlikRenk);
        setModalGorunur(true);
    };

    return (
        <SafeAreaView style={stiller.container}>
            <ScrollView contentContainerStyle={stiller.merkez}>

                <View style={stiller.header}>
                    <Text style={stiller.logo}>ColorVibe</Text>
                </View>

                <View style={stiller.anaKart}>
                    <Text style={stiller.kartBaslik}>Kendi Stilini Yarat</Text>
                    <View style={stiller.canvas}>
                        <View style={stiller.renkGrubu}>
                            {renkler.map((renk, index) => (
                                <View key={index} style={stiller.renkKonteyner}>
                                    <TouchableOpacity
                                        style={[stiller.renkDaire, { backgroundColor: renk }]}
                                        onPress={() => renkSeciciyiAc(index, renk)}
                                    />
                                    {renkler.length > 1 && (
                                        <TouchableOpacity style={stiller.daireSilBtn} onPress={() => renkSil(index)}>
                                            <Text style={stiller.daireSilBtnText}>×</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>
                        <View style={stiller.butonSatiri}>
                            <TouchableOpacity style={stiller.morBtn} onPress={() => setRenkler([...renkler, '#CCCCCC'])}>
                                <Text style={stiller.btnText}>+ Renk Ekle</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={stiller.siyahBtn} onPress={paletiEkle}>
                                <Text style={stiller.btnText}>Paleti Kaydet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={stiller.listeBolumu}>
                    <Text style={stiller.listeBaslik}>Kaydedilen Paletlerim</Text>
                    <View style={stiller.polaroidIzgara}>
                        {kayitliPaletler && kayitliPaletler.map((item) => (
                            <View key={item._id} style={stiller.polaroidKart}>
                                <View style={stiller.polaroidRenkAlani}>
                                    {item.renkler.map((r: string, i: number) => (
                                        <View key={i} style={[stiller.polaroidRenkKutusu, { backgroundColor: r }]} />
                                    ))}
                                </View>
                                <View style={stiller.polaroidAltInfo}>
                                    <Text style={stiller.polaroidTarih}>{item.tarih}</Text>
                                    <TouchableOpacity onPress={() => paletSil(item._id)} style={stiller.silBtn}>
                                        <Text style={stiller.silBtnText}>×</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>


            <Modal visible={modalGorunur} transparent animationType="slide">
                <Pressable style={stiller.modalOverlay} onPress={() => setModalGorunur(false)}>
                    <View style={stiller.pickerKonteyner}>
                        <Text style={stiller.pickerBaslik}>Renk Seçici</Text>


                        <View style={[stiller.onizlemeKutusu, { backgroundColor: gecerliRenk }]}>
                            <Text style={[
                                stiller.onizlemeYazi,
                                { color: gecerliRenk === '#FFFFFF' ? '#000' : '#fff' }
                            ]}>
                                {gecerliRenk.toUpperCase()}
                            </Text>
                        </View>


                        <View style={stiller.matrisAlani}>
                            {COLOR_PICKER_MATRIX.map((satir, sIdx) => (
                                <View key={sIdx} style={stiller.matrisSatiri}>
                                    {satir.map((renkKodu, rIdx) => (
                                        <TouchableOpacity
                                            key={rIdx}
                                            style={[
                                                stiller.matrisHücre,
                                                { backgroundColor: renkKodu },
                                                gecerliRenk === renkKodu && stiller.seciliHücre
                                            ]}
                                            onPress={() => setGecerliRenk(renkKodu)}
                                        />
                                    ))}
                                </View>
                            ))}
                        </View>


                        <TouchableOpacity
                            style={stiller.secimiBitirBtn}
                            onPress={() => {
                                const yeni = [...renkler];
                                if (seciliIndeks !== null) yeni[seciliIndeks] = gecerliRenk;
                                setRenkler(yeni);
                                setModalGorunur(false);
                            }}
                        >
                            <Text style={stiller.secimiBitirBtnYazi}>Rengi Uygula</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const stiller = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    merkez: { alignItems: 'center', paddingBottom: 120 },
    header: { marginTop: 50, alignItems: 'center' },
    logo: { fontSize: 30, fontWeight: 'bold' },
    anaKart: { width: '92%', marginTop: 25 },
    kartBaslik: { fontSize: 24, textAlign: 'center', marginBottom: 15, fontWeight: '300' },
    canvas: {
        padding: 40,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#eee',
        borderStyle: 'dashed',
        alignItems: 'center'
    },
    renkGrubu: { flexDirection: 'row', gap: 14, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' },
    renkKonteyner: { position: 'relative', width: 65, height: 65 },
    renkDaire: { width: '100%', height: '100%', borderRadius: 10 },
    daireSilBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#ff7675',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1
    },
    daireSilBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: -2 },
    butonSatiri: { flexDirection: 'row', gap: 8 },
    morBtn: { backgroundColor: '#6C63FF', padding: 12, borderRadius: 10 },
    siyahBtn: { backgroundColor: '#000', padding: 12, borderRadius: 10 },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    listeBolumu: { width: '92%', marginTop: 35 },
    listeBaslik: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    polaroidIzgara: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'center' },
    polaroidKart: {
        width: 160,
        backgroundColor: '#fff',
        padding: 10,
        paddingBottom: 25,
        borderRadius: 2,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    polaroidRenkAlani: {
        height: 140,
        width: '100%',
        flexDirection: 'row',
        borderRadius: 1
    },
    polaroidRenkKutusu: { flex: 1 },
    polaroidAltInfo: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    polaroidTarih: { fontSize: 11, color: '#666', fontWeight: '500' },
    silBtn: {
        backgroundColor: '#ff7675',
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center'
    },
    silBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

    // 🎨 COLOR PICKER STİLLERİ
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    pickerKonteyner: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 16
    },
    pickerBaslik: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#2D3436' },
    onizlemeKutusu: {
        width: '100%',
        height: 60,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#eee'
    },
    onizlemeYazi: { fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    matrisAlani: { width: '100%', gap: 10, marginBottom: 25 },
    matrisSatiri: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    matrisHücre: {
        width: 42,
        height: 42,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)'
    },
    seciliHücre: {
        borderWidth: 3,
        borderColor: '#000',
        transform: [{ scale: 1.1 }]
    },
    secimiBitirBtn: {
        backgroundColor: '#000',
        width: '100%',
        padding: 16,
        borderRadius: 15,
        alignItems: 'center'
    },
    secimiBitirBtnYazi: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});