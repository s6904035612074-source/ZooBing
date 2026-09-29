export const metadata = {
  title: "ZooBing",
  description: "ระบบสั่งอาหารร้าน ZooBing",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body style={{ fontFamily: "sans-serif", margin: 0 }}>{children}</body>
    </html>
  );
}
