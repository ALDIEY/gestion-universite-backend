import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {
  csv(filename: string, rows: Array<Record<string, unknown>>): void {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const body = rows.map(row => headers.map(header => this.csvCell(row[header])).join(';'));
    const content = [headers.join(';'), ...body].join('\n');
    const blob = new Blob([`\ufeff${content}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  print(title: string, rows: Array<Record<string, unknown>>): void {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const table = `
      <table>
        <thead><tr>${headers.map(h => `<th>${this.escape(h)}</th>`).join('')}</tr></thead>
        <tbody>
          ${rows.map(row => `<tr>${headers.map(h => `<td>${this.escape(String(row[h] ?? ''))}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>`;
    const win = window.open('', '_blank', 'width=1000,height=800');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>${this.escape(title)}</title>
          <style>
            body{font-family:Arial,sans-serif;padding:24px;color:#222}
            h1{color:#1a237e;font-size:22px}
            table{border-collapse:collapse;width:100%;font-size:12px}
            th,td{border:1px solid #ddd;padding:8px;text-align:left}
            th{background:#eef2ff;color:#1a237e}
          </style>
        </head>
        <body><h1>${this.escape(title)}</h1>${table}</body>
      </html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  private csvCell(value: unknown): string {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
  }

  private escape(value: string): string {
    return value.replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char] ?? char));
  }
}
