-- 1. Tabela de Perfis (Profiles) - Vinculada ao Auth do Supabase
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para Perfis
CREATE POLICY "Perfis são visíveis para todos os usuários logados" 
ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 2. Tabela de Grupos
CREATE TABLE public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Membros do Grupo (Para adicionar usuários usando o 'username')
CREATE TABLE public.group_members (
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Agora que as duas mesas existem, habilitamos as políticas que dependem uma da outra
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Grupos visíveis para membros" 
ON public.groups FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = public.groups.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Qualquer usuário pode criar um grupo" 
ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membros podem ver outros membros do mesmo grupo" 
ON public.group_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm WHERE gm.group_id = public.group_members.group_id AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Admins do grupo podem adicionar membros" 
ON public.group_members FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = public.group_members.group_id AND user_id = auth.uid() AND role = 'admin'
  )
  OR auth.uid() = user_id -- O próprio criador do grupo se adicionando no momento da criação
);


-- 4. Tabela de Lembretes (Reminders / Pins)
CREATE TABLE public.reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE, -- Opcional, se o lembrete for para o grupo
  title TEXT NOT NULL,
  location_text TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  radius INTEGER DEFAULT 100,
  category TEXT DEFAULT 'Mercado',
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Urgente')),
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem lembretes próprios e do seu grupo" 
ON public.reminders FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = public.reminders.group_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem inserir seus próprios lembretes" 
ON public.reminders FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seus próprios lembretes" 
ON public.reminders FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Usuários podem deletar seus próprios lembretes" 
ON public.reminders FOR DELETE USING (user_id = auth.uid());


-- 5. Trigger (Gatilho) para criar Profile automaticamente ao registrar no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  -- O raw_user_meta_data pegará o username enviado no momento do cadastro via API
  VALUES (new.id, new.email, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
