import React, { createContext, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL!;
const convex = new ConvexReactClient(convexUrl);

export const FavoriContext = createContext<any>(null);

export default function RootLayout() {
  const [favoriler, setFavoriler] = useState<any[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  return (
      <ConvexProvider client={convex}>
        <FavoriContext.Provider value={{ favoriler, setFavoriler }}>
          <View style={{ flex: 1 }}>
            <Slot />

            {/* FOOTER - TAM SENİN İSTEDİĞİN GİBİ */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.tab} onPress={() => router.push('/')}>
                <Text style={[styles.icon, pathname === '/' && styles.aktif]}>🔍</Text>
                <Text style={[styles.text, pathname === '/' && styles.aktif]}>Keşfet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab} onPress={() => router.push('/favorilerim')}>
                <Text style={[styles.icon, pathname === '/favorilerim' && styles.aktif]}>❤️</Text>
                <Text style={[styles.text, pathname === '/favorilerim' && styles.aktif]}>Favoriler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab} onPress={() => router.push('/atolyem')}>
                <Text style={[styles.icon, pathname === '/atolyem' && styles.aktif]}>🎨</Text>
                <Text style={[styles.text, pathname === '/atolyem' && styles.aktif]}>Atölyem</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab} onPress={() => router.push('/admin')}>
                <Text style={[styles.icon, pathname === '/admin' && styles.aktif]}>⚙️</Text>
                <Text style={[styles.text, pathname === '/admin' && styles.aktif]}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </FavoriContext.Provider>
      </ConvexProvider>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', height: 70, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', paddingBottom: 10 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20, color: '#999' },
  text: { fontSize: 11, color: '#666', marginTop: 2 },
  aktif: { color: '#000', fontWeight: 'bold' }
});