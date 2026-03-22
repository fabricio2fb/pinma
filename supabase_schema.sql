-- ==========================================
-- 1. PERFIS E ASSINATURAS (Profiles & Premium)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'premium', 'business')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 2. GRUPOS (Groups)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invite_code TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 6)
);

CREATE TABLE IF NOT EXISTS public.group_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    UNIQUE(group_id, invitee_id)
);

CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(group_id, user_id)
);

-- ==========================================
-- 3. LEMBRETES (Reminders) - Versão Evoluída
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE, -- Opcional: Lembrete compartilhado
    
    title TEXT NOT NULL,
    description TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    radius INTEGER DEFAULT 100 NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Normal',
    
    is_active BOOLEAN DEFAULT true NOT NULL,
    notified_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 4. FUNÇÕES E TRIGGERS (Auto-Profile)
-- ==========================================
-- Criar perfil automaticamente ao registrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 5. POLÍTICAS DE SEGURANÇA (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Profiles: Usuário vê apenas seu perfil
CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles are updatable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Groups: Usuário vê grupos que ele é dono ou membro
CREATE POLICY "Users can see groups they belong to" 
ON public.groups FOR SELECT 
USING (
    owner_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.group_members 
        WHERE group_members.group_id = id 
        AND group_members.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert groups" 
ON public.groups FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Group Members: Segurança simples para evitar recursão
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see members of their groups" 
ON public.group_members FOR SELECT 
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.groups 
        WHERE groups.id = group_members.group_id 
        AND groups.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can join groups" 
ON public.group_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Group Invites: Segurança
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own invites" 
ON public.group_invites FOR SELECT 
USING (invitee_id = auth.uid() OR inviter_id = auth.uid());

CREATE POLICY "Admins can send invites" 
ON public.group_invites FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM group_members 
        WHERE group_id = group_invites.group_id 
        AND user_id = auth.uid() 
        AND role = 'admin'
    )
);

CREATE POLICY "Invitee can update status" 
ON public.group_invites FOR UPDATE 
USING (invitee_id = auth.uid());

-- Reminders: Usuário vê seus lembretes OU lembretes do grupo que pertence
CREATE POLICY "Users can see personal or group reminders" 
ON public.reminders FOR SELECT 
USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM group_members WHERE group_id = reminders.group_id AND user_id = auth.uid())
);

CREATE POLICY "Users can insert their own reminders" 
ON public.reminders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Índices
CREATE INDEX idx_reminders_group_id ON public.reminders(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);
