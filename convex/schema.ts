import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    renkler: defineTable({
        ad: v.string(),
        kategori: v.string(),
        renkler: v.array(v.string()),
    }),

    kategoriler: defineTable({
        isim: v.string(),
    }),

    atolye: defineTable({
        // 🌟 v.string() yerine v.optional(v.string()) yaparak hatayı esnetiyoruz:
        ad: v.optional(v.string()),
        renkler: v.array(v.string()),
        tarih: v.optional(v.string()), // Eski verinde tarih olduğu için bunu da ekleyebilirsin
    }),
});