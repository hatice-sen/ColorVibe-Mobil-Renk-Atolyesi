import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { FavoriContext } from './_layout';

const Favorilerim = () => {
    // Sepetten hem listeyi hem de listeyi güncelleyen fonksiyonu (setFavoriler) aldık
    const { favoriler, setFavoriler } = useContext(FavoriContext);

    // Favorilerden kaldırma fonksiyonu (Convex ID yapısına göre _id olarak güncellendi)
    const favoridenKaldir = (id: string) => {
        const yeniListe = favoriler.filter((p: any) => p._id !== id);
        setFavoriler(yeniListe);
    };

    return (
        <SafeAreaView style={stiller.container}>
            <View style={stiller.ustBolum}>
                <Text style={stiller.anaBaslik}>Favorilerim</Text>
            </View>

            {favoriler.length === 0 ? (
                <View style={stiller.orta}>
                    <Text style={{fontSize: 60, marginBottom: 10}}>❤️</Text>
                    <Text style={{color: '#888', fontSize: 16}}>Henüz favori yok.</Text>
                </View>
            ) : (
                <FlatList
                    data={favoriler}
                    keyExtractor={(item) => item._id} // item.id yerine item._id yapıldı
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 }}
                    renderItem={({ item }) => (
                        <View style={stiller.polaroid}>
                            {/* 🌈 Gradyant buradaki düzeltmeyle artık ana sayfadaki gibi akıcı */}
                            <LinearGradient
                                colors={[item.renkler?.[0] || '#ddd', item.renkler?.[1] || '#999']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={stiller.renkKutusu}
                            />
                            <View style={stiller.kartIcerik}>
                                <Text style={stiller.paletIsmi}>{item.ad}</Text>

                                <View style={stiller.kodKutusu}>
                                    <Text style={stiller.kodYazisi}>
                                        {item.renkler?.[0]}  |  {item.renkler?.[1]}
                                    </Text>
                                </View>

                                {/* İŞTE O BUTON: KALDIRMA BUTONU */}
                                <TouchableOpacity
                                    style={stiller.kaldirButon}
                                    onPress={() => favoridenKaldir(item._id)} // item.id yerine item._id yapıldı
                                >
                                    <Text style={stiller.kaldirButonYazisi}>❌ FAVORİLERDEN KALDIR</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const stiller = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    ustBolum: { padding: 20, alignItems: "center", backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    anaBaslik: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
    orta: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    polaroid: { backgroundColor: '#fff', marginVertical: 10, borderRadius: 15, elevation: 5, borderWidth: 1, borderColor: '#eee', overflow: 'hidden' },
    renkKutusu: { height: 180, width: '100%' },
    kartIcerik: { padding: 20, alignItems: 'center' },
    paletIsmi: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    kodKutusu: { backgroundColor: '#f0f0f0', padding: 8, borderRadius: 5, marginTop: 10, marginBottom: 15, width: '100%', alignItems: 'center' },
    kodYazisi: { fontSize: 13, color: '#888', letterSpacing: 1, fontWeight: '500' },
    kaldirButon: {
        borderWidth: 1,
        borderColor: '#ff7675',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20
    },
    kaldirButonYazisi: { color: '#ff7675', fontWeight: 'bold', fontSize: 12 }
});

export default Favorilerim;