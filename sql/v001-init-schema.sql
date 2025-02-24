create table binny_sh.users
(
    id           bigint primary key,
    created_when timestamp not null default now(),
    last_visit   timestamp not null default now()
);

create table binny_sh.scripts
(
    id               bigserial primary key,
    user_id          bigint    not null references binny_sh.users (id),
    repo_owner       varchar   not null,
    repo_name        varchar   not null,
    template_spec    varchar   not null,
    template_version varchar   not null,
    created_when     timestamp not null default now(),
    generated_when   timestamp not null default now(),
    constraint script_user_repo_key unique (user_id, repo_owner, repo_name)
);

create table binny_sh.script_history
(
    id               bigserial primary key,
    user_id          bigint    not null references binny_sh.users (id),
    repo_owner       varchar   not null,
    repo_name        varchar   not null,
    release_tag      varchar   not null,
    template_version varchar   not null,
    generated_when   timestamp not null default now()
);
