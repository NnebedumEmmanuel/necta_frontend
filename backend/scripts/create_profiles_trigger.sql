-- create_profiles_trigger.sql
-- Trigger that automatically inserts a row into public.profiles whenever
-- a new user is created in the Supabase auth.users table.
-- Default role is set to 'user'.

/*
Run this script in your Supabase SQL editor or psql connected to the project.

It creates:
- a PL/pgSQL function public.handle_new_auth_user()
- a trigger auth_user_created on auth.users that calls the function after insert

Notes:
- The script uses `new.email` if present; falls back to an empty string.
- It uses `on conflict (id) do nothing` to avoid duplicate inserts.
*/

-- Create/replace the function that inserts into public.profiles
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
as $$
begin
  -- Insert a profile row for the newly created auth user.
  -- Use COALESCE for email in case it's null.
  insert into public.profiles (id, email, role, created_at)
  values (new.id, coalesce(new.email, ''), 'user', now())
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Drop the trigger if it already exists, then create it.
drop trigger if exists auth_user_created on auth.users;
create trigger auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_auth_user();

-- Optional: grant execute on function to anon/public roles if you need, but
-- the trigger executes as the owner of the function; typically no extra grants
-- are required for auth-triggered functions.
