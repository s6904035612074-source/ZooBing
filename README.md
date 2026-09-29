# ZooBing

ระบบสั่งอาหารร้าน ZooBing (Next.js App Router + Supabase)

## เริ่มใช้งาน
```bash
npm install
cp .env.local.example .env.local   # แล้วใส่ค่า Supabase
npm run dev
```

## Deploy บน Vercel
ตั้งค่า Environment Variables `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY` ใน Vercel แล้ว deploy

## หมายเหตุ
โปรเจกต์ใช้ Next.js เวอร์ชันล่าสุด — `params` ของ Dynamic Route เป็น Promise ต้อง unwrap ด้วย `use()` จาก `react` (ดูรายละเอียดและโครงสร้างตารางใน `CLAUDE.md`)
