# Smart Journal Frontend

Frontend SvelteKit untuk Smart Journal. Aplikasi ini terhubung ke backend Go Smart Journal yang memakai Firebase Auth, HttpOnly cookie session, CSRF token, Firestore, Gemini, dan email reminder via Resend.

Dokumen ini menjelaskan perubahan penting di sisi FE, cara menjalankan project, flow auth, flow register dan email verification, routing, API client, serta aturan timezone terbaru.

## Ringkasan Perubahan

Project FE ini sudah diubah dari template Svelte minimal menjadi aplikasi Smart Journal dengan fitur:

- Landing page/company profile di route `/`.
- Halaman auth:
  - `/login`
  - `/register`
- Halaman aplikasi setelah login:
  - `/home`
  - `/finance`
  - `/reminders`
  - `/settings`
- Halaman hasil redirect verifikasi email:
  - `/email-verified?status=success`
  - `/email-verified?status=failed&reason=expired`
- Integrasi Firebase Auth client untuk login/register.
- Firebase ID token hanya dipakai untuk ditukar menjadi HttpOnly cookie session di backend.
- API lama tidak lagi memakai bearer token dari JavaScript.
- Semua request API memakai `credentials: "include"`.
- Request mutasi otomatis mengirim `X-CSRF-Token` dari cookie `smart_journal_csrf`.
- Register membuat profile, lalu meminta backend mengirim email verifikasi.
- Status verifikasi aplikasi memakai `profile.email_verified_at`, bukan hanya claim Firebase session.
- Field Discord/webhook sudah dihapus dari FE karena reminder sekarang dikirim melalui email/Resend.
- Format timezone mengikuti README backend terbaru:
  - FE menyimpan timezone user sebagai IANA timezone, contoh `Asia/Jakarta`.
  - FE mengirim timestamp pilihan user dengan offset, contoh `2026-09-16T14:50:00+07:00`.
  - BE menyimpan UTC.
  - DB menyimpan UTC.
  - BE mengembalikan timestamp UTC dengan suffix `Z`.
  - FE menampilkan timestamp UTC sesuai timezone profile user.

## Stack

- SvelteKit
- Svelte 5
- TypeScript
- Tailwind CSS
- shadcn-svelte style components
- Lucide icons
- Firebase Web SDK

## Struktur Penting

```text
src/routes/+page.svelte                 Landing page / company profile
src/routes/+layout.svelte               Root layout dan auth listener
src/routes/home/+layout.svelte          Shell/sidebar untuk /home
src/routes/home/+page.svelte            Dashboard utama setelah login
src/routes/finance/+layout.svelte       Shell/sidebar untuk /finance
src/routes/finance/+page.svelte         Ringkasan transaksi
src/routes/reminders/+layout.svelte     Shell/sidebar untuk /reminders
src/routes/reminders/+page.svelte       Daftar reminder
src/routes/settings/+layout.svelte      Shell/sidebar untuk /settings
src/routes/settings/+page.svelte        Profile, timezone, email verification
src/routes/login/+page.svelte           Login Firebase + session cookie exchange
src/routes/register/+page.svelte        Register Firebase + profile + email verification
src/routes/email-verified/+page.svelte  Landing redirect email verification
src/lib/api/smart-journal.ts            API client backend Smart Journal
src/lib/auth.ts                         Auth store dan flow login/register/logout
src/lib/firebase/client.ts              Lazy Firebase client setup
src/lib/timezone.ts                     Helper timezone dan RFC3339 offset
src/lib/components/app-shell.svelte     Layout app dengan sidebar
src/lib/components/app-sidebar.svelte   Navigasi /home /finance /reminders /settings
static/smart-journal-preview.png        Gambar preview landing/auth page
```

## Environment Variable

Buat file `.env` dari `.env.example`, lalu isi value Firebase dan URL backend.

```env
PUBLIC_SMART_JOURNAL_API_URL=http://127.0.0.1:8080
PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

Catatan:

- `PUBLIC_SMART_JOURNAL_API_URL` diarahkan ke backend Go.
- Semua variable dengan prefix `PUBLIC_` akan tersedia di browser, jadi jangan isi private key/service account di sini.
- Firebase service account tetap berada di backend, bukan frontend.

## Menjalankan Project

Install dependency:

```bash
npm install
```

Jalankan dev server:

```bash
npm run dev -- --host 127.0.0.1
```

Default URL FE:

```text
http://127.0.0.1:5173
```

Validasi:

```bash
npm run check
npm run build
```

Di environment Windows/sandbox tertentu, Tailwind oxide native binary bisa gagal dengan `spawn EPERM`. Jika terjadi di Codex/sandbox, jalankan check/build di luar sandbox atau dengan izin command yang sesuai.

## Konfigurasi Backend yang Dibutuhkan

Backend perlu mengizinkan origin FE dan redirect email verification ke FE.

Contoh env backend:

```env
CORS_ALLOWED_ORIGINS=http://127.0.0.1:5173
FRONTEND_BASE_URL=http://127.0.0.1:5173
EMAIL_VERIFICATION_REDIRECT_URL=http://127.0.0.1:5173/email-verified
COOKIE_SECURE=false
```

Untuk production:

- Gunakan origin domain production yang spesifik, jangan `*`.
- Set `COOKIE_SECURE=true`.
- Gunakan HTTPS.
- Pastikan `EMAIL_VERIFICATION_REDIRECT_URL` mengarah ke domain FE production.

## Routing

Route saat ini:

| Route | Fungsi |
| --- | --- |
| `/` | Landing page/company profile dengan preview dan value proposition Smart Journal |
| `/login` | Login user dengan Firebase Auth |
| `/register` | Register user, buat profile, minta email verifikasi dari BE |
| `/home` | Dashboard utama setelah login |
| `/finance` | Daftar dan ringkasan transaksi |
| `/reminders` | Daftar reminder |
| `/settings` | Profile, timezone, status email, kirim ulang verifikasi |
| `/email-verified` | Halaman hasil redirect verifikasi email dari BE |

Navigasi app memakai route per folder, bukan hash:

```text
/home
/finance
/reminders
/settings
```

Jangan gunakan pola lama seperti:

```text
/home#finance
/home#reminders
```

## Auth Flow

Frontend memakai Firebase Auth client hanya untuk login/register dan mengambil Firebase ID token. Setelah itu token ditukar ke session cookie backend.

### Login

Flow `/login`:

1. User input email dan password.
2. FE login ke Firebase Auth client.
3. FE mengambil Firebase ID token.
4. FE memanggil backend:

```http
POST /api/auth/session
Authorization: Bearer <firebase_id_token>
credentials: include
```

5. Backend set cookie:
   - `smart_journal_session`: HttpOnly
   - `smart_journal_csrf`: readable by JS
6. FE sign out Firebase client sebagai cleanup.
7. FE menyimpan user session dari response backend di Svelte store.
8. User diarahkan ke `/home`.

### Register

Flow `/register`:

1. User input nama, email, password.
2. FE register user melalui Firebase Auth client.
3. FE mengambil Firebase ID token.
4. FE memanggil `POST /api/auth/session`.
5. FE membuat profile:

```http
POST /api/profile
Cookie: smart_journal_session=...
X-CSRF-Token: <csrf>
```

Payload:

```json
{
  "email": "user@example.com",
  "name": "Nama User",
  "avatar_url": "",
  "bio": "",
  "timezone": "Asia/Jakarta"
}
```

6. FE meminta backend mengirim email verifikasi:

```http
POST /api/auth/email-verification
Cookie: smart_journal_session=...
X-CSRF-Token: <csrf>
```

7. Backend mengirim email via Resend.
8. User bisa masuk ke `/home`, tetapi UI tetap menampilkan banner email belum diverifikasi sampai `profile.email_verified_at` terisi.

### Logout

Flow logout:

```http
DELETE /api/auth/session
Cookie: smart_journal_session=...
X-CSRF-Token: <csrf>
```

Setelah backend menghapus cookie session, FE membersihkan auth state dan mengarahkan ke `/login`.

## Penyimpanan Token dan Keamanan

FE tidak menyimpan Firebase ID token di `localStorage` atau `sessionStorage`.

Pola saat ini:

- Firebase ID token hanya dipakai sesaat untuk membuat session backend.
- Backend membuat session cookie HttpOnly.
- Browser mengirim cookie otomatis pada request API.
- JavaScript tidak bisa membaca `smart_journal_session` karena cookie tersebut HttpOnly.
- JavaScript hanya membaca `smart_journal_csrf` untuk dikirim sebagai header `X-CSRF-Token` pada request mutasi.

Risiko XSS tetap harus dijaga, tetapi token session utama tidak tersedia langsung untuk JavaScript.

## API Client

API client ada di:

```text
src/lib/api/smart-journal.ts
```

Semua request memakai base URL:

```ts
PUBLIC_SMART_JOURNAL_API_URL || PUBLIC_API_BASE_URL || "http://127.0.0.1:8080"
```

Semua request memakai:

```ts
credentials: "include"
```

Untuk method mutasi:

- `POST`
- `PATCH`
- `PUT`
- `DELETE`

API client otomatis membaca cookie:

```text
smart_journal_csrf
```

lalu mengirim header:

```http
X-CSRF-Token: <csrf>
```

Pengecualian:

- `POST /api/auth/session` tidak butuh CSRF karena CSRF cookie belum dibuat.

## Endpoint yang Dipakai FE

Auth:

```text
POST   /api/auth/session
GET    /api/auth/session
DELETE /api/auth/session
POST   /api/auth/email-verification
```

Profile:

```text
POST  /api/profile
GET   /api/profile
PATCH /api/profile
```

Journal:

```text
POST /api/journals
```

Notes:

```text
GET /api/notes?limit=50
```

Transactions:

```text
GET /api/transactions?limit=50
```

Reminders:

```text
GET   /api/reminders?limit=50
POST  /api/reminders
PATCH /api/reminders/{reminderId}
```

Helper `createReminder` dan `updateReminder` sudah disiapkan agar datetime lokal dikirim dengan offset timezone.

## Email Verification

Email verification tidak dikirim oleh Firebase client. FE memanggil backend:

```http
POST /api/auth/email-verification
```

Backend yang:

- Membuat token verification.
- Menyimpan hash token di Firestore.
- Mengirim email via Resend.
- Memproses link verifikasi.
- Redirect balik ke FE.

Route FE untuk hasil verifikasi:

```text
/email-verified
```

Redirect sukses dari backend:

```text
http://127.0.0.1:5173/email-verified?status=success
```

Redirect gagal dari backend:

```text
http://127.0.0.1:5173/email-verified?status=failed&reason=expired
```

Reason yang didukung UI:

```text
expired
already_used
email_changed
invalid
```

Status verifikasi di aplikasi tidak mengandalkan `session.user.email_verified` saja. UI memakai:

```ts
profile.email_verified_at
```

Alasannya: session cookie yang sudah dibuat bisa masih membawa claim lama sampai session baru dibuat, sedangkan profile adalah status aplikasi yang lebih akurat setelah backend memverifikasi token.

## Timezone dan Timestamp

Aturan mengikuti README backend terbaru.

Kontrak:

```text
FE mengirim waktu dengan timezone.
BE menyimpan UTC.
DB menyimpan UTC.
BE mengembalikan UTC dengan suffix Z.
FE menampilkan sesuai timezone profile user.
```

### Timezone Profile

Timezone user disimpan sebagai IANA timezone.

Default FE:

```text
Asia/Jakarta
```

Opsi yang tersedia di Settings:

```text
Asia/Jakarta
Asia/Makassar
Asia/Jayapura
UTC
```

Backend juga harus memvalidasi timezone sebagai IANA timezone. Value seperti `Jakarta` tidak valid.

### Request Timestamp

Jika user memilih tanggal/jam lokal, FE harus mengirim RFC3339 lengkap dengan offset.

Benar:

```json
{
  "remind_at": "2026-09-16T14:50:00+07:00"
}
```

Salah:

```json
{
  "remind_at": "2026-09-16T14:50:00"
}
```

Helper untuk konversi ada di:

```text
src/lib/timezone.ts
```

Fungsi penting:

```ts
localDateTimeToRfc3339WithTimeZoneOffset("2026-09-16T14:50", "Asia/Jakarta")
// "2026-09-16T14:50:00+07:00"
```

API reminder helper memakai fungsi ini:

```ts
createReminder({
  remind_at: "2026-09-16T14:50",
  message: "Contoh reminder",
  timezone: "Asia/Jakarta"
});
```

Payload yang dikirim ke backend akan menjadi:

```json
{
  "remind_at": "2026-09-16T14:50:00+07:00",
  "message": "Contoh reminder",
  "status": "pending"
}
```

### Response Timestamp

Jika backend mengembalikan:

```json
{
  "remind_at": "2026-09-16T08:07:00Z"
}
```

FE menampilkan dengan profile `Asia/Jakarta` sebagai:

```text
15.07 WIB
```

Jika backend mengembalikan:

```json
{
  "remind_at": "2026-09-16T15:07:00Z"
}
```

FE akan menampilkan:

```text
22.07 WIB
```

Itu benar secara aturan timestamp, karena suffix `Z` berarti UTC. Jika user sebenarnya meminta `15.07 WIB`, maka data yang benar dari backend harus `08:07:00Z`, bukan `15:07:00Z`.

Reminder lama yang sudah tersimpan dengan basis waktu salah tidak otomatis diperbaiki oleh FE. Data lama perlu dibuat ulang atau dimigrasikan di backend/database.

## Halaman Home

Route:

```text
/home
```

Fungsi:

- Proteksi login: user tanpa session diarahkan ke `/login`.
- Mengambil profile, notes, transactions, dan reminders.
- Menampilkan banner email belum diverifikasi jika `profile.email_verified_at` kosong.
- Menyediakan omnibox untuk natural journal input.
- Mengirim input ke:

```http
POST /api/journals
```

- Menampilkan ringkasan:
  - jumlah item timeline
  - jumlah reminder pending
  - pemasukan
  - pengeluaran
  - aktivitas terbaru

Input contoh:

```text
Beli kopi 30rb
Ingatkan bayar listrik besok jam 8 pagi
Gaji masuk 5jt dari project
```

## Halaman Finance

Route:

```text
/finance
```

Fungsi:

- Proteksi login.
- Mengambil transaksi dari:

```http
GET /api/transactions?limit=100
```

- Mengambil profile untuk timezone display.
- Menghitung total pemasukan dan pengeluaran.
- Menampilkan tanggal transaksi sesuai timezone profile user.

## Halaman Reminders

Route:

```text
/reminders
```

Fungsi:

- Proteksi login.
- Mengambil reminders dari:

```http
GET /api/reminders?limit=100
```

- Mengambil profile untuk timezone display.
- Menampilkan label timezone aktif, contoh:

```text
Ditampilkan dalam Asia/Jakarta (UTC+07:00)
```

- Menampilkan jumlah:
  - pending
  - sent
- Menampilkan waktu reminder dari UTC `Z` ke timezone profile.

## Halaman Settings

Route:

```text
/settings
```

Fungsi:

- Proteksi login.
- Mengambil profile.
- Mengedit:
  - nama
  - avatar URL
  - bio
  - timezone
- Menampilkan status email verified dari `email_verified_at`.
- Mengirim ulang email verification bila belum verified.

Field profile yang dikirim saat update:

```json
{
  "name": "Nama Baru",
  "avatar_url": "https://example.com/avatar.png",
  "bio": "Bio baru",
  "timezone": "Asia/Jakarta"
}
```

Field yang sudah tidak dipakai:

```text
discord_webhook_url
```

## Landing Page

Route:

```text
/
```

Root page bukan lagi dashboard app. Root sekarang menjadi landing/company profile style page yang menjelaskan Smart Journal.

Konten utama:

- Preview gambar aplikasi.
- Value proposition.
- Penjelasan bahwa Smart Journal mengubah catatan natural menjadi:
  - notes
  - transaksi
  - reminders
- CTA ke login/register/home.

Asset preview:

```text
static/smart-journal-preview.png
```

## Firebase Client

File:

```text
src/lib/firebase/client.ts
```

Firebase diinisialisasi secara lazy dari env:

```env
PUBLIC_FIREBASE_API_KEY
PUBLIC_FIREBASE_AUTH_DOMAIN
PUBLIC_FIREBASE_PROJECT_ID
PUBLIC_FIREBASE_APP_ID
PUBLIC_FIREBASE_MESSAGING_SENDER_ID
PUBLIC_FIREBASE_STORAGE_BUCKET
```

Jika env belum lengkap, UI login/register menampilkan warning:

```text
Konfigurasi Firebase belum lengkap. Isi environment PUBLIC_FIREBASE_* terlebih dahulu.
```

Auth memakai `inMemoryPersistence` karena session utama dikelola backend lewat HttpOnly cookie.

## Auth Store

File:

```text
src/lib/auth.ts
```

Tanggung jawab:

- Menyimpan state session user.
- Mengecek session backend via `GET /api/auth/session`.
- Login email/password via Firebase Auth client.
- Register email/password via Firebase Auth client.
- Menukar ID token ke backend session.
- Logout dari backend dan Firebase client.
- Menghapus Firebase client session setelah cookie exchange.

State utama:

```ts
{
  user,
  loading,
  configured,
  error
}
```

## CSRF

Backend set cookie:

```text
smart_journal_csrf
```

Cookie ini readable oleh JS. API client membacanya dan mengirim:

```http
X-CSRF-Token: <value>
```

Hanya untuk mutasi:

```text
POST
PATCH
PUT
DELETE
```

Read request seperti `GET /api/notes` cukup memakai cookie session via `credentials: "include"`.

## Error Handling

Backend error diasumsikan berbentuk:

```json
{
  "error": "message"
}
```

API client membungkus error menjadi:

```ts
ApiError
```

Dengan properti:

```ts
status: number
message: string
```

Halaman app menampilkan error dalam alert sederhana.

## Catatan Integrasi dengan Backend

Pastikan backend sudah punya endpoint dan behavior berikut:

- `POST /api/auth/session`
- `GET /api/auth/session`
- `DELETE /api/auth/session`
- `POST /api/auth/email-verification`
- Redirect `GET /api/auth/email-verification?token=...` ke `/email-verified`
- Middleware auth membaca `smart_journal_session`
- Middleware CSRF membandingkan `X-CSRF-Token` dengan `smart_journal_csrf`
- CORS memakai credentials dan origin spesifik
- Profile menyimpan `timezone` valid IANA
- Timestamp response dikembalikan UTC dengan suffix `Z`
- Gemini/backend menghasilkan `remind_at` dengan offset eksplisit atau memperlakukan `Z` dari Gemini sebagai jam lokal jika user tidak menyebut UTC/GMT/Zulu

## Hal yang Perlu Diingat untuk Development Lanjutan

- Jangan simpan bearer token di `localStorage`.
- Jangan baca atau kirim `smart_journal_session` dari JS; cookie ini HttpOnly dan otomatis dikirim browser.
- Jangan kirim timestamp tanpa timezone.
- Jangan ubah route app menjadi hash route.
- Jangan pakai field Discord lagi kecuali backend menambahkannya kembali.
- Untuk status verified di UI, gunakan `profile.email_verified_at`.
- Untuk timestamp dari backend, anggap suffix `Z` sebagai UTC.
- Reminder lama dengan data UTC salah perlu migrasi di BE/DB, bukan diperbaiki lewat display FE.

## Command Cepat

```bash
npm install
npm run dev -- --host 127.0.0.1
npm run check
npm run build
```

## Checklist Setelah Clone atau Pindah Mesin

1. Jalankan `npm install`.
2. Buat `.env` dari `.env.example`.
3. Isi semua `PUBLIC_FIREBASE_*`.
4. Pastikan backend Go berjalan di `http://127.0.0.1:8080`.
5. Pastikan backend env:

```env
CORS_ALLOWED_ORIGINS=http://127.0.0.1:5173
FRONTEND_BASE_URL=http://127.0.0.1:5173
EMAIL_VERIFICATION_REDIRECT_URL=http://127.0.0.1:5173/email-verified
```

6. Jalankan FE:

```bash
npm run dev -- --host 127.0.0.1
```

7. Test flow:
   - buka `/register`
   - register akun baru
   - cek profile dibuat
   - cek email verifikasi terkirim
   - klik link email
   - pastikan redirect ke `/email-verified?status=success`
   - buka `/home`
   - buat catatan natural
   - cek `/finance` dan `/reminders`
   - cek waktu reminder tampil sesuai timezone profile
