import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, Alert, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function AdminPanel() {
    const [paletAdi, setPaletAdi] = useState('');
    const [kategori, setKategori] = useState('Pastel');
    const [renkler, setRenkler] = useState(['#FF7675', '#74B9FF']);
    const [guncellenenId, setGuncellenenId] = useState<any>(null);
    const [yeniKategoriAdi, setYeniKategoriAdi] = useState('');

    const [modalGorunur, setModalGorunur] = useState(false);
    const [seciliIndeks, setSeciliIndeks] = useState<number | null>(null);
    const [gecerliRenk, setGecerliRenk] = useState('#6C63FF');

    const [seciliKategori, setSeciliKategori] = useState('Hepsi');

    // 🚀 CONVEX HOOK'LARI
    const mevcutPaletler = useQuery(api.renkler.paletleriGetir);
    const veritabanıKategorileri = useQuery(api.renkler.kategorileriGetir);

    const paletEkleAdmin = useMutation(api.renkler.paletEkleAdmin);
    const paletGuncelleAdmin = useMutation(api.renkler.paletGuncelleAdmin);
    const paletSilAdmin = useMutation(api.renkler.paletSilAdmin);
    const kategoriEkleAdmin = useMutation(api.renkler.kategoriEkleAdmin);

    const COLOR_PICKER_MATRIX = [
        ['#FF7675', '#FAB1A0', '#FFEAA7', '#55E6C1', '#74B9FF', '#A29BFE', '#D288FC'],
        ['#E84393', '#E17055', '#FDCB6E', '#00B894', '#0984E3', '#6C63FF', '#B33771'],
        ['#D63031', '#D5A6BD', '#F39C12', '#2ECC71', '#2980B9', '#4834D4', '#6D214F'],
        ['#1A1A1A', '#2D3436', '#636E72', '#B2BEC3', '#DFE6E9', '#FFFFFF', '#ECE0D1']
    ];

    if (mevcutPaletler === undefined || veritabanıKategorileri === undefined) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                <ActivityIndicator size="large" color="#6C63FF" />
                <Text style={{ marginTop: 10, color: '#666' }}>Veritabanı senkronize ediliyor...</Text>
            </View>
        );
    }

    const kategoriKaydet = async () => {
        if (!yeniKategoriAdi.trim()) {
            Alert.alert("Hata", "Lütfen bir kategori adı girin!");
            return;
        }
        try {
            await kategoriEkleAdmin({ isim: yeniKategoriAdi.trim() });
            Alert.alert("Başarılı", `"${yeniKategoriAdi}" kategorisi başarıyla eklendi!`);
            setYeniKategoriAdi('');
        } catch (e) {
            Alert.alert("Hata", "Kategori eklenirken bir sorun oluştu.");
        }
    };

    const kaydet = async () => {
        if (!paletAdi) {
            Alert.alert("Hata", "Lütfen bir palet adı girin!");
            return;
        }
        try {
            if (guncellenenId) {
                await paletGuncelleAdmin({
                    id: guncellenenId,
                    ad: paletAdi,
                    kategori: kategori,
                    renkler: renkler
                });
                Alert.alert("Başarılı", "Palet başarıyla güncellendi!");
            } else {
                await paletEkleAdmin({
                    ad: paletAdi,
                    kategori: kategori,
                    renkler: renkler
                });
                Alert.alert("Başarılı", "Yeni palet ana sayfaya eklendi!");
            }
            formuSifirla();
        } catch (e) {
            console.log(e);
            Alert.alert("Hata", "Sisteme kaydederken bir sorun oluştu.");
        }
    };

    const duzenleModunaAl = (palet: any) => {
        setGuncellenenId(palet._id);
        setPaletAdi(palet.ad);
        setKategori(palet.kategori);
        setRenkler([...palet.renkler]);
    };

    const paletSil = async (id: any) => {
        Alert.alert("Emin misiniz?", "Bu hazır palet ana sayfadan tamamen silinecek.", [
            { text: "İptal" },
            { text: "Sil", onPress: async () => await paletSilAdmin({ id }) }
        ]);
    };

    const formuSifirla = () => {
        setGuncellenenId(null);
        setPaletAdi('');
        if (veritabanıKategorileri && veritabanıKategorileri.length > 0) {
            const ilkKat = veritabanıKategorileri[0];
            setKategori(typeof ilkKat === 'string' ? ilkKat : (ilkKat.isim || 'Pastel'));
        } else {
            setKategori('Pastel');
        }
        setRenkler(['#FF7675', '#74B9FF']);
    };

    const renkSeciciyiAc = (index: number, anlikRenk: string) => {
        setSeciliIndeks(index);
        setGecerliRenk(anlikRenk);
        setModalGorunur(true);
    };

    const renkSilDinamik = (index: number) => {
        if (renkler.length > 1) {
            setRenkler(renkler.filter((_, i) => i !== index));
        }
    };

    const filtrelenmiş = mevcutPaletler.filter((p: any) =>
        seciliKategori === 'Hepsi' || p.kategori?.toLowerCase() === seciliKategori.toLowerCase()
    );

    return (
        <SafeAreaView style={stiller.container}>
            <FlatList
                data={filtrelenmiş}
                keyExtractor={(item) => item._id}
                extraData={[mevcutPaletler, renkler, guncellenenId]}
                contentContainerStyle={stiller.scrollIcerik}
                ListHeaderComponent={
                    <>
                        <Text style={stiller.baslik}>Admin Panel</Text>
                        <Text style={stiller.altBaslik}>{guncellenenId ? "Mevcut Paleti Düzenle" : "Ana Sayfaya Yeni Renk Grubu Ekle"}</Text>

                        {/* YENİ KATEGORİ EKLEME BÖLÜMÜ */}
                        <View style={stiller.form}>
                            <Text style={stiller.ekstraBaslik}>✨ Yeni Kategori Oluştur</Text>
                            <Text style={stiller.etiket}>Kategori Adı:</Text>
                            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                <TextInput
                                    style={[stiller.input, { flex: 1, marginBottom: 0 }]}
                                    placeholder="Örn: Neon, Retro, Soft"
                                    value={yeniKategoriAdi}
                                    onChangeText={setYeniKategoriAdi}
                                />
                                <TouchableOpacity style={stiller.kategoriEkleBtn} onPress={kategoriKaydet}>
                                    <Text style={stiller.kategoriEkleBtnText}>Ekle</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* PALET EKLEME / DÜZENLEME FORM BÖLÜMÜ */}
                        <View style={stiller.form}>
                            <Text style={stiller.ekstraBaslik}>🎨 {guncellenenId ? "Paleti Düzenle" : "Yeni Renk Paleti Ekle"}</Text>
                            <Text style={stiller.etiket}>Palet İsmi:</Text>
                            <TextInput
                                style={stiller.input}
                                placeholder="Örn: Yaz Akşamı"
                                value={paletAdi}
                                onChangeText={setPaletAdi}
                            />

                            <Text style={stiller.etiket}>Kategori Seçin:</Text>
                            <View style={stiller.kategoriSatiri}>
                                {veritabanıKategorileri.map((kat: any, index: number) => {
                                    let katIsim = "";
                                    if (kat) {
                                        if (typeof kat === 'string') katIsim = kat;
                                        else if (typeof kat === 'object' && kat.isim) katIsim = kat.isim;
                                    }

                                    if (katIsim === "Hepsi") return null;

                                    const aktifMi = kategori.trim().toLowerCase() === katIsim.trim().toLowerCase();
                                    const anahtar = kat && kat._id ? kat._id.toString() : index.toString();

                                    return (
                                        <TouchableOpacity
                                            key={anahtar}
                                            style={[stiller.katBtn, aktifMi && stiller.katBtnAktif]}
                                            onPress={() => setKategori(katIsim)}
                                        >
                                            <Text style={[stiller.katText, aktifMi && stiller.katTextAktif]}>
                                                {katIsim || "İsimsiz"}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text style={stiller.etiket}>Renkleri Belirle:</Text>
                            <View style={stiller.renkSecimAlani}>
                                {renkler.map((renk, index) => (
                                    <View key={index} style={stiller.daireKonteyner}>
                                        <TouchableOpacity
                                            style={[stiller.renkDaire, { backgroundColor: renk }]}
                                            onPress={() => renkSeciciyiAc(index, renk)}
                                        />
                                        {renkler.length > 1 && (
                                            <TouchableOpacity style={stiller.daireSilBtn} onPress={() => renkSilDinamik(index)}>
                                                <Text style={stiller.daireSilBtnText}>×</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                                <TouchableOpacity style={stiller.artiBtn} onPress={() => setRenkler([...renkler, '#CCCCCC'])}>
                                    <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity style={[stiller.kaydetBtn, { flex: 2 }]} onPress={kaydet}>
                                    <Text style={stiller.kaydetText}>{guncellenenId ? "Değişiklikleri Kaydet" : "Sisteme Gönder"}</Text>
                                </TouchableOpacity>
                                {guncellenenId && (
                                    <TouchableOpacity style={[stiller.iptalBtn, { flex: 1 }]} onPress={formuSifirla}>
                                        <Text style={stiller.iptalText}>İptal</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* KATEGORİ FİLTRELEME ÇUBUĞU */}
                        <Text style={stiller.listeBaslik}>Sistemde Kayıtlı Hazır Paletler</Text>
                        <View style={{ height: 60, marginBottom: 10 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => setSeciliKategori('Hepsi')} style={[stiller.katFilterBtn, seciliKategori === 'Hepsi' && stiller.katFilterBtnAktif]}>
                                    <Text style={[stiller.katFilterTxt, seciliKategori === 'Hepsi' && stiller.katFilterTxtAktif]}>Hepsi</Text>
                                </TouchableOpacity>
                                {veritabanıKategorileri.map((k: any, i: number) => {
                                    const kIsim = k && k.isim ? k.isim : k;
                                    if (kIsim === "Hepsi") return null;
                                    return (
                                        <TouchableOpacity key={i} onPress={() => setSeciliKategori(kIsim)} style={[stiller.katFilterBtn, seciliKategori === kIsim && stiller.katFilterBtnAktif]}>
                                            <Text style={[stiller.katFilterTxt, seciliKategori === kIsim && stiller.katFilterTxtAktif]}>{kIsim}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </>
                }
                renderItem={({ item }) => {
                    const adminBenzersizKey = `admin-${item._id}-${item.ad}-${item.renkler?.join('-')}`;
                    return (
                        <View style={stiller.paletSatiri} key={adminBenzersizKey}>
                            <View style={{ flex: 1 }}>
                                <LinearGradient
                                    colors={item.renkler && item.renkler.length >= 2 ? [item.renkler[0], item.renkler[1]] : ['#ddd', '#999']}
                                    style={stiller.adminGradientPreview}
                                    start={{x:0, y:0}} end={{x:1, y:1}}
                                />
                                <Text style={stiller.paletSatirBaslik}>{item.ad}</Text>
                                <Text style={stiller.paletSatirAlt}>{item.kategori}</Text>
                                <View style={stiller.kucukRenkOnizleme}>
                                    {item.renkler.map((r: string, i: number) => (
                                        <View key={i} style={[stiller.kucukKutu, { backgroundColor: r }]} />
                                    ))}
                                </View>
                            </View>
                            <View style={stiller.aksiyonButonlari}>
                                <TouchableOpacity style={stiller.duzenleBtn} onPress={() => duzenleModunaAl(item)}>
                                    <Text style={stiller.btnYazi}>Düzenle</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={stiller.silBtn} onPress={() => paletSil(item._id)}>
                                    <Text style={stiller.btnYazi}>Sil</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
            />

            {/* COLOR PICKER MODAL */}
            <Modal visible={modalGorunur} transparent animationType="slide">
                <Pressable style={stiller.modalOverlay} onPress={() => setModalGorunur(false)}>
                    <View style={stiller.pickerKonteyner}>
                        <Text style={stiller.pickerBaslik}>Renk Seçici</Text>
                        <View style={[stiller.onizlemeKutusu, { backgroundColor: gecerliRenk }]}>
                            <Text style={{ color: gecerliRenk === '#FFFFFF' ? '#000' : '#fff', fontWeight: 'bold' }}>
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
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Seçimi Uygula</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const stiller = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    scrollIcerik: { padding: 20, paddingBottom: 100 },
    baslik: { fontSize: 32, fontWeight: 'bold', color: '#000', textAlign: 'center' },
    altBaslik: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 25 },
    form: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 5, marginBottom: 25 },
    ekstraBaslik: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
    etiket: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginBottom: 20, color: '#000' },
    kategoriSatiri: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
    katBtn: { minWidth: 75, padding: 10, borderRadius: 8, backgroundColor: '#eee', alignItems: 'center' },
    katBtnAktif: { backgroundColor: '#000' },
    katText: { color: '#666' },
    katTextAktif: { color: '#fff', fontWeight: 'bold' },
    renkSecimAlani: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 30, alignItems: 'center' },
    daireKonteyner: { position: 'relative', width: 50, height: 50 },
    renkDaire: { width: '100%', height: '100%', borderRadius: 25, borderWidth: 1, borderColor: '#ccc' },
    daireSilBtn: { position: 'absolute', top: -4, right: -4, backgroundColor: '#ff7675', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
    daireSilBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: -2 },
    artiBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center' },
    kaydetBtn: { backgroundColor: '#000', padding: 16, borderRadius: 12, alignItems: 'center' },
    kaydetText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    iptalBtn: { backgroundColor: '#dc3545', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    iptalText: { color: '#fff', fontWeight: 'bold' },
    listeBaslik: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#000' },
    paletSatiri: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
    adminGradientPreview: { width: '100%', height: 70, borderRadius: 8, marginBottom: 10 },
    paletSatirBaslik: { fontSize: 16, fontWeight: 'bold' },
    paletSatirAlt: { fontSize: 12, color: '#888', marginBottom: 6 },
    kucukRenkOnizleme: { flexDirection: 'row', gap: 4 },
    kucukKutu: { width: 20, height: 20, borderRadius: 4 },
    aksiyonButonlari: { flexDirection: 'row', gap: 8 },
    duzenleBtn: { backgroundColor: '#28a745', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
    silBtn: { backgroundColor: '#dc3545', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
    btnYazi: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    pickerKonteyner: { backgroundColor: '#fff', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, alignItems: 'center' },
    pickerBaslik: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    onizlemeKutusu: { width: '100%', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    matrisAlani: { width: '100%', gap: 8, marginBottom: 20 },
    matrisSatiri: { flexDirection: 'row', justifyContent: 'space-between' },
    matrisHücre: { width: 40, height: 40, borderRadius: 8 },
    seciliHücre: { borderWidth: 3, borderColor: '#000' },
    secimiBitirBtn: { backgroundColor: '#000', width: '100%', padding: 15, borderRadius: 10, alignItems: 'center' },
    kategoriEkleBtn: { backgroundColor: '#6C63FF', height: 48, paddingHorizontal: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    kategoriEkleBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    katFilterBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E5E7EB', marginRight: 10, height: 35, justifyContent: 'center' },
    katFilterBtnAktif: { backgroundColor: '#111827' },
    katFilterTxt: { color: '#4B5563', fontWeight: '600', fontSize: 13 },
    katFilterTxtAktif: { color: '#fff' }
});

const KorumaliGirisEkrani = () => {
    const [yetkiVarMi, setYetkiVarMi] = useState(false);
    const [girilenSifre, setGirilenSifre] = useState("");
    const JURI_SIFRESI = "1234";

    const girisYazisiniKontrolEt = () => {
        if (girilenSifre === JURI_SIFRESI) {
            setYetkiVarMi(true);
        } else {
            Alert.alert("Erişim Engellendi", "Hatalı Yönetici Şifresi! ❌");
            setGirilenSifre("");
        }
    };

    if (!yetkiVarMi) {
        return (
            <SafeAreaView style={kilitEkranStilleri.arkaPlan}>
                <View style={kilitEkranStilleri.kutu}>
                    <Text style={kilitEkranStilleri.emoji}>🔒</Text>
                    <Text style={kilitEkranStilleri.baslik}>Yönetici Yetkilendirmesi</Text>
                    <Text style={kilitEkranStilleri.aciklama}>Admin Paneline erişmek için şifreyi giriniz.</Text>

                    <TextInput
                        style={kilitEkranStilleri.girdiAlani}
                        placeholder="Şifre"
                        placeholderTextColor="#aaa"
                        secureTextEntry={true}
                        value={girilenSifre}
                        onChangeText={setGirilenSifre}
                        keyboardType="numeric"
                    />

                    <TouchableOpacity style={kilitEkranStilleri.buton} onPress={girisYazisiniKontrolEt}>
                        <Text style={kilitEkranStilleri.butonMetni}>Sisteme Giriş Yap</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return <AdminPanel />;
};

const kilitEkranStilleri = StyleSheet.create({
    arkaPlan: { flex: 1, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
    kutu: { width: '85%', backgroundColor: '#fff', padding: 30, borderRadius: 24, alignItems: 'center', elevation: 4 },
    emoji: { fontSize: 40, marginBottom: 15 },
    baslik: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
    aciklama: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 25 },
    girdiAlani: { width: '100%', height: 50, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 15, fontSize: 18, textAlign: 'center', color: '#111827', marginBottom: 20 },
    buton: { backgroundColor: '#111827', width: '100%', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    butonMetni: { color: '#fff', fontSize: 15, fontWeight: '600' }
});

export default KorumaliGirisEkrani;