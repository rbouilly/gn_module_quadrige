SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--------------
--------------

CREATE SCHEMA IF NOT EXISTS gn_template;

SET search_path = gn_template, pg_catalog, public;
SET default_with_oids = false;

------------------------
--TABLES AND SEQUENCES--
------------------------

CREATE TABLE my_table(
    pk serial NOT NULL,
);
