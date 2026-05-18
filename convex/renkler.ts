import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// 🏠 ANA SAYFA FONKSİYONLARI (RENKLER TABLOSU)
// ==========================================

// Kategorileri veritabanından dinamik olarak çeker
export const kategorileriGetir = query({
    args: {},
    handler: async (ctx) => {
        try {
            const kategorilerListesi = await ctx.db.query("kategoriler").collect();
            return kategorilerListesi || [];
        } catch (e) {
            return [];
        }
    },
});

// Admin panelinden veritabanındaki "kategoriler" tablosuna dinamik ekleme yapar
export const kategoriEkleAdmin = mutation({
    args: { isim: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.insert("kategoriler", { isim: args.isim });
    },
});

// Renkler tablosunu çeken fonksiyon
export const paletleriGetir = query({
    args: {},
    handler: async (ctx) => {
        try {
            return await ctx.db.query("renkler").collect();
        } catch (e) {
            return [];
        }
    },
});

export const veritabaniniBesle = mutation({
    args: {},
    handler: async (ctx) => {
        return { success: true };
    },
});

// ==========================================
// 🎨 ATÖLYEM SAYFASI FONKSİYONLARI
// ==========================================

export const getAtolye = query({
    args: {},
    handler: async (ctx) => {
        try {
            return await ctx.db.query("atolye").order("desc").collect();
        } catch (e) {
            return [];
        }
    },
});

export const ekleAtolye = mutation({
    args: {
        renkler: v.array(v.string()),
        tarih: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("atolye", {
            renkler: args.renkler,
            tarih: args.tarih,
        });
    },
});

export const silAtolye = mutation({
    args: { id: v.id("atolye") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

// ==========================================
// 🛠️ ADMİN PANELİ FONKSİYONLARI (CRUD)
// ==========================================

export const paletEkleAdmin = mutation({
    args: {
        ad: v.string(),
        kategori: v.string(),
        renkler: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("renkler", {
            ad: args.ad,
            kategori: args.kategori,
            renkler: args.renkler,
        });
    },
});

export const paletGuncelleAdmin = mutation({
    args: {
        id: v.id("renkler"),
        ad: v.string(),
        kategori: v.string(),
        renkler: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            ad: args.ad,
            kategori: args.kategori,
            renkler: args.renkler,
        });
    },
});

export const paletSilAdmin = mutation({
    args: { id: v.id("renkler") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});