#!/usr/bin/env python3
"""
TAX PARTNER seed.sql generator
Reads Excel file + existing TS data and generates SQL INSERT statements.
"""
import pandas as pd
import math
import re
import uuid

EXCEL_FILE = '/Users/m/Downloads/使用不可会計サービス業務リストver.2 （記入用）.xlsx'
OUTPUT_FILE = '/private/tmp/tax-partner-mock/supabase/seed.sql'

# Fixed UUIDs for referential integrity
OFFICE_ID = '00000000-0000-0000-0000-000000000001'
STAFF_IDS = {
    '山田太郎': '00000000-0000-0000-0000-000000000011',
    '佐藤花子': '00000000-0000-0000-0000-000000000012',
    '鈴木一郎': '00000000-0000-0000-0000-000000000013',
}

# Client IDs (predictable for task references)
CLIENT_IDS = {}
for i in range(1, 13):
    CLIENT_IDS[str(i)] = f'00000000-0000-0000-0000-0000000001{i:02d}'


def esc(val):
    """Escape single quotes and handle None/NaN"""
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return 'NULL'
    s = str(val).strip()
    if s == '' or s == 'nan' or s == 'NaN':
        return 'NULL'
    s = s.replace("'", "''")
    return f"'{s}'"


def esc_int(val):
    """Convert to int or NULL"""
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return 'NULL'
    try:
        return str(int(val))
    except (ValueError, TypeError):
        return 'NULL'


def esc_bool(val):
    """Convert to boolean or NULL"""
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return 'false'
    if isinstance(val, bool):
        return 'true' if val else 'false'
    v = float(val)
    return 'true' if v == 1.0 else 'false'


def gen_uuid():
    return str(uuid.uuid4())


def generate_offices():
    return f"""-- ============================
-- offices
-- ============================
INSERT INTO offices (id, name, representative, phone, email, address, plan)
VALUES ('{OFFICE_ID}', 'サンプル会計事務所', '山田太郎', '03-1234-5678', 'info@sample-tax.co.jp', '東京都千代田区丸の内1-1-1', 'standard');
"""


def generate_staff():
    lines = ["-- ============================", "-- staff", "-- ============================"]
    staff_data = [
        ('山田太郎', 'yamada@sample-tax.co.jp', 'admin'),
        ('佐藤花子', 'sato@sample-tax.co.jp', 'member'),
        ('鈴木一郎', 'suzuki@sample-tax.co.jp', 'member'),
    ]
    for name, email, role in staff_data:
        sid = STAFF_IDS[name]
        lines.append(
            f"INSERT INTO staff (id, office_id, name, email, role) "
            f"VALUES ('{sid}', '{OFFICE_ID}', '{name}', '{email}', '{role}');"
        )
    return '\n'.join(lines) + '\n'


def generate_clients():
    lines = ["-- ============================", "-- clients (12 sample companies)", "-- ============================"]
    clients = [
        ('1', '株式会社サクラテック', '田中一郎', 'new_corporate', 3, 'freee', 50000, '山田太郎', 'A', 'active', '03-1111-2222', 'tanaka@sakura-tech.co.jp', 'IT・ソフトウェア', '2024-04-01'),
        ('2', '株式会社ヤマダHD', '山田正雄', 'existing_corporate', 3, 'MF', 80000, '山田太郎', 'A', 'active', '03-2222-3333', 'yamada@yamada-hd.co.jp', '不動産', '2023-10-01'),
        ('3', '株式会社マルハシ商事', '丸橋健太', 'existing_corporate', 3, 'freee', 35000, '佐藤花子', 'B', 'active', '03-3333-4444', 'maruhashi@maruhashi.co.jp', '卸売業', '2024-01-15'),
        ('4', '株式会社フジタ建設', '藤田誠', 'existing_corporate', 6, 'yayoi', 60000, '鈴木一郎', 'A', 'active', '048-111-2222', 'fujita@fujita-kensetsu.co.jp', '建設業', '2023-06-01'),
        ('5', '株式会社タナカ物産', '田中裕子', 'new_corporate', 9, 'freee', 30000, '佐藤花子', 'B', 'active', '03-5555-6666', 'info@tanaka-bussan.co.jp', '小売業', '2024-03-01'),
        ('6', '合同会社ミライ', '松岡哲平', 'existing_corporate', 12, 'MF', 25000, '山田太郎', 'C', 'active', '048-222-3333', 'matsuoka@mirai.co.jp', 'ITコンサルティング', '2024-07-01'),
        ('7', '株式会社アオゾラ', '青空太陽', 'existing_corporate', 9, 'freee', 70000, '鈴木一郎', 'A', 'active', '03-7777-8888', 'aozora@aozora.co.jp', '製造業', '2023-04-01'),
        ('8', '医療法人さくら', '桜井美咲', 'existing_corporate', 3, 'MF', 45000, '佐藤花子', 'B', 'active', '03-8888-9999', 'sakurai@sakura-med.or.jp', '医療', '2024-02-01'),
        ('9', '株式会社ナカムラ工業', '中村剛', 'existing_corporate', 12, 'yayoi', 28000, '鈴木一郎', 'C', 'active', '048-333-4444', 'nakamura@nakamura-k.co.jp', '製造業', '2024-05-01'),
        ('10', '株式会社コスモス', '花田和也', 'new_corporate', 6, 'freee', 40000, '山田太郎', 'B', 'active', '03-4444-5555', 'hanada@cosmos.co.jp', '飲食業', '2024-08-01'),
        ('11', '株式会社グローバルIT', '高橋智也', 'existing_corporate', 9, 'freee', 90000, '山田太郎', 'A', 'active', '03-6666-7777', 'takahashi@global-it.co.jp', 'IT・SaaS', '2023-01-01'),
        ('12', '有限会社太陽', '太陽敏彦', 'existing_corporate', 3, 'MF', 20000, '佐藤花子', 'C', 'inactive', '048-555-6666', 'taiyo@taiyo-y.co.jp', 'サービス業', '2022-04-01'),
    ]
    for cid, name, rep, ctype, sm, sw, fee, staff_name, rank, status, phone, email, industry, regdate in clients:
        uid = CLIENT_IDS[cid]
        staff_id = STAFF_IDS[staff_name]
        lines.append(
            f"INSERT INTO clients (id, office_id, name, representative, type, settlement_month, accounting_software, monthly_fee, assigned_staff_id, rank, status, phone, email, industry, registration_date) "
            f"VALUES ('{uid}', '{OFFICE_ID}', '{name}', '{rep}', '{ctype}', {sm}, '{sw}', {fee}, '{staff_id}', '{rank}', '{status}', '{phone}', '{email}', '{industry}', '{regdate}');"
        )
    return '\n'.join(lines) + '\n'


def generate_task_templates():
    lines = ["-- ============================", "-- task_templates (from Excel)", "-- ============================"]

    xls = pd.ExcelFile(EXCEL_FILE)
    sort_counter = 0

    # --- 初回業務（新規法人設立）---
    df = pd.read_excel(EXCEL_FILE, sheet_name='初回業務（新規法人設立）', header=None, skiprows=2)
    for _, row in df.iterrows():
        template_id = row.iloc[0]
        title = row.iloc[1]
        if pd.isna(title) or str(title).strip() == '':
            continue
        if pd.isna(template_id) or str(template_id).strip() == '':
            template_id = 'INIT-NEW-MISC'
        send_day = esc_int(row.iloc[2])
        due_day = esc_int(row.iloc[3])
        office_todo = esc(row.iloc[4])
        labor_todo = esc(row.iloc[5])
        memo = esc(row.iloc[6])
        sort_counter += 1
        lines.append(
            f"INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) "
            f"VALUES ('{OFFICE_ID}', {esc(template_id)}, 'init_new_corporate', {esc(title)}, {send_day}, {due_day}, {office_todo}, {labor_todo}, {memo}, {sort_counter});"
        )

    # --- 初回業務（既存法人）---
    df = pd.read_excel(EXCEL_FILE, sheet_name='初回業務（既存法人）', header=None, skiprows=2)
    for _, row in df.iterrows():
        template_id = row.iloc[0]
        title = row.iloc[1]
        if pd.isna(title) or str(title).strip() == '':
            continue
        if pd.isna(template_id) or str(template_id).strip() == '':
            template_id = 'INIT-EXIST-MISC'
        send_day = esc_int(row.iloc[2])
        due_day = esc_int(row.iloc[3])
        office_todo = esc(row.iloc[4])
        labor_todo = esc(row.iloc[5])
        memo = esc(row.iloc[6])
        sort_counter += 1
        lines.append(
            f"INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) "
            f"VALUES ('{OFFICE_ID}', {esc(template_id)}, 'init_existing_corporate', {esc(title)}, {send_day}, {due_day}, {office_todo}, {labor_todo}, {memo}, {sort_counter});"
        )

    # --- 初回業務（個人事業主）---
    df = pd.read_excel(EXCEL_FILE, sheet_name='初回業務（個人事業主） ', header=None, skiprows=2)
    for _, row in df.iterrows():
        template_id = row.iloc[0]
        title = row.iloc[1]
        if pd.isna(title) or str(title).strip() == '':
            continue
        # Individual sheet uses numbers, normalize to INIT-INDIVIDUAL-XXX
        tid_str = str(template_id).strip() if not pd.isna(template_id) else ''
        if tid_str and tid_str.isdigit():
            tid_str = f'INIT-INDIVIDUAL-{int(tid_str):03d}'
        elif tid_str == '' or tid_str == 'nan':
            tid_str = 'INIT-INDIVIDUAL-MISC'
        send_day = esc_int(row.iloc[2])
        due_day = esc_int(row.iloc[3])
        office_todo = esc(row.iloc[4])
        labor_todo = esc(row.iloc[5])
        memo = esc(row.iloc[6])
        sort_counter += 1
        lines.append(
            f"INSERT INTO task_templates (office_id, template_id, category, title, send_day_offset, due_day_offset, office_todo, labor_todo, memo, sort_order) "
            f"VALUES ('{OFFICE_ID}', {esc(tid_str)}, 'init_individual', {esc(title)}, {send_day}, {due_day}, {office_todo}, {labor_todo}, {memo}, {sort_counter});"
        )

    # --- 月次 ---
    df = pd.read_excel(EXCEL_FILE, sheet_name='月次', header=None, skiprows=2)
    month_map = {'1月': 1, '2月': 2, '3月': 3, '4月': 4, '5月': 5, '6月': 6,
                 '7月': 7, '8月': 8, '9月': 9, '10月': 10, '11月': 11, '12月': 12}
    for _, row in df.iterrows():
        template_id = row.iloc[0]
        title = row.iloc[1]
        if pd.isna(title) or str(title).strip() == '':
            continue
        if pd.isna(template_id) or str(template_id).strip() == '':
            template_id = 'MONTH-MISC'
        exec_month_str = str(row.iloc[2]).strip() if not pd.isna(row.iloc[2]) else ''
        exec_month = month_map.get(exec_month_str, 'NULL')
        sort_counter += 1
        lines.append(
            f"INSERT INTO task_templates (office_id, template_id, category, title, execution_month, sort_order) "
            f"VALUES ('{OFFICE_ID}', {esc(template_id)}, 'monthly', {esc(title)}, {exec_month}, {sort_counter});"
        )

    # --- 年次 ---
    df = pd.read_excel(EXCEL_FILE, sheet_name='年次', header=None, skiprows=2)
    for _, row in df.iterrows():
        template_id = row.iloc[0]
        title = row.iloc[1]
        if pd.isna(title) or str(title).strip() == '':
            continue
        if pd.isna(template_id) or str(template_id).strip() == '':
            template_id = 'ANNUAL-MISC'
        exec_month_str = str(row.iloc[2]).strip() if not pd.isna(row.iloc[2]) else ''
        exec_month = month_map.get(exec_month_str, 'NULL')
        memo = esc(row.iloc[5])
        sort_counter += 1
        lines.append(
            f"INSERT INTO task_templates (office_id, template_id, category, title, execution_month, memo, sort_order) "
            f"VALUES ('{OFFICE_ID}', {esc(template_id)}, 'annual', {esc(title)}, {exec_month}, {memo}, {sort_counter});"
        )

    return '\n'.join(lines) + '\n'


def generate_message_templates():
    lines = ["-- ============================", "-- message_templates (47 messages from Excel)", "-- ============================"]

    df = pd.read_excel(EXCEL_FILE, sheet_name='メッセージ一覧', header=None, skiprows=2)
    for _, row in df.iterrows():
        template_id = row.iloc[0]
        msg_type = row.iloc[1]
        title = row.iloc[2]
        body = row.iloc[3]
        form_url = row.iloc[4]
        footer_memo = row.iloc[5]

        if pd.isna(body) or str(body).strip() == '':
            continue

        # Normalize template_id
        tid_str = str(template_id).strip() if not pd.isna(template_id) else ''
        if tid_str == '' or tid_str == 'nan':
            continue  # skip rows without template_id
        # Individual uses number
        if tid_str.isdigit():
            tid_str = f'INIT-INDIVIDUAL-{int(tid_str):03d}'

        # Normalize type
        type_str = str(msg_type).strip() if not pd.isna(msg_type) else 'send_notice'
        if type_str == 'nan' or type_str == '':
            type_str = 'send_notice'
        type_map = {
            '送付予定連絡': 'send_notice',
            '提出期限超過連絡': 'overdue_notice',
            '完了連絡': 'completion_notice',
        }
        type_str = type_map.get(type_str, type_str)

        lines.append(
            f"INSERT INTO message_templates (office_id, template_id, type, title, body, form_url, footer_memo) "
            f"VALUES ('{OFFICE_ID}', {esc(tid_str)}, {esc(type_str)}, {esc(title)}, {esc(body)}, {esc(form_url)}, {esc(footer_memo)});"
        )

    return '\n'.join(lines) + '\n'


def generate_form_fields():
    lines = ["-- ============================", "-- form_fields (from Excel)", "-- ============================"]

    df = pd.read_excel(EXCEL_FILE, sheet_name='フォーム設計')
    sort_counter = 0

    for _, row in df.iterrows():
        template_id = row['業務ID']
        label = row['項目ラベル']
        field_type = row['項目タイプ']
        required = row['必須（TRUE/FALSE）']
        options = row['選択肢（カンマ区切り）']
        description = row['項目説明（任意）']

        if pd.isna(label) or str(label).strip() == '':
            continue
        if pd.isna(field_type) or str(field_type).strip() == '' or str(field_type).strip() == 'nan':
            # Some annual rows have no field_type - skip those as they are just labels
            continue

        # Normalize template_id
        tid_str = str(template_id).strip() if not pd.isna(template_id) else ''
        if tid_str == '' or tid_str == 'nan':
            continue
        # Handle numeric template_ids for individual
        if tid_str.startswith('INIT-INDIVIDUAL'):
            pass  # already correct
        elif tid_str.isdigit():
            # Check if it's from individual section by context
            tid_str = f'INIT-INDIVIDUAL-{int(tid_str):03d}'

        sort_counter += 1
        is_req = esc_bool(required)

        lines.append(
            f"INSERT INTO form_fields (office_id, template_id, label, field_type, is_required, options, description, sort_order) "
            f"VALUES ('{OFFICE_ID}', {esc(tid_str)}, {esc(label)}, {esc(field_type)}, {is_req}, {esc(options)}, {esc(description)}, {sort_counter});"
        )

    return '\n'.join(lines) + '\n'


def generate_tasks():
    lines = ["-- ============================", "-- tasks (12 sample tasks)", "-- ============================"]

    # Map status
    status_map = {
        '未着手': 'pending',
        '進行中': 'in_progress',
        '確認待ち': 'review',
        '完了': 'completed',
    }
    # Map category
    cat_map = {
        '月次処理': 'monthly',
        '決算': 'annual',
        '法人税申告': 'annual',
        '消費税申告': 'annual',
        '年末調整': 'annual',
        '給与計算': 'monthly',
    }

    tasks = [
        ('1', '3月度月次処理', '1', '月次処理', '進行中', 'high', '山田太郎', '2026-04-10', '3月度の仕訳入力・残高確認'),
        ('2', '3月決算', '2', '決算', '未着手', 'high', '山田太郎', '2026-05-31', '3月期決算書作成'),
        ('3', '法人税申告書作成', '1', '法人税申告', '未着手', 'high', '山田太郎', '2026-05-31', '法人税・地方税の申告書作成'),
        ('4', '消費税申告', '4', '消費税申告', '確認待ち', 'medium', '鈴木一郎', '2026-08-31', '消費税確定申告書作成'),
        ('5', '3月度月次処理', '3', '月次処理', '進行中', 'medium', '佐藤花子', '2026-04-10', '3月度の仕訳入力・残高確認'),
        ('6', '給与計算（3月分）', '7', '給与計算', '完了', 'medium', '鈴木一郎', '2026-03-25', '3月分給与計算・明細作成'),
        ('7', '3月度月次処理', '5', '月次処理', '未着手', 'medium', '佐藤花子', '2026-04-10', '3月度の仕訳入力・残高確認'),
        ('8', '年末調整準備', '11', '年末調整', '完了', 'low', '山田太郎', '2026-01-31', '年末調整関連書類の提出確認'),
        ('9', '3月度月次処理', '6', '月次処理', '確認待ち', 'low', '山田太郎', '2026-04-10', '3月度の仕訳入力・残高確認'),
        ('10', '決算報告書作成', '3', '決算', '未着手', 'high', '佐藤花子', '2026-05-31', '3月期決算報告書の作成'),
        ('11', '3月度月次処理', '8', '月次処理', '進行中', 'medium', '佐藤花子', '2026-04-10', '3月度の仕訳入力・残高確認'),
        ('12', '法人税中間申告', '7', '法人税申告', '未着手', 'medium', '鈴木一郎', '2026-04-30', '法人税中間申告書の作成'),
    ]

    for tid, title, client_id, cat, status, priority, staff_name, due_date, desc in tasks:
        task_uuid = f'00000000-0000-0000-0000-0000000002{int(tid):02d}'
        client_uuid = CLIENT_IDS[client_id]
        staff_uuid = STAFF_IDS[staff_name]
        mapped_status = status_map[status]
        mapped_cat = cat_map[cat]
        completed = "now()" if mapped_status == 'completed' else 'NULL'
        lines.append(
            f"INSERT INTO tasks (id, office_id, client_id, title, description, category, status, priority, assigned_to, due_date, completed_at) "
            f"VALUES ('{task_uuid}', '{OFFICE_ID}', '{client_uuid}', {esc(title)}, {esc(desc)}, '{mapped_cat}', '{mapped_status}', '{priority}', '{staff_uuid}', '{due_date}', {completed});"
        )

    return '\n'.join(lines) + '\n'


def main():
    sections = []
    sections.append("-- ================================================")
    sections.append("-- TAX PARTNER - Seed Data")
    sections.append("-- Generated from Excel + existing TS mock data")
    sections.append("-- ================================================")
    sections.append("")
    sections.append("BEGIN;")
    sections.append("")
    sections.append(generate_offices())
    sections.append(generate_staff())
    sections.append(generate_clients())
    sections.append(generate_task_templates())
    sections.append(generate_message_templates())
    sections.append(generate_form_fields())
    sections.append(generate_tasks())
    sections.append("COMMIT;")

    content = '\n'.join(sections)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Generated {OUTPUT_FILE}")
    print(f"Total size: {len(content)} bytes")
    # Count INSERT statements
    insert_count = content.count('INSERT INTO')
    print(f"Total INSERT statements: {insert_count}")


if __name__ == '__main__':
    main()
