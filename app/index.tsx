import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriContext } from './_layout';
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const { favoriler, setFavoriler } = useContext(FavoriContext);
    const [seciliKategori, setSeciliKategori] = useState('Hepsi');
    const [refreshing, setRefreshing] = useState(false);
    const isFocused = useIsFocused();

    const veritabanıKategorileri = useQuery(api.renkler.kategorileriGetir);
    const hazırPaletler = useQuery(api.renkler.paletleriGetir);

    useEffect(() => {
        if (isFocused) {
            AsyncStorage.getItem('colorvibe_favs').then(v => {
                if (v) setFavoriler(JSON.parse(v));
            });
        }
    }, [isFocused]);

    useEffect(() => {
        if (hazırPaletler && hazırPaletler.length > 0 && favoriler.length > 0) {
            let degisiklikVarMi = false;

            const gecerliVeGuncelFavoriler = favoriler
                .map((fav: any) => {
                    const dbHali = hazırPaletler.find((dbPalet: any) => dbPalet._id === fav._id);
                    if (!dbHali) {
                        degisiklikVarMi = true;
                        return null;
                    }
                    if (JSON.stringify(dbHali) !== JSON.stringify(fav)) {
                        degisiklikVarMi = true;
                        return dbHali;
                    }
                    return fav;
                })
                .filter(Boolean);

            if (degisiklikVarMi) {
                setFavoriler(gecerliVeGuncelFavoriler);
                AsyncStorage.setItem('colorvibe_favs', JSON.stringify(gecerliVeGuncelFavoriler));
            }
        }
    }, [hazırPaletler, isFocused]);

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    if (!hazırPaletler || !veritabanıKategorileri) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#4B5563" />
                </View>
            </SafeAreaView>
        );
    }

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
            <View style={styles.header}>
                <Text style={styles.title}>ColorVibe</Text>
                <Text style={styles.subtitle}>Ruhunu yansıtan renk kombinasyonlarını keşfet, yönet ve tasarla.</Text>
            </View>

            <View style={{ height: 60, marginBottom: 15 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20,
                                                                                                       alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setSeciliKategori('Hepsi')} style={[styles.katBtn,
                                                               seciliKategori === 'Hepsi' && styles.katBtnAktif]}>
                        <Text style={[styles.katTxt, seciliKategori === 'Hepsi' && styles.katTxtAktif]}>Hepsi</Text>
                    </TouchableOpacity>
                    {veritabanıKategorileri.map((k: any, i: number) => {
                        const kIsim = k && k.isim ? k.isim : k;
                        if (kIsim === "Hepsi") return null;
                        return (
                            <TouchableOpacity key={i} onPress={() => setSeciliKategori(kIsim)} style={[styles.katBtn,
                                                                         seciliKategori === kIsim && styles.katBtnAktif]}>
                                <Text style={[styles.katTxt, seciliKategori === kIsim && styles.katBtnAktif]}>{kIsim}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <FlatList
                data={filtrelenmiş}
                keyExtractor={(item) => item._id}
                extraData={[hazırPaletler, favoriler, isFocused, seciliKategori, refreshing]}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const favMi = favoriler.some((f: any) => f._id === item._id);
                    const benzersizKey = `${item._id}-${item.ad}-${item.renkler?.join('-')}-${refreshing}`;

                    const renkListesi: string[] = Array.isArray(item.renkler) && item.renkler.length > 0
                        ? item.renkler
                        : ['#ddd', '#999'];

                    return (
                        <View style={styles.card} key={benzersizKey}>

                            {/* 🌟 KÖŞELERİ BOŞ KALMAYAN DİĞER TARAFA ÇAPRAZ YENİ TASARIM */}
                            <View style={styles.paletteContainer}>
                                <View style={styles.diagonalWrapper}>
                                    {renkListesi.map((renk, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.colorStripe,
                                                { backgroundColor: renk }
                                            ]}
                                        />
                                    ))}
                                </View>
                            </View>

                            <Text style={styles.cardTitle}>{item.ad}</Text>
                            <View style={styles.codeBox}>
                                <Text style={styles.codeText}>{renkListesi.join(' | ')}</Text>
                            </View>

                            <TouchableOpacity onPress={() => favoriyeEkle(item)} style={[styles.favBtn, favMi && styles.favBtnAktif]}>
                                <Ionicons name={favMi ? "heart" : "heart-outline"} size={16} color={favMi ? '#E11D48' : '#374151'} />
                                <Text style={[styles.favBtnText, {color: favMi ? '#E11D48' : '#374151' }]}>
                                    Favori
                                </Text>
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
    header: { alignItems: 'center', padding: 30, paddingBottom: 20 },
    title: { fontSize: 48, fontWeight: '300', color: '#1F2937', letterSpacing: 1 },
    subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 10, lineHeight: 22, paddingHorizontal: 15 },
    katBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, backgroundColor: '#E5E7EB', marginRight: 12, elevation: 1 },
    katBtnAktif: { backgroundColor: '#111827', elevation: 3 },
    katTxt: { color: '#4B5563', fontWeight: '600', fontSize: 14 },
    katTxtAktif: { color: '#fff' },
    card: { backgroundColor: '#fff', padding: 20, marginBottom: 25, elevation: 4, shadowOpacity: 0.15, shadowRadius: 8,
         shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },

    paletteContainer: { width: '100%', height: 240, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB',
         overflow: 'hidden' },
    diagonalWrapper: { flexDirection: 'row', width: '200%', height: '200%', transform: [{ rotate: '45deg' }],
                        left: '-50%', top: '-50%', justifyContent: 'center', alignItems: 'center' },
    colorStripe: { flex: 1, height: '100%', marginHorizontal: -0.5 },

    cardTitle: { fontSize: 26, textAlign: 'center', color: '#1F2937', marginBottom: 12, fontWeight: '300' },
    codeBox: { backgroundColor: '#F9FAFB', padding: 10, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB' },
    codeText: { textAlign: 'center', color: '#6B7280', fontSize: 12, lineHeight: 18, letterSpacing: 0.5 },
    favBtn: { alignSelf: 'center', borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 25, paddingVertical: 8,
              borderRadius: 10, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', elevation: 2,
              shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
    favBtnAktif: { backgroundColor: '#FFF1F2', borderColor: '#FDA4AF', elevation: 1 },
    favBtnText: { fontWeight: '500', fontSize: 14, marginLeft: 8 },
});