-- Additive GrammarCraft tables. Existing SPBT tables and assignments are unchanged.
create table if not exists public.grammarcraft_progress (
 student_id uuid primary key references public.students(id),
 reset_version integer not null default 0 check (reset_version >= 0),
 revision integer not null default 0 check (revision >= 0),
 progress_json text not null default '{}',
 updated_at timestamptz,
 reset_at timestamptz
);
create table if not exists public.grammarcraft_student_sessions (
 token_hash text primary key,
 student_id uuid not null references public.grammarcraft_progress(student_id) on delete cascade,
 reset_version integer not null,
 expires_at timestamptz not null
);
create index if not exists grammarcraft_student_session_expiry on public.grammarcraft_student_sessions(student_id,expires_at);
create table if not exists public.grammarcraft_teacher_sessions (
 token_hash text primary key,
 teacher_id uuid not null references public.teachers(id) on delete cascade,
 expires_at timestamptz not null
);
create index if not exists grammarcraft_teacher_session_expiry on public.grammarcraft_teacher_sessions(expires_at);
create table if not exists public.grammarcraft_login_buckets (
 bucket_key text primary key,
 window_start timestamptz not null default now(),
 attempts integer not null default 0
);
alter table public.grammarcraft_progress enable row level security;
alter table public.grammarcraft_student_sessions enable row level security;
alter table public.grammarcraft_teacher_sessions enable row level security;
alter table public.grammarcraft_login_buckets enable row level security;
revoke all on public.grammarcraft_progress,public.grammarcraft_student_sessions,public.grammarcraft_teacher_sessions,public.grammarcraft_login_buckets from anon,authenticated;
grant select,insert,update,delete on public.grammarcraft_progress,public.grammarcraft_student_sessions,public.grammarcraft_teacher_sessions,public.grammarcraft_login_buckets to service_role;

create or replace function public.grammarcraft_login_slot(ic_hash text,ip_hash text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare slot record; current_slot record; allowed boolean:=true;
begin
 for slot in select 'ic:'||ic_hash as key,8 as max_attempts union all select 'ip:'||ip_hash,40 order by key loop
  insert into public.grammarcraft_login_buckets(bucket_key) values(slot.key) on conflict do nothing;
  select * into current_slot from public.grammarcraft_login_buckets where bucket_key=slot.key for update;
  if current_slot.window_start < now()-interval '15 minutes' then
   update public.grammarcraft_login_buckets set window_start=now(),attempts=1 where bucket_key=slot.key;
  elsif current_slot.attempts >= slot.max_attempts then allowed:=false;
  else update public.grammarcraft_login_buckets set attempts=attempts+1 where bucket_key=slot.key;
  end if;
 end loop;
 return allowed;
end;
$$;
revoke all on function public.grammarcraft_login_slot(text,text) from public,anon,authenticated;
grant execute on function public.grammarcraft_login_slot(text,text) to service_role;
