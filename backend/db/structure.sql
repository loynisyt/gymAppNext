-- public.diet definition

-- Drop table

-- DROP TABLE diet;

CREATE TABLE diet (
	id serial4 NOT NULL,
	calories_goal int4 NOT NULL,
	protein_min int4 NOT NULL,
	protein_max int4 NOT NULL,
	carbs_min int4 NOT NULL,
	carbs_max int4 NOT NULL,
	fats_min int4 NOT NULL,
	fats_max int4 NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	vitamin_a_min int4 DEFAULT 700 NULL,
	vitamin_a_max int4 DEFAULT 900 NULL,
	vitamin_c_min int4 DEFAULT 75 NULL,
	vitamin_c_max int4 DEFAULT 90 NULL,
	calcium_min int4 DEFAULT 1000 NULL,
	calcium_max int4 DEFAULT 1300 NULL,
	magnesium_min int4 DEFAULT 310 NULL,
	magnesium_max int4 DEFAULT 420 NULL,
	fiber_min int4 DEFAULT 25 NULL,
	fiber_max int4 DEFAULT 38 NULL,
	salt_min int4 DEFAULT 1500 NULL,
	salt_max int4 DEFAULT 2300 NULL,
	CONSTRAINT diet_pkey PRIMARY KEY (id)
);


-- public.users definition

-- Drop table

-- DROP TABLE users;

CREATE TABLE users (
	id serial4 NOT NULL,
	username varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	email varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'user'::character varying NULL,
	is_active bool DEFAULT false NULL,
	first_name varchar(100) NULL,
	last_name varchar(100) NULL,
	phone varchar(30) NULL,
	two_factor_method varchar(100) NULL,
	profile_photo varchar(255) NULL,
	sex varchar(255) NULL,
	diet_id int4 NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_username_key UNIQUE (username),
	CONSTRAINT users_diet_id_fkey FOREIGN KEY (diet_id) REFERENCES diet(id) ON DELETE SET NULL
);


-- public.days definition

-- Drop table

-- DROP TABLE days;

CREATE TABLE days (
	id serial4 NOT NULL,
	"date" date NOT NULL,
	user_id int4 NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT days_pkey PRIMARY KEY (id),
	CONSTRAINT days_user_id_date_key UNIQUE (user_id, date),
	CONSTRAINT days_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- public.meals definition

-- Drop table

-- DROP TABLE meals;

CREATE TABLE meals (
	id serial4 NOT NULL,
	day_id int4 NOT NULL,
	meal_type varchar(32) NOT NULL,
	"name" varchar(128) NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	calories float8 NULL,
	protein float8 NULL,
	carbs float8 NULL,
	fats float8 NULL,
	vitamin_a float8 NULL,
	vitamin_c float8 NULL,
	calcium float8 NULL,
	magnesium float8 NULL,
	fiber float8 NULL,
	salt float8 NULL,
	portion_grams float8 NULL,
	CONSTRAINT meals_pkey PRIMARY KEY (id),
	CONSTRAINT meals_day_id_fkey FOREIGN KEY (day_id) REFERENCES days(id) ON DELETE CASCADE
);


-- public.session_tokens definition

-- Drop table

-- DROP TABLE session_tokens;

CREATE TABLE session_tokens (
	id serial4 NOT NULL,
	user_id int4 NULL,
	token_hash varchar(255) NOT NULL,
	issued_at timestamp NOT NULL,
	expires_at timestamp NOT NULL,
	CONSTRAINT session_tokens_pkey PRIMARY KEY (id),
	CONSTRAINT session_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- public.trainer_profiles definition

-- Drop table

-- DROP TABLE trainer_profiles;

CREATE TABLE trainer_profiles (
	id serial4 NOT NULL,
	user_id int4 NULL,
	short_description text NULL,
	full_description text NULL,
	training_types _text NULL,
	career text NULL,
	about text NULL,
	pricing text NULL,
	transformations _text NULL,
	profile_photo varchar(255) NULL,
	CONSTRAINT trainer_profiles_pkey PRIMARY KEY (id),
	CONSTRAINT trainer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- public.user_tokens definition

-- Drop table

-- DROP TABLE user_tokens;

CREATE TABLE user_tokens (
	id serial4 NOT NULL,
	user_id int4 NULL,
	"token" varchar(10) NOT NULL,
	expires_at timestamp NOT NULL,
	CONSTRAINT user_tokens_pkey PRIMARY KEY (id),
	CONSTRAINT user_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- public.user_trainers definition

-- Drop table

-- DROP TABLE user_trainers;

CREATE TABLE user_trainers (
	id serial4 NOT NULL,
	user_id int4 NULL,
	trainer_id int4 NULL,
	CONSTRAINT user_trainers_pkey PRIMARY KEY (id),
	CONSTRAINT user_trainers_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
	CONSTRAINT user_trainers_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- public.activities definition

-- Drop table

-- DROP TABLE activities;

CREATE TABLE activities (
	id serial4 NOT NULL,
	day_id int4 NOT NULL,
	"name" varchar(128) NOT NULL,
	calories int4 NULL,
	duration int4 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT activities_pkey PRIMARY KEY (id),
	CONSTRAINT activities_day_id_fkey FOREIGN KEY (day_id) REFERENCES days(id) ON DELETE CASCADE
);