# Sistem Notifikasi Otomatis Discord

Sistem ini memungkinkan Anda untuk menerima notifikasi harian dari AI Swing Analysis melalui Discord setiap hari pukul 07:00 WIB.

## Konfigurasi

### 1. Environment Variables
Tambahkan baris berikut ke file `.env.local` Anda:

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN  # Ganti dengan Discord webhook URL Anda
```

### 2. Alur Proses Otomatis
Sistem bekerja dengan alur berikut:

1. **Fetch Market Data** → Sistem mengambil data pasar terbaru dari CoinGecko
2. **AI Analyzer Process the Data** → Data diproses untuk menghasilkan analisis lengkap
3. **Result send to Discord** → Hasil dikirim ke Discord webhook dalam format embed

Endpoint utama: `/api/daily-scheduler`

### 3. Discord Webhook
Sistem ini dirancang untuk bekerja dengan Discord webhook. Untuk mendapatkan webhook URL:
- Masuk ke server Discord Anda
- Klik kanan pada channel tempat Anda ingin menerima notifikasi
- Pilih "Edit Channel" > "Integrations" > "Webhooks"
- Buat webhook baru dan salin URL-nya

## Cara Kerja

### Endpoint API

1. `/api/daily-analysis` - Mengambil data analisis harian dari kripto yang Anda pantau
2. `/api/ai-analysis-complete` - Menghasilkan analisis lengkap termasuk rekomendasi AI dan koin alternatif
3. `/api/send-discord` - Mengirim pesan ke Discord webhook dalam format embed
4. `/api/daily-scheduler` - Menggabungkan ketiga endpoint di atas untuk mengirim notifikasi harian

### Scheduler

Karena Next.js tidak menyediakan scheduler bawaan, Anda perlu mengatur scheduler eksternal:

#### Pilihan 1: Cron Job (Server Linux)
Tambahkan entri berikut ke crontab Anda untuk menjalankan tugas setiap hari pukul 07:00 WIB:
```
0 0 * * * curl -X GET https://yourdomain.com/api/daily-scheduler
```

Catatan: Jika server Anda tidak dalam zona waktu WIB, Anda perlu menyesuaikan waktu.

#### Pilihan 2: Layanan Penjadwalan (Vercel, Railway, dsb.)
Jika Anda menggunakan platform hosting seperti Vercel, Anda mungkin perlu menggunakan layanan penjadwalan eksternal seperti:
- Cron-job.org
- UptimeRobot
- Atau layanan penjadwalan lainnya

#### Pilihan 3: Worker atau Background Job
Anda juga bisa menggunakan layanan seperti:
- Temporal.io
- BullMQ
- Atau worker khusus untuk menjalankan tugas ini

Lihat file `AUTOMATED_SCHEDULING.md` untuk panduan lengkap tentang berbagai metode penjadwalan.

## Format Pesan

Sistem ini menggunakan format embed Discord untuk menyajikan informasi dengan cara yang lebih menarik dan terstruktur:

- **Judul Embed:** Menampilkan jenis laporan (misalnya "LAPORAN ANALISIS SWING HARIAN")
- **Deskripsi:** Berisi informasi rinci dalam format terstruktur dengan emoji dan format teks
- **Warna:** Menggunakan warna biru kehijauan konsisten (kode warna: 5814783)
- **Timestamp:** Menampilkan waktu pengiriman otomatis
- **Footer:** Menampilkan informasi sumber dan keterangan tambahan

Lihat file `DISCORD_EMBED_EXAMPLE.md` untuk contoh lengkap format pesan.

## Testing

Anda dapat menguji sistem ini dengan beberapa cara:

1. Gunakan tombol "Test Notifikasi Discord" yang tersedia di halaman utama aplikasi
2. Panggil endpoint `/api/daily-scheduler` secara manual untuk melihat apakah notifikasi dikirim dengan benar
3. Panggil endpoint `/api/send-discord` secara langsung dengan payload berikut:
   ```json
   {
     "message": "Test message"
   }
   ```

## Catatan Penting

- Pastikan Discord webhook URL Anda valid dan memiliki izin untuk mengirim pesan ke channel tersebut
- Discord webhook memiliki batas rate limit, jadi pastikan untuk tidak mengirim terlalu banyak pesan dalam waktu singkat
- Untuk penggunaan produksi, pastikan untuk menyimpan webhook URL di tempat yang aman
- Jika Anda menggunakan Vercel atau platform serupa, pastikan untuk menyetel environment variables di dashboard deployment