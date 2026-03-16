--
-- PostgreSQL database dump
--

\restrict cFC2CRKay4cTjkB8PuGHHD6IMnT9gNqeeB16wvJiDkLBUL4UZrR54d5VgSjEtwm

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: openbrain
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at() OWNER TO openbrain;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_users; Type: TABLE; Schema: public; Owner: openbrain
--

CREATE TABLE public.app_users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(50) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.app_users OWNER TO openbrain;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: openbrain
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    role text NOT NULL,
    content text,
    tool_calls jsonb,
    tool_call_id text,
    images text[],
    audio_duration_ms integer,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chat_messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text, 'tool'::text])))
);


ALTER TABLE public.chat_messages OWNER TO openbrain;

--
-- Name: contact_relations; Type: TABLE; Schema: public; Owner: openbrain
--

CREATE TABLE public.contact_relations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    contact_a uuid NOT NULL,
    contact_b uuid NOT NULL,
    relation_type character varying(100) NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.contact_relations OWNER TO openbrain;

--
-- Name: contacts; Type: TABLE; Schema: public; Owner: openbrain
--

CREATE TABLE public.contacts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100),
    company character varying(255),
    role character varying(255),
    linkedin character varying(255),
    address character varying(100),
    warmth integer DEFAULT 50,
    last_contact date,
    how_met text,
    vault_link text,
    tags text[] DEFAULT '{}'::text[],
    notes text,
    created_by character varying(10) DEFAULT 'human'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    birthday date,
    industry character varying(255),
    is_vip boolean DEFAULT false,
    preferred_platform character varying(50),
    relationship_type character varying(100),
    projects text[] DEFAULT '{}'::text[],
    email_private character varying(255),
    email_business character varying(255),
    phone_private character varying(50),
    phone_business character varying(50),
    CONSTRAINT contacts_created_by_check CHECK (((created_by)::text = ANY ((ARRAY['human'::character varying, 'ai'::character varying])::text[]))),
    CONSTRAINT contacts_warmth_check CHECK (((warmth >= 0) AND (warmth <= 100)))
);


ALTER TABLE public.contacts OWNER TO openbrain;

--
-- Name: household_items; Type: TABLE; Schema: public; Owner: openbrain
--

CREATE TABLE public.household_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    category character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    value text,
    location character varying(255),
    brand character varying(255),
    model character varying(255),
    purchase_date date,
    warranty_until date,
    vault_link text,
    tags text[] DEFAULT '{}'::text[],
    notes text,
    created_by character varying(10) DEFAULT 'human'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT household_items_created_by_check CHECK (((created_by)::text = ANY ((ARRAY['human'::character varying, 'ai'::character varying])::text[])))
);


ALTER TABLE public.household_items OWNER TO openbrain;

--
-- Name: interactions; Type: TABLE; Schema: public; Owner: openbrain
--

CREATE TABLE public.interactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    contact_id uuid NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    summary text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.interactions OWNER TO openbrain;

--
-- Name: maintenance_logs; Type: TABLE; Schema: public; Owner: openbrain
--

CREATE TABLE public.maintenance_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    item_ref uuid,
    title character varying(255) NOT NULL,
    description text,
    category character varying(100),
    performed_at date,
    next_due date,
    cost numeric(10,2),
    provider character varying(255),
    vault_link text,
    tags text[] DEFAULT '{}'::text[],
    notes text,
    created_by character varying(10) DEFAULT 'human'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT maintenance_logs_created_by_check CHECK (((created_by)::text = ANY ((ARRAY['human'::character varying, 'ai'::character varying])::text[])))
);


ALTER TABLE public.maintenance_logs OWNER TO openbrain;

--
-- Name: memories; Type: TABLE; Schema: public; Owner: openbrain
--

CREATE TABLE public.memories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    category character varying(100),
    key character varying(255),
    value text NOT NULL,
    confidence numeric(3,2) DEFAULT 1.00,
    source character varying(255),
    vault_link text,
    tags text[] DEFAULT '{}'::text[],
    notes text,
    created_by character varying(10) DEFAULT 'ai'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT memories_created_by_check CHECK (((created_by)::text = ANY ((ARRAY['human'::character varying, 'ai'::character varying])::text[])))
);


ALTER TABLE public.memories OWNER TO openbrain;

--
-- Name: reminders; Type: TABLE; Schema: public; Owner: openbrain
--

CREATE TABLE public.reminders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    due_date timestamp with time zone,
    recurring character varying(50),
    status character varying(20) DEFAULT 'pending'::character varying,
    priority character varying(10) DEFAULT 'normal'::character varying,
    related_table character varying(100),
    related_id uuid,
    vault_link text,
    tags text[] DEFAULT '{}'::text[],
    notes text,
    created_by character varying(10) DEFAULT 'human'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reminders_created_by_check CHECK (((created_by)::text = ANY ((ARRAY['human'::character varying, 'ai'::character varying])::text[]))),
    CONSTRAINT reminders_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'normal'::character varying, 'high'::character varying, 'urgent'::character varying])::text[]))),
    CONSTRAINT reminders_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'snoozed'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.reminders OWNER TO openbrain;

--
-- Name: app_users app_users_pkey; Type: CONSTRAINT; Schema: public; Owner: openbrain
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_pkey PRIMARY KEY (id);


--
-- Name: app_users app_users_username_key; Type: CONSTRAINT; Schema: public; Owner: openbrain
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_username_key UNIQUE (username);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: openbrain
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: contact_relations contact_relations_contact_a_contact_b_relation_type_key; Type: CONSTRAINT; Schema: public; Owner: openbrain
--

ALTER TABLE ONLY public.contact_relations
    ADD CONSTRAINT contact_relations_contact_a_contact_b_relation_type_key UNIQUE (contact_a, contact_b, relation_type);


--
-- Name: contact_relations contact_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: openbrain
--

ALTER TABLE ONLY public.contact_relations
    ADD CONSTRAINT contact_relations_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: openbrain
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: household_items household_items_pkey; Type: CONSTRAINT; Schema: public; Owner: openbrain
--

ALTER TABLE ONLY public.household_items
    ADD CONSTRAINT household_items_pkey PRIMARY KEY (id);


--
-- Name: interactions interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: openbrain
--

ALTER TABLE ONLY public.interactions
    ADD CONSTRAINT interactions_pkey PRIMARY KEY (id);


--
-- Name: maintenance_logs maintenance_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: openbrain
--

ALTER TABLE ONLY public.maintenance_logs
    ADD CONSTRAINT maintenance_logs_pkey PRIMARY KEY (id);


--
-- Name: memories memories_pkey; Type: CONSTRAINT; Schema: public; Owner: openbrain
--

ALTER TABLE ONLY public.memories
    ADD CONSTRAINT memories_pkey PRIMARY KEY (id);


--
-- Name: reminders reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: openbrain
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_pkey PRIMARY KEY (id);


--
-- Name: idx_chat_messages_created; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_chat_messages_created ON public.chat_messages USING btree (created_at DESC);


--
-- Name: idx_contacts_birthday; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_contacts_birthday ON public.contacts USING btree (birthday);


--
-- Name: idx_contacts_last_contact; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_contacts_last_contact ON public.contacts USING btree (last_contact);


--
-- Name: idx_contacts_name_trgm; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_contacts_name_trgm ON public.contacts USING gin (first_name public.gin_trgm_ops);


--
-- Name: idx_contacts_tags; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_contacts_tags ON public.contacts USING gin (tags);


--
-- Name: idx_contacts_vip; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_contacts_vip ON public.contacts USING btree (is_vip) WHERE (is_vip = true);


--
-- Name: idx_contacts_warmth; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_contacts_warmth ON public.contacts USING btree (warmth);


--
-- Name: idx_household_category; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_household_category ON public.household_items USING btree (category);


--
-- Name: idx_household_name_trgm; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_household_name_trgm ON public.household_items USING gin (name public.gin_trgm_ops);


--
-- Name: idx_household_tags; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_household_tags ON public.household_items USING gin (tags);


--
-- Name: idx_interactions_contact; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_interactions_contact ON public.interactions USING btree (contact_id);


--
-- Name: idx_interactions_date; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_interactions_date ON public.interactions USING btree (date);


--
-- Name: idx_memories_category; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_memories_category ON public.memories USING btree (category);


--
-- Name: idx_memories_key; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_memories_key ON public.memories USING btree (key);


--
-- Name: idx_memories_tags; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_memories_tags ON public.memories USING gin (tags);


--
-- Name: idx_memories_value_trgm; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_memories_value_trgm ON public.memories USING gin (value public.gin_trgm_ops);


--
-- Name: idx_reminders_due; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_reminders_due ON public.reminders USING btree (due_date) WHERE ((status)::text = 'pending'::text);


--
-- Name: idx_reminders_status; Type: INDEX; Schema: public; Owner: openbrain
--

CREATE INDEX idx_reminders_status ON public.reminders USING btree (status);


--
-- Name: contacts trg_contacts_updated; Type: TRIGGER; Schema: public; Owner: openbrain
--

CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: household_items trg_household_items_updated; Type: TRIGGER; Schema: public; Owner: openbrain
--

CREATE TRIGGER trg_household_items_updated BEFORE UPDATE ON public.household_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: maintenance_logs trg_maintenance_logs_updated; Type: TRIGGER; Schema: public; Owner: openbrain
--

CREATE TRIGGER trg_maintenance_logs_updated BEFORE UPDATE ON public.maintenance_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: memories trg_memories_updated; Type: TRIGGER; Schema: public; Owner: openbrain
--

CREATE TRIGGER trg_memories_updated BEFORE UPDATE ON public.memories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: reminders trg_reminders_updated; Type: TRIGGER; Schema: public; Owner: openbrain
--

CREATE TRIGGER trg_reminders_updated BEFORE UPDATE ON public.reminders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: contact_relations contact_relations_contact_a_fkey; Type: FK CONSTRAINT; Schema: public; Owner: openbrain
--

ALTER TABLE ONLY public.contact_relations
    ADD CONSTRAINT contact_relations_contact_a_fkey FOREIGN KEY (contact_a) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: contact_relations contact_relations_contact_b_fkey; Type: FK CONSTRAINT; Schema: public; Owner: openbrain
--

ALTER TABLE ONLY public.contact_relations
    ADD CONSTRAINT contact_relations_contact_b_fkey FOREIGN KEY (contact_b) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: interactions interactions_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: openbrain
--

ALTER TABLE ONLY public.interactions
    ADD CONSTRAINT interactions_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: maintenance_logs maintenance_logs_item_ref_fkey; Type: FK CONSTRAINT; Schema: public; Owner: openbrain
--

ALTER TABLE ONLY public.maintenance_logs
    ADD CONSTRAINT maintenance_logs_item_ref_fkey FOREIGN KEY (item_ref) REFERENCES public.household_items(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict cFC2CRKay4cTjkB8PuGHHD6IMnT9gNqeeB16wvJiDkLBUL4UZrR54d5VgSjEtwm

