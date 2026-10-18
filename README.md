# GrammarCraft

Game Bahasa Inggeris gaya dunia blok untuk SK Sungai Abong. Semua arahan dalam game dan dashboard guru menggunakan Bahasa Inggeris.

## Terus repo GitHub dan deploy Vercel

Backend Supabase untuk sekolah ini sudah disediakan. Pakej Vercel menggunakan login IC yang sama dengan game semasa dan menyimpan progressnya dalam Supabase. Hosting asal mengekalkan progress terdahulu dalam D1. Keputusan pada dua hosting ini berasingan; progress lama tidak dipindahkan secara automatik. Tiada environment variable atau API key yang perlu dimasukkan ke Vercel untuk pemasangan ini. Fail game siap dibina dan disertakan dalam `public/`; Vercel tidak perlu menjalankan skrip binaan.

1. Extract ZIP. Buka folder **GrammarCraft**.
2. Di GitHub, buka repository dan pilih **Add file → Upload files**. Dari File Explorer, **drag & drop semua fail bersama folder** di dalam folder GrammarCraft ke ruang upload. Commit perubahan ke root repository. Pastikan `package.json`, `vercel.json`, folder `api/` dan folder `public/` berada di root. Upload folder tersebut sekali, bukan fail JSON sahaja.
3. Di Vercel, pilih **Add New → Project → Import Git Repository** dan pilih repository tersebut.
4. Framework Preset: **Other**. Root Directory: root repository. Konfigurasi dalam `vercel.json` sudah memilih Other, mengosongkan Build Command dan menetapkan Output Directory `public`. Ia mengatasi tetapan build lama pada dashboard. Tekan **Deploy**.
5. Buka pautan Vercel. Murid pilih kelas → nama penuh → karakter → Start adventure. Guru buka **Teacher Area** atau tambah `/?teacher=1`, kemudian masukkan IC berdaftar.

Node.js 24 digunakan untuk fungsi API. Deployment menggunakan fail `public/` yang telah siap dan fungsi `api/index.js` yang berdikari. Ia tidak memerlukan folder `scripts/`, `worker/` atau `src/` untuk berjalan. Folder sumber masih disertakan untuk penyelenggaraan. Fail kod backend disertakan untuk penyelenggaraan; **tidak perlu deploy semula backend Supabase** untuk menggunakan pakej ini.

## Jika deployment terdahulu gagal

Ralat **Cannot find module .../scripts/build.mjs** bermaksud deployment masih cuba memanggil skrip binaan yang tiada dalam checkout Vercel. Gantikan `vercel.json`, `package.json` dan `api/index.js` menggunakan pakej baharu; pastikan keseluruhan folder `public/` turut berada dalam repository. Commit perubahan dan redeploy commit terkini. Pakej ini mengosongkan build Vercel. Jika tetapan lama masih memanggil `npm run build:vercel`, arahan tersebut kini hanya menyemak fail siap dan tidak menggunakan `scripts/build.mjs`.

Untuk mengubah soalan atau UI pada masa akan datang, jalankan `node scripts/build.mjs` dalam checkout sumber penuh dahulu dan commit semula kandungan `public/` yang dijana. `npm run build:vercel` ialah semakan pakej siap, bukan penjana soalan.

## Kelas, guru dan aktiviti

| Kelas | Murid | Guru | Aktiviti |
|---|---:|---|---|
| 1S — 1 Ibnu Sina | 37 | Mohd. Sukhairi bin Osman | Tahun 1, aras sederhana |
| 2B — 2 Ibnu Battutah | 28 | Mohd. Sukhairi bin Osman | Tahun 2, aras rendah |
| 2K — 2 Ibnu Khaldun | 37 | Noor Afiq bin Noor Othman | Tahun 2, aras rendah |
| 2S — 2 Ibnu Sina | 36 | Noor Afiq bin Noor Othman | Tahun 2, aras sederhana dan tinggi |
| 3B — 3 Ibnu Battutah | 26 | Sujatha a/p Rajamanikam | Tahun 3, aras rendah dan sederhana rendah |
| 3K — 3 Ibnu Khaldun | 31 | Mohd Hasrul Asraf bin Othman | Tahun 3, aras sederhana dan sederhana tinggi |
| 4B — 4 Ibnu Battutah | 25 | Mohd Hasrul Asraf bin Othman | Tahun 4, aras rendah dan sederhana rendah |
| 4K — 4 Ibnu Khaldun | 30 | Nurul Izzati binti Abu Jais | Tahun 4, aras sederhana rendah |
| 5S — 5 Ibnu Sina | 38 | Sujatha a/p Rajamanikam | Tahun 5, aras tinggi |
| 6B — 6 Ibnu Battutah | 15 | Mohd Hasrul Asraf bin Othman | Tahun 6, aras rendah dan sederhana rendah |
| 6S — 6 Ibnu Sina | 34 | Nurul Izzati binti Abu Jais | Tahun 6, aras tinggi; 20/40 KBAT |

Jumlah **337 murid dalam sebelas kelas**. Setiap kelas mempunyai 8 misi dan 40 aktiviti. Terdapat sepuluh set berbeza: 2B dan 2K berkongsi set aras rendah, manakala 2S menggunakan set sendiri; 6B dan 6S juga berasingan. 3K dan 4B mempunyai set tersendiri, berasingan daripada 3B dan 4K. Soalan dan handbook bertukar mengikut kelas. Senarai nama ialah enrolmen aktif 2026 daripada database SPBT. Sembilan kelas asal disahkan pada 14 Oktober 2026; 31 murid 3K dan 25 murid 4B disahkan pada 18 Oktober 2026. Tiada nama ditaip bebas. Perubahan enrolmen perlu diselaraskan semula dalam `src/roster.json`.

Pemilihan nama ialah pengenalan murid untuk aktiviti kelas. Murid tidak memerlukan kata laluan. Rekod disimpan berasingan menggunakan ID murid rasmi.

Footer kredit **@Copyright of Cikgu Asraf – SK Sg Abong English Panel** dipaparkan pada semua paparan game dan dashboard guru, serta achievement card yang dimuat turun atau dicetak.

## Pemain dan loading

Butang **Change Player** tidak lagi dipaparkan selepas murid masuk game. Nama yang disahkan kekal semasa sesi tersebut; **Choose again** masih tersedia sebelum pengesahan mula bermain.

Logo asal SK Sungai Abong disertakan dalam pakej, dengan dua arus elektrik berbentuk blok yang berpusing berlawanan arah. Loading muncul semasa game bermula, dunia/paparan dibuka, achievement card disediakan serta login, laporan, import dan reset guru diproses. Simpan progress menggunakan animasi kecil di penjuru skrin supaya murid boleh terus bermain. Semakan berkala tidak membuka overlay. Loading tamat apabila proses selesai atau gagal; progress offline tetap disimpan. Peranti dengan **Reduce motion** memaparkan versi statik.

Sumber logo: https://i.postimg.cc/3RF9M05N/Logo-SKSA.png. PNG asal disertakan tanpa suntingan dalam `src/assets/school-logo.png`; binaan Vercel menyediakannya dalam `public/assets/`. Fail HTML kendiri turut membenamkan logo tersebut. UI loading dikendalikan oleh `src/loading.js` dan `src/loading.css`.

## Dashboard guru

Login guru menggunakan IC 12 digit berdaftar dalam Supabase. Sujatha mendapat pilihan 5S dan 3B, Sukhairi mendapat 1S dan 2B, Izzati mendapat 6S dan 4K, Noor Afiq mendapat 2K dan 2S, dan Asraf mendapat 6B, 4B dan 3K. Server memeriksa kelas untuk membaca keputusan, import latihan lama dan reset; menukar URL tidak memberi akses kepada kelas guru lain. Tugasan dan data SPBT tidak diubah.

Dashboard memaparkan nama penuh, status, jumlah aktiviti selesai, jawapan betul pada cubaan pertama, petunjuk yang digunakan, XP, pecahan misi dan masa simpan terakhir. Untuk 6S, ia juga menunjukkan aktiviti penaakulan yang selesai daripada 20 aktiviti KBAT; maklumat itu turut disertakan dalam CSV. Ia refresh setiap 15 saat. **Download CSV** memuat turun laporan kelas yang dipilih.

Untuk kosongkan latihan murid: **Reset → semak nama → Reset progress**. Hanya murid tersebut dikosongkan. Sesi lama dan salinan offline tidak boleh memulihkan progress yang telah direset. Reset tidak boleh dibatalkan. Latihan lama dalam browser yang sama boleh dimasukkan melalui **Import earlier practice**.

Progress disimpan pada peranti ketika offline dan diselaraskan semula apabila online. Murid yang memilih nama sama pada peranti lain boleh meneruskan latihan yang sudah disimpan online. **First try** tidak dikira jika petunjuk digunakan atau terdapat cubaan salah. Ulangan misi tidak menggandakan XP.

## Kandungan dan DSKP

Semua soalan ialah aktiviti asal. Setiap tahun merujuk DSKP KSSR Bahasa Inggeris **Sekolah Kebangsaan** tahun berkenaan. `CURRICULUM.md` mengandungi senarai set, topik, halaman rujukan dan senarai tepat 20 aktiviti KBAT 6S dengan rasionalnya. Fail `src/year*.json` menyimpan pemetaan tersebut bersama soalan.

- Tahun 1: nama/umur, his/her, a/an, arahan, suka/tidak suka, have got, in/on/under dan sifat objek.
- Tahun 2: rutin/hari, Do you, there is/are, bilangan, this/these, pakaian/is wearing, can/can't, kedudukan dan cadangan Let's. Set 2S menggunakan lebih banyak konteks dan petunjuk; skop tetap Tahun 2.
- Tahun 3: plurals/pronouns, present simple/continuous, simple past, conjunctions, kedudukan dan perbandingan ringkas.
- Tahun 4: kuantiti, possession/whose, rutin dan aktiviti sekarang, verb + ing/to, simple past/could, going to, why/because dan perbandingan.
- Tahun 5: grammar dalam situasi, membaiki mesej, soalan/rutin, arahan tersusun, cerita lampau, ramalan/janji/rancangan, can/can't dan perbandingan dengan petunjuk.
- Tahun 6: 6B disemak terhadap DSKP Tahun 6, termasuk kebenaran mengukuhkan grammar Tahun 1–5. Teks/ jawapan/ID misi asal dikekalkan supaya progress lama serasi. 6S menggunakan set Tahun 6 yang berasingan dengan **tepat 20 aktiviti KBAT daripada 40**.

Dua set tambahan menggunakan 40 soalan masing-masing: 4B mempunyai 20 aras rendah dan 20 sederhana rendah; 3K mempunyai 20 aras sederhana dan 20 sederhana tinggi. Aras ini ialah kategori reka bentuk latihan, bukan Tahap Penguasaan PBD atau aras CEFR. Semua ID murid, ID misi dan bank soalan sembilan kelas asal dikekalkan.

KBAT 6S berasaskan analisis dan penilaian situasi/petunjuk mengikut penerangan HOTS dalam DSKP Tahun 6, bukan ditentukan oleh panjang ayat. Setiap aktiviti KBAT ditanda dalam data kandungan dengan aras kognitif dan rasional; 20 lagi ialah latihan grammar langsung. UI murid menggunakan label English **Think it through** dan laporan guru menggunakan **Reasoning**.

Ini latihan grammar bagi topik dan standard terpilih. Markah game bukan penentuan automatik Tahap Penguasaan PBD atau penilaian penuh semua kemahiran DSKP.

## Struktur kod

- `src/`: UI, ilustrasi SVG asal, roster dan sepuluh set aktiviti bagi sebelas kelas.
- `api/index.js`: Vercel API yang menghubungkan game kepada backend sekolah.
- `vercel.json`: konfigurasi routing dan build Vercel.
- `worker/api.js`: API bersama; `worker/index.js` dijana semasa build.
- `supabase/functions/grammarcraft-api/`: backend Supabase, login IC dan adapter simpanan.
- `supabase/schema.sql`: jadual GrammarCraft sahaja, berasingan daripada rekod SPBT.
- `server/teacher-access.json`: kelas yang dibenarkan bagi lima ID guru yang disahkan.
- `public/index.html`: game yang dihasilkan untuk Vercel.
- `exports/GrammarCraft.html`: salinan latihan; fungsi online memerlukan hosting API.
- `drizzle/`: schema D1 yang digunakan oleh hosting asal untuk mengekalkan rekod lama dan aktiviti pada pautan asal.

Tidak ada IC sebenar, service-role key atau credential Git dalam kod. Database hanya menyimpan hash token sesi. IC dihantar melalui HTTPS untuk pengesahan dan tidak disimpan dalam localStorage. Sesi guru menggunakan cookie Secure dan HttpOnly selama 8 jam. Sign out membatalkan sesi tersebut.

## Semakan pembangunan

```sh
npm ci
npm run build:vercel
npm test
```

`npm run build` menyediakan artifact bagi hosting Sites. Kedua-dua build menjana kandungan daripada fail JSON sumber. Ujian menggunakan data sintetik dan database in-memory; tidak mereset murid sebenar. Semakan meliputi semua aktiviti dan sebelas kelas, lima akses guru, set berbeza dalam tahun yang sama, nisbah KBAT 6S, login/sesi/logout, import, konflik antara peranti, reset, offline dan adapter Vercel. Semakan visual melalui browser automatik tidak tersedia dalam persekitaran ini.
