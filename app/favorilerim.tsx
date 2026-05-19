import React, { useContext, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriContext } from './_layout';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen() {
    const { favoriler, setFavoriler } = useContext(FavoriContext);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            AsyncStorage.getItem('colorvibe_favs').then(v => {
                if (v) setFavoriler(JSON.parse(v));
            });
        }
    }, [isFocused]);

    const favoriKaldır = async (id: string) => {
        const yeniList = favoriler.filter((f: any) => f._id !== id);
        setFavoriler(yeniList);
        await AsyncStorage.setItem('colorvibe_favs', JSON.stringify(yeniList));
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Favorilerim</Text>
                <Text style={styles.subtitle}>Kaydettiğin sana özel favori renk paletlerin.</Text>
            </View>

            {favoriler.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
                    <Text style={{ fontSize: 40, marginBottom: 10 }}>🤍</Text>
                    <Text style={{ color: '#888', textAlign: 'center' }}>Henüz favorilere eklenmiş bir renk paleti yok.</Text>
                </View>
            ) : (
                <FlatList
                    data={favoriler}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        const renkListesi: string[] = Array.isArray(item.renkler) ? item.renkler : ['#ddd', '#999'];

                        return (
                            <View style={styles.card}>

                                {/* 🌟 FAVORİLERDE DE KÖŞELERİ TAM KAPATAN SOL ALTTAN SAĞ ÜSTE ÇAPRAZ TASARIM */}
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

                                <TouchableOpacity onPress={() => favoriKaldır(item._id)} style={styles.favBtn}>
                                    <Ionicons name="heart" size={16} color="#E11D48" />
                                    <Text style={styles.favBtnText}>Favorilerden Kaldır</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { alignItems: 'center', padding: 30, paddingBottom: 20 },
    title: { fontSize: 36, fontWeight: '300', color: '#1F2937' },
    subtitle: { fontSize: 14, color: '#6B7280', marginTop: 5 },
    card: { backgroundColor: '#fff', padding: 20, marginBottom: 25, elevation: 4, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },

    // Hatayı temizleyen ve tasarımı düzelten yeni stil bloğu
    paletteContainer: { width: '100%', height: 240, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
    diagonalWrapper: { flexDirection: 'row', width: '200%', height: '200%', transform: [{ rotate: '45deg' }], left: '-50%', top: '-50%', justifyContent: 'center', alignItems: 'center' },
    colorStripe: { flex: 1, height: '100%', marginHorizontal: -0.5 },

    cardTitle: { fontSize: 22, textAlign: 'center', color: '#1F2937', marginBottom: 10, fontWeight: '300' },
    codeBox: { backgroundColor: '#F9FAFB', padding: 8, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB' },
    codeText: { textAlign: 'center', color: '#6B7280', fontSize: 12 },
    favBtn: { alignSelf: 'center', borderWidth: 1, borderColor: '#FDA4AF', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, backgroundColor: '#FFF1F2', flexDirection: 'row', alignItems: 'center' },
    favBtnText: { fontWeight: '500', fontSize: 14, marginLeft: 8, color: '#E11D48' },
});