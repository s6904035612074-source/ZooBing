"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const ADULT_PRICE = 289;
const CHILD_PRICE = 145;
const MAX_QTY_PER_ITEM = 5;
const MAX_ITEMS_PER_ORDER = 10;

const C = {
  bg: "#fffaf3",
  card: "#ffffff",
  ink: "#2b2118",
  sub: "#7a6a5c",
  line: "#eadfd0",
  accent: "#e91e8c",
  accentDark: "#c2177a",
  danger: "#d32f2f",
};

const s = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    color: C.ink,
    paddingBottom: 150,
  },
  full: {
    minHeight: "100vh",
    background: C.bg,
    color: C.ink,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: 24,
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 5,
    background: C.bg,
    borderBottom: `1px solid ${C.line}`,
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
  },
  title: { margin: 0, fontSize: 22, fontFamily: "Georgia, serif" },
  billBtn: {
    minHeight: 44,
    padding: "0 16px",
    fontSize: 16,
    fontWeight: 600,
    color: C.accent,
    background: "#fff",
    border: `2px solid ${C.accent}`,
    borderRadius: 22,
    cursor: "pointer",
  },
  tabs: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    padding: "0 16px 12px",
  },
  tab: (active) => ({
    flex: "0 0 auto",
    minHeight: 44,
    padding: "0 18px",
    fontSize: 16,
    fontWeight: 600,
    borderRadius: 22,
    border: `1px solid ${active ? C.accent : C.line}`,
    background: active ? C.accent : "#fff",
    color: active ? "#fff" : C.ink,
    cursor: "pointer",
    whiteSpace: "nowrap",
  }),
  list: { padding: "8px 16px" },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    background: C.card,
    border: `1px solid ${C.line}`,
    borderRadius: 14,
    padding: "12px 14px",
    marginBottom: 10,
  },
  itemName: { fontSize: 18, fontWeight: 600, flex: 1 },
  stepper: { display: "flex", alignItems: "center", gap: 6 },
  round: (disabled) => ({
    width: 48,
    height: 48,
    fontSize: 26,
    lineHeight: 1,
    fontWeight: 700,
    color: "#fff",
    background: disabled ? "#d8c9b8" : C.accent,
    border: "none",
    borderRadius: "50%",
    cursor: disabled ? "default" : "pointer",
  }),
  roundLight: {
    width: 48,
    height: 48,
    fontSize: 26,
    lineHeight: 1,
    fontWeight: 700,
    color: C.accent,
    background: "#fff",
    border: `2px solid ${C.accent}`,
    borderRadius: "50%",
    cursor: "pointer",
  },
  qty: { minWidth: 28, textAlign: "center", fontSize: 20, fontWeight: 700 },
  cartWrap: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 6,
    background: "#fff",
    borderTop: `1px solid ${C.line}`,
    boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
    padding: "12px 16px calc(12px + env(safe-area-inset-bottom, 0px))",
  },
  cartRow: { display: "flex", alignItems: "center", gap: 12 },
  cartInfo: {
    flex: 1,
    minHeight: 48,
    textAlign: "left",
    fontSize: 16,
    fontWeight: 600,
    color: C.ink,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  sendBtn: (disabled) => ({
    minHeight: 52,
    padding: "0 24px",
    fontSize: 18,
    fontWeight: 700,
    color: "#fff",
    background: disabled ? "#d8c9b8" : C.accent,
    border: "none",
    borderRadius: 26,
    cursor: disabled ? "default" : "pointer",
  }),
  cartList: {
    maxHeight: "35vh",
    overflowY: "auto",
    marginBottom: 10,
    borderBottom: `1px solid ${C.line}`,
  },
  cartItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "6px 0",
  },
  toast: (bg) => ({
    position: "fixed",
    left: 16,
    right: 16,
    top: 76,
    zIndex: 8,
    background: bg,
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    textAlign: "center",
  }),
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 10,
  },
  dialog: {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  dialogBtn: (bg, color) => ({
    flex: 1,
    minHeight: 52,
    fontSize: 17,
    fontWeight: 700,
    color,
    background: bg,
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
  }),
};

export default function OrderPage({ params }) {
  // Next.js เวอร์ชันล่าสุด: params เป็น Promise ต้อง unwrap ด้วย use()
  const { tableNumber } = use(params);
  const tableNum = Number(tableNumber);

  const [status, setStatus] = useState("loading"); // loading | notopen | ready | closed | error
  const [session, setSession] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCat, setActiveCat] = useState(null);

  const [cart, setCart] = useState([]); // [{ id, name, quantity }]
  const [cartOpen, setCartOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null); // { text, type }
  const [showBill, setShowBill] = useState(false);
  const [closing, setClosing] = useState(false);

  function flash(text, type = "ok") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2500);
  }

  // 1) เช็ค session ที่เปิดอยู่ แล้วโหลดเมนู
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!Number.isInteger(tableNum) || tableNum <= 0) {
        setStatus("notopen");
        return;
      }
      try {
        const { data: sess, error: sessErr } = await supabase
          .from("sessions")
          .select("id, adult_count, child_count")
          .eq("table_number", tableNum)
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (sessErr) throw sessErr;
        if (cancelled) return;

        if (!sess) {
          setStatus("notopen");
          return;
        }

        const [catRes, itemRes] = await Promise.all([
          supabase
            .from("menu_categories")
            .select("id, name, sort_order")
            .order("sort_order", { ascending: true }),
          supabase.from("menu_items").select("id, category_id, name").order("id", { ascending: true }),
        ]);
        if (catRes.error) throw catRes.error;
        if (itemRes.error) throw itemRes.error;
        if (cancelled) return;

        setSession(sess);
        setCategories(catRes.data || []);
        setItems(itemRes.data || []);
        setActiveCat(catRes.data?.[0]?.id ?? null);
        setStatus("ready");
      } catch (err) {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tableNum]);

  // ---------- ตะกร้า ----------
  function qtyOf(id) {
    return cart.find((c) => c.id === id)?.quantity || 0;
  }

  function addItem(item) {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      if (existing.quantity >= MAX_QTY_PER_ITEM) {
        flash(`สั่งได้สูงสุด ${MAX_QTY_PER_ITEM} ต่อรายการ`, "warn");
        return;
      }
      setCart(cart.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)));
      return;
    }
    if (cart.length >= MAX_ITEMS_PER_ORDER) {
      flash(`เลือกได้สูงสุด ${MAX_ITEMS_PER_ORDER} รายการต่อการส่ง 1 ครั้ง`, "warn");
      return;
    }
    setCart([...cart, { id: item.id, name: item.name, quantity: 1 }]);
  }

  function decItem(id) {
    setCart(
      cart
        .map((c) => (c.id === id ? { ...c, quantity: c.quantity - 1 } : c))
        .filter((c) => c.quantity > 0)
    );
  }

  const totalPieces = cart.reduce((sum, c) => sum + c.quantity, 0);

  // ---------- ส่งออเดอร์ ----------
  async function sendOrder() {
    if (cart.length === 0 || sending || !session) return;
    setSending(true);
    try {
      // กันกรณีพนักงานปิดโต๊ะไปแล้วระหว่างที่ลูกค้ากำลังสั่ง
      const { data: current, error: chkErr } = await supabase
        .from("sessions")
        .select("status")
        .eq("id", session.id)
        .maybeSingle();
      if (chkErr) throw chkErr;
      if (!current || current.status !== "open") {
        setStatus("notopen");
        return;
      }

      const { error: insErr } = await supabase.from("orders").insert({
        session_id: session.id,
        table_number: tableNum,
        items: cart.map((c) => ({ name: c.name, quantity: c.quantity })),
        status: "received",
      });
      if (insErr) throw insErr;

      setCart([]);
      setCartOpen(false);
      flash("ส่งออเดอร์แล้ว", "ok");
    } catch (err) {
      flash("ส่งออเดอร์ไม่สำเร็จ กรุณาลองอีกครั้ง", "error");
    } finally {
      setSending(false);
    }
  }

  // ---------- เรียกเก็บเงิน ----------
  const bill = session ? session.adult_count * ADULT_PRICE + session.child_count * CHILD_PRICE : 0;

  async function confirmBill() {
    if (!session || closing) return;
    setClosing(true);
    try {
      const { error: updErr } = await supabase
        .from("sessions")
        .update({ status: "closed" })
        .eq("id", session.id)
        .eq("status", "open");
      if (updErr) throw updErr;

      setShowBill(false);
      setStatus("closed");
    } catch (err) {
      setShowBill(false);
      flash("เรียกเก็บเงินไม่สำเร็จ กรุณาลองอีกครั้ง", "error");
    } finally {
      setClosing(false);
    }
  }

  // ---------- หน้าเต็มจอ ----------
  if (status === "loading") {
    return (
      <div style={s.full}>
        <p style={{ fontSize: 18, color: C.sub }}>กำลังโหลด...</p>
      </div>
    );
  }

  if (status === "notopen") {
    return (
      <div style={s.full}>
        <h1 style={{ fontSize: 26 }}>โต๊ะนี้ยังไม่เปิดใช้งาน กรุณาแจ้งพนักงาน</h1>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={s.full}>
        <h1 style={{ fontSize: 24 }}>เกิดข้อผิดพลาด</h1>
        <p style={{ color: C.sub }}>กรุณาลองรีเฟรชหน้านี้ หรือแจ้งพนักงาน</p>
      </div>
    );
  }

  if (status === "closed") {
    return (
      <div style={s.full}>
        <h1 style={{ fontSize: 30, fontFamily: "Georgia, serif" }}>ขอบคุณที่ใช้บริการ</h1>
        <p style={{ color: C.sub, fontSize: 18 }}>ZooBing</p>
      </div>
    );
  }

  // ---------- หน้าสั่งอาหาร ----------
  const visibleItems = items.filter((i) => i.category_id === activeCat);

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerRow}>
          <h1 style={s.title}>ZooBing · โต๊ะ {tableNum}</h1>
          <button type="button" style={s.billBtn} onClick={() => setShowBill(true)}>
            เรียกเก็บเงิน
          </button>
        </div>
        <div style={s.tabs}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              style={s.tab(cat.id === activeCat)}
              onClick={() => setActiveCat(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {toast && <div style={s.toast(toast.type === "ok" ? "#2e7d32" : toast.type === "warn" ? "#ef6c00" : C.danger)}>{toast.text}</div>}

      <main style={s.list}>
        {visibleItems.length === 0 && (
          <p style={{ color: C.sub, textAlign: "center", marginTop: 32 }}>ยังไม่มีเมนูในหมวดนี้</p>
        )}
        {visibleItems.map((item) => {
          const q = qtyOf(item.id);
          return (
            <div key={item.id} style={s.row}>
              <span style={s.itemName}>{item.name}</span>
              <div style={s.stepper}>
                {q > 0 && (
                  <>
                    <button type="button" style={s.roundLight} onClick={() => decItem(item.id)} aria-label="ลด">
                      −
                    </button>
                    <span style={s.qty}>{q}</span>
                  </>
                )}
                <button
                  type="button"
                  style={s.round(q >= MAX_QTY_PER_ITEM)}
                  onClick={() => addItem(item)}
                  aria-label="เพิ่ม"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </main>

      <div style={s.cartWrap}>
        {cartOpen && cart.length > 0 && (
          <div style={s.cartList}>
            {cart.map((c) => (
              <div key={c.id} style={s.cartItem}>
                <span style={{ fontSize: 16, flex: 1 }}>{c.name}</span>
                <div style={s.stepper}>
                  <button type="button" style={s.roundLight} onClick={() => decItem(c.id)} aria-label="ลด">
                    −
                  </button>
                  <span style={s.qty}>{c.quantity}</span>
                  <button
                    type="button"
                    style={s.round(c.quantity >= MAX_QTY_PER_ITEM)}
                    onClick={() => addItem(c)}
                    aria-label="เพิ่ม"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={s.cartRow}>
          <button type="button" style={s.cartInfo} onClick={() => setCartOpen(!cartOpen)}>
            🛒 ตะกร้า {cart.length}/{MAX_ITEMS_PER_ORDER} รายการ
            <div style={{ fontSize: 13, color: C.sub, fontWeight: 400 }}>
              {totalPieces} ชิ้น · {cartOpen ? "ซ่อนรายการ" : "แตะเพื่อดูรายการ"}
            </div>
          </button>
          <button
            type="button"
            style={s.sendBtn(cart.length === 0 || sending)}
            disabled={cart.length === 0 || sending}
            onClick={sendOrder}
          >
            {sending ? "กำลังส่ง..." : "ส่งออเดอร์"}
          </button>
        </div>
      </div>

      {showBill && (
        <div style={s.overlay}>
          <div style={s.dialog} role="dialog" aria-modal="true">
            <h2 style={{ marginTop: 0 }}>เรียกเก็บเงิน</h2>
            <p style={{ margin: "4px 0" }}>
              ผู้ใหญ่ {session.adult_count} × {ADULT_PRICE} = {session.adult_count * ADULT_PRICE} บาท
            </p>
            <p style={{ margin: "4px 0" }}>
              เด็ก {session.child_count} × {CHILD_PRICE} = {session.child_count * CHILD_PRICE} บาท
            </p>
            <p style={{ fontSize: 24, fontWeight: 700, margin: "16px 0" }}>ยอดที่ต้องจ่าย {bill} บาท</p>
            <p style={{ color: C.sub, fontSize: 14 }}>เมื่อยืนยันแล้วจะไม่สามารถสั่งอาหารเพิ่มได้</p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                type="button"
                style={s.dialogBtn("#eee", C.ink)}
                onClick={() => setShowBill(false)}
                disabled={closing}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                style={s.dialogBtn(C.accent, "#fff")}
                onClick={confirmBill}
                disabled={closing}
              >
                {closing ? "กำลังดำเนินการ..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
