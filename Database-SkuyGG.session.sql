
-- (Opsional) Jika kolom bank_info lo ternyata tipenya terlanjur balik ke TEXT, paksa kunci ke JSONB lagi:
ALTER TABLE withdrawals ALTER COLUMN bank_info TYPE JSONB USING bank_info::JSONB;