// import Link from "next/link";
// import { notFound } from "next/navigation";

// import { TRACKING_STATUS_LABELS, CONTACTS } from "@/utils/constants";
// import { formatDate, formatDateTime } from "@/utils/formatters";
// import type { TrackingStatus } from "@/types/tracking";

// export const dynamic = "force-dynamic";

// type TrackingDetailPageProps = {
//   params: {
//     awb: string;
//   };
// };

// type PublicEvent = {
//   id: string;
//   status: TrackingStatus;
//   title: string;
//   location: string;
//   description: string;
//   timestamp: string;
//   active: boolean;
// };

// type PublicShipment = {
//   awb: string;
//   currentStatus: TrackingStatus;
//   origin: string;
//   destination: string;
//   shipmentDate?: string;
//   latestLocation?: string;
//   serviceType?: string;
// };

// function formatAwb(awb: string) {
//   try {
//     return decodeURIComponent(awb).trim().toUpperCase();
//   } catch {
//     return awb.trim().toUpperCase();
//   }
// }

// function statusTitle(status: TrackingStatus): string {
//   return (
//     TRACKING_STATUS_LABELS[status] ||
//     status
//       .toLowerCase()
//       .split("_")
//       .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
//       .join(" ")
//   );
// }

// async function loadTracking(awb: string): Promise<{
//   shipment: PublicShipment | null;
//   events: PublicEvent[];
//   error: string | null;
// }> {
//   try {
//     const { adminDb } = await import("@/lib/firebase-admin");
//     const { getTrackingEvents } = await import("@/lib/tracking");

//     const snap = await adminDb
//       .collection("awbs")
//       .where("awb", "==", awb)
//       .limit(1)
//       .get();

//     if (snap.empty) {
//       return {
//         shipment: null,
//         events: [],
//         error: "Shipment was not found for this AWB.",
//       };
//     }

//     const data = snap.docs[0]!.data();
//     const rawEvents = await getTrackingEvents(awb);

//     const currentStatus = (data.currentStatus ||
//       rawEvents[rawEvents.length - 1]?.status ||
//       "BOOKED") as TrackingStatus;

//     const shipment: PublicShipment = {
//       awb: String(data.awb || awb),
//       currentStatus,
//       origin: String(data.origin || "—"),
//       destination: String(data.destination || "—"),
//       shipmentDate: data.shipmentDate
//         ? String(data.shipmentDate)
//         : undefined,
//       latestLocation: data.latestLocation
//         ? String(data.latestLocation)
//         : rawEvents[rawEvents.length - 1]?.location,
//       serviceType: data.serviceType
//         ? String(data.serviceType)
//         : data.service
//           ? String(data.service)
//           : undefined,
//     };

//     const events: PublicEvent[] = rawEvents.map((event, index) => ({
//       id: event.id,
//       status: event.status,
//       title: statusTitle(event.status),
//       location: event.location || "—",
//       description:
//         event.description ||
//         `Shipment status updated to ${statusTitle(event.status)}.`,
//       timestamp: event.timestamp
//         ? formatDateTime(event.timestamp)
//         : "—",
//       active: true,
//     }));

//     const currentIndex = events.findIndex(
//       (e) => e.status === currentStatus,
//     );

//     const normalizedEvents = events.map((event, index) => ({
//       ...event,
//       active:
//         currentIndex === -1
//           ? index === events.length - 1
//           : index <= currentIndex,
//     }));

//     return { shipment, events: normalizedEvents, error: null };
//   } catch (err) {
//     console.error("Public tracking load failed:", err);
//     return {
//       shipment: null,
//       events: [],
//       error:
//         "Unable to load tracking information right now. Please try again later.",
//     };
//   }
// }

// export default async function TrackingDetailPage({
//   params,
// }: TrackingDetailPageProps) {
//   const awb = formatAwb(params.awb);

//   if (!awb) {
//     notFound();
//   }

//   const { shipment, events, error } = await loadTracking(awb);

//   if (error || !shipment) {
//     return (
//       <>
//         <header className="site-header">
//           <div className="container-site header-inner">
//             <Link href="/logistics">
//               <img
//                 src="/images/sreshta-logistics-logo.png"
//                 alt="Sreshta Logistics"
//                 className="header-logo"
//               />
//             </Link>
//             <nav className="desktop-nav">
//               <Link href="/logistics">Home</Link>
//               <Link href="/logistics/services">Services</Link>
//               <Link href="/logistics/international">International</Link>
//               <Link href="/logistics/domestic">Domestic</Link>
//               <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
//               <Link href="/logistics/about">About</Link>
//               <Link href="/logistics/contact">Contact</Link>
//             </nav>
//             <div className="header-actions">
//               <Link href="/logistics/track" className="btn-secondary">
//                 Track Another
//               </Link>
//               <Link href="/logistics/book-freight" className="btn-primary">
//                 Book Freight
//               </Link>
//             </div>
//           </div>
//         </header>

//         <main>
//           <section className="page-hero">
//             <div className="container-site">
//               <span className="section-label" style={{ color: "#78e1e4" }}>
//                 Shipment Tracking
//               </span>
//               <h1>Shipment {awb}</h1>
//               <p>
//                 {error ||
//                   "No public tracking information is available for this AWB."}
//               </p>
//             </div>
//           </section>

//           <section className="section">
//             <div className="container-site" style={{ textAlign: "center" }}>
//               <div
//                 className="form-shell"
//                 style={{ padding: 32, maxWidth: 560, margin: "0 auto" }}
//               >
//                 <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
//                   Shipment not found
//                 </h2>
//                 <p className="section-description">
//                   Please check the AWB number and try again. If you believe
//                   this is an error, contact support.
//                 </p>
//                 <div
//                   style={{
//                     marginTop: 24,
//                     display: "flex",
//                     gap: 12,
//                     justifyContent: "center",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <Link href="/logistics/track" className="btn-primary">
//                     Track Another
//                   </Link>
//                   <Link href="/logistics/contact" className="btn-secondary">
//                     Contact Support
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </section>
//         </main>

//         <footer className="footer">
//           <div className="container-site footer-bottom">
//             © {new Date().getFullYear()} Sreshta Logistics.
//           </div>
//         </footer>
//       </>
//     );
//   }

//   const currentLabel = statusTitle(shipment.currentStatus);
//   const latestLocation =
//     shipment.latestLocation ||
//     events[events.length - 1]?.location ||
//     "—";

//   return (
//     <>
//       <header className="site-header">
//         <div className="container-site header-inner">
//           <Link href="/logistics">
//             <img
//               src="/images/sreshta-logistics-logo.png"
//               alt="Sreshta Logistics"
//               className="header-logo"
//             />
//           </Link>

//           <nav className="desktop-nav">
//             <Link href="/logistics">Home</Link>
//             <Link href="/logistics/services">Services</Link>
//             <Link href="/logistics/international">International</Link>
//             <Link href="/logistics/domestic">Domestic</Link>
//             <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
//             <Link href="/logistics/about">About</Link>
//             <Link href="/logistics/contact">Contact</Link>
//           </nav>

//           <div className="header-actions">
//             <Link href="/logistics/track" className="btn-secondary">
//               Track Another
//             </Link>
//             <Link href="/logistics/book-freight" className="btn-primary">
//               Book Freight
//             </Link>
//           </div>
//         </div>
//       </header>

//       <main>
//         <section className="page-hero">
//           <div className="container-site">
//             <span className="section-label" style={{ color: "#78e1e4" }}>
//               Shipment Tracking
//             </span>
//             <h1>Shipment {shipment.awb}</h1>
//             <p>
//               Follow the current shipment status and public tracking timeline
//               below.
//             </p>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             <div className="tracking-summary">
//               <div className="summary-box">
//                 <span>AWB</span>
//                 <strong>{shipment.awb}</strong>
//               </div>
//               <div className="summary-box">
//                 <span>Current Status</span>
//                 <strong style={{ color: "var(--logistics-teal-dark)" }}>
//                   {currentLabel}
//                 </strong>
//               </div>
//               <div className="summary-box">
//                 <span>Origin</span>
//                 <strong>{shipment.origin}</strong>
//               </div>
//               <div className="summary-box">
//                 <span>Destination</span>
//                 <strong>{shipment.destination}</strong>
//               </div>
//             </div>

//             <div className="split-grid">
//               <div>
//                 <span className="section-label">Tracking Timeline</span>
//                 <h2 className="section-title" style={{ fontSize: "2rem" }}>
//                   Shipment Journey
//                 </h2>
//                 <p className="section-description">
//                   Public tracking information is limited to shipment details
//                   appropriate for customer visibility.
//                 </p>

//                 {events.length === 0 ? (
//                   <div className="notice" style={{ marginTop: 35 }}>
//                     No tracking events have been recorded yet for this AWB.
//                   </div>
//                 ) : (
//                   <div className="timeline" style={{ marginTop: 35 }}>
//                     {events.map((event) => (
//                       <div
//                         className={`timeline-item ${
//                           event.active ? "active" : ""
//                         }`}
//                         key={event.id}
//                       >
//                         <span className="timeline-dot" />
//                         <div className="timeline-content">
//                           <div
//                             style={{
//                               display: "flex",
//                               justifyContent: "space-between",
//                               gap: 15,
//                               flexWrap: "wrap",
//                             }}
//                           >
//                             <h3>{event.title}</h3>
//                             <span
//                               style={{
//                                 color: event.active
//                                   ? "var(--logistics-teal-dark)"
//                                   : "#94a3b8",
//                                 fontSize: ".7rem",
//                                 fontWeight: 800,
//                               }}
//                             >
//                               {event.status}
//                             </span>
//                           </div>
//                           <p>{event.description}</p>
//                           <p style={{ marginTop: 9 }}>
//                             <strong>{event.location}</strong> ·{" "}
//                             {event.timestamp}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <div className="form-shell" style={{ padding: 24 }}>
//                   <span className="section-label">Shipment Details</span>
//                   <div style={{ display: "grid", gap: 18, marginTop: 15 }}>
//                     <div>
//                       <span className="form-label">Shipment Date</span>
//                       <p style={{ margin: "4px 0 0", color: "#64748b" }}>
//                         {shipment.shipmentDate
//                           ? formatDate(shipment.shipmentDate)
//                           : "—"}
//                       </p>
//                     </div>
//                     <div>
//                       <span className="form-label">Latest Location</span>
//                       <p style={{ margin: "4px 0 0", color: "#64748b" }}>
//                         {latestLocation}
//                       </p>
//                     </div>
//                     <div>
//                       <span className="form-label">Service</span>
//                       <p style={{ margin: "4px 0 0", color: "#64748b" }}>
//                         {shipment.serviceType
//                           ? shipment.serviceType
//                               .toLowerCase()
//                               .split("_")
//                               .map(
//                                 (p) =>
//                                   p.charAt(0).toUpperCase() + p.slice(1),
//                               )
//                               .join(" ")
//                           : "—"}
//                       </p>
//                     </div>
//                     <div>
//                       <span className="form-label">Current Status</span>
//                       <p
//                         style={{
//                           margin: "4px 0 0",
//                           color: "var(--logistics-teal-dark)",
//                           fontWeight: 750,
//                         }}
//                       >
//                         {currentLabel}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="service-card" style={{ marginTop: 18 }}>
//                   <div className="service-icon">?</div>
//                   <h3>Need Help?</h3>
//                   <p>
//                     Contact the Sreshta team if you need assistance with this
//                     shipment.
//                   </p>
//                   <div style={{ marginTop: 15 }}>
//                     <Link href="/logistics/contact" className="btn-secondary">
//                       Contact Support
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>

//       <footer className="footer">
//         <div className="container-site footer-main">
//           <div>
//             <img
//               src="/images/sreshta-logistics-logo.png"
//               alt="Sreshta Logistics"
//               className="footer-logo"
//             />
//             <p>Reliable logistics with transparent shipment visibility.</p>
//           </div>
//           <div>
//             <h3>Tracking</h3>
//             <div className="footer-links">
//               <Link href="/logistics/track">Track Another Shipment</Link>
//               <Link href="/logistics/services">Services</Link>
//             </div>
//           </div>
//           <div>
//             <h3>Booking</h3>
//             <div className="footer-links">
//               <Link href="/logistics/book-freight">Book Freight</Link>
//               <Link href="/logistics/pickup-request">Request Pickup</Link>
//             </div>
//           </div>
//           <div>
//             <h3>Contact</h3>
//             <div className="footer-links">
//               <a href={`tel:+91${CONTACTS.MANAGING_DIRECTOR.phone}`}>
//                 +91 {CONTACTS.MANAGING_DIRECTOR.phone}
//               </a>
//               <a href={`tel:+91${CONTACTS.PARTNER.phone}`}>
//                 +91 {CONTACTS.PARTNER.phone}
//               </a>
//             </div>
//           </div>
//         </div>
//         <div className="container-site footer-bottom">
//           © {new Date().getFullYear()} Sreshta Logistics.
//         </div>
//       </footer>
//     </>
//   );
// }

// import Link from "next/link";
// import { notFound } from "next/navigation";

// import { CONTACTS } from "@/utils/constants";
// import { formatDate, formatDateTime } from "@/utils/formatters";
// import type { TrackingStatus } from "@/types/tracking";

// export const dynamic = "force-dynamic";

// type TrackingDetailPageProps = {
//   params: {
//     awb: string;
//   };
// };

// type PublicEvent = {
//   id: string;
//   status: string;
//   title: string;
//   location: string;
//   description: string;
//   timestamp: string;
//   active: boolean;
//   completed: boolean;
// };

// type PublicShipment = {
//   awb: string;
//   currentStatus: string;
//   origin: string;
//   destination: string;
//   shipmentDate?: string;
//   latestLocation?: string;
//   serviceType?: string;
// };

// function formatAwb(awb: string) {
//   try {
//     return decodeURIComponent(awb).trim().toUpperCase();
//   } catch {
//     return awb.trim().toUpperCase();
//   }
// }

// function humanLabel(code: string, fallback?: string): string {
//   if (fallback?.trim()) return fallback.trim();
//   return code
//     .toLowerCase()
//     .split("_")
//     .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
//     .join(" ");
// }

// function defaultDescription(code: string, title: string): string {
//   const map: Record<string, string> = {
//     BOOKED: "Shipment booking has been registered successfully.",
//     BOOKING_CONFIRMED: "Shipment booking has been registered successfully.",
//     PICKUP_REQUESTED: "Pickup has been requested from the shipper.",
//     PICKED_UP: "Shipment has been collected from the shipper.",
//     SHIPMENT_RECEIVED: "Shipment has been received at the facility.",
//     AT_ORIGIN: "Shipment has reached the origin processing facility.",
//     HANDLING_IN_PROGRESS: "Shipment handling is in progress.",
//     PROCESSED_AND_PACKED: "Shipment has been processed and packed for export.",
//     SHIPPING_LABEL_GENERATED: "Shipping label has been generated.",
//     FORWARDED_TO_AIRPORT: "Shipment has been forwarded to the airport.",
//     IN_TRANSIT: "Shipment is in transit toward the destination.",
//     ARRIVED_DESTINATION: "Shipment has arrived at the destination facility.",
//     OUT_FOR_DELIVERY: "Shipment is out for delivery.",
//     DELIVERED: "Shipment has been delivered successfully.",
//     ON_HOLD: "Shipment is currently on hold.",
//     EXCEPTION: "An exception was recorded for this shipment.",
//     CANCELLED: "This shipment has been cancelled.",
//   };
//   return map[code] || `Shipment status updated to ${title}.`;
// }

// async function loadTracking(awb: string): Promise<{
//   shipment: PublicShipment | null;
//   events: PublicEvent[];
//   error: string | null;
// }> {
//   try {
//     const { adminDb } = await import("@/lib/firebase-admin");
//     const {
//       getTrackingEvents,
//       getTrackingStages,
//     } = await import("@/lib/tracking");

//     const snap = await adminDb
//       .collection("awbs")
//       .where("awb", "==", awb)
//       .limit(1)
//       .get();

//     // Fallback: document id === awb
//     let data: FirebaseFirestore.DocumentData | null = null;
//     if (!snap.empty) {
//       data = snap.docs[0]!.data();
//     } else {
//       const byId = await adminDb.collection("awbs").doc(awb).get();
//       if (byId.exists) data = byId.data() || null;
//     }

//     if (!data) {
//       return {
//         shipment: null,
//         events: [],
//         error: "Shipment was not found for this AWB.",
//       };
//     }

//     const [rawEvents, stages] = await Promise.all([
//       getTrackingEvents(awb),
//       getTrackingStages("LOGISTICS"),
//     ]);

//     const eventByStatus = new Map(
//       rawEvents.map((e) => [String(e.status).toUpperCase(), e]),
//     );

//     const currentStatus = String(
//       data.currentStatus ||
//         rawEvents[rawEvents.length - 1]?.status ||
//         "BOOKED",
//     ).toUpperCase();

//     const shipment: PublicShipment = {
//       awb: String(data.awb || awb),
//       currentStatus,
//       origin: String(data.origin || "—"),
//       destination: String(data.destination || "—"),
//       shipmentDate: data.shipmentDate
//         ? String(data.shipmentDate)
//         : data.bookDate
//           ? String(data.bookDate)
//           : undefined,
//       latestLocation: data.latestLocation
//         ? String(data.latestLocation)
//         : rawEvents[rawEvents.length - 1]?.location,
//       serviceType: data.serviceType
//         ? String(data.serviceType)
//         : data.service
//           ? String(data.service)
//           : undefined,
//     };

//     // Prefer configured matrix stages; else unique events in time order
//     const pipeline =
//       stages.length > 0
//         ? stages.map((s) => ({
//             code: String(s.code).toUpperCase(),
//             label: s.label,
//           }))
//         : rawEvents.map((e) => ({
//             code: String(e.status).toUpperCase(),
//             label: humanLabel(String(e.status)),
//           }));

//     // Always include any event statuses missing from stage config
//     for (const e of rawEvents) {
//       const code = String(e.status).toUpperCase();
//       if (!pipeline.some((p) => p.code === code)) {
//         pipeline.push({ code, label: humanLabel(code) });
//       }
//     }

//     const currentIndex = pipeline.findIndex((p) => p.code === currentStatus);

//     const events: PublicEvent[] = pipeline.map((stage, index) => {
//       const event = eventByStatus.get(stage.code);
//       const completed =
//         Boolean(event) ||
//         (currentIndex >= 0 && index <= currentIndex);

//       const title = humanLabel(stage.code, stage.label);
//       const location =
//         event?.location ||
//         (completed && index === 0 ? shipment.origin : undefined) ||
//         "—";

//       return {
//         id: event?.id || `stage-${stage.code}`,
//         status: stage.code,
//         title,
//         location,
//         description:
//           event?.description || defaultDescription(stage.code, title),
//         timestamp: event?.timestamp
//           ? formatDateTime(event.timestamp)
//           : completed
//             ? "—"
//             : "Pending",
//         active: completed,
//         completed,
//       };
//     });

//     // If nothing to show, surface raw events at least
//     if (events.length === 0 && rawEvents.length > 0) {
//       return {
//         shipment,
//         events: rawEvents.map((event, index) => ({
//           id: event.id,
//           status: String(event.status),
//           title: humanLabel(String(event.status)),
//           location: event.location || "—",
//           description:
//             event.description ||
//             defaultDescription(
//               String(event.status),
//               humanLabel(String(event.status)),
//             ),
//           timestamp: event.timestamp
//             ? formatDateTime(event.timestamp)
//             : "—",
//           active: index === rawEvents.length - 1,
//           completed: true,
//         })),
//         error: null,
//       };
//     }

//     return { shipment, events, error: null };
//   } catch (err) {
//     console.error("Public tracking load failed:", err);
//     return {
//       shipment: null,
//       events: [],
//       error:
//         "Unable to load tracking information right now. Please try again later.",
//     };
//   }
// }

// export default async function TrackingDetailPage({
//   params,
// }: TrackingDetailPageProps) {
//   const awb = formatAwb(params.awb);

//   if (!awb) {
//     notFound();
//   }

//   const { shipment, events, error } = await loadTracking(awb);

//   if (error || !shipment) {
//     return (
//       <>
//         <header className="site-header">
//           <div className="container-site header-inner">
//             <Link href="/logistics">
//               <img
//                 src="/images/sreshta-logistics-logo.png"
//                 alt="Sreshta Logistics"
//                 className="header-logo"
//               />
//             </Link>
//             <nav className="desktop-nav">
//               <Link href="/logistics">Home</Link>
//               <Link href="/logistics/services">Services</Link>
//               <Link href="/logistics/international">International</Link>
//               <Link href="/logistics/domestic">Domestic</Link>
//               <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
//               <Link href="/logistics/about">About</Link>
//               <Link href="/logistics/contact">Contact</Link>
//             </nav>
//             <div className="header-actions">
//               <Link href="/logistics/track" className="btn-secondary">
//                 Track Another
//               </Link>
//               <Link href="/logistics/book-freight" className="btn-primary">
//                 Book Freight
//               </Link>
//             </div>
//           </div>
//         </header>

//         <main>
//           <section className="page-hero">
//             <div className="container-site">
//               <span className="section-label" style={{ color: "#78e1e4" }}>
//                 Shipment Tracking
//               </span>
//               <h1>Shipment {awb}</h1>
//               <p>
//                 {error ||
//                   "No public tracking information is available for this AWB."}
//               </p>
//             </div>
//           </section>

//           <section className="section">
//             <div className="container-site" style={{ textAlign: "center" }}>
//               <div
//                 className="form-shell"
//                 style={{ padding: 32, maxWidth: 560, margin: "0 auto" }}
//               >
//                 <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
//                   Shipment not found
//                 </h2>
//                 <p className="section-description">
//                   Please check the AWB number and try again. If you believe
//                   this is an error, contact support.
//                 </p>
//                 <div
//                   style={{
//                     marginTop: 24,
//                     display: "flex",
//                     gap: 12,
//                     justifyContent: "center",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <Link href="/logistics/track" className="btn-primary">
//                     Track Another
//                   </Link>
//                   <Link href="/logistics/contact" className="btn-secondary">
//                     Contact Support
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </section>
//         </main>

//         <footer className="footer">
//           <div className="container-site footer-bottom">
//             © {new Date().getFullYear()} Sreshta Logistics.
//           </div>
//         </footer>
//       </>
//     );
//   }

//   const currentLabel = humanLabel(shipment.currentStatus);
//   const latestLocation =
//     shipment.latestLocation ||
//     events.filter((e) => e.completed).at(-1)?.location ||
//     "—";

//   return (
//     <>
//       <header className="site-header">
//         <div className="container-site header-inner">
//           <Link href="/logistics">
//             <img
//               src="/images/sreshta-logistics-logo.png"
//               alt="Sreshta Logistics"
//               className="header-logo"
//             />
//           </Link>
//           <nav className="desktop-nav">
//             <Link href="/logistics">Home</Link>
//             <Link href="/logistics/services">Services</Link>
//             <Link href="/logistics/international">International</Link>
//             <Link href="/logistics/domestic">Domestic</Link>
//             <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
//             <Link href="/logistics/about">About</Link>
//             <Link href="/logistics/contact">Contact</Link>
//           </nav>
//           <div className="header-actions">
//             <Link href="/logistics/track" className="btn-secondary">
//               Track Another
//             </Link>
//             <Link href="/logistics/book-freight" className="btn-primary">
//               Book Freight
//             </Link>
//           </div>
//         </div>
//       </header>

//       <main>
//         <section className="page-hero">
//           <div className="container-site">
//             <span className="section-label" style={{ color: "#78e1e4" }}>
//               Shipment Tracking
//             </span>
//             <h1>Shipment {shipment.awb}</h1>
//             <p>
//               Follow the current shipment status and public tracking timeline
//               below.
//             </p>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             <div className="tracking-summary">
//               <div className="summary-box">
//                 <span>AWB</span>
//                 <strong>{shipment.awb}</strong>
//               </div>
//               <div className="summary-box">
//                 <span>Current Status</span>
//                 <strong style={{ color: "var(--logistics-teal-dark)" }}>
//                   {currentLabel}
//                 </strong>
//               </div>
//               <div className="summary-box">
//                 <span>Origin</span>
//                 <strong>{shipment.origin}</strong>
//               </div>
//               <div className="summary-box">
//                 <span>Destination</span>
//                 <strong>{shipment.destination}</strong>
//               </div>
//             </div>

//             <div className="split-grid">
//               <div>
//                 <span className="section-label">Tracking Timeline</span>
//                 <h2 className="section-title" style={{ fontSize: "2rem" }}>
//                   Shipment Journey
//                 </h2>
//                 <p className="section-description">
//                   Public tracking information is limited to shipment details
//                   appropriate for customer visibility.
//                 </p>

//                 {events.length === 0 ? (
//                   <div className="notice" style={{ marginTop: 35 }}>
//                     No tracking events have been recorded yet for this AWB.
//                   </div>
//                 ) : (
//                   <div className="timeline" style={{ marginTop: 35 }}>
//                     {events.map((event) => (
//                       <div
//                         className={`timeline-item ${
//                           event.completed ? "active" : ""
//                         }`}
//                         key={event.id}
//                       >
//                         <span className="timeline-dot" />
//                         <div className="timeline-content">
//                           <div
//                             style={{
//                               display: "flex",
//                               justifyContent: "space-between",
//                               gap: 15,
//                               flexWrap: "wrap",
//                             }}
//                           >
//                             <h3>{event.title}</h3>
//                             <span
//                               style={{
//                                 color: event.completed
//                                   ? "var(--logistics-teal-dark)"
//                                   : "#94a3b8",
//                                 fontSize: ".7rem",
//                                 fontWeight: 800,
//                               }}
//                             >
//                               {event.status}
//                             </span>
//                           </div>
//                           <p>{event.description}</p>
//                           <p style={{ marginTop: 9 }}>
//                             <strong>{event.location}</strong>
//                             {event.timestamp ? ` · ${event.timestamp}` : ""}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <div className="form-shell" style={{ padding: 24 }}>
//                   <span className="section-label">Shipment Details</span>
//                   <div style={{ display: "grid", gap: 18, marginTop: 15 }}>
//                     <div>
//                       <span className="form-label">Shipment Date</span>
//                       <p style={{ margin: "4px 0 0", color: "#64748b" }}>
//                         {shipment.shipmentDate
//                           ? formatDate(shipment.shipmentDate)
//                           : "—"}
//                       </p>
//                     </div>
//                     <div>
//                       <span className="form-label">Latest Location</span>
//                       <p style={{ margin: "4px 0 0", color: "#64748b" }}>
//                         {latestLocation}
//                       </p>
//                     </div>
//                     <div>
//                       <span className="form-label">Service</span>
//                       <p style={{ margin: "4px 0 0", color: "#64748b" }}>
//                         {shipment.serviceType
//                           ? humanLabel(shipment.serviceType)
//                           : "—"}
//                       </p>
//                     </div>
//                     <div>
//                       <span className="form-label">Current Status</span>
//                       <p
//                         style={{
//                           margin: "4px 0 0",
//                           color: "var(--logistics-teal-dark)",
//                           fontWeight: 750,
//                         }}
//                       >
//                         {currentLabel}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="service-card" style={{ marginTop: 18 }}>
//                   <div className="service-icon">?</div>
//                   <h3>Need Help?</h3>
//                   <p>
//                     Contact the Sreshta team if you need assistance with this
//                     shipment.
//                   </p>
//                   <div style={{ marginTop: 15 }}>
//                     <Link href="/logistics/contact" className="btn-secondary">
//                       Contact Support
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>

//       <footer className="footer">
//         <div className="container-site footer-main">
//           <div>
//             <img
//               src="/images/sreshta-logistics-logo.png"
//               alt="Sreshta Logistics"
//               className="footer-logo"
//             />
//             <p>Reliable logistics with transparent shipment visibility.</p>
//           </div>
//           <div>
//             <h3>Tracking</h3>
//             <div className="footer-links">
//               <Link href="/logistics/track">Track Another Shipment</Link>
//               <Link href="/logistics/services">Services</Link>
//             </div>
//           </div>
//           <div>
//             <h3>Booking</h3>
//             <div className="footer-links">
//               <Link href="/logistics/book-freight">Book Freight</Link>
//               <Link href="/logistics/pickup-request">Request Pickup</Link>
//             </div>
//           </div>
//           <div>
//             <h3>Contact</h3>
//             <div className="footer-links">
//               <a href={`tel:+91${CONTACTS.MANAGING_DIRECTOR.phone}`}>
//                 +91 {CONTACTS.MANAGING_DIRECTOR.phone}
//               </a>
//               <a href={`tel:+91${CONTACTS.PARTNER.phone}`}>
//                 +91 {CONTACTS.PARTNER.phone}
//               </a>
//             </div>
//           </div>
//         </div>
//         <div className="container-site footer-bottom">
//           © {new Date().getFullYear()} Sreshta Logistics.
//         </div>
//       </footer>
//     </>
//   );
// }

// import Link from "next/link";
// import { notFound } from "next/navigation";

// import { CONTACTS } from "@/utils/constants";
// import { formatDate, formatDateTime } from "@/utils/formatters";

// export const dynamic = "force-dynamic";

// type TrackingDetailPageProps = {
//   params: {
//     awb: string;
//   };
// };

// type PublicEvent = {
//   id: string;
//   status: string;
//   title: string;
//   location: string;
//   description: string;
//   timestamp: string;
//   active: boolean;
//   completed: boolean;
// };

// type PublicShipment = {
//   awb: string;
//   currentStatus: string;
//   origin: string;
//   destination: string;
//   shipmentDate?: string;
//   latestLocation?: string;
//   serviceType?: string;
// };

// function formatAwb(awb: string) {
//   try {
//     return decodeURIComponent(awb).trim().toUpperCase();
//   } catch {
//     return awb.trim().toUpperCase();
//   }
// }

// function humanLabel(code: string, fallback?: string): string {
//   if (fallback?.trim()) return fallback.trim();
//   return code
//     .toLowerCase()
//     .split("_")
//     .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
//     .join(" ");
// }

// function defaultDescription(code: string, title: string): string {
//   const map: Record<string, string> = {
//     BOOKED: "Shipment booking has been registered successfully.",
//     BOOKING_CONFIRMED: "Shipment booking has been registered successfully.",
//     PICKUP_REQUESTED: "Pickup has been requested from the shipper.",
//     PICKED_UP: "Shipment has been collected from the shipper.",
//     SHIPMENT_RECEIVED: "Shipment has been received at the facility.",
//     AT_ORIGIN: "Shipment has reached the origin processing facility.",
//     HANDLING_IN_PROGRESS: "Shipment handling is in progress.",
//     PROCESSED_AND_PACKED: "Shipment has been processed and packed for export.",
//     SHIPPING_LABEL_GENERATED: "Shipping label has been generated.",
//     FORWARDED_TO_AIRPORT: "Shipment has been forwarded to the airport.",
//     IN_TRANSIT: "Shipment is in transit toward the destination.",
//     ARRIVED_DESTINATION: "Shipment has arrived at the destination facility.",
//     OUT_FOR_DELIVERY: "Shipment is out for delivery.",
//     DELIVERED: "Shipment has been delivered successfully.",
//     ON_HOLD: "Shipment is currently on hold.",
//     EXCEPTION: "An exception was recorded for this shipment.",
//     CANCELLED: "This shipment has been cancelled.",
//   };
//   return map[code] || `Shipment status updated to ${title}.`;
// }

// async function loadTracking(awb: string): Promise<{
//   shipment: PublicShipment | null;
//   events: PublicEvent[];
//   error: string | null;
// }> {
//   try {
//     const { adminDb } = await import("@/lib/firebase-admin");
//     const { getTrackingEvents, getTrackingStages } = await import(
//       "@/lib/tracking"
//     );

//     const snap = await adminDb
//       .collection("awbs")
//       .where("awb", "==", awb)
//       .limit(1)
//       .get();

//     let data: FirebaseFirestore.DocumentData | null = null;
//     if (!snap.empty) {
//       data = snap.docs[0]!.data();
//     } else {
//       const byId = await adminDb.collection("awbs").doc(awb).get();
//       if (byId.exists) data = byId.data() || null;
//     }

//     if (!data) {
//       return {
//         shipment: null,
//         events: [],
//         error: "Shipment was not found for this AWB.",
//       };
//     }

//     const [rawEvents, stages] = await Promise.all([
//       getTrackingEvents(awb),
//       getTrackingStages("LOGISTICS"),
//     ]);

//     const eventByStatus = new Map(
//       rawEvents.map((e) => [String(e.status).toUpperCase(), e]),
//     );

//     const currentStatus = String(
//       data.currentStatus ||
//         rawEvents[rawEvents.length - 1]?.status ||
//         "BOOKED",
//     ).toUpperCase();

//     const shipment: PublicShipment = {
//       awb: String(data.awb || awb),
//       currentStatus,
//       origin: String(data.origin || "—"),
//       destination: String(data.destination || "—"),
//       shipmentDate: data.shipmentDate
//         ? String(data.shipmentDate)
//         : data.bookDate
//           ? String(data.bookDate)
//           : undefined,
//       latestLocation: data.latestLocation
//         ? String(data.latestLocation)
//         : rawEvents[rawEvents.length - 1]?.location,
//       serviceType: data.serviceType
//         ? String(data.serviceType)
//         : data.service
//           ? String(data.service)
//           : undefined,
//     };

//     const pipeline =
//       stages.length > 0
//         ? stages.map((s) => ({
//             code: String(s.code).toUpperCase(),
//             label: s.label,
//           }))
//         : rawEvents.map((e) => ({
//             code: String(e.status).toUpperCase(),
//             label: humanLabel(String(e.status)),
//           }));

//     for (const e of rawEvents) {
//       const code = String(e.status).toUpperCase();
//       if (!pipeline.some((p) => p.code === code)) {
//         pipeline.push({ code, label: humanLabel(code) });
//       }
//     }

//     const currentIndex = pipeline.findIndex((p) => p.code === currentStatus);

//     const events: PublicEvent[] = pipeline.map((stage, index) => {
//       const event = eventByStatus.get(stage.code);
//       const completed =
//         Boolean(event) || (currentIndex >= 0 && index <= currentIndex);

//       const title = humanLabel(stage.code, stage.label);
//       const location =
//         event?.location ||
//         (completed && index === 0 ? shipment.origin : undefined) ||
//         "—";

//       return {
//         id: event?.id || `stage-${stage.code}`,
//         status: stage.code,
//         title,
//         location,
//         description:
//           event?.description || defaultDescription(stage.code, title),
//         timestamp: event?.timestamp
//           ? formatDateTime(event.timestamp)
//           : completed
//             ? "—"
//             : "Pending",
//         active: completed,
//         completed,
//       };
//     });

//     if (events.length === 0 && rawEvents.length > 0) {
//       return {
//         shipment,
//         events: rawEvents.map((event, index) => ({
//           id: event.id,
//           status: String(event.status),
//           title: humanLabel(String(event.status)),
//           location: event.location || "—",
//           description:
//             event.description ||
//             defaultDescription(
//               String(event.status),
//               humanLabel(String(event.status)),
//             ),
//           timestamp: event.timestamp
//             ? formatDateTime(event.timestamp)
//             : "—",
//           active: index === rawEvents.length - 1,
//           completed: true,
//         })),
//         error: null,
//       };
//     }

//     return { shipment, events, error: null };
//   } catch (err) {
//     console.error("Public tracking load failed:", err);
//     return {
//       shipment: null,
//       events: [],
//       error:
//         "Unable to load tracking information right now. Please try again later.",
//     };
//   }
// }

// export default async function TrackingDetailPage({
//   params,
// }: TrackingDetailPageProps) {
//   const awb = formatAwb(params.awb);

//   if (!awb) {
//     notFound();
//   }

//   const { shipment, events, error } = await loadTracking(awb);

//   if (error || !shipment) {
//     return (
//       <>
//         <header className="site-header">
//           <div className="container-site header-inner">
//             <Link href="/logistics">
//               <img
//                 src="/images/sreshta-logistics-logo.png"
//                 alt="Sreshta Logistics"
//                 className="header-logo"
//               />
//             </Link>
//             <nav className="desktop-nav">
//               <Link href="/logistics">Home</Link>
//               <Link href="/logistics/services">Services</Link>
//               <Link href="/logistics/international">International</Link>
//               <Link href="/logistics/domestic">Domestic</Link>
//               <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
//               <Link href="/logistics/about">About</Link>
//               <Link href="/logistics/contact">Contact</Link>
//             </nav>
//             <div className="header-actions">
//               <Link href="/logistics/track" className="btn-secondary">
//                 Track Another
//               </Link>
//               <Link href="/logistics/book-freight" className="btn-primary">
//                 Book Freight
//               </Link>
//             </div>
//           </div>
//         </header>

//         <main>
//           <section className="page-hero">
//             <div className="container-site">
//               <span className="section-label" style={{ color: "#78e1e4" }}>
//                 Shipment Tracking
//               </span>
//               <h1>Shipment {awb}</h1>
//               <p>
//                 {error ||
//                   "No public tracking information is available for this AWB."}
//               </p>
//             </div>
//           </section>

//           <section className="section">
//             <div className="container-site" style={{ textAlign: "center" }}>
//               <div
//                 className="form-shell"
//                 style={{ padding: 32, maxWidth: 560, margin: "0 auto" }}
//               >
//                 <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
//                   Shipment not found
//                 </h2>
//                 <p className="section-description">
//                   Please check the AWB number and try again. If you believe
//                   this is an error, contact support.
//                 </p>
//                 <div
//                   style={{
//                     marginTop: 24,
//                     display: "flex",
//                     gap: 12,
//                     justifyContent: "center",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <Link href="/logistics/track" className="btn-primary">
//                     Track Another
//                   </Link>
//                   <Link href="/logistics/contact" className="btn-secondary">
//                     Contact Support
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </section>
//         </main>

//         <footer className="footer">
//           <div className="container-site footer-bottom">
//             © {new Date().getFullYear()} Sreshta Logistics.
//           </div>
//         </footer>
//       </>
//     );
//   }

//   const currentLabel = humanLabel(shipment.currentStatus);
//   const latestLocation =
//     shipment.latestLocation ||
//     events.filter((e) => e.completed).at(-1)?.location ||
//     "—";

//   return (
//     <>
//       <header className="site-header">
//         <div className="container-site header-inner">
//           <Link href="/logistics">
//             <img
//               src="/images/sreshta-logistics-logo.png"
//               alt="Sreshta Logistics"
//               className="header-logo"
//             />
//           </Link>
//           <nav className="desktop-nav">
//             <Link href="/logistics">Home</Link>
//             <Link href="/logistics/services">Services</Link>
//             <Link href="/logistics/international">International</Link>
//             <Link href="/logistics/domestic">Domestic</Link>
//             <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
//             <Link href="/logistics/about">About</Link>
//             <Link href="/logistics/contact">Contact</Link>
//           </nav>
//           <div className="header-actions">
//             <Link href="/logistics/track" className="btn-secondary">
//               Track Another
//             </Link>
//             <Link href="/logistics/book-freight" className="btn-primary">
//               Book Freight
//             </Link>
//           </div>
//         </div>
//       </header>

//       <main>
//         <section className="page-hero">
//           <div className="container-site">
//             <span className="section-label" style={{ color: "#78e1e4" }}>
//               Shipment Tracking
//             </span>
//             <h1>Shipment {shipment.awb}</h1>
//             <p>
//               Follow the current shipment status and public tracking timeline
//               below.
//             </p>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             <div className="tracking-summary">
//               <div className="summary-box">
//                 <span>AWB</span>
//                 <strong>{shipment.awb}</strong>
//               </div>
//               <div className="summary-box">
//                 <span>Current Status</span>
//                 <strong style={{ color: "var(--logistics-teal-dark)" }}>
//                   {currentLabel}
//                 </strong>
//               </div>
//               <div className="summary-box">
//                 <span>Origin</span>
//                 <strong>{shipment.origin}</strong>
//               </div>
//               <div className="summary-box">
//                 <span>Destination</span>
//                 <strong>{shipment.destination}</strong>
//               </div>
//             </div>

//             <div className="split-grid">
//               <div>
//                 <span className="section-label">Tracking Timeline</span>
//                 <h2 className="section-title" style={{ fontSize: "2rem" }}>
//                   Shipment Journey
//                 </h2>
//                 <p className="section-description">
//                   Public tracking information is limited to shipment details
//                   appropriate for customer visibility.
//                 </p>

//                 {events.length === 0 ? (
//                   <div className="notice" style={{ marginTop: 35 }}>
//                     No tracking events have been recorded yet for this AWB.
//                   </div>
//                 ) : (
//                   <div className="timeline" style={{ marginTop: 35 }}>
//                     {events.map((event) => (
//                       <div
//                         className={`timeline-item ${
//                           event.completed ? "active" : ""
//                         }`}
//                         key={event.id}
//                       >
//                         <span className="timeline-dot" />
//                         <div className="timeline-content">
//                           <div
//                             style={{
//                               display: "flex",
//                               justifyContent: "space-between",
//                               gap: 15,
//                               flexWrap: "wrap",
//                             }}
//                           >
//                             <h3
//                               style={{
//                                 margin: 0,
//                                 fontWeight: 750,
//                                 color: event.completed
//                                   ? "var(--logistics-teal-dark, #0b7a78)"
//                                   : "#0f172a",
//                               }}
//                             >
//                               {event.title}
//                             </h3>
//                             <span
//                               style={{
//                                 color: event.completed
//                                   ? "var(--logistics-teal-dark, #0b7a78)"
//                                   : "#0f172a",
//                                 fontSize: ".7rem",
//                                 fontWeight: 800,
//                               }}
//                             >
//                               {event.status}
//                             </span>
//                           </div>
//                           <p>{event.description}</p>
//                           <p style={{ marginTop: 9 }}>
//                             <strong>{event.location}</strong>
//                             {event.timestamp ? ` · ${event.timestamp}` : ""}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <div className="form-shell" style={{ padding: 24 }}>
//                   <span className="section-label">Shipment Details</span>
//                   <div style={{ display: "grid", gap: 18, marginTop: 15 }}>
//                     <div>
//                       <span className="form-label">Shipment Date</span>
//                       <p style={{ margin: "4px 0 0", color: "#64748b" }}>
//                         {shipment.shipmentDate
//                           ? formatDate(shipment.shipmentDate)
//                           : "—"}
//                       </p>
//                     </div>
//                     <div>
//                       <span className="form-label">Latest Location</span>
//                       <p style={{ margin: "4px 0 0", color: "#64748b" }}>
//                         {latestLocation}
//                       </p>
//                     </div>
//                     <div>
//                       <span className="form-label">Service</span>
//                       <p style={{ margin: "4px 0 0", color: "#64748b" }}>
//                         {shipment.serviceType
//                           ? humanLabel(shipment.serviceType)
//                           : "—"}
//                       </p>
//                     </div>
//                     <div>
//                       <span className="form-label">Current Status</span>
//                       <p
//                         style={{
//                           margin: "4px 0 0",
//                           color: "var(--logistics-teal-dark)",
//                           fontWeight: 750,
//                         }}
//                       >
//                         {currentLabel}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="service-card" style={{ marginTop: 18 }}>
//                   <div className="service-icon">?</div>
//                   <h3>Need Help?</h3>
//                   <p>
//                     Contact the Sreshta team if you need assistance with this
//                     shipment.
//                   </p>
//                   <div style={{ marginTop: 15 }}>
//                     <Link href="/logistics/contact" className="btn-secondary">
//                       Contact Support
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>

//       <footer className="footer">
//         <div className="container-site footer-main">
//           <div>
//             <img
//               src="/images/sreshta-logistics-logo.png"
//               alt="Sreshta Logistics"
//               className="footer-logo"
//             />
//             <p>Reliable logistics with transparent shipment visibility.</p>
//           </div>
//           <div>
//             <h3>Tracking</h3>
//             <div className="footer-links">
//               <Link href="/logistics/track">Track Another Shipment</Link>
//               <Link href="/logistics/services">Services</Link>
//             </div>
//           </div>
//           <div>
//             <h3>Booking</h3>
//             <div className="footer-links">
//               <Link href="/logistics/book-freight">Book Freight</Link>
//               <Link href="/logistics/pickup-request">Request Pickup</Link>
//             </div>
//           </div>
//           <div>
//             <h3>Contact</h3>
//             <div className="footer-links">
//               <a href={`tel:+91${CONTACTS.MANAGING_DIRECTOR.phone}`}>
//                 +91 {CONTACTS.MANAGING_DIRECTOR.phone}
//               </a>
//               <a href={`tel:+91${CONTACTS.PARTNER.phone}`}>
//                 +91 {CONTACTS.PARTNER.phone}
//               </a>
//             </div>
//           </div>
//         </div>
//         <div className="container-site footer-bottom">
//           © {new Date().getFullYear()} Sreshta Logistics.
//         </div>
//       </footer>
//     </>
//   );
// }

// import Link from "next/link";
// import { notFound } from "next/navigation";

// import { CONTACTS } from "@/utils/constants";
// import { formatDate, formatDateTime } from "@/utils/formatters";

// export const dynamic = "force-dynamic";

// type TrackingDetailPageProps = {
//   params: {
//     awb: string;
//   };
// };

// type PublicEvent = {
//   id: string;
//   status: string;
//   title: string;
//   location: string;
//   description: string;
//   timestamp: string;
//   active: boolean;
//   completed: boolean;
// };

// type PublicShipment = {
//   awb: string;
//   currentStatus: string;
//   origin: string;
//   destination: string;
//   shipmentDate?: string;
//   latestLocation?: string;
//   serviceType?: string;
// };

// function formatAwb(awb: string) {
//   try {
//     return decodeURIComponent(awb).trim().toUpperCase();
//   } catch {
//     return awb.trim().toUpperCase();
//   }
// }

// function humanLabel(code: string, fallback?: string): string {
//   if (fallback?.trim()) return fallback.trim();
//   return code
//     .toLowerCase()
//     .split("_")
//     .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
//     .join(" ");
// }

// function defaultDescription(code: string, title: string): string {
//   const map: Record<string, string> = {
//     BOOKED: "Shipment booking has been registered successfully.",
//     BOOKING_CONFIRMED: "Shipment booking has been registered successfully.",
//     PICKUP_REQUESTED: "Pickup has been requested from the shipper.",
//     PICKED_UP: "Shipment has been collected from the shipper.",
//     SHIPMENT_RECEIVED: "Shipment has been received at the facility.",
//     AT_ORIGIN: "Shipment has reached the origin processing facility.",
//     HANDLING_IN_PROGRESS: "Shipment handling is in progress.",
//     PROCESSED_AND_PACKED: "Shipment has been processed and packed for export.",
//     SHIPPING_LABEL_GENERATED: "Shipping label has been generated.",
//     FORWARDED_TO_AIRPORT: "Shipment has been forwarded to the airport.",
//     IN_TRANSIT: "Shipment is in transit toward the destination.",
//     ARRIVED_DESTINATION: "Shipment has arrived at the destination facility.",
//     OUT_FOR_DELIVERY: "Shipment is out for delivery.",
//     DELIVERED: "Shipment has been delivered successfully.",
//     ON_HOLD: "Shipment is currently on hold.",
//     EXCEPTION: "An exception was recorded for this shipment.",
//     CANCELLED: "This shipment has been cancelled.",
//   };
//   return map[code] || `Shipment status updated to ${title}.`;
// }

// async function loadTracking(awb: string): Promise<{
//   shipment: PublicShipment | null;
//   events: PublicEvent[];
//   error: string | null;
// }> {
//   try {
//     const { adminDb } = await import("@/lib/firebase-admin");
//     const { getTrackingEvents, getTrackingStages } = await import(
//       "@/lib/tracking"
//     );

//     const snap = await adminDb
//       .collection("awbs")
//       .where("awb", "==", awb)
//       .limit(1)
//       .get();

//     let data: FirebaseFirestore.DocumentData | null = null;
//     if (!snap.empty) {
//       data = snap.docs[0]!.data();
//     } else {
//       const byId = await adminDb.collection("awbs").doc(awb).get();
//       if (byId.exists) data = byId.data() || null;
//     }

//     if (!data) {
//       return {
//         shipment: null,
//         events: [],
//         error: "Shipment was not found for this AWB.",
//       };
//     }

//     const [rawEvents, stages] = await Promise.all([
//       getTrackingEvents(awb),
//       getTrackingStages("LOGISTICS"),
//     ]);

//     const eventByStatus = new Map(
//       rawEvents.map((e) => [String(e.status).toUpperCase(), e]),
//     );

//     const currentStatus = String(
//       data.currentStatus ||
//         rawEvents[rawEvents.length - 1]?.status ||
//         "BOOKED",
//     ).toUpperCase();

//     const shipment: PublicShipment = {
//       awb: String(data.awb || awb),
//       currentStatus,
//       origin: String(data.origin || "—"),
//       destination: String(data.destination || "—"),
//       shipmentDate: data.shipmentDate
//         ? String(data.shipmentDate)
//         : data.bookDate
//           ? String(data.bookDate)
//           : undefined,
//       latestLocation: data.latestLocation
//         ? String(data.latestLocation)
//         : rawEvents[rawEvents.length - 1]?.location,
//       serviceType: data.serviceType
//         ? String(data.serviceType)
//         : data.service
//           ? String(data.service)
//           : undefined,
//     };

//     const pipeline =
//       stages.length > 0
//         ? stages.map((s) => ({
//             code: String(s.code).toUpperCase(),
//             label: s.label,
//           }))
//         : rawEvents.map((e) => ({
//             code: String(e.status).toUpperCase(),
//             label: humanLabel(String(e.status)),
//           }));

//     for (const e of rawEvents) {
//       const code = String(e.status).toUpperCase();
//       if (!pipeline.some((p) => p.code === code)) {
//         pipeline.push({ code, label: humanLabel(code) });
//       }
//     }

//     const currentIndex = pipeline.findIndex((p) => p.code === currentStatus);

//     const events: PublicEvent[] = pipeline.map((stage, index) => {
//       const event = eventByStatus.get(stage.code);

//       // Green only for current stage and earlier.
//       // Stages after current (e.g. OUT_FOR_DELIVERY, DELIVERED) stay black.
//       const completed =
//         currentIndex >= 0 ? index <= currentIndex : Boolean(event);

//       const title = humanLabel(stage.code, stage.label);
//       const location =
//         event?.location ||
//         (completed && index === 0 ? shipment.origin : undefined) ||
//         "—";

//       return {
//         id: event?.id || `stage-${stage.code}`,
//         status: stage.code,
//         title,
//         location,
//         description:
//           event?.description || defaultDescription(stage.code, title),
//         timestamp: event?.timestamp
//           ? formatDateTime(event.timestamp)
//           : completed
//             ? "—"
//             : "Pending",
//         active: completed,
//         completed,
//       };
//     });

//     if (events.length === 0 && rawEvents.length > 0) {
//       return {
//         shipment,
//         events: rawEvents.map((event, index) => ({
//           id: event.id,
//           status: String(event.status),
//           title: humanLabel(String(event.status)),
//           location: event.location || "—",
//           description:
//             event.description ||
//             defaultDescription(
//               String(event.status),
//               humanLabel(String(event.status)),
//             ),
//           timestamp: event.timestamp
//             ? formatDateTime(event.timestamp)
//             : "—",
//           active: index === rawEvents.length - 1,
//           completed: true,
//         })),
//         error: null,
//       };
//     }

//     return { shipment, events, error: null };
//   } catch (err) {
//     console.error("Public tracking load failed:", err);
//     return {
//       shipment: null,
//       events: [],
//       error:
//         "Unable to load tracking information right now. Please try again later.",
//     };
//   }
// }

// export default async function TrackingDetailPage({
//   params,
// }: TrackingDetailPageProps) {
//   const awb = formatAwb(params.awb);

//   if (!awb) {
//     notFound();
//   }

//   const { shipment, events, error } = await loadTracking(awb);

//   if (error || !shipment) {
//     return (
//       <>
//         <header className="site-header">
//           <div className="container-site header-inner">
//             <Link href="/logistics">
//               <img
//                 src="/images/sreshta-logistics-logo.png"
//                 alt="Sreshta Logistics"
//                 className="header-logo"
//               />
//             </Link>
//             <nav className="desktop-nav">
//               <Link href="/logistics">Home</Link>
//               <Link href="/logistics/services">Services</Link>
//               <Link href="/logistics/international">International</Link>
//               <Link href="/logistics/domestic">Domestic</Link>
//               <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
//               <Link href="/logistics/about">About</Link>
//               <Link href="/logistics/contact">Contact</Link>
//             </nav>
//             <div className="header-actions">
//               <Link href="/logistics/track" className="btn-secondary">
//                 Track Another
//               </Link>
//               <Link href="/logistics/book-freight" className="btn-primary">
//                 Book Freight
//               </Link>
//             </div>
//           </div>
//         </header>

//         <main>
//           <section className="page-hero">
//             <div className="container-site">
//               <span className="section-label" style={{ color: "#78e1e4" }}>
//                 Shipment Tracking
//               </span>
//               <h1>Shipment {awb}</h1>
//               <p>
//                 {error ||
//                   "No public tracking information is available for this AWB."}
//               </p>
//             </div>
//           </section>

//           <section className="section">
//             <div className="container-site" style={{ textAlign: "center" }}>
//               <div
//                 className="form-shell"
//                 style={{ padding: 32, maxWidth: 560, margin: "0 auto" }}
//               >
//                 <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
//                   Shipment not found
//                 </h2>
//                 <p className="section-description">
//                   Please check the AWB number and try again. If you believe
//                   this is an error, contact support.
//                 </p>
//                 <div
//                   style={{
//                     marginTop: 24,
//                     display: "flex",
//                     gap: 12,
//                     justifyContent: "center",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <Link href="/logistics/track" className="btn-primary">
//                     Track Another
//                   </Link>
//                   <Link href="/logistics/contact" className="btn-secondary">
//                     Contact Support
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </section>
//         </main>

//         <footer className="footer">
//           <div className="container-site footer-bottom">
//             © {new Date().getFullYear()} Sreshta Logistics.
//           </div>
//         </footer>
//       </>
//     );
//   }

//   const currentLabel = humanLabel(shipment.currentStatus);
//   const latestLocation =
//     shipment.latestLocation ||
//     events.filter((e) => e.completed).at(-1)?.location ||
//     "—";

//   return (
//     <>
//       <header className="site-header">
//         <div className="container-site header-inner">
//           <Link href="/logistics">
//             <img
//               src="/images/sreshta-logistics-logo.png"
//               alt="Sreshta Logistics"
//               className="header-logo"
//             />
//           </Link>
//           <nav className="desktop-nav">
//             <Link href="/logistics">Home</Link>
//             <Link href="/logistics/services">Services</Link>
//             <Link href="/logistics/international">International</Link>
//             <Link href="/logistics/domestic">Domestic</Link>
//             <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
//             <Link href="/logistics/about">About</Link>
//             <Link href="/logistics/contact">Contact</Link>
//           </nav>
//           <div className="header-actions">
//             <Link href="/logistics/track" className="btn-secondary">
//               Track Another
//             </Link>
//             <Link href="/logistics/book-freight" className="btn-primary">
//               Book Freight
//             </Link>
//           </div>
//         </div>
//       </header>

//       <main>
//         <section className="page-hero">
//           <div className="container-site">
//             <span className="section-label" style={{ color: "#78e1e4" }}>
//               Shipment Tracking
//             </span>
//             <h1>Shipment {shipment.awb}</h1>
//             <p>
//               Follow the current shipment status and public tracking timeline
//               below.
//             </p>
//           </div>
//         </section>

//         <section className="section">
//           <div className="container-site">
//             <div className="tracking-summary">
//               <div className="summary-box">
//                 <span>AWB</span>
//                 <strong>{shipment.awb}</strong>
//               </div>
//               <div className="summary-box">
//                 <span>Current Status</span>
//                 <strong style={{ color: "var(--logistics-teal-dark)" }}>
//                   {currentLabel}
//                 </strong>
//               </div>
//               <div className="summary-box">
//                 <span>Origin</span>
//                 <strong>{shipment.origin}</strong>
//               </div>
//               <div className="summary-box">
//                 <span>Destination</span>
//                 <strong>{shipment.destination}</strong>
//               </div>
//             </div>

//             <div className="split-grid">
//               <div>
//                 <span className="section-label">Tracking Timeline</span>
//                 <h2 className="section-title" style={{ fontSize: "2rem" }}>
//                   Shipment Journey
//                 </h2>
//                 <p className="section-description">
//                   Public tracking information is limited to shipment details
//                   appropriate for customer visibility.
//                 </p>

//                 {events.length === 0 ? (
//                   <div className="notice" style={{ marginTop: 35 }}>
//                     No tracking events have been recorded yet for this AWB.
//                   </div>
//                 ) : (
//                   <div className="timeline" style={{ marginTop: 35 }}>
//                     {events.map((event) => (
//                       <div
//                         className={`timeline-item ${
//                           event.completed ? "active" : ""
//                         }`}
//                         key={event.id}
//                       >
//                         <span className="timeline-dot" />
//                         <div className="timeline-content">
//                           <div
//                             style={{
//                               display: "flex",
//                               justifyContent: "space-between",
//                               gap: 15,
//                               flexWrap: "wrap",
//                             }}
//                           >
//                             <h3
//                               style={{
//                                 margin: 0,
//                                 fontWeight: 750,
//                                 color: event.completed
//                                   ? "var(--logistics-teal-dark, #0b7a78)"
//                                   : "#0f172a",
//                               }}
//                             >
//                               {event.title}
//                             </h3>
//                             <span
//                               style={{
//                                 color: event.completed
//                                   ? "var(--logistics-teal-dark, #0b7a78)"
//                                   : "#0f172a",
//                                 fontSize: ".7rem",
//                                 fontWeight: 800,
//                               }}
//                             >
//                               {event.status}
//                             </span>
//                           </div>
//                           <p>{event.description}</p>
//                           <p style={{ marginTop: 9 }}>
//                             <strong>{event.location}</strong>
//                             {event.timestamp ? ` · ${event.timestamp}` : ""}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <div className="form-shell" style={{ padding: 24 }}>
//                   <span className="section-label">Shipment Details</span>
//                   <div style={{ display: "grid", gap: 18, marginTop: 15 }}>
//                     <div>
//                       <span className="form-label">Shipment Date</span>
//                       <p style={{ margin: "4px 0 0", color: "#64748b" }}>
//                         {shipment.shipmentDate
//                           ? formatDate(shipment.shipmentDate)
//                           : "—"}
//                       </p>
//                     </div>
//                     <div>
//                       <span className="form-label">Latest Location</span>
//                       <p style={{ margin: "4px 0 0", color: "#64748b" }}>
//                         {latestLocation}
//                       </p>
//                     </div>
//                     <div>
//                       <span className="form-label">Service</span>
//                       <p style={{ margin: "4px 0 0", color: "#64748b" }}>
//                         {shipment.serviceType
//                           ? humanLabel(shipment.serviceType)
//                           : "—"}
//                       </p>
//                     </div>
//                     <div>
//                       <span className="form-label">Current Status</span>
//                       <p
//                         style={{
//                           margin: "4px 0 0",
//                           color: "var(--logistics-teal-dark)",
//                           fontWeight: 750,
//                         }}
//                       >
//                         {currentLabel}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="service-card" style={{ marginTop: 18 }}>
//                   <div className="service-icon">?</div>
//                   <h3>Need Help?</h3>
//                   <p>
//                     Contact the Sreshta team if you need assistance with this
//                     shipment.
//                   </p>
//                   <div style={{ marginTop: 15 }}>
//                     <Link href="/logistics/contact" className="btn-secondary">
//                       Contact Support
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>

//       <footer className="footer">
//         <div className="container-site footer-main">
//           <div>
//             <img
//               src="/images/sreshta-logistics-logo.png"
//               alt="Sreshta Logistics"
//               className="footer-logo"
//             />
//             <p>Reliable logistics with transparent shipment visibility.</p>
//           </div>
//           <div>
//             <h3>Tracking</h3>
//             <div className="footer-links">
//               <Link href="/logistics/track">Track Another Shipment</Link>
//               <Link href="/logistics/services">Services</Link>
//             </div>
//           </div>
//           <div>
//             <h3>Booking</h3>
//             <div className="footer-links">
//               <Link href="/logistics/book-freight">Book Freight</Link>
//               <Link href="/logistics/pickup-request">Request Pickup</Link>
//             </div>
//           </div>
//           <div>
//             <h3>Contact</h3>
//             <div className="footer-links">
//               <a href={`tel:+91${CONTACTS.MANAGING_DIRECTOR.phone}`}>
//                 +91 {CONTACTS.MANAGING_DIRECTOR.phone}
//               </a>
//               <a href={`tel:+91${CONTACTS.PARTNER.phone}`}>
//                 +91 {CONTACTS.PARTNER.phone}
//               </a>
//             </div>
//           </div>
//         </div>
//         <div className="container-site footer-bottom">
//           © {new Date().getFullYear()} Sreshta Logistics.
//         </div>
//       </footer>
//     </>
//   );
// }

import Link from "next/link";
import { notFound } from "next/navigation";

import { CONTACTS } from "@/utils/constants";
import { formatDate, formatDateTime } from "@/utils/formatters";

export const dynamic = "force-dynamic";

type TrackingDetailPageProps = {
  params: {
    awb: string;
  };
};

type PublicEvent = {
  id: string;
  status: string;
  title: string;
  location: string;
  description: string;
  timestamp: string;
  active: boolean;
  completed: boolean;
};

type PublicShipment = {
  awb: string;
  currentStatus: string;
  origin: string;
  destination: string;
  shipmentDate?: string;
  latestLocation?: string;
  serviceType?: string;
};

/** Full public journey — completed + upcoming always listed */
const PUBLIC_PIPELINE: Array<{ code: string; label: string }> = [
  { code: "BOOKED", label: "Booked" },
  { code: "BOOKING_CONFIRMED", label: "Booking Confirmed" },
  { code: "PICKUP_REQUESTED", label: "Pickup Requested" },
  { code: "PICKED_UP", label: "Picked Up" },
  { code: "SHIPMENT_RECEIVED", label: "Shipment Received" },
  { code: "AT_ORIGIN", label: "At Origin Facility" },
  { code: "HANDLING_IN_PROGRESS", label: "Handling In Progress" },
  { code: "PROCESSED_AND_PACKED", label: "Processed And Packed" },
  { code: "SHIPPING_LABEL_GENERATED", label: "Shipping Label Generated" },
  { code: "FORWARDED_TO_AIRPORT", label: "Forwarded To Airport" },
  { code: "IN_TRANSIT", label: "In Transit" },
  { code: "ARRIVED_DESTINATION", label: "Arrived At Destination" },
  { code: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
  { code: "DELIVERED", label: "Delivered" },
];

function formatAwb(awb: string) {
  try {
    return decodeURIComponent(awb).trim().toUpperCase();
  } catch {
    return awb.trim().toUpperCase();
  }
}

function humanLabel(code: string, fallback?: string): string {
  if (fallback?.trim()) return fallback.trim();
  return code
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function defaultDescription(code: string, title: string): string {
  const map: Record<string, string> = {
    BOOKED: "Shipment booking has been registered successfully.",
    BOOKING_CONFIRMED: "Shipment booking has been registered successfully.",
    PICKUP_REQUESTED: "Pickup has been requested from the shipper.",
    PICKED_UP: "Shipment has been collected from the shipper.",
    SHIPMENT_RECEIVED: "Shipment has been received at the facility.",
    AT_ORIGIN: "Shipment has reached the origin processing facility.",
    HANDLING_IN_PROGRESS: "Shipment handling is in progress.",
    PROCESSED_AND_PACKED: "Shipment has been processed and packed for export.",
    SHIPPING_LABEL_GENERATED: "Shipping label has been generated.",
    FORWARDED_TO_AIRPORT: "Shipment has been forwarded to the airport.",
    IN_TRANSIT: "Shipment is in transit toward the destination.",
    ARRIVED_DESTINATION: "Shipment has arrived at the destination facility.",
    OUT_FOR_DELIVERY: "Shipment is out for delivery.",
    DELIVERED: "Shipment has been delivered successfully.",
    ON_HOLD: "Shipment is currently on hold.",
    EXCEPTION: "An exception was recorded for this shipment.",
    CANCELLED: "This shipment has been cancelled.",
  };
  return map[code] || `Shipment status updated to ${title}.`;
}

function buildPipeline(
  stages: Array<{ code: string; label: string }>,
  eventCodes: string[],
): Array<{ code: string; label: string }> {
  // Prefer admin matrix stages when configured
  const base =
    stages.length > 0
      ? stages.map((s) => ({
          code: String(s.code).toUpperCase(),
          label: s.label || humanLabel(s.code),
        }))
      : PUBLIC_PIPELINE.map((s) => ({ ...s }));

  const seen = new Set(base.map((s) => s.code));

  // Ensure full public journey always includes later stages
  for (const stage of PUBLIC_PIPELINE) {
    if (!seen.has(stage.code)) {
      base.push({ ...stage });
      seen.add(stage.code);
    }
  }

  // Append any extra event codes not in the list
  for (const code of eventCodes) {
    if (!seen.has(code)) {
      base.push({ code, label: humanLabel(code) });
      seen.add(code);
    }
  }

  // Keep exception-style statuses visible if they are current/events
  for (const code of ["ON_HOLD", "EXCEPTION", "CANCELLED"]) {
    if (eventCodes.includes(code) && !seen.has(code)) {
      base.push({ code, label: humanLabel(code) });
      seen.add(code);
    }
  }

  return base;
}

async function loadTracking(awb: string): Promise<{
  shipment: PublicShipment | null;
  events: PublicEvent[];
  error: string | null;
}> {
  try {
    const { adminDb } = await import("@/lib/firebase-admin");
    const { getTrackingEvents, getTrackingStages } = await import(
      "@/lib/tracking"
    );

    const snap = await adminDb
      .collection("awbs")
      .where("awb", "==", awb)
      .limit(1)
      .get();

    let data: FirebaseFirestore.DocumentData | null = null;
    if (!snap.empty) {
      data = snap.docs[0]!.data();
    } else {
      const byId = await adminDb.collection("awbs").doc(awb).get();
      if (byId.exists) data = byId.data() || null;
    }

    if (!data) {
      return {
        shipment: null,
        events: [],
        error: "Shipment was not found for this AWB.",
      };
    }

    const [rawEvents, stages] = await Promise.all([
      getTrackingEvents(awb),
      getTrackingStages("LOGISTICS"),
    ]);

    const eventByStatus = new Map(
      rawEvents.map((e) => [String(e.status).toUpperCase(), e]),
    );

    const currentStatus = String(
      data.currentStatus ||
        rawEvents[rawEvents.length - 1]?.status ||
        "BOOKED",
    ).toUpperCase();

    const shipment: PublicShipment = {
      awb: String(data.awb || awb),
      currentStatus,
      origin: String(data.origin || "—"),
      destination: String(data.destination || "—"),
      shipmentDate: data.shipmentDate
        ? String(data.shipmentDate)
        : data.bookDate
          ? String(data.bookDate)
          : undefined,
      latestLocation: data.latestLocation
        ? String(data.latestLocation)
        : rawEvents[rawEvents.length - 1]?.location,
      serviceType: data.serviceType
        ? String(data.serviceType)
        : data.service
          ? String(data.service)
          : undefined,
    };

    const pipeline = buildPipeline(
      stages.map((s) => ({ code: s.code, label: s.label })),
      rawEvents.map((e) => String(e.status).toUpperCase()),
    );

    // If current status missing from pipeline, still place it
    if (
      currentStatus &&
      !pipeline.some((p) => p.code === currentStatus) &&
      !["ON_HOLD", "EXCEPTION", "CANCELLED"].includes(currentStatus)
    ) {
      pipeline.push({
        code: currentStatus,
        label: humanLabel(currentStatus),
      });
    }

    const currentIndex = pipeline.findIndex((p) => p.code === currentStatus);

    const events: PublicEvent[] = pipeline.map((stage, index) => {
      const event = eventByStatus.get(stage.code);

      // Completed = current and earlier only (green)
      // Upcoming = after current (black) — still shown
      const completed =
        currentIndex >= 0 ? index <= currentIndex : Boolean(event);

      const title = humanLabel(stage.code, stage.label);
      const location =
        event?.location ||
        (completed && index === 0 ? shipment.origin : undefined) ||
        "—";

      return {
        id: event?.id || `stage-${stage.code}`,
        status: stage.code,
        title,
        location,
        description:
          event?.description || defaultDescription(stage.code, title),
        timestamp: event?.timestamp
          ? formatDateTime(event.timestamp)
          : completed
            ? "—"
            : "Pending",
        active: completed,
        completed,
      };
    });

    return { shipment, events, error: null };
  } catch (err) {
    console.error("Public tracking load failed:", err);
    return {
      shipment: null,
      events: [],
      error:
        "Unable to load tracking information right now. Please try again later.",
    };
  }
}

export default async function TrackingDetailPage({
  params,
}: TrackingDetailPageProps) {
  const awb = formatAwb(params.awb);

  if (!awb) {
    notFound();
  }

  const { shipment, events, error } = await loadTracking(awb);

  if (error || !shipment) {
    return (
      <>
        <header className="site-header">
          <div className="container-site header-inner">
            <Link href="/logistics">
              <img
                src="/images/sreshta-logistics-logo.png"
                alt="Sreshta Logistics"
                className="header-logo"
              />
            </Link>
            <nav className="desktop-nav">
              <Link href="/logistics">Home</Link>
              <Link href="/logistics/services">Services</Link>
              <Link href="/logistics/international">International</Link>
              <Link href="/logistics/domestic">Domestic</Link>
              <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
              <Link href="/logistics/about">About</Link>
              <Link href="/logistics/contact">Contact</Link>
            </nav>
            <div className="header-actions">
              <Link href="/logistics/track" className="btn-secondary">
                Track Another
              </Link>
              <Link href="/logistics/book-freight" className="btn-primary">
                Book Freight
              </Link>
            </div>
          </div>
        </header>

        <main>
          <section className="page-hero">
            <div className="container-site">
              <span className="section-label" style={{ color: "#78e1e4" }}>
                Shipment Tracking
              </span>
              <h1>Shipment {awb}</h1>
              <p>
                {error ||
                  "No public tracking information is available for this AWB."}
              </p>
            </div>
          </section>

          <section className="section">
            <div className="container-site" style={{ textAlign: "center" }}>
              <div
                className="form-shell"
                style={{ padding: 32, maxWidth: 560, margin: "0 auto" }}
              >
                <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                  Shipment not found
                </h2>
                <p className="section-description">
                  Please check the AWB number and try again. If you believe
                  this is an error, contact support.
                </p>
                <div
                  style={{
                    marginTop: 24,
                    display: "flex",
                    gap: 12,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Link href="/logistics/track" className="btn-primary">
                    Track Another
                  </Link>
                  <Link href="/logistics/contact" className="btn-secondary">
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="container-site footer-bottom">
            © {new Date().getFullYear()} Sreshta Logistics.
          </div>
        </footer>
      </>
    );
  }

  const currentLabel = humanLabel(shipment.currentStatus);
  const latestLocation =
    shipment.latestLocation ||
    events.filter((e) => e.completed).at(-1)?.location ||
    "—";

  return (
    <>
      <header className="site-header">
        <div className="container-site header-inner">
          <Link href="/logistics">
            <img
              src="/images/sreshta-logistics-logo.png"
              alt="Sreshta Logistics"
              className="header-logo"
            />
          </Link>
          <nav className="desktop-nav">
            <Link href="/logistics">Home</Link>
            <Link href="/logistics/services">Services</Link>
            <Link href="/logistics/international">International</Link>
            <Link href="/logistics/domestic">Domestic</Link>
            <Link href="/logistics/cargo-freight">Cargo & Freight</Link>
            <Link href="/logistics/about">About</Link>
            <Link href="/logistics/contact">Contact</Link>
          </nav>
          <div className="header-actions">
            <Link href="/logistics/track" className="btn-secondary">
              Track Another
            </Link>
            <Link href="/logistics/book-freight" className="btn-primary">
              Book Freight
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="page-hero">
          <div className="container-site">
            <span className="section-label" style={{ color: "#78e1e4" }}>
              Shipment Tracking
            </span>
            <h1>Shipment {shipment.awb}</h1>
            <p>
              Follow the current shipment status and public tracking timeline
              below.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-site">
            <div className="tracking-summary">
              <div className="summary-box">
                <span>AWB</span>
                <strong>{shipment.awb}</strong>
              </div>
              <div className="summary-box">
                <span>Current Status</span>
                <strong style={{ color: "var(--logistics-teal-dark)" }}>
                  {currentLabel}
                </strong>
              </div>
              <div className="summary-box">
                <span>Origin</span>
                <strong>{shipment.origin}</strong>
              </div>
              <div className="summary-box">
                <span>Destination</span>
                <strong>{shipment.destination}</strong>
              </div>
            </div>

            <div className="split-grid">
              <div>
                <span className="section-label">Tracking Timeline</span>
                <h2 className="section-title" style={{ fontSize: "2rem" }}>
                  Shipment Journey
                </h2>
                <p className="section-description">
                  Public tracking information is limited to shipment details
                  appropriate for customer visibility.
                </p>

                {events.length === 0 ? (
                  <div className="notice" style={{ marginTop: 35 }}>
                    No tracking stages available for this AWB.
                  </div>
                ) : (
                  <div className="timeline" style={{ marginTop: 35 }}>
                    {events.map((event) => (
                      <div
                        className={`timeline-item ${
                          event.completed ? "active" : ""
                        }`}
                        key={event.id}
                      >
                        <span className="timeline-dot" />
                        <div className="timeline-content">
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 15,
                              flexWrap: "wrap",
                            }}
                          >
                            <h3
                              style={{
                                margin: 0,
                                fontWeight: 750,
                                color: event.completed
                                  ? "var(--logistics-teal-dark, #0b7a78)"
                                  : "#0f172a",
                              }}
                            >
                              {event.title}
                            </h3>
                            <span
                              style={{
                                color: event.completed
                                  ? "var(--logistics-teal-dark, #0b7a78)"
                                  : "#0f172a",
                                fontSize: ".7rem",
                                fontWeight: 800,
                              }}
                            >
                              {event.status}
                            </span>
                          </div>
                          <p>{event.description}</p>
                          <p style={{ marginTop: 9 }}>
                            <strong>{event.location}</strong>
                            {event.timestamp ? ` · ${event.timestamp}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="form-shell" style={{ padding: 24 }}>
                  <span className="section-label">Shipment Details</span>
                  <div style={{ display: "grid", gap: 18, marginTop: 15 }}>
                    <div>
                      <span className="form-label">Shipment Date</span>
                      <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                        {shipment.shipmentDate
                          ? formatDate(shipment.shipmentDate)
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="form-label">Latest Location</span>
                      <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                        {latestLocation}
                      </p>
                    </div>
                    <div>
                      <span className="form-label">Service</span>
                      <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                        {shipment.serviceType
                          ? humanLabel(shipment.serviceType)
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="form-label">Current Status</span>
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "var(--logistics-teal-dark)",
                          fontWeight: 750,
                        }}
                      >
                        {currentLabel}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="service-card" style={{ marginTop: 18 }}>
                  <div className="service-icon">?</div>
                  <h3>Need Help?</h3>
                  <p>
                    Contact the Sreshta team if you need assistance with this
                    shipment.
                  </p>
                  <div style={{ marginTop: 15 }}>
                    <Link href="/logistics/contact" className="btn-secondary">
                      Contact Support
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container-site footer-main">
          <div>
            <img
              src="/images/sreshta-logistics-logo.png"
              alt="Sreshta Logistics"
              className="footer-logo"
            />
            <p>Reliable logistics with transparent shipment visibility.</p>
          </div>
          <div>
            <h3>Tracking</h3>
            <div className="footer-links">
              <Link href="/logistics/track">Track Another Shipment</Link>
              <Link href="/logistics/services">Services</Link>
            </div>
          </div>
          <div>
            <h3>Booking</h3>
            <div className="footer-links">
              <Link href="/logistics/book-freight">Book Freight</Link>
              <Link href="/logistics/pickup-request">Request Pickup</Link>
            </div>
          </div>
          <div>
            <h3>Contact</h3>
            <div className="footer-links">
              <a href={`tel:+91${CONTACTS.MANAGING_DIRECTOR.phone}`}>
                +91 {CONTACTS.MANAGING_DIRECTOR.phone}
              </a>
              <a href={`tel:+91${CONTACTS.PARTNER.phone}`}>
                +91 {CONTACTS.PARTNER.phone}
              </a>
            </div>
          </div>
        </div>
        <div className="container-site footer-bottom">
          © {new Date().getFullYear()} Sreshta Logistics.
        </div>
      </footer>
    </>
  );
}