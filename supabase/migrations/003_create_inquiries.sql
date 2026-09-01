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

DROP POLICY IF EXISTS "Authenticated users can view inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Authenticated users can view allowed inquiries" ON public.inquiries;

-- 공개글은 인증 사용자 전체가 볼 수 있고, 비밀글은 작성자와 관리자만 볼 수 있음
CREATE POLICY "Authenticated users can view allowed inquiries"
  ON public.inquiries FOR SELECT
  TO authenticated
  USING (
    password IS NULL
    OR auth.uid() = user_id
    OR public.get_user_role() = 'admin'
  );

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
