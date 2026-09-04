// "use client";

// import Link from "next/link";
// import { useEffect, useMemo, useState } from "react";

// type CartItem = {
//   productId: string;
//   variantId: string;
//   productName: string;
//   variantLabel: string;
//   price: number;
//   quantity: number;
//   image: string;
// };

// export default function CartPage() {
//   const [items, setItems] = useState<CartItem[]>([]);

//   useEffect(() => {
//     const raw = localStorage.getItem("sreshta-food-cart");

//     if (!raw) return;

//     try {
//       setItems(JSON.parse(raw));
//     } catch {
//       setItems([]);
//     }
//   }, []);

//   function saveCart(nextItems: CartItem[]) {
//     setItems(nextItems);

//     localStorage.setItem(
//       "sreshta-food-cart",
//       JSON.stringify(nextItems),
//     );
//   }

//   function increase(index: number) {
//     const next = [...items];
//     next[index].quantity += 1;
//     saveCart(next);
//   }

//   function decrease(index: number) {
//     const next = [...items];

//     if (next[index].quantity <= 1) {
//       next.splice(index, 1);
//     } else {
//       next[index].quantity -= 1;
//     }

//     saveCart(next);
//   }

//   function remove(index: number) {
//     const next = [...items];
//     next.splice(index, 1);
//     saveCart(next);
//   }

//   const subtotal = useMemo(
//     () =>
//       items.reduce(
//         (total, item) =>
//           total + item.price * item.quantity,
//         0,
//       ),
//     [items],
//   );

//   const deliveryFee = subtotal > 999 || subtotal === 0 ? 0 : 60;
//   const discount = 0;
//   const total = subtotal - discount + deliveryFee;

//   return (
//     <>
//       <header
//         style={{
//           position: "sticky",
//           top: 0,
//           zIndex: 50,
//           background: "#fff",
//           borderBottom: "1px solid #f0e5d6",
//         }}
//       >
//         <div
//           className="container-site"
//           style={{
//             minHeight: 78,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//         >
//           <Link href="/food">
//             <img
//               src="/images/sreshta-food-logo.png"
//               alt="Sreshta Foods"
//               style={{ width: 165 }}
//             />
//           </Link>

//           <nav style={{ display: "flex", gap: 25 }}>
//             <Link href="/food">Home</Link>
//             <Link href="/food/products">Products</Link>
//           </nav>

//           <Link
//             href="/food/products"
//             className="btn-secondary"
//           >
//             Continue Shopping
//           </Link>
//         </div>
//       </header>

//       <main>
//         <section
//           style={{
//             background: "#fff7ed",
//             padding: "65px 0",
//           }}
//         >
//           <div className="container-site">
//             <span
//               className="section-label"
//               style={{ color: "#b45309" }}
//             >
//               Your Cart
//             </span>

//             <h1
//               className="section-title"
//               style={{ color: "#451a03" }}
//             >
//               Review Your Order
//             </h1>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             {items.length === 0 ? (
//               <div
//                 style={{
//                   textAlign: "center",
//                   padding: 80,
//                   border: "1px solid #f0e5d6",
//                   borderRadius: 14,
//                   background: "#fffaf5",
//                 }}
//               >
//                 <div style={{ fontSize: 50 }}>🛒</div>

//                 <h2 style={{ color: "#451a03" }}>
//                   Your cart is empty
//                 </h2>

//                 <p style={{ color: "#78716c" }}>
//                   Add some delicious products to get started.
//                 </p>

//                 <Link
//                   href="/food/products"
//                   className="btn-primary"
//                   style={{
//                     marginTop: 18,
//                     background: "#d97706",
//                   }}
//                 >
//                   Start Shopping
//                 </Link>
//               </div>
//             ) : (
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1.6fr .8fr",
//                   gap: 30,
//                   alignItems: "start",
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "grid",
//                     gap: 14,
//                   }}
//                 >
//                   {items.map((item, index) => (
//                     <div
//                       key={`${item.productId}-${item.variantId}`}
//                       style={{
//                         display: "grid",
//                         gridTemplateColumns: "100px 1fr auto",
//                         gap: 20,
//                         alignItems: "center",
//                         border: "1px solid #f0e5d6",
//                         borderRadius: 14,
//                         padding: 18,
//                       }}
//                     >
//                       <div
//                         style={{
//                           width: 100,
//                           height: 100,
//                           borderRadius: 10,
//                           background: "#fff8ef",
//                           display: "grid",
//                           placeItems: "center",
//                         }}
//                       >
//                         <img
//                           src={item.image}
//                           alt={item.productName}
//                           style={{
//                             width: "80%",
//                             height: "80%",
//                             objectFit: "contain",
//                           }}
//                         />
//                       </div>

//                       <div>
//                         <Link
//                           href={`/food/products/${item.productId}`}
//                           style={{
//                             color: "#451a03",
//                             fontWeight: 800,
//                             fontSize: 17,
//                           }}
//                         >
//                           {item.productName}
//                         </Link>

//                         <p
//                           style={{
//                             margin: "5px 0",
//                             color: "#78716c",
//                             fontSize: 13,
//                           }}
//                         >
//                           {item.variantLabel}
//                         </p>

//                         <strong style={{ color: "#92400e" }}>
//                           ₹{item.price}
//                         </strong>

//                         <div
//                           style={{
//                             display: "flex",
//                             alignItems: "center",
//                             gap: 10,
//                             marginTop: 12,
//                           }}
//                         >
//                           <button
//                             type="button"
//                             onClick={() => decrease(index)}
//                             style={{
//                               width: 32,
//                               height: 32,
//                               border: "1px solid #e7d8c6",
//                               borderRadius: 7,
//                               background: "#fff",
//                             }}
//                           >
//                             −
//                           </button>

//                           <strong>{item.quantity}</strong>

//                           <button
//                             type="button"
//                             onClick={() => increase(index)}
//                             style={{
//                               width: 32,
//                               height: 32,
//                               border: "1px solid #e7d8c6",
//                               borderRadius: 7,
//                               background: "#fff",
//                             }}
//                           >
//                             +
//                           </button>
//                         </div>
//                       </div>

//                       <div style={{ textAlign: "right" }}>
//                         <strong
//                           style={{
//                             color: "#451a03",
//                             fontSize: 18,
//                           }}
//                         >
//                           ₹{item.price * item.quantity}
//                         </strong>

//                         <button
//                           type="button"
//                           onClick={() => remove(index)}
//                           style={{
//                             display: "block",
//                             marginTop: 12,
//                             border: 0,
//                             background: "transparent",
//                             color: "#b91c1c",
//                             fontSize: 12,
//                             fontWeight: 700,
//                           }}
//                         >
//                           Remove
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <aside
//                   style={{
//                     position: "sticky",
//                     top: 100,
//                     border: "1px solid #f0e5d6",
//                     borderRadius: 14,
//                     padding: 25,
//                     background: "#fffaf5",
//                   }}
//                 >
//                   <h2
//                     style={{
//                       marginTop: 0,
//                       color: "#451a03",
//                     }}
//                   >
//                     Order Summary
//                   </h2>

//                   <div
//                     style={{
//                       display: "grid",
//                       gap: 14,
//                     }}
//                   >
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                       }}
//                     >
//                       <span>Subtotal</span>
//                       <strong>₹{subtotal}</strong>
//                     </div>

//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                       }}
//                     >
//                       <span>Discount</span>
//                       <strong>₹{discount}</strong>
//                     </div>

//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                       }}
//                     >
//                       <span>Delivery</span>
//                       <strong>
//                         {deliveryFee === 0
//                           ? "FREE"
//                           : `₹${deliveryFee}`}
//                       </strong>
//                     </div>

//                     <div
//                       style={{
//                         borderTop: "1px solid #eadbca",
//                         paddingTop: 14,
//                         display: "flex",
//                         justifyContent: "space-between",
//                         color: "#451a03",
//                         fontSize: 19,
//                       }}
//                     >
//                       <strong>Total</strong>
//                       <strong>₹{total}</strong>
//                     </div>
//                   </div>

//                   <Link
//                     href="/food/checkout"
//                     className="btn-primary"
//                     style={{
//                       width: "100%",
//                       marginTop: 25,
//                       background: "#d97706",
//                     }}
//                   >
//                     Proceed to Checkout →
//                   </Link>
//                 </aside>
//               </div>
//             )}
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const CART_STORAGE_KEY = "sreshta-food-cart";
/** Optional: drop cart after this many days of no activity */
const CART_MAX_AGE_DAYS = 30;

type CartItem = {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  price: number;
  quantity: number;
  image: string;
  savedAt?: number;
};

type StoredCart = {
  items: CartItem[];
  updatedAt?: number;
};

function readStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    // Support legacy array format and { items, updatedAt }
    if (Array.isArray(parsed)) {
      return parsed as CartItem[];
    }

    if (parsed && Array.isArray(parsed.items)) {
      const updatedAt = Number(parsed.updatedAt || 0);
      if (updatedAt > 0) {
        const ageMs = Date.now() - updatedAt;
        const maxMs = CART_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
        if (ageMs > maxMs) {
          localStorage.removeItem(CART_STORAGE_KEY);
          return [];
        }
      }
      return parsed.items as CartItem[];
    }

    return [];
  } catch {
    return [];
  }
}

function writeStoredCart(items: CartItem[]) {
  const payload: StoredCart = {
    items,
    updatedAt: Date.now(),
  };
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
}

function extractProducts(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (!data || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;
  for (const key of ["products", "items", "data", "results"]) {
    if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[];
  }
  return [];
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAndValidate() {
      try {
        setLoading(true);
        const stored = readStoredCart();

        if (stored.length === 0) {
          if (!cancelled) {
            setItems([]);
            setNotice(null);
          }
          return;
        }

        // Re-validate against live catalog
        const res = await fetch("/api/food/products", {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          // API down — still show stored cart
          if (!cancelled) {
            setItems(stored);
            setNotice(
              "Could not refresh product data. Showing your saved cart.",
            );
          }
          return;
        }

        const products = extractProducts(json.data);
        const byId = new Map<string, Record<string, unknown>>();

        for (const p of products) {
          const id = String(p.productId || p.id || "").trim();
          if (id) byId.set(id, p);
        }

        const next: CartItem[] = [];
        let removed = 0;
        let priceUpdated = 0;

        for (const line of stored) {
          const product = byId.get(line.productId);
          if (!product) {
            removed += 1;
            continue;
          }

          const status = String(product.status || "ACTIVE").toUpperCase();
          if (status === "INACTIVE" || status === "DRAFT") {
            removed += 1;
            continue;
          }

          const variants = Array.isArray(product.variants)
            ? (product.variants as Record<string, unknown>[])
            : [];

          const variant = variants.find((v) => {
            const vid = String(v.variantId || v.id || "");
            return vid === line.variantId;
          });

          if (!variant) {
            removed += 1;
            continue;
          }

          const enabled =
            variant.enabled === undefined ? true : Boolean(variant.enabled);
          if (!enabled) {
            removed += 1;
            continue;
          }

          const livePrice = Number(variant.price);
          if (!Number.isFinite(livePrice) || livePrice < 0) {
            removed += 1;
            continue;
          }

          if (livePrice !== line.price) {
            priceUpdated += 1;
          }

          next.push({
            ...line,
            productName: String(product.name || line.productName),
            variantLabel: String(
              variant.name || variant.label || line.variantLabel,
            ),
            price: livePrice,
            image: String(
              product.imageUrl ||
                product.image ||
                line.image ||
                "/images/default-product-placeholder.png",
            ),
            quantity: Math.max(1, Number(line.quantity) || 1),
          });
        }

        writeStoredCart(next);

        if (!cancelled) {
          setItems(next);

          const parts: string[] = [];
          if (removed > 0) {
            parts.push(
              `${removed} item${removed === 1 ? "" : "s"} removed (unavailable).`,
            );
          }
          if (priceUpdated > 0) {
            parts.push(
              `${priceUpdated} price${priceUpdated === 1 ? "" : "s"} updated.`,
            );
          }
          setNotice(parts.length ? parts.join(" ") : null);
        }
      } catch {
        const stored = readStoredCart();
        if (!cancelled) {
          setItems(stored);
          setNotice("Could not refresh product data. Showing your saved cart.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAndValidate();

    return () => {
      cancelled = true;
    };
  }, []);

  function saveCart(nextItems: CartItem[]) {
    setItems(nextItems);
    writeStoredCart(nextItems);
  }

  function increase(index: number) {
    const next = [...items];
    next[index] = {
      ...next[index],
      quantity: next[index].quantity + 1,
    };
    saveCart(next);
  }

  function decrease(index: number) {
    const next = [...items];
    if (next[index].quantity <= 1) {
      next.splice(index, 1);
    } else {
      next[index] = {
        ...next[index],
        quantity: next[index].quantity - 1,
      };
    }
    saveCart(next);
  }

  function remove(index: number) {
    const next = [...items];
    next.splice(index, 1);
    saveCart(next);
  }

  function clearCart() {
    saveCart([]);
    setNotice(null);
  }

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    [items],
  );

  const deliveryFee = subtotal > 999 || subtotal === 0 ? 0 : 60;
  const discount = 0;
  const total = subtotal - discount + deliveryFee;

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
          }}
        >
          <Link href="/food">
            <img
              src="/images/sreshta-food-logo.png"
              alt="Sreshta Foods"
              style={{ width: 165 }}
            />
          </Link>

          <nav style={{ display: "flex", gap: 25 }}>
            <Link href="/food">Home</Link>
            <Link href="/food/products">Products</Link>
          </nav>

          <Link href="/food/products" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </header>

      <main>
        <section style={{ background: "#fff7ed", padding: "65px 0" }}>
          <div className="container-site">
            <span className="section-label" style={{ color: "#b45309" }}>
              Your Cart
            </span>
            <h1 className="section-title" style={{ color: "#451a03" }}>
              Review Your Order
            </h1>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            {notice && (
              <div
                style={{
                  marginBottom: 16,
                  borderRadius: 12,
                  border: "1px solid #fde68a",
                  background: "#fffbeb",
                  color: "#92400e",
                  padding: "12px 16px",
                  fontSize: 14,
                }}
              >
                {notice}
              </div>
            )}

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 80,
                  border: "1px solid #f0e5d6",
                  borderRadius: 14,
                  background: "#fff",
                }}
              >
                <h2 style={{ color: "#451a03" }}>Loading cart...</h2>
                <p style={{ color: "#78716c" }}>
                  Checking your saved items against the latest catalog.
                </p>
              </div>
            ) : items.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 80,
                  border: "1px solid #f0e5d6",
                  borderRadius: 14,
                  background: "#fffaf5",
                }}
              >
                <div style={{ fontSize: 50 }}>🛒</div>
                <h2 style={{ color: "#451a03" }}>Your cart is empty</h2>
                <p style={{ color: "#78716c" }}>
                  Add some delicious products to get started. Your cart is saved
                  on this device while you shop.
                </p>
                <Link
                  href="/food/products"
                  className="btn-primary"
                  style={{ marginTop: 18, background: "#d97706" }}
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 0.8fr",
                  gap: 28,
                  alignItems: "start",
                }}
              >
                <div style={{ display: "grid", gap: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <p style={{ margin: 0, color: "#78716c", fontSize: 14 }}>
                      {items.length} item{items.length === 1 ? "" : "s"} · saved
                      on this device
                    </p>
                    <button
                      type="button"
                      onClick={clearCart}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#b91c1c",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      Clear cart
                    </button>
                  </div>

                  {items.map((item, index) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "100px 1fr auto",
                        gap: 20,
                        alignItems: "center",
                        border: "1px solid #f0e5d6",
                        borderRadius: 14,
                        padding: 18,
                        background: "#fff",
                      }}
                    >
                      <div
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: 10,
                          background: "#fff8ef",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.productName}
                          style={{
                            width: "80%",
                            height: "80%",
                            objectFit: "contain",
                          }}
                        />
                      </div>

                      <div>
                        <div
                          style={{
                            color: "#451a03",
                            fontWeight: 800,
                            fontSize: 17,
                          }}
                        >
                          {item.productName}
                        </div>
                        <p
                          style={{
                            margin: "5px 0",
                            color: "#78716c",
                            fontSize: 13,
                          }}
                        >
                          {item.variantLabel}
                        </p>
                        <strong style={{ color: "#92400e" }}>
                          ₹{item.price}
                        </strong>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginTop: 12,
                          }}
                        >
                          <button type="button" onClick={() => decrease(index)}>
                            −
                          </button>
                          <strong>{item.quantity}</strong>
                          <button type="button" onClick={() => increase(index)}>
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            style={{
                              marginLeft: 8,
                              color: "#b91c1c",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <strong style={{ color: "#451a03" }}>
                        ₹{item.price * item.quantity}
                      </strong>
                    </div>
                  ))}
                </div>

                <aside
                  style={{
                    border: "1px solid #f0e5d6",
                    borderRadius: 14,
                    padding: 22,
                    background: "#fffaf5",
                  }}
                >
                  <h2 style={{ color: "#451a03", marginTop: 0 }}>
                    Order Summary
                  </h2>

                  <div style={{ display: "grid", gap: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Subtotal</span>
                      <strong>₹{subtotal}</strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Discount</span>
                      <strong>₹{discount}</strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Delivery</span>
                      <strong>
                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                      </strong>
                    </div>
                    <div
                      style={{
                        borderTop: "1px solid #eadbca",
                        paddingTop: 14,
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#451a03",
                        fontSize: 19,
                      }}
                    >
                      <strong>Total</strong>
                      <strong>₹{total}</strong>
                    </div>
                  </div>

                  <Link
                    href="/food/checkout"
                    className="btn-primary"
                    style={{
                      width: "100%",
                      marginTop: 25,
                      background: "#d97706",
                    }}
                  >
                    Proceed to Checkout →
                  </Link>
                </aside>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}