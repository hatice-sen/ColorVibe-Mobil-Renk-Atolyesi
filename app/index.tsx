import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriContext } from './_layout';
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function HomeScreen() {
    const { favoriler, setFavoriler } = useContext(FavoriContext);
    const [seciliKategori, setSeciliKategori] = useState('Hepsi');

    const veritabanıKategorileri = useQuery(api.renkler.kategorileriGetir);
    const hazırPaletler = useQuery(api.renkler.paletleriGetir);

    // HAFIZADAN ÇEK
    useEffect(() => {
        AsyncStorage.getItem('colorvibe_favs').then(v => {
            if (v) setFavoriler(JSON.parse(v));
        });
    }, []);

    // 🌟 KURŞUN GEÇİRMEZ TEMİZLİK MEKANİZMASI:
    // Veritabanından gelen paletler her güncellendiğinde favorileri kontrol et.
    // Eğer favorilerdeki bir palet artık veritabanında (hazırPaletler içinde) YOKSA, onu otomatik olarak sil!
    useEffect(() => {
        if (hazırPaletler && hazırPaletler.length > 0 && favoriler.length > 0) {
            // Sadece hala veritabanında var olan paletleri filtrele
            const gecerliFavoriler = favoriler.filter((fav: any) =>
                hazırPaletler.some((dbPalet: any) => dbPalet._id === fav._id)
            );

            // Eğer silinmiş bir palet bulunduysa, listeyi güncelle ve yerel hafızayı eşitle
            if (gecerliFavoriler.length !== favoriler.length) {
                setFavoriler(gecerliFavoriler);
                AsyncStorage.setItem('colorvibe_favs', JSON.stringify(gecerliFavoriler));
            }
        }
    }, [hazırPaletler]);

    if (!hazırPaletler || !veritabanıKategorileri) return null;

    // FAVORİ EKLEME
    const favoriyeEkle = async (palet: any) => {
        const varMi = favoriler.find((f: any) => f._id === palet._id);
        let yeniList;
        if (varMi) {
            yeniList = favoriler.filter((f: any) => f._id !== palet._id);
        } else {
            yeniList = [...favoriler, palet];
        }
        setFavoriler(yeniList);
        await AsyncStorage.setItem('colorvibe_favs', JSON.stringify(yeniList));
    };

    const filtrelenmiş = hazırPaletler.filter((p: any) =>
        seciliKategori === 'Hepsi' || p.kategori?.toLowerCase() === seciliKategori.toLowerCase()
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* BAŞLIK */}
            <View style={styles.header}>
                <Text style={styles.title}>ColorVibe</Text>
                <Text style={styles.subtitle}>Ruhunu yansıtan renk kombinasyonlarını keşfet, yönet ve tasarla.</Text>
            </View>

            {/* KATEGORİLER */}
            <View style={{ height: 60 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setSeciliKategori('Hepsi')} style={[styles.katBtn, seciliKategori === 'Hepsi' && styles.katBtnAktif]}>
                        <Text style={[styles.katTxt, seciliKategori === 'Hepsi' && styles.katTxtAktif]}>Hepsi</Text>
                    </TouchableOpacity>
                    {veritabanıKategorileri.map((k: any, i: number) => {
                        const kIsim = k && k.isim ? k.isim : k;
                        if (kIsim === "Hepsi") return null;
                        return (
                            <TouchableOpacity key={i} onPress={() => setSeciliKategori(kIsim)} style={[styles.katBtn, seciliKategori === kIsim && styles.katBtnAktif]}>
                                <Text style={[styles.katTxt, seciliKategori === kIsim && styles.katTxtAktif]}>{kIsim}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* PALET LİSTESİ */}
            <FlatList
                data={filtrelenmiş}
                keyExtractor={(item) => item._id}
                extraData={[hazırPaletler, favoriler]} // Hem veritabanı hem favori değişimlerini izle
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                renderItem={({ item }) => {
                    const favMi = favoriler.some((f: any) => f._id === item._id);
                    return (
                        <View style={styles.card}>
                            <LinearGradient
                                colors={[item.renkler?.[0] || '#ddd', item.renkler?.[1] || '#999']}
                                style={styles.gradient}
                                start={{x:0, y:0}} end={{x:1, y:1}}
                            />

                            <Text style={styles.cardTitle}>{item.ad}</Text>
                            <View style={styles.codeBox}>
                                <Text style={styles.codeText}>{item.renkler?.join(' | ')}</Text>
                            </View>

                            {/* FAVORİ BUTONU */}
                            <TouchableOpacity onPress={() => favoriyeEkle(item)} style={[styles.favBtn, favMi && styles.favBtnAktif]}>
                                <Text style={{color: favMi ? '#E11D48' : '#374151', fontWeight: '500'}}>{favMi ? "💗 Favori" : "🤍 Favori"}</Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { alignItems: 'center', padding: 30 },
    title: { fontSize: 42, fontWeight: '300', color: '#222' },
    subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 5 },
    katBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E5E7EB', marginRight: 10 },
    katBtnAktif: { backgroundColor: '#111827' },
    katTxt: { color: '#4B5563', fontWeight: '600' },
    katTxtAktif: { color: '#fff' },
    card: { backgroundColor: '#fff', padding: 15, marginBottom: 20, elevation: 2, shadowOpacity: 0.1, shadowRadius: 5 },
    gradient: { width: '100%', height: 200, borderRadius: 4, marginBottom: 15 },
    cardTitle: { fontSize: 22, textAlign: 'center', color: '#333', marginBottom: 10, fontWeight: '300' },
    codeBox: { backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8, marginBottom: 10 },
    codeText: { textAlign: 'center', color: '#6B7280', fontSize: 11 },
    favBtn: { alignSelf: 'center', borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 20, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fff' },
    favBtnAktif: { backgroundColor: '#FFF1F2', borderColor: '#FDA4AF' }
});