# Super Pixel Bros 🍄🎮

Game platformer retro pixel art cerah terinspirasi dari Mario Bros dengan fisika lompat dinamis, sistem power-up (Super Mushroom, Fire Flower, Star Invincibility), mekanisme tempurung kura-kura, dan audio chiptune Web Audio API 8-bit.

---

## 🚀 Panduan Publish ke Vercel

Proyek ini telah dikonfigurasi dan dioptimasi secara otomatis untuk Vercel melalui file `vercel.json` bawaan.

### Cara 1: Lewat GitHub & Dashboard Vercel (Rekomendasi & Paling Mudah)

1. **Upload kode ke GitHub**:
   - Buat repositori baru di akun GitHub Anda (misal: `super-pixel-bros`).
   - Push / unggah semua file proyek ke repositori tersebut:
     ```bash
     git init
     git add .
     git commit -m "Initial Super Pixel Bros"
     git branch -M main
     git remote add origin https://github.com/USERNAME_ANDA/super-pixel-bros.git
     git push -u origin main
     ```

2. **Deploy di Vercel**:
   - Buka [vercel.com](https://vercel.com) dan login / daftar dengan akun GitHub Anda.
   - Klik tombol **"Add New..."** lalu pilih **"Project"**.
   - Cari dan pilih repositori `super-pixel-bros` yang baru saja Anda buat, lalu klik **"Import"**.
   - Pengaturan Vercel akan terdeteksi otomatis:
     - **Framework Preset**: `Vite`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Klik **"Deploy"**. Dalam ~30 detik, game Anda sudah online dan dapat dimainkan oleh siapa saja dengan tautan URL gratis `https://nama-proyek.vercel.app`!

---

### Cara 2: Menggunakan Vercel CLI (Langsung dari Terminal)

Jika Anda memiliki Node.js terinstall di komputer lokal:

1. Install Vercel CLI secara global:
   ```bash
   npm i -g vercel
   ```

2. Jalankan perintah deploy di folder proyek:
   ```bash
   vercel
   ```
   Ikuti petunjuk di terminal (tekan `Enter` untuk opsi default).

3. Untuk rilis ke domain produksi:
   ```bash
   vercel --prod
   ```

---

## 🎮 Kontrol Game

- **Gerak**: Tombol Panah `[←]` `[→]` atau `[A]` `[D]`
- **Lompat**: `[Space]`, `[W]`, atau `[Z]` *(Tahan untuk lompatan lebih tinggi!)*
- **Lari Cepat / Tembak Api**: `[Shift]`, `[X]`, atau `[J]`
- **Jongkok / Masuk Pipa Hijau**: `[↓]` atau `[S]`
- **Jeda**: `[P]` atau `[Escape]`
- **Mute Audio**: `[M]`
- **Layar Sentuh (Mobile/Tablet)**: Tersedia Gamepad D-Pad dan tombol arkade virtual otomatis.
