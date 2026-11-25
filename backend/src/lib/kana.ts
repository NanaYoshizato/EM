/** ひらがなをカタカナにする（それ以外の文字はそのまま） */
export const toKatakana = (text: string): string =>
  text.replace(/[ぁ-ゖ]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60));
