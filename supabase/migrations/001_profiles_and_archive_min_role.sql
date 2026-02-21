-- ============================================================
-- GIFT 연구소 Supabase DB 설정
-- 실행 위치: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ------------------------------------------------------------
-- 1. profiles 테이블 생성 (auth.users 연동)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- role: 'user' (기본), 'admin' 등 확장 가능
COMMENT ON COLUMN public.profiles.role IS 'user(기본), admin 등. 향후 moderator 등 추가 가능';

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 본인 프로필 조회
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- admin은 모든 프로필 조회 가능
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 2. 회원가입 시 profiles 자동 생성 Trigger
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auth.users에 INSERT 후 실행
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- 3. archive 테이블에 min_role 컬럼 추가
-- ------------------------------------------------------------
ALTER TABLE public.archive
  ADD COLUMN IF NOT EXISTS min_role TEXT DEFAULT 'user';

COMMENT ON COLUMN public.archive.min_role IS '최소 열람 권한: user(기본) 또는 admin. 해당 등급 이상만 열람 가능';

-- ------------------------------------------------------------
-- (선택) 기존 가입자 프로필 일괄 생성
-- Trigger는 새 가입자만 처리하므로, 이미 있는 유저는 아래로 추가
-- ------------------------------------------------------------
-- INSERT INTO public.profiles (id, email, role)
-- SELECT id, email, 'user' FROM auth.users
-- WHERE id NOT IN (SELECT id FROM public.profiles);

-- ------------------------------------------------------------
-- (선택) 첫 관리자 지정: 아래에서 이메일을 본인 계정으로 변경 후 실행
-- ------------------------------------------------------------
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
