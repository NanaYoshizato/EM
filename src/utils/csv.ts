/**
 * CSV ファイルを生成してダウンロードする
 * @param headers - ヘッダー行の列名配列
 * @param rows    - データ行の2次元配列
 * @param filename - ダウンロード時のファイル名
 */
export function downloadCsv(headers: string[], rows: string[][], filename: string): void {
  const header = headers.join(",") + "\n";
  const body   = rows.map((row) => row.join(",")).join("\n");
  const blob   = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a");
  a.href       = url;
  a.download   = filename;
  a.click();
  URL.revokeObjectURL(url);
}
