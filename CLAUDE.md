# ZooBing — ระบบสั่งอาหาร

Stack: Next.js (App Router, **JavaScript ไม่ใช่ TypeScript**) + Supabase, deploy บน Vercel

## Next.js เวอร์ชันล่าสุด — สำคัญ
`params` (และ `searchParams`) ของ Dynamic Route เป็น **Promise**
- Client Component: unwrap ด้วย `use()` จาก `react`
  ```js
  "use client";
  import { use } from "react";

  export default function Page({ params }) {
    const { id } = use(params);
    ...
  }
  ```
- Server Component: ใช้ `const { id } = await params;` (ฟังก์ชันต้องเป็น async)

## Environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Supabase client อยู่ที่ `lib/supabaseClient.js` (`import { supabase } from "@/lib/supabaseClient"` หรือใช้ relative path)

## โครงสร้างตารางฐานข้อมูล (มีอยู่แล้ว ไม่ต้องสร้างใหม่)
- `sessions` (id, table_number, adult_count, child_count, status, created_at)
- `menu_categories` (id, name, sort_order)
- `menu_items` (id, category_id, name)
- `orders` (id, session_id, table_number, items [jsonb], status, created_at)

## หน้าที่วางแผนไว้
- `/` หน้าแรก
- `/generate-qr` สร้าง QR ตามโต๊ะ
- `/kitchen` หน้าครัว
