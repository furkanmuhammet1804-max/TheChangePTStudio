-- ════════════════════════════════════════════════════════════════════════════
-- The Change PT Studio — Supabase başlangıç şeması
--
-- Çalıştırma: Supabase Dashboard > SQL Editor > New Query > bu dosyayı yapıştır
-- (veya: supabase db push — bkz. SUPABASE_SETUP.md)
--
-- İçerik:
--   1. Tablolar (users, profiles, memberships, exercises, programs, ...)
--   2. is_admin() yardımcı fonksiyonu
--   3. auth.users → public.users otomatik kayıt trigger'ı
--   4. Row Level Security politikaları
--   5. Storage bucket'ları + politikaları
--   6. Realtime yayını
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. TABLOLAR ─────────────────────────────────────────────────────────────

-- Kullanıcı hesapları (auth.users'ın uygulama profili)
create table if not exists public.users (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text,
  full_name     text,
  role          text not null default 'customer' check (role in ('customer', 'admin')),
  status        text not null default 'active' check (status in ('active', 'passive')),
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);

-- Antrenman profili (onboarding/setup verileri)
create table if not exists public.profiles (
  user_id           uuid primary key references public.users (id) on delete cascade,
  age               int,
  gender            text,
  height            numeric,
  weight            numeric,
  goal              text,
  level             text,
  weekly_days       int,
  training_location text,
  starting_weight   numeric,
  target_weight     numeric,
  updated_at        timestamptz not null default now()
);

-- Üyelikler (premium geçmişi — aktif üyelik = status 'premium' ve ends_at gelecekte)
create table if not exists public.memberships (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  plan       text not null check (plan in ('monthly', 'quarterly', 'yearly')),
  status     text not null default 'premium'
             check (status in ('free', 'premium', 'expired', 'cancelled')),
  starts_at  timestamptz not null default now(),
  ends_at    timestamptz not null,
  source     text not null default 'admin'
             check (source in ('admin', 'manual', 'app_store', 'google_play')),
  created_at timestamptz not null default now()
);
create index if not exists memberships_user_idx on public.memberships (user_id, status);

-- Egzersiz kütüphanesi (id text: katalog kimlikleri "ex_..." korunur)
create table if not exists public.exercises (
  id              text primary key,
  name            text not null,
  description_tr  text not null default '',
  muscle_group    text not null,
  environments    text[] not null default '{}',
  equipment       text not null default 'none',
  difficulty      text not null default 'all',
  instructions_tr text[] not null default '{}', -- nasıl yapılır (howTo)
  tips_tr         text[] not null default '{}',
  mistakes_tr     text[] not null default '{}', -- yaygın hatalar
  alternatives    text[] not null default '{}', -- alternatif egzersiz id'leri
  sets            int,
  reps            text,
  rest_seconds    int,
  image_url       text,
  gif_url         text,
  video_url       text,
  thumbnail_url   text,
  media_status    text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Programlar
create table if not exists public.programs (
  id             text primary key,
  title          text not null,
  description_tr text not null default '',
  goal           text not null default 'all',      -- kategori (fat_burn, muscle_gain, ...)
  level          text not null default 'all',
  duration_weeks int not null default 4,
  weekly_days    int not null default 3,
  is_premium     boolean not null default true,
  is_published   boolean not null default false,
  equipment      text[] not null default '{mixed}',
  target_muscles text[] not null default '{full_body}',
  badge          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Program haftalık planı (her satır = haftanın bir antrenman günü)
create table if not exists public.program_workouts (
  id            uuid primary key default gen_random_uuid(),
  program_id    text not null references public.programs (id) on delete cascade,
  week_number   int not null,
  day_index     int not null,            -- haftanın günü (1-7)
  workout_id    text not null,           -- antrenman kataloğu kimliği
  workout_title text not null default '',
  exercises     jsonb,                   -- ileride tam egzersiz listesi için
  unique (program_id, week_number, day_index)
);

-- Kullanıcıya atanan / başlatılan programlar
create table if not exists public.user_programs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users (id) on delete cascade,
  program_id   text not null references public.programs (id) on delete cascade,
  assigned_by  uuid references public.users (id),  -- admin atadıysa dolu
  started_at   timestamptz,
  completed_at timestamptz,
  current_week int not null default 1,
  current_day  int not null default 0,
  status       text not null default 'assigned'
               check (status in ('assigned', 'active', 'completed', 'abandoned')),
  created_at   timestamptz not null default now(),
  unique (user_id, program_id)
);

-- Tamamlanan antrenman kayıtları (id text: istemci kimlikleri korunur)
create table if not exists public.workout_logs (
  id               text primary key,
  user_id          uuid not null references public.users (id) on delete cascade,
  workout_id       text not null,
  program_id       text,
  week_number      int,
  day_index        int,
  date             date not null,
  started_at       timestamptz,
  completed_at     timestamptz not null default now(),
  duration_seconds int not null default 0,
  total_volume     numeric not null default 0,
  sets_json        jsonb not null default '[]'    -- ExerciseLog[] (set/tekrar/ağırlık)
);
create index if not exists workout_logs_user_idx on public.workout_logs (user_id, date desc);

-- Favori egzersizler
create table if not exists public.favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  exercise_id text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, exercise_id)
);

-- Dönüşüm (önce/sonra) fotoğrafları — kullanıcı başına her türden bir adet
create table if not exists public.transformation_photos (
  id        text primary key,
  user_id   uuid not null references public.users (id) on delete cascade,
  type      text not null check (type in ('before', 'after')),
  image_url text not null,
  taken_at  timestamptz not null default now(),
  unique (user_id, type)
);

-- Bildirim kampanyaları (admin)
create table if not exists public.notification_campaigns (
  id         text primary key,
  title      text not null,
  body       text not null,
  audience   text not null default 'all' check (audience in ('all', 'free', 'premium')),
  status     text not null default 'sent'
             check (status in ('draft', 'scheduled', 'sent', 'cancelled')),
  reach      int not null default 0,
  created_by uuid references public.users (id),
  created_at timestamptz not null default now(),
  sent_at    timestamptz
);

-- ─── 2. YARDIMCI FONKSİYONLAR ────────────────────────────────────────────────

-- Oturumdaki kullanıcı admin mi? (RLS politikalarında kullanılır)
-- security definer: RLS'e takılmadan users tablosunu okuyabilir.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

-- ─── 3. AUTH TRIGGER ─────────────────────────────────────────────────────────

-- Yeni auth kaydında public.users + public.profiles satırlarını otomatik aç
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;

  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── 4. ROW LEVEL SECURITY ───────────────────────────────────────────────────

alter table public.users                  enable row level security;
alter table public.profiles               enable row level security;
alter table public.memberships            enable row level security;
alter table public.exercises              enable row level security;
alter table public.programs               enable row level security;
alter table public.program_workouts       enable row level security;
alter table public.user_programs          enable row level security;
alter table public.workout_logs           enable row level security;
alter table public.favorites              enable row level security;
alter table public.transformation_photos  enable row level security;
alter table public.notification_campaigns enable row level security;

-- users: herkes kendi kaydını görür; admin hepsini görür ve yönetir
create policy users_select_own  on public.users for select using (id = auth.uid() or public.is_admin());
create policy users_update_own  on public.users for update using (id = auth.uid())
  with check (id = auth.uid() and role = 'customer'); -- kullanıcı kendi rolünü yükseltemez
create policy users_admin_all   on public.users for update using (public.is_admin());

-- profiles: kullanıcı sadece kendi profilini görür/yazar; admin hepsini görür
create policy profiles_select on public.profiles for select using (user_id = auth.uid() or public.is_admin());
create policy profiles_insert on public.profiles for insert with check (user_id = auth.uid());
create policy profiles_update on public.profiles for update using (user_id = auth.uid() or public.is_admin());

-- memberships: kullanıcı kendisininkini görür; mağaza satın alması kendine kayıt
-- ekleyebilir; manuel/admin işlemleri sadece admin yapar
create policy memberships_select on public.memberships for select using (user_id = auth.uid() or public.is_admin());
create policy memberships_insert_self on public.memberships for insert
  with check (user_id = auth.uid() and source in ('app_store', 'google_play'));
create policy memberships_admin_insert on public.memberships for insert with check (public.is_admin());
create policy memberships_admin_update on public.memberships for update using (public.is_admin());
create policy memberships_admin_delete on public.memberships for delete using (public.is_admin());

-- exercises: aktif olanları herkes (anonim dahil) okur; yazma sadece admin
create policy exercises_select on public.exercises for select using (is_active or public.is_admin());
create policy exercises_admin_insert on public.exercises for insert with check (public.is_admin());
create policy exercises_admin_update on public.exercises for update using (public.is_admin());
create policy exercises_admin_delete on public.exercises for delete using (public.is_admin());

-- programs: yayınlananları herkes okur; yazma sadece admin
create policy programs_select on public.programs for select using (is_published or public.is_admin());
create policy programs_admin_insert on public.programs for insert with check (public.is_admin());
create policy programs_admin_update on public.programs for update using (public.is_admin());
create policy programs_admin_delete on public.programs for delete using (public.is_admin());

-- program_workouts: programı görebilen planını da görür; yazma sadece admin
create policy program_workouts_select on public.program_workouts for select
  using (exists (select 1 from public.programs p
                 where p.id = program_id and (p.is_published or public.is_admin())));
create policy program_workouts_admin_insert on public.program_workouts for insert with check (public.is_admin());
create policy program_workouts_admin_update on public.program_workouts for update using (public.is_admin());
create policy program_workouts_admin_delete on public.program_workouts for delete using (public.is_admin());

-- user_programs: kullanıcı kendi kayıtlarını yönetir; admin atama yapar/görür
create policy user_programs_select on public.user_programs for select using (user_id = auth.uid() or public.is_admin());
create policy user_programs_insert on public.user_programs for insert
  with check (user_id = auth.uid() or public.is_admin());
create policy user_programs_update on public.user_programs for update
  using (user_id = auth.uid() or public.is_admin());
create policy user_programs_delete on public.user_programs for delete
  using (user_id = auth.uid() or public.is_admin());

-- workout_logs: kullanıcı sadece kendi loglarını görür/yazar; admin okur
create policy workout_logs_select on public.workout_logs for select using (user_id = auth.uid() or public.is_admin());
create policy workout_logs_insert on public.workout_logs for insert with check (user_id = auth.uid());

-- favorites: sadece sahibi
create policy favorites_select on public.favorites for select using (user_id = auth.uid());
create policy favorites_insert on public.favorites for insert with check (user_id = auth.uid());
create policy favorites_delete on public.favorites for delete using (user_id = auth.uid());

-- transformation_photos: sadece sahibi (admin dahil kimse başkasınınkini göremez)
create policy transformation_photos_all on public.transformation_photos
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- notification_campaigns: sadece admin
create policy campaigns_admin_select on public.notification_campaigns for select using (public.is_admin());
create policy campaigns_admin_insert on public.notification_campaigns for insert with check (public.is_admin());
create policy campaigns_admin_update on public.notification_campaigns for update using (public.is_admin());

-- ─── 5. STORAGE ──────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values
  ('exercise-media', 'exercise-media', true),          -- egzersiz görsel/gif/video (herkes okur)
  ('transformation-photos', 'transformation-photos', false), -- önce/sonra (özel)
  ('app-assets', 'app-assets', true)                   -- genel uygulama görselleri
on conflict (id) do nothing;

-- exercise-media: okumak herkese açık (bucket public), yazma sadece admin
create policy storage_exercise_media_read on storage.objects for select
  using (bucket_id = 'exercise-media');
create policy storage_exercise_media_write on storage.objects for insert
  with check (bucket_id = 'exercise-media' and public.is_admin());
create policy storage_exercise_media_update on storage.objects for update
  using (bucket_id = 'exercise-media' and public.is_admin());
create policy storage_exercise_media_delete on storage.objects for delete
  using (bucket_id = 'exercise-media' and public.is_admin());

-- transformation-photos: kullanıcı sadece kendi klasörüne ({uid}/...) erişir
create policy storage_transform_read on storage.objects for select
  using (bucket_id = 'transformation-photos'
         and (storage.foldername(name))[1] = auth.uid()::text);
create policy storage_transform_write on storage.objects for insert
  with check (bucket_id = 'transformation-photos'
              and (storage.foldername(name))[1] = auth.uid()::text);
create policy storage_transform_delete on storage.objects for delete
  using (bucket_id = 'transformation-photos'
         and (storage.foldername(name))[1] = auth.uid()::text);

-- app-assets: okumak herkese açık, yazma sadece admin
create policy storage_app_assets_read on storage.objects for select
  using (bucket_id = 'app-assets');
create policy storage_app_assets_write on storage.objects for insert
  with check (bucket_id = 'app-assets' and public.is_admin());

-- ─── 6. REALTIME ─────────────────────────────────────────────────────────────

-- Değişiklikleri canlı yayınlanacak tablolar (uygulamalar arası eşzamanlılık)
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.memberships;
alter publication supabase_realtime add table public.exercises;
alter publication supabase_realtime add table public.programs;
alter publication supabase_realtime add table public.program_workouts;
alter publication supabase_realtime add table public.user_programs;
alter publication supabase_realtime add table public.notification_campaigns;
