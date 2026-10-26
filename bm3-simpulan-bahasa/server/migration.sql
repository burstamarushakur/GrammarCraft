-- BM3 Simpulan Bahasa SKSA: isolated additive schema; GrammarCraft remains untouched.
create table if not exists public.bm3_simpulan_progress (
  student_id uuid primary key references public.students(id),
  reset_version integer not null default 0 check (reset_version>=0),
  revision integer not null default 0 check (revision>=0),
  records jsonb not null default '{}'::jsonb,
  updated_at timestamptz,
  reset_at timestamptz
);
create table if not exists public.bm3_simpulan_student_sessions (
  token_hash text primary key,
  student_id uuid not null references public.bm3_simpulan_progress(student_id) on delete cascade,
  reset_version integer not null,
  expires_at timestamptz not null
);
create index if not exists bm3_simpulan_student_expiry on public.bm3_simpulan_student_sessions(student_id,expires_at);
create table if not exists public.bm3_simpulan_teacher_sessions (
  token_hash text primary key,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  expires_at timestamptz not null
);
create index if not exists bm3_simpulan_teacher_expiry on public.bm3_simpulan_teacher_sessions(expires_at);
create table if not exists public.bm3_simpulan_login_buckets (
  bucket_key text primary key,
  window_start timestamptz not null default now(),
  attempts integer not null default 0
);
alter table public.bm3_simpulan_progress enable row level security;
alter table public.bm3_simpulan_student_sessions enable row level security;
alter table public.bm3_simpulan_teacher_sessions enable row level security;
alter table public.bm3_simpulan_login_buckets enable row level security;
revoke all on public.bm3_simpulan_progress,public.bm3_simpulan_student_sessions,public.bm3_simpulan_teacher_sessions,public.bm3_simpulan_login_buckets from anon,authenticated;
grant select,insert,update,delete on public.bm3_simpulan_progress,public.bm3_simpulan_student_sessions,public.bm3_simpulan_teacher_sessions,public.bm3_simpulan_login_buckets to service_role;
create or replace function public.bm3_simpulan_login_slot(ic_hash text, ip_hash text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare slot record; current_slot record; allowed boolean:=true;
begin
 for slot in
   select 'ic:'||ic_hash as key, 8 as max_attempts
   union all select 'ip:'||ip_hash, 40
   order by key
 loop
   insert into public.bm3_simpulan_login_buckets(bucket_key) values(slot.key) on conflict do nothing;
   select * into current_slot from public.bm3_simpulan_login_buckets where bucket_key=slot.key for update;
   if current_slot.window_start < now()-interval '15 minutes' then
     update public.bm3_simpulan_login_buckets set window_start=now(),attempts=1 where bucket_key=slot.key;
   elsif current_slot.attempts>=slot.max_attempts then
     allowed:=false;
   else
     update public.bm3_simpulan_login_buckets set attempts=attempts+1 where bucket_key=slot.key;
   end if;
 end loop;
 return allowed;
end;
$$;
revoke all on function public.bm3_simpulan_login_slot(text,text) from public,anon,authenticated;
grant execute on function public.bm3_simpulan_login_slot(text,text) to service_role;