# Penjadwalan Otomatis Notifikasi Discord

Dokumen ini menjelaskan cara mengatur penjadwalan otomatis untuk mengirim notifikasi analisis AI ke Discord setiap hari pukul 07:00 WIB.

## Alur Proses Otomatis

Sistem bekerja dengan alur berikut:

1. **Fetch Market Data** → Sistem mengambil data pasar terbaru dari CoinGecko
2. **AI Analyzer Process the Data** → Data diproses untuk menghasilkan analisis lengkap
3. **Result send to Discord** → Hasil dikirim ke Discord webhook dalam format embed

Endpoint yang digunakan: `/api/daily-scheduler`

## Metode Penjadwalan

### 1. Cron Job (Linux Server)

Jika Anda memiliki akses ke server Linux, tambahkan entri berikut ke crontab Anda:

```bash
# Jalankan setiap hari pukul 07:00 WIB (00:00 UTC)
0 0 * * * curl -X GET https://yourdomain.com/api/daily-scheduler
```

Catatan: Jika server Anda tidak dalam zona waktu UTC, Anda mungkin perlu menyesuaikan waktu.

### 2. Layanan Penjadwalan Online

Jika Anda menggunakan layanan hosting seperti Vercel atau tidak memiliki akses cron, Anda bisa menggunakan layanan penjadwalan online:

#### A. Cron-job.org
1. Daftar di https://cron-job.org
2. Tambahkan URL: `https://yourdomain.com/api/daily-scheduler`
3. Atur interval ke "Daily"
4. Atur waktu ke 00:00 UTC (07:00 WIB)

#### B. UptimeRobot
1. Daftar di https://uptimerobot.com
2. Gunakan fitur "Scheduled Monitoring"
3. Atur endpoint ke endpoint Anda
4. Atur waktu ke 07:00 WIB

### 3. Worker atau Background Job

Beberapa platform menyediakan layanan worker untuk menjalankan tugas berkala:

#### A. Vercel Cron Jobs (jika tersedia)
Tambahkan konfigurasi ke `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/daily-scheduler",
      "schedule": "0 0 * * *"
    }
  ]
}
```

#### B. Cloudflare Workers + Cron Triggers
Gunakan Cloudflare Workers untuk menjalankan tugas berkala.

## Endpoint yang Digunakan

- `/api/daily-scheduler` → Endpoint utama untuk proses otomatis
- `/api/ai-analysis-complete` → Mengambil dan menganalisis data pasar
- `/api/send-discord` → Mengirim hasil ke Discord webhook

## Pengujian Manual

Anda dapat menguji proses otomatis dengan mengakses:
```
GET https://yourdomain.com/api/daily-scheduler
```

Atau menggunakan tombol "Kirim Analisis AI" di halaman utama aplikasi.

## Troubleshooting

Jika penjadwalan tidak berfungsi:

1. Pastikan endpoint `/api/daily-scheduler` dapat diakses secara publik
2. Pastikan Discord webhook URL dikonfigurasi dengan benar
3. Cek log server untuk pesan error
4. Pastikan tidak ada pembatasan rate limit dari CoinGecko API
5. Verifikasi bahwa waktu server sesuai dengan zona waktu yang diinginkan

## Monitoring

Disarankan untuk menyiapkan monitoring untuk memastikan tugas berjalan:
- Gunakan layanan monitoring untuk memastikan endpoint diakses setiap hari
- Cek channel Discord secara berkala untuk memastikan notifikasi diterima
- Pantau log aplikasi untuk mendeteksi potensi masalah