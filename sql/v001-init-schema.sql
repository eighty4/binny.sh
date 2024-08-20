drop schema if exists install_sh cascade;

create schema install_sh;

create table install_sh.users
(
    id           bigint primary key,
    email        varchar   not null,
    access_token varchar   not null,
    created_when timestamp not null default now(),
    authed_when  timestamp not null default now()
);

create table install_sh.scripts
(
    id               bigserial primary key,
    user_id          integer   not null references install_sh.users (id),
    repo_owner       varchar   not null,
    repo_name        varchar   not null,
    template_version varchar   not null,
    created_when     timestamp not null default now(),
    generated_when   timestamp not null default now(),
    constraint script_user_repo_key unique (user_id, repo_owner, repo_name)
);
