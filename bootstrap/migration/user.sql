create table api (
    id uuid primary key,
    api_name varchar(64) not null,
    -- We store the api spec in json and regret nothing.
    api_spec text not null,
    compiled_api_spec text not null
);

create table function_bundle(
    id uuid primary key,
    bundle_name varchar(64) not null,
    bundle_object uuid not null
);

-- When you change the bundle, the dependence prevents you from doing that.
create table api_dependence(
    api_id uuid references api(id) on delete cascade,
    bundle_id uuid references function_bundle(id)
);

create table laser_user(
    id uuid primary key,
    username varchar(64) not null,
    pwd varchar(128) not null
);

create table bundle_ownership(
    userid uuid references laser_user(id) on delete cascade,
    bundleid uuid references function_bundle(id) on delete cascade
);
create table api_ownership(
    userid uuid references laser_user(id) on delete cascade,
    apiid uuid references api(id) on delete cascade
);
create unique index laser_username_unique on laser_user (username);
create unique index bundle_ownership_index on bundle_ownership (userid, bundleid);
create unique index api_ownership_index on api_ownership (userid, apiid);
