import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24, textAlign: "center" }}>
      <h1>ZooBing</h1>
      <p>ระบบสั่งอาหาร — deploy สำเร็จ ✅</p>
      <nav style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        <Link href="/generate-qr">สร้าง QR</Link>
        <Link href="/kitchen">ครัว</Link>
      </nav>
    </main>
  );
}
