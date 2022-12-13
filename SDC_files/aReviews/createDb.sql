-- DROP DATABASE IF EXISTS atelierreviews;

-- CREATE DATABASE atelierreviews;

CREATE TABLE
  public.reviews (
    review_id serial NOT NULL,
    product_id integer NOT NULL,
    rating integer NOT NULL,
    summary character varying(600) NULL,
    recommend boolean NULL,
    response character varying(600) NULL,
    body character varying(600) NULL,
    reviewer_name character varying(50) NULL,
    helpfulness integer NULL DEFAULT 0,
    reviewer_email character varying(50) NULL,
    reported boolean NULL DEFAULT false,
    date bigint NULL
  );

ALTER TABLE
  public.reviews
ADD
  CONSTRAINT reviews_pkey PRIMARY KEY (review_id);

  CREATE TABLE
  public.photos (
    id serial NOT NULL,
    url character varying(150) NULL,
    review_id integer NULL
  );

ALTER TABLE
  public.photos
ADD
  CONSTRAINT photos_pkey PRIMARY KEY (id);

  CREATE TABLE
  public.characteristics (
    id serial NOT NULL,
    product_id integer NOT NULL,
    name character varying(50) NOT NULL
  );

ALTER TABLE
  public.characteristics
ADD
  CONSTRAINT characteristics_pkey PRIMARY KEY (id);

  CREATE TABLE
  public.characteristicreviews (
    id serial NOT NULL,
    characteristic_id integer NULL,
    value integer NULL,
    review_id integer NULL
  );

ALTER TABLE
  public.characteristicreviews
ADD
  CONSTRAINT characteristicreviews_pkey PRIMARY KEY (id);

