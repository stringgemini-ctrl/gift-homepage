-- 문의 게시판 테이블
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  password TEXT DEFAULT NULL,          -- NULL이면 공개글, 값이 있으면 비밀글
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  answer TEXT DEFAULT NULL,            -- 관리자 답변
  answered_at TIMESTAMPTZ DEFAULT NULL,
  answered_by UUID DEFAULT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자는 모든 글 조회 가능 (비밀글 필터링은 앱 레벨에서 처리)
CREATE POLICY "Authenticated users can view inquiries"
  ON public.inquiries FOR SELECT
  TO authenticated
  USING (true);

-- 자신의 글만 삽입 가능
CREATE POLICY "Users can insert own inquiries"
  ON public.inquiries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 자신의 글만 수정 가능
CREATE POLICY "Users can update own inquiries"
  ON public.inquiries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 자신의 글만 삭제 가능
CREATE POLICY "Users can delete own inquiries"
  ON public.inquiries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
