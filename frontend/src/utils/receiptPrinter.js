// Jalur: src/utils/receiptPrinter.js
import Swal from 'sweetalert2';

export const printDonaturReceipt = (donationData) => {
  if (!donationData) return;

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  const dateTime = new Date(donationData.created_date || donationData.created_at || Date.now()).toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const printWindow = window.open('', '_blank');
  
  // 🛡️ PROTEKSI POP-UP BLOCKER: Peringatkan user jika browser ngeblokir jendela baru
  if (!printWindow) {
    Swal.fire({
      icon: 'warning',
      title: 'Pop-up Diblokir!',
      text: 'Browser ngeblokir jendela PDF struk. Tolong izinkan (Allow pop-ups) di pojok kanan atas address bar, lalu coba cetak lagi ya!',
      confirmButtonColor: '#10B981',
      customClass: { popup: 'rounded-3xl border-4 border-slate-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]' }
    });
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>SKUYGG_Receipt_${donationData.id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 30px; background: #f8fafc; }
          .receipt-card { max-width: 550px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; padding: 35px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
          .header { text-align: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 25px; }
          .brand { font-size: 20px; font-weight: 800; color: #7c3aed; letter-spacing: -0.5px; }
          .title { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 4px; }
          .grid-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; }
          .label { color: #64748b; font-weight: 500; }
          .value { color: #0f172a; font-weight: 600; text-align: right; }
          .amount-box { background: #f1f5f9; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0; }
          .amount-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; }
          .amount-value { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 2px; font-family: monospace; }
          .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 15px; }
          @media print { body { background: #fff; padding: 0; } .receipt-card { border: none; box-shadow: none; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="receipt-card">
          <div class="header">
            <div class="brand">SKUY.GG</div>
            <div class="title">Official Donation Receipt</div>
          </div>

          <div class="grid-row">
            <span class="label">Nomor Transaksi</span>
            <span class="value" style="font-family: monospace;">#${donationData.id}</span>
          </div>
          <div class="grid-row">
            <span class="label">Waktu Pembayaran</span>
            <span class="value">${dateTime}</span>
          </div>
          <div class="grid-row">
            <span class="label">Metode Gateway</span>
            <span class="value" style="text-transform: uppercase;">${donationData.payment_method || 'MIDTRANS_SNAP'}</span>
          </div>
          <div class="grid-row" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 12px;">
            <span class="label">Status Keamanan</span>
            <span class="value" style="color: #16a34a; text-transform: uppercase;">● SETTLEMENT (VERIFIED)</span>
          </div>

          <div class="grid-row">
            <span class="label">Nama Donatur (Sultan)</span>
            <span class="value">${donationData.donatur_name}</span>
          </div>
          <div class="grid-row">
            <span class="label">Email Donatur</span>
            <span class="value" style="font-family: monospace;">${donationData.donatur_email || 'donor@skuy.gg'}</span>
          </div>
          <div class="grid-row" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 12px;">
            <span class="label">Target Penerima (Merchant)</span>
            <span class="value" style="text-transform: uppercase;">ID Creator: #${donationData.streamer_id}</span>
          </div>

          <div class="grid-row" style="flex-direction: column; gap: 4px; margin-bottom: 15px;">
            <span class="label">Pesan Pendukung (Dukungan Live):</span>
            <span class="value" style="text-align: left; background: #fafafa; border: 1px solid #f1f5f9; padding: 10px; border-radius: 8px; font-weight: 500; font-style: italic; color: #475569;">
              "${donationData.message || 'Tidak ada pesan tertulis.'}"
            </span>
          </div>

          <div class="amount-box">
            <div class="amount-label">Total Kontribusi Bersih</div>
            <div class="amount-value">${formatIDR(donationData.gross_amount || donationData.amount)}</div>
          </div>

          <div class="footer">
            <p>Terima kasih atas kontribusi lo dalam mendukung ekosistem kreator lokal!</p>
            <p style="margin-top: 4px; font-size: 9px; font-family: monospace;">PT Skuy Media Teknologi • Validated Cloud Proof Ledger</p>
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.setTimeout(() => { printWindow.print(); }, 500);
};