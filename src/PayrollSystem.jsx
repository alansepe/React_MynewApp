import React,{ useState,useEffect,useMemo, useRef, useCallback } from "react";
import { createStore, combineReducers} from "redux"
import config from './config.json';
import { setGlobal, getGlobal } from "./global";
import axios from "axios" ;
const ORANGE = "#f97316";
const AMBER  = "#fb923c";

const PALETTE = {
  Adm: "#3266ad",
  Acc: "#1D9E75",
  Mrk: "#EF9F27",
  Whs: "#7F77DD",
  Hrd: "#D85A30",
  Sal: "#888780",
  Aud: "#EF1A07"
};


const salesData = {
  monthly: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    revenue: [42000, 55000, 48000, 61000, 73000, 68000, 82000, 79000, 91000, 87000, 95000, 110000],
    target:  [50000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 88000, 92000, 100000],
    units:   [210, 275, 240, 305, 365, 340, 410, 395, 455, 435, 475, 550],
  },
  categories: {
    labels: ["Electronics", "Apparel", "Home & Garden", "Sports", "Beauty", "Books"],
    values: [38, 22, 15, 12, 8, 5],
    colors: ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5", "#fff7ed"],
  },
  topProducts: [
    { name: "Pro Laptop X1", sales: 1240, revenue: "$186,000", growth: "+24%" },
    { name: "SmartWatch Ultra", sales: 980, revenue: "$98,000", growth: "+18%" },
    { name: "Wireless Buds Pro", sales: 1560, revenue: "$62,400", growth: "+31%" },
    { name: "Gaming Chair Z", sales: 420, revenue: "$54,600", growth: "+9%" },
    { name: "4K Monitor 27\"", sales: 310, revenue: "$46,500", growth: "+15%" },
  ],
};

const acsData = {
  monthly: {
    labels: ["Acc", "Aud", "Mrk", "Adm", "Whs", "Sal", "Hrd"],
    revenue: [42000, 55000, 48000, 61000, 73000, 68000, 82000],
    target:  [50000, 50000, 55000, 60000, 65000, 70000, 75000],
    units:   [210, 275, 240, 305, 365, 340, 410, 395, 455, 435, 475, 550],
  },
  categories: {
    labels: ["Electronics", "Apparel", "Home & Garden", "Sports", "Beauty", "Books"],
    values: [38, 22, 15, 12, 8, 5],
    colors: ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5", "#fff7ed"],
  },
  topProducts: [
    { name: "Pro Laptop X1", sales: 1240, revenue: "$186,000", growth: "+24%" },
    { name: "SmartWatch Ultra", sales: 980, revenue: "$98,000", growth: "+18%" },
    { name: "Wireless Buds Pro", sales: 1560, revenue: "$62,400", growth: "+31%" },
    { name: "Gaming Chair Z", sales: 420, revenue: "$54,600", growth: "+9%" },
    { name: "4K Monitor 27\"", sales: 310, revenue: "$46,500", growth: "+15%" },
  ],
};



const kpis = [
  { label: "Total Revenue", value: "$891K", delta: "+22.4%", up: true },
  { label: "Units Sold",    value: "4,455", delta: "+17.8%", up: true },
  { label: "Avg Order Val", value: "$200",  delta: "+4.1%",  up: true },
  { label: "Return Rate",   value: "2.3%",  delta: "-0.8%",  up: false },
];




//import './scss/style.scss'
//import './scss/styleacs.scss'


const initialAuthState = { isAuthenticated: false, user: null, error: null };
const rootReducer = combineReducers({ auth: authReducer});
const store = createStore(rootReducer);

const fmt = (n) => `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
const g_orderUrl =  config.ORDER_URL;
const g_itemsUrl =  config.ITEMS_URL;
const g_deptUrl =  config.DEPT_URL;
const g_seriesaUrl =  config.SERIESA_URL;
const g_empUrl = config.EMPLOY_URL;
const g_chartUrl = config.CHART_URL;




const Icon = ({ path, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const ICONS = {
  box: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  receipt: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  issue: "M22 2l-7 20-4-9-9-4 20-7z",
  plus: "M12 5v14 M5 12h14",
  close: "M18 6L6 18 M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  arrow: "M5 12h14 M12 5l7 7-7 7",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
  trash: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  warning: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
};



// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #1a1a2e;
    --ink-soft: #4a4a6a;
    --ink-ghost: #9898b8;
    --paper: #f5f3ee;
    --paper-warm: #ede9e0;
    --paper-card: #ffffff;
    --accent: #c4502a;
    --accent-light: #e8a090;
    --accent-bg: #fdf0ed;
    --green: #2a7a4e;
    --green-bg: #edf7f1;
    --green-light: #90d4aa;
    --amber: #b07a20;
    --amber-bg: #fdf5e0;
    --border: #ddd9d0;
    --shadow: 0 1px 3px rgba(26,26,46,0.08), 0 4px 16px rgba(26,26,46,0.06);
    --shadow-lg: 0 8px 32px rgba(26,26,46,0.14), 0 2px 8px rgba(26,26,46,0.08);
    --radius: 5px;
    --radius-lg: 8px;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--paper); color: var(--ink); }

  .app { display: flex; min-height: 100vh; }

  /* Sidebar */
  .sidebar {
    width: 240px; min-height: 100vh; background: var(--ink);
    display: flex; flex-direction: column; padding: 28px 0; flex-shrink: 0;
    position: sticky; top: 0; height: 100vh;
  }
  .sidebar-logo {
    padding: 0 24px 28px; border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .sidebar-logo h1 {
    font-family: 'DM Serif Display', serif; font-size: 20px; color: #fff;
    line-height: 1.1; letter-spacing: -0.3px;
  }
  .sidebar-logo span { font-size: 10px; font-weight: 300; color: rgba(255,255,255,0.4); letter-spacing: 2px; text-transform: uppercase; display: block; margin-top: 2px; }
  .sidebar-nav { flex: 1; padding: 20px 12px; display: flex; flex-direction: column; gap: 4px; }
  .nav-label { font-size: 9px; letter-spacing: 2px; color: rgba(255,255,255,0.28); text-transform: uppercase; font-weight: 500; padding: 8px 12px 4px; }
  .nav-btn {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px;
    background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.55);
    font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 400;
    text-align: left; width: 100%; transition: all 0.15s;
  }
  .nav-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
  .nav-btn.active { background: rgba(196,80,42,0.25); color: #e8a090; }
  .nav-btn .badge {
    margin-left: auto; font-size: 10px; font-family: 'DM Mono', monospace;
    background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.5);
    padding: 1px 6px; border-radius: 20px;
  }
  .nav-btn.active .badge { background: rgba(196,80,42,0.3); color: #e8a090; }

  /* Main */
  .main { flex: 1; padding: 32px 36px; max-width: 1100px; }

  /* Page Header */
  .page-header { margin-bottom: 28px; }
  .page-header h2 { font-family: 'DM Serif Display', serif; font-size: 28px; color: var(--ink); letter-spacing: -0.5px; }
  .page-header p { color: var(--ink-soft); font-size: 13.5px; margin-top: 4px; }

  /* Stats row */
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
  .stat-card {
    background: var(--paper-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 18px 20px; box-shadow: var(--shadow);
  }
  .stat-label { font-size: 10.5px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--ink-ghost); font-weight: 500; }
  .stat-value { font-family: 'DM Serif Display', serif; font-size: 30px; color: var(--ink); margin-top: 4px; line-height: 1; }
  .stat-sub { font-size: 11.5px; color: var(--ink-soft); margin-top: 5px; }
  .stat-card.accent { background: var(--accent); border-color: var(--accent); }
  .stat-card.accent .stat-label, .stat-card.accent .stat-value, .stat-card.accent .stat-sub { color: #fff; }
  .stat-card.accent .stat-value { color: rgba(255,255,255,0.9); }
  .stat-card.accent .stat-label { color: rgba(255,255,255,0.7); }

  /* Table Card */
  .card {
    background: var(--paper-card); border: 1px solid var(--border); border-radius: var(--radius-lg);
    box-shadow: var(--shadow); overflow: hidden;
  }
  .card-header {
    padding: 18px 22px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    background: #fafaf8;
  }
  .card-title { font-family: 'DM Serif Display', serif; font-size: 16px; color: var(--ink); }
  .card-sub { font-size: 12px; color: var(--ink-ghost); margin-top: 1px; }

  table { width: 100%; border-collapse: collapse; }
  th {
    font-size: 10px;  letter-spacing: 1.5px;
    font-weight: 600; color: var(--ink-ghost); padding: 10px 20px;
    text-align: left; background: #fafaf8; border-bottom: 1px solid var(--border);
  }
  td { padding: 12px 20px; font-size: 13.5px; border-bottom: 1px solid #f0ede7; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #faf8f5; }

  .mono { font-family: 'DM Mono', monospace; font-size: 12px; }
  .tag {
    display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px;
    border-radius: 20px; font-size: 11px; font-weight: 500;
  }
  .tag-green { background: var(--green-bg); color: var(--green); }
  .tag-red { background: var(--accent-bg); color: var(--accent); }
  .tag-amber { background: var(--amber-bg); color: var(--amber); }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: 7px; padding: 9px 16px;
    border-radius: 8px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500; transition: all 0.15s;
  }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: #b0452a; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(196,80,42,0.3); }
  .btn-green { background: var(--green); color: #fff; }
  .btn-green:hover { background: #236040; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(42,122,78,0.3); }
  .btn-ghost { background: transparent; color: var(--ink-soft); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--paper); color: var(--ink); }
  .btn-sm { padding: 5px 11px; font-size: 12px; }
  .btn-icon { padding: 7px; border-radius: 6px; background: none; border: 1px solid var(--border); cursor: pointer; color: var(--ink-soft); display: inline-flex; align-items: center; transition: all 0.15s; }
  .btn-icon:hover { background: var(--paper); color: var(--ink); }

  /* Modal */
  .overlay {
    position: fixed; inset: 0; background: rgba(26,26,46,0.5); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px;
  }

  .overlayprv {
    position: fixed; inset: 0; background: rgba(26,26,46,0.5); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 105; padding: 20px;
  }



  .overlaynb {
    position: fixed; inset: 0; background: rgba(26,26,46,0.5); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 101; padding: 20px;
  }

.modallg {
    background: var(--paper-card); border-radius: var(--radius-lg); width: 100%; max-width: 1100px;
    max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg);
  }

  .modal {
    background: var(--paper-card); border-radius: var(--radius-lg); width: 100%; max-width: 900px;
    max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg);
  }

  .modalsm {
    background: var(--paper-card); border-radius: var(--radius-lg); width: 100%; max-width: 600px;
    max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg);
  }

  .modal-header {
    padding: 22px 26px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start;  position: sticky; top: 0; background: var(--paper-card); z-index: 1;
  }

 .modal-headernb {
    padding: 22px 26px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start;  position: sticky; top: 0; background: var(--paper-card); z-index: 2;
  }

  .modal-title { font-family: 'DM Serif Display', serif; font-size: 20px; color: var(--ink); }
  .modal-subtitle { font-size: 12px; color: var(--ink-ghost); margin-top: 2px; }
  .modal-body { padding: 22px 26px; }
  .modal-footer { padding: 16px 26px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; background: #fafaf8; }

  /* Form */
  /* text-transform: uppercase */
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; }
  .form-grouplg { margin-bottom: 1px; width:1050px }
  .form-group { margin-bottom: 1px; width:550px }
  .form-groupsm { margin-bottom: 1px; width:500px }
  .form-group label { display: block; font-size: 11.5px; font-weight: 600; letter-spacing: 1px; color: var(--ink-soft); margin-bottom: 2px; }  
  .form-group input, .form-group select {
    width: 246px; padding: 9px 12px; border: 1px solid var(--border); border-radius: 5px;
    font-family: 'DM Sans', sans-serif; font-size: 13.5px; background: var(--paper-card);
    color: var(--ink); outline: none; transition: border 0.15s;
  }
  .form-group input:focus, .form-group select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(196,80,42,0.08); }


  /* Document Lines */
  .lines-section { margin-top: 18px; }
  .lines-header { font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--ink-soft); margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
  .line-row {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 16px; gap: 4px;
    align-items: end; margin-bottom: 4px;
  }
  .line-total { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--ink-soft); padding: 9px 0; text-align: right; }

  /* Document View */
  .doc-print {
    font-family: 'DM Sans', sans-serif; background: #fff;
    border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden;
  }
  .doc-head { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start; background: #fafaf8; }
  .doc-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--ink); }
  .doc-meta { font-size: 11px; color: var(--ink-ghost); margin-top: 3px; }
  .doc-number { font-family: 'DM Mono', monospace; font-size: 18px; color: var(--accent); font-weight: 500; }
  .doc-info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-bottom: 1px solid var(--border); }
  .doc-info-cell { padding: 12px 20px; }
  .doc-info-cell + .doc-info-cell { border-left: 1px solid var(--border); }
  .doc-info-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--ink-ghost); }
  .doc-info-val { font-size: 13px; color: var(--ink); margin-top: 2px; font-weight: 500; }
  .doc-table td, .doc-table th { padding: 10px 20px; }
  .doc-table th { font-size: 9px; letter-spacing: 1.5px; border-top: none; }
  .doc-footer { padding: 16px 20px; background: #fafaf8; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; }
  .doc-total { text-align: right; }
  .doc-total-label { font-size: 11px; color: var(--ink-ghost); text-transform: uppercase; letter-spacing: 1px; }
  .doc-total-value { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--ink); }
  .sig-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; padding: 16px 20px; border-top: 1px solid var(--border); }
  .sig-box { text-align: center; }
  .sig-line { border-top: 1px solid var(--border); margin-bottom: 4px; padding-top: 4px; }
  .sig-role { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--ink-ghost); }

  .empty-state { padding: 40px; text-align: center; color: var(--ink-ghost); }
  .empty-state svg { margin: 0 auto 10px; display: block; opacity: 0.3; }
  .empty-state p { font-size: 13px; }

  /* LOGIN */
  .login-wrap {
    min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
    background: var(--paper);
  }
  .login-brand {
    background: var(--ink); color: var(--paper);
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 64px; position: relative; overflow: hidden;
  }
  .login-brand::before {
    content: ''; position: absolute; top: -120px; right: -120px;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,150,44,0.18) 0%, transparent 70%);
  }
  .login-brand::after {
    content: ''; position: absolute; bottom: -80px; left: -80px;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,150,44,0.1) 0%, transparent 70%);
  }
  .brand-logo { font-family: 'DM Serif Display', serif; font-size: 28px; letter-spacing: -0.5px; }
  .brand-logo span { color: var(--gold); }
  .brand-tagline { font-size: 42px; font-family: 'DM Serif Display', serif; line-height: 1.2; font-weight: 400; }
  .brand-tagline em { color: var(--gold); font-style: italic; }
  .brand-hint { font-size: 12px; color: rgba(250,248,244,0.45); font-family: 'DM Mono', monospace; }

  .login-form-wrap {
    display: flex; flex-direction: column; justify-content: center;
    padding: 80px 72px; background: var(--paper);
  }
  .login-title { font-family: 'DM Serif Display', serif; font-size: 36px; margin-bottom: 8px; color: var(--ink); }
  .login-sub { color: var(--muted); font-size: 14px; margin-bottom: 48px; font-weight: 300; }

  .form-group { margin-bottom: 24px; }
  .form-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
  .form-input-wrap { position: relative; }
  .form-input {
    width: 100%; padding: 14px 44px 14px 16px; border: 1.5px solid var(--warm-gray);
    border-radius: 6px; font-size: 15px; background: white; color: var(--ink);
    font-family: 'DM Sans', sans-serif; transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }

  .btn-login:hover { background: #1e1c18; }
  .btn-login:active { transform: scale(0.99); }
  .demo-creds {
    margin-top: 32px; padding: 16px; background: var(--cream);
    border-radius: 8px; border: 1px solid var(--warm-gray);
  }
  .demo-creds-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); font-weight: 600; margin-bottom: 10px; }
  .demo-cred { display: flex; gap: 8px; font-family: 'DM Mono', monospace; font-size: 12px; color: var(--ink); margin-bottom: 4px; }
  .demo-cred span:first-child { color: var(--muted); width: 90px; }



  .user-info { flex: 1; min-width: 0; }

  .user-name {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-role {
    font-size: 11px;
    color: var(--color-text-tertiary);
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 28px;
    gap: 20px;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .page-title {
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text-primary);
    letter-spacing: -0.3px;
  }

  .page-subtitle {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin-top: 2px;
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 14px;
    border-radius: var(--border-radius-md);
    border: 0.5px solid var(--color-border-secondary);
    background: var(--color-background-primary);
    color: var(--color-text-secondary);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
  }

  .toggle-btn:hover { background: var(--color-background-secondary); color: var(--color-text-primary); }

  .code-card {
    background: var(--color-background-primary);
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    flex: 1;
  }

  .code-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 0.5px solid var(--color-border-tertiary);
    background: var(--color-background-secondary);
  }

  .dot { width: 10px; height: 10px; border-radius: 50%; }
  .dot-r { background: #ff6b6b; }
  .dot-y { background: #ffd166; }
  .dot-g { background: #06d6a0; }

  .code-filename {
    font-family: 'DM Mono', monospace;
    font-size: 11.5px;
    color: var(--color-text-secondary);
    margin-left: 4px;
  }

  .code-body {
    padding: 16px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-secondary);
    overflow: auto;
  }

  .kw { color: #7c3aed; }
  .fn { color: #0891b2; }
  .str { color: #059669; }
  .cm { color: var(--color-text-tertiary); font-style: italic; }
  .prop { color: #b45309; }

  .info-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .chip {
    font-size: 11.5px;
    padding: 4px 10px;
    border-radius: 100px;
    border: 0.5px solid var(--color-border-tertiary);
    color: var(--color-text-secondary);
    background: var(--color-background-secondary);
  }

  .chip.active { background: #ede9fe; color: #5b21b6; border-color: #c4b5fd; }



  .section-gap { margin-top: 20px; }

  @media (max-width: 900px) {
    .stats-row { grid-template-columns: 1fr 1fr; }
    .sidebar { width: 200px; }
    .main { padding: 24px 20px; }
  }
`;




const NAV_ITEMS = [
  {
    id: "dashboard",
    icon: "▦",
    label: "Dashboard",
    path: "dashboard",
  },
  {
    id: "employees",
    icon: "👥",
    label: "Employees",
    children: [
      { id: "emp-list", label: "Employee List", path: "employees/list" },
      { id: "emp-sss", label: "SSS Table", path: "employees/sss" },      
      { id: "emp-departments", label: "Departments", path: "employees/departments" },
      { id: "emp-positions", label: "Positions", path: "employees/positions" },
    ],
  },
  {
    id: "payroll",
    icon: "💰",
    label: "Payroll",
    children: [
      { id: "pay-run", label: "Run Payroll", path: "payroll/run" },
      { id: "pay-history", label: "Payroll History", path: "payroll/history" },
      { id: "pay-schedule", label: "Pay Schedule", path: "payroll/schedule" },
      { id: "pay-adjustments", label: "Adjustments", path: "payroll/adjustments" },
    ],
  },
  {
    id: "attendance",
    icon: "📅",
    label: "Attendance",
    children: [
      { id: "att-log", label: "Attendance Log", path: "attendance/log" },
      { id: "att-leaves", label: "Leave Requests", path: "attendance/leaves" },
      { id: "att-overtime", label: "Overtime", path: "attendance/overtime" },      
    ],
  },
  {
    id: "deductions",
    icon: "📊",
    label: "Deductions & Tax",
    children: [
      { id: "ded-tax", label: "Tax Table", path: "deductions/tax" },
      { id: "ded-benefits", label: "Benefits", path: "deductions/benefits" },
      { id: "ded-loans", label: "Loans", path: "deductions/loans" },
      { id: "ded-charts", label: "Charts", path: "deductions/charts" },
    ],
  },
  {
    id: "reports",
    icon: "📋",
    label: "Reports",
    children: [
      { id: "rep-emplist", label: "Employee List", path: "reports/emplist" },
      { id: "rep-payslip", label: "Payslips", path: "reports/payslip" },
      { id: "rep-summary", label: "Summary Report", path: "reports/summary" },
      { id: "rep-tax", label: "Tax Report", path: "reports/tax" },
      { id: "rep-audit", label: "Audit Trail", path: "reports/audit" },
      { id: "rep-graph", label: "Graphical", path: "reports/graph" },
      { id: "rep-graphtest", label: "Graph Dept Salary", path: "reports/graphtest" },
    ],
  },
  {
    id: "settings",
    icon: "⚙️",
    label: "Settings",
    children: [
      { id: "set-company", label: "Company Info", path: "settings/company" },
      { id: "set-users", label: "User Access", path: "settings/users" },
      { id: "set-notifications", label: "Notifications", path: "settings/notifications" },
      { id: "set-orders", label: "Orders", path: "settings/orders" },
    ],
  },
];

const SUMMARY_CARDS = [
  { label: "Total Employees", value: "248", delta: "+3 this month", color: "#1a6fd4", bg: "#e8f1fd" },
  { label: "Monthly Payroll", value: "₱4.2M", delta: "+2.1% vs last", color: "#0f7a55", bg: "#e3f5ee" },
  { label: "Pending Approvals", value: "12", delta: "3 urgent", color: "#c25e00", bg: "#fff0e0" },
  { label: "On Leave Today", value: "9", delta: "Approved", color: "#7c3aed", bg: "#f0ebff" },
];

const RECENT_PAYROLL = [
  { name: "Ana Reyes", dept: "Engineering", amount: "₱52,000", status: "Paid", date: "Apr 25" },
  { name: "Marco Santos", dept: "Marketing", amount: "₱38,500", status: "Paid", date: "Apr 25" },
  { name: "Liza Cruz", dept: "HR", amount: "₱34,000", status: "Pending", date: "Apr 26" },
  { name: "Diego Lim", dept: "Finance", amount: "₱45,000", status: "Paid", date: "Apr 25" },
  { name: "Sophia Tan", dept: "Engineering", amount: "₱58,000", status: "Processing", date: "Apr 26" },
  { name: "Marlyn Lim", dept: "Engineering", amount: "₱50,000", status: "Processing", date: "Apr 26" },
  { name: "Donald Tampus", dept: "Accounting", amount: "₱47,000", status: "Processing", date: "Apr 24" },

];

function useDispatch() { return store.dispatch; }

function useSelector(selector) {
  const [state, setState] = useState(() => selector(store.getState()));
  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(selector(store.getState())));
    return unsubscribe;
  }, []);
  return state;
}

function authReducer(state = initialAuthState, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS": return { isAuthenticated: true, user: action.payload, error: null };
    case "LOGIN_FAILURE": return { ...state, error: action.payload };
    case "LOGOUT": return initialAuthState;
    case "CLEAR_ERROR": return { ...state, error: null };
    default: return state;
  }
}




const PAGE_CONTENT = {
  dashboard: null,
  "employees/list": { title: "Employee List", desc: "Manage all employee records, contracts, and profiles." },
  "employees/sss": { title: "SSS Table", desc: "Manage all SSS table records." },
  "employees/add": { title: "Add Employee", desc: "Onboard a new employee into the payroll system." },
  "employees/departments": { title: "Departments", desc: "Configure and manage company departments." },
  "employees/positions": { title: "Positions", desc: "Define job titles and salary grades." },
  "payroll/run": { title: "Run Payroll", desc: "Process payroll for the current pay period." },
  "payroll/history": { title: "Payroll History", desc: "View and download past payroll runs." },
  "payroll/schedule": { title: "Pay Schedule", desc: "Set up payroll frequency and cut-off dates." },
  "payroll/adjustments": { title: "Adjustments", desc: "Manage bonuses, commissions, and special pay." },
  "attendance/log": { title: "Attendance Log", desc: "Track daily time-in and time-out records." },
  "attendance/leaves": { title: "Leave Requests", desc: "Approve or deny employee leave applications." },
  "attendance/overtime": { title: "Overtime", desc: "Manage and approve overtime hours." },
  "attendance/charts": { title: "Charts", desc: "Manage Graph Charts Of Employees Pay Rate." },
  "deductions/tax": { title: "Tax Settings", desc: "Configure BIR tax tables and withholding rates." },
  "deductions/benefits": { title: "Benefits", desc: "SSS, PhilHealth, Pag-IBIG, and HMO setup." },
  "deductions/loans": { title: "Loans", desc: "Track salary loans and deduction schedules." },
  "deductions/charts": { title: "Charts", desc: "Track salary loans and deduction schedules." },
  "reports/payslip": { title: "Payslips", desc: "Generate and distribute employee payslips." },
  "reports/summary": { title: "Summary Report", desc: "Consolidated payroll summary by department." },
  "reports/tax": { title: "Tax Report", desc: "BIR Form 2316 and annual tax filings." },
  "reports/audit": { title: "Audit Trail", desc: "Full log of all system actions and changes." },
  "reports/graph": { title: "Graph", desc: "Employess Cost Per Department." },
  "reports/graphtest": { title: "Graph", desc: "Report Graph Analysis" },
  "settings/company": { title: "Company Info", desc: "Update your company name, address, and branding." },
  "settings/users": { title: "User Access", desc: "Manage user roles and permissions." },  
  "settings/notifications": { title: "Notifications", desc: "Configure email and system alerts." },
  "settings/orders": { title: "Orders", desc: "Manage Sales Orders For E-commerce." },    
  "settings/charts": { title: "Charts", desc: "Manage Graph Chart For E-commerce." },    
  
};

function StatusBadge({ status }) {
  const styles = {
    Paid: { bg: "#e3f5ee", color: "#0f7a55" },
    Pending: { bg: "#fff0e0", color: "#c25e00" },
    Processing: { bg: "#e8f1fd", color: "#1a6fd4" },
  };
  const s = styles[status] || { bg: "#f0f0f0", color: "#555" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 600,
      padding: "3px 10px", borderRadius: 20,
    }}>
      {status}
    </span>
  );
}

function DeptColor({ dept }) {
  const styles = {
    Admin : { bg: "#e3f5ee", color: "#0f7a55" },
    Accounting: { bg: "#fff0e0", color: "#c25e00" },
    Marketing: { bg: "#e8f1fd", color: "#1a6fd4" },
    Audit : { bg: "#e3f5ee", color: "#0f7a55" },
    Production: { bg: "#fff0e0", color: "#c25e00" },
    Sales: { bg: "#e8f1fd", color: "#1a6fd4" },
    Warehouse : { bg: "#e3f5ee", color: "#0f7a55" },
    Finance: { bg: "#fff0e0", color: "#c25e00" },    
    Human: { bg: "#fff0e0", color: "#c25e00" },    
  };
  const s = styles[dept] || { bg: "#f0f0f0", color: "#555" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 600,
      padding: "3px 10px", borderRadius: 20,
    }}>
      {dept}
    </span>
  );
}


function Dashboard() {
  //console.log('test dept url : ' + g_deptUrl);
const [gDept,gsetDept] = useState([]);

     useEffect(() => {
        ggetdepts();
      }, [gDept]);
  

const ggetdepts = () => {
        axios
          .get(g_deptUrl)
          .then((res) => {
            gsetDept(res.data) ;  
            //console.log('dept : ' + JSON.stringify(gDept)) ;
          })
          .catch((err) => {
           console.log('error') ;
          });
  };

 // const [deptdata, setdeptdata]=useState([]);

  


//console.log(' dept: ' + JSON.stringify(deptdata)) ;



  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111" }}>Dashboard</h2>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#666" }}>Welcome back, Admin — April 26, 2026</p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16, marginBottom: 28,
      }}>
        {SUMMARY_CARDS.map(c => (
          <div key={c.label} style={{
            background: "#fff", borderRadius: 12,
            border: "1px solid #eee", padding: "18px 20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: 12, color: "#888", fontWeight: 500, marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: c.color, marginBottom: 4 }}>{c.value}</div>
            <div style={{
              fontSize: 12, color: c.color,
              background: c.bg, padding: "2px 8px",
              borderRadius: 20, display: "inline-block",
            }}>{c.delta}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: "#fff", borderRadius: 12,
        border: "1px solid #eee", padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111" }}>Recent Payroll</h3>
          <button style={{
            background: "#f4f6fa", border: "1px solid #e0e4ed",
            borderRadius: 8, padding: "6px 14px",
            fontSize: 13, color: "#1a6fd4", cursor: "pointer", fontWeight: 600,
          }}>View All</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
              {["Employee", "Department", "Amount", "Status", "Date"].map(h => (
                <th key={h} style={{
                  textAlign: "left", fontSize: 12, color: "#999",
                  fontWeight: 600, padding: "0 8px 10px 0", textTransform: "uppercase", letterSpacing: "0.04em",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_PAYROLL.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f7f7f7" }}>
                <td style={{ padding: "12px 8px 12px 0", fontSize: 14, fontWeight: 600, color: "#222" }}>{row.name}</td>
                <td style={{ padding: "12px 8px 12px 0", fontSize: 13, color: "#777" }}>{row.dept}</td>
                <td style={{ padding: "12px 8px 12px 0", fontSize: 14, fontWeight: 700, color: "#111" }}>{row.amount}</td>
                <td style={{ padding: "12px 8px 12px 0" }}><StatusBadge status={row.status} /></td>
                <td style={{ padding: "12px 0 12px 0", fontSize: 13, color: "#aaa" }}>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}

function GenericPage({ path }) {
  const contentpage = PAGE_CONTENT[path];
  //console.log(path);
  if (!contentpage) return null;
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111" }}>{contentpage.title}</h2>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#666" }}>{contentpage.desc}</p>
      </div>
      <div style={{
        background: "#fff", borderRadius: 12,
        border: "1px solid #eee", padding: 32,
        textAlign: "center", color: "#bbb", fontSize: 15,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚧</div>
        <div style={{ fontWeight: 600, color: "#aaa" }}>{contentpage.title} content coming soon</div>
        <div style={{ fontSize: 13, marginTop: 6 }}>This section is under Acs development. </div>
      </div>
    </div>
  );
}

function SalesChart({ entries, chartType }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

//console.log('chart data xxx: ' + JSON.stringify(entries)) ;


  useEffect(() => {
    
    if (!canvasRef.current || !window.Chart) return;
    
    if (chartRef.current) chartRef.current.destroy();
    
    const ctx = canvasRef.current.getContext("2d");
//console.log('test7');

    if (chartType === "category") {
      const byCategory = {};
      //entries.forEach((e) => {
        //byCategory[e.category] = (byCategory[e.category] || 0) + e.qty * e.price;
      //});

      //const labels = Object.keys(byCategory);
      //const data = labels.map((k) => byCategory[k]);
      const labels = entries.map( x=> x.code) ;
      //const data = sorted.map(([, v]) => v);
      const data = entries.map ( x=> x.amount) ;

      //console.log('data : ' + JSON.stringify(data)) ;
      const colors = labels.map((k) => PALETTE[k] || "#888780");

      chartRef.current = new window.Chart(ctx, {
        type: "doughnut",
        data: {
          labels,
          datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: "#fff" }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          cutout: "62%",
        },
      });
    } else if (chartType === "monthly") {
      const byMonth = {};
      //entries.forEach((e) => {
        //const m = e.date.slice(0, 7);
        //byMonth[m] = (byMonth[m] || 0) + e.qty * e.price;
      //});
      const labels = entries.map( x=> x.code) ;      
      const data = entries.map ( x=> x.amount) ;
      //const labels = Object.keys(byMonth).sort();
      //const data = labels.map((k) => byMonth[k]);

      chartRef.current = new window.Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{ label: "Revenue", data, 
             backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 320);
            g.addColorStop(0, "#f97316");
            g.addColorStop(1, "#fed7aa55");
            return g;
          },
            
            borderRadius: 6, borderSkipped: false }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { autoSkip: false } },
            y: { grid: { color: "rgba(0,0,0,0.06)" }, ticks: { callback: (v) => "$" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v) } },
          },
        },
      });
    } else if (chartType === "rep") {
      //console.log(' now in rep category') ;
      //const byRep = {};
      //entries.forEach((e) => {
        //byRep[e.rep] = (byRep[e.rep] || 0) + e.qty * e.price;
      //});
      //const sorted = Object.entries(byRep).sort((a, b) => b[1] - a[1]);
      //const labels = sorted.map(([k]) => k.split(" ")[0]);
      const labels = entries.map( x=> x.code) ;
      //const data = sorted.map(([, v]) => v);
      const data = entries.map ( x=> x.amount) ;
      const colors = ["#3266ad", "#1D9E75", "#EF9F27", "#7F77DD", "#D85A30","#D4bA60","#D82abB30"];
      //console.log('by rep data : ' + JSON.stringify(data)) ;      
      chartRef.current = new window.Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{ label: "Revenue", data, 
            backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 320);
            g.addColorStop(0, "#f97316");
            g.addColorStop(1, "#fed7aa55");
            return g;
          },            
            borderRadius: 6, borderSkipped: false }],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: "rgba(0,0,0,0.06)" }, ticks: { callback: (v) => "$" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v) } },
            y: { grid: { display: false } },
          },
        },
      });
    }

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [entries, chartType]);
  

  return <canvas ref={canvasRef} role="img" aria-label="Sales report chart" />;
}


function TestChartPage({ path }) {
  const contentpage = PAGE_CONTENT[path];
  const [chartLoaded, setChartLoaded] = useState(true);
  const [chartData,setchartData] = useState([]);
  const chartType=useState('rep') ;



  useEffect(() => {

    if (window.Chart) { setChartLoaded(true); return; }
    const s = document.createElement("script");
    //s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    s.src = g_chartUrl;
    s.onload = () => setChartLoaded(true);
    document.head.appendChild(s);

    hgetdepts() ;

setChartLoaded(true) ;

  }, [chartData, chartLoaded]);

    const hgetdepts =  async () => {
        await axios
          .get(g_deptUrl)
          .then((res) => {                      
            setchartData(res.data) ;
      }) 
    }

const xbutton = document.getElementById('btncrefresh');
    if (xbutton) {
       xbutton.click();
    }


const handleShowChart = async () => {
    hgetdepts();
    setChartLoaded(true) ;
}

//const chartH = chartType === "rep" ? Math.max(180, Object.keys(entries.reduce((m, e) => { m[e.rep] = 1; return m; }, {})).length * 48 + 60) : 280;
  

//console.log(path);
  if (!contentpage) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>


          <div style={{
            background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: 24,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>
              Target Per Department Salary
            </div>
            <div style={{ height: 280 }}>
              {chartLoaded ? <SalesChart entries={chartData} chartType={"monthly"} /> : <p style={{ textAlign: "center", color: "var(--color-text-secondary)", paddingTop: 80 }}>Loading chart…</p>}
            </div>
          </div>
          <div style={{
            background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: 24,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>
              Department Salary In Pie Chart
            </div>
            <div style={{ height: 280 }}>
              {chartLoaded ? <SalesChart entries={chartData} chartType={"category"} /> : <p style={{ textAlign: "center", color: "var(--color-text-secondary)", paddingTop: 80 }}>Loading chart…</p>}              
              </div>
          </div>
          <div style={{
            background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: 24,
            gridColumn: "1 / -1",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>
              Per Dept in Horizontal Bar Chart
            </div>
            <div style={{ height: 220 }}>
              
             {chartLoaded ? <SalesChart entries={chartData} chartType={"rep"} /> : <p style={{ textAlign: "center", color: "var(--color-text-secondary)", paddingTop: 80 }}>Loading chart…</p>}

              </div>
          </div>




      <div style={{ fontSize: 48, marginBottom: 12 }}>
        <button id="btnrefresh"
          onClick={handleShowChart}
          style={{ padding: "10px 20px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Icon path={ICONS.arrow} size={14} />
          
        </button>
      </div>
    </div>
  );
}




function EmpPreview ({doc , onClose}) {

  const total = doc.reduce((sum, l) => {    
    const cost = Number(l.salaryrate) ;
    return sum + cost ;
  }, 0);
  
return (
      <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Document Preview</div>
            <div className="modal-subtitle">{"Employees Alpha List"}</div>
          </div>
          <div style={{ display: "flex", gap: "8px", position:"absolute",right:"10px" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
              <Icon path={ICONS.download} size={13} /> Print
            </button>
            <button style={{textAlign:"right"}} className="btn-icon" onClick={onClose}><Icon path={ICONS.close} /></button>
          </div>
        </div>
        <div className="modal-body">
          <div className="doc-print">
            <div className="doc-head">
              <div>
                <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", color: "var(--ink-ghost)", marginBottom: "4px" }}>Document</div>
                <div className="doc-title">{"Emp Page Report"}</div>
                <div className="doc-meta">{"BIR Requirement"}</div>
              </div>
              <div className="doc-number">{"E-01"}</div>
            </div>
            <div className="doc-info-row">
              <div className="doc-info-cell">
                <div className="doc-info-label">{"For the Year 2026" }</div>
                <div className="doc-info-val">{"H.R Department"}</div>
              </div>
              <div className="doc-info-cell">
                <div className="doc-info-label">{"Requested By"}</div>
                <div className="doc-info-val">{"acs"}</div>
              </div>
            </div>
            <table className="doc-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>EmpID</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>LastName</th>
                  <th style={{ textAlign: "center", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>FirstName</th>
                  <th style={{ textAlign: "right", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>MiddleName</th>
                  <th style={{ textAlign: "right", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Salary</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Dept</th>
                </tr>
              </thead>
              <tbody>
                {doc.map((l, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: "11px", color: "var(--ink-ghost)" }}>{i + 1}</td>
                    <td style={{ fontWeight: 500,textAlign: "left" }}>{l.lastname}</td>
                    <td style={{ textAlign: "left", color: "var(--ink-soft)", fontSize: "12px" }}>{l.firstname}</td>
                    <td style={{ textAlign: "left", fontFamily: "'DM Mono',monospace", fontSize: "13px" }}>{l.middlename}</td>
                    <td style={{ textAlign: "right", fontFamily: "'DM Mono',monospace", fontSize: "12px", color: "var(--ink-soft)" }}>{fmt(l.salaryrate)}</td>
                    <td style={{ textAlign: "left", fontFamily: "'DM Mono',monospace", fontSize: "13px" }}>{l.dept}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="doc-footer">
              <div className="doc-total">
                <div className="doc-total-label">Total Amount </div>
                <div className="doc-total-value">{fmt(total)}</div>
                <div className="doc-total-label">Employees Count : </div>
                <div className="doc-total-value">{doc.length}</div>
              </div>
            </div>
            <div className="sig-row">
              {"Requested By"}
            </div>
          </div>
        </div>
      </div>
    </div>
);

}

function OrderPreview ({docx,onClose}) {

//  console.log('doc y 666 : ' + JSON.stringify(docx)) ;
//  const total = 0 ;
  const total = docx.ordersub.reduce((sum, l) => {    
    const cost = Number(l.total) ;
    return sum + cost ;
  }, 0);
  
return (
      <div className="overlayprv" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Customer Order</div>
            <div className="doc-number">{docx.invno}</div>            
          </div>
          <div style={{ display: "flex", gap: "8px", position:"absolute",right:"10px" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
              <Icon path={ICONS.download} size={13} /> Print
            </button>
            <button style={{textAlign:"right"}} className="btn-icon" onClick={onClose}><Icon path={ICONS.close} /></button>
          </div>
        </div>
        <div className="modal-body">
          <div className="doc-print">
            
            <div className="doc-head" style={{display: "flex", gap: "4px"}}>
                <div style={{  fontSize: "13px",  letterSpacing: "1px", color: "var(--ink-ghost)", marginBottom: "2px" }}>Inv# : {docx.invno} </div>
                <div style={{ fontSize: "13px",  letterSpacing: "1px", color: "var(--ink-ghost)", marginBottom: "2px" }}>Inv Date : {docx.invdate}</div>
                <div style={{  fontSize: "13px",  letterSpacing: "1px", color: "var(--ink-ghost)", marginBottom: "2px" }}>SO # : {docx.sono} </div>
            </div>
            
            <div className="doc-head" style={{display: "flex", gap: "4px"}}>              
              <div style={{ display: "flex",fontSize: "13px",  letterSpacing: "1px", color: "var(--ink-ghost)", marginBottom: "2px" }}>Customer : {docx.custname}</div>   
                           <div style={{ display: "flex",fontSize: "13px",  letterSpacing: "1px", color: "var(--ink-ghost)", marginBottom: "2px" }}>Reference # : {docx.referno}</div>   
              
            </div>
            <div className="doc-head" style={{display: "flex", gap: "4px"}}>                            
              <div style={{ fontSize: "11px",  letterSpacing: "1px", color: "var(--ink-ghost)", marginBottom: "2px" }}>Remarks : {docx.remarks}</div>                              
            </div>




            <div className="doc-info-row">
              <div className="doc-info-cell">
                <div className="doc-info-label">{"For the Year" }</div>
                <div className="doc-info-val">{"Sales Dept"}</div>
              </div>
              <div className="doc-info-cell">
                <div className="doc-info-label">{"Requested By"}</div>
                <div className="doc-info-val">{"acs"}</div>
              </div>
            </div>
            <table className="doc-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Tran#</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Code</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Product Description</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Unit</th>
                  <th style={{ textAlign: "center", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Qty</th>
                  <th style={{ textAlign: "right", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Price</th>
                  <th style={{ textAlign: "right", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {docx.ordersub.map((l, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: "11px", color: "var(--ink-ghost)" }}>{i + 1}</td>                    
                    <td style={{ textAlign: "left", color: "var(--ink-soft)", fontSize: "12px" }}>{l.prodcode}</td>
                    <td style={{ textAlign: "left", fontFamily: "'DM Mono',monospace", fontSize: "13px" }}>{l.proddescription}</td>
                    <td style={{ textAlign: "right", fontFamily: "'DM Mono',monospace", fontSize: "12px", color: "var(--ink-soft)" }}>{l.unit}</td>
                    <td style={{ textAlign: "left", fontFamily: "'DM Mono',monospace", fontSize: "13px" }}>{l.qty}</td>
                    <td style={{ textAlign: "left", fontFamily: "'DM Mono',monospace", fontSize: "13px" }}>{l.price}</td>
                    <td style={{ textAlign: "left", fontFamily: "'DM Mono',monospace", fontSize: "13px" }}>{l.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="doc-footer">
              <div className="doc-total">
                <div className="doc-total-label">Total Amount </div>
                <div className="doc-total-value">{fmt(total)}</div>
                <div className="doc-total-label">Product Count : </div>
                <div className="doc-total-value">{docx.ordersub.length}</div>
              </div>
            </div>
            <div className="sig-row">
              {"Prepared By"}
            </div>
          </div>
        </div>
      </div>
    </div>
);

}



function EmpPage({ path }) {
  //console.log('employees path : ' + path) ;
  const contentpage = PAGE_CONTENT[path];
  const apiUrl = config.SERVER_URL;
  const empUrl = config.EMPLOY_URL;
  const deptUrl = config.DEPT_URL;
  const [employs, setEmploys] = useState([]);
  const [employsEdited, setEmploysEdited] = useState([]);
  const [depts, setDepts] = useState([]);
  const ITEMS_PER_PAGE = 7 ;
  const [xpage, setPage] = useState(1);
  const [search, setSearch] = useState(""); 
  const [sortBy, setSortBy] = useState("lastname");

  const [category, setCategory] = useState("All");
  


  const [editingId, setEditingId] = useState(null);  
  const [items, setItems] = useState(employs);
  const [isPreview, setPreview] = useState(false);
  const [isEmpEdit, setEmpEdit] = useState(false);

  const movId = useRef() ;
  const movNewId = useRef() ;
  const movLastname = useRef();
  const movFirstname = useRef();
   const movMiddlename = useRef();
    const movSalaryrate = useRef();
    const movSssno=useRef();
    const movPHno=useRef();
    const movHDMFno=useRef();
    const movDept =useRef();

       

  setGlobal({ title : "welcome" });
  setGlobal({ greet : "hi" });  

   useEffect(() => {
        getEmploys();
        getDepts();
      }, [employs,depts]);

const filtered = useMemo(() => {
    //let data = state.items;
    let data = employs ;
    if (category !== "All") data = data.filter(i => i.category === category);
    if (search) data = data.filter(i => i.lastname.toLowerCase().includes(search.toLowerCase()) || i.first.toLowerCase().includes(search.toLowerCase()));
    data = [...data].sort((a, b) => {
      if (sortBy === "lastname") return a.lastname.localeCompare(b.lastname);
      if (sortBy === "firstname") return b.firstname;
      if (sortBy === "middlename") return b.middlename;
      return 0;
    });
    return data;
  }, [employs, category, search, sortBy]);


  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const sortedDept = useMemo(() => {
  let sortableItems = [...depts]; // Copy to avoid mutation
  sortableItems.sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  return sortableItems;
}, [depts, sortConfig]);





  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((xpage - 1) * ITEMS_PER_PAGE, xpage * ITEMS_PER_PAGE);


  function deleteItem(id) {

  const confirmed = window.confirm("Are you sure you want to delete this item?");
  
  if (!confirmed) {
    // Proceed with deletion logic
  //  console.log("You cancel the process,  Item not deleted....");
    return ;
  }


      setEmploys(prev => prev.filter (i => i.id !==id));

    const _urlnew = empUrl + "/" + id ;
    fetch(_urlnew , {
    method: "DELETE",
    headers: {
      //'Authorization': `Bearer ${token}`,
       "Content-Type": "application/json",
    },
    //body: JSON.stringify(state),
    })
    .then((response) => {
       if (!response.ok) {        
         console.log('error Acs1');
        throw new Error("Network response was not ok");
        }     
        getEmploys();         
        return response.json();   
     })
  }

 

  const handleAdd = async (id) => {
        movLastname.current = "" ;
        movFirstname.current = "" ;
        movMiddlename.current="";
        movSalaryrate.current="";
        movSssno.current="";
        movPHno.current="";
        movHDMFno.current="";
        movDept.current="";             
        movId.current = 0 ; 
        
        const newId = Number (employs.length) + 1  ;
        movNewId.current = newId ;
        setEmpEdit(true);
}



const handleEdit = async (id)  => {
    //movies.current = id ;
    const _url = empUrl + '/' + id ;
    const newId = 0  ;
    //setseriesId(newId) ;
    movId.current=id ;
    movNewId.current="0" ;
    

try {
   
  
 await axios
      .get(_url)
      .then((resx) => {
            
        movLastname.current = resx.data.lastname ;
        movFirstname.current = resx.data.firstname ;
        movId.current = id ; 
        movMiddlename.current =resx.data.middlename ;
        movSalaryrate.current =resx.data.salaryrate;        
        movSssno.current = resx.data.sssno;
        movPHno.current=resx.data.philhealthno;
        movHDMFno.current=resx.data.hdmfno;
        movDept.current=resx.data.dept ;
        //console.log('emp dept : ' + resx.data.dept);

      })
      .catch((err) => {
        console.log(err);
      });

  } catch (error) {
     //setError(error.message);
  } finally {
   // setIsLoading(false);
  }

    //setShowModal(true);
    setEmpEdit(true);

  }




  const getEmploys = () => {
        axios
          .get(empUrl)
          .then((res) => {
            setEmploys(res.data);            
            //console.log('acsxx logging success 123');
          })
          .catch((err) => {
            //console.log('acs error logging 123');
            //console.log(err);
          });
};

const getDepts = () => {
        axios
          .get(deptUrl)
          .then((res) => {
            setDepts(res.data);            
            //console.log('acsxx logging success 123');
          })
          .catch((err) => {
            //console.log('acs error logging 123');
            //console.log(err);
          });
};




 const handlePreview = async ()  => {
      setPreview(true);
 }

const sortedItems = [...employs].sort((a, b) => {
  return a.lastname.localeCompare(b.lastname);
  //return b.lastname.localeCompare(a.lastname);
});


//console.log('sorted dept :' + JSON.stringify(sortedDept)) ;
  
  if (!contentpage) return null;
  return (
   <>
    {isPreview && (
        <EmpPreview doc={sortedItems} onClose={() => setPreview(false) }/>
      )}
       
    {isEmpEdit && (
        <EmpModalV2 doc={employsEdited} docdept={sortedDept} vId={movId.current} vLastname={movLastname.current} vFirstName={movFirstname.current} vMiddleName={movMiddlename.current} vSalary={movSalaryrate.current}  
        vSssno={movSssno.current} vPhno={movPHno.current} vHdmfno={movHDMFno.current} vDept={movDept.current} 
        onClose={() => setEmpEdit(false) } vNewId={movNewId.current} vUrl={empUrl}/>
      )}


    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111" }}>Employee Page</h2>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#666" }}>Welcome back, Admin — April 26, 2026</p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16, marginBottom: 28,
      }}>
      </div>

      <div style={{
        background: "#fff", borderRadius: 12,
        border: "1px solid #eee", padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, color: "#111" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111" }}>Employees List</h3>
          
          <button style={{
            background: "#f4f6fa", border: "1px solid #e0e4ed",
            borderRadius: 8, padding: "6px 14px",
            fontSize: 13, color: "#1a6fd4", cursor: "pointer", fontWeight: 600,
          }} onClick={() => setPreview(true)}>Print</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f0f0f0", color:"#111" }}>
              {["EMP I.D" ,"Last Name", "First Name", "Middle Name", "SSS No", "Department","Action"].map(h => (
                <th key={h} style={{
                  textAlign: "left", fontSize: 14, color: "#111",
                  fontWeight: 600, padding: "0 8px 10px 0", textTransform: "uppercase", letterSpacing: "0.04em",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            

              {paginated.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#444", fontSize: 14 }}>No items found.</td></tr>
              ) : paginated.map((item, i) => (              

                

                <tr key={item.id} style={{ borderBottom: "1px solid #a39991", background: i % 2 === 0 ? "transparent" : "#f7f5f5", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f7f5f5"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "#f7f5f5"}>
                  
                    <td style={{ padding: "14px 16px" }}> {item.id} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.lastname} </td>  
                    <td style={{ padding: "14px 16px",textAlign:"left" }}>{item.firstname} </td>  
                    <td style={{ padding: "14px 16px",textAlign:"left" }}>{item.middlename} </td>  
                    <td style={{ padding: "14px 16px",textAlign:"left" }}>{item.sssno} </td>                      
                    <td style={{ padding: "14px 16px",textAlign:"left" }}> <DeptColor dept={item.dept} /> </td>                      
                    
                 <td style={{ padding: "14px 16px",textAlign:"left" }}>
                <button onClick={() => handleEdit(item.id)}  style={{
                            background: "none", border: "0.5px solid var(--color-border-secondary)",
                            borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer",
                            color: "var(--color-text-primary)"
                          }}>Edit</button> 
                </td><td>
                          <button onClick={() => deleteItem(item.id)} style={{
                            background: "none", border: "0.5px solid #F09595",
                            borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer",
                            color: "#A32D2D"
                          }}>
                          
                                     <Icon path={ICONS.trash} size={13} />
                          
                          </button> 
                          
                          </td>

                </tr>
              ))}




          </tbody>
        </table>
       </div>

      <div style={{ display: "flex", gap:6 }}>
          <div className="form-row  ">
             <hr>               
             </hr>
             <hr>               
             </hr>
             <hr>               
             </hr>
          </div>        
       </div>


       <div style={{ display: "flex", gap:6 }}>
            <button onClick={() => setPage(1)} disabled={xpage === 1} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 12px", color: xpage === 1 ? "#333" : "#aaa", cursor: xpage === 1 ? "not-allowed" : "pointer", fontSize: 13 }}>«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={xpage === 1} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 14px", color: xpage === 1 ? "#333" : "#aaa", cursor: xpage === 1 ? "not-allowed" : "pointer", fontSize: 13 }}>‹</button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ background: p === xpage ? "linear-gradient(90deg,#4f8ef7,#6c63ff)" : "#ef4444", border: p === xpage ? "none" : "1px solid #2a2d3e", borderRadius: 8, padding: "8px 14px", color: p === xpage ? "#fff" : "#666", cursor: "pointer", fontWeight: p === xpage ? 700 : 400, fontSize: 13 }}>
                {p}
              </button>
            ))}

            
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={xpage === totalPages || totalPages === 0} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 14px", color: (xpage === totalPages || totalPages === 0) ? "#333" : "#aaa", cursor: (xpage === totalPages || totalPages === 0) ? "not-allowed" : "pointer", fontSize: 13 }}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={xpage === totalPages || totalPages === 0} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 12px", color: (xpage === totalPages || totalPages === 0) ? "#333" : "#aaa", cursor: (xpage === totalPages || totalPages === 0) ? "not-allowed" : "pointer", fontSize: 13 }}>»</button>
            <button onClick={() => handleAdd(0)} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 12px", color: xpage === 1 ? "#333" : "#aaa",  fontSize: 13 }}>+</button>

       </div>

    </div>
</>    
  
  );
}




function EmpDept({ path }) {
  const page = PAGE_CONTENT[path];
  const apiUrl = config.SERVER_URL;
  const deptUrl = config.DEPT_URL;
  const [depts, setDepts] = useState([]);
  const ITEMS_PER_PAGE = 7 ;
  const [xpage, setPage] = useState(1);
  const [search, setSearch] = useState(""); 
  const [sortBy, setSortBy] = useState("lastname");

  const [category, setCategory] = useState("All");


  const [editingId, setEditingId] = useState(null);  
  const [items, setItems] = useState(depts);

  

  setGlobal({ title : "welcome" });
  setGlobal({ greet : "hi" });  
  //console.log('global title : ' + getGlobal('title') );
  //console.log('global greet : ' + getGlobal('greet') );
  //console.log(path);
  //console.log('emp acs url: ' + empUrl) ;
  //console.log('api url: ' + apiUrl) ;

   useEffect(() => {
        getDepts();
      }, []);

const filtered = useMemo(() => {
    //let data = state.items;
    let data = depts ;
    if (category !== "All") data = data.filter(i => i.category === category);
    if (search) data = data.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.first.toLowerCase().includes(search.toLowerCase()));
    data = [...data].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.id);
      if (sortBy === "name") return b.name;
      if (sortBy === "id") return b.id;
      return 0;
    });
    return data;
  }, [depts, category, search, sortBy]);


  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((xpage - 1) * ITEMS_PER_PAGE, xpage * ITEMS_PER_PAGE);


  function deleteItem(id) {
    setDepts(prev => prev.filter (i => i.id !==id));
    //if (editingId === id) setEditingId(null);
  }


  const getDepts = () => {
        axios
          .get(deptUrl)
          .then((res) => {
            setDepts(res.data);            
            console.log('acsxx logging success 123');
          })
          .catch((err) => {
            console.log('acs error logging 123');
            console.log(err);
          });
};


  if (!page) return null;
  return (
   
  
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111" }}>Department Page</h2>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#666" }}>Welcome back, Admin — April 26, 2026</p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16, marginBottom: 28,
      }}>
      </div>

      <div style={{
        background: "#fff", borderRadius: 12,
        border: "1px solid #eee", padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, color: "#111" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111" }}>Employees List</h3>
          <button style={{
            background: "#f4f6fa", border: "1px solid #e0e4ed",
            borderRadius: 8, padding: "6px 14px",
            fontSize: 13, color: "#1a6fd4", cursor: "pointer", fontWeight: 600,
          }}>View All</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f0f0f0", color:"#111" }}>
              {["DEPT I.D" ,"Name", "Action"].map(h => (
                <th key={h} style={{
                  textAlign: "left", fontSize: 14, color: "#111",
                  fontWeight: 600, padding: "0 8px 10px 0", textTransform: "uppercase", letterSpacing: "0.04em",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            

              {paginated.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#444", fontSize: 14 }}>No items found.</td></tr>
              ) : paginated.map((item, i) => (              

                

                <tr key={item.id} style={{ borderBottom: "1px solid #a39991", background: i % 2 === 0 ? "transparent" : "#f7f5f5", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f7f5f5"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "#f7f5f5"}>
                  
                    <td style={{ padding: "14px 16px",textAlign:"left" }}> {item.id} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.name} </td>  
                    <td style={{ padding: "14px 16px",textAlign:"left" }}>
                    <button onClick={alert('you click edit')} style={{
                            background: "none", border: "0.5px solid var(--color-border-secondary)",
                            borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer",
                            color: "var(--color-text-primary)"
                          }}>Edit</button> 
                </td><td>
                          <button onClick={() => deleteItem(item.id)} style={{
                            background: "none", border: "0.5px solid #F09595",
                            borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer",
                            color: "#A32D2D"
                          }}>
                          
                                     <Icon path={ICONS.trash} size={13} />
                          
                          </button> 
                          
                          </td>

                </tr>
              ))}




          </tbody>
        </table>
       </div>
       <div style={{ display: "flex", gap:6 }}>
            <button onClick={() => setPage(1)} disabled={page === 1} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 12px", color: page === 1 ? "#333" : "#aaa", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 13 }}>«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 14px", color: page === 1 ? "#333" : "#aaa", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 13 }}>‹</button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ background: p === page ? "linear-gradient(90deg,#4f8ef7,#6c63ff)" : "#ef4444", border: p === page ? "none" : "1px solid #2a2d3e", borderRadius: 8, padding: "8px 14px", color: p === page ? "#fff" : "#666", cursor: "pointer", fontWeight: p === page ? 700 : 400, fontSize: 13 }}>
                {p}
              </button>
            ))}

            
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 14px", color: (page === totalPages || totalPages === 0) ? "#333" : "#aaa", cursor: (page === totalPages || totalPages === 0) ? "not-allowed" : "pointer", fontSize: 13 }}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages || totalPages === 0} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 12px", color: (page === totalPages || totalPages === 0) ? "#333" : "#aaa", cursor: (page === totalPages || totalPages === 0) ? "not-allowed" : "pointer", fontSize: 13 }}>»</button>

       </div>

    </div>
    
  
  );
}

function DocumentModal() {
  console.log('test acs');
  return (

  <>
    <div
      className="modal show"
      style={{ display: 'block', position: 'initial' }}
    >
    </div>
</>
  );
}




function UserPage({ path }) {
  
  const contentpage = PAGE_CONTENT[path];
  //console.log('contentpage : ' + contentpage.length) ;


  const apiUrl = config.SERVER_URL;
  const userUrl = config.USER_URL;
  const [users, setUsers] = useState([]);
  const [usersEdited, setusersEdited] = useState([]);
  const [testId, settestId]   = useState(0);

  const [editedXname, seteditedXname] = useState("");  
  const [editedId, seteditedId] = useState("");

  const [editedName, seteditedName] = useState("");  
  const [editedEmail, seteditedEmail] = useState("");
  const [editedPwd, seteditedPwd] = useState("");
  const [editedPhone, seteditedPhone] = useState("");

const [loading, setLoading] = useState(true);  
 
  
  //const [editedId, seteditedId] = useState("");

  const ITEMS_PER_PAGE = 7 ;
  const [xpage, setPage] = useState(1);
  const [search, setSearch] = useState(""); 
  const [sortBy, setSortBy] = useState("name");

  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [goRefresh, goSetRefresh] = useState(false);

  const [editingId, setEditingId] = useState(null);  
  const [seriesId, setseriesId] = useState(0) ;
 
  const movies = useRef() ;
  const movId = useRef() ;
  const movName = useRef();
  const movEmail = useRef();
   const movPhone = useRef();
    const movDept = useRef();
     const movPwd = useRef();
     const movNewId = useRef();

  
  setGlobal({ title : "welcome" });
  setGlobal({ greet : "hi" });  
  

   useEffect(() => {
        getUsers();   
      }, [users, seriesId]);

   

const filtered = useMemo(() => {
    //let data = state.items;
    let data = users ;
    if (category !== "All") data = data.filter(i => i.category === category);
    if (search) data = data.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.first.toLowerCase().includes(search.toLowerCase()));
    data = [...data].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.id);
      if (sortBy === "name") return b.name;
      if (sortBy === "id") return b.id;
      return 0;
    });
    return data;
  }, [users, category, search, sortBy]);


  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((xpage - 1) * ITEMS_PER_PAGE, xpage * ITEMS_PER_PAGE);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  function deleteItem(id) {
      setUsers(prev => prev.filter (i => i.id !==id));
    //if (editingId === id) setEditingId(null);

    const _urlnew = userUrl + "/" + id ;
    fetch(_urlnew , {
    method: "DELETE",
    headers: {
      //'Authorization': `Bearer ${token}`,
       "Content-Type": "application/json",
    },
    //body: JSON.stringify(state),
    })
    .then((response) => {
       if (!response.ok) {        
         console.log('error Acs1');
        throw new Error("Network response was not ok");
        }     
        getUsers();         
        return response.json();   
     })
  }

  const getUsers = () => {
        axios
          .get(userUrl)
          .then((res) => {
            setUsers(res.data);                        
          })
          .catch((err) => {
          });
  };


  //() => setShowModal(true)
 
const handleAdd = async (id) => {

        movName.current = "" ;
        movEmail.current = "" ;
        movId.current = 0 ; 
        movPhone.current ="" ;
        movDept.current ="" ;
        movPwd.current = "" ;
        const newId = Number (users.length) + 1  ;
        movNewId.current = newId ;
        setShowModal(true);                     
}

 const handleEdit = async (id)  => {
    //const [message, setMessage] = useState('Waiting for 1 minute...');
    //const movies = useRef();    
    movies.current = id ;
    const _url = userUrl + '/' + id ;
    const newId = 0  ;
    setseriesId(newId) ;
    movNewId.current="0" ;
    

try {
   
  
 await axios
      .get(_url)
      .then((resx) => {
    
        console.log('name:' + resx.data.name) ;
        movName.current = resx.data.name ;
        movEmail.current = resx.data.email ;
        movId.current = id ; 
        movPhone.current =resx.data.phone ;
        movDept.current =resx.data.dept;
        movPwd.current = resx.data.pwd;   

      })
      .catch((err) => {
        console.log(err);
      });


  } catch (error) {
     //setError(error.message);
  } finally {
   // setIsLoading(false);
  }

    setShowModal(true);
    console.log('movies current :' + _url, movies.current ) ;


  }

 
  const handleXclose = async () => {
    setShowModal(false) ;
    getUsers();
  }

  // setShowModal(false)

  if (!contentpage) return null;

  return (   
 <>

 
 {showModal && (
        <DocumentModalV2 type="receipt" xitems={usersEdited} onClose={() => setShowModal(false) }
          onSave={""} vId={movId.current} vName={movName.current} vEmail={movEmail.current} vPhone={movPhone.current} 
          vDept={movDept.current} vPwd={movPwd.current} vUrl={userUrl} vNewId={movNewId.current} />
      )}

    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111" }}>User Page</h2>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#666" }}>Welcome back, Admin — April 26, 2026</p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16, marginBottom: 28,
      }}>
      </div>

      <div style={{
        background: "#fff", borderRadius: 12,
        border: "1px solid #eee", padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, color: "#111" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111" }}>Users List</h3>
          <button onClick={() => handleAdd(0)} style={{
            background: "#f4f6fa", border: "1px solid #e0e4ed",
            borderRadius: 8, padding: "6px 14px",
            fontSize: 13, color: "#1a6fd4", cursor: "pointer", fontWeight: 600,
          }}>New User</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f0f0f0", color:"#111" }}>
              {["USER I.D" ,"Name", "EMAIL","DEPT","Pwd","Action"].map(h => (
                <th key={h} style={{
                  textAlign: "left", fontSize: 14, color: "#111",
                  fontWeight: 600, padding: "0 8px 10px 0", textTransform: "uppercase", letterSpacing: "0.04em",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            

              {paginated.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#444", fontSize: 14 }}>No items found.</td></tr>
              ) : paginated.map((item, i) => (              

                

                <tr key={item.id} style={{ borderBottom: "1px solid #a39991", background: i % 2 === 0 ? "transparent" : "#f7f5f5", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f7f5f5"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "#f7f5f5"}>
                  
                    <td style={{ padding: "14px 16px",textAlign:"left" }}> {item.id} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.name} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.email} </td>                      
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.dept} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.pwd} </td>  
                    <td style={{ padding: "14px 16px",textAlign:"left" }}>
                    <button onClick={() => handleEdit(item.id) } style={{
                            background: "none", border: "0.5px solid var(--color-border-secondary)",
                            borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer",
                            color: "var(--color-text-primary)"
                          }}>Edit</button> 
                  </td><td>
                          <button onClick={() => deleteItem(item.id)} style={{
                            background: "none", border: "0.5px solid #F09595",
                            borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer",
                            color: "#A32D2D"
                          }}>
                          
                                     <Icon path={ICONS.trash} size={13} />
                          
                          </button> 
                          
                          </td>

                </tr>
              ))}
               

          </tbody>
        </table>
       </div>

 <div style={{ display: "flex", gap:6 }}>
          <div className="form-row  ">
             <hr>               
             </hr>
             <hr>               
             </hr>
             <hr>               
             </hr>
          </div>        
       </div>

       <div style={{ display: "flex", gap:6 }}>
            <button onClick={() => setPage(1)} disabled={xpage === 1} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 12px", color: xpage === 1 ? "#333" : "#aaa", cursor: xpage === 1 ? "not-allowed" : "pointer", fontSize: 13 }}>«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={xpage === 1} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 14px", color: xpage === 1 ? "#333" : "#aaa", cursor: xpage === 1 ? "not-allowed" : "pointer", fontSize: 13 }}>‹</button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ background: p === xpage ? "linear-gradient(90deg,#4f8ef7,#6c63ff)" : "#ef4444", border: p === xpage ? "none" : "1px solid #2a2d3e", borderRadius: 8, padding: "8px 14px", color: p === xpage ? "#fff" : "#666", cursor: "pointer", fontWeight: p === xpage ? 700 : 400, fontSize: 13 }}>
                {p}
              </button>
            ))}

            
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={xpage === totalPages || totalPages === 0} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 14px", color: (xpage === totalPages || totalPages === 0) ? "#333" : "#aaa", cursor: (xpage === totalPages || totalPages === 0) ? "not-allowed" : "pointer", fontSize: 13 }}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={xpage === totalPages || totalPages === 0} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 12px", color: (xpage === totalPages || totalPages === 0) ? "#333" : "#aaa", cursor: (xpage === totalPages || totalPages === 0) ? "not-allowed" : "pointer", fontSize: 13 }}>»</button>

       </div>

    </div>
   </> 
  
  );
}


function SssPage({ path }) {
  //console.log('test sss : ' + path ) ;
  const contentpage = PAGE_CONTENT[path];
  //const apiUrl = config.SERVER_URL;
  const employUrl = config.EMPLOY_URL;
  const sssUrl = config.SSS_URL;  
    
  
  const [sss, setSss] = useState([]);  
  const [testId, settestId]   = useState(0);
  
  const [editedId, seteditedId] = useState("");

  const [editedName, seteditedName] = useState("");  
  const [editedEmail, seteditedEmail] = useState("");
  const [editedPwd, seteditedPwd] = useState("");
  const [editedPhone, seteditedPhone] = useState("");

const [loading, setLoading] = useState(true);  
 
  
  const ITEMS_PER_PAGE = 7 ;
  const [xpage, setPage] = useState(1);
  const [search, setSearch] = useState(""); 
  const [sortBy, setSortBy] = useState("name");

  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  
  const [isSSSedit, setisSSSedit] = useState(false);
  
  const [goRefresh, goSetRefresh] = useState(false);

  const [editingId, setEditingId] = useState(null);  
  const [seriesId, setseriesId] = useState(0) ;
 
  const movies = useRef() ;
  const movId = useRef() ;
  const movBracket = useRef();
  const movFrom_ = useRef();
   const movTo_ = useRef();
    const movCredit = useRef();
     const movSsser = useRef();
     const movSssee = useRef();
     const movEc = useRef();
     const movNewId = useRef();

  
  setGlobal({ title : "welcome" });
  setGlobal({ greet : "hi" });  
  

   useEffect(() => {
        getUsers();   
      }, [sss, seriesId]);

   
const filtered = useMemo(() => {
    //let data = state.items;
    let data = sss ;
    if (category !== "All") data = data.filter(i => i.category === category);
    if (search) data = data.filter(i => i.id.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()));
    data = [...data].sort((a, b) => {
      if (sortBy === "from_") return a.from_.localeCompare(b.id);
      if (sortBy === "to_") return b.to_;
      if (sortBy === "id") return b.id;
      return 0;
    });
    return data;
  }, [sss, category, search, sortBy]);



  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((xpage - 1) * ITEMS_PER_PAGE, xpage * ITEMS_PER_PAGE);

//console.log('paginated x : ' + paginated.length) ;

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  function deleteItem(id) {
  
    const confirmed = window.confirm("Are you sure you want to delete this item?");  
    if (!confirmed) {
      // Proceed with deletion logic
      //  console.log("You cancel the process,  Item not deleted....");
      return ;
    }


    setSss(prev => prev.filter (i => i.id !==id));
    //if (editingId === id) setEditingId(null);

   const _urlnew = sssUrl + "/" + id ;
   fetch(_urlnew , {
   method: "DELETE",
   headers: {
    //'Authorization': `Bearer ${token}`,
     "Content-Type": "application/json",
   },
   //body: JSON.stringify(state),
   })
   .then((response) => {
     if (!response.ok) {        
       console.log('error Acs1');
       throw new Error("Network response was not ok");
      }     
      getUsers();         
      return response.json();   
})

  }

  const getUsers = () => {
        axios
          .get(sssUrl)
          .then((res) => {
            setSss(res.data);
            //console.log('success')                        ;
          })
          .catch((err) => {
            console.log('error:' + err)    ;
          });
  };


  //() => setShowModal(true)
 
const handleAdd = async (id) => {

        movBracket.current = "" ;
        movFrom_.current = "" ;
        movId.current = 0 ; 
        movTo_.current ="" ;
        movCredit.current ="" ;
        movSsser.current = "" ;
        movSssee.current = "" ;
        movEc.current = "" ;
        const newId = Number (sss.length) + 1  ;
        movNewId.current = newId ;

        //setShowModal(true);       
       setisSSSedit(true);
               

}

 const handleEdit = async (id)  => {
    //const [message, setMessage] = useState('Waiting for 1 minute...');
    //const movies = useRef();    
    movies.current = id ;
    movId.current=id ;
    const _url = sssUrl + '/' + id ;
    const newId = 0  ;
    setseriesId(newId) ;
    movNewId.current="0" ;   

try {
   
  
 await axios
      .get(_url)
      .then((resx) => {
    
        //console.log('name:' + resx.data.name) ;
        movBracket.current = resx.data.bracket ;
        movFrom_.current = resx.data.from_ ;
        movId.current = id ; 
        movTo_.current =resx.data.to_ ;        
        movCredit.current =resx.data.credit;
        movSsser.current = resx.data.ssser;   
        movSssee.current = resx.data.ssser;   
        movEc.current = resx.data.ec;   
        movNewId.current="0";

      })
      .catch((err) => {
        console.log(err);
      });

  } catch (error) {
     //setError(error.message);
  } finally {
   // setIsLoading(false);
  }
    //setShowModal(true);
    setisSSSedit(true);
    //console.log('movies current :' + _url, movies.current ) ;
  }

  //console.log('sss : ' + JSON.stringify(sss)) ;
  const editUrl = sssUrl ;
  //console.log(' url :' + sssUrl + "/" + movId.current) ;
  // setShowModal(false)
//xitems, onClose, onSave, vId , vBracket, vFrom_, vTo_, vCredit, vSSSer , vSSSee, vEc,vUrl, vNewId


  if (!contentpage) return null;

  return (   
 <>

      {isSSSedit && (
        <SssModalV2 xitems={sss} onClose={() => setisSSSedit(false)} onSave={""} vId={movId.current} 
        vBracket={movBracket.current} vFrom_={movFrom_.current} vTo_={movTo_.current} vCredit={movCredit.current}
        vSsser={movSsser.current} vSssee={movSssee.current} vEc={movEc.current} vUrl={editUrl} vNewId={movNewId.current}
        />
      )}

    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111" }}>SSS Table Page</h2>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#666" }}>Welcome back, Admin — April 26, 2026</p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16, marginBottom: 28,
      }}>
      </div>

      <div style={{
        background: "#fff", borderRadius: 12,
        border: "1px solid #eee", padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, color: "#111" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111" }}>SSS Table</h3>
          <button onClick={() => handleAdd(0)} style={{
            background: "#f4f6fa", border: "1px solid #e0e4ed",
            borderRadius: 8, padding: "6px 14px",
            fontSize: 13, color: "#1a6fd4", cursor: "pointer", fontWeight: 600,
          }}>New Bracket</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f0f0f0", color:"#111" }}>
              {["I.D " ,"Bracket", " FROM"," TO ","CREDIT","SSS ER","SSS EE",,"SSS EC","Action"].map(h => (
                <th key={h} style={{
                  textAlign: "left", fontSize: 14, color: "#111",
                  fontWeight: 600, padding: "0 8px 10px 0", textTransform: "uppercase", letterSpacing: "0.04em",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            

              {paginated.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#444", fontSize: 14 }}>No items found.</td></tr>
              ) : paginated.map((item, i) => (              

              

                <tr key={item.id} style={{ borderBottom: "1px solid #a39991", background: i % 2 === 0 ? "transparent" : "#f7f5f5", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f7f5f5"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "#f7f5f5"}>
                  
                    <td style={{ padding: "14px 16px",textAlign:"left" }}> {item.id} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.bracket} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.from_} </td>                      
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.to_} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.credit} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.ssser} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.sssee} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.ec} </td>  
                    <td style={{ padding: "14px 16px",textAlign:"left" }}>
                    <button onClick={() => handleEdit(item.id) } style={{
                            background: "none", border: "0.5px solid var(--color-border-secondary)",
                            borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer",
                            color: "var(--color-text-primary)"
                          }}>Edit</button> 
                  </td><td>
                          <button onClick={() => deleteItem(item.id)} style={{
                            background: "none", border: "0.5px solid #F09595",
                            borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer",
                            color: "#A32D2D"
                          }}>
                          
                                     <Icon path={ICONS.trash} size={13} />
                          
                          </button> 
                          
                          </td>

                </tr>
              ))}
               

          </tbody>
        </table>
       </div>

 <div style={{ display: "flex", gap:6 }}>
          <div className="form-row  ">
             <hr>               
             </hr>
             <hr>               
             </hr>
             <hr>               
             </hr>
          </div>        
       </div>

      <div style={{ display: "flex", gap:6 }}>
            <button onClick={() => setPage(1)} disabled={xpage === 1} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 12px", color: xpage === 1 ? "#333" : "#aaa", cursor: xpage === 1 ? "not-allowed" : "pointer", fontSize: 13 }}>«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={xpage === 1} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 14px", color: xpage === 1 ? "#333" : "#aaa", cursor: xpage === 1 ? "not-allowed" : "pointer", fontSize: 13 }}>‹</button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ background: p === xpage ? "linear-gradient(90deg,#4f8ef7,#6c63ff)" : "#ef4444", border: p === xpage ? "none" : "1px solid #2a2d3e", borderRadius: 8, padding: "8px 14px", color: p === xpage ? "#fff" : "#666", cursor: "pointer", fontWeight: p === xpage ? 700 : 400, fontSize: 13 }}>
                {p}
              </button>
            ))}

            
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={xpage === totalPages || totalPages === 0} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 14px", color: (xpage === totalPages || totalPages === 0) ? "#333" : "#aaa", cursor: (xpage === totalPages || totalPages === 0) ? "not-allowed" : "pointer", fontSize: 13 }}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={xpage === totalPages || totalPages === 0} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 12px", color: (xpage === totalPages || totalPages === 0) ? "#333" : "#aaa", cursor: (xpage === totalPages || totalPages === 0) ? "not-allowed" : "pointer", fontSize: 13 }}>»</button>
            <button onClick={() => handleAdd(0)} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 12px", color: xpage === 1 ? "#333" : "#aaa",  fontSize: 13 }}>+</button>

       </div>




    </div>



   </> 
  
  );
}



function EmpModalV2({docdept,  vId, vLastname, vFirstName, vMiddleName, vSalary, vSssno, vPhno, vHdmfno,vDept, onClose, vNewId, vUrl }) {
    
  //console.log('phno : ' + vPhno) ;
  
  const [supplier, setSupplier] = useState("");
  const [selectedDept, setSelectedDept] = useState("") ;
  const [dept, setDept] = useState("");
  const [form, setForm] = useState({ lastname: "", firstname: "", middlename: "", sssno: "",phno:"",hdmfno:"", dept:"",salary: 0 });
  const [oAcctg,setoAcctg] = useState(0);
  const [oAdmin,setoAdmin] = useState(0);
  const [oMktg,setoMktg] = useState(0);
   
    

useEffect(() => {
  PostDeptSalary();
      }, [oAcctg,oAdmin,oMktg]);

//resy.data.ordersub.map((item, i) => (                         
//   {id : item.id ,mainid:item.mainid, subid:item.subid, prodcode :item.prodcode,proddescription: item.proddescription,unit:item.unit,qty:item.qty,price:item.price,total:item.total}     
//))      


const PostDeptSalary = async() => {        
        const _urlnew4 = g_empUrl ;        
                
         await axios
          .get(_urlnew4 )
          .then((res) => {
            //console.log('found data: ' + JSON.stringify(res.data)) ;
          const totalAcctg = res.data.reduce((acc, item) => {
          if (item.dept === 'Accounting') {
             return acc + Number(item.salaryrate);
          }
              return acc;
          }, 0);

          const totalMktg = res.data.reduce((acc, item) => {
          if (item.dept === 'Marketing') {
             return acc + Number(item.salaryrate);
          }
              return acc;
          }, 0);

          const totalAdmin = res.data.reduce((acc, item) => {
          if (item.dept === 'Admin') {
             return acc + Number(item.salaryrate);
          }
              return acc;
          }, 0);


          const totalwarehouse = res.data.reduce((acc, item) => {
          if (item.dept === 'Warehouse') {
             return acc + Number(item.salaryrate);
          }
              return acc;
          }, 0);

          const totalsales = res.data.reduce((acc, item) => {
          if (item.dept === 'Sales') {
             return acc + Number(item.salaryrate);
          }
              return acc;
          }, 0);

          const totalaudit = res.data.reduce((acc, item) => {
          if (item.dept === 'Audit') {
             return acc + Number(item.salaryrate);
          }
              return acc;
          }, 0);

          const totalhr = res.data.reduce((acc, item) => {
          if (item.dept === 'Human Resource') {
             return acc + Number(item.salaryrate);
          }
              return acc;
          }, 0);

          //console.log('test compute acctg  :' + totalAcctg) ;

          const acctgbudget20 = Number(totalAcctg) * .20 ;
          const acctgbudget120 = Number(totalAcctg) + acctgbudget20 ;

          const adminbudget20 = Number(totalAdmin) * .20 ;
          const adminbudget120 = Number(totalAdmin) + adminbudget20 ;
          
          const mktgbudget20 = Number(totalMktg) * .20 ;
          const mktgbudget120 = Number(totalMktg) + mktgbudget20 ;

          const whsebudget20 = Number(totalwarehouse) * .20 ;
          const whsebudget120 = Number(totalwarehouse) + whsebudget20 ;

          const hrbudget20 = Number(totalhr) * .20 ;
          const hrbudget120 = Number(totalhr) + hrbudget20 ;
          
          const auditbudget20 = Number(totalaudit) * .20 ;
          const auditbudget120 = Number(totalaudit) + auditbudget20 ;

          const salesbudget20 = Number(totalsales) * .20 ;
          const salesbudget120 = Number(totalsales) + salesbudget20 ;
          

          updateDepartment('01','Accounting',totalAcctg,acctgbudget120,'Acc') ;
          updateDepartment('02','Marketing',totalMktg,mktgbudget120,'Mrk') ;
          updateDepartment('03','Admin',totalAdmin,adminbudget120,'Adm') ;

          updateDepartment('04','Warehouse',totalwarehouse , whsebudget120,'Whs') ;
          updateDepartment('05','Human Resource',totalhr,hrbudget120,'Hrd') ;
          updateDepartment('06','Audit',totalaudit, auditbudget120,'Aud' ) ;          
          updateDepartment('07','Sales',totalsales, salesbudget120,'Sal' ) ;

          
          //console.log(' total marketing salary budget : ' + totalMktg + ' Sales : ' + totalsales + ' Warehouse : ' + totalwarehouse + ' H.R Dept: ' + totalhr) ;
            //res.data.map ( (x) =>
            //(
              //console.log('dept : ' + x.dept + '   name: ' + x.lastname + '  salary rate : ' + x.salaryrate)
            //)
           
             //(x.dept=="Admin"? setoAdmin(...oAdmin,res.data.salaryrate): x.dept=="Accounting"? setoAcctg(...oAcctg,res.data.salaryrate):x.dept=="Marketing"? setoMktg(...oMktg,res.data.salaryrate):0) 
             //console.log('name: ' + x.lastname + '  salary rate : ' + x.salaryrate)
          
            
        })         
        .catch((err) => {
          });
          
}

const updateDepartment= async (pxId, pxName, pxSalary, pxbudget, pxCode) => {
  const _urlnew5 = g_deptUrl + "/" + pxId  ;
  let statec = {
       id : pxId,
       name : pxName,
       code : pxCode,
       amount: pxSalary,
       budget: pxbudget
    }

    await axios
      .put(_urlnew5 , statec)
      .then((resy) => {       
       return resy.data ;
      })
      .catch((err) => {
        //console.log(err);
      });      
}



 const handleSave = async(e) => {
  e.preventDefault();  
    //console.log('new id: ' + vNewId) ;
  
    const mylastname = document.getElementById('txtlastname').value;
    const myfirstname = document.getElementById('txtfirstname').value;
    const mymiddlename = document.getElementById('txtmiddlename').value;
    const mysalary = document.getElementById('txtsalary').value;
    const mydept = document.getElementById('dddept').value;
    //const mydept = selectedDept ;
    const mysssno = document.getElementById('txtsssno').value;
    const myphno = document.getElementById('txtphno').value;
    const myhdmfno = document.getElementById('txthdmfno').value;

    const myid = document.getElementById('txtid').value;
    const vNewIdStr = vNewId.toString();
    //console.log('dept save: ' + mydept);

    let state = {
      lastname : mylastname,
      firstname : myfirstname,
      middlename : mymiddlename,
      dept : mydept,
      sssno : mysssno,
      philhealthno : myphno,
      hdmfno : myhdmfno,
      salaryrate: mysalary,
      id : myid==0? vNewIdStr: myid 
    }

    
//console.log('selected dept : ' + mydept);
    //console.log('new state: ' + JSON.stringify(state)) ;

    const _url = vUrl + "/"  + myid ;
    const _urlnew = myid==0? vUrl  : vUrl + "/" + myid ;
    //console.log('new url : ' + _urlnew) ;

await fetch(_urlnew , {
  method: myid==0? "POST":"PUT",
  headers: {
    //'Authorization': `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(state),
})
  .then((response) => {
    if (!response.ok) {        
      console.log('error Acs1');
      throw new Error("Network response was not ok");
    }     
    
    
    const button = document.getElementById('btncancel');
    if (button) {
       button.click();
    }

    
    return response.json();
    //console.log('test 888 :' + myname + ' email:' + myemail )  ;

})

PostDeptSalary();
//console.log('Admin : ' + oAdmin + '  Accounting : ' + oAcctg + ' Mktg : ' + oMktg) ;

}
    //onSave({  });
    //onClose();



const handleOnchange = async (e) => {
  e.preventDefault();
  
  const mylastname = document.getElementById('txtlastname').value;  
  //console.log('changing value of user name : ' + mynamex);  
}

const handleDDchange = async (event) => {
  //setSelectedFruit(event.target.value);
  //console.log('selected : ' + event.target.value) ;
  setSelectedDept(event.target.value) ;

}




  return (
    <div className="overlay" onClick={onClose}>
      <div className="modalsm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{vId!=0?"Employee Edit":"New Employee"}</div>
            <div className="modal-subtitle">              
            </div>
            <div style={{position:"absolute",right:"20px",top:"20px"}}>
               <button className="btn-icon"  onClick={onClose}><Icon path={ICONS.close} /></button> 
           </div>  

          </div>
          
        </div>
        <div className="modal-body">
          <div className="form-row  ">
                <div className="form-group">
                
                  <div className="form-row  ">
                    <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >Employee ID</label>
                    <input id="txtid" style={{margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "left"}} defaultValue={vId} placeholder="User ID" readOnly/>
                  </div>

                  <div className="form-row  ">
                    <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111" }}>Last Name</label>
                    <input id="txtlastname" style={{   margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "left"}} onChange={handleOnchange}                 
                    defaultValue={vLastname} placeholder="Last name" />
                  </div>

                  <div className="form-row  ">
                    <label style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >First Name</label>
                    <input id="txtfirstname" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "left"}} onChange={handleOnchange} 
                    defaultValue={vFirstName} placeholder="First Name" />

                  </div>

                 <div className="form-row  ">
                    <label style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >Middle Name</label>
                    <input id="txtmiddlename" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "left"}} onChange={handleOnchange} 
                    defaultValue={vMiddleName} placeholder="Middlename" />
                 </div>

                 <div className="form-row  ">
                    <label style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >SSS No</label>
                    <input id="txtsssno" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "left"}} onChange={handleOnchange} 
                    defaultValue={vSssno} placeholder="SSS Number" />

                 </div>

                 <div className="form-row  ">
                    <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >Phil Health No</label>
                    <input id="txtphno" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "left"}} onChange={handleOnchange} 
                    defaultValue={vPhno} placeholder="Phil Health Number" />
                 </div>

                 <div className="form-row  ">
                    <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >HDMF No</label>
                    <input id="txthdmfno" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "left"}} onChange={handleOnchange} 
                    defaultValue={vHdmfno} placeholder="HDMF Number" />
                 </div>

                 <div className="form-row  ">
                     <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >Department</label>
                      <select id="dddept" defaultValue={vDept}  onChange={handleDDchange}>
                      {docdept.map((u) => <option key={u.id}  value={u.name}  >{u.name}</option>  )}
                    </select>
                 </div>

                <div className="form-row  ">
                    <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >Salary Rate</label>
                    <input id="txtsalary" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "left"}} defaultValue={vSalary} placeholder="Salary Rate" />                

                 </div>

              </div>

          </div>


        </div>
        <div className="modal-footer">
          <button id="btncancel" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button id="btnsave" onClick={handleSave}
            className={"btn btn-primary"}           
          >
            <Icon path={ICONS.check} size={14} />
            {"Save"}
          </button>
        </div>
      </div>
    </div>
  );
}


function DocumentModalV2({ type, xitems, onClose, onSave, vId , vName, vEmail, vPhone, vDept, vPwd , vUrl, vNewId }) {    
  const isReceipt = type === "receipt";
  const [supplier, setSupplier] = useState("");
  const [dept, setDept] = useState("");  
   

 const handleSave = async(e) => {
  e.preventDefault();  
    console.log('new id: ' + vNewId) ;
  
    const myname = document.getElementById('txtname').value;
    const myemail = document.getElementById('txtemail').value;
    const myphone = document.getElementById('txtphone').value;
    const mydept = document.getElementById('txtdept').value;
    const mypwd = document.getElementById('txtpwd').value;
    const myid = document.getElementById('txtid').value;
    const vNewIdStr = vNewId.toString();

    let state = {
      name : myname,
      email : myemail,
      phone : myphone,
      dept : mydept,
      pwd : mypwd,
      id : myid==0? vNewIdStr: myid 
    }
    

    //console.log('new state: ' + JSON.stringify(state)) ;

    const _url = vUrl + "/"  + myid ;
    const _urlnew = myid==0? vUrl  : vUrl + "/" + myid ;
    //console.log('new url : ' + _urlnew) ;

await fetch(_urlnew , {
  method: myid==0? "POST":"PUT",
  headers: {
    //'Authorization': `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(state),
})
  .then((response) => {
    if (!response.ok) {        
      console.log('error Acs1');
      throw new Error("Network response was not ok");
    }     
    
    
    const button = document.getElementById('btncancel');
    if (button) {
       button.click();
    }

    
    return response.json();
    //console.log('test 888 :' + myname + ' email:' + myemail )  ;

})

}
    //onSave({  });
    //onClose();



const handleOnchange = async (e) => {
  e.preventDefault();
  
  const mynamex = document.getElementById('txtname').value;
  const myemailx = document.getElementById('txtemail').value;
  const myphonex = document.getElementById('txtphone').value;
  const mypwdx = document.getElementById('txtpwd').value;

  //console.log('changing value of user name : ' + mynamex);
  
}



  return (
    <div className="overlay" onClick={onClose}>
      <div className="modalsm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{vId!=0?"User Edit":"New User"}</div>
            <div className="modal-subtitle">
              {"Editing User Record"}
            </div>
            <div style={{position:"absolute",right:"20px",top:"20px"}}>
               <button className="btn-icon"  onClick={onClose}><Icon path={ICONS.close} /></button> 
           </div>  

          </div>
          
        </div>
        <div className="modal-body">
          <div className="form-row  ">
                <div className="form-group">
                  <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >User ID</label>
                  <input id="txtid" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "center"}} defaultValue={vId} placeholder="User ID" readOnly/>

                  <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}}>User Name</label>

                  <input id="txtname" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "center"}} onChange={handleOnchange}                 
                  defaultValue={vName} placeholder="User name" />

                  <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >Email</label>
                  <input id="txtemail" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "center"}} onChange={handleOnchange} 
                  defaultValue={vEmail} placeholder="User Email" />

                  <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >Phone</label>
                  <input id="txtphone" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "center"}} onChange={handleOnchange} 
                  defaultValue={vPhone} placeholder="Phone" />

<label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >Department</label>
                  <input id="txtdept" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "center"}} onChange={handleOnchange} 
                  defaultValue={vDept} placeholder="Phone" />

                
                  <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >Password</label>
                  <input id="txtpwd" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "center"}} defaultValue={vPwd} placeholder="Password" />


                </div>
          </div>

        </div>
        <div className="modal-footer">
          <button id="btncancel" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button id="btnsave" onClick={handleSave}
            className={"btn btn-primary"}           
          >
            <Icon path={ICONS.check} size={14} />
            {"Save User"}
          </button>
        </div>
      </div>
    </div>
  );
}


function SssModalV2({ xitems, onClose, onSave, vId , vBracket, vFrom_, vTo_, vCredit, vSsser , vSssee, vEc,vUrl, vNewId }) {
    

  
  const [supplier, setSupplier] = useState("");
  const [dept, setDept] = useState("");
  
  

 const handleSave = async(e) => {
  e.preventDefault();  
   // console.log('new id: ' + vNewId) ;
  
    const mybracket = document.getElementById('txtbracket').value;
    const myfrom_ = document.getElementById('txtfrom_').value;
    const myto_ = document.getElementById('txtto_').value;
    const mycredit = document.getElementById('txtcredit').value;
    const myssser = document.getElementById('txtssser').value;
    const mysssee = document.getElementById('txtsssee').value;
    const myec = document.getElementById('txtec').value;
    const myid = document.getElementById('txtid').value;
    const vNewIdStr = vNewId.toString();

    let state = {
      bracket : mybracket,
      from_ : myfrom_,
      to_ : myto_,
      credit : mycredit,
      ssser : myssser,
      sssee : mysssee,
      ec : myec,
      id : myid==0? vNewIdStr: myid 
    }
    

    //console.log('new state: ' + JSON.stringify(state)) ;

    const _url = vUrl + "/"  + myid ;
    //console.log('1 myid : ' + myid + '  _url : ' + _url) ;
    const _urlnew = myid==0? vUrl  : vUrl + "/" + myid ;
    //console.log('2 myid : ' + myid + '  url new : ' + _urlnew) ;

await fetch(_urlnew , {
  method: myid==0? "POST":"PUT",
  headers: {
    //'Authorization': `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(state),
})
  .then((response) => {
    if (!response.ok) {        
      console.log('error Acs1');
      throw new Error("Network response was not ok");
    }     
        
    const button = document.getElementById('btncancel');
    if (button) {
       button.click();
    }

//    PostDeptSalary() ;
    
    return response.json();
    //console.log('test 888 :' + myname + ' email:' + myemail )  ;
})

}
    


const handleOnchange = async (e) => {
  e.preventDefault();
  
  
  
}



  return (
    <div className="overlay" onClick={onClose}>
      <div className="modalsm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{vId!=0?"SSS Edit":"New Bracket"}</div>
            <div className="modal-subtitle">
              {"Editing SSS Record"}
            </div>
            <div style={{position:"absolute",right:"20px",top:"20px"}}>
               <button className="btn-icon"  onClick={onClose}><Icon path={ICONS.close} /></button> 
           </div>  

          </div>
          
        </div>
        <div className="modal-body">
          <div className="form-row  ">
                <div className="form-group">
                  <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >SSS ID</label>
                  <input id="txtid" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "center"}} defaultValue={vId} placeholder="SSS ID" readOnly/>

                  <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}}>SSS Bracket</label>

                  <input id="txtbracket" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "center"}} onChange={handleOnchange}                 
                  defaultValue={vBracket} placeholder="SSS Bracket" />

                  <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >From</label>
                  <input id="txtfrom_" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "center"}} onChange={handleOnchange} 
                  defaultValue={vFrom_} placeholder="From" />

                  <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >To</label>
                  <input id="txtto_" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "center"}} onChange={handleOnchange} 
                  defaultValue={vTo_} placeholder="To" />

<label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >SSS Credit</label>
                  <input id="txtcredit" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "center"}} onChange={handleOnchange} 
                  defaultValue={vCredit} placeholder="SSS Credit" />

                
                  <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >SSS Er</label>
                  <input id="txtssser" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "center"}} defaultValue={vSsser} placeholder="Employer's share" />

                  <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >SSS Ee</label>
                  <input id="txtsssee" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "center"}} defaultValue={vSssee} placeholder="Employees share" />

                  <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >SSS EC</label>
                  <input id="txtec" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "center"}} defaultValue={vEc} placeholder="EC Contribution" />


                </div>
          </div>

        </div>
        <div className="modal-footer">
          <button id="btncancel" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button id="btnsave" onClick={handleSave}
            className={"btn btn-primary"}           
          >
            <Icon path={ICONS.check} size={14} />
            {"Save "}
          </button>
        </div>
      </div>
    </div>
  );
}



// ─── LOGIN ─────────────────────────────────────────────────────────────────────

function LoginPage( {onClose}) {
  //const dispatch = useDispatch();
  //const error = useSelector(s => s.auth.error);
  //console.log({onClose});
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleLogin = () => {
        const userid = document.getElementById('txtuserid').value;;    
        const pwd =document.getElementById('txtpwd').value;
        //setLogged(false);
  };

 const handleSubmit = () => {
        const userid = document.getElementById('txtuserid').value;;    
        const pwd =document.getElementById('txtpwd').value;
        //setLogged(false);
  };

const handleSave = async(e) => {
  e.preventDefault();   
    const myuserid = document.getElementById('txtuserid').value;
    const mypwd = document.getElementById('txtpwd').value;


    let state = {
      userid : myuserid,
      pwd : mypwd
    }    

    //console.log('myuserid:' + myuserid) ;

    const button = document.getElementById('btncancel');
    if (button) {
     //  button.click();
    }

    if (myuserid=="user1") {
       button.click();
    }
   

}



  return (
    
    <div className="overlaynb" >
      <div className="modalsm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{"Login"}</div>
            <div style={{position:"absolute",right:"20px",top:"20px",visibility:"hidden"}} >
               <button className="btn-icon"   onClick={onClose}><Icon path={ICONS.close} /></button> 
           </div>  
          </div>
          
        </div>
        <div className="modal-body">
          <div className="form-row  ">
                <div className="form-group">
                  <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >User ID</label>
                  <input id="txtuserid" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "center"}} defaultValue={"user1"} placeholder="User ID" />

                  <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}}>Password</label>

                  <input id="txtpwd" type="password" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "center"}}                 
                  defaultValue={""} placeholder="Password" />


                </div>
          </div>

        </div>
        <div className="modal-footer">
          <button id="btncancel" style={{visibility:"hidden"}} className="btn btn-ghost" onClick={onClose} >Cancel</button>
          <button id="btnsave" onClick={handleSave}
            className={"btn btn-primary"}           
          >
            <Icon path={ICONS.check} size={14} />
            {"Submit"}
          </button>
        </div>
      </div>
    </div>

  );
}


function OrdersubModalV2 ( {doc, docitems, onClose, onSave, vIdno, vItemcode, vDescr, vUnit, vQty, vUc, vAmt, vId, vNewId}) {
   
    //console.log('itemcode: ' + vItemcode) ;
    const [Timeout,setTimeout]=useState(false);
    const [prodItem,setprodItem] =useState([]);
    const [subRecord,setsubRecord]=useState(doc.ordersub) ;
    const [testRecord, settestRecord]= useState([{name:"John"}]);
    const [supplier, setSupplier] = useState("");
    const [selectedCode, setSelectedCode] = useState("");
    const [selectedItem, setSelectedItem] = useState("");
    const [selectedDescr, setSelectedDescr] = useState(vDescr);
    const [lineAmt, setlineAmt] = useState(vAmt) ;
    const [lineQty, setlineQty ] = useState(vQty) ;
    const [linePrice, setlinePrice ] = useState(vUc) ;
    const [docTotal,setdocTotal] = useState(0) ;
    const [lastNum,setlastNum]=useState(0) ;
const [gross,setgross]= useState(0) ;
const [totamt,settotamt]  = useState(0) ;

  const [dept, setDept] = useState("");  
  const [postBody,setpostBody] = useState("");

  const movId =useRef();
  const movSubid=useRef();
  const movProdcode=useRef();
  const movProddescr=useRef();
  const movUnit=useRef();
  const movQty=useRef();
  const movPrice=useRef();
  const movTotal=useRef();
  const movComment=useRef();
  const movRunItemTotal = useRef() ;
  const movTestTotal = useRef();
  movProdcode.current = vItemcode ;
  movTestTotal.current ="0";

useEffect(() => {
        setSelectedCode(doc.prod);        
        //getItem('001');             
        fgetNewSubSeries() ;        
      }, [testRecord,lineAmt, lineQty, linePrice,selectedCode,prodItem,docTotal,postBody,subRecord,lastNum,totamt,gross]);

 
const addProperty = (newRecord) => {
   settestRecord([
    ...testRecord,
    newRecord
  ]);
};


const acsTimeOut = ()=> {  
    // 1. Set the timeout
    const xxtimer = setTimeout(() => {
      //setShowText(true);
      setTimeout(true);
    }, 3000);

    // 2. Clean up the timeout (vital to prevent memory leaks)
    clearTimeout(xxtimer);
    
}



 const getItem = async (e) => {
        const _urlnew2 = g_itemsUrl + "/" + e ;
        await axios
          .get(_urlnew2 )
          .then((res) => {
            setprodItem(res.data) ;
            document.getElementById('txtunit').value=res.data.unit;
            document.getElementById('txtprice').value=res.data.price;

            const vamt = Number(res.data.price) * Number(lineQty) ;
            //console.log('amt : ' + vamt) ;
            document.getElementById('txttotal').value= vamt ;

          })
          .catch((err) => {
          });
  };

const updateLastSeriesNumer = async (pNumber) => {
  //console.log('my new no series : ' + pNumber) ;
  const statea = {id:pNumber};
  const _urlnew2 = g_seriesaUrl  ;
    await axios
      .post(_urlnew2 , statea)
      .then((resy) => {
       //console.log('resy value : ' + resy.data)  ;
       return resy.data ;
      })
      .catch((err) => {
        //console.log(err);
      });
}


const updateDoctotal = async (ptotal)  => {
  
  const vdoctotal = 0;
  const _urlnew1 = g_orderUrl + "/" + doc.id ;

await axios
      .get(_urlnew1)
      .then((resy) => {
        //console.log('data  for update : ' + JSON.stringify(resy.data)) ;
         //const newdata = resy.data.ordersub ;
        //const total = newdata.reduce((accumulator, currentItem) => {
        //return accumulator + currentItem.total;
        //}, 0);                
        //updateDoctotal();
        const myxorder2 = 
        { id: doc.id, invno: doc.invno, sono: doc.sono, custname: doc.custname, invdate: doc.invdate, 
          terms: doc.terms, contact: doc.contact, remarks:doc.remarks,userid:doc.userid,datecreated:doc.datecreated,amount:ptotal,
          ordersub:         
          resy.data.ordersub.map((item, i) => (                         
                {id : item.id ,mainid:item.mainid, subid:item.subid, prodcode :item.prodcode,proddescription: item.proddescription,unit:item.unit,qty:item.qty,price:item.price,total:item.total}     
              ))      
        } 
        movComment.current=myxorder2 ;
        //document.getElementById('txtcomment').value=myxorder2 ;
        //setpostBody(myxorder2);        

      })
      .catch((err) => {
        //console.log(err);
      });

await axios
      .put(_urlnew1 , movComment.current)
      .then((resy) => {
       //console.log('resy value : ' + resy.data)  ;

      })
      .catch((err) => {
        //console.log(err);
      });

      

 //console.log('new value of myxorder 2: ' + JSON.stringify(movComment.current) ) ;




}


const getTotal =  async () => {

const _urlnew1= g_orderUrl + "/" + doc.id ;

 await axios
      .get(_urlnew1)
      .then((resx) => {
        //console.log('data : ' + JSON.stringify(resx.data)) ;
         const newdata = resx.data.ordersub ;
        const total = newdata.reduce((accumulator, currentItem) => {
        return accumulator + currentItem.total;
        }, 0);        
        //console.log(' new total amt : ' + total );        
        updateDoctotal(total);

        //setdocTotal(total) ;

      })
      .catch((err) => {
        console.log(err);
      });

}

const getProductTotal =  async (e) => {

const _urlnew6= g_orderUrl  ;

 await axios
      .get(_urlnew6)
      .then((resx) => {
         resx.data.map ( (x) => (
          console.log('order id : ' + x.id)           
         )
        )
        
        //console.log( 'gross amt x : ' + gross) ;
        //const total = newdata.reduce((accumulator, currentItem) => {
        //return accumulator + currentItem.total;
        //}, 0);        
      })
      .catch((err) => {
        console.log(err);
      });

}


const getItemAmount = async (pid,pitem) => {

const _urlnew6= g_orderUrl + "/" + pid  ;
//console.log(' url : ' + _urlnew6) ;

 await axios
      .get(_urlnew6)
      .then((resx) => {
        resx.data.ordersub.map ( (y) => (        
         y.prodcode==pitem?setgross(y.total):0
        )
         )
         
         return gross ;
        //const total = newdata.reduce((accumulator, currentItem) => {
        //return accumulator + currentItem.total;
        //}, 0);        
      })
      .catch((err) => {
        console.log(err);
      });

}






function fgetNewSubSeries(pdocno) {

    const _urlnew2= g_seriesaUrl ;
    axios
      .get(_urlnew2)
      .then((resa) => {
        //console.log('data : ' + JSON.stringify(resx.data)) ;
         //const newdata = resa.data.ordersub ;         
          let lastnum= resa.data.length ;      
          setlastNum(lastnum) ;    
          //console.log('last number 1 : ' + lastnum);
          //return lastnum ;
      })
      .catch((err) => {
        console.log(err);
      });

}

 const handleSave = async(e) => {
    e.preventDefault();  
    //console.log('dum order : ' + JSON.stringify(xitems)) ;
    
    movId.current = vId;
    movProdcode.current =document.getElementById('txtprodcode').value;
    movUnit.current = document.getElementById('txtunit').value;
    movQty.current = document.getElementById('txtqty').value;
    movProddescr.current = selectedDescr ;
    movPrice.current = document.getElementById('txtprice').value;
    movTotal.current = document.getElementById('txttotal').value;
    const vsubid = movId.current ;
   // console.log('id:' + movId.current + ' main id: ' + 'subid:' + movId.current + ' prodcode: ' 
    //  + movProdcode.current + ' proddescription: ' + movProddescr.current + 
     // ' unit:' + movUnit.current + '  Qty:' + movQty.current + ' price:' + movPrice.current + '  total:' + movTotal.current);

    const myxorder = 
    { id: doc.id, invno: doc.invno, sono: doc.sono, custname: doc.custname, invdate: doc.invdate, 
      terms: doc.terms, contact: doc.contact, remarks:doc.remarks,userid:doc.userid,datecreated:doc.datecreated, amount:Number(doc.amount),referno:doc.referno,
      ordersub: 
        
doc.ordersub.map((item, i) => (  
              //console.log('id:' + item.id + ' prod code : ' + item.prodcode + ' descr : ' + item.proddescription)               
              //setLines ({id : item.id ,mainid:item.mainid, subid:item.subid,prodcode :item.prodcode , proddescription:  item.proddescr,unit:item.unit,qty:item.qty,price:item.price,total:item.total})
                (item.id===movId.current?
                {id : item.id ,mainid:item.mainid, subid:item.subid, prodcode :movProdcode.current,proddescription: movProddescr.current,unit:movUnit.current,qty:movQty.current,price:Number(movPrice.current),total:Number(movTotal.current)}  
                :
                {id : item.id ,mainid:item.mainid, subid:item.subid, prodcode :item.prodcode,proddescription: item.proddescription,unit:item.unit,qty:item.qty,price:item.price,total:item.total}                                 
                )                  
                
              )              
            )                         
     }       
 if (vId==0) {
  const mynew_num = fgetNewSubSeries() ;    
  //console.log('last series no : ' + (lastNum + 1) ) ;    
  myxorder.ordersub.push({id : (lastNum +1 ) ,mainid:doc.id, subid:(lastNum + 1), prodcode :movProdcode.current,proddescription: movProddescr.current,unit:movUnit.current,qty:movQty.current,price:Number(movPrice.current),total:Number(movTotal.current)}) ;
   updateLastSeriesNumer( (lastNum+1).toString()) ;
 }   
  //myxorder.ordersub.push({id:"11",mainid:"3",subid:"11",prodcode:"test-001",proddescription:"test description"}) ;     
     //addProperty({name:"Richard"}) ;    
     //testRecord.push({name:"Richard"});     
     //const newRecordx ={id : "15" ,mainid:doc.id, subid:"15", prodcode :movProdcode.current,proddescription: movProddescr.current,unit:movUnit.current,qty:movQty.current,price:Number(movPrice.current),total:Number(movTotal.current)};
     //console.log('sub records : ' + JSON.stringify(subRecord));
      //setsubRecord([...subRecord, newRecordx]);       
    
//  
  //const mynew_num = fgetNewSubSeries() ;
  //console.log('last number 2 : ' + lastNum) ;

  //console.log('myxorder 1 : ' + JSON.stringify(myxorder))  ;

    const _url = g_orderUrl + "/"  + doc.id ;
    const _urlnew = vId==0? _url  : _url ;
    //console.log('vId : ' + vId + ' new url : ' + _urlnew) ;
    const amt = Number(movQty.current) * Number(movPrice.current) ;
    setlineAmt(amt) ;

    //console.log('myxorder : ' + JSON.stringify(myxorder)) ;
    
  //  console.log('vId : ' + vId + '    url new : ' + _urlnew);

await fetch(_urlnew , {
  method: vId==0? "PUT":"PUT",
  headers: {
    //'Authorization': `Bearer ${token}`,
    "Content-Type": "application/json",
  },
   body: JSON.stringify(myxorder),
})
  .then((response) => {
    if (!response.ok) {        
      console.log('error Acs1');
      throw new Error("Network response was not ok");
    }         
    
  //  return response.json();    
//   updateDoctotal();
/*update item total sales */
console.log('item code : ' + vItemcode);
 getProductTotal(vItemcode);


    const button = document.getElementById('btncancel');
    if (button) {
       button.click();
    }
    

    return response.json();    

})

   //console.log('myxorder : ' + JSON.stringify(myxorder))  ;   
  //updateDoctotal();  
    getTotal();
     
  };



const handleDDchange = async (event) => {
   //console.log('target value XXXXXXXXXXXXXXXXXXXXXXXXX: ' + event.target.value);
  //setSelectedCode(event.target.value) ;
  document.getElementById('txtprodcode').value = event.target.value ;
  movProdcode.current=event.target.value ;
  setSelectedItem(event.target.value) ;
  setSelectedDescr(event.target.selectedOptions[0].text) ;
  getItem(event.target.value) ;

  
//console.log('movProdcode:' + movProdcode.current) ;

}

const handleOnchangeQty = async (e) => {
  e.preventDefault();
  //const myqty= e.target.value ;
  //movQty.current = document.getElementById('txtqty').value;
  movPrice.current =  document.getElementById('txtprice').value;
//console.log('qty :' + myqty + '  price: ' + movPrice.current ) ;
  //const myprice = document.ele  
  const myqty = e.target.value ;
  const vAmtx = Number(document.getElementById('txtprice').value) * Number(myqty);
  //console.log('qty : ' + myqty) ;
  vAmt = myqty * Number(linePrice) ;
  document.getElementById('txttotal').value = vAmtx;
  //console.log('vamt : ' + vAmt) ;
  setlineAmt(vAmt);

}


const handleOnchange = async (e) => {

}


  

//onSave({  });
    //onClose();
//console.log(' onclose value : ' + onClose) ;

  return (
  <>
    <div className="overlaynb" onClick={onClose} >
      <div className="modalsm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-headernb">
          <div>
            <div className="modal-title">{"Editing Ordersub Item"}</div>
            <div className="modal-subtitle">              
            </div>
            <div style={{position:"absolute",right:"20px",top:"20px"}} >
               <button className="btn-icon" onClick={onClose}  ><Icon path={ICONS.close} /></button> 
           </div>  

          </div>
          
        </div>
        <div className="modal-body">


             
          <div className="form-row  ">
                <div className="form-group">
                
                  <div className="form-row  ">
                    <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >I.D</label>
                    <input id="txtid" style={{margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "left",width:"407px"}} defaultValue={vId} placeholder="User ID" readOnly/>
                  </div>

                  <div className="form-row  ">
                    <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111" }}>Product Code</label>
                    <input id="txtprodcode" style={{   margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "left", width:"407px"}} onChange={handleOnchange}                 
                    defaultValue={movProdcode.current} placeholder="Product Code" readOnly />
                  </div>

                  <div className="form-row  ">
                    <label style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >Description</label>
                    
                    <select id="ddproducts" defaultValue={vItemcode} onChange={handleDDchange} style={{width:"407px"}}>
                      {docitems.map((u) => <option key={u.id} value={u.id}  >{u.name}</option>  )}
                    </select>
   


                  </div>

                 <div className="form-row  ">
                    <label style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >Unit</label>
                    <input id="txtunit" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "left", width:"407px"}} onChange={handleOnchange} 
                    defaultValue={vUnit} placeholder="Unit" />
                 </div>

                 <div className="form-row  ">
                    <label style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >Quantity</label>
                    <input id="txtqty" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "left",width:"407px"}} onChange={handleOnchangeQty} 
                    defaultValue={lineQty} placeholder="Quantity" />

                 </div>

                 <div className="form-row  ">
                    <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >Unit Price</label>
                    <input id="txtprice" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "left",width:"407px"}} onChange={handleOnchange} 
                    defaultValue={linePrice} placeholder="Unit Price" />
                 </div>

                 <div className="form-row  ">
                    <label style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"}} >Amount</label>
                    <input id="txttotal" style={{  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "left" ,width:"407px"}} 
                    defaultValue={vAmt}  placeholder="Amount" readOnly onChange={handleOnchange} />
                 </div>

              </div>
              <div style={{display:"none"}}>
                       <input id="txtcomment" defaultValue={"test"} style={{ display:'none', margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "left" ,width:"120px"}}  />  
              </div>

          


        </div>


        </div>

        <div className="modal-footer">
          <button id="btncancel" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button id="btnsave" onClick={handleSave}
            className={"btn btn-primary"}           
          >
            <Icon path={ICONS.check} size={14} />
            {"Save"}
          </button>
        </div>



      </div>
    </div> 
    </>
  );


}

function OrderModalV2({ xitems, xproduct,  xcustomer, onClose, onSave,vInvno, vSono,vCustomer,vTerms,vAmt, vRemarks,vInvdate, vContact, vId, vNewId, vUrl, vReferno }) {    
  
   
  
  const [orderDum, setorderDum] = useState([]); 
  const [orderHeader,setorderHeader] =useState([]);  
  const [Details, setDetails] = useState([]);  
  const [docTotal,setdocTotal] = useState(0) ;
  const [docTotalA,setdocTotalA] = useState(0) ;
  const [newDocSeries, setnewDocSeries] = useState(0) ;
  const [dsPreview, setdsPreview] = useState(xitems);
  //const dum1 = JSON.stringify(xitems ) ;  
  //console.log('products : ' + JSON.stringify(xproduct ) ) ;
//console.log('items yyy now: ' + JSON.stringify(dumOrder ) ) ;
 useEffect(() => {
        getDetails();    
        getfTotalAmt();
        fnewDocno();                
        //setdsPreview(...dsPreview ,movSubheadera.current);
      }, [Details, docTotal,newDocSeries,orderHeader,dsPreview,docTotalA]);


//setdumOrder(xitems) ;

//setdumOrder(prev => ({
  //...prev,
  //invno: "invnew9001"
//}));
const _urla = g_orderUrl + "/" + xitems.id;

const getDetails = async() => {
        await axios
          .get(_urla)
          .then((res) => {
            //console.log('test data: ' + JSON.stringify(res.data));
            setDetails(res.data);               
            setdocTotal(res.data.amount);              
            document.getElementById('txthdrtotal').value = fmt(res.data.amount) ;
                  // console.log('geting total amt: '  + res.data.amount) ;
          })
          .catch((err) => {
          });
  };

//console.log('items ynow: ' + JSON.stringify(dumOrder ) ) ;
    const [lines, setLines] = useState([{ id:"",mainid:"",subid:"", prodcode: "",proddescr: "", qty: "", price: "",total: "" }]);

    const addLine = () => setLines([...lines, { id:"",mainid:"",subid:"", prodcode: "",proddescr: "", qty: "", price: "",total: "" }]);

  //console.log('customer : ' + vCustomer) ;
const [selectedCust, setSelectedCust] = useState("") ;
const  [showModalsub, setshowModalsub] = useState(false) ;
const  [orderPreview, setorderPreview] = useState(false) ;

const totalamt = xitems.ordersub.reduce((accumulator, l) => accumulator + l.total, 0);
//console.log('items : ' + JSON.stringify(xitems.ordersub) );
//{onClose, onSave, vIdno, vItemcode, vDescr, vUnit, vQty, vUc, vAmt, vId, vNewId}

  const movItemcode=useRef();
  const movDescr=useRef();
  const movUnit =useRef();
  const movQty = useRef();
  const movUc=useRef();
  const movAmt=useRef();
  const movId=useRef();
  const movNewId=useRef();
  const movShowSub =useRef();
  const movInvno=useRef();
  const movSono=useRef();
  const movInvdate=useRef();
  const movContact=useRef();
  const movCustname=useRef();
  const movRemarks=useRef() ;
  const movTop =useRef();
  const movHeader = useRef() ;
  const movReferno=useRef();
  const movSubheadera=useRef();
  
 function fnewDocno() {
    const _urlnew = g_orderUrl  ;      
        axios
          .get(_urlnew)
          .then((res) => {
            //setUsers(res.data); 
            const vnewNumber = Number(res.data.length) + 1 ;
            setnewDocSeries(vnewNumber);
            return vnewNumber ;
            //console.log('vnewNumber : ' + vnewNumber) ;
            //console.log('no. of records : ' + res.data.length);
            //const _totrec = res.data.length;
          })
          .catch((err) => {
          });  

  }

  
const getfTotalAmt = async() => {
/****************************** */  
         //console.log('e : ' + e ) ;
        const _urlnew2 = g_orderUrl + "/" + xitems.id ;
        //console.log('check url :' + _urlnew2) ;
         await axios
          .get(_urlnew2 )
          .then((res) => {
            //setprodItem(res.data) ;
            //console.log('res data 5: ' + JSON.stringify(res.data)) ;            
            const totalx1 = res.data.ordersub.reduce((accumulator, currentItem) => {
              return accumulator + currentItem.total;
            }, 0);        
            setdocTotalA(totalx1) ;
            //console.log('totalx1 : ' + totalx1);
            //console.log('cccc');             
            //document.getElementById('txtamount').value=totalx1;
            //return totalx1 ;

          })
          .catch((err) => {
          });
  };


function deleteItem(id) {
     // setUsers(prev => prev.filter (i => i.id !==id));
    //if (editingId === id) setEditingId(null);
    const _urlnew = g_orderUrl + "/" + id ;
    fetch(_urlnew , {
    method: "DELETE",
    headers: {
      //'Authorization': `Bearer ${token}`,
       "Content-Type": "application/json",
    },
    //body: JSON.stringify(state),
    })
    .then((response) => {
       if (!response.ok) {        
         console.log('error Acs1');
        throw new Error("Network response was not ok");
        }     
        //getUsers();         
        return response.json();   
     })
  }


  const handlePreviewA = async (e) => {
        const _urlnew3 = g_orderUrl + "/" + xitems.id  ;      
        movSubheadera.current ={id:"99",name:"test name"};
        
        //console.log('preview url : ' + _urlnew3) ;
        axios
          .get(_urlnew3)
          .then((res) => {
            //movComments.current = res.data;
            //console.log('test subheader 111 : ' + JSON.stringify(movSubheadera.current)) ;
            movSubheadera.current= res.data;
            //console.log('test subheader 222 : ' + JSON.stringify(movSubheadera.current)) ;
            setdsPreview(res.data) ;  
            //console.log('orders  999 : ' + JSON.stringify(dsPreview)) ;
            
            //setdsPreview(res.data) ;
            
            //setUsers(res.data); 
            
          })
          .catch((err) => {
          });  

     setorderPreview(true) ;

  }






  //console.log('total amt: ' + totalAmount) ;
  const handleEditX = async (e) => {    
    //setshowModalsub(true);  
    //console.log('e value : ' + e);
    const _url = g_orderUrl + "/" + e  ;
    const newId = 0  ; 
    movNewId.current="0" ;    
    const filtersub = Details.ordersub.filter(x=> x.subid==e) ;
    movDescr.current=filtersub[0].proddescription ;    
    movItemcode.current = filtersub[0].prodcode;
    movUnit.current=filtersub[0].unit;
    movQty.current =filtersub[0].qty ;
    movUc.current=filtersub[0].price;
    movAmt.current =filtersub[0].total;   
    movId.current=filtersub[0].subid ;
       


     setshowModalsub(true) ;
     

}


  const handleAdd = async () => {    
    //setshowModalsub(true);  
//     console.log('e value : ' + e);
    const _url = g_orderUrl ;
    const newId = 0  ; 
    movNewId.current="0" ;    
    //const filtersub = Details.ordersub.filter(x=> x.subid==e) ;
    movDescr.current="" ;    
    movItemcode.current = "";
    movUnit.current="";
    movQty.current ="0";
    movUc.current="0";
    movAmt.current ="0";
    movId.current="0";
        
     setshowModalsub(true) ;

}


 const handleRefresh = async(e) => {
    e.preventDefault();  
    console.log('xitems value : ' + JSON.stringify(xitems), );

 }




 const handleSave = async(e) => {
    e.preventDefault();  
    //console.log('dum order : ' + JSON.stringify(xitems)) ;
    
    //fTotalAmt(xitems.id);

    movInvno.current =document.getElementById('txtinvno').value;
    movSono.current =document.getElementById('txtsono').value;
    movCustname.current = document.getElementById('ddcustomer').value;
    movInvdate.current =document.getElementById('txtinvdate').value;
    movContact.current =document.getElementById('txtcontact').value;
    //movAmt.current =document.getElementById('txtamount').value;
    movAmt.current =document.getElementById('txthdrtotal').value;
    movRemarks.current =document.getElementById('txtremarks').value;
    movTop.current =document.getElementById('txtterms').value;
    movReferno.current =document.getElementById('txtreferno').value;
    
    movId.current = xitems.id ;
   
    getfTotalAmt(xitems.id) ;


    const myxorder = 
    { id: xitems.id, invno: movInvno.current, sono: movSono.current, custname: movCustname.current, invdate: movInvdate.current, 
      terms: movTop.current, contact: xitems.contact, remarks:movRemarks.current,amount:Number(docTotalA),referno:movReferno.current ,
      ordersub:
        
xitems.ordersub.map((item, i) => (  
              //console.log('id:' + item.id + ' prod code : ' + item.prodcode + ' descr : ' + item.proddescription)               
              //setLines ({id : item.id ,mainid:item.mainid, subid:item.subid,prodcode :item.prodcode , proddescription:  item.proddescr,unit:item.unit,qty:item.qty,price:item.price,total:item.total})
              {id : item.id ,mainid:item.mainid, subid:item.subid,prodcode :item.prodcode,proddescription: item.proddescription,unit:item.unit,qty:item.qty,price:item.price,total:item.total}                 
              ))      
     }       
     movHeader.current = myxorder ;
  //  console.log('myxorder : ' + JSON.stringify(myxorder))  ;
  if (xitems.id==0) {
     const vnewdocno = fnewDocno();    
     const newamt = movAmt.current!=0? movAmt.current :0 ;
     movId.current= newDocSeries ;
  //   console.log('doc sereis : ' + newDocSeries)  ;
      const myxorder1 = 
    { id: newDocSeries, invno: movInvno.current, sono: movSono.current, custname: movCustname.current, invdate: movInvdate.current, 
      terms: movTop.current, contact: xitems.contact, remarks:movRemarks.current,amount:newamt,referno:movReferno.current,
      ordersub:[] 
    }
    movHeader.current = myxorder1 ;
    //console.log('myxorder1 : ' + JSON.stringify(myxorder1) ); 
  }

    const _url = g_orderUrl + "/"  + xitems.id ;
    const _urlnew = xitems.id==0? g_orderUrl  : _url ;
    //console.log('myxorder 4 : ' + JSON.stringify(orderHeader) );

    //console.log('myxorder1 movHeader : ' + JSON.stringify(movHeader.current) );
  //console.log('header : ' + JSON.stringify(movHeader.current)) ;
  //console.log('xitems.id :' + xitems.id);

await fetch(_urlnew , {
  method: xitems.id==0? "POST":"PUT",
  headers: {
    //'Authorization': `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  //body: JSON.stringify(myxorder),
  body: JSON.stringify(movHeader.current),
})
  .then((response) => {
    if (!response.ok) {        
      console.log('error Acs1');
      throw new Error("Network response was not ok");
    }         
    
    const button = document.getElementById('btncancel');
    if (button) {
       button.click();
    }
    
    return response.json();    

})

   //console.log('myxorder : ' + JSON.stringify(myxorder))  ;

    const button = document.getElementById('btncancel');
    if (button) {
       button.click();
    }

     
  };
 

    //console.log('myxorder : ' + JSON.stringify(myxorder))  ;
    
          //  xitems.ordersub.map((item, i) => (              
            //  setmyLine ({id : item.id ,mainid:item.mainid, subid:item.subid,prodcode :item.prodcode , proddescription:  item.proddescr,unit:item.unit,qty:item.qty,price:item.price,total:item.total})
              //))
    


    const _urlnew = g_orderUrl + "/" + xitems.id;
    //console.log('handle save : ' + _urlnew)  ;
//console.log('dum order : ' + JSON.stringify(dumOrder)) ;



    //console.log('order is null') ;
    //setdumOrder(xitems) ;

    //const xinvno = document.getElementById('txtinvno').value;
    //const xsono = document.getElementById('txtsono').value;
      

//console.log('inv no: ' + xinvno + '    orders : ' + JSON.stringify(dumOrder)) ;


    //onSave({  });
    //onClose();

    const handleClose = async() => {
      
    }

const handleDDchange = async (event) => {
  //event.preventDefault();
  //setSelectedFruit(event.target.value);
  console.log('customer : ' + event.target.value) ;
  setSelectedCust(event.target.value) ;
}

const handleOnchange = async (e) => {
  e.preventDefault();
  
//console.log('dum order : ' + JSON.stringify(dumOrder)) ;  
}
//console.log('fmt amount : ' + fmt(xitems.amount)) ;
//console.log(' onclose value: ' + onClose) ;
  //console.log('orders ' + JSON.stringify(xitems));
//{onClose, onSave, vIdno, vItemcode, vDescr, vUnit, vQty, vUc, vAmt, vId, vNewId}
//console.log('xitems : ' + JSON.stringify(xitems)) ;
//console.log('xitems id: ' + xitems.id) ;
//setdsPreview(movSubheadera.current) ;
//console.log('ds preview ' + JSON.stringify(dsPreview)) ;


  return (
<>
{showModalsub && (
        <OrdersubModalV2 doc={Details} docitems={xproduct} onClose={() => setshowModalsub(false)} 
          onSave={""} vIdno={movId.current} vItemcode={movItemcode.current} vDescr={movDescr.current} vUnit={movUnit.current} vQty={movQty.current} vUc={movUc.current}
          vAmt =  {movAmt.current}  vId = {movId.current} vNewId = {0} />                    
      )};

{orderPreview && (
        <OrderPreview docx={dsPreview} onClose={() => setorderPreview(false)}  />                    
      )};



    <div className="overlay" onClick={onClose}>
      <div className="modallg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{vId!=0?"Invoice ":"Editing Order"}{" : "}{ xitems.id}</div>
            <div style={{position:"absolute",right:"20px",top:"20px"}}>
               <button className="btn-icon"  onClick={onClose}><Icon path={ICONS.close} /></button> 
           </div>  

          </div>
          <div className="form-row  " style={{display: "flex", gap: "4px", alignItems:"center"}}  >
              <input id="txtamount"  style={{ display:"none",  margin: 0, fontSize: 13, fontWeight: 700, color: "#111",textAlign: "left",width:"140px"}} onChange={handleOnchange} defaultValue={xitems.amount} ></input>                
          </div>   
          
        </div>
        <div className="modal-body">
          <div className="form-row  ">
                <div className="form-group" style={{display: "flex", gap: "4px"}} >                

                  <div className="form-row  " style={{display: "flex", gap: "4px", alignItems:"center"}}  >
                    <label style={{  margin: 0, fontSize: 13, fontWeight: 700, color: "#111"  , width:"120px"}}>Invoice Date</label>
                    <input id="txtinvdate" type="date" style={{   margin: 0, fontSize: 13, fontWeight: 700, color: "#111",textAlign: "left",width:"140px"}} onChange={handleOnchange}                 
                    defaultValue={xitems.invdate} placeholder="Invoice Date" />
                  </div>



                  <div className="form-row  " style={{display: "flex", gap: "4px", alignItems:"center"}}  >
                    <label style={{  margin: 0, fontSize: 13, fontWeight: 700, color: "#111"  , width:"120px"}}>Invoice No</label>
                    <input id="txtinvno" style={{   margin: 0, fontSize: 13, fontWeight: 700, color: "#111",textAlign: "left",width:"140px"}} onChange={handleOnchange}                 
                    defaultValue={xitems.invno} placeholder="Inv no" />
                  </div>

                 <div className="form-row" style={{display: "flex", gap: "4px", alignItems:"center"}}  >
                    <label style={{  margin: 0, fontSize: 13, fontWeight: 900, color: "#111" , width:"120px"}} >Reference No.</label>
                    <input id="txtreferno" style={{margin: 0, fontSize: 13, fontWeight: 700, color: "#111",textAlign: "left",width:"140px"}} onChange={handleOnchange} defaultValue={xitems.referno} placeholder="Reference No" />                 
                  
                  </div>





                  <div className="form-row  " style={{display: "flex", gap: "4px", alignItems:"center"}}  >
                    <label style={{  margin: 0, fontSize: 13, fontWeight: 700, color: "#111" , width:"120px"}}>S.O Number</label>
                    <input id="txtsono" style={{   margin: 0, fontSize: 13, fontWeight: 700, color: "#111",textAlign: "left",width:"140px"}} onChange={handleOnchange}                 
                    defaultValue={xitems.sono} placeholder="S.O No" />
                  </div>


              </div>
          </div>          

          <div className="form-row  ">
                <div className="form-group" style={{display: "flex", gap: "4px"}} >
                
                  <div className="form-row" style={{display: "flex", gap: "4px", alignItems:"center"}}  >
                    <label style={{  margin: 0, fontSize: 13, fontWeight: 700, color: "#111" , width:"120px"}} >Customer</label>
                    
   
                      <select id="ddcustomer" defaultValue={xitems.custname} onChange={handleDDchange} style={{width:"407px"}}>
                      {xcustomer.map((u) => <option key={u.id} value={u.name}  >{u.name}</option>  )}
                    </select>
   



                  </div>

                  <div className="form-row  " style={{display: "flex", gap: "4px", alignItems:"center"}}  >
                    <label style={{  margin: 0, fontSize: 13, fontWeight: 700, color: "#111"  , width:"120px"}}>Terms</label>
                    <input id="txtterms" style={{   margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "left",width:"140px"}} onChange={handleOnchange}                 
                    defaultValue={xitems.terms} placeholder="Pay Terms" />
                  </div>

                  <div className="form-row  " style={{display: "flex", gap: "4px", alignItems:"center"}}  >
                    <label style={{  margin: 0, fontSize: 13, fontWeight: 700, color: "#111"  , width:"120px"}}>Contact</label>
                    <input id="txtcontact" style={{   margin: 0, fontSize: 13, fontWeight: 700, color: "#111",textAlign: "left",width:"140px"}} onChange={handleOnchange}                 
                    defaultValue={xitems.contact} placeholder="Contact" />
                  </div>

              </div>
          </div>          

          <div className="form-row  ">
                <div className="form-group" style={{display: "flex", gap: "4px"}} >
                
                  <div className="form-row" style={{display: "flex", gap: "4px", alignItems:"center"}}  >
                    <label style={{  margin: 0, fontSize: 13, fontWeight: 700, color: "#111" , width:"120px"}} >Remarks</label>
                    <input id="txtremarks" style={{margin: 0, fontSize: 13, fontWeight: 400, color: "#111",textAlign: "left",width:"673px"}} onChange={handleOnchange} defaultValue={xitems.remarks} placeholder="Remarks" />                                   
                  </div>

                   <div className="form-row" style={{display: "flex", gap: "4px", alignItems:"center"}}  >
                    <label style={{  margin: 0, fontSize: 13, fontWeight: 700, color: "#111" , width:"120px"}} >Created by</label>
                    <input id="txtuser" style={{margin: 0, fontSize: 13, fontWeight: 700, color: "#111",textAlign: "left",width:"140px"}} onChange={handleOnchange} defaultValue={xitems.user} placeholder="Created By" />                                   
                  </div>


              </div>
          </div>          





          <div className="form-grouplg">
              

               <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
              <tr style={{ borderBottom: "2px solid #f0f0f0",fontWeight: "900", color:"#111" }}>
              {["Sub I.D" ,"Item code", "Product Description","Unit","Qty","Price",,"Amount","Action","delete"].map(h => (
                <th key={h} style={{
                  textAlign: "left", fontSize: 14, color: "#111",
                  fontWeight: 600, padding: "0 8px 10px 0", letterSpacing: "0.04em",
                }}>{h}           </th>
              ))}
            </tr>
              </thead>
              <tbody>
           

              {Details.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#444", fontSize: 14 }}>No items found.</td></tr>
              ) : Details.ordersub.map((item, i) => (              

                

                <tr key={i} style={{ borderBottom: "1px solid #a39991", background: i % 2 === 0 ? "transparent" : "#f7f5f5", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f7f5f5"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "#f7f5f5"}>
                  
                    <td style={{ padding: "14px 16px",textAlign:"left" }}> {item.subid} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.prodcode} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.proddescription} </td>                      
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.unit} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.qty} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.price} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.total} </td>  
                    <td style={{ padding: "14px 16px",textAlign:"left" }}>
                    <button onClick={() => handleEditX(item.subid)} style={{
                            background: "none", border: "0.5px solid var(--color-border-secondary)",
                            borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer",
                            color: "var(--color-text-primary)"
                          }}>Edit</button> 


                  </td><td>
                          <button onClick={() => deleteItem(item.subid)} style={{
                            background: "none", border: "0.5px solid #F09595",
                            borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer",
                            color: "#A32D2D"
                          }}>
                          
                                     <Icon path={ICONS.trash} size={13} />
                          
                          </button> 

          
                          
                          </td>

                </tr>
              ))}              
              </tbody>
              </table>

            

            </div>
              
        </div>

      
           <div className="form-group" style={{display: "flex", gap: "4px"}} >
               <div className="form-row  " style={{display: "flex", gap: "4px", alignItems:"center"}}  >
                    <label style={{position:"absolute",left:"966px",  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"  , width:"120px"}}>Total</label>
                    <input id="txthdrtotal" style={{ position:"absolute",left:"1086px",  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "right",width:"120px"}} onChange={handleOnchange}                 
                    defaultValue={xitems.amount} placeholder="Total" readOnly />
               </div>
          </div>


     

        <div className="modal-footer">
          <button id="btnnewitem" className="btn btn-info" style={{ backgroundColor: 'black', color: 'white' }} onClick={handleAdd}>New Item</button>
          <button id="btncancel" className="btn btn-ghost" onClick={onClose}>Cancel</button>

          <button id="btnprint" onClick={handlePreviewA} 
            className={"btn btn-primary"}           
          >
            <Icon path={ICONS.check} size={14} />
            {"Print"}
          </button>
          <button id="btnsave" style={{ backgroundColor: 'green', color: 'white' }} onClick={handleSave}
            className={"btn btn-primary"}           
          >
            <Icon path={ICONS.check} size={14} />
            {"Save"}
          </button>


        </div>
      </div>
    </div>
    </>
  );
}




function OrderPage( {path} ){
  
  const contentpage = PAGE_CONTENT[path];
  //console.log('path 2 : ' + contentpage) ;
  const apiUrl = config.SERVER_URL;  
  const orderUrl = config.ORDER_URL;
  const customerUrl = config.CUSTOMER_URL;
  const [users, setUsers] = useState([]);  
  //const [orderDetail, setOrderDetail] = useState([]);  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [viewDoc, setViewDoc] = useState(null);
  const [testId, settestId]   = useState(0);
  
  const [editedId, seteditedId] = useState("");

  const [editedName, seteditedName] = useState("");  
  const [editedEmail, seteditedEmail] = useState("");
  const [editedPwd, seteditedPwd] = useState("");
  const [editedPhone, seteditedPhone] = useState("");

  const [loading, setLoading] = useState(true);   
  const [showModal, setShowModal] = useState(false);
  const [showModalsub, setShowModalsub] = useState(false);

  const ITEMS_PER_PAGE = 7 ;
  const [xpage, setPage] = useState(1);
  const [search, setSearch] = useState(""); 
  const [sortBy, setSortBy] = useState("name");

  const [category, setCategory] = useState("All");
  
  const [goRefresh, goSetRefresh] = useState(false);

  const [editingId, setEditingId] = useState(null);  
  const [seriesId, setseriesId] = useState(0) ;
 
  const movies = useRef() ;
  const movId = useRef() ;
  const movInvno = useRef();
  const movSono = useRef();
   const movCustomer = useRef();
   const movAmt = useRef();
    const movTerms = useRef();
     const movInvdate= useRef();
     const movContact = useRef() ;
     const movRemarks= useRef();
     const movNewId = useRef();

  
  setGlobal({ title : "welcome" });
  setGlobal({ greet : "hi" });  
  

   useEffect(() => {
        getUsers();    
        getProducts();
        getCustomers();
      }, [users,customers,products,seriesId]);

//  console.log('customers : ' + JSON.stringify(customers)) ;

const filtered = useMemo(() => {
    //let data = state.items;
    let data = users ;
    if (category !== "All") data = data.filter(i => i.category === category);
    if (search) data = data.filter(i => i.id.toLowerCase().includes(search.toLowerCase()) || i.invno.toLowerCase().includes(search.toLowerCase()));
    data = [...data].sort((a, b) => {
      if (sortBy === "invno") return a.invno.localeCompare(b.id);
      if (sortBy === "custname") return b.custname;
      if (sortBy === "id") return b.id;
      return 0;
    });
    return data;
  }, [users, category, search, sortBy]);


const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const sortedCust = useMemo(() => {
  let sortableItems = [...customers]; // Copy to avoid mutation
  sortableItems.sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  return sortableItems;
}, [customers, sortConfig]);




  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((xpage - 1) * ITEMS_PER_PAGE, xpage * ITEMS_PER_PAGE);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  function deleteItem(id) {
      setUsers(prev => prev.filter (i => i.id !==id));
    //if (editingId === id) setEditingId(null);

    const _urlnew = orderUrl + "/" + id ;
    fetch(_urlnew , {
    method: "DELETE",
    headers: {
      //'Authorization': `Bearer ${token}`,
       "Content-Type": "application/json",
    },
    //body: JSON.stringify(state),
    })
    .then((response) => {
       if (!response.ok) {        
         console.log('error Acs1');
        throw new Error("Network response was not ok");
        }     
        getUsers();         
        return response.json();   
     })
  }

  const getUsers = () => {
        axios
          .get(orderUrl)
          .then((res) => {
            setUsers(res.data);                        
          })
          .catch((err) => {
          });
  };

const getProducts = () => {
        axios
          .get(g_itemsUrl)
          .then((res) => {
            setProducts(res.data);                        
          })
          .catch((err) => {
          });
  };


const getCustomers = async () => {
        await axios
          .get(customerUrl)
          .then((res) => {
            setCustomers(res.data);                                    
          })
          .catch((err) => {
          });
  };



  //() => setShowModal(true)
 
const handleAdd = async (id) => {
    movies.current = id ;
    const _url = g_orderUrl + '/' + id ;
    const newId = 0  ;
    //setseriesId(newId) ;
    movNewId.current="0"; 
    const _vorder=
  {
  "id" : "0",
  "invno": "",
  "sono": "",
  "custname": "",
  "invdate": "",
  "terms": "",
  "contact": "",
  "remarks": "",
  "userid": "",
  "datecreated": "",
  "amount": 0,
  "ordersub":[{}]
};

setViewDoc(_vorder) ;
    //console.log('url : ' + _url) ;    
    //setShowModal(true);

}

 const handleEdit = async (id)  => {
    movies.current = id ;
    const _url = g_orderUrl + '/' + id ;
    const newId = 0  ;
    setseriesId(newId) ;
    movNewId.current="0" ;    

try {
   
  
 await axios
      .get(_url)
      .then((resx) => {    

      })
      .catch((err) => {
        console.log(err);
      });


  } catch (error) {
     //setError(error.message);
  } finally {
   // setIsLoading(false);
  }

    setShowModal(true);
//    console.log('movies current :' + _url, movies.current ) ;


  }

  const handleSubClick = async (id) => {
      movies.current = id ;
      const _url = orderUrl + '/' + id ;
      const newId = 0  ;    
      movNewId.current="0" ;    
      //console.log('details url : ' + _url) ;

      setShowModal(true);
  

  }
 
  const handleXclose = async () => {
    setShowModal(false) ;
    getUsers();
  }



  if (!contentpage) return null;
//xitems, onClose, onSave,vInvno, vSono,vCustomer,vTerms, vRemarks,vInvdate, vId 

const totalamt = paginated.reduce((accumulator, l) => accumulator + l.amount, 0);


  return (   
 <>
{viewDoc && (
        <OrderModalV2 xitems={viewDoc} xproduct={products} xcustomer={sortedCust} onClose={() => setViewDoc(null)}
          onSave={""} vInvno={movInvno.current} vSono={movSono.current} vCustomer={movCustomer.current} 
          vTerms={movTerms.current} vAmt={movAmt.current} vRemarks={movRemarks.current} vInvdate={movInvdate.current} vContact={movContact.current} vId={movId.current} 
          NewId={movNewId.current} />
      )}

 
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111" }}>Order Page</h2>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#666" }}>Welcome back, Admin — April 26, 2026</p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16, marginBottom: 28,
      }}>
      </div>

      <div style={{
        background: "#fff", borderRadius: 12,
        border: "1px solid #eee", padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, color: "#111" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111" }}>Orders</h3>
          <button onClick={() => handleAdd(0)} style={{
            background: "#f4f6fa", border: "1px solid #e0e4ed",
            borderRadius: 8, padding: "6px 14px",
            fontSize: 13, color: "#1a6fd4", cursor: "pointer", fontWeight: 600,
          }}>New order</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f0f0f0", color:"#111" }}>
              {["Tran ID" ,"Invoice", "S.O No","Customer","Terms","----Amount","Delete","Details"].map(h => (
                <th key={h} style={{
                  textAlign: "left", fontSize: 14, color: "#111",
                  fontWeight: 600, padding: "0 8px 10px 0", textTransform: "uppercase", letterSpacing: "0.04em",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            

              {paginated.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#444", fontSize: 14 }}>No items found.</td></tr>
              ) : paginated.map((item, i) => (              
                

                <tr key={item.id} style={{ borderBottom: "1px solid #a39991", background: i % 2 === 0 ? "transparent" : "#f7f5f5", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f7f5f5"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "#f7f5f5"}>
                  
                    <td style={{ padding: "14px 16px",textAlign:"left" }}> {item.id} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.invno} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.sono} </td>                      
                    <td style={{ padding: "14px 16px", textAlign:"left" }}>{item.custname} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"center" }}>{item.terms} </td>  
                    <td style={{ padding: "14px 16px", textAlign:"right" }}>{fmt(item.amount)} </td>  
                  <td>
                          <button onClick={() => deleteItem(item.id)} style={{
                            background: "none", border: "0.5px solid #F09595",
                            borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer",
                            color: "#A32D2D"
                          }}>                          
                           <Icon path={ICONS.trash} size={13} />                          
                          </button> 
                          
                          </td><td>
                            <button onClick={() => setViewDoc(item)}  style={{
                            background: "none", border: "0.5px solid #F09595",
                            borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer",
                            color: "#A32D2D"
                          }}>       <Icon path={ICONS.arrow} size={13} />                          
                          </button>                    
                          </td>

                </tr>
              ))}
               

          </tbody>
        </table>
       </div>
       <div style={{ display: "flex", gap:6 }}>

           <div className="form-group" style={{display: "flex", gap: "4px"}} >
               <div className="form-row  " style={{display: "flex", gap: "4px", alignItems:"center"}}  >
                    <label style={{position:"absolute",left:"990px",  margin: 0, fontSize: 15, fontWeight: 700, color: "#111"  , width:"120px"}}>Total</label>
                    <input id="txttotal" style={{ position:"absolute",left:"1143px",  margin: 0, fontSize: 15, fontWeight: 700, color: "#111",textAlign: "right",width:"120px"}}                  
                    value={fmt(totalamt)} placeholder="Total" readOnly />
               </div>
          </div>


       
       </div>
       <div style={{ display: "flex", gap:6 }}>
            <button onClick={() => setPage(1)} disabled={xpage === 1} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 12px", color: xpage === 1 ? "#333" : "#aaa", cursor: xpage === 1 ? "not-allowed" : "pointer", fontSize: 13 }}>«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={xpage === 1} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 14px", color: xpage === 1 ? "#333" : "#aaa", cursor: xpage === 1 ? "not-allowed" : "pointer", fontSize: 13 }}>‹</button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ background: p === xpage ? "linear-gradient(90deg,#4f8ef7,#6c63ff)" : "#ef4444", border: p === xpage ? "none" : "1px solid #2a2d3e", borderRadius: 8, padding: "8px 14px", color: p === xpage ? "#fff" : "#666", cursor: "pointer", fontWeight: p === xpage ? 700 : 400, fontSize: 13 }}>
                {p}
              </button>
            ))}

            
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={xpage === totalPages || totalPages === 0} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 14px", color: (xpage === totalPages || totalPages === 0) ? "#333" : "#aaa", cursor: (xpage === totalPages || totalPages === 0) ? "not-allowed" : "pointer", fontSize: 13 }}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={xpage === totalPages || totalPages === 0} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 12px", color: (xpage === totalPages || totalPages === 0) ? "#333" : "#aaa", cursor: (xpage === totalPages || totalPages === 0) ? "not-allowed" : "pointer", fontSize: 13 }}>»</button>
            <button key={9} onClick={() => handleAdd(0)} style={{ background: "#ef4444", border: "1px solid #2a2d3e", borderRadius: 5, padding: "8px 12px", color: (xpage === totalPages || totalPages === 0) ? "#333" : "#aaa", cursor: (xpage === totalPages || totalPages === 0) ? "not-allowed" : "pointer", fontSize: 13 }}>+</button>
       </div>

    </div>
   </> 
  
  );



}


function AttendancePage({ path }) {
  const page = PAGE_CONTENT[path];
  const apiUrl = config.SERVER_URL;
  setGlobal({ title : "welcome" });
  setGlobal({ greet : "hi" });
  //console.log('path : ' + path)
  //console.log(apiUrl) ;
  //console.log('global title : ' + getGlobal('title') );
  //console.log('global greet : ' + getGlobal('greet') );
  //console.log(path);
  if (!page) return null;
  return (
   
  
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111" }}>Attendance Log Page</h2>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#666" }}>Welcome back, Admin — April 26, 2026</p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16, marginBottom: 28,
      }}>
      </div>

      <div style={{
        background: "#fff", borderRadius: 12,
        border: "1px solid #eee", padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111" }}>Recent Attendnance </h3>
          <button style={{
            background: "#f4f6fa", border: "1px solid #e0e4ed",
            borderRadius: 8, padding: "6px 14px",
            fontSize: 13, color: "#1a6fd4", cursor: "pointer", fontWeight: 600,
          }}>View All</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
              {["Employee", "Department", "Amount", "Status", "Date"].map(h => (
                <th key={h} style={{
                  textAlign: "left", fontSize: 12, color: "#999",
                  fontWeight: 600, padding: "0 8px 10px 0", textTransform: "uppercase", letterSpacing: "0.04em",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_PAYROLL.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f7f7f7" }}>
                <td style={{ padding: "12px 8px 12px 0", fontSize: 14, fontWeight: 600, color: "#222" }}>{row.name}</td>
                <td style={{ padding: "12px 8px 12px 0", fontSize: 13, color: "#777" }}>{row.dept}</td>
                <td style={{ padding: "12px 8px 12px 0", fontSize: 14, fontWeight: 700, color: "#111" }}>{row.amount}</td>
                <td style={{ padding: "12px 8px 12px 0" }}><StatusBadge status={row.status} /></td>
                <td style={{ padding: "12px 0 12px 0", fontSize: 13, color: "#aaa" }}>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  
  );
}



// ─── Document Viewer ──────────────────────────────────────────────────────────
function DocumentViewer({ doc, type, onClose }) {
  const isReceipt = type === "receipt";
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Document Preview</div>
            <div className="modal-subtitle">{isReceipt ? doc.receiptNo : doc.issuanceNo}</div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
              <Icon path={ICONS.download} size={13} /> Print
            </button>
            <button className="btn-icon" onClick={onClose}><Icon path={ICONS.close} /></button>
          </div>
        </div>
        <div className="modal-body">
          <div className="doc-print">
            <div className="doc-head">
              <div>
                <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", color: "var(--ink-ghost)", marginBottom: "4px" }}>Document</div>
                <div className="doc-title">{isReceipt ? "Inventory Receipt" : "Issuance Slip"}</div>
                <div className="doc-meta">{fmtDate(doc.date)} · {fmtTime(doc.date)}</div>
              </div>
              <div className="doc-number">{isReceipt ? doc.receiptNo : doc.issuanceNo}</div>
            </div>
            <div className="doc-info-row">
              <div className="doc-info-cell">
                <div className="doc-info-label">{isReceipt ? "Supplier / Source" : "Requesting Department"}</div>
                <div className="doc-info-val">{isReceipt ? doc.supplier : doc.dept}</div>
              </div>
              <div className="doc-info-cell">
                <div className="doc-info-label">{isReceipt ? "Received By" : "Requested By"}</div>
                <div className="doc-info-val">{isReceipt ? doc.receivedBy : doc.requestedBy}</div>
              </div>
            </div>
            <table className="doc-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>#</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Item Description</th>
                  <th style={{ textAlign: "center", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Unit</th>
                  <th style={{ textAlign: "right", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Qty</th>
                  <th style={{ textAlign: "right", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Unit Cost</th>
                  <th style={{ textAlign: "right", borderBottom: "1px solid var(--border)", background: "#fafaf8" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {doc.lines.map((l, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: "11px", color: "var(--ink-ghost)" }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{l.itemName}</td>
                    <td style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: "12px" }}>{l.unit}</td>
                    <td style={{ textAlign: "right", fontFamily: "'DM Mono',monospace", fontSize: "13px" }}>{l.quantity}</td>
                    <td style={{ textAlign: "right", fontFamily: "'DM Mono',monospace", fontSize: "12px", color: "var(--ink-soft)" }}>{fmt(l.unitCost)}</td>
                    <td style={{ textAlign: "right", fontFamily: "'DM Mono',monospace", fontSize: "13px" }}>{fmt(l.unitCost * l.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="doc-footer">
              <div className="doc-total">
                <div className="doc-total-label">Total Amount</div>
                <div className="doc-total-value">{fmt(doc.total)}</div>
              </div>
            </div>
            <div className="sig-row">
              {[isReceipt ? "Prepared By" : "Requested By", "Approved By", isReceipt ? "Received By" : "Released By"].map((role) => (
                <div key={role} className="sig-box">
                  <div style={{ height: "32px" }} />
                  <div className="sig-line" />
                  <div className="sig-role">{role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function RowsSetting() {

}


function ChartPage ({ path }) {

const contentpage = PAGE_CONTENT[path];
  //console.log('content page title : ' + contentpage.title) ;

  //const contentpage = PAGE_CONTENT[path];

    //console.log('content page : ' + contentpage + '  path:' + path) ;
    //const page = PAGE_CONTENT[path];
    //console.log('page : ' + page)    ;

//console.log('chart data : ' + JSON.stringify(chartdata)) ;
//console.log('chart options : ' + JSON.stringify(chartoptions)) ;

  //console.log(path);
  if (!contentpage) return null;
  return (
    <>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <div style={{
            background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: 24,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>
              Monthly Revenue vs Target
            </div>
            <div style={{ height: 280 }}><RevenueChartX /></div>
          </div>
          <div style={{
            background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: 24,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>
              Category Breakdown
            </div>
            <div style={{ height: 280 }}><DonutChart /></div>
          </div>
          <div style={{
            background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: 24,
            gridColumn: "1 / -1",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>
              Units Sold Trend
            </div>
            <div style={{ height: 220 }}><UnitsChart /></div>
          </div>
          <div><input id="txtcdata" name="txtcdata"></input>
          </div>
          


        </div>


    </>
  );


}


function useChart(ref, config) {
  useEffect(() => {
    if (!ref.current) return;
    //const ctx = ref.current.getContext("2d");
    //const chart = new Chart.Chart(ctx, config);
    //return () => chart.destroy();
  }, []);
}

function RevenueChart() {
    const [revdata,setrevdata]=useState([]);
    
    
    useEffect(() => {
    hgetdepts() ;
  }, [revdata]);


  const hgetdepts = async () => {
        await axios
          .get(g_deptUrl)
          .then((res) => { 
          //const datax = {
          //labels: res.data.map(item => item.name),
          //datasets: [{
            //label: 'Salary Rate',
            //data: res.data.map(item => item.amount),
          //backgroundColor: 'rgba(75, 192, 192, 0.2)'
  //}]    
//};

          const datax = {
          labels: res.data.map(item => item.name),
          datasets: [{
            label: 'Salary Rate',
            data: res.data.map(item => item.amount),
          backgroundColor: 'rgba(75, 192, 192, 0.2)'
  }]    
};



//console.log(res.data) ;
//console.log('data now 1 : ' + JSON.stringify(datax) );
setrevdata(datax) ;

          })
          .catch((err) => {
           console.log('error') ;
          });
  };


  //console.log('new data : ' + movbHeader.current ) ;
hgetdepts() ;

//console.log('check dept data : ' + JSON.stringify(revdata)) ;

  const ref = useRef(null);
  useChart(ref, {
    type: "bar",
    data: {
      labels: salesData.monthly.labels,
      datasets: [
        {
          type: "line",
          label: "Target",
          data: salesData.monthly.target,
          borderColor: "#94a3b8",
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "Revenue",
          data: salesData.monthly.revenue,
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 320);
            g.addColorStop(0, "#f97316");
            g.addColorStop(1, "#fed7aa55");
            return g;
          },
          borderRadius: 6,
          borderSkipped: false,
          yAxisID: "y",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#cbd5e1", font: { family: "'DM Sans', sans-serif", size: 12 } } },
        tooltip: {
          backgroundColor: "#1e293b",
          titleColor: "#f97316",
          bodyColor: "#e2e8f0",
          callbacks: { label: (c) => ` $${c.raw.toLocaleString()}` },
        },
      },
      scales: {
        x: { grid: { color: "#1e293b" }, ticks: { color: "#64748b" } },
        y: {
          grid: { color: "#1e293b" },
          ticks: { color: "#64748b", callback: (v) => `$${(v / 1000).toFixed(0)}k` },
        },
      },
    },
  });
  return <canvas ref={ref} />;
}

  
function RevenueChartX() {
    //const [revdata,setrevdata]=useState([]);
    const [message, setMessage] = useState("Waiting...");
    const [chartData,setchartData]=useState({labels:[],datasets:[]});
    //const [labeldata,setlabeldata] = useState([]);
    //const [amtdata,setamtdata] = useState([]);
    //const [targetdata,settargetdata] = useState([]);
    const MovcTest = useRef();
    
    useEffect(() => {
    hgetdepts() ;
  }, [chartData]);


  const hgetdepts =  async () => {
        await axios
          .get(g_deptUrl)
          .then((res) => {         
             //setrevdata(res.data) ;
            //console.log('res data : ' + JSON.stringify(res.data)) ;
             //console.log('chart test') ;
             
setchartData({
          labels: res.data.map ( x=> x.name),
          datasets: [
            {
              label: 'Monthly Sales',
              data: res.data.map( x=> x.amount),              
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
          ]
        });

        //console.log('chart test 1') ;
   //      console.log(' chartdata fresh: ' + JSON.stringify(chartData)) ;
        

             //setlabeldata(res.data.map( x=> x.name));
             //setamtdata(res.data.map( x=> x.amount));
             //settargetdata(res.data.map( x=> x.budget));
            // console.log('dept: ' + JSON.stringify(res.data)) ;
})
  
          .catch((err) => {
           console.log('error') ;
          });
  };


  //console.log('new data : ' + movbHeader.current ) ;
hgetdepts() ;


const acsTimeOut = ()=> {  
    // 1. Set the timeout
    const xxtimer = setTimeout(() => {
      setMessage('timeout completed') ;
      setTimeout(true);
    }, 5000);

    // 2. Clean up the timeout (vital to prevent memory leaks)
    clearTimeout(xxtimer);
    
}

acsTimeOut();

const acsData1 = 
  {monthly: {
    labels: ["Acc","Mrk","Adm","Whs","Hrd","Aud","Sal"],
    revenue:[40000,45000,46000,47000,48000,49000,50000] , 
    target: [41000,46000,48000,48000,49000,50000,51000],
    units:   [210, 275, 240, 305, 365, 340, 410],
  } } ;




/*
const acsData4= 
  {monthly:{ 
    labels: labeldata,    
    //labels: labeldata,    
    revenue: amtdata, 
    target: targetdata,
    units:   [210, 275, 240, 305, 365, 340, 410],
   }};
*/


  //revdata.map ( x=> ( 
   //  console.log('dept name: ' + x.name +  '  amount : ' + x.amount) 
 // )
  //)



//console.log('msg ' + message + ' date : ' + new Date()) ;
//console.log('acsdata 3 : ' + JSON.stringify(acsData3)) ;
//console.log('chart data: ' + JSON.stringify(chartData.labels) + '   datasets:' + JSON.stringify(chartData.datasets)) ;

//const parseData = JSON.parse(revdata) ;


  const ref = useRef(null);
  useChart(ref, {
    type: "bar",    
    data: {
      labels: acsData1.monthly.labels,
      datasets: [
        {
          type: "line",
          label: "target",
          data: acsData1.monthly.revenue,
          borderColor: "#94a3b8",
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "revenue",
          data: acsData1.monthly.revenue,
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 320);
            g.addColorStop(0, "#f97316");
            g.addColorStop(1, "#fed7aa55");
            return g;
          },
          borderRadius: 6,
          borderSkipped: false,
          yAxisID: "y",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#cbd5e1", font: { family: "'DM Sans', sans-serif", size: 12 } } },
        tooltip: {
          backgroundColor: "#1e293b",
          titleColor: "#f97316",
          bodyColor: "#e2e8f0",
          callbacks: { label: (c) => ` $${c.raw.toLocaleString()}` },
        },
      },
      scales: {
        x: { grid: { color: "#1e293b" }, ticks: { color: "#64748b" } },
        y: {
          grid: { color: "#1e293b" },
          ticks: { color: "#64748b", callback: (v) => `$${(v / 1000).toFixed(0)}k` },
        },
      },
    },
  });
    
  return <canvas ref={ref} />;

}


function DonutChart() {


  const ref1 = useRef(null);
  useChart(ref1, {
    type: "doughnut",
    data: {
      labels: salesData.categories.labels,
      datasets: [{
        data: salesData.categories.values,
        backgroundColor: salesData.categories.colors,
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "72%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#445975", padding: 14, font: { size: 11, family: "'DM Sans', sans-serif" } },
        },
        tooltip: {
          backgroundColor: "#1e293b",
          titleColor: "#f97316",
          bodyColor: "#e2e8f0",
          callbacks: { label: (c) => ` ${c.raw}% of sales` },
        },
      },
    },
  });
  return <canvas ref={ref1} />;
}

function UnitsChart() {
  const ref2 = useRef(null);
  useChart(ref2, {
    type: "line",
    data: {
      labels: salesData.monthly.labels,
      datasets: [{
        label: "Units Sold",
        data: salesData.monthly.units,
        borderColor: ORANGE,
        backgroundColor: "rgba(249,115,22,0.12)",
        borderWidth: 2.5,
        pointBackgroundColor: ORANGE,
        pointRadius: 4,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.45,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#cbd5e1", font: { family: "'DM Sans', sans-serif", size: 12 } } },
        tooltip: { backgroundColor: "#1e293b", titleColor: ORANGE, bodyColor: "#e2e8f0" },
      },
      scales: {
        x: { grid: { color: "#1e293b" }, ticks: { color: "#64748b" } },
        y: { grid: { color: "#1e293b" }, ticks: { color: "#64748b" } },
      },
    },
  });
   return <canvas ref={ref2} />;
}





export default function PayrollSystem() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({ payroll: true });
  const [activePath, setActivePath] = useState("dashboard");
  const isAuthenticated = useSelector(s => s.auth.isAuthenticated);
  const [logged, setLogged] = useState(true) ;


  const toggleMenu = (id) => {
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNav = (path, parentId) => {
    setActivePath(path);
    if (parentId && !openMenus[parentId]) {
      setOpenMenus(prev => ({ ...prev, [parentId]: true }));
    }
  };




  return (    
    <>
    <style>{css}</style>  
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f4f6fa" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 64,
        background: "#0f172a",
        display: "flex", flexDirection: "column",
        transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: "2px 0 12px rgba(0,0,0,0.10)",
      }}>
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: sidebarOpen ? "20px 20px 16px" : "20px 16px 16px",
          borderBottom: "1px solid #1e293b",
          minHeight: 64,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, flexShrink: 0,
          }}>₱</div>
          {sidebarOpen && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>PayrollPro</div>
              <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>HR & Payroll System</div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "12px 0" }}>
          {NAV_ITEMS.map(item => {
            const isActive = activePath === item.path || (item.children && item.children.some(c => c.path === activePath));
            const isOpen = openMenus[item.id];

            return (
              <div key={item.id}>
                {/* Parent item */}
                <button
                  onClick={() => {
                    if (item.children) toggleMenu(item.id);
                    else handleNav(item.path);
                  }}
                  title={!sidebarOpen ? item.label : undefined}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    gap: 10, padding: sidebarOpen ? "9px 18px" : "9px 0",
                    justifyContent: sidebarOpen ? "flex-start" : "center",
                    background: isActive ? "#1e3a5f" : "transparent",
                    border: "none", cursor: "pointer", borderRadius: 0,
                    color: isActive ? "#93c5fd" : "#94a3b8",
                    fontSize: 14, fontWeight: isActive ? 600 : 400,
                    transition: "background 0.15s, color 0.15s",
                    outline: "none",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#e2e8f0"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isActive ? "#1e3a5f" : "transparent"; e.currentTarget.style.color = isActive ? "#93c5fd" : "#94a3b8"; }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0, width: 22, textAlign: "center" }}>{item.icon}</span>
                  {sidebarOpen && (
                    <>
                      <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden" }}>{item.label}</span>
                      {item.children && (
                        <span style={{
                          fontSize: 10, transition: "transform 0.2s",
                          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                          color: "#64748b",
                        }}>▶</span>
                      )}
                    </>
                  )}
                </button>

                {/* Sub items */}
                {item.children && sidebarOpen && (
                  <div style={{
                    maxHeight: isOpen ? item.children.length * 38 + "px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.25s cubic-bezier(.4,0,.2,1)",
                  }}>
                    {item.children.map(child => {
                      const childActive = activePath === child.path;
                      return (
                        <button
                          key={child.id}
                          onClick={() => handleNav(child.path, item.id)}
                          style={{
                            width: "100%", display: "flex", alignItems: "center",
                            gap: 8, padding: "8px 18px 8px 46px",
                            background: childActive ? "#172554" : "transparent",
                            border: "none", cursor: "pointer",
                            color: childActive ? "#60a5fa" : "#64748b",
                            fontSize: 13, fontWeight: childActive ? 600 : 400,
                            textAlign: "left", borderLeft: childActive ? "3px solid #3b82f6" : "3px solid transparent",
                            transition: "all 0.15s",
                            outline: "none",
                          }}
                          onMouseEnter={e => { if (!childActive) { e.currentTarget.style.background = "#1a2744"; e.currentTarget.style.color = "#cbd5e1"; } }}
                          onMouseLeave={e => { e.currentTarget.style.background = childActive ? "#172554" : "transparent"; e.currentTarget.style.color = childActive ? "#60a5fa" : "#64748b"; }}
                        >
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: childActive ? "#3b82f6" : "#334155", flexShrink: 0 }} />
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom collapse button */}
        <div style={{ borderTop: "1px solid #1e293b", padding: "14px 0" }}>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: sidebarOpen ? "flex-end" : "center",
              gap: 8, padding: sidebarOpen ? "8px 18px" : "8px 0",
              background: "transparent", border: "none", cursor: "pointer",
              color: "#64748b", fontSize: 13, outline: "none",
            }}
          >
            <span style={{
              fontSize: 16,
              transform: sidebarOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.25s",
            }}>⟩</span>
            {sidebarOpen && <span style={{ fontSize: 12, color: "#475569" }}>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <header style={{
          background: "#fff", borderBottom: "1px solid #e8ecf4",
          padding: "0 28px", height: 60, display: "flex",
          alignItems: "center", justifyContent: "space-between",
          flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              background: "#f4f6fa", borderRadius: 8,
              border: "1px solid #e0e4ed", padding: "7px 14px",
              display: "flex", alignItems: "center", gap: 8,
              width: 220,
            }}>
              <span style={{ fontSize: 14, color: "#aaa" }}>🔍</span>
              <input
                placeholder="Search..."
                style={{
                  border: "none", background: "transparent",
                  fontSize: 13, color: "#555", outline: "none", width: "100%",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button style={{
              background: "#f4f6fa", border: "1px solid #e0e4ed",
              borderRadius: 8, padding: "7px 12px", cursor: "pointer",
              fontSize: 16, position: "relative",
            }}>
              🔔
              <span style={{
                position: "absolute", top: 4, right: 4,
                width: 8, height: 8, borderRadius: "50%",
                background: "#ef4444", border: "2px solid #fff",
              }} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "#fff",
              }}>AD</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>Admin</div>
                <div style={{ fontSize: 11, color: "#999" }}>Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        {logged && (
        <LoginPage onClose={() => setLogged(false) }  />
        )}
        
        <main style={{ flex: 1, overflowY: "auto", padding: 28 }}>
          {activePath === "dashboard"
            ? <Dashboard />
            : activePath=="reports/graph" ? <ChartPage path={activePath}/> 
            : activePath=="reports/graphtest" ? <TestChartPage path={activePath}/> 
            : activePath=="employees/list" ? <EmpPage path={activePath}/> 
            : activePath=="employees/sss" ? <SssPage path={activePath}/> 
            : activePath=="attendance/log" ? <AttendancePage path={activePath}/> 
            : activePath=="employees/departments" ? <EmpDept path={activePath}/> 
            : activePath=="settings/users" ? <UserPage path={activePath}/> 
            : activePath=="settings/orders" ? <OrderPage path={activePath}/>             
            : <GenericPage path={activePath} />
          } 
        </main> 
      </div>
    </div>
  </>
  );
}
