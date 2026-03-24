-- ================================================
-- TAX PARTNER - Seed Data
-- Generated from Excel + existing TS mock data
-- ================================================

BEGIN;

-- ============================
-- offices
-- ============================
INSERT INTO offices (id, name, representative, phone, email, address, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'サンプル会計事務所', '山田太郎', '03-1234-5678', 'info@sample-tax.co.jp', '東京都千代田区丸の内1-1-1', 'standard');

-- ============================
-- staff
-- ============================
INSERT INTO staff (id, office_id, name, email, role) VALUES ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '山田太郎', 'yamada@sample-tax.co.jp', 'admin');
INSERT INTO staff (id, office_id, name, email, role) VALUES ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', '佐藤花子', 'sato@sample-tax.co.jp', 'member');
INSERT INTO staff (id, office_id, name, email, role) VALUES ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', '鈴木一郎', 'suzuki@sample-tax.co.jp', 'member');

-- ============================
-- clients (12 sample companies)
-- ============================
INSERT INTO clients (id, office_id, name, representative, type, settlement_month, accounting_software, monthly_fee, assigned_staff_id, rank, status, phone, email, industry, registration_date) VALUES ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', '株式会社サクラテック', '田中一郎', 'new_corporate', 3, 'freee', 50000, '00000000-0000-0000-0000-000000000011', 'A', 'active', '03-1111-2222', 'tanaka@sakura-tech.co.jp', 'IT・ソフトウェア', '2024-04-01');
INSERT INTO clients (id, office_id, name, representative, type, settlement_month, accounting_software, monthly_fee, assigned_staff_id, rank, status, phone, email, industry, registration_date) VALUES ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', '株式会社ヤマダHD', '山田正雄', 'existing_corporate', 3, 'MF', 80000, '00000000-0000-0000-0000-000000000011', 'A', 'active', '03-2222-3333', 'yamada@yamada-hd.co.jp', '不動産', '2023-10-01');
INSERT INTO clients (id, office_id, name, representative, type, settlement_month, accounting_software, monthly_fee, assigned_staff_id, rank, status, phone, email, industry, registration_date) VALUES ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', '株式会社マルハシ商事', '丸橋健太', 'existing_corporate', 3, 'freee', 35000, '00000000-0000-0000-0000-000000000012', 'B', 'active', '03-3333-4444', 'maruhashi@maruhashi.co.jp', '卸売業', '2024-01-15');
INSERT INTO clients (id, office_id, name, representative, type, settlement_month, accounting_software, monthly_fee, assigned_staff_id, rank, status, phone, email, industry, registration_date) VALUES ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', '株式会社フジタ建設', '藤田誠', 'existing_corporate', 6, 'yayoi', 60000, '00000000-0000-0000-0000-000000000013', 'A', 'active', '048-111-2222', 'fujita@fujita-kensetsu.co.jp', '建設業', '2023-06-01');
INSERT INTO clients (id, office_id, name, representative, type, settlement_month, accounting_software, monthly_fee, assigned_staff_id, rank, status, phone, email, industry, registration_date) VALUES ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000001', '株式会社タナカ物産', '田中裕子', 'new_corporate', 9, 'freee', 30000, '00000000-0000-0000-0000-000000000012', 'B', 'active', '03-5555-6666', 'info@tanaka-bussan.co.jp', '小売業', '2024-03-01');
INSERT INTO clients (id, office_id, name, representative, type, settlement_month, accounting_software, monthly_fee, assigned_staff_id, rank, status, phone, email, industry, registration_date) VALUES ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000001', '合同会社ミライ', '松岡哲平', 'existing_corporate', 12, 'MF', 25000, '00000000-0000-0000-0000-000000000011', 'C', 'active', '048-222-3333', 'matsuoka@mirai.co.jp', 'ITコンサルティング', '2024-07-01');
INSERT INTO clients (id, office_id, name, representative, type, settlement_month, accounting_software, monthly_fee, assigned_staff_id, rank, status, phone, email, industry, registration_date) VALUES ('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000001', '株式会社アオゾラ', '青空太陽', 'existing_corporate', 9, 'freee', 70000, '00000000-0000-0000-0000-000000000013', 'A', 'active', '03-7777-8888', 'aozora@aozora.co.jp', '製造業', '2023-04-01');
INSERT INTO clients (id, office_id, name, representative, type, settlement_month, accounting_software, monthly_fee, assigned_staff_id, rank, status, phone, email, industry, registration_date) VALUES ('00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000001', '医療法人さくら', '桜井美咲', 'existing_corporate', 3, 'MF', 45000, '00000000-0000-0000-0000-000000000012', 'B', 'active', '03-8888-9999', 'sakurai@sakura-med.or.jp', '医療', '2024-02-01');
INSERT INTO clients (id, office_id, name, representative, type, settlement_month, accounting_software, monthly_fee, assigned_staff_id, rank, status, phone, email, industry, registration_date) VALUES ('00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000001', '株式会社ナカムラ工業', '中村剛', 'existing_corporate', 12, 'yayoi', 28000, '00000000-0000-0000-0000-000000000013', 'C', 'active', '048-333-4444', 'nakamura@nakamura-k.co.jp', '製造業', '2024-05-01');
INSERT INTO clients (id, office_id, name, representative, type, settlement_month, accounting_software, monthly_fee, assigned_staff_id, rank, status, phone, email, industry, registration_date) VALUES ('00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000001', '株式会社コスモス', '花田和也', 'new_corporate', 6, 'freee', 40000, '00000000-0000-0000-0000-000000000011', 'B', 'active', '03-4444-5555', 'hanada@cosmos.co.jp', '飲食業', '2024-08-01');
INSERT INTO clients (id, office_id, name, representative, type, settlement_month, accounting_software, monthly_fee, assigned_staff_id, rank, status, phone, email, industry, registration_date) VALUES ('00000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000001', '株式会社グローバルIT', '高橋智也', 'existing_corporate', 9, 'freee', 90000, '00000000-0000-0000-0000-000000000011', 'A', 'active', '03-6666-7777', 'takahashi@global-it.co.jp', 'IT・SaaS', '2023-01-01');
INSERT INTO clients (id, office_id, name, representative, type, settlement_month, accounting_software, monthly_fee, assigned_staff_id, rank, status, phone, email, industry, registration_date) VALUES ('00000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000001', '有限会社太陽', '太陽敏彦', 'existing_corporate', 3, 'MF', 20000, '00000000-0000-0000-0000-000000000012', 'C', 'inactive', '048-555-6666', 'taiyo@taiyo-y.co.jp', 'サービス業', '2022-04-01');

-- ============================
-- task_templates (from Excel)
-- ============================
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', 'init_new_corporate', '顧問契約・資料提出スケジュール設定', 1, 5, NULL, NULL, NULL, 1);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', 'init_new_corporate', '適格請求書発行事業者の登録申請書（インボイスの届出）要否の確認', 1, 5, NULL, NULL, NULL, 2);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', 'init_new_corporate', '労務サポート要否の確認', 1, 5, NULL, NULL, NULL, 3);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', 'init_new_corporate', '個人事業時代の確定申告書の提出依頼', 1, 5, NULL, NULL, NULL, 4);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', 'init_new_corporate', '個人事業時代の借入金の返済予定表提出依頼', 1, 5, NULL, NULL, NULL, 5);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', 'init_new_corporate', '役員報酬の金額の確認', 1, 5, NULL, NULL, NULL, 6);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', 'init_new_corporate', '登記事項証明書（履歴事項全部証明書）', 5, 10, NULL, NULL, NULL, 7);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', 'init_new_corporate', '定款の写し', 5, 10, NULL, NULL, NULL, 8);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', 'init_new_corporate', '出資者名簿があるかどうかの確認', 5, 10, NULL, NULL, NULL, 9);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-MISC', 'init_new_corporate', 'GbizIDを取得する', NULL, NULL, NULL, NULL, '労務手続きをオンラインでするなら必要', 10);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-MISC', 'init_new_corporate', '税務署へ設立関連の届け出が終わったら完了報告を送る', NULL, NULL, '税務署へ下記書類を提出
┗法人設立届出書(設立から2か月以内)
┗青色申告の承認申請書
(原則：設立日から3か月以内
かつ最初の事業年度終了日の前日までのいずれか早い日)
┗給与支払事務所等の開設届出書
開設日から1か月以内
┗源泉所得税の納期の特例の承認申請書（10名以下）
 随時提出可能（早めに提出推奨）
承認されれば、翌月10日→半年ごとの納付に変更されます', NULL, NULL, 11);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-MISC', 'init_new_corporate', '税務署へ設立関連の届け出が終わったら完了報告を送る', NULL, NULL, NULL, NULL, '※インボイス登録する場合のみ。
インボイス制度の「適格請求書発行事業者の登録」を行った場合、その日以降は自動的に消費税の課税事業者とみなされます（税法上の特例）。
➤ よって、「課税事業者選択届出書」は提出不要', 12);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-MISC', 'init_new_corporate', '年金事務所へ下記の届け出が終わったら完了報告を送る', NULL, NULL, NULL, '年金事務所へ下記書類を提出
┗健康保険・厚生年金保険 新規適用届（雇用開始から5日以内)
┗被保険者資格取得届（健康保険・厚生年金）(雇用開始から5日以内)', NULL, 13);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-MISC', 'init_new_corporate', 'ハローワークへ下記の届け出が終わったら完了報告を送る', NULL, NULL, NULL, '年金事務所へ下記の届出を提出
┗雇用保険適用事業所設置届(雇用開始から10日以内)
┗雇用保険被保険者資格取得届(雇用開始から10日以内)', '従業員ありの場合のみ', 14);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-MISC', 'init_new_corporate', '労働基準監督署へ下記の届け出が終わったら完了報告を送る', NULL, NULL, NULL, '労働基準監督署へ下記の届出を提出
┗労働保険（労災保険・雇用保険）適用事業の届出(雇用開始から10日以内)
┗労働保険概算保険料申告書の提出と納付', '従業員ありの場合は確実に提出。
役員のみの場合でも業種（建設業などの危険業種）によって提出が必要な場合あり', 15);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-MISC', 'init_new_corporate', '給与計算をして支給額を通達する', NULL, NULL, '給与計算', NULL, NULL, 16);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-002', 'init_new_corporate', '源泉徴収が給与以外にあったかを確認', 25, 30, '源泉徴収の申告', NULL, '源泉所得税納期の特例が初月は間に合わないことが多いため、1ヶ月分だけ納税する', 17);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-MISC', 'init_new_corporate', '源泉徴収の納税額のお知らせ→納税依頼', NULL, NULL, NULL, NULL, NULL, 18);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-003', 'init_new_corporate', '国税ダイレクト方式電子納税依頼書兼国税ダイレクト方式電子納税届出書の提出依頼', 30, 40, '国税ダイレクト方式電子納税依頼書兼国税ダイレクト方式電子納税届出書の提出', NULL, '法人の場合銀行から届出印をもらわないといけないため時間を要する', 19);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-MISC', 'init_new_corporate', '国税ダイレクト方式電子納税依頼書兼国税ダイレクト方式電子納税届出書の提出完了の連絡', NULL, NULL, NULL, NULL, NULL, 20);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'init_existing_corporate', '顧問契約・資料提出スケジュール設定', 1, 5, NULL, NULL, NULL, 21);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'init_existing_corporate', '適格請求書発行事業者の登録（インボイスの届出）済みかどうかの確認', 1, 5, NULL, NULL, NULL, 22);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'init_existing_corporate', '労務サポート要否の確認', 1, 5, NULL, NULL, NULL, 23);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'init_existing_corporate', '登記事項証明書（履歴事項全部証明書）', 1, 5, NULL, NULL, NULL, 24);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'init_existing_corporate', '定款の写し', 1, 5, NULL, NULL, NULL, 25);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'init_existing_corporate', '出資者名簿があるかどうかの確認', 1, 5, NULL, NULL, NULL, 26);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'init_existing_corporate', '社内規定の共有をしてもらう', 1, 5, NULL, NULL, NULL, 27);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'init_existing_corporate', '法人設立届出書控え提出してもらう', 1, 5, NULL, NULL, NULL, 28);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'init_existing_corporate', '給与支払事務所等の開設届出書控え提出してもらう', 1, 5, NULL, NULL, NULL, 29);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'init_existing_corporate', '源泉所得税の納期の特例の承認申請書（該当時）控え提出してもらう', 1, 5, NULL, NULL, NULL, 30);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'init_existing_corporate', '前期および前々期の決算書・申告書一式控え提出してもらう', 1, 5, NULL, NULL, NULL, 31);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'init_existing_corporate', '消費税の課税・免税の届出（簡易課税適用届など含む）控え提出してもらう', 1, 5, NULL, NULL, NULL, 32);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'init_existing_corporate', 'ダイレクト納税登録済みか否かの確認', 1, 5, NULL, NULL, NULL, 33);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-002', 'init_existing_corporate', '国税ダイレクト方式電子納税依頼書兼国税ダイレクト方式電子納税届出書の提出依頼', 30, 40, '国税ダイレクト方式電子納税依頼書兼国税ダイレクト方式電子納税届出書の提出', NULL, '法人の場合銀行から届出印をもらわないといけないため時間を要する', 34);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', 'init_individual', '顧問契約・資料提出スケジュール設定', 1, 5, NULL, NULL, NULL, 35);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', 'init_individual', '適格請求書発行事業者の登録（インボイスの届出）済みかどうかの確認', 1, 5, NULL, NULL, NULL, 36);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', 'init_individual', '労務サポート要否の確認', 1, 5, NULL, NULL, NULL, 37);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', 'init_individual', '社内規定の共有をしてもらう', 1, 5, NULL, NULL, NULL, 38);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', 'init_individual', '青色申告承認申請署控え提出してもらう', 1, 5, NULL, NULL, NULL, 39);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', 'init_individual', '給与支払事務所等の開設届出書控え提出してもらう', 1, 5, NULL, NULL, NULL, 40);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', 'init_individual', '源泉所得税の納期の特例の承認申請書（該当時）控え提出してもらう', 1, 5, NULL, NULL, NULL, 41);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', 'init_individual', '前期および前々期の確定申告申告書一式控え提出してもらう', 1, 5, NULL, NULL, NULL, 42);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', 'init_individual', '消費税の課税・免税の届出（簡易課税適用届など含む）控え提出してもらう', 1, 5, NULL, NULL, NULL, 43);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', 'init_individual', 'ダイレクト納税登録済みか否かの確認', 1, 5, NULL, NULL, NULL, 44);
INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', 'init_individual', '国税ダイレクト方式電子納税依頼書兼国税ダイレクト方式電子納税届出書の提出依頼', 30, 40, '国税ダイレクト方式電子納税依頼書兼国税ダイレクト方式電子納税届出書の提出', NULL, '法人の場合銀行から届出印をもらわないといけないため時間を要する', 45);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-001', 'monthly', '6月分証憑提出依頼・回収', 7, 46);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-002', 'monthly', '7月分証憑提出依頼・回収', 8, 47);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-003', 'monthly', '8月分証憑提出依頼・回収', 9, 48);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-004', 'monthly', '9月分証憑提出依頼・回収', 10, 49);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-005', 'monthly', '10月分証憑提出依頼・回収', 11, 50);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-006', 'monthly', '11月分証憑提出依頼・回収', 12, 51);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-007', 'monthly', '12月分証憑提出依頼・回収', 1, 52);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-008', 'monthly', '1月分証憑提出依頼・回収', 2, 53);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-009', 'monthly', '2月分証憑提出依頼・回収', 3, 54);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-010', 'monthly', '3月分証憑提出依頼・回収', 4, 55);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-011', 'monthly', '4月分証憑提出依頼・回収', 5, 56);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-012', 'monthly', '6月以降住民税額一覧表回収', 5, 57);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-001', 'annual', '一回、半期分の資料を回収', 8, NULL, 58);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-002', 'annual', '代表：小規模企業共済の案内', 9, NULL, 59);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-003', 'annual', '労務：標準報酬月額の変更案内', 9, '労務なので送るかケンさんに相談', 60);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-004', 'annual', '四半期レビュー（7〜9月試算・前年比較）', 10, NULL, 61);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-005', 'annual', '銀行格付けシミュレーション', 10, NULL, 62);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-006', 'annual', '代表：ふるさと納税の案内', 10, NULL, 63);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-007', 'annual', '法定調書情報の確認（業務委託・印税等）', 11, NULL, 64);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-008', 'annual', '償却資産税申告用資料の回収', 11, NULL, 65);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-009', 'annual', '年末調整の資料回収（保険料控除証明書/扶養状況の異動有無）', 12, NULL, 66);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-010', 'annual', '節税施策の確認・アドバイス', 12, NULL, 67);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-011', 'annual', '代表：確定申告要否の判断', 12, NULL, 68);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-012', 'annual', '倒産防止共済の手続き', 12, NULL, 69);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-013', 'annual', '下半期源泉所得税の確認', 12, NULL, 70);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-014', 'annual', '固定資産・棚卸・引当金の整理', 1, NULL, 71);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-015', 'annual', '5〜12月累計レポート作成', 1, NULL, 72);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-016', 'annual', '決算対策MTG（納税予測・節税）', 1, NULL, 73);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-017', 'annual', '仮決算・決算仕訳候補の整理', 2, NULL, 74);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-018', 'annual', '決算直前レビュー・利益着地シミュレーション', 3, NULL, 75);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-019', 'annual', '決算仕訳準備（減価償却・未払等）', 4, NULL, 76);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-020', 'annual', '決算試算表作成・速報提出', 4, NULL, 77);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-021', 'annual', '消費税原則課税・簡易課税の有利不利判定（設備投資ヒアリング）', 5, 'ZOOMで決算時に聞く', 78);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-022', 'annual', '税務申告書作成・納税・電子申告', 5, NULL, 79);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-023', 'annual', '次年度方針共有', 5, NULL, 80);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-024', 'annual', '上半期源泉所得税の確認', 5, NULL, 81);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-025', 'annual', '算定基礎届のお知らせ', 5, '労務なので送るかケンさんに相談', 82);
INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-026', 'annual', '事前確定届出賞与、旅費規定、役員構成の確認', 6, NULL, 83);

-- ============================
-- message_templates (47 messages from Excel)
-- ============================
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', 'send_notice', '顧問契約・資料提出スケジュール設定', '📩【顧問契約の御礼とご提出・ご確認のお願い】

〇〇様
このたびは顧問契約を締結いただき、誠にありがとうございます。
今後ともどうぞよろしくお願いいたします！

スムーズに業務を進めるため、下記の書類のご提出および確認事項について、
お手すきのタイミングでご対応をお願いいたします🙇‍♀️

🔽【ご提出いただきたい書類】
1️⃣ 個人事業時代の確定申告書（直近2期分）
2️⃣ 個人事業時代の借入金の返済予定表（該当がある場合）
3️⃣ 登記事項証明書（履歴事項全部証明書）
4️⃣ 定款の写し
5️⃣ 出資者名簿の有無（ある場合は写しのご提出）

🔽【ご確認いただきたい内容】
✅ 適格請求書発行事業者（インボイス）登録の要否
✅ 労務サポート（社会保険手続き等）のご希望有無
✅ 役員報酬の金額（毎月の支給額）

📅 書類の提出期限や初回MTG日程についても、別途スケジュール調整のご連絡をさせていただきます。
何かご不明点などあれば、いつでもお気軽にご連絡ください😊', 'https://docs.google.com/forms/d/e/1FAIpQLSd-iBt42htUhIUeGTJbUaIkeBplGAqFz5PKwugvm6FW3P09VA/viewform', 'ご提出期限：5月9日（金）');
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', 'overdue_notice', '顧問契約・資料提出スケジュール設定', '顧問契約・資料提出スケジュール設定をいただく期限が過ぎております。
お忙しい中恐れ入りますが下記よりご提出をお願いいたします。', 'https://docs.google.com/forms/d/e/1FAIpQLSd-iBt42htUhIUeGTJbUaIkeBplGAqFz5PKwugvm6FW3P09VA/viewform', 'ご提出期限：5月9日（金）');
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'overdue_notice', '顧問契約・資料提出スケジュール設定', '顧問契約・資料提出スケジュール設定をいただく期限が過ぎております。
お忙しい中恐れ入りますが下記よりご提出をお願いいたします。', 'https://docs.google.com/forms/d/e/1FAIpQLSfruK47HtqD7O_HgPSeBm6cx4UBjPLjS3prZXafuGG28i9tgA/viewform', 'ご提出期限：5月9日（金）');
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-002', 'send_notice', '源泉徴収が給与以外にあったかを確認', '📩【源泉所得税（毎月納付）のご案内】
現在、「納期の特例」（年2回納付）の申請中ですが、
適用が開始されるまでの1〜2ヶ月間は、源泉所得税を毎月納付する必要があります。

🔽【ご確認事項】
✔ 毎月納付が必要なのは、適用開始前の給与・報酬分
✔ 初回の源泉徴収対象月（例：4月）分から順に対象
✔ 単月分の源泉徴収額の概算を知りたい場合は、
　給与・報酬明細などをお送りいただければこちらで計算いたします😊

納付漏れを防ぐためにも、
対象月の支給内容がわかる資料をご共有いただけますと幸いです！

ご不明点があれば、お気軽にご連絡ください。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-003', 'send_notice', '国税ダイレクト方式電子納税依頼書兼国税ダイレクト方式電子納税届出書の提出依頼', '📩【電子納税（国税ダイレクト方式）届出書のご提出のお願い】

今後の法人税・消費税・源泉所得税などの電子納税をスムーズに行うために、
「国税ダイレクト方式電子納税依頼書兼届出書」の提出をお願いしております。

📎【目的】
税務署からの納付依頼に基づき、指定の口座から自動で引き落としができるようにするための手続きです。
納付書の手書きや窓口納付が不要になり、納税業務が大幅に効率化されます。

🔽【ご対応の流れ】

1️⃣ 当方より様式をお送りします（PDF ）
2️⃣ 届出書にご署名・ご捺印（金融機関届出印）をお願いします
3️⃣ 取引のある銀行（下記参照）へ直接ご提出いただきます

🏦【対応可能な主な金融機関】（※2025年7月時点）
・みずほ銀行
・三井住友銀行
・三菱UFJ銀行
・りそな銀行／埼玉りそな銀行
・ゆうちょ銀行（振替口座方式）
・地方銀行／信用金庫（要確認）

💡銀行によっては、店頭受付時に印鑑照合や本人確認書類が必要になることがあります。
不明な点があれば、こちらでもお調べします！

📮 ご提出後、税務署との連携が完了するまでに1〜2ヶ月ほどかかりますので、
お早めのご対応をお願いいたします🙇‍♀️

何かご不明点があれば、いつでもご連絡ください！', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'send_notice', NULL, '📩【顧問契約の御礼と初期確認・資料提出のお願い】

〇〇様
このたびは顧問契約をいただき、誠にありがとうございます。
今後のご支援を円滑に進めていくため、以下の項目についてご提出・ご確認をお願いいたします☺️

🔽【ご提出いただきたい資料】
1️⃣ 登記事項証明書（履歴事項全部証明書）
2️⃣ 定款の写し
3️⃣ 出資者名簿（※作成されている場合）
4️⃣ 法人設立届出書の控え
5️⃣ 給与支払事務所等の開設届出書の控え
6️⃣ 源泉所得税の納期の特例の承認申請書の控え（該当の場合）
7️⃣ 前期および前々期の決算書・申告書一式
8️⃣ 消費税関連の届出書（課税／免税の届出、簡易課税適用届など）
9️⃣ 社内規定（旅費規程、就業規則、役員報酬規程等／あれば）

※PDF・写真など形式は問いません。

🔽【ご確認・ご回答いただきたい項目】
✅ 顧問開始日・資料提出スケジュールの調整
✅ 適格請求書発行事業者（インボイス）として登録済かどうか
✅ 労務サポート（社会保険・給与計算等）のご希望有無
✅ ダイレクト納税（国税の自動引落方式）の登録有無

資料が揃い次第、業務スケジュールや初回打ち合わせ日程をご案内いたします。
ご不明点があれば、お気軽にご連絡ください😊', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-002', 'send_notice', '国税ダイレクト方式電子納税依頼書兼国税ダイレクト方式電子納税届出書の提出依頼', '"📩【電子納税（国税ダイレクト方式）届出書のご提出のお願い】

今後の法人税・消費税・源泉所得税などの電子納税をスムーズに行うために、
「国税ダイレクト方式電子納税依頼書兼届出書」の提出をお願いしております。

📎【目的】
税務署からの納付依頼に基づき、指定の口座から自動で引き落としができるようにするための手続きです。
納付書の手書きや窓口納付が不要になり、納税業務が大幅に効率化されます。

🔽【ご対応の流れ】

1️⃣ 当方より様式をお送りします（PDF ）
2️⃣ 届出書にご署名・ご捺印（金融機関届出印）をお願いします
3️⃣ 取引のある銀行（下記参照）へ直接ご提出いただきます

🏦【対応可能な主な金融機関】（※2025年7月時点）
・みずほ銀行
・三井住友銀行
・三菱UFJ銀行
・りそな銀行／埼玉りそな銀行
・ゆうちょ銀行（振替口座方式）
・地方銀行／信用金庫（要確認）

💡銀行によっては、店頭受付時に印鑑照合や本人確認書類が必要になることがあります。
不明な点があれば、こちらでもお調べします！

📮 ご提出後、税務署との連携が完了するまでに1〜2ヶ月ほどかかりますので、
お早めのご対応をお願いいたします🙇‍♀️

何かご不明点があれば、いつでもご連絡ください！"', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', 'send_notice', NULL, '📩【顧問契約の御礼と初期資料のご提出・ご確認のお願い】

〇〇様
このたびは顧問契約をいただき、誠にありがとうございます。
今後のサポートを円滑に進めるため、下記のご提出・ご確認事項へのご対応をお願いいたします☺️

🔽【ご提出いただきたい資料】
1️⃣ 青色申告承認申請書の控え（提出済の場合）
2️⃣ 給与支払事務所等の開設届出書の控え（従業員・外注へ支払いがある場合）
3️⃣ 源泉所得税の納期の特例の承認申請書の控え（提出済の方のみ）
4️⃣ 前期および前々期の確定申告書一式（控え・収支内訳書含む）
5️⃣ 消費税に関する届出書の控え
（課税・免税の届出、簡易課税適用届など、提出済のものすべて）
6️⃣ 社内規定（旅費規程・報酬ルールなど）※ある場合
7️⃣ 国税ダイレクト方式電子納税依頼書兼届出書のご提出
（PDFをお送りしますので、捺印のうえ金融機関へご提出をお願いします）

🔽【ご確認いただきたい内容】
✅ 適格請求書発行事業者（インボイス）としての登録済／未登録のご確認
✅ 労務サポート（社会保険・給与計算など）のご希望有無
✅ ダイレクト納税（自動引落方式）登録済かどうか', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-001', 'send_notice', '6月分証憑提出依頼・回収', '領収書などの提出をいただくタイミングとなりました。
お忙しい中恐れ入りますが下記よりご提出をお願いいたします。', 'https://docs.google.com/forms/d/e/1FAIpQLScqoGy_9loPbJX9Wsm9zMWEi7L2xwxzobKGG5i68sbCXZY_Ow/viewform', 'ご提出期限：5月9日（金）');
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-002', 'send_notice', '7月分証憑提出依頼・回収', '領収書などの提出をいただくタイミングとなりました。
お忙しい中恐れ入りますが下記よりご提出をお願いいたします。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-003', 'send_notice', '8月分証憑提出依頼・回収', '領収書などの提出をいただくタイミングとなりました。
お忙しい中恐れ入りますが下記よりご提出をお願いいたします。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-004', 'send_notice', '9月分証憑提出依頼・回収', '領収書などの提出をいただくタイミングとなりました。
お忙しい中恐れ入りますが下記よりご提出をお願いいたします。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-005', 'send_notice', '10月分証憑提出依頼・回収', '領収書などの提出をいただくタイミングとなりました。
お忙しい中恐れ入りますが下記よりご提出をお願いいたします。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-006', 'send_notice', '11月分証憑提出依頼・回収', '領収書などの提出をいただくタイミングとなりました。
お忙しい中恐れ入りますが下記よりご提出をお願いいたします。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-007', 'send_notice', '12月分証憑提出依頼・回収', '領収書などの提出をいただくタイミングとなりました。
お忙しい中恐れ入りますが下記よりご提出をお願いいたします。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-008', 'send_notice', '1月分証憑提出依頼・回収', '領収書などの提出をいただくタイミングとなりました。
お忙しい中恐れ入りますが下記よりご提出をお願いいたします。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-009', 'send_notice', '2月分証憑提出依頼・回収', '領収書などの提出をいただくタイミングとなりました。
お忙しい中恐れ入りますが下記よりご提出をお願いいたします。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-010', 'send_notice', '3月分証憑提出依頼・回収', '領収書などの提出をいただくタイミングとなりました。
お忙しい中恐れ入りますが下記よりご提出をお願いいたします。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-011', 'send_notice', '4月分証憑提出依頼・回収', '領収書などの提出をいただくタイミングとなりました。
お忙しい中恐れ入りますが下記よりご提出をお願いいたします。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-012', 'send_notice', '6月以降住民税額一覧表回収', '領収書などの提出をいただくタイミングとなりました。
お忙しい中恐れ入りますが下記よりご提出をお願いいたします。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-001', 'send_notice', '一回、半期分の資料を回収', '1月〜6月分の資料回収の時期となりました。
お手数ですが、通帳コピー・請求書・領収書・現金出納帳など、
いつもの形式でご提出をお願いいたします。
ご不明点があればお気軽にご連絡ください！', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-002', 'send_notice', '代表：小規模企業共済の案内', '📣【節税にも活用◎ 小規模企業共済】
代表者さま向けに「小規模企業共済」の加入案内です。
今年の節税対策としてご検討中の方は、お気軽にご相談ください！
※すでに加入済みの方も、掛金の増額など確認しておくと安心です。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-003', 'send_notice', '労務：標準報酬月額の変更案内', '📢【9月からの社会保険料変更について】
4〜6月の給与をもとに、標準報酬月額が見直され、
9月支給分の給与から社会保険料が変更となります。
給与の支給額が変わりますのでご注意ください。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-004', 'send_notice', '四半期レビュー（7〜9月試算・前年比較）', '📊【7〜9月の業績レビュー】
7〜9月の試算表がまとまりました！
前年比との比較や、今後の見通しについて一度ご報告させていただければと思います。
MTGのご希望日時などございましたらご連絡ください。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-005', 'send_notice', '銀行格付けシミュレーション', '⑤ 銀行格付けシミュレーション
🏦【金融機関向けシミュレーション】
最新試算ベースで、銀行格付けのシミュレーションをご用意しています。
今後の融資対策や金利交渉の材料としてお役立ていただけます。
ご希望の方はご一報ください！', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-006', 'send_notice', '代表：ふるさと納税の案内', '🎁【ふるさと納税のご案内】
年末に向けて「ふるさと納税」のタイミングです！
控除上限の目安金額を知りたい方は、試算も可能です。
希望者はお気軽にご連絡ください♪', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-007', 'send_notice', '法定調書情報の確認（業務委託・印税等）', '📄【法定調書作成のための確認】

業務委託費や印税などのお支払いがある場合、
1月提出の法定調書作成のため、以下の情報をご確認・ご提供ください。

🔽対象となるケース（いずれか該当）
・業務委託（外注費）を年間5万円以上支払った
・講演料や原稿料、印税などを支払った
・士業・コンサルなどに報酬を支払った
・不動産の賃借料を支払っている（地代家賃）
・税理士報酬など源泉徴収対象の支払いがある

🔽ご提供いただきたい情報（該当者ごとにわかる範囲で）
・氏名／法人名
・住所
・マイナンバー or 法人番号
・支払金額（合計）
・源泉徴収税額（ある場合）

対象となるお取引先がある場合は、1月上旬までに情報をご共有ください。
ご不明点はお気軽にご相談ください！', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-008', 'send_notice', '償却資産税申告用資料の回収', '🏢【償却資産税申告に関するご案内】

1月に提出が必要な「償却資産税申告」に向けて、
償却資産の情報提供をお願いしております。

🔽【ご提出いただきたい内容】
📌2024年中に購入された「10万円以上の設備・備品」
（※一括償却資産・リース資産は対象外です）

▼主な対象例
・エアコン、冷蔵庫、厨房機器
・パソコン、複合機、カメラ
・看板、什器、棚、製造機械など

💡目安：取得価格10万円以上、耐用年数1年以上のもの

以下の情報をご共有ください👇
・資産名（例：業務用冷蔵庫）
・購入日
・取得金額（税込でOK）
・設置場所（原則：事務所や店舗の所在地）

ご不明な点や「これって対象？」というものがあれば、写真やレシートをお送りいただければこちらで確認いたします😊
どうぞよろしくお願いいたします！', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-009', 'send_notice', '年末調整の資料回収（保険料控除証明書/扶養状況の異動有無）', '📥【年末調整のご案内】
年末調整の資料ご提出をお願いします。
・保険料控除証明書
・扶養状況の変更有無（結婚・出産・就職など）
ご不明点があればいつでもご相談ください！', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-010', 'send_notice', '節税施策の確認・アドバイス', '💡【今年の節税、打てる手は？】
年内に間に合う節税施策について、個別にご提案しております。
ご希望の方はオンライン相談・チャット等でお気軽にどうぞ！', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-011', 'send_notice', '代表：確定申告要否の判断', '📝【確定申告が必要かどうかのご確認】

年が明ける前に、確定申告が必要かどうかのご確認をお願いいたします。

🔽【以下に該当する場合、申告が必要な可能性があります】

✔ 副業収入・雑所得が年間20万円超ある（給与以外）
✔ 2ヶ所以上から給与をもらっている
✔ 年収が2,000万円を超える
✔ 医療費控除や住宅ローン控除を受けたい
✔ 株や仮想通貨などで売却益が出た
✔ 不動産収入がある
✔ ふるさと納税をしてワンストップ特例を使わない場合
✔ 年末調整をしていない or 控除漏れがある

上記に該当しそうな場合や、判断がつきにくい場合は
お気軽にチャット・LINEでご相談ください😊
こちらで確認のお手伝いをさせていただきます！', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-012', 'send_notice', '倒産防止共済の手続き', '🔒【倒産防止共済（経営セーフティ共済）のご案内】

決算前の節税対策として、
「倒産防止共済（経営セーフティ共済）」の加入をご検討中の方へご案内です。

📌主なメリット
✅ 掛金が全額経費計上OK（上限：年240万円）
✅ 解約時は退職金や設備投資などにも活用可能
✅ 万が一の取引先倒産時に、最大8,000万円の貸付制度あり
✅ 掛金は40ヶ月以上で全額返戻（元本割れなし）

💰節税インパクトの例（法人の場合）
掛金：月20万円 × 12ヶ月 = 年240万円
→ 利益が240万円圧縮され、
→ 実効税率30%として約72万円の節税効果！

📎【加入条件】
・法人 or 個人事業主であること
・継続的な取引先があること（1社でもOK）
・税金滞納中でないこと

📅 決算期の前に手続きを行うことで、今期の経費にできます。
ご興味がある方は、加入時期や金額のご相談も承っておりますので、
お気軽にご連絡ください！', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-013', 'send_notice', '下半期源泉所得税の確認', '💰【源泉所得税の確認とご準備のお願い】

1月20日）は、
源泉所得税の納付期限となっております（納期の特例適用の場合）。

下記の情報をご確認のうえ、ご提供をお願いいたします！

🔽【必要資料・情報】
✔️ 7月〜12月の給与支給明細
✔️ 税理士・外注・講師などへの報酬支払履歴（源泉対象の方）

資料が揃い次第、お早めのご提出をお願いいたします！

ご不明な点があれば、お気軽にご連絡ください。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-014', 'send_notice', '固定資産・棚卸・引当金の整理', '📊【決算準備：固定資産・棚卸・引当金の整理のお願い】

決算に向けて、以下の項目について事前整理をお願いしております。
該当がある場合は、資料や情報をご提供いただけますと助かります！

🔽【ご確認いただきたい内容】

🏢固定資産
・新しく購入／廃棄／売却した設備や備品の有無
・リースやレンタルへの変更など
→ 資産台帳と照合・更新します

📦棚卸資産（在庫）
・期末時点の在庫金額と数量の一覧
・商品、原材料、仕掛品、製品などの区分がある場合は区別して

💰引当金の設定（必要な場合）
・貸倒引当金（回収の見込みがない売掛先など）
・賞与引当金（期末時点で支給予定の賞与）
・退職給付引当金（社内規定がある場合）

ご不明な点や「これって対象？」という場合は、お気軽にご相談ください😊
必要に応じてこちらでチェックリストもご用意できます！', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-015', 'send_notice', '5〜12月累計レポート作成', '📊【5〜12月の累計レポート作成について】

年末に向けて、5月〜12月分の累計レポート（売上・経費・利益等）を作成予定です。
経営の見直しや納税予測、節税対策の判断材料としてご活用いただけます。

🔽【レポートに含まれる内容（予定）】
・月別の売上・経費・利益推移
・前年比較（ある場合）
・5〜12月累計の損益状況
・今期着地見込みの予測（希望者のみ）

📎 試算のもとになる帳簿や未提出資料がある場合は、
お手数ですが1月10までにご提出をお願いいたします。

資料が揃い次第、順次作成しご報告させていただきます😊', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-016', 'send_notice', '決算対策MTG（納税予測・節税）', '📅【決算対策MTGのご案内】
決算が近づいてまいりましたので、
納税予測・節税のご提案を含めた“決算対策ミーティング”を実施いたします。

🔽【MTGでご確認させていただく内容】
・今期の着地見込みと納税額のシミュレーション
・節税施策のご提案（設備投資／共済／賞与など）
・キャッシュフローの確認と資金繰り対策
・翌期への繰越利益の考え方と対策

📎 ご希望の日時がありましたら、候補を3つほどご連絡ください。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-017', 'send_notice', '仮決算・決算仕訳候補の整理', '📄【仮決算・決算仕訳の整理について】

決算に向けて、仮決算データと決算仕訳候補の整理を進めております。
着地見込みや節税方針のすり合わせのため、
以下の内容についてご確認・ご共有をお願いする場合がございます。

🔽【確認・整理が必要な主な仕訳項目】
・減価償却費（新規資産／償却漏れの確認）
・未払費用（地代家賃・水道光熱費・外注費など）
・未収収益（受取予定の売上や報酬）
・棚卸資産の計上（在庫金額の把握）
・引当金（貸倒・賞与・退職給付など）
・法人税等の仮計上（納税予測に基づく）

上記の内容で追加資料がございましたらお送りください。
確認事項が出た際は順次ご連絡させていただきますので、どうぞよろしくお願いいたします😊', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-018', 'send_notice', '決算直前レビュー・利益着地シミュレーション', '📊【決算直前レビュー・利益着地シミュレーションのご案内】

決算月が近づいてきましたので、
直前レビューと利益着地のシミュレーションをご案内いたします。

🔽【ご確認いただける内容】
・現時点の利益（仮）と予想納税額
・節税施策を反映させた「利益の着地」調整案
・役員報酬・賞与・共済など活用の有無
・利益繰越／借入の影響／税務上の判断ポイント

💡 決算直前のタイミングで、
「今期利益をどう着地させるか？」を明確にしておくことで、
納税額・財務内容・銀行評価に大きな差が出ます。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-019', 'send_notice', '決算仕訳準備（減価償却・未払等）', '📄【決算仕訳のご準備について】
決算に向けて、各種決算仕訳の準備を進めてまいります。
以下の内容について、該当するものがあればご確認・ご連絡をお願いいたします。

🔽【仕訳の主な対象項目】

🏢 減価償却費
・新規取得資産の有無（10万円以上の備品や設備）
・廃棄・売却した資産のご報告

💰 未払費用（決算日時点で発生済／未支払のもの）
・水道光熱費・地代家賃・外注費・広告費など
・給与・賞与・税理士報酬・役員報酬などの未払分

📦 未収収益・前受金
・決算日前に発生したが請求が未済の売上など

これらの仕訳が正確に入ることで、
納税額や利益計上が適切になります😊

ご不明点があれば、お気軽にご連絡ください！', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-020', 'send_notice', '決算試算表作成・速報提出', '📊【決算試算表の作成・速報提出について】

現在、決算に向けた試算表の速報版を作成しております。
速報値をもとに、今期の利益・納税額・節税余地などを早めに把握していただくことで、
適切な経営判断がしやすくなります。

🔽【速報試算表でご確認いただける内容】
・今期の利益見込み
・仮決算ベースでの納税予測
・節税施策の残り対応可能期間の把握
・財務状況と着地予測（銀行評価にも有効）

実態と大きく相違している点がないか、一度ご確認をお願いします。', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-021', 'send_notice', '消費税原則課税・簡易課税の有利不利判定（設備投資ヒアリング）', '💡【消費税の課税方式 有利不利判定のご案内】
来期の消費税の課税方式（原則課税 or 簡易課税）について、
変更届の提出期限が近づいております（原則：事業年度開始の前日まで）。

🔽【こんな方は、要チェック！】
✅ 設備投資を予定している（100万円以上など）
✅ 課税売上が増えてきた
✅ 原則課税 or 簡易課税、どちらが得か気になっている
✅ 最近インボイス制度に登録した（免税事業者→課税）

📎 有利不利の判定には、下記の情報が必要です👇
・今期および翌期の売上見込み
・課税／非課税の割合
・仕入や経費にかかる消費税額（特に設備投資）
・設備投資の予定（品目・金額・時期）

ご希望の方にはシミュレーションをお送りしますので、
設備投資などのご予定があれば、お早めにご連絡ください😊', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-022', 'send_notice', '税務申告書作成・納税・電子申告', '📨【税務申告書の作成・電子申告完了のご報告】
〇〇年度分の法人税・消費税の申告書の作成が完了し、電子申告が無事完了いたしました。
このあとは、納税のお手続きをお願いいたします。

💰【納税方法のご案内】

納付方法は、以下のいずれかからお選びいただけます👇

① インターネットバンキングで納付（ダイレクト納付）
・事前に届出をされている場合、税務署側から自動で引き落としがされます（〇月〇日）
・届出済か不明な方はお知らせください

② e-TaxでQRコード納付（Pay-easy）
・会計事務所側でQRコードを発行可能です
・金融機関アプリなどから簡単に納付できます
→ ご希望の方は「QRコード希望」とお伝えください！

③ 金融機関・税務署での窓口納付
・PDFで納付書をお渡ししますので、印刷してお近くの金融機関でご納付ください
・税務署でも納付可能です

④ コンビニ納付（30万円以下）
・ご希望の方には、バーコード付き納付書を郵送 or データ送付いたします

納付期限：〇月〇日（〇曜日）

ご不明な点や納付方法に関するご希望がありましたら、
お気軽にご連絡ください😊', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-023', 'send_notice', '次年度方針共有', '📅【次年度の経営方針・計画のご共有のお願い】
決算対応と並行して、次年度の経営方針や目標、予算感などの共有をお願いしております。

今後の試算表・経営アドバイスの精度向上にもつながりますので、
可能な範囲で下記の内容をご共有いただけますと助かります😊

🔽【お伺いしたい項目（任意）】
✔ 来期の売上・利益の目標（ざっくりでOK）
✔ 主な投資・設備購入の予定
✔ 雇用予定（人件費や報酬の増減）
✔ 新サービスや撤退予定など事業方針の変化
✔ 借入・資金繰りの見直し予定など

ざっくりとした方向性でも構いません！
MTGでのやりとりも可能ですので、お気軽にご連絡ください😊', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-024', 'send_notice', '上半期源泉所得税の確認', '💰【上半期（1〜6月分）源泉所得税のご確認】

7月10日は、源泉所得税（1月〜6月分）納期の特例分の納付期限となっております。
つきましては、下記の内容をご確認・ご共有ください。

🔽【ご提出・ご確認いただきたい内容】

✔ 1月〜6月分の給与・賞与の支給明細
✔ 源泉徴収対象の報酬・外注費の支払明細（士業・講師など）
✔ 支給日・支給額・源泉徴収額の内訳
✔ 人数の増減（新規雇用・退職者）

💡こちらで集計し、納付額を計算のうえご案内いたします。
資料のご提出はお早めにお願いいたします😊

ご不明な点があれば、お気軽にご相談ください！', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-025', 'send_notice', '算定基礎届のお知らせ', '📩【算定基礎届のお知らせ】
6月下旬〜7月上旬にかけて、
年金事務所から「算定基礎届」に関するご案内が郵送で届きます📬

🏢 届いた封筒の中に「提出用紙」や「お知らせ文」が入っていますので、
お手数ですが、届き次第写真を撮ってLINEで送っていただけますか？

内容を確認のうえ、こちらで手続きサポートいたします😊
ご不明な点があればいつでもご連絡ください！

※この書類は社会保険の標準報酬を決定する重要な手続きになります。お見逃しのないようお願いいたします！', NULL, NULL);
INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-026', 'send_notice', '事前確定届出賞与、旅費規定、役員構成の確認', '📄【各種届出・社内規定等のご確認】

決算や年度更新に向けて、下記の項目についてご確認・ご共有をお願いしております👇
該当するものがありましたら、ご連絡いただけますと幸いです！

🔽【ご確認いただきたい内容】

① 事前確定届出賞与（役員賞与）
・決算後に賞与支給を予定している場合、事前の届出が必要です
・支給日・金額の決定がある場合は、お早めにご連絡ください
※届出がない場合、税務上損金算入できなくなります

② 旅費規程の有無・内容
・役員や従業員への出張手当・交通費精算を行っている場合、規程の整備が必要です
・未整備の場合、必要に応じて雛形をご提供いたします

③ 役員構成の変更有無
・就任・辞任などの変更があった場合は、登記簿上の情報と合わせてご報告ください
・役員報酬の変更がある場合も併せてお知らせください

ご不明な点があれば、LINEでのやり取りやオンラインでのご相談も可能です😊
どうぞよろしくお願いいたします！', NULL, NULL);

-- ============================
-- form_fields (from Excel)
-- ============================
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', '代表者名', 'TEXT', true, NULL, '代表者名を記入してください', 1);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', '登記日', 'PARAGRAPH', true, NULL, '登記簿の日付と合わせてください', 2);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', '決算月', 'DROPDOWN', true, '1月,2月,3月,4月,5月,6月,7月,8月,9月,10月,11月,12月', '決算月を選択してください', 3);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', '添付1', 'FILE', true, NULL, '謄本を入れてください', 4);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', '添付2', 'FILE', true, NULL, '定款を入れてください', 5);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', '添付3', 'FILE', false, NULL, '出資者名簿があれば教えてください', 6);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', '確定申告書', 'FILE', false, NULL, '個人事業時代の確定申告書があれば直近の2期分を送ってください', 7);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', '個人返済予定表', 'FILE', false, NULL, '個人事業時代の借入金で今も返済しているものがあれば返済予定表を添付してください', 8);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', 'e-Tax登録済みか否かの確認', 'DROPDOWN', true, 'はい,いいえ', 'e-Taxに登録済みですか？
※電子申告をしたことがある人は登録済みの可能性が高いので税理士さんがいれば一度伺ってください', 9);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', 'e-Tax登録済みの場合ログイン情報（IDとパスワード)', 'PARAGRAPH', false, NULL, NULL, 10);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', 'eLTAX登録済みか否かの確認', 'DROPDOWN', true, 'はい,いいえ', 'eLTAX登録済みですか？
※電子申告をしたことがある人は登録済みの可能性が高いので税理士さんがいれば一度伺ってください', 11);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-001', 'eLTAX登録済みの場合ログイン情報(IDとパスワード)', 'PARAGRAPH', false, NULL, NULL, 12);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-002', '源泉徴収の確認', 'PARAGRAPH', true, NULL, NULL, 13);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-NEW-003', 'ダイレクト納税', 'FILE', false, NULL, '「国税ダイレクト方式電子納税依頼書兼国税ダイレクト方式電子納税届出書の提出をするため、引き落としをする銀行に捺印をもらった上で書類を添付してください', 14);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', '会社名', 'TEXT', true, NULL, '登記簿上の法人名を入力してください', 15);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', '代表者', 'TEXT', true, NULL, NULL, 16);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', '登記日', 'DATE', true, NULL, '登記簿の日付と合わせてください', 17);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', '決算月', 'DROPDOWN', true, '1月,2月,3月,4月,5月,6月,7月,8月,9月,10月,11月,12月', '決算月を選択してください', 18);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', '添付1', 'FILE', true, NULL, '謄本を入れてください', 19);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', '添付2', 'FILE', true, NULL, '定款を入れてください', 20);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', '添付2', 'FILE', true, NULL, '法人設立届出書', 21);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', '添付3', 'FILE', true, NULL, '青色申告の承認申請書', 22);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', '添付4', 'FILE', true, NULL, '給与支払事務所等の開設届出書', 23);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', '添付5', 'FILE', true, NULL, '源泉所得税の納期の特例の承認申請書（該当時）', 24);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', '添付6', 'FILE', true, NULL, '前期および前々期の決算書・申告書一式', 25);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', '添付7', 'FILE', true, NULL, '消費税の課税・免税の届出控え（簡易課税適用届など含む）', 26);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', '添付8', 'FILE', false, NULL, '社会保険・雇用保険の適用事業所控え', 27);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', '添付9', 'FILE', false, NULL, '労働保険番号通知書', 28);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'インボイス制度登録有無', 'DROPDOWN', true, 'はい,いいえ', 'インボイス制度に登録していますか？', 29);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'インボイス制度登録有無', 'FILE', false, NULL, '適格請求書発行事業者登録通知書の控えを添付してください', 30);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'e-Tax登録済みか否かの確認', 'DROPDOWN', true, 'はい,いいえ', 'e-Taxに登録済みですか？
※電子申告をしたことがある人は登録済みの可能性が高いので税理士さんがいれば一度伺ってください', 31);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'e-Tax登録済みの場合ログイン情報（IDとパスワード)', 'PARAGRAPH', false, NULL, NULL, 32);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'eLTAX登録済みか否かの確認', 'DROPDOWN', true, 'はい,いいえ', 'eLTAX登録済みですか？
※電子申告をしたことがある人は登録済みの可能性が高いので税理士さんがいれば一度伺ってください', 33);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-001', 'eLTAX登録済みの場合ログイン情報(IDとパスワード)', 'PARAGRAPH', false, NULL, NULL, 34);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-EXIST-002', 'ダイレクト納税', 'FILE', false, NULL, '「国税ダイレクト方式電子納税依頼書兼国税ダイレクト方式電子納税届出書の提出をするため、引き落としをする銀行に捺印をもらった上で書類を添付してください', 35);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', '会社名(屋号)', 'TEXT', true, NULL, '屋号を入力してください', 36);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', '代表者', 'TEXT', true, NULL, NULL, 37);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', '開業届控え', 'FILE', true, NULL, '税務署へ提出した開業届の控えをご提出ください', 38);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', '社内規定の共有をしてもらう', 'FILE', false, NULL, '社内規定がございましたらご提出ください', 39);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', '青色申告か白色申告かを教えてください', 'DROPDOWN', true, '青色申告,白色申告', NULL, 40);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', '青色申告承認申請書', 'FILE', false, NULL, '青色申告の場合は青色申告承認申請書の控えを送ってください', 41);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', '給与支払事務所等の開設届出書控え提出してもらう', 'FILE', false, NULL, '給与支払事務所等の開設届出書控えがある場合はご提出ください', 42);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', '源泉所得税の納期の特例の承認申請書（該当時）控え提出してもらう', 'FILE', false, NULL, '源泉所得税の納期の特例の承認申請書控えがある場合はご提出ください', 43);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', '前期および前々期の確定申告申告書一式控え提出してもらう', 'FILE', false, NULL, '前期、前々期の確定申告書控えがある場合はご提出ください', 44);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', '消費税の課税事業者ですか？', 'DROPDOWN', true, 'はい,いいえ', NULL, 45);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', 'インボイス制度登録有無', 'DROPDOWN', true, NULL, 'インボイス制度に登録していますか？', 46);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'INIT-INDIVIDUAL-001', 'インボイス制度登録有無', 'FILE', false, NULL, '適格請求書発行事業者登録通知書の控えを添付してください', 47);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-001', '6月分証憑提出依頼・回収', 'FILE', true, NULL, '6月分の会計データをご提出いただく時期となりました。
レシートや請求書等のデータをご共有ください。', 48);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-002', '7月分証憑提出依頼・回収', 'FILE', true, NULL, '7月分の会計データをご提出いただく時期となりました。
レシートや請求書等のデータをご共有ください。', 49);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-003', '8月分証憑提出依頼・回収', 'FILE', true, NULL, '8月分の会計データをご提出いただく時期となりました。
レシートや請求書等のデータをご共有ください。', 50);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-004', '9月分証憑提出依頼・回収', 'FILE', true, NULL, '9月分の会計データをご提出いただく時期となりました。
レシートや請求書等のデータをご共有ください。', 51);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-005', '10月分証憑提出依頼・回収', 'FILE', true, NULL, '10月分の会計データをご提出いただく時期となりました。
レシートや請求書等のデータをご共有ください。', 52);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-006', '11月分証憑提出依頼・回収', 'FILE', true, NULL, '11月分の会計データをご提出いただく時期となりました。
レシートや請求書等のデータをご共有ください。', 53);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-007', '12月分証憑提出依頼・回収', 'FILE', true, NULL, '12月分の会計データをご提出いただく時期となりました。
レシートや請求書等のデータをご共有ください。', 54);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-008', '1月分証憑提出依頼・回収', 'FILE', true, NULL, '1月分の会計データをご提出いただく時期となりました。
レシートや請求書等のデータをご共有ください。', 55);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-009', '2月分証憑提出依頼・回収', 'FILE', true, NULL, '2月分の会計データをご提出いただく時期となりました。
レシートや請求書等のデータをご共有ください。', 56);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-010', '3月分証憑提出依頼・回収', 'FILE', true, NULL, '3月分の会計データをご提出いただく時期となりました。
レシートや請求書等のデータをご共有ください。', 57);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-011', '4月分証憑提出依頼・回収', 'FILE', true, NULL, '4月分の会計データをご提出いただく時期となりました。
レシートや請求書等のデータをご共有ください。', 58);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'MONTH-012', '6月以降住民税額一覧表回収', 'FILE', true, NULL, '5月分の会計データをご提出いただく時期となりました。
レシートや請求書等のデータをご共有ください。', 59);
INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'ANNUAL-001', '一回、半期分の資料を回収', 'FILE', false, NULL, NULL, 60);

-- ============================
-- tasks (12 sample tasks)
-- ============================
INSERT INTO tasks (id, office_id, client_id, title, description, category, status, priority, assigned_to, due_date, completed_at) VALUES ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', '3月度月次処理', '3月度の仕訳入力・残高確認', 'monthly', 'in_progress', 'high', '00000000-0000-0000-0000-000000000011', '2026-04-10', NULL);
INSERT INTO tasks (id, office_id, client_id, title, description, category, status, priority, assigned_to, due_date, completed_at) VALUES ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102', '3月決算', '3月期決算書作成', 'annual', 'pending', 'high', '00000000-0000-0000-0000-000000000011', '2026-05-31', NULL);
INSERT INTO tasks (id, office_id, client_id, title, description, category, status, priority, assigned_to, due_date, completed_at) VALUES ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', '法人税申告書作成', '法人税・地方税の申告書作成', 'annual', 'pending', 'high', '00000000-0000-0000-0000-000000000011', '2026-05-31', NULL);
INSERT INTO tasks (id, office_id, client_id, title, description, category, status, priority, assigned_to, due_date, completed_at) VALUES ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000104', '消費税申告', '消費税確定申告書作成', 'annual', 'review', 'medium', '00000000-0000-0000-0000-000000000013', '2026-08-31', NULL);
INSERT INTO tasks (id, office_id, client_id, title, description, category, status, priority, assigned_to, due_date, completed_at) VALUES ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103', '3月度月次処理', '3月度の仕訳入力・残高確認', 'monthly', 'in_progress', 'medium', '00000000-0000-0000-0000-000000000012', '2026-04-10', NULL);
INSERT INTO tasks (id, office_id, client_id, title, description, category, status, priority, assigned_to, due_date, completed_at) VALUES ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000107', '給与計算（3月分）', '3月分給与計算・明細作成', 'monthly', 'completed', 'medium', '00000000-0000-0000-0000-000000000013', '2026-03-25', now());
INSERT INTO tasks (id, office_id, client_id, title, description, category, status, priority, assigned_to, due_date, completed_at) VALUES ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000105', '3月度月次処理', '3月度の仕訳入力・残高確認', 'monthly', 'pending', 'medium', '00000000-0000-0000-0000-000000000012', '2026-04-10', NULL);
INSERT INTO tasks (id, office_id, client_id, title, description, category, status, priority, assigned_to, due_date, completed_at) VALUES ('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000111', '年末調整準備', '年末調整関連書類の提出確認', 'annual', 'completed', 'low', '00000000-0000-0000-0000-000000000011', '2026-01-31', now());
INSERT INTO tasks (id, office_id, client_id, title, description, category, status, priority, assigned_to, due_date, completed_at) VALUES ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000106', '3月度月次処理', '3月度の仕訳入力・残高確認', 'monthly', 'review', 'low', '00000000-0000-0000-0000-000000000011', '2026-04-10', NULL);
INSERT INTO tasks (id, office_id, client_id, title, description, category, status, priority, assigned_to, due_date, completed_at) VALUES ('00000000-0000-0000-0000-000000000210', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103', '決算報告書作成', '3月期決算報告書の作成', 'annual', 'pending', 'high', '00000000-0000-0000-0000-000000000012', '2026-05-31', NULL);
INSERT INTO tasks (id, office_id, client_id, title, description, category, status, priority, assigned_to, due_date, completed_at) VALUES ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000108', '3月度月次処理', '3月度の仕訳入力・残高確認', 'monthly', 'in_progress', 'medium', '00000000-0000-0000-0000-000000000012', '2026-04-10', NULL);
INSERT INTO tasks (id, office_id, client_id, title, description, category, status, priority, assigned_to, due_date, completed_at) VALUES ('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000107', '法人税中間申告', '法人税中間申告書の作成', 'annual', 'pending', 'medium', '00000000-0000-0000-0000-000000000013', '2026-04-30', NULL);

COMMIT;