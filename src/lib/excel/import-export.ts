// Excel import/export utilities using xlsx
import * as XLSX from 'xlsx';

export interface GuestImportRow {
  guest_name: string;
  phone?: string;
  category?: string;
  pax_allocated?: number;
  address?: string;
  invitation_given_status?: string;
  notes?: string;
}

export function generateGuestToken(): string {
  return 'tok-' + Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map(b => b.toString(36).padStart(2, '0'))
    .join('');
}

export function generateQrHash(): string {
  return 'qr-' + Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map(b => b.toString(36).padStart(2, '0'))
    .join('');
}

export function parseExcelFile(file: File): Promise<GuestImportRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<GuestImportRow>(worksheet, { defval: '' });

        // Normalize headers
        const normalized = rows.map((row: any) => ({
          guest_name: row.guest_name || row['Nama Tamu'] || row['nama_tamu'] || row.nama || '',
          phone: row.phone || row['Phone'] || row['No HP'] || row.nomor || '',
          category: row.category || row['Kategori'] || row['kategori'] || 'Umum',
          pax_allocated: parseInt(row.pax_allocated || row['Pax'] || row['Jumlah'] || 1),
          address: row.address || row['Alamat'] || row['alamat'] || '',
          invitation_given_status: row.invitation_given_status || row['Status Undangan'] || 'Belum Diberikan',
          notes: row.notes || row['Catatan'] || row['catatan'] || '',
        }));

        resolve(normalized);
      } catch (err) {
        reject(new Error('Gagal membaca file Excel. Pastikan format benar.'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
}

export function downloadTemplate() {
  const headers = ['guest_name', 'phone', 'category', 'pax_allocated', 'address', 'invitation_given_status', 'notes'];
  const sampleRow = ['Nama Tamu', '08123456789', 'Keluarga', 2, 'Alamat lengkap', 'Belum Diberikan', 'Catatan opsional'];

  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
  ws['!cols'] = headers.map(() => ({ wch: 25 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Tamu');
  XLSX.writeFile(wb, 'template-import-tamu.xlsx');
}

export function exportToExcel(data: any[], filename: string) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
  XLSX.utils.book_append_sheet(wb, ws, 'Daftar Tamu');
  XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportToCsv(data: any[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
