# PULAU SIMPULAN BAHASA — 3 IBNU SINA (3S)

Permainan PdPR Bahasa Melayu Tahun 3 (Sekolah Kebangsaan Sungai Abong), tema **platformer 2D** mirip mekanik Adventure Island. Grafik asli/ditulis sendiri, bukan aset permainan Nintendo/Hudson.

## DSKP

**KSSR Bahasa Melayu SK Tahun 3 (Semakan 2017), Aspek Seni Bahasa, Standard Kandungan 4.1, Standard Pembelajaran 4.1.1(i): simpulan bahasa.** Permainan memfokuskan pemahaman simpulan bahasa dalam cerita. Soalan ialah latihan pengukuhan secara kontekstual, bukan pengganti tugasan bercerita atau pentaksiran lisan yang diperlukan oleh standard.

- 8 pulau, 5 musuh setiap pulau = **40 soalan aras tinggi**.
- Murid 3S sahaja, memuat nama sebenar daripada Supabase (sesi 2026).
- Jawapan salah: soalan sama dan petunjuk; musuh belum kalah. Jawapan betul: musuh kalah; markah dan XP disimpan.
- Kontrol PC: A/D atau ←/→ untuk lari; Space/W/↑ untuk lompat; 1–4 atau klik untuk menjawab; Esc untuk jeda.
- Kawalan telefon: pad ◀/▶ dan butang LOMPAT. Sebelum START, menu potret; selepas START, cuba fullscreen + landscape, dengan putaran paparan CSS apabila orientation lock tidak disokong browser.
- Teacher Area: **DALMAN BIN DASIRON** log masuk dengan IC sendiri yang sudah wujud dalam jadual `teachers`. Admin **CIKGU ASRAF** juga diberi akses. Cikgu Azizah **bukan** guru yang dibenarkan dalam game ini.
- Kredit “CIKGU ASRAF” di dalam permainan dikecilkan ~50% berbanding game BI.

## Deploy ke GitHub + Vercel

**Cara paling mudah menggunakan ZIP projek ini:**

1. Extract ZIP, kemudian upload semua kandungan folder projek ini ke satu repository GitHub **baharu**, contohnya `Pulau-Simpulan-Bahasa-3S`. Jangan upload folder `rpg/` projek BI.
2. Dalam Vercel, **Add New → Project**, pilih repository baharu tadi.
3. Framework Preset = **Other**, Root Directory = **./** (jika root repo mempunyai `public/`), Build Command = `node verify.mjs`, Output Directory = `public`. Fail `vercel.json` akan menetapkan arahan itu.
4. Deploy. **Tiada environment variable diperlukan di Vercel**, kerana front-end hanya memanggil Supabase Edge Function khusus. Jangan letak service-role key dalam repo atau Vercel client!
5. Apabila deploy berjaya, uji menu 3S, pilihan nama murid, kawalan sentuh/laptop, 1 pertempuran jawapan betul/salah, dan Teacher Area menggunakan IC Dalman.

**Backend telah disediakan dalam akaun Supabase sekolah** (projek `sxmchnwzcbsanecxnqdt`): Edge Function `bm3-simpulan-api` dan jadual `bm3_simpulan_*` berdiri sendiri. Fail `server/migration.sql`, `server/edge.ts`, `server/bank.json` ialah salinan kod backend untuk dokumentasi/pemindahan nanti; **jangan jalankan migrasi berulang secara sembarangan**. Kod frontend menggunakan API aktif `https://sxmchnwzcbsanecxnqdt.supabase.co/functions/v1/bm3-simpulan-api`.

Aplikasi BI, GrammarCraft dan data lama tidak berubah. Permainan ini sengaja tidak menggunakan akaun anak/murid dengan kata laluan; pilihan nama murid seperti game asal ialah identifikasi kemajuan latihan, bukan pengesahan identiti murid yang kukuh.

## Fail penting

- `public/index.html`: laman utama, logo SKSA, footer.
- `public/style.css`: menu dan dashboard guru.
- `public/app.js`: pemilihan kelas dan murid, log masuk guru, kemajuan.
- `public/island-game.js`: enjin platformer, collision, sentuh/keyboard, musuh, kemajuan.
- `public/island-art.js`: peta, watak, musuh dan grafik pixel-art.
- `public/island.css`: paparan landscape responsif dan kredit kecil.
- `public/visuals.js`: potret watak dalam menu.
- `server/bank.json`: 40 soalan + jawapan dan petunjuk (server sahaja).
- `server/edge.ts`: semakan jawapan di server + akses guru.
- `server/migration.sql`: jadual permainan BM yang berasingan.
- `verify.mjs`: semakan automatik 40 soalan + JavaScript pada build.

**Nota:** Tidak ada jawapan kuiz yang disertakan dalam folder `public/`. Semua jawapan sebenar disemak di Supabase Edge Function.

© Cikgu Asraf — SK Sungai Abong.