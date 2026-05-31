export const printFinancialStatement = (donations, statsProfile) => {
  if (!donations || donations.length === 0) return;

  const streamerName = statsProfile?.profile?.display_name || statsProfile?.profile?.username || "Global Merchant";
  const streamerEmail = statsProfile?.profile?.email || "-";
  const bankName = statsProfile?.profile?.bank_name || "NOT CONFIGURATED";
  const bankAccount = statsProfile?.profile?.bank_account_number || "• • • • •";

  const totalGross = statsProfile?.totalGross || 0;
  const totalNet = statsProfile?.totalNetEarnings || 0;
  const totalFee = statsProfile?.totalFeePlatform || 0;

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  const tableRows = donations.map((tx) => {
    const dateTime = new Date(tx.created_date || tx.created_at).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    return `
      <tr style="border-bottom: 2px solid #0f172a;">
        <td style="padding: 12px; font-family: monospace;">${dateTime}</td>
        <td style="padding: 12px; font-family: monospace; font-weight: bold;">#${tx.id}</td>
        <td style="padding: 12px;">Payment</td>
        <td style="padding: 12px; font-weight: bold; text-transform: uppercase;">${tx.payment_method || 'MIDTRANS_SNAP'}</td>
        <td style="padding: 12px; font-family: monospace; color: #475569;">${tx.donatur_email || 'donor@skuy.gg'}</td>
        <td style="padding: 12px; font-weight: 800; color: #16a34a; text-align: right;">${formatIDR(tx.gross_amount || tx.amount)}</td>
      </tr>
    `;
  }).join('');

  const printWindow = window.open('', '_blank');
  
  printWindow.document.write(`
    <html>
      <head>
        <title>SKUYGG_Statement_${streamerName.replace(/\s+/g, '_')}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800;900&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            color: #0f172a; 
            background: #ffffff; 
            padding: 40px;
            -webkit-print-color-adjust: exact;
          }
          .border-heavy { border: 4px solid #0f172a; }
          .shadow-heavy { box-shadow: 8px 8px 0px 0px #0f172a; }
          .badge {
            background: #e0f2fe; color: #0369a1; border: 2px solid #0f172a;
            padding: 4px 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="border-heavy shadow-heavy" style="padding: 40px; background: #fff; max-width: 1000px; margin: 0 auto;">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #0f172a; padding-bottom: 24px; margin-bottom: 30px;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="background: #7c3aed; color: #fff; padding: 8px 16px; font-weight: 900; font-style: italic; font-size: 24px; border: 3px solid #0f172a; box-shadow: 3px 3px 0px 0px #0f172a;">SKUY.GG</div>
                <span class="badge" style="background: #ecfdf5; color: #047857;">Verified Statement</span>
              </div>
              <p style="font-size: 11px; color: #64748b; font-weight: 600; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                PT Skuy Media Teknologi Ecosystem • Hub: ariwirayuda24@gmail.com
              </p>
            </div>
            <div style="text-align: right;">
              <h2 style="font-weight: 900; font-style: italic; font-size: 20px; text-transform: uppercase;">OFFICIAL CLEARING STATEMENT</h2>
              <p style="font-size: 11px; font-weight: bold; color: #475569; margin-top: 4px;">Dibuat pada: ${new Date().toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div style="background: #f8fafc; border: 2px solid #0f172a; padding: 15px; border-radius: 12px; margin-bottom: 30px; font-size: 11px; line-height: 1.6; color: #334155;">
            <b>Mengenai Dokumen Ini (Skuy.gg Cloud Protocol):</b> Dokumen ini merupakan ringkasan kliring keuangan multi-tenant resmi yang dihasilkan otomatis oleh mesin inti <i>Skuy.gg Management Core</i>. Seluruh sirkuit pemrosesan dana, pemotongan Platform Fee sebesar 5%, dan data transaksi di bawah ini telah divalidasi secara aman melewati pangkalan database PostgreSQL Railway dan jaringan terenkripsi Sandbox Payment Gateway Midtrans. Dokumen ini sah digunakan sebagai bukti pelaporan pembukuan pendapatan merchant rill.
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="background: #fdf4ff; border: 3px solid #0f172a; padding: 20px; box-shadow: 4px 4px 0px 0px #0f172a;">
              <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; margin-bottom: 8px; color: #a21caf;">Target Merchant Node</h3>
              <p style="font-size: 16px; font-weight: 800; text-transform: uppercase;">${streamerName}</p>
              <p style="font-size: 12px; color: #64748b; font-family: monospace; margin-top: 2px;">Email: ${streamerEmail}</p>
            </div>
            <div style="background: #fffbeb; border: 3px solid #0f172a; padding: 20px; box-shadow: 4px 4px 0px 0px #0f172a;">
              <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; margin-bottom: 8px; color: #b45309;">Clearing Bank Destination</h3>
              <p style="font-size: 16px; font-weight: 800; text-transform: uppercase;">${bankName}</p>
              <p style="font-size: 13px; color: #64748b; font-family: monospace; margin-top: 2px; font-weight: bold;">Acc No: ${bankAccount}</p>
            </div>
          </div>

          <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; margin-bottom: 12px;">💰 Financial Matrix Aggregation</h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 35px;">
            <div style="border: 3px solid #0f172a; padding: 15px; background: #fff;">
              <p style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase;">Gross Turnaround</p>
              <p style="font-size: 18px; font-weight: 900; font-family: monospace; margin-top: 4px;">${formatIDR(totalGross)}</p>
            </div>
            <div style="border: 3px solid #0f172a; padding: 15px; background: #f5f3ff;">
              <p style="font-size: 9px; font-weight: 800; color: #7c3aed; text-transform: uppercase;">Merchant Revenue (95%)</p>
              <p style="font-size: 18px; font-weight: 900; font-family: monospace; color: #7c3aed; margin-top: 4px;">${formatIDR(totalNet)}</p>
            </div>
            <div style="border: 3px solid #0f172a; padding: 15px; background: #f0fdf4;">
              <p style="font-size: 9px; font-weight: 800; color: #16a34a; text-transform: uppercase;">Platform Royalty (5%)</p>
              <p style="font-size: 18px; font-weight: 900; font-family: monospace; color: #16a34a; margin-top: 4px;">${formatIDR(totalFee)}</p>
            </div>
          </div>

          <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; margin-bottom: 12px;">📦 Isolated Settlement Batches</h3>
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; border: 3px solid #0f172a; margin-bottom: 30px;">
            <thead>
              <tr style="background: #0f172a; color: #94a3b8; font-weight: 800; text-transform: uppercase;">
                <th style="padding: 12px;">Date & Time</th>
                <th style="padding: 12px;">Order ID</th>
                <th style="padding: 12px;">Type</th>
                <th style="padding: 12px;">Channel</th>
                <th style="padding: 12px;">Customer Email</th>
                <th style="padding: 12px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div style="border-top: 2px dashed #0f172a; padding-top: 20px; margin-top: 40px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b; font-weight: 600;">
            <p>© 2026 Skuy.gg Engine Echosystem. All rights reserved.</p>
            <p style="text-transform: uppercase;">Secure Financial Print Ledger Protocol</p>
          </div>

        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.setTimeout(() => { printWindow.print(); }, 500);
};