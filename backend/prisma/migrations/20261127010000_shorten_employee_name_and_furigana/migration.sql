-- 氏名・フリガナの上限を30文字にする（フロントの入力の上限と合わせる）
ALTER TABLE "employee" ALTER COLUMN "name" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "furigana" SET DATA TYPE VARCHAR(30);
