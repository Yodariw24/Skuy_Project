--
-- PostgreSQL database dump
--

\restrict ezzYbtNscwUpioCaiDlc1VErijQXwHjOjwU42rlNCremfNMTS8cvtDrbj2nLuLT

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-04-26 11:12:21

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 17310)
-- Name: donations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.donations (
    id integer NOT NULL,
    streamer_id integer,
    donatur_name character varying(50) NOT NULL,
    donatur_email character varying(100),
    message text,
    amount numeric(12,2) NOT NULL,
    video_url text,
    payment_method character varying(20),
    company_code character varying(32) DEFAULT 'SKUY_ID'::character varying,
    status character varying(10) DEFAULT 'PENDING'::character varying,
    is_deleted smallint DEFAULT 0,
    created_by character varying(32) DEFAULT 'GUEST'::character varying,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_updated_by character varying(32),
    last_updated_date timestamp without time zone
);


ALTER TABLE public.donations OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17309)
-- Name: donations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.donations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.donations_id_seq OWNER TO postgres;

--
-- TOC entry 5118 (class 0 OID 0)
-- Dependencies: 221
-- Name: donations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.donations_id_seq OWNED BY public.donations.id;


--
-- TOC entry 226 (class 1259 OID 17351)
-- Name: email_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_reports (
    id integer NOT NULL,
    streamer_id integer,
    report_type character varying(20),
    recipient_email character varying(100),
    status character varying(10),
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.email_reports OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17350)
-- Name: email_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.email_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_reports_id_seq OWNER TO postgres;

--
-- TOC entry 5119 (class 0 OID 0)
-- Dependencies: 225
-- Name: email_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.email_reports_id_seq OWNED BY public.email_reports.id;


--
-- TOC entry 224 (class 1259 OID 17332)
-- Name: goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.goals (
    id integer NOT NULL,
    streamer_id integer,
    title character varying(100) NOT NULL,
    target_amount numeric(12,2) NOT NULL,
    current_amount numeric(12,2) DEFAULT 0,
    status character varying(10) DEFAULT 'ACTIVE'::character varying,
    is_deleted smallint DEFAULT 0,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_updated_date timestamp without time zone
);


ALTER TABLE public.goals OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17331)
-- Name: goals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.goals_id_seq OWNER TO postgres;

--
-- TOC entry 5120 (class 0 OID 0)
-- Dependencies: 223
-- Name: goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.goals_id_seq OWNED BY public.goals.id;


--
-- TOC entry 220 (class 1259 OID 17292)
-- Name: streamers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.streamers (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    full_name character varying(100),
    email character varying(100) NOT NULL,
    youtube_url text,
    is_email_subscribed smallint DEFAULT 1,
    report_frequency character varying(10) DEFAULT 'WEEKLY'::character varying,
    password character varying(255),
    bank_name character varying(100),
    account_number character varying(50),
    account_name character varying(100),
    display_name character varying(255),
    bio text,
    instagram character varying(255),
    github character varying(255),
    profile_picture text,
    tiktok text,
    youtube text,
    theme_color character varying(50) DEFAULT 'violet'::character varying,
    google_id character varying(255),
    role character varying(20) DEFAULT 'user'::character varying,
    two_fa_secret text,
    is_two_fa_enabled boolean DEFAULT false
);


ALTER TABLE public.streamers OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17291)
-- Name: streamers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.streamers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.streamers_id_seq OWNER TO postgres;

--
-- TOC entry 5121 (class 0 OID 0)
-- Dependencies: 219
-- Name: streamers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.streamers_id_seq OWNED BY public.streamers.id;


--
-- TOC entry 230 (class 1259 OID 17388)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password text,
    profile_picture text,
    role character varying(20) DEFAULT 'user'::character varying,
    two_fa_secret text,
    is_two_fa_enabled boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    stream_key text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17387)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5122 (class 0 OID 0)
-- Dependencies: 229
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 232 (class 1259 OID 17410)
-- Name: widget_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.widget_settings (
    id integer NOT NULL,
    user_id integer,
    widget_type character varying(50) NOT NULL,
    primary_color character varying(10) DEFAULT '#6366f1'::character varying,
    accent_color character varying(10) DEFAULT '#fbbf24'::character varying,
    text_color character varying(10) DEFAULT '#ffffff'::character varying,
    glow_color character varying(10) DEFAULT '#818cf8'::character varying,
    min_tip integer DEFAULT 10000,
    duration integer DEFAULT 8,
    goal_title character varying(255),
    goal_target bigint
);


ALTER TABLE public.widget_settings OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17409)
-- Name: widget_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.widget_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.widget_settings_id_seq OWNER TO postgres;

--
-- TOC entry 5123 (class 0 OID 0)
-- Dependencies: 231
-- Name: widget_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.widget_settings_id_seq OWNED BY public.widget_settings.id;


--
-- TOC entry 228 (class 1259 OID 17366)
-- Name: withdrawals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.withdrawals (
    id integer NOT NULL,
    streamer_id integer,
    amount integer NOT NULL,
    bank_info text NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.withdrawals OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17365)
-- Name: withdrawals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.withdrawals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.withdrawals_id_seq OWNER TO postgres;

--
-- TOC entry 5124 (class 0 OID 0)
-- Dependencies: 227
-- Name: withdrawals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.withdrawals_id_seq OWNED BY public.withdrawals.id;


--
-- TOC entry 4892 (class 2604 OID 17313)
-- Name: donations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations ALTER COLUMN id SET DEFAULT nextval('public.donations_id_seq'::regclass);


--
-- TOC entry 4903 (class 2604 OID 17354)
-- Name: email_reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_reports ALTER COLUMN id SET DEFAULT nextval('public.email_reports_id_seq'::regclass);


--
-- TOC entry 4898 (class 2604 OID 17335)
-- Name: goals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals ALTER COLUMN id SET DEFAULT nextval('public.goals_id_seq'::regclass);


--
-- TOC entry 4886 (class 2604 OID 17295)
-- Name: streamers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streamers ALTER COLUMN id SET DEFAULT nextval('public.streamers_id_seq'::regclass);


--
-- TOC entry 4908 (class 2604 OID 17391)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4912 (class 2604 OID 17413)
-- Name: widget_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.widget_settings ALTER COLUMN id SET DEFAULT nextval('public.widget_settings_id_seq'::regclass);


--
-- TOC entry 4905 (class 2604 OID 17369)
-- Name: withdrawals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawals ALTER COLUMN id SET DEFAULT nextval('public.withdrawals_id_seq'::regclass);


--
-- TOC entry 5102 (class 0 OID 17310)
-- Dependencies: 222
-- Data for Name: donations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.donations (id, streamer_id, donatur_name, donatur_email, message, amount, video_url, payment_method, company_code, status, is_deleted, created_by, created_date, last_updated_by, last_updated_date) FROM stdin;
3	8	Fans Lilbahlil	noname@gmail.com	Lagui rapper nya mantap Lilbahlil	10000.00	\N	Bank BRI	SKUY_ID	SUCCESS	0	GUEST	2026-04-04 18:37:16.805662	\N	2026-04-04 18:50:13.200957
5	8	Fans Lilbahlil	noname@gmailjj.com	Lagui rapper nya mantap Lilbahlil	10000.00	\N	Bank BRI	SKUY_ID	PENDING	0	GUEST	2026-04-04 20:44:22.874398	\N	\N
6	8	Fans Lilbahlil	noname@gmailjj.com	Lagui rapper nya mantap Lilbahlil	5000.00	\N	Bank BRI	SKUY_ID	SUCCESS	0	GUEST	2026-04-04 20:47:08.336648	\N	2026-04-04 20:48:16.483226
4	8	Fans Lilbahlil	noname@gmail.com	Lagui rapper nya mantap Lilbahlil	10000.00	\N	Bank BRI	SKUY_ID	SUCCESS	0	GUEST	2026-04-04 20:43:20.77082	\N	2026-04-04 21:05:55.498198
2	1	Ari Wirayuda	ari@email.com	Project Skuy mantap!	50000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-04 18:30:30.993311	\N	2026-04-04 21:06:36.079641
7	1	Gibran kece	gibrankece@gmailjj.com	keren bngtt karya nya 	50000.00	\N	Bank BRI	SKUY_ID	SUCCESS	0	GUEST	2026-04-04 21:14:33.969806	\N	2026-04-04 21:15:13.111535
8	1	budi doremi	budidoremi@gmail.com	semangat bikin kontennya 	5000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-04 22:31:51.529081	\N	2026-04-04 22:39:16.485618
9	15	IlhamGod	IlhamGod@gmailjj.com	Panutan ku bang windah 	500000.00	\N	Bank BCA	SKUY_ID	SUCCESS	0	GUEST	2026-04-05 00:18:06.184246	\N	2026-04-05 00:19:04.264972
10	17	Wancoy	Wancoy@gmailjj.com	Panutan ku bang wancoy menyalaaa 	100000.00	\N	Bank BCA	SKUY_ID	SUCCESS	0	GUEST	2026-04-05 16:24:38.297512	\N	\N
11	17	cahyono	cahyono@gmail.com	lucu terus  bang	50000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-05 16:44:31.084554	\N	\N
12	17	sabiq	sabiq@gamil.com	Keren banget bang suryaaa	100000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-05 16:57:58.737714	\N	\N
13	17	rehan	asdad@gmail.com	kacau sih	25000.00	\N	QRIS	SKUY_ID	PENDING	0	GUEST	2026-04-08 18:44:39.721681	\N	\N
14	17	rehan	asdad@gmail.com	kacau sih	25000.00	\N	QRIS	SKUY_ID	PENDING	0	GUEST	2026-04-08 18:45:32.824989	\N	\N
15	17	aweawea	rahna@gmail.com	asdasd	25000.00	\N	QRIS	SKUY_ID	PENDING	0	GUEST	2026-04-08 18:46:46.075855	\N	\N
16	17	rehan	rehan@gamil.com	semangat ya	20000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-08 18:49:34.184204	\N	\N
17	17	asddas	asddsad@gamil.com	asdas	10000.00	\N	QRIS	SKUY_ID	PENDING	0	GUEST	2026-04-08 18:51:48.438443	\N	\N
18	17	iqbal,	iwqab@gamil.com	dadasdasd	50000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-08 18:53:47.786648	\N	\N
19	17	rini	rini@gmail.com	adasdasd	10000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-08 18:54:16.374241	\N	\N
20	17	rtggrtg	ge45t4@gmail.com	ferfefefe	25000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-08 21:55:06.039904	\N	\N
21	17	Jokowi	jokowi@gmail.com	keren bang	50000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-09 21:27:00.620844	\N	\N
22	14	budi	budi@gamil.com	mantap kocakkk eyy	50000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-11 06:52:24.012973	\N	\N
23	17	radit	radit223@gmail.com	menyalaa wiii	20000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-11 06:53:20.654552	\N	\N
24	17	samuel	samuel@gamil.com	wkwkwwkwk	10000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-11 07:25:32.441834	\N	\N
25	17	umiii	umi@gamail.com	keren yaa 	20000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-11 21:19:14.763516	\N	\N
26	17	indra	indra@gmail.com	semangka kakak 	30000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-12 00:34:12.165199	\N	\N
27	17	siti	siti@gamil.com	ganteng banget bank trus lucu	20000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-12 00:38:20.543332	\N	\N
28	17	qalbi	qalbi@gamil.com	mantull	30000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-12 00:58:14.424034	\N	\N
29	19	ucup	ucucp@gamil.com	Mantapbanget bang	420000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-12 05:02:30.462541	\N	\N
30	17	baskara	Baskara@gamil.com	lorem testt	120000.00	\N	QRIS	SKUY_ID	SUCCESS	0	GUEST	2026-04-12 05:04:57.45287	\N	\N
\.


--
-- TOC entry 5106 (class 0 OID 17351)
-- Dependencies: 226
-- Data for Name: email_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_reports (id, streamer_id, report_type, recipient_email, status, sent_at) FROM stdin;
\.


--
-- TOC entry 5104 (class 0 OID 17332)
-- Dependencies: 224
-- Data for Name: goals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.goals (id, streamer_id, title, target_amount, current_amount, status, is_deleted, created_date, last_updated_date) FROM stdin;
\.


--
-- TOC entry 5100 (class 0 OID 17292)
-- Dependencies: 220
-- Data for Name: streamers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.streamers (id, username, full_name, email, youtube_url, is_email_subscribed, report_frequency, password, bank_name, account_number, account_name, display_name, bio, instagram, github, profile_picture, tiktok, youtube, theme_color, google_id, role, two_fa_secret, is_two_fa_enabled) FROM stdin;
1	ari_wirayuda	Ari Wirayuda	ari@email.com	\N	1	WEEKLY	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	violet	\N	user	\N	f
5	jokowow	dodo	priasolo@gmail.com	\N	1	WEEKLY	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	violet	\N	user	\N	f
8	lilbah	lil	lilbahlil337@gmail.com	https://www.youtube.com/watch?v=qmgA_WejI8w&list=RDyoI88jG3vqM	1	MOTHLY	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	violet	\N	user	\N	f
9	parabowo	prabowo subianto	prabowo11@gmail.com	\N	1	WEEKLY	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	violet	\N	user	\N	f
11	bambang	bambang pamungkas	pamungkas77@gmail.com	\N	1	WEEKLY	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	violet	\N	user	\N	f
14	bambafng	bambfang pamungkas	pamundgkas77@gmail.com	\N	1	WEEKLY	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	violet	\N	user	\N	f
15	Windah	Windah Basudara	windahGG@gmail.com	\N	1	WEEKLY	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	violet	\N	user	\N	f
16	ari_keren	Ari Wirayuda	ari@skuy.gg	\N	1	WEEKLY	123	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	violet	\N	user	\N	f
18	shelby	toms shelby	shelby@gmail.com	\N	1	WEEKLY	shelby	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	rose	\N	user	\N	f
17	surya	surya insome	surya@gmail.com	\N	1	WEEKLY	surya	BNI	54534524	Surya Insomew	surya insome			\N	profile-1775948595605-36434744.jpg			violet	\N	creator	GFECQZKSFBKF4LTXEZUHIVR7OQXCGUSELAWCCNDBNYZXAQRVNVHQ	f
19	ariwirayuda_236	Ari Wirayuda	ariwirayuda24@gmail.com	\N	1	WEEKLY	\N	\N	\N	\N	Ari Wirayudaw			\N	profile-1775948656718-108259001.png			violet	\N	user	IQSVCY2OKZWEAT3ION2EUSJFEF2WCVDEHRSWWWZ3MQUGIQKWG5PA	f
\.


--
-- TOC entry 5110 (class 0 OID 17388)
-- Dependencies: 230
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, username, email, password, profile_picture, role, two_fa_secret, is_two_fa_enabled, created_at, stream_key) FROM stdin;
\.


--
-- TOC entry 5112 (class 0 OID 17410)
-- Dependencies: 232
-- Data for Name: widget_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.widget_settings (id, user_id, widget_type, primary_color, accent_color, text_color, glow_color, min_tip, duration, goal_title, goal_target) FROM stdin;
\.


--
-- TOC entry 5108 (class 0 OID 17366)
-- Dependencies: 228
-- Data for Name: withdrawals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.withdrawals (id, streamer_id, amount, bank_info, status, created_at) FROM stdin;
1	17	10000	GOPAY - 64646454345 (a.n Surya Insomew)	PENDING	2026-04-11 21:11:26.489343
2	17	10000	GOPAY - 64646454345 (a.n Surya Insomew)	PENDING	2026-04-11 21:11:54.705674
3	17	15000	GOPAY - 64646454345 (a.n Surya Insomew)	PENDING	2026-04-11 21:17:46.675688
4	17	10000	GOPAY - 64646454345 (a.n Surya Insomew)	PENDING	2026-04-11 21:24:56.185718
5	17	10000	GOPAY - 64646454345 (a.n Surya Insomew)	PENDING	2026-04-11 21:28:22.677105
6	17	35000	GOPAY - 64646454345 (a.n Surya Insomew)	PENDING	2026-04-11 21:33:56.835505
7	17	10000	GOPAY - 64646454345 (a.n Surya Insomew)	PENDING	2026-04-11 21:37:58.818564
8	17	15000	GOPAY - 64646454345 (a.n Surya Insomew)	SUCCESS	2026-04-11 21:48:54.72448
9	17	10000	GOPAY - 64646454345 (a.n Surya Insomew)	SUCCESS	2026-04-11 21:55:57.283905
10	17	10000	GOPAY - 64646454345 (a.n Surya Insomew)	PENDING	2026-04-11 22:06:10.758697
11	17	20000	GOPAY - 64646454345 (a.n Surya Insomew)	SUCCESS	2026-04-12 00:39:55.167842
12	17	30000	BNI - 54534524 (a.n Surya Insomew)	SUCCESS	2026-04-12 00:44:32.523304
\.


--
-- TOC entry 5125 (class 0 OID 0)
-- Dependencies: 221
-- Name: donations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.donations_id_seq', 30, true);


--
-- TOC entry 5126 (class 0 OID 0)
-- Dependencies: 225
-- Name: email_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.email_reports_id_seq', 1, false);


--
-- TOC entry 5127 (class 0 OID 0)
-- Dependencies: 223
-- Name: goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.goals_id_seq', 1, false);


--
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 219
-- Name: streamers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.streamers_id_seq', 19, true);


--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 229
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 231
-- Name: widget_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.widget_settings_id_seq', 1, false);


--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 227
-- Name: withdrawals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.withdrawals_id_seq', 12, true);


--
-- TOC entry 4928 (class 2606 OID 17325)
-- Name: donations donations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_pkey PRIMARY KEY (id);


--
-- TOC entry 4932 (class 2606 OID 17358)
-- Name: email_reports email_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_reports
    ADD CONSTRAINT email_reports_pkey PRIMARY KEY (id);


--
-- TOC entry 4930 (class 2606 OID 17344)
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- TOC entry 4920 (class 2606 OID 17308)
-- Name: streamers streamers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streamers
    ADD CONSTRAINT streamers_email_key UNIQUE (email);


--
-- TOC entry 4922 (class 2606 OID 17386)
-- Name: streamers streamers_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streamers
    ADD CONSTRAINT streamers_google_id_key UNIQUE (google_id);


--
-- TOC entry 4924 (class 2606 OID 17304)
-- Name: streamers streamers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streamers
    ADD CONSTRAINT streamers_pkey PRIMARY KEY (id);


--
-- TOC entry 4926 (class 2606 OID 17306)
-- Name: streamers streamers_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streamers
    ADD CONSTRAINT streamers_username_key UNIQUE (username);


--
-- TOC entry 4936 (class 2606 OID 17406)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4938 (class 2606 OID 17402)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4940 (class 2606 OID 17432)
-- Name: users users_stream_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_stream_key_key UNIQUE (stream_key);


--
-- TOC entry 4942 (class 2606 OID 17404)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4944 (class 2606 OID 17423)
-- Name: widget_settings widget_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.widget_settings
    ADD CONSTRAINT widget_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 17425)
-- Name: widget_settings widget_settings_user_id_widget_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.widget_settings
    ADD CONSTRAINT widget_settings_user_id_widget_type_key UNIQUE (user_id, widget_type);


--
-- TOC entry 4934 (class 2606 OID 17378)
-- Name: withdrawals withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_pkey PRIMARY KEY (id);


--
-- TOC entry 4947 (class 2606 OID 17326)
-- Name: donations donations_streamer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_streamer_id_fkey FOREIGN KEY (streamer_id) REFERENCES public.streamers(id) ON DELETE CASCADE;


--
-- TOC entry 4949 (class 2606 OID 17359)
-- Name: email_reports email_reports_streamer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_reports
    ADD CONSTRAINT email_reports_streamer_id_fkey FOREIGN KEY (streamer_id) REFERENCES public.streamers(id) ON DELETE CASCADE;


--
-- TOC entry 4948 (class 2606 OID 17345)
-- Name: goals goals_streamer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_streamer_id_fkey FOREIGN KEY (streamer_id) REFERENCES public.streamers(id) ON DELETE CASCADE;


--
-- TOC entry 4951 (class 2606 OID 17426)
-- Name: widget_settings widget_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.widget_settings
    ADD CONSTRAINT widget_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4950 (class 2606 OID 17379)
-- Name: withdrawals withdrawals_streamer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_streamer_id_fkey FOREIGN KEY (streamer_id) REFERENCES public.streamers(id);


-- Completed on 2026-04-26 11:12:22

--
-- PostgreSQL database dump complete
--

\unrestrict ezzYbtNscwUpioCaiDlc1VErijQXwHjOjwU42rlNCremfNMTS8cvtDrbj2nLuLT

