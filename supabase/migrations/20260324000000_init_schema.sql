-- ============================
-- TAX PARTNER - 初期スキーマ
-- ============================

-- UUID生成関数を有効化
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================
-- 事務所・ユーザー管理
-- ============================

-- 会計事務所（マルチテナント）
CREATE TABLE offices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  representative text,
  phone text,
  email text,
  address text,
  plan text DEFAULT 'standard',
  google_drive_folder_id text,
  created_at timestamptz DEFAULT now()
);

-- スタッフ（事務所の従業員）
CREATE TABLE staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id uuid NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE,
  role text DEFAULT 'member',
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- ============================
-- 顧問先管理
-- ============================

-- 顧問先
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id uuid NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  name text NOT NULL,
  representative text,
  type text NOT NULL,
  settlement_month int,
  accounting_software text,
  monthly_fee int,
  assigned_staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  rank text DEFAULT 'B',
  status text DEFAULT 'active',
  phone text,
  email text,
  address text,
  industry text,
  registration_date date,
  invoice_registered boolean DEFAULT false,
  invoice_number text,
  etax_registered boolean DEFAULT false,
  etax_id text,
  eltax_registered boolean DEFAULT false,
  eltax_id text,
  direct_tax_registered boolean DEFAULT false,
  google_drive_folder_id text,
  line_user_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 顧問先の契約案件
CREATE TABLE client_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  contract_type text NOT NULL,
  fee int,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 顧問先の連絡先（複数名）
CREATE TABLE client_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  phone text,
  email text,
  is_primary boolean DEFAULT false
);

-- ============================
-- 業務テンプレート
-- ============================

-- 業務テンプレートマスタ
CREATE TABLE task_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id uuid NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  template_id text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  send_day_offset int,
  due_day_offset int,
  execution_month int,
  office_todo text,
  labor_todo text,
  memo text,
  sort_order int,
  created_at timestamptz DEFAULT now()
);

-- メッセージテンプレート
CREATE TABLE message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id uuid NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  template_id text NOT NULL,
  type text NOT NULL,
  title text,
  body text NOT NULL,
  form_url text,
  footer_memo text,
  created_at timestamptz DEFAULT now()
);

-- フォームフィールド定義
CREATE TABLE form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id uuid NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  template_id text NOT NULL,
  label text NOT NULL,
  field_type text NOT NULL,
  is_required boolean DEFAULT false,
  options text,
  description text,
  sort_order int
);

-- ============================
-- タスク管理（実行インスタンス）
-- ============================

-- タスク
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id uuid NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  template_id text,
  title text NOT NULL,
  description text,
  category text,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  assigned_to uuid REFERENCES staff(id) ON DELETE SET NULL,
  due_date date,
  send_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- タスクチェックリスト
CREATE TABLE task_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label text NOT NULL,
  is_checked boolean DEFAULT false,
  sort_order int
);

-- ============================
-- 記帳・証憑管理
-- ============================

-- 証憑
CREATE TABLE vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  office_id uuid NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  voucher_type text NOT NULL,
  file_name text,
  google_drive_file_id text,
  google_drive_url text,
  upload_source text,
  ocr_status text DEFAULT 'pending',
  ocr_result jsonb,
  fiscal_year int,
  fiscal_month int,
  uploaded_by uuid,
  uploaded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 仕訳データ
CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  office_id uuid NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  voucher_id uuid REFERENCES vouchers(id) ON DELETE SET NULL,
  entry_date date NOT NULL,
  debit_account text NOT NULL,
  credit_account text NOT NULL,
  amount int NOT NULL,
  tax_category text,
  description text,
  partner_name text,
  invoice_number text,
  ai_confidence float,
  status text DEFAULT 'draft',
  confirmed_by uuid REFERENCES staff(id) ON DELETE SET NULL,
  synced_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- AI仕訳ルール
CREATE TABLE ai_journal_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id uuid NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  condition_type text NOT NULL,
  condition_value text NOT NULL,
  debit_account text NOT NULL,
  credit_account text,
  confidence float DEFAULT 0.5,
  applied_count int DEFAULT 0,
  status text DEFAULT 'candidate',
  created_at timestamptz DEFAULT now()
);

-- ============================
-- 請求管理
-- ============================

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id uuid NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number text,
  period_start date,
  period_end date,
  amount int NOT NULL,
  tax_amount int,
  total_amount int,
  status text DEFAULT 'draft',
  due_date date,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity int DEFAULT 1,
  unit_price int NOT NULL,
  amount int NOT NULL
);

-- ============================
-- ドキュメント管理
-- ============================

CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  office_id uuid NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  name text NOT NULL,
  document_type text,
  fiscal_year int,
  google_drive_file_id text,
  google_drive_url text,
  file_size int,
  mime_type text,
  e_bookkeeping_compliant boolean DEFAULT false,
  uploaded_by uuid,
  created_at timestamptz DEFAULT now()
);

-- ============================
-- ナレッジ・ルール
-- ============================

-- 事務所カスタム勘定科目
CREATE TABLE custom_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id uuid NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  category text,
  tax_category text,
  description text,
  is_active boolean DEFAULT true
);

-- 顧問先別処理メモ
CREATE TABLE client_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  note_type text,
  title text,
  content text NOT NULL,
  created_by uuid REFERENCES staff(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 資料回収チェックリスト
CREATE TABLE client_document_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  label text NOT NULL,
  is_required boolean DEFAULT true,
  sort_order int
);

-- ============================
-- 補助金・紹介マッチング
-- ============================

-- 補助金案内履歴
CREATE TABLE subsidy_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  subsidy_name text NOT NULL,
  subsidy_source text,
  status text DEFAULT 'notified',
  amount int,
  commission int,
  notified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 紹介パートナー
CREATE TABLE referral_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id uuid NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  commission_type text,
  commission_value text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- 紹介案件
CREATE TABLE referral_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id uuid NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES referral_partners(id) ON DELETE CASCADE,
  status text DEFAULT 'introduced',
  amount int,
  commission int,
  note text,
  created_at timestamptz DEFAULT now()
);

-- ============================
-- メッセージ・コミュニケーション
-- ============================

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sender_type text NOT NULL,
  sender_id uuid,
  content text NOT NULL,
  attachments jsonb,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================
-- アクティビティログ
-- ============================

CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id uuid NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  client_id uuid,
  staff_id uuid,
  action text NOT NULL,
  description text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================
-- インデックス
-- ============================

CREATE INDEX idx_staff_office ON staff(office_id);
CREATE INDEX idx_clients_office ON clients(office_id);
CREATE INDEX idx_clients_assigned_staff ON clients(assigned_staff_id);
CREATE INDEX idx_client_contracts_client ON client_contracts(client_id);
CREATE INDEX idx_client_contacts_client ON client_contacts(client_id);
CREATE INDEX idx_task_templates_office ON task_templates(office_id);
CREATE INDEX idx_task_templates_category ON task_templates(category);
CREATE INDEX idx_message_templates_office ON message_templates(office_id);
CREATE INDEX idx_message_templates_template ON message_templates(template_id);
CREATE INDEX idx_form_fields_office ON form_fields(office_id);
CREATE INDEX idx_form_fields_template ON form_fields(template_id);
CREATE INDEX idx_tasks_office ON tasks(office_id);
CREATE INDEX idx_tasks_client ON tasks(client_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_task_checklist_task ON task_checklist_items(task_id);
CREATE INDEX idx_vouchers_client ON vouchers(client_id);
CREATE INDEX idx_vouchers_office ON vouchers(office_id);
CREATE INDEX idx_journal_entries_client ON journal_entries(client_id);
CREATE INDEX idx_journal_entries_office ON journal_entries(office_id);
CREATE INDEX idx_ai_journal_rules_office ON ai_journal_rules(office_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_office ON invoices(office_id);
CREATE INDEX idx_documents_client ON documents(client_id);
CREATE INDEX idx_documents_office ON documents(office_id);
CREATE INDEX idx_custom_accounts_office ON custom_accounts(office_id);
CREATE INDEX idx_client_notes_client ON client_notes(client_id);
CREATE INDEX idx_client_document_checklist_client ON client_document_checklist(client_id);
CREATE INDEX idx_subsidy_notifications_client ON subsidy_notifications(client_id);
CREATE INDEX idx_referral_partners_office ON referral_partners(office_id);
CREATE INDEX idx_referral_deals_office ON referral_deals(office_id);
CREATE INDEX idx_referral_deals_client ON referral_deals(client_id);
CREATE INDEX idx_messages_client ON messages(client_id);
CREATE INDEX idx_activity_logs_office ON activity_logs(office_id);
CREATE INDEX idx_activity_logs_client ON activity_logs(client_id);
