import { z } from "zod";

/**
 * 自由入力の文字列で受け付けない文字
 * 制御文字・書式文字（双方向制御・ゼロ幅など）・行/段落区切り・私用領域・未割り当て・片割れのサロゲート、
 * 空白に見える文字、通常の空白と全角空白以外の空白、異体字セレクタ
 */
const FORBIDDEN_CHARS =
  /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}\p{Co}\p{Cn}\p{Cs}\u{34F}\u{115F}\u{1160}\u{3164}\u{FFA0}\u{2800}\u{A0}\u{1680}\u{2000}-\u{200A}\u{202F}\u{205F}\u{FE00}-\u{FE0F}\u{E0100}-\u{E01EF}]/u;

/** 結合文字の積み重ね（3つ以上） */
const STACKED_MARKS = /\p{M}{3,}/u;

/** 人名で受け付けない文字（ファイル名に使われた場合のパストラバーサル対策） */
const PATH_SEPARATORS = /[/\\]/;

/** GitHubのユーザー名（英数字とハイフン、39文字以内。先頭・末尾・連続のハイフン不可。空文字は許可） */
const GITHUB_USERNAME = /^(?:[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38})?$/;

const INVALID_CHARS_MESSAGE = "使用できない文字が含まれています";

/** 自由入力の文字列（NFC正規化・前後の空白除去のあと、見えない文字などを弾く） */
export const freeText = () =>
  z
    .string()
    .normalize("NFC")
    .trim()
    .refine((value) => !FORBIDDEN_CHARS.test(value) && !STACKED_MARKS.test(value), INVALID_CHARS_MESSAGE);

/** 人名（自由入力の制限に加えて / と \ を弾く） */
export const personName = () =>
  freeText().refine((value) => !PATH_SEPARATORS.test(value), INVALID_CHARS_MESSAGE);

/** GitHubのユーザー名 */
export const gitHubUsername = () =>
  z.string().trim().regex(GITHUB_USERNAME, "GitHubのユーザー名の形式が正しくありません");
