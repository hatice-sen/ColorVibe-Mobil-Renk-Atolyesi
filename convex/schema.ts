import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Ana sayfadaki hazır paletlerin tablosu
    renkler: defineTable({
        ad: v.string(),
        kategori: v.string(), // Kategorinin adını string olarak tutuyoruz
        renkler: v.array(v.string()),
    }),

    // Dinamik kategorilerin tutulduğu tablo
    kategoriler: defineTable({
        isim: v.string(), // Admin panelinden eklenen kategorinin adı
    }),

    // Atölyem (Kaydedilenler) tablosu
    atolye: defineTable({
        renkler: v.array(v.string()),
        tarih: v.string(),
    }),
});