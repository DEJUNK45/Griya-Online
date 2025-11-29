
import { Order, CartItem, User } from "./types";

export const formatIDR = (price: number) => {
  if (price === 0) return "Dana Punia";
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};

export const getOrdersDB = (): Order[] => {
  try {
    const stored = localStorage.getItem('griya_orders');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse orders", e);
    return [];
  }
};

export const saveOrderToDB = (newOrder: Order) => {
  const currentOrders = getOrdersDB();
  const updatedOrders = [newOrder, ...currentOrders];
  localStorage.setItem('griya_orders', JSON.stringify(updatedOrders));
  return updatedOrders;
};

// --- Search History Helpers ---

export const getSearchHistory = (key: string): string[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const addToSearchHistory = (key: string, term: string) => {
  if (!term.trim()) return;
  const history = getSearchHistory(key);
  // Remove duplicate if exists, add to front, limit to 5
  const newHistory = [term, ...history.filter(h => h.toLowerCase() !== term.toLowerCase())].slice(0, 5);
  localStorage.setItem(key, JSON.stringify(newHistory));
  return newHistory;
};

export const clearSearchHistory = (key: string) => {
  localStorage.removeItem(key);
  return [];
};

// --- PDF Generator ---

export const generateInvoicePDF = (order: Order, cart: CartItem[], user: User) => {
  // @ts-ignore
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Determine Status specifics
  const isPaid = order.status.toLowerCase().includes('lunas');
  const docTitle = isPaid ? "INVOICE LUNAS" : "BUKTI PESANAN";
  const stampText = isPaid ? "LUNAS" : "MENUNGGU VERIFIKASI";
  const stampColor = isPaid ? [22, 163, 74] : [234, 88, 12]; // Green or Orange

  // --- 1. DECORATIVE HEADER ---
  doc.setFillColor(194, 65, 12); // Orange-700
  doc.rect(0, 0, pageWidth, 5, 'F'); // Top thin bar

  doc.setFillColor(255, 247, 237); // Orange-50 background for header
  doc.rect(0, 5, pageWidth, 50, 'F');

  // --- 2. BRANDING (Balinese Ornament) ---
  const cx = 25;
  const cy = 28;
  
  // Draw simple flower vectors
  doc.setDrawColor(251, 146, 60); // Orange-400
  doc.setFillColor(255, 237, 213); // Orange-100
  doc.setLineWidth(0.5);
  
  // 5 Petals
  for(let i=0; i<5; i++) {
    const angle = (i * 72) * (Math.PI / 180);
    const r = 8;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    doc.circle(x, y, 3, 'FD'); 
  }
  // Center
  doc.setFillColor(254, 240, 138); // Yellow-200
  doc.circle(cx, cy, 3, 'FD');

  doc.setTextColor(154, 52, 18); // Orange-900
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("GRIYA BANTEN", 45, 26);
  doc.setFontSize(14);
  doc.setTextColor(194, 65, 12); // Orange-700
  doc.text("ONLINE", 45, 32);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Solusi Terpercaya Keperluan Yadnya di Bali", 45, 38);
  doc.text("Denpasar - Bali | WA: 0812-3456-7890", 45, 43);

  // --- 3. DOC DETAILS (Top Right) ---
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.setFont("helvetica", "bold");
  doc.text(docTitle, pageWidth - 15, 20, { align: 'right' });
  
  doc.setFont("helvetica", "normal");
  doc.text(`#${order.id}`, pageWidth - 15, 26, { align: 'right' });
  doc.text(`${order.date}`, pageWidth - 15, 32, { align: 'right' });

  // Status Badge in Header
  doc.setFillColor(isPaid ? 220 : 255, isPaid ? 252 : 237, isPaid ? 231 : 213); // Bg color
  doc.setDrawColor(stampColor[0], stampColor[1], stampColor[2]);
  doc.roundedRect(pageWidth - 55, 38, 40, 8, 2, 2, 'FD');
  doc.setTextColor(stampColor[0], stampColor[1], stampColor[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(stampText, pageWidth - 35, 43, { align: 'center' });

  // --- 4. CUSTOMER & EVENT INFO ---
  let startY = 70;

  // Bill To
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "bold");
  doc.text("TAGIHAN KEPADA:", 15, startY);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(user.name.toUpperCase(), 15, startY + 6);
  doc.setFont("helvetica", "normal");
  doc.text(user.phone, 15, startY + 11);
  doc.text(user.kabupaten, 15, startY + 16);

  // Event Details (Right Side)
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "bold");
  doc.text("RENCANA UPACARA:", 120, startY);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(`Tanggal: ${order.eventDate}`, 120, startY + 6);
  doc.text(`Pukul: ${order.eventTime}`, 120, startY + 11);

  // --- 5. TABLE CONTENT ---
  const tableColumn = ["No", "Deskripsi", "Harga Satuan", "Qty", "Total"];
  const tableRows: any[] = [];
  let rowCounter = 1;

  cart.forEach((item) => {
    if (item.tipe === 'Venue') {
      // Venue Package Cost
      const pkgPrice = item.selectedPackage?.price || 0;
      tableRows.push([
        rowCounter, 
        { content: `${item.nama.split('(')[0]}\nPaket: ${item.selectedPackage?.name || '-'}`, styles: { fontStyle: 'bold' } }, 
        formatIDR(pkgPrice), 
        "1", 
        formatIDR(pkgPrice)
      ]);
      rowCounter++;

      // Venue Catering Cost
      const catPrice = item.cateringPricePerPax || 0;
      const guestCount = item.guestCount || 0;
      if (guestCount > 0) {
        tableRows.push([
          rowCounter, 
          `Catering (${guestCount} pax)`, 
          formatIDR(catPrice), 
          guestCount, 
          formatIDR(catPrice * guestCount)
        ]);
        rowCounter++;
      }
    } else if (item.tipe === 'Pandita') {
      tableRows.push([
        rowCounter,
        `${item.nama}\n${item.griya}`,
        "Dana Punia",
        "1",
        "Dana Punia"
      ]);
      rowCounter++;
    } else {
      // Regular Item
      const itemTotal = item.harga * item.qty;
      tableRows.push([
        rowCounter,
        item.nama,
        formatIDR(item.harga),
        item.qty,
        formatIDR(itemTotal)
      ]);
      rowCounter++;
    }
  });

  // @ts-ignore
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: startY + 25,
    theme: 'grid',
    headStyles: { 
      fillColor: [194, 65, 12], // Orange-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      minCellHeight: 10
    },
    bodyStyles: {
      textColor: [50, 50, 50],
      fontSize: 9,
      cellPadding: 4,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' }, // Description
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: [255, 247, 237] // Very light orange
    },
    margin: { top: 95, left: 15, right: 15 }
  });

  // --- 6. TOTAL & PAYMENT SUMMARY ---
  // @ts-ignore
  let finalY = doc.lastAutoTable.finalY + 10;
  
  // Check page break for totals
  if (finalY > pageHeight - 60) {
    doc.addPage();
    finalY = 20;
  }

  // Payment Method Section (Left)
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text("Metode Pembayaran:", 15, finalY + 5);
  doc.setFont("helvetica", "bold");
  doc.text("Transfer Bank", 15, finalY + 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("BCA: 7725-1234-5678", 15, finalY + 16);
  doc.text("a.n Griya Banten Online", 15, finalY + 20);

  // Total Box (Right) - Improved Layout to prevent stacking
  const boxWidth = 90;
  const boxHeight = 30; // Increased height
  const boxX = pageWidth - 15 - boxWidth;
  const boxY = finalY;

  doc.setFillColor(255, 237, 213); // Orange-100
  doc.setDrawColor(251, 146, 60); // Orange-400
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'FD');

  // Label "TOTAL BAYAR" (Top Left of Box)
  doc.setTextColor(154, 52, 18); // Orange-900
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL PEMBAYARAN", boxX + 6, boxY + 10);

  // Value Amount (Bottom Right of Box)
  doc.setTextColor(194, 65, 12); // Orange-700
  doc.setFontSize(18); // Large font
  doc.setFont("helvetica", "bold");
  doc.text(formatIDR(order.total), boxX + boxWidth - 6, boxY + 22, { align: 'right' });

  // --- 7. LARGE WATERMARK STAMP ---
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.setTextColor(stampColor[0], stampColor[1], stampColor[2]);
  doc.setFontSize(35); // Slightly smaller to fit "MENUNGGU..."
  doc.setFont("helvetica", "bold");
  // Centered rotation
  doc.text(stampText, pageWidth / 2, pageHeight / 2, { angle: 35, align: 'center' });
  doc.restoreGraphicsState();

  // --- 8. FOOTER ---
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.1);
  doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  if (!isPaid) {
    doc.text("* Bukti pesanan ini belum berlaku sebagai invoice lunas.", pageWidth / 2, pageHeight - 13, { align: 'center' });
    doc.text("Mohon tunggu konfirmasi admin setelah bukti pembayaran diverifikasi.", pageWidth / 2, pageHeight - 10, { align: 'center' });
  } else {
    doc.text("Dokumen ini sah dan diterbitkan otomatis oleh Griya Banten Online.", pageWidth / 2, pageHeight - 10, { align: 'center' });
  }
  doc.text("Matur Suksma - Om Shanti Shanti Shanti Om", pageWidth / 2, pageHeight - 6, { align: 'center' });

  // Save PDF
  const fileName = isPaid ? `Invoice_LUNAS_${order.id}.pdf` : `Bukti_Pesanan_${order.id}.pdf`;
  doc.save(fileName);
};
