create table if not exists monitor_readings (
  id text primary key,
  datetime bigint not null,
  new_input double precision,
  old_input double precision,
  notes text not null default '',
  load_kw double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists monitor_readings_datetime_idx
  on monitor_readings (datetime);

create table if not exists monitor_collections (
  id text primary key,
  month text not null,
  meter text not null check (meter in ('METER 1', 'METER 2')),
  date text not null,
  time text not null,
  previous_baseline double precision not null,
  raw_reading double precision not null,
  extended_days integer,
  standard_days integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists monitor_history (
  id text primary key,
  month text not null,
  meter text not null check (meter in ('METER 1', 'METER 2')),
  status text not null,
  units double precision not null,
  bill double precision not null,
  payment double precision not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists monitor_notes (
  id text primary key,
  timestamp bigint not null,
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists monitor_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists monitor_backup_state (
  id integer primary key check (id = 1),
  last_backup_at timestamptz,
  last_backup_error text,
  updated_at timestamptz not null default now()
);

insert into monitor_backup_state (id)
values (1)
on conflict (id) do nothing;
