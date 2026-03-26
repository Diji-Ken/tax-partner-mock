-- ============================
-- 初回面談チェックリストテンプレート
-- ============================

CREATE TABLE IF NOT EXISTS consultation_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id uuid REFERENCES offices(id),
  category text NOT NULL,
  title text NOT NULL,
  description text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 顧問先ごとの面談チェックリスト実行記録
CREATE TABLE IF NOT EXISTS consultation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  template_id uuid REFERENCES consultation_templates(id),
  is_checked boolean DEFAULT false,
  notes text,
  checked_by uuid REFERENCES staff(id),
  checked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- フォーム回答
CREATE TABLE IF NOT EXISTS form_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  office_id uuid REFERENCES offices(id),
  template_id text NOT NULL,
  field_id uuid REFERENCES form_fields(id),
  field_label text NOT NULL,
  field_type text NOT NULL,
  response_text text,
  response_file_url text,
  response_file_name text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES staff(id),
  reviewed_at timestamptz
);

-- RLS無効化
ALTER TABLE consultation_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses DISABLE ROW LEVEL SECURITY;

-- インデックス
CREATE INDEX idx_consultation_templates_office ON consultation_templates(office_id);
CREATE INDEX idx_consultation_templates_category ON consultation_templates(category);
CREATE INDEX idx_consultation_records_client ON consultation_records(client_id);
CREATE INDEX idx_consultation_records_template ON consultation_records(template_id);
CREATE INDEX idx_form_responses_client ON form_responses(client_id);
CREATE INDEX idx_form_responses_template ON form_responses(template_id);
