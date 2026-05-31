--
-- PostgreSQL database dump
--

\restrict teZebxNOhaeRmmZeFxxu3w6eIsRSxNeZKqHveS01DV4ogENeJhcMx0LEvYaLJPR

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-31 21:52:28

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 233 (class 1255 OID 16389)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: pg_database_owner
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO pg_database_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16390)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: pg_database_owner
--

CREATE TABLE public.audit_logs (
    log_id integer NOT NULL,
    user_id integer,
    action_type character varying(20) NOT NULL,
    module character varying(50) NOT NULL,
    description text NOT NULL,
    old_value text,
    new_value text,
    ip_address character varying(45),
    user_agent text,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO pg_database_owner;

--
-- TOC entry 220 (class 1259 OID 16400)
-- Name: audit_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: pg_database_owner
--

CREATE SEQUENCE public.audit_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_log_id_seq OWNER TO pg_database_owner;

--
-- TOC entry 3546 (class 0 OID 0)
-- Dependencies: 220
-- Name: audit_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pg_database_owner
--

ALTER SEQUENCE public.audit_logs_log_id_seq OWNED BY public.audit_logs.log_id;


--
-- TOC entry 221 (class 1259 OID 16401)
-- Name: backup_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.backup_codes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    code_hash character varying(64) NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.backup_codes OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16411)
-- Name: backup_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.backup_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.backup_codes_id_seq OWNER TO postgres;

--
-- TOC entry 3547 (class 0 OID 0)
-- Dependencies: 222
-- Name: backup_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.backup_codes_id_seq OWNED BY public.backup_codes.id;


--
-- TOC entry 223 (class 1259 OID 16412)
-- Name: bonds; Type: TABLE; Schema: public; Owner: pg_database_owner
--

CREATE TABLE public.bonds (
    bond_id integer NOT NULL,
    property_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_date date NOT NULL,
    reference_no character varying(50),
    status character varying(20) DEFAULT 'Pending'::character varying,
    refund_amount numeric(10,2),
    refund_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bonds_status_check CHECK (((status)::text = ANY (ARRAY[('Paid'::character varying)::text, ('Pending'::character varying)::text, ('Refunded'::character varying)::text])))
);


ALTER TABLE public.bonds OWNER TO pg_database_owner;

--
-- TOC entry 224 (class 1259 OID 16422)
-- Name: bonds_bond_id_seq; Type: SEQUENCE; Schema: public; Owner: pg_database_owner
--

CREATE SEQUENCE public.bonds_bond_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bonds_bond_id_seq OWNER TO pg_database_owner;

--
-- TOC entry 3548 (class 0 OID 0)
-- Dependencies: 224
-- Name: bonds_bond_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pg_database_owner
--

ALTER SEQUENCE public.bonds_bond_id_seq OWNED BY public.bonds.bond_id;


--
-- TOC entry 225 (class 1259 OID 16423)
-- Name: documents; Type: TABLE; Schema: public; Owner: pg_database_owner
--

CREATE TABLE public.documents (
    document_id integer NOT NULL,
    user_id integer NOT NULL,
    property_id integer,
    bond_id integer,
    title character varying(200) NOT NULL,
    description text,
    file_name character varying(255),
    file_path character varying(500) NOT NULL,
    file_type character varying(50) NOT NULL,
    file_size integer NOT NULL,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    document_type character varying(50) DEFAULT 'other'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.documents OWNER TO pg_database_owner;

--
-- TOC entry 226 (class 1259 OID 16436)
-- Name: documents_document_id_seq; Type: SEQUENCE; Schema: public; Owner: pg_database_owner
--

CREATE SEQUENCE public.documents_document_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_document_id_seq OWNER TO pg_database_owner;

--
-- TOC entry 3549 (class 0 OID 0)
-- Dependencies: 226
-- Name: documents_document_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pg_database_owner
--

ALTER SEQUENCE public.documents_document_id_seq OWNED BY public.documents.document_id;


--
-- TOC entry 227 (class 1259 OID 16437)
-- Name: inspections; Type: TABLE; Schema: public; Owner: pg_database_owner
--

CREATE TABLE public.inspections (
    inspection_id integer NOT NULL,
    property_id integer NOT NULL,
    inspection_date date NOT NULL,
    inspection_type character varying(20) NOT NULL,
    condition_notes text,
    photo_path character varying(500),
    overall_rating integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer,
    CONSTRAINT inspections_inspection_type_check CHECK (((inspection_type)::text = ANY (ARRAY[('Entry'::character varying)::text, ('Routine'::character varying)::text, ('Exit'::character varying)::text]))),
    CONSTRAINT inspections_rating_check CHECK (((overall_rating >= 1) AND (overall_rating <= 5)))
);


ALTER TABLE public.inspections OWNER TO pg_database_owner;

--
-- TOC entry 228 (class 1259 OID 16449)
-- Name: inspections_inspection_id_seq; Type: SEQUENCE; Schema: public; Owner: pg_database_owner
--

CREATE SEQUENCE public.inspections_inspection_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inspections_inspection_id_seq OWNER TO pg_database_owner;

--
-- TOC entry 3550 (class 0 OID 0)
-- Dependencies: 228
-- Name: inspections_inspection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pg_database_owner
--

ALTER SEQUENCE public.inspections_inspection_id_seq OWNED BY public.inspections.inspection_id;


--
-- TOC entry 229 (class 1259 OID 16450)
-- Name: properties; Type: TABLE; Schema: public; Owner: pg_database_owner
--

CREATE TABLE public.properties (
    property_id integer NOT NULL,
    user_id integer NOT NULL,
    address text NOT NULL,
    landlord_name character varying(100) NOT NULL,
    landlord_phone character varying(20),
    landlord_email character varying(100),
    agent_name character varying(100),
    agent_phone character varying(20),
    lease_start date,
    lease_end date,
    is_current boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.properties OWNER TO pg_database_owner;

--
-- TOC entry 230 (class 1259 OID 16461)
-- Name: properties_property_id_seq; Type: SEQUENCE; Schema: public; Owner: pg_database_owner
--

CREATE SEQUENCE public.properties_property_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.properties_property_id_seq OWNER TO pg_database_owner;

--
-- TOC entry 3551 (class 0 OID 0)
-- Dependencies: 230
-- Name: properties_property_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pg_database_owner
--

ALTER SEQUENCE public.properties_property_id_seq OWNED BY public.properties.property_id;


--
-- TOC entry 231 (class 1259 OID 16462)
-- Name: users; Type: TABLE; Schema: public; Owner: pg_database_owner
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    phone character varying(20),
    profile_pic character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    role character varying(20) DEFAULT 'user'::character varying,
    two_factor_secret character varying(100),
    two_factor_enabled boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO pg_database_owner;

--
-- TOC entry 232 (class 1259 OID 16475)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: pg_database_owner
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO pg_database_owner;

--
-- TOC entry 3552 (class 0 OID 0)
-- Dependencies: 232
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pg_database_owner
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 3320 (class 2604 OID 16476)
-- Name: audit_logs log_id; Type: DEFAULT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN log_id SET DEFAULT nextval('public.audit_logs_log_id_seq'::regclass);


--
-- TOC entry 3322 (class 2604 OID 16477)
-- Name: backup_codes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup_codes ALTER COLUMN id SET DEFAULT nextval('public.backup_codes_id_seq'::regclass);


--
-- TOC entry 3325 (class 2604 OID 16478)
-- Name: bonds bond_id; Type: DEFAULT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.bonds ALTER COLUMN bond_id SET DEFAULT nextval('public.bonds_bond_id_seq'::regclass);


--
-- TOC entry 3328 (class 2604 OID 16479)
-- Name: documents document_id; Type: DEFAULT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.documents ALTER COLUMN document_id SET DEFAULT nextval('public.documents_document_id_seq'::regclass);


--
-- TOC entry 3332 (class 2604 OID 16480)
-- Name: inspections inspection_id; Type: DEFAULT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.inspections ALTER COLUMN inspection_id SET DEFAULT nextval('public.inspections_inspection_id_seq'::regclass);


--
-- TOC entry 3334 (class 2604 OID 16481)
-- Name: properties property_id; Type: DEFAULT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.properties ALTER COLUMN property_id SET DEFAULT nextval('public.properties_property_id_seq'::regclass);


--
-- TOC entry 3337 (class 2604 OID 16482)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 3527 (class 0 OID 16390)
-- Dependencies: 219
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: pg_database_owner
--

COPY public.audit_logs (log_id, user_id, action_type, module, description, old_value, new_value, ip_address, user_agent, "timestamp") FROM stdin;
1	2	CREATE	User Account	User registered successfully	\N	\N	::1	\N	2026-05-04 18:48:02.211018
2	2	LOGIN	Authentication	User logged in successfully	\N	\N	::1	\N	2026-05-04 18:48:19.348021
3	2	LOGIN	Authentication	User logged in successfully	\N	\N	::1	\N	2026-05-04 19:06:38.992982
4	3	CREATE	User Account	User registered successfully	\N	\N	::1	\N	2026-05-04 19:08:44.163066
5	3	LOGIN	Authentication	User logged in successfully	\N	\N	::1	\N	2026-05-04 19:08:56.207057
6	4	CREATE	User Account	User registered successfully	\N	\N	::1	\N	2026-05-05 14:09:27.102287
7	4	LOGIN	Authentication	User logged in successfully	\N	\N	::1	\N	2026-05-05 14:13:24.832966
8	3	LOGIN	Authentication	User logged in successfully	\N	\N	::1	\N	2026-05-05 14:15:08.38572
9	3	LOGIN	Authentication	User logged in successfully	\N	\N	::1	\N	2026-05-05 15:09:14.786885
10	35	CREATE	Users	User registered — MFA pending	\N	\N	::1	\N	2026-05-26 21:15:12.48897
11	35	CREATE	Property	Added property: 3 Backway Court, Maryborough VIC 3465	\N	\N	::1	\N	2026-05-26 21:16:04.817094
12	35	CREATE	Bond	Added bond for property #32	\N	\N	::1	\N	2026-05-26 21:16:29.993078
13	35	CREATE	Inspection	Added Routine inspection for property #32	\N	\N	::1	\N	2026-05-26 21:18:30.065995
14	35	LOGIN	Authentication	Logged in successfully	\N	\N	::ffff:100.64.0.5	\N	2026-05-30 03:59:36.04134
15	36	CREATE	Users	User registered — MFA pending	\N	\N	::ffff:100.64.0.9	\N	2026-05-30 04:17:59.370217
16	37	CREATE	Users	User registered — MFA pending	\N	\N	::ffff:100.64.0.10	\N	2026-05-30 04:21:06.1974
17	38	CREATE	Users	User registered — MFA pending	\N	\N	::ffff:100.64.0.11	\N	2026-05-30 04:24:00.15221
18	35	LOGIN	Authentication	Logged in successfully	\N	\N	::ffff:100.64.0.13	\N	2026-05-30 04:30:45.794325
19	39	CREATE	Users	User registered — MFA pending	\N	\N	::ffff:100.64.0.8	\N	2026-05-30 05:23:25.179259
20	35	LOGIN	Authentication	Logged in successfully	\N	\N	::ffff:100.64.0.14	\N	2026-05-30 05:45:43.346884
21	35	UPDATE	Bond	Updated bond #2 — status: Pending	\N	\N	::ffff:100.64.0.14	\N	2026-05-30 05:46:12.468266
22	38	LOGIN	Authentication	Logged in successfully	\N	\N	::ffff:100.64.0.16	\N	2026-05-30 07:27:16.573351
23	35	LOGIN	Authentication	Logged in successfully	\N	\N	::ffff:100.64.0.4	\N	2026-05-30 08:55:03.892097
24	38	LOGIN	Authentication	Logged in successfully	\N	\N	::ffff:100.64.0.16	\N	2026-05-30 11:38:28.341623
25	40	CREATE	Users	User registered — MFA pending	\N	\N	::ffff:100.64.0.7	\N	2026-05-30 12:48:11.778764
26	41	CREATE	Users	User registered — MFA pending	\N	\N	::ffff:100.64.0.7	\N	2026-05-31 05:00:18.062559
27	40	CREATE	Property	Added property: 36 Epsom street	\N	\N	::ffff:100.64.0.3	\N	2026-05-31 08:30:50.558424
28	40	CREATE	Bond	Added bond for property #33	\N	\N	::ffff:100.64.0.3	\N	2026-05-31 08:31:26.279882
29	40	CREATE	Bond	Added bond for property #33	\N	\N	::ffff:100.64.0.3	\N	2026-05-31 08:32:43.669775
30	40	UPDATE	Property	Updated property #33	\N	\N	::ffff:100.64.0.9	\N	2026-05-31 08:56:33.463197
31	40	CREATE	Property	Added property: 116 francis street yarraville	\N	\N	::ffff:100.64.0.9	\N	2026-05-31 08:57:39.820396
32	40	CREATE	Inspection	Added Routine inspection for property #34	\N	\N	::ffff:100.64.0.9	\N	2026-05-31 08:58:34.634472
33	35	LOGIN	Authentication	Logged in successfully	\N	\N	::ffff:100.64.0.3	\N	2026-05-31 09:55:12.71988
34	35	LOGIN	Authentication	Logged in successfully	\N	\N	::ffff:100.64.0.3	\N	2026-05-31 10:37:39.740813
35	38	LOGIN	Authentication	Logged in successfully	\N	\N	::ffff:100.64.0.4	\N	2026-05-31 11:10:41.020728
36	35	LOGIN	Authentication	Logged in successfully	\N	\N	::ffff:100.64.0.8	\N	2026-05-31 11:25:08.591363
\.


--
-- TOC entry 3529 (class 0 OID 16401)
-- Dependencies: 221
-- Data for Name: backup_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backup_codes (id, user_id, code_hash, used, created_at) FROM stdin;
9	31	39b7c8f69f4e46cac60c4fb1a2539bb6db152315e35de1f3eef8dc551507f0b9	f	2026-05-26 11:30:47.271712+00
10	31	a07460a454fd34d26c046eea072980a52218f7a06eb1045517dc5aa751f8b8de	f	2026-05-26 11:30:47.271983+00
11	31	2e577e28328040b0afb399532360900a348e447077381378993c6c9a22a370b5	f	2026-05-26 11:30:47.415957+00
12	31	2ee5d8c37f8e5022ae0f2cb9c8edf81a2045c5faabe62ec38f86ae535c16b7f0	f	2026-05-26 11:30:47.449185+00
13	31	43f90bf7d53d872c6b804b05668247927c94d44543d7220f0f38202e7f4ee222	f	2026-05-26 11:30:47.481745+00
14	31	c4e3c676201191581455640d5a38cb7e6d9c22913478189a60d867785dbbfd5c	f	2026-05-26 11:30:47.513345+00
15	31	32323c354ea9a3a711fa505aec730d76524aedac3434909de7ab6844c58ab457	f	2026-05-26 11:30:47.546999+00
16	31	c590feb52e7d20886ce4460dd8f27daef43de802d89e17460c6f41e7a4404670	f	2026-05-26 11:30:47.575437+00
17	36	19b525b44889bb10b012f987c2768fdf9ee3b696e51930303dae54ef52898c3f	f	2026-05-30 04:17:58.637149+00
18	36	12352d8ad97756e2385f14d7b13bf8835456694d11836703859e941ee328d192	f	2026-05-30 04:17:58.653315+00
19	36	1f62f1b81a7bd4e45c681db7ccdc19a5aafa6be3cf8647ec185cef249dc14db2	f	2026-05-30 04:17:58.654838+00
20	36	f2b31789e7a8cfc53c6d9ef4befeaac850b0e7716bb975f286c955a77613c00c	f	2026-05-30 04:17:58.654962+00
21	36	b9298d74b9520cc5d69797b011e05a9b5fde8fbe7917f03845ae3636be3038d1	f	2026-05-30 04:17:58.655566+00
22	36	03af1eb70d76c4e9a0d25cfbdb342b6522fff16665628c0961d512840b89d80d	f	2026-05-30 04:17:58.657501+00
23	36	a220efa8870a20b8a1d49f79b5f94e396fa35d251a377a8a20060cf50ae8800d	f	2026-05-30 04:17:58.658292+00
24	36	0fb65eece0900bdc51ac3faf2bf091ccda0ea019a6a1ba628daed38e3442ee71	f	2026-05-30 04:17:59.220196+00
25	37	f83b332146e3d320932b6cab449514acdc6324118ab364d692895464ef8c511b	f	2026-05-30 04:21:05.448046+00
26	37	39c41e418403392541b4ff24d14a78e78cf40d68865e42c3712286e2233e94ed	f	2026-05-30 04:21:05.463139+00
27	37	02fbd1987914668e82331fcd7becd565d29b22daa9be32b1e73134309de81c94	f	2026-05-30 04:21:05.464308+00
28	37	83de766088920ec129b13040f442afefb585231ad47e9f099361359caca3b374	f	2026-05-30 04:21:05.466005+00
29	37	85720d747cd76eff9609ab002021aafc7606c633f491eac1c5ddd323b31faf72	f	2026-05-30 04:21:05.466647+00
30	37	512149acf73538c28298791df550b798655e38719c028c600843bcec6f989ffd	f	2026-05-30 04:21:05.4691+00
31	37	0fb76868084a9b7455f2684775b1067b2f02a593d797a4aa603c8b23f8cf7cc5	f	2026-05-30 04:21:05.470473+00
32	37	0e4c9bfb5f7500be736fbb946ed84c58fd6b10630010cfb1466ee1f549b61c6a	f	2026-05-30 04:21:06.054035+00
33	38	bace12d4a22c8ac29a74e5895c4f8fb0175aa1d2cd57c439178043ba8678abd9	f	2026-05-30 04:23:59.410071+00
34	38	c3090955756217390efc13fe4903f35a5edbd84024284445e0bf7f03110cccef	f	2026-05-30 04:23:59.426451+00
35	38	9f0a70be6aaae53c6f585a6609b2cd6336635b46ffb9496e3be808ef0435d102	f	2026-05-30 04:23:59.427566+00
36	38	4d3def8d3a761bf9dcb3f70f791d5c21eac562ccd8565671af0e7f6fe3ae5b9e	f	2026-05-30 04:23:59.42777+00
37	38	ee924515c03bace2621ffc20c5b1a3c76058de8bad7be9eef1374143c139bdf2	f	2026-05-30 04:23:59.428466+00
38	38	3bc51161d471ba68b9296b2b1795ff3a49e9dd40369b939a7f52a7ad5f052e55	f	2026-05-30 04:23:59.429606+00
39	38	196f1a216ce4a94b903fdf0f85af1cf764b222a49119bb03e379e29a7ee1f522	f	2026-05-30 04:23:59.430095+00
40	38	47384ffa26da4435df54b4cd2af0e2a304d68fcfbc23fbb4d01bafa1768359dd	f	2026-05-30 04:24:00.012108+00
41	39	625e6abd0f6ad09b9c4f3465100dbefbf91a259b1c835d6c657cc6030fa49614	f	2026-05-30 05:23:24.420496+00
42	39	ed2d51e722d4c4a5393578f10e7341975592b3f86dfc9580afa76820727fda27	f	2026-05-30 05:23:24.438416+00
43	39	3c5faa15abd4f7795c97649b59fa89184cae98b1b39d93c48eaad759bdc4159f	f	2026-05-30 05:23:24.439013+00
44	39	ded5ab1c22811388b96d7292ef27c4388d7ad0e4d169ea8a9f09c20201ce7540	f	2026-05-30 05:23:24.457488+00
45	39	475dd12342f464f2c5353e43fa10d94fb760031ded37b2252cddffadbee28b25	f	2026-05-30 05:23:24.462214+00
46	39	d77c5d6b5801ba2db3034e06494c031b47797b8e71074693401f5598882e9f20	f	2026-05-30 05:23:25.007982+00
47	39	5a702c95220e13d6f430b17c5964427ea143b00221aedf89308eb4832cf267b4	f	2026-05-30 05:23:25.025442+00
48	39	3580afc2738b522b920e83966f8260f066cdcfd38a83076f8f4daef7c3f27327	f	2026-05-30 05:23:25.036862+00
50	35	0b5dbc8ef5612873527c6d9192b8ddf0ecc4a109f6e6afc17b5ae662fdcc5ee7	f	2026-05-30 08:55:16.320951+00
51	35	6f45fe32659a0831f9048c8ae22f6d9fb0392bb64b2077ad1d62eee486a0d7a9	f	2026-05-30 08:55:16.332756+00
53	35	b6eab0445cc38af599342c48f9bf421f52b637a4a63e808ab316fa9d711bd3ea	f	2026-05-30 08:55:16.353087+00
55	35	9a34f6ad48bc5fe97321ced1f610f829e443feaf3244b48694a8cbe2612682b4	f	2026-05-30 08:55:16.895989+00
54	35	bf2369f20de46927e464236209f475c18b3f07d9e89a03c34929a3f2edd2a6b0	f	2026-05-30 08:55:16.895872+00
56	35	a4b8bfaff9a034123bbfc32b45c7d5261bc817b188b94e12564f79814666d0f5	f	2026-05-30 08:55:16.916024+00
52	35	31f3434592e08eb4069ea6e57b728ce65137d6a13b70422827492e9d493fb337	t	2026-05-30 08:55:16.350511+00
49	35	cdf91b23b4dc1183d7e5a48121023a0a330fe19a592038a6707a1c0eb8efe389	t	2026-05-30 08:55:16.308156+00
57	40	bcb6cb198d46a6e5add91a61403342789118f829033d4eb690163e059ae110ea	f	2026-05-30 12:48:11.034873+00
58	40	e6eb2d0b8f8a0fb2137e70a5f9ecebe03d5448f730f60db3af3b63bb99076d89	f	2026-05-30 12:48:11.078319+00
59	40	42bb30b0dcc8d79fe805c233f96b0907921f60119766414505b1fe394a7b9077	f	2026-05-30 12:48:11.082508+00
60	40	fef3284326be49c6e2aa97f6ed7ca1a370576099a61f6701ed5a52099451cca4	f	2026-05-30 12:48:11.082741+00
61	40	de52685abf47c226a918b26284a3b63f0ac5b62171d5776984709e9b8df51d9c	f	2026-05-30 12:48:11.087358+00
62	40	c7cd1dacdf6745cd1838ce5cacc4abd3f8a7f65133ca3c8818876203b3715c23	f	2026-05-30 12:48:11.619026+00
63	40	9c741df4faaee7f088d2f0e9e6a6012d8dbe75a43031fa94b346c0ec19095fb3	f	2026-05-30 12:48:11.637895+00
64	40	e78e89e002cce61d8bff9d67b40d2669d73123dceaa8b0d707d534a12fba7af6	f	2026-05-30 12:48:11.639592+00
65	41	30ddc67c41a250bb0c94888ee8dbb5b18c74a2396421c8131392c01c58624705	f	2026-05-31 05:00:17.356547+00
66	41	8678040805ad27fcc279787b22c6103cca522ef5e4424c1a2d36ec791560039d	f	2026-05-31 05:00:17.35782+00
67	41	506a95785e7a1abe6432208c64cff68dcc639e00a5c7efd7a0ce615a8530c4b1	f	2026-05-31 05:00:17.358274+00
68	41	9435642f5e40261f367bc46d18ffaba490c946cc0d0f115b628370ff32973dc3	f	2026-05-31 05:00:17.359184+00
69	41	433f8c1f9330e6d48150de2c8f48ac3a89fba3451b1a156aef7234aee23f229e	f	2026-05-31 05:00:17.380608+00
70	41	89eee5d9f3a293b816c4c7e3f221adb1a5c08d2d522a424a4b01100a87ace84c	f	2026-05-31 05:00:17.908879+00
71	41	8dc8f508971ef1c1a408cca395cbdf2838c73ab80aa0419fc2a89fc5bdf985ec	f	2026-05-31 05:00:17.920796+00
72	41	212e1b8797f8f2cc3edfbe74c62daea6f5eb94ad6f3cdb683ba9af372249d368	f	2026-05-31 05:00:17.923044+00
\.


--
-- TOC entry 3531 (class 0 OID 16412)
-- Dependencies: 223
-- Data for Name: bonds; Type: TABLE DATA; Schema: public; Owner: pg_database_owner
--

COPY public.bonds (bond_id, property_id, amount, payment_date, reference_no, status, refund_amount, refund_date, created_at) FROM stdin;
1	1	2400.00	2026-01-05	BOND001234	Paid	\N	\N	2026-05-04 18:35:40.551163
3	1	2400.00	2026-01-20	BOND-CRG-001	Paid	\N	\N	2026-05-26 21:29:03.40371
4	2	2200.00	2025-11-05	BOND-BRD-002	Paid	\N	\N	2026-05-26 21:29:03.40371
5	3	2600.00	2026-02-05	BOND-CRG-003	Paid	\N	\N	2026-05-26 21:29:03.40371
6	4	2000.00	2025-09-10	BOND-RXP-004	Refunded	2000.00	2026-09-20	2026-05-26 21:29:03.40371
7	5	2300.00	2026-03-20	BOND-CLR-005	Pending	\N	\N	2026-05-26 21:29:03.40371
8	6	2500.00	2025-12-10	BOND-BRD-006	Paid	\N	\N	2026-05-26 21:29:03.40371
9	7	2100.00	2026-01-15	BOND-CRG-007	Paid	\N	\N	2026-05-26 21:29:03.40371
10	8	1900.00	2025-10-10	BOND-CRG-008	Refunded	1800.00	2026-10-20	2026-05-26 21:29:03.40371
11	9	2700.00	2026-02-25	BOND-RXP-009	Pending	\N	\N	2026-05-26 21:29:03.40371
12	10	2200.00	2025-08-20	BOND-CRG-010	Paid	\N	\N	2026-05-26 21:29:03.40371
13	11	2800.00	2026-03-05	BOND-ABB-011	Paid	\N	\N	2026-05-26 21:29:03.40371
14	12	2500.00	2025-09-15	BOND-FIT-012	Paid	\N	\N	2026-05-26 21:29:03.40371
15	13	2600.00	2026-01-10	BOND-BRU-013	Pending	\N	\N	2026-05-26 21:29:03.40371
16	14	2300.00	2025-11-25	BOND-COB-014	Refunded	2300.00	2026-12-05	2026-05-26 21:29:03.40371
17	15	2900.00	2026-02-18	BOND-MOO-015	Paid	\N	\N	2026-05-26 21:29:03.40371
18	16	2400.00	2025-10-30	BOND-ASC-016	Paid	\N	\N	2026-05-26 21:29:03.40371
19	17	2700.00	2026-03-15	BOND-CAR-017	Pending	\N	\N	2026-05-26 21:29:03.40371
20	18	2100.00	2025-12-10	BOND-CAR-018	Refunded	2000.00	2026-12-20	2026-05-26 21:29:03.40371
21	19	2600.00	2026-01-25	BOND-NOR-019	Paid	\N	\N	2026-05-26 21:29:03.40371
22	20	2500.00	2025-09-20	BOND-FIT-020	Paid	\N	\N	2026-05-26 21:29:03.40371
23	21	3000.00	2026-03-01	BOND-WIN-021	Paid	\N	\N	2026-05-26 21:29:03.40371
24	22	2800.00	2025-11-15	BOND-SOU-022	Refunded	2800.00	2026-11-25	2026-05-26 21:29:03.40371
25	23	2700.00	2026-03-10	BOND-RIC-023	Pending	\N	\N	2026-05-26 21:29:03.40371
26	24	2600.00	2025-10-15	BOND-RIC-024	Paid	\N	\N	2026-05-26 21:29:03.40371
27	25	2900.00	2026-02-05	BOND-SOU-025	Paid	\N	\N	2026-05-26 21:29:03.40371
28	26	2400.00	2025-12-20	BOND-HAW-026	Refunded	2400.00	2026-12-30	2026-05-26 21:29:03.40371
29	27	2800.00	2026-02-22	BOND-HAW-027	Pending	\N	\N	2026-05-26 21:29:03.40371
30	28	2600.00	2025-09-25	BOND-CAM-028	Paid	\N	\N	2026-05-26 21:29:03.40371
31	29	2500.00	2026-03-30	BOND-CHA-029	Paid	\N	\N	2026-05-26 21:29:03.40371
32	30	2700.00	2025-12-05	BOND-CAU-030	Refunded	2500.00	2026-12-15	2026-05-26 21:29:03.40371
2	32	4800.00	2024-01-02	4567890	Pending	\N	\N	2026-05-26 21:16:29.975448
33	33	2333.00	2022-03-31	12345678	Paid	\N	\N	2026-05-31 08:31:26.272321
\.


--
-- TOC entry 3533 (class 0 OID 16423)
-- Dependencies: 225
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: pg_database_owner
--

COPY public.documents (document_id, user_id, property_id, bond_id, title, description, file_name, file_path, file_type, file_size, uploaded_at, document_type, created_at) FROM stdin;
\.


--
-- TOC entry 3535 (class 0 OID 16437)
-- Dependencies: 227
-- Data for Name: inspections; Type: TABLE DATA; Schema: public; Owner: pg_database_owner
--

COPY public.inspections (inspection_id, property_id, inspection_date, inspection_type, condition_notes, photo_path, overall_rating, created_at, user_id) FROM stdin;
1	1	2026-03-15	Routine	Property in good condition, minor wear and tear	/uploads/inspections/sample_photo.jpg	4	2026-05-04 18:35:40.551163	\N
2	32	2025-04-05	Routine	excellent	uploads/inspections/1779794309750-2020517281_1_1_260109_123111-w2000-h1500.webp	5	2026-05-26 21:18:30.050636	\N
3	1	2026-05-01	Routine	Property in excellent condition, clean and tidy. No issues found.	/uploads/inspections/1_1.jpg	5	2026-05-26 21:27:08.477956	\N
4	1	2026-02-15	Entry	Initial inspection. Carpet needs cleaning, walls need minor touch-up.	/uploads/inspections/1_2.jpg	3	2026-05-26 21:27:08.477956	\N
5	2	2026-04-10	Routine	Good condition overall. Garden needs maintenance.	\N	4	2026-05-26 21:27:08.477956	\N
6	2	2025-12-01	Entry	Property clean and ready for tenant.	/uploads/inspections/2_1.jpg	4	2026-05-26 21:27:08.477956	\N
7	3	2026-05-10	Routine	Kitchen tap leaking, needs repair.	/uploads/inspections/3_1.jpg	3	2026-05-26 21:27:08.477956	\N
8	3	2026-02-28	Entry	Fresh paint, new carpet.	\N	5	2026-05-26 21:27:08.477956	\N
9	4	2026-01-20	Routine	Very good condition, tenant maintaining well.	\N	5	2026-05-26 21:27:08.477956	\N
10	4	2025-09-15	Entry	New tenant, property clean.	/uploads/inspections/4_1.jpg	4	2026-05-26 21:27:08.477956	\N
11	5	2026-04-25	Entry	Minor marks on walls, overall acceptable.	/uploads/inspections/5_1.jpg	3	2026-05-26 21:27:08.477956	\N
12	5	2026-02-10	Routine	Heating system working fine.	\N	4	2026-05-26 21:27:08.477956	\N
13	6	2026-02-28	Routine	Property well maintained.	\N	4	2026-05-26 21:27:08.477956	\N
14	6	2025-11-05	Entry	Tenant moved in, property condition good.	/uploads/inspections/6_1.jpg	4	2026-05-26 21:27:08.477956	\N
15	7	2026-03-15	Routine	Living room carpet stain, need cleaning.	/uploads/inspections/7_1.jpg	3	2026-05-26 21:27:08.477956	\N
16	7	2026-01-10	Entry	Fresh paint throughout.	\N	5	2026-05-26 21:27:08.477956	\N
17	8	2025-12-10	Routine	All good, no issues.	\N	5	2026-05-26 21:27:08.477956	\N
18	8	2025-10-05	Entry	Property needs minor repairs.	/uploads/inspections/8_1.jpg	3	2026-05-26 21:27:08.477956	\N
19	9	2026-05-05	Entry	Minor scratches on floorboards.	/uploads/inspections/9_1.jpg	4	2026-05-26 21:27:08.477956	\N
20	9	2026-03-20	Routine	Kitchen appliances working.	\N	4	2026-05-26 21:27:08.477956	\N
21	10	2026-03-20	Routine	Kitchen sink clogged, plumber called.	/uploads/inspections/10_1.jpg	2	2026-05-26 21:27:08.477956	\N
22	10	2025-08-25	Entry	Property clean, ready for tenant.	\N	4	2026-05-26 21:27:08.477956	\N
23	11	2026-04-01	Entry	Wall cracks in bedroom, needs repair.	\N	3	2026-05-26 21:27:08.477956	\N
24	11	2026-02-15	Routine	Heating system inspected, fine.	/uploads/inspections/11_1.jpg	4	2026-05-26 21:27:08.477956	\N
25	12	2026-05-12	Routine	Garden overgrown, tenant advised to maintain.	/uploads/inspections/12_1.jpg	3	2026-05-26 21:27:08.477956	\N
26	12	2025-09-20	Entry	Property in good condition.	\N	4	2026-05-26 21:27:08.477956	\N
27	13	2026-02-10	Entry	New tenant, property clean.	\N	5	2026-05-26 21:27:08.477956	\N
28	13	2026-04-18	Routine	All appliances working.	/uploads/inspections/13_1.jpg	5	2026-05-26 21:27:08.477956	\N
29	14	2026-01-05	Routine	Dishwasher not working, replaced.	/uploads/inspections/14_1.jpg	4	2026-05-26 21:27:08.477956	\N
30	14	2025-11-30	Entry	Property freshly painted.	\N	4	2026-05-26 21:27:08.477956	\N
31	15	2026-03-25	Entry	Paint chipping on windows, will repaint.	\N	3	2026-05-26 21:27:08.477956	\N
32	15	2026-01-15	Routine	Smoke detectors tested, working.	/uploads/inspections/15_1.jpg	5	2026-05-26 21:27:08.477956	\N
33	16	2026-05-20	Routine	Excellent condition, tenant takes good care.	/uploads/inspections/16_1.jpg	5	2026-05-26 21:27:08.477956	\N
34	16	2025-10-10	Entry	Property ready for tenant.	\N	4	2026-05-26 21:27:08.477956	\N
35	17	2026-02-18	Entry	Newly renovated, modern appliances.	\N	5	2026-05-26 21:27:08.477956	\N
36	17	2026-04-22	Routine	All good, no issues.	/uploads/inspections/17_1.jpg	5	2026-05-26 21:27:08.477956	\N
37	18	2026-01-12	Routine	Heating system faulty, repaired.	/uploads/inspections/18_1.jpg	3	2026-05-26 21:27:08.477956	\N
38	18	2025-12-05	Entry	Minor scratches on floor.	\N	4	2026-05-26 21:27:08.477956	\N
39	19	2026-03-08	Entry	Clean and tidy, ready for tenant.	\N	4	2026-05-26 21:27:08.477956	\N
40	19	2026-05-01	Routine	Garden needs weeding.	/uploads/inspections/19_1.jpg	3	2026-05-26 21:27:08.477956	\N
41	20	2026-04-22	Routine	Leaking tap in bathroom, fixed.	/uploads/inspections/20_1.jpg	3	2026-05-26 21:27:08.477956	\N
42	20	2025-09-25	Entry	Property in good condition.	\N	4	2026-05-26 21:27:08.477956	\N
43	21	2026-05-15	Entry	Property in pristine condition.	\N	5	2026-05-26 21:27:08.477956	\N
44	21	2026-03-10	Routine	Check fire alarms, all working.	/uploads/inspections/21_1.jpg	5	2026-05-26 21:27:08.477956	\N
45	22	2026-02-05	Routine	Some mould in bathroom, treated.	/uploads/inspections/22_1.jpg	2	2026-05-26 21:27:08.477956	\N
46	22	2025-11-20	Entry	Property needs cleaning.	\N	3	2026-05-26 21:27:08.477956	\N
47	23	2026-03-30	Entry	Fresh paint, new floorboards.	\N	5	2026-05-26 21:27:08.477956	\N
48	23	2026-05-18	Routine	All appliances functional.	/uploads/inspections/23_1.jpg	5	2026-05-26 21:27:08.477956	\N
49	24	2026-01-28	Routine	Garage door not opening, repaired.	/uploads/inspections/24_1.jpg	3	2026-05-26 21:27:08.477956	\N
50	24	2025-10-15	Entry	Property clean.	\N	4	2026-05-26 21:27:08.477956	\N
51	25	2026-04-10	Entry	Property clean, minor wear and tear.	\N	4	2026-05-26 21:27:08.477956	\N
52	25	2026-02-20	Routine	Water pressure low, plumber checked.	/uploads/inspections/25_1.jpg	3	2026-05-26 21:27:08.477956	\N
53	26	2026-02-22	Routine	Stove not working, replaced.	/uploads/inspections/26_1.jpg	2	2026-05-26 21:27:08.477956	\N
54	26	2025-12-01	Entry	Property needs new carpets.	\N	3	2026-05-26 21:27:08.477956	\N
55	27	2026-03-12	Entry	New carpet installed.	\N	5	2026-05-26 21:27:08.477956	\N
56	27	2026-05-25	Routine	All good, tenant happy.	/uploads/inspections/27_1.jpg	5	2026-05-26 21:27:08.477956	\N
57	28	2026-05-25	Routine	All appliances working, good condition.	/uploads/inspections/28_1.jpg	4	2026-05-26 21:27:08.477956	\N
58	28	2025-09-30	Entry	Fresh paint, ready for tenant.	\N	4	2026-05-26 21:27:08.477956	\N
59	29	2026-01-18	Entry	Needs thorough cleaning before move-in.	\N	3	2026-05-26 21:27:08.477956	\N
60	29	2026-03-28	Routine	Leaking faucet fixed.	/uploads/inspections/29_1.jpg	4	2026-05-26 21:27:08.477956	\N
61	30	2026-04-05	Routine	Water leak from ceiling, plumber called.	/uploads/inspections/30_1.jpg	2	2026-05-26 21:27:08.477956	\N
62	30	2025-12-10	Entry	Property needs minor repairs.	\N	3	2026-05-26 21:27:08.477956	\N
63	34	2222-02-12	Routine	\N	uploads/inspections/1780217913431-Screenshot_2026-03-31_181925.png	3	2026-05-31 08:58:34.496965	\N
\.


--
-- TOC entry 3537 (class 0 OID 16450)
-- Dependencies: 229
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: pg_database_owner
--

COPY public.properties (property_id, user_id, address, landlord_name, landlord_phone, landlord_email, agent_name, agent_phone, lease_start, lease_end, is_current, created_at) FROM stdin;
1	1	123 Main Street, Melbourne VIC 3000	Robert Landlord	0399991111	\N	Real Estate Agency	\N	2026-01-01	2027-01-01	t	2026-05-04 18:35:40.551163
2	1	5 Walton Close, Craigieburn VIC 3064	Robert Johnson	0412345678	robert@example.com	Ray White	0393011234	2026-01-15	2027-01-15	t	2026-05-26 21:06:06.949622
3	2	52 Tatura Crescent, Broadmeadows VIC 3047	Sarah Williams	0423456789	sarah@example.com	Barry Plant	0393095678	2025-11-01	2026-11-01	t	2026-05-26 21:06:06.949622
4	3	8 Bellfield Drive, Craigieburn VIC 3064	Michael Chen	0434567890	michael@example.com	LJ Hooker	0393018765	2026-02-01	2027-02-01	t	2026-05-26 21:06:06.949622
5	4	15 Roxburgh Park Drive, Roxburgh Park VIC 3064	Emily Brown	0445678901	emily@example.com	Nelson Alexander	0393094321	2025-09-01	2026-09-01	f	2026-05-26 21:06:06.949622
6	5	3 Merri Street, Coolaroo VIC 3048	David Wilson	0456789012	david@example.com	Stockdale & Leggo	0393019876	2026-03-15	2027-03-15	t	2026-05-26 21:06:06.949622
7	6	22 Dimboola Road, Broadmeadows VIC 3047	Linda Taylor	0467890123	linda@example.com	Harcourts	0393096543	2025-12-01	2026-12-01	t	2026-05-26 21:06:06.949622
8	7	17 Pascoe Vale Road, Coolaroo VIC 3048	James Anderson	0478901234	james@example.com	Ray White	0393012345	2026-01-10	2027-01-10	t	2026-05-26 21:06:06.949622
9	8	9 Daley Street, Craigieburn VIC 3064	Patricia Thomas	0489012345	patricia@example.com	Barry Plant	0393098765	2025-10-05	2026-10-05	f	2026-05-26 21:06:06.949622
10	9	31 Macedon Parade, Roxburgh Park VIC 3064	Robert Martinez	0490123456	robert.m@example.com	LJ Hooker	0393015432	2026-02-20	2027-02-20	t	2026-05-26 21:06:06.949622
11	10	6 Aitken Boulevard, Craigieburn VIC 3064	Jennifer Garcia	0401234567	jennifer@example.com	Nelson Alexander	0393096543	2025-08-15	2026-08-15	f	2026-05-26 21:06:06.949622
12	11	123 Victoria Street, Abbotsford VIC 3067	William Jones	0412345670	william@example.com	Stockdale & Leggo	0393011111	2026-03-01	2027-03-01	t	2026-05-26 21:06:06.949622
13	12	45 Smith Street, Fitzroy VIC 3065	Mary Davis	0423456780	mary@example.com	Harcourts	0393092222	2025-09-10	2026-09-10	t	2026-05-26 21:06:06.949622
14	13	78 Brunswick Road, Brunswick VIC 3056	Charles Miller	0434567890	charles@example.com	Ray White	0393013333	2026-01-05	2027-01-05	t	2026-05-26 21:06:06.949622
15	14	90 Sydney Road, Coburg VIC 3058	Barbara Wilson	0445678901	barbara@example.com	Barry Plant	0393094444	2025-11-20	2026-11-20	f	2026-05-26 21:06:06.949622
16	15	12 Puckle Street, Moonee Ponds VIC 3039	Thomas Moore	0456789012	thomas@example.com	LJ Hooker	0393015555	2026-02-14	2027-02-14	t	2026-05-26 21:06:06.949622
17	16	34 Mt Alexander Road, Ascot Vale VIC 3032	Margaret Taylor	0467890123	margaret@example.com	Nelson Alexander	0393096666	2025-10-25	2026-10-25	t	2026-05-26 21:06:06.949622
18	17	56 Lygon Street, Carlton VIC 3053	Christopher Anderson	0478901234	chris@example.com	Stockdale & Leggo	0393017777	2026-03-10	2027-03-10	t	2026-05-26 21:06:06.949622
19	18	21 Rathdowne Street, Carlton VIC 3053	Elizabeth Thomas	0489012345	elizabeth@example.com	Harcourts	0393098888	2025-12-05	2026-12-05	f	2026-05-26 21:06:06.949622
20	19	67 High Street, Northcote VIC 3070	Daniel Jackson	0490123456	daniel@example.com	Ray White	0393019999	2026-01-20	2027-01-20	t	2026-05-26 21:06:06.949622
21	20	89 St Georges Road, Fitzroy North VIC 3068	Lisa White	0401234560	lisa@example.com	Barry Plant	0393090000	2025-09-15	2026-09-15	t	2026-05-26 21:06:06.949622
22	21	111 Chapel Street, Windsor VIC 3181	Paul Harris	0412345671	paul@example.com	LJ Hooker	0393011212	2026-02-28	2027-02-28	t	2026-05-26 21:06:06.949622
23	22	222 Toorak Road, South Yarra VIC 3141	Karen Martin	0423456781	karen@example.com	Nelson Alexander	0393092323	2025-11-11	2026-11-11	f	2026-05-26 21:06:06.949622
24	23	333 Bridge Road, Richmond VIC 3121	Steven Thompson	0434567891	steven@example.com	Stockdale & Leggo	0393013434	2026-03-05	2027-03-05	t	2026-05-26 21:06:06.949622
25	24	444 Church Street, Richmond VIC 3121	Nancy Garcia	0445678901	nancy@example.com	Harcourts	0393094545	2025-10-10	2026-10-10	t	2026-05-26 21:06:06.949622
26	25	555 Punt Road, South Yarra VIC 3141	George Martinez	0456789012	george@example.com	Ray White	0393015656	2026-01-30	2027-01-30	t	2026-05-26 21:06:06.949622
27	26	666 Glenferrie Road, Hawthorn VIC 3122	Betty Robinson	0467890123	betty@example.com	Barry Plant	0393096767	2025-12-15	2026-12-15	f	2026-05-26 21:06:06.949622
28	27	777 Burwood Road, Hawthorn VIC 3122	Frank Clark	0478901234	frank@example.com	LJ Hooker	0393017878	2026-02-18	2027-02-18	t	2026-05-26 21:06:06.949622
29	28	888 Riversdale Road, Camberwell VIC 3124	Sandra Rodriguez	0489012345	sandra@example.com	Nelson Alexander	0393098989	2025-09-20	2026-09-20	t	2026-05-26 21:06:06.949622
30	29	999 Warrigal Road, Chadstone VIC 3148	Ashley Lewis	0490123456	ashley@example.com	Stockdale & Leggo	0393019090	2026-03-25	2027-03-25	t	2026-05-26 21:06:06.949622
31	30	1212 Dandenong Road, Caulfield VIC 3162	Deborah Lee	0401234561	deborah@example.com	Harcourts	0393090101	2025-11-30	2026-11-30	f	2026-05-26 21:06:06.949622
32	35	3 Backway Court, Maryborough VIC 3465	raj	\N	raj@gmail.com	danny	\N	2025-02-02	2028-01-01	f	2026-05-26 21:16:04.807161
33	40	36 Epsom street	Asim Bhattarai	0412000005	asimbhattrai123@gmail.com	Asim Bhattarai	04122222222	2222-02-12	1111-11-11	f	2026-05-31 08:30:50.513267
34	40	116 francis street yarraville	Amit Bhattarai	032233231212	amit123@gmail.com	asim	\N	1111-01-01	1111-11-11	f	2026-05-31 08:57:39.814557
\.


--
-- TOC entry 3539 (class 0 OID 16462)
-- Dependencies: 231
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: pg_database_owner
--

COPY public.users (user_id, full_name, email, password, phone, profile_pic, created_at, updated_at, last_login, role, two_factor_secret, two_factor_enabled) FROM stdin;
1	John Tenant	john@example.com	482c811da5d5b4bc6d497ffa98491e38	0412345678	\N	2026-05-04 18:35:40.551163	2026-05-04 18:35:40.551163	\N	user	\N	f
4	dadhi 	dadhi123@gmail.com	5e8667a439c68f5145dd2fcbecf02209		\N	2026-05-05 14:09:27.074651	2026-05-05 14:13:24.812167	2026-05-05 14:13:24.812167	user	\N	f
3	Aayush Bhandari	bhandariaayush802@gmail.com	25d55ad283aa400af464c76d713c07ad		\N	2026-05-04 19:08:44.161928	2026-05-05 15:09:14.779589	2026-05-05 15:09:14.779589	user	\N	f
5	Aayush Bhandari	aayush.bhandari@example.com	482c811da5d5b4bc6d497ffa98491e38	+9779812345671	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	admin	\N	f
6	Sujan Lamichhane	sujan.lamichhane@example.com	482c811da5d5b4bc6d497ffa98491e38	+9779812345672	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
7	Dadhi Ram Poudel	dadhi.poudel@example.com	482c811da5d5b4bc6d497ffa98491e38	+9779812345673	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
8	Asim Bhattarai	asim.bhattarai@example.com	482c811da5d5b4bc6d497ffa98491e38	+9779812345674	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
9	Shubham Shrestha	shubham.shrestha@example.com	482c811da5d5b4bc6d497ffa98491e38	+9779812345675	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
10	Linh Nguyen	linh.nguyen@example.com	482c811da5d5b4bc6d497ffa98491e38	+84912345678	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
11	Bipin Karki	bipin.karki@example.com	482c811da5d5b4bc6d497ffa98491e38	+9779812345676	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
12	Prakash Adhikari	prakash.adhikari@example.com	482c811da5d5b4bc6d497ffa98491e38	+9779812345677	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
13	Sita Ghimire	sita.ghimire@example.com	482c811da5d5b4bc6d497ffa98491e38	+9779812345678	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
14	Ram Thapa	ram.thapa@example.com	482c811da5d5b4bc6d497ffa98491e38	+9779812345679	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
15	Minh Tran	minh.tran@example.com	482c811da5d5b4bc6d497ffa98491e38	+84987654321	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
16	Hoa Le	hoa.le@example.com	482c811da5d5b4bc6d497ffa98491e38	+84987654322	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
17	Duc Pham	duc.pham@example.com	482c811da5d5b4bc6d497ffa98491e38	+84987654323	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
18	Lan Nguyen	lan.nguyen@example.com	482c811da5d5b4bc6d497ffa98491e38	+84987654324	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
19	Hung Dang	hung.dang@example.com	482c811da5d5b4bc6d497ffa98491e38	+84987654325	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
20	Thuy Bui	thuy.bui@example.com	482c811da5d5b4bc6d497ffa98491e38	+84987654326	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
21	Quang Vo	quang.vo@example.com	482c811da5d5b4bc6d497ffa98491e38	+84987654327	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
22	Huong Phung	huong.phung@example.com	482c811da5d5b4bc6d497ffa98491e38	+84987654328	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
23	Tuan Ngo	tuan.ngo@example.com	482c811da5d5b4bc6d497ffa98491e38	+84987654329	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
24	Trang Hoang	trang.hoang@example.com	482c811da5d5b4bc6d497ffa98491e38	+84987654330	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
25	Aarav Sharma	aarav.sharma@example.com	482c811da5d5b4bc6d497ffa98491e38	+919876543210	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
26	Aditi Verma	aditi.verma@example.com	482c811da5d5b4bc6d497ffa98491e38	+919876543211	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
27	Vikram Singh	vikram.singh@example.com	482c811da5d5b4bc6d497ffa98491e38	+919876543212	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
28	Priya Patel	priya.patel@example.com	482c811da5d5b4bc6d497ffa98491e38	+919876543213	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
29	Rajesh Kumar	rajesh.kumar@example.com	482c811da5d5b4bc6d497ffa98491e38	+919876543214	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
30	Neha Gupta	neha.gupta@example.com	482c811da5d5b4bc6d497ffa98491e38	+919876543215	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
32	Anjali Nair	anjali.nair@example.com	482c811da5d5b4bc6d497ffa98491e38	+919876543217	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
33	Karthik Iyer	karthik.iyer@example.com	482c811da5d5b4bc6d497ffa98491e38	+919876543218	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
34	Divya Menon	divya.menon@example.com	482c811da5d5b4bc6d497ffa98491e38	+919876543219	\N	2026-05-26 21:04:58.630218	2026-05-26 21:04:58.630218	\N	user	\N	f
31	Rahul Reddy	rahul.reddy@example.com	482c811da5d5b4bc6d497ffa98491e38	+919876543216	\N	2026-05-26 21:04:58.630218	2026-05-26 21:30:38.045008	2026-05-26 21:30:38.045008	user	\N	f
39	Sujan Lamichhane	sujan1@gmail.com	25d55ad283aa400af464c76d713c07ad	\N	\N	2026-05-30 05:23:24.41564	2026-05-30 15:01:30.217687	2026-05-30 15:01:30.217687	user	K5YS4XSQMUSTQYLLNFIXA3Z7PBBSGU2MIZQTW23SPNSGKTRUNNSA	f
38	LinhNguyen	biancolo3666@gmail.com	25f9e794323b453885f5181f1b624d0b	04475807544	\N	2026-05-30 04:23:59.404511	2026-05-31 11:10:41.014222	2026-05-31 11:10:41.014222	user	KNKD4VTTHNLEMPDNKY7HAVRDEV3UO5TBF5NU6WTSJZ5DUUBDKZLQ	t
36	Krish	krrishnaa.pdl01@gmail.com	25d55ad283aa400af464c76d713c07ad	\N	\N	2026-05-30 04:17:58.630178	2026-05-30 04:17:58.630178	\N	user	NBGCCOJZFZRUMTJRNASVGKKSLZIFWRLBNEUC6VTWMV2DYKSSKAZQ	f
37	LinhNguyen	K221695@student.kent.edu.au	25f9e794323b453885f5181f1b624d0b	\N	\N	2026-05-30 04:21:05.443401	2026-05-30 04:21:05.443401	\N	user	OITG2VTVFFTXILC3LJ2USI3TMJCFMQDBIRQXAR2SIVEU63RZIVWQ	f
41	Shubham Shrestha	k240901@student.kent.edu.au	97a1b729bd23f9ae6cd6f8c287b9e6e7	\N	\N	2026-05-31 05:00:17.248904	2026-05-31 05:01:59.358488	2026-05-31 05:01:59.358488	user	FRCTUV3DG5ME6LTONBXWIOCXFBNW6ODQKE4TK6LBKZLXUQCPF52Q	t
35	aayush gg	aayushgg@test.com	25d55ad283aa400af464c76d713c07ad	\N	\N	2026-05-26 21:15:12.064386	2026-05-31 11:25:08.459067	2026-05-31 11:25:08.459067	user	OU4UA2CAGZSU6TSHGFKG4SCHMYTCSIKGMESFAUCNNNFF243LH5NA	t
40	Asim	asimbhattrai123@gmail.com	25d55ad283aa400af464c76d713c07ad	0410904531	\N	2026-05-30 12:48:11.029785	2026-05-31 08:55:51.184934	2026-05-31 08:55:51.184934	user	PJ3TARTTJY4HSQ2UERXDQRRIPVWFIXRBMMTHQ53ZKYZHIQTXJAUA	f
2	Aayush Bhandari	aayush@test.com	25d55ad283aa400af464c76d713c07ad	0412345678	\N	2026-05-04 18:48:02.205898	2026-05-31 11:26:04.830203	2026-05-31 11:26:04.830203	admin	\N	f
\.


--
-- TOC entry 3553 (class 0 OID 0)
-- Dependencies: 220
-- Name: audit_logs_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pg_database_owner
--

SELECT pg_catalog.setval('public.audit_logs_log_id_seq', 36, true);


--
-- TOC entry 3554 (class 0 OID 0)
-- Dependencies: 222
-- Name: backup_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backup_codes_id_seq', 72, true);


--
-- TOC entry 3555 (class 0 OID 0)
-- Dependencies: 224
-- Name: bonds_bond_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pg_database_owner
--

SELECT pg_catalog.setval('public.bonds_bond_id_seq', 34, true);


--
-- TOC entry 3556 (class 0 OID 0)
-- Dependencies: 226
-- Name: documents_document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pg_database_owner
--

SELECT pg_catalog.setval('public.documents_document_id_seq', 6, true);


--
-- TOC entry 3557 (class 0 OID 0)
-- Dependencies: 228
-- Name: inspections_inspection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pg_database_owner
--

SELECT pg_catalog.setval('public.inspections_inspection_id_seq', 63, true);


--
-- TOC entry 3558 (class 0 OID 0)
-- Dependencies: 230
-- Name: properties_property_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pg_database_owner
--

SELECT pg_catalog.setval('public.properties_property_id_seq', 34, true);


--
-- TOC entry 3559 (class 0 OID 0)
-- Dependencies: 232
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pg_database_owner
--

SELECT pg_catalog.setval('public.users_user_id_seq', 41, true);


--
-- TOC entry 3346 (class 2606 OID 16484)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (log_id);


--
-- TOC entry 3350 (class 2606 OID 16486)
-- Name: backup_codes backup_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup_codes
    ADD CONSTRAINT backup_codes_pkey PRIMARY KEY (id);


--
-- TOC entry 3353 (class 2606 OID 16488)
-- Name: bonds bonds_pkey; Type: CONSTRAINT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.bonds
    ADD CONSTRAINT bonds_pkey PRIMARY KEY (bond_id);


--
-- TOC entry 3357 (class 2606 OID 16490)
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (document_id);


--
-- TOC entry 3361 (class 2606 OID 16492)
-- Name: inspections inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_pkey PRIMARY KEY (inspection_id);


--
-- TOC entry 3364 (class 2606 OID 16494)
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (property_id);


--
-- TOC entry 3367 (class 2606 OID 16496)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3369 (class 2606 OID 16498)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3347 (class 1259 OID 16499)
-- Name: idx_audit_logs_timestamp; Type: INDEX; Schema: public; Owner: pg_database_owner
--

CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs USING btree ("timestamp");


--
-- TOC entry 3348 (class 1259 OID 16500)
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: pg_database_owner
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- TOC entry 3351 (class 1259 OID 16501)
-- Name: idx_backup_codes_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_backup_codes_user ON public.backup_codes USING btree (user_id);


--
-- TOC entry 3354 (class 1259 OID 16502)
-- Name: idx_bonds_property_id; Type: INDEX; Schema: public; Owner: pg_database_owner
--

CREATE INDEX idx_bonds_property_id ON public.bonds USING btree (property_id);


--
-- TOC entry 3355 (class 1259 OID 16503)
-- Name: idx_bonds_status; Type: INDEX; Schema: public; Owner: pg_database_owner
--

CREATE INDEX idx_bonds_status ON public.bonds USING btree (status);


--
-- TOC entry 3358 (class 1259 OID 16504)
-- Name: idx_documents_user_id; Type: INDEX; Schema: public; Owner: pg_database_owner
--

CREATE INDEX idx_documents_user_id ON public.documents USING btree (user_id);


--
-- TOC entry 3359 (class 1259 OID 16505)
-- Name: idx_inspections_property_id; Type: INDEX; Schema: public; Owner: pg_database_owner
--

CREATE INDEX idx_inspections_property_id ON public.inspections USING btree (property_id);


--
-- TOC entry 3362 (class 1259 OID 16506)
-- Name: idx_properties_user_id; Type: INDEX; Schema: public; Owner: pg_database_owner
--

CREATE INDEX idx_properties_user_id ON public.properties USING btree (user_id);


--
-- TOC entry 3365 (class 1259 OID 16507)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: pg_database_owner
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 3379 (class 2620 OID 16508)
-- Name: users trigger_users_updated_at; Type: TRIGGER; Schema: public; Owner: pg_database_owner
--

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3370 (class 2606 OID 16509)
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 3371 (class 2606 OID 16514)
-- Name: backup_codes backup_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup_codes
    ADD CONSTRAINT backup_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3372 (class 2606 OID 16519)
-- Name: bonds bonds_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.bonds
    ADD CONSTRAINT bonds_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON DELETE CASCADE;


--
-- TOC entry 3373 (class 2606 OID 16524)
-- Name: documents documents_bond_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_bond_id_fkey FOREIGN KEY (bond_id) REFERENCES public.bonds(bond_id) ON DELETE SET NULL;


--
-- TOC entry 3374 (class 2606 OID 16529)
-- Name: documents documents_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON DELETE SET NULL;


--
-- TOC entry 3375 (class 2606 OID 16534)
-- Name: documents documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3376 (class 2606 OID 16539)
-- Name: inspections inspections_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON DELETE CASCADE;


--
-- TOC entry 3377 (class 2606 OID 16552)
-- Name: inspections inspections_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 3378 (class 2606 OID 16544)
-- Name: properties properties_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pg_database_owner
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


-- Completed on 2026-05-31 21:53:15

--
-- PostgreSQL database dump complete
--

\unrestrict teZebxNOhaeRmmZeFxxu3w6eIsRSxNeZKqHveS01DV4ogENeJhcMx0LEvYaLJPR

