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
