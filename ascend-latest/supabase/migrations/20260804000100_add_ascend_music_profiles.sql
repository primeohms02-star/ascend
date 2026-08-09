begin;

create table if not exists public.ascend_music_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique references public.profiles(clerk_id) on update cascade on delete cascade,
  roles text[] not null default '{}',
  career_stage text not null,
  genres text[] not null default '{}',
  skills text[] not null default '{}',
  goal text not null,
  challenges text[] not null default '{}',
  location text not null default '',
  preferred_regions text[] not null default '{}',
  north_star text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ascend_music_profiles_roles_present
    check (cardinality(roles) between 1 and 8),
  constraint ascend_music_profiles_genres_limit
    check (cardinality(genres) between 1 and 12),
  constraint ascend_music_profiles_skills_limit
    check (cardinality(skills) between 0 and 20),
  constraint ascend_music_profiles_challenges_present
    check (cardinality(challenges) between 1 and 10),
  constraint ascend_music_profiles_regions_present
    check (cardinality(preferred_regions) between 1 and 6),
  constraint ascend_music_profiles_goal_length
    check (char_length(goal) between 2 and 120),
  constraint ascend_music_profiles_north_star_length
    check (char_length(north_star) between 20 and 1200)
);

alter table public.ascend_music_profiles enable row level security;

revoke all privileges
on table public.ascend_music_profiles
from public, anon, authenticated;

grant all privileges
on table public.ascend_music_profiles
to service_role;

commit;
