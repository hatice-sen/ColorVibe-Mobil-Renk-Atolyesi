import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// 🏠 SORGULAR (QUERY)
// ==========================================

// Tüm paletleri getirir (Keşfet / Ana Sayfa için)
export const paletleriGetir = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("renkler").order("desc").collect();
    },
});

// Hatasız Atölye Sorgusu
// Kullanıcının atölye tablosundaki kendi paletlerini çeker
export const getAtolye = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("atolye").order("desc").collect();
    },
});

// Kategorileri veritabanından dinamik olarak çeker
export const kategorileriGetir = query({
    args: {},
    handler: async (ctx) => {
        const liste = await ctx.db.query("kategoriler").collect();
        if (liste.length === 0) {
            return [{ isim: "Pastel" }, { isim: "Neon" }, { isim: "Retro" }];
        }
        return liste;
    },
});

// ==========================================
// 🛠️ KULLANICI / ATÖLYE MUTASYONLARI
// ==========================================

// 🌟 HEM "AD" HEM "TARİH" SESTLERİNİ KABUL EDEN KUSURSUZ SÜRÜM
export const ekleAtolye = mutation({
    args: {
        ad: v.optional(v.string()),
        renkler: v.array(v.string()),
        tarih: v.optional(v.string()), // 🚀 İŞTE HATAYI ÇÖZEN SATIR: Frontend'den gelen tarihi kabul ediyoruz
    },
    handler: async (ctx, args) => {
        // Eğer frontend'den ad gelmediyse o anki saati varsayılan isim yapalım
        const simdikiZaman = new Date();
        const saatDinamik = simdikiZaman.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        const varsayilanIsim = `Atölye Paleti (${saatDinamik})`;

        return await ctx.db.insert("atolye", {
            ad: args.ad || varsayilanIsim,
            renkler: args.renkler,
            // Eğer frontend'den gelen bir tarih varsa onu kaydeder, yoksa backend'deki saati yazar
            tarih: args.tarih || saatDinamik,
        });
    },
});

// 🌟 ARTIK HATA VERMEYEN SİLME MUTASYONU (Frontend'in aradığı isimle birebir aynı)
export const silAtolye = mutation({
    args: {
        id: v.id("atolye"),
    },
    handler: async (ctx, args) => {
        const mevcut = await ctx.db.get(args.id);
        if (!mevcut) {
            throw new Error("Silinmek istenen atölye paleti bulunamadı!");
        }
        await ctx.db.delete(args.id);
    },
});

// ==========================================
// 🛠️ ADMIN MUTASYONLARI (MUTATION)
// ==========================================

// Yeni Palet Ekle
export const paletEkleAdmin = mutation({
    args: {
        ad: v.string(),
        kategori: v.string(),
        renkler: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("renkler", {
            ad: args.ad,
            kategori: args.kategori,
            renkler: args.renkler,
        });
    },
});

// Mevcut Paleti Güncelle
export const paletGuncelleAdmin = mutation({
    args: {
        id: v.id("renkler"),
        ad: v.string(),
        kategori: v.string(),
        renkler: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const mevcut = await ctx.db.get(args.id);
        if (!mevcut) {
            throw new Error("Güncellenmek istenen palet bulunamadı!");
        }
        await ctx.db.patch(args.id, {
            ad: args.ad,
            kategori: args.kategori,
            renkler: args.renkler,
        });
    },
});

// Palet Sil
export const paletSilAdmin = mutation({
    args: {
        id: v.id("renkler"),
    },
    handler: async (ctx, args) => {
        const mevcut = await ctx.db.get(args.id);
        if (!mevcut) {
            throw new Error("Silinmek istenen palet bulunamadı!");
        }
        await ctx.db.delete(args.id);
    },
});

// Yeni Kategori Ekle
export const kategoriEkleAdmin = mutation({
    args: {
        isim: v.string(),
    },
    handler: async (ctx, args) => {
        const varMi = await ctx.db
            .query("kategoriler")
            .filter((q) => q.eq(q.field("isim"), args.isim))
            .first();

        if (varMi) {
            throw new Error("Bu kategori zaten mevcut!");
        }

        return await ctx.db.insert("kategoriler", {
            isim: args.isim,
        });
    },
});