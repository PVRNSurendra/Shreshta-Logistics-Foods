"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function FoodTrackPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = orderId.trim();

    if (!value) {
      setError("Please enter your order ID.");
      return;
    }

    setError("");
    router.push(`/food/track/${encodeURIComponent(value)}`);
  }

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#fff",
          borderBottom: "1px solid #f0e5d6",
        }}
      >
        <div
          className="container-site"
          style={{
            minHeight: 78,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Link href="/food">
            <img
              src="/images/sreshta-food-logo.png"
              alt="Sreshta Foods"
              style={{ width: 165 }}
            />
          </Link>

          <nav style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href="/food">Home</Link>
            <Link href="/food/products">Products</Link>
            <Link href="/food/track">Track Order</Link>
          </nav>

          <Link
            href="/food/cart"
            className="btn-primary"
            style={{ background: "#d97706" }}
          >
            Cart
          </Link>
        </div>
      </header>

      <main>
        <section
          style={{
            background: "linear-gradient(115deg, #fff7ed, #ffedd5)",
            padding: "70px 0 40px",
          }}
        >
          <div className="container-site">
            <span className="section-label" style={{ color: "#b45309" }}>
              Food Tracking
            </span>
            <h1 className="section-title" style={{ color: "#451a03" }}>
              Track Your Food Order
            </h1>
            <p className="section-description" style={{ color: "#78350f" }}>
              Enter the order ID from your confirmation or payment success
              page.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <div
              className="form-shell"
              style={{ maxWidth: 560, margin: "0 auto", padding: 28 }}
            >
              <form onSubmit={handleSubmit}>
                <label
                  htmlFor="orderId"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#78350f",
                  }}
                >
                  Order ID
                </label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input
                    id="orderId"
                    name="orderId"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. 2609035001"
                    className="input"
                    style={{ flex: 1, minWidth: 200 }}
                    required
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ background: "#d97706" }}
                  >
                    Track Order
                  </button>
                </div>
                {error ? (
                  <p style={{ marginTop: 10, color: "#b91c1c", fontSize: 14 }}>
                    {error}
                  </p>
                ) : null}
              </form>

              <p
                style={{
                  marginTop: 18,
                  fontSize: 13,
                  color: "#92400e",
                  lineHeight: 1.5,
                }}
              >
                Order IDs are 10-digit numbers (food range). Logistics AWBs use
                a different number range and are tracked at{" "}
                <Link href="/logistics/track">/logistics/track</Link>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container-site footer-bottom">
          © {new Date().getFullYear()} Sreshta Foods.
        </div>
      </footer>
    </>
  );
}