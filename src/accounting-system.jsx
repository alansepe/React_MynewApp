import React, { useState,useEffect,useMemo, useRef, useCallback } from "react";
import { createStore, combineReducers } from "redux"

import {
  LayoutDashboard, Receipt, Wallet, BookOpen, BarChart3, ListTree,
  Plus, X, Check, ChevronRight, TrendingUp, TrendingDown, AlertCircle,
  Search, Building2, CalendarDays, Trash2, ArrowUpRight, ArrowDownRight,
  CircleDollarSign, ScrollText
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell
} from "recharts";


// ─── Styles ───────────────────────────────────────────────────────────────────


/* ============================================================
   STYLE TOKENS
   Ledger-book aesthetic: warm paper, ink navy, deep green + brick
   accents, tabular mono for every figure, double-rule totals.
============================================================ */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

    .ldgr * { box-sizing: border-box; }
    .ldgr {
      --paper: #FAF7EF;
      --paper-alt: #F1EBDA;
      --ink: #1C2530;
      --ink-soft: #646F7C;
      --rule: #DCD3BC;
      --rule-strong: #B8AC8A;
      --green: #2C5F4E;
      --green-soft: #E3ECE6;
      --brick: #8C3B33;
      --brick-soft: #F4E5E1;
      --gold: #A97E2F;
      --gold-soft: #F1E6CC;
      font-family: 'Inter', sans-serif;
      color: var(--ink);
      background: var(--paper);
      min-height: 100vh;
      display: flex;
      width: 100%;
    }
    .ldgr .serif { font-family: 'Source Serif 4', serif; }
    .ldgr .mono { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }

    /* ---- sidebar (binder tabs) ---- */
    .ldgr .sidebar {
      width: 230px;
      flex-shrink: 0;
      background: var(--ink);
      color: #EFE9DA;
      display: flex;
      flex-direction: column;
      padding: 22px 0;
    }
    .ldgr .brand {
      padding: 0 20px 20px 20px;
      border-bottom: 1px solid rgba(75, 63, 35, 0.15);
      margin-bottom: 10px;
    }
    .ldgr .brand .name { font-family:'Source Serif 4',serif; font-size: 19px; font-weight:600; letter-spacing:.2px; }
    .ldgr .brand .sub { font-size: 11px; color: #B9AE93; margin-top: 2px; letter-spacing: .06em; text-transform: uppercase; }
    .ldgr .navitem {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 20px; font-size: 13.5px; cursor: pointer;
      color: #CFC6AE; border-left: 3px solid transparent;
      transition: background .12s, color .12s;
    }
    .ldgr .navitem:hover { background: rgba(255,255,255,0.04); color: #fff; }
    .ldgr .navitem.active { background: rgba(255,255,255,0.07); color: #fff; border-left-color: var(--gold); font-weight: 600; }
    .ldgr .navitem svg { flex-shrink: 0; }
    .ldgr .navfoot { margin-top: auto; padding: 14px 20px 0 20px; border-top: 1px solid rgba(239,233,218,0.15); font-size:11px; color:#9B917A; }

    /* ---- main ---- */
    .ldgr .main { flex: 1; min-width: 0; width:1050px; display:flex; flex-direction:column; }
    .ldgr .topbar {
      display:flex; align-items:center; justify-content: space-between;
      padding: 18px 32px; border-bottom: 1px solid var(--rule);
      background: var(--paper);
    }
    .ldgr .topbar h1 { font-family:'Source Serif 4',serif; font-size: 22px; font-weight:600; margin:0; }
    .ldgr .topbar .meta { font-size:12px; color: var(--ink-soft); margin-top:2px; }
    .ldgr .content { padding: 28px 32px 60px 32px; overflow-y: auto; }

    /* ---- cards ---- */
    .ldgr .card {
      background: #fff; border: 1px solid var(--rule); border-radius: 3px;
    }
    .ldgr .kpi {
      background: #fff; border: 1px solid var(--rule); border-radius: 3px;
      padding: 16px 18px; position: relative; overflow: hidden;
    }
    .ldgr .kpi .label { font-size: 11px; text-transform: uppercase; letter-spacing: .07em; color: var(--ink-soft); }
    .ldgr .kpi .value { font-family:'IBM Plex Mono', monospace; font-size: 24px; font-weight: 600; margin-top: 6px; }
    .ldgr .kpi .delta { font-size: 11.5px; margin-top: 5px; display:flex; align-items:center; gap:4px; }

    /* ---- buttons ---- */
    .ldgr .btn {
      display:inline-flex; align-items:center; gap:6px;
      font-size: 13px; font-weight: 600; padding: 8px 14px;
      border-radius: 3px; cursor: pointer; border: 1px solid transparent;
      font-family:'Inter',sans-serif;
    }
    .ldgr .btn-primary { background: var(--green); color: #fff; }
    .ldgr .btn-primary:hover { background: #244F40; }
    .ldgr .btn-ghost { background: transparent; color: var(--ink); border-color: var(--rule-strong); }
    .ldgr .btn-ghost:hover { background: var(--paper-alt); }
    .ldgr .btn-text { background:transparent; color: var(--green); padding: 4px 6px; font-weight:600; }
    .ldgr .btn:disabled { opacity: .45; cursor: not-allowed; }

    /* ---- tables (ledger rules) ---- */
    .ldgr table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
    .ldgr thead th {
      text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em;
      color: var(--ink-soft); font-weight: 600; padding: 8px 14px;
      border-bottom: 1.5px solid var(--rule-strong); background: var(--paper-alt);
    }
    .ldgr tbody td { padding: 10px 14px; border-bottom: 1px solid var(--rule); vertical-align: middle; }
    .ldgr tbody tr:hover { background: #FCFAF4; }
    .ldgr tbody tr:last-child td { border-bottom: none; }
    .ldgr .num { font-family:'IBM Plex Mono', monospace; text-align: right; font-variant-numeric: tabular-nums; }
    .ldgr .total-row td { border-top: 2px solid var(--ink); border-bottom: 4px double var(--ink); font-weight: 700; padding-top: 12px; padding-bottom: 12px; }
    .ldgr .subtotal-row td { border-top: 1px solid var(--rule-strong); font-weight: 600; }

    /* ---- badges ---- */
    .ldgr .badge { display:inline-block; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing:.04em; padding: 3px 8px; border-radius: 20px; }
    .ldgr .badge-paid { background: var(--green-soft); color: var(--green); }
    .ldgr .badge-partial { background: var(--gold-soft); color: var(--gold); }
    .ldgr .badge-unpaid { background: #ECE7D8; color: var(--ink-soft); }
    .ldgr .badge-overdue { background: var(--brick-soft); color: var(--brick); }

    /* ---- section heads ---- */
    .ldgr .sectionhead { display:flex; align-items:center; justify-content:space-between; margin-bottom: 14px; }
    .ldgr .sectionhead h2 { font-family:'Source Serif 4',serif; font-size: 18px; font-weight:600; margin:0; }
    .ldgr .eyebrow { font-size: 10.5px; text-transform: uppercase; letter-spacing: .08em; color: var(--gold); font-weight:700; margin-bottom:4px; }

    /* ---- tabs ---- */
    .ldgr .tabs { display:flex; gap: 2px; border-bottom: 1.5px solid var(--rule-strong); margin-bottom: 18px; }
    .ldgr .tab { padding: 9px 16px; font-size: 13px; font-weight:600; cursor:pointer; color: var(--ink-soft); border-bottom: 2px solid transparent; margin-bottom:-1.5px; }
    .ldgr .tab.active { color: var(--green); border-bottom-color: var(--green); }

    /* ---- inputs ---- */
    .ldgr input, .ldgr select, .ldgr textarea {
      font-family: 'Inter', sans-serif; font-size: 13.5px; padding: 7px 10px;
      border: 1px solid var(--rule-strong); border-radius: 3px; background: #fff; color: var(--ink);
      width: 100%;
    }
    .ldgr input.mono, .ldgr select.mono { font-family:'IBM Plex Mono',monospace; }
    .ldgr label { font-size: 11.5px; font-weight: 600; color: var(--ink-soft); display:block; margin-bottom: 4px; text-transform: uppercase; letter-spacing:.03em; }
    .ldgr .field { margin-bottom: 12px; }
    .ldgr input:focus, .ldgr select:focus, .ldgr textarea:focus { outline: 2px solid var(--green); outline-offset: 1px; }

    /* ---- modal ---- */
    .ldgr .overlay { position: fixed; inset: 0; background: rgba(28,37,48,0.5); display:flex; align-items:center; justify-content:center; z-index: 50; padding: 20px; }
    .ldgr .modal { background: var(--paper); border-radius: 4px; width: 935px; max-width: 100%; max-height: 88vh; overflow-y: auto; box-shadow: 0 18px 50px rgba(0,0,0,0.3); }
    .ldgr .modal-head { display:flex; align-items:center; justify-content:space-between; padding: 18px 22px; border-bottom: 1px solid var(--rule); position: sticky; top:0; background: var(--paper); }
    .ldgr .modal-head h3 { font-family:'Source Serif 4',serif; font-size: 17px; margin:0; }
    .ldgr .modal-body { padding: 20px 22px; }
    .ldgr .modal-foot { padding: 16px 22px; border-top: 1px solid var(--rule); display:flex; justify-content: flex-end; gap: 8px; }
    .ldgr .iconbtn { cursor:pointer; color: var(--ink-soft); background:none; border:none; padding:4px; display:flex; }
    .ldgr .iconbtn:hover { color: var(--brick); }


    .ldgr .modallg { background: var(--paper); border-radius: 4px; width: 1080px; max-width: 100%; max-height: 88vh; overflow-y: auto; box-shadow: 0 18px 50px rgba(0,0,0,0.3); }




    /* ---- empty state ---- */
    .ldgr .empty { text-align:center; padding: 50px 20px; color: var(--ink-soft); }
    .ldgr .empty svg { margin: 0 auto 10px auto; opacity: .4; }

    /* ---- balance check pill ---- */
    .ldgr .balpill { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:700; padding: 5px 10px; border-radius: 20px; }
    .ldgr .balpill.ok { background: var(--green-soft); color: var(--green); }
    .ldgr .balpill.bad { background: var(--brick-soft); color: var(--brick); }

    .ldgr .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .ldgr .grid3 { display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .ldgr .je-line-grid { display:grid; grid-template-columns: 2fr 1fr 1fr 32px; gap:8px; align-items:end; margin-bottom:8px; }
    .ldgr .hint { font-size: 11.5px; color: var(--ink-soft); margin-top: 4px; }
  `}</style>
);

/* ============================================================
   CHART OF ACCOUNTS
============================================================ */
const ACCOUNTS = [
  { id: "1000", name: "Cash", type: "asset", normal: "debit" },
  { id: "1010", name: "Cash in Bank-BPI", type: "asset", normal: "debit" },
  { id: "1020", name: "Cash in Bank-BDO", type: "asset", normal: "debit" },
  { id: "1030", name: "Cash in Bank-UB", type: "asset", normal: "debit" },
  { id: "1100", name: "Accounts Receivable", type: "asset", normal: "debit" },
  { id: "1200", name: "Inventory", type: "asset", normal: "debit" },
  { id: "2000", name: "Accounts Payable", type: "liability", normal: "credit" },
  { id: "2010", name: "Notes Payable", type: "liability", normal: "credit" },
  { id: "3000", name: "Owner's Equity", type: "equity", normal: "credit" },
  { id: "4000", name: "Sales Revenue", type: "revenue", normal: "credit" },
  { id: "5000", name: "Cost of Goods Sold", type: "expense", normal: "debit" },
  { id: "5100", name: "Rent Expense", type: "expense", normal: "debit" },
  { id: "5200", name: "Utilities Expense", type: "expense", normal: "debit" },
  { id: "5210", name: "Meals and Lodging", type: "expense", normal: "debit" },
  { id: "5300", name: "Office Supplies Expense", type: "expense", normal: "debit" },
  { id: "5310", name: "Representation Expense", type: "expense", normal: "debit" },
  { id: "5400", name: "Salaries Expense", type: "expense", normal: "debit" },
  { id: "5410", name: "Transportation Expense", type: "expense", normal: "debit" },
  { id: "5500", name: "Software & Subscriptions", type: "expense", normal: "debit" },

];

const CUSTOMERLST = [
  {id:"9001",name:"Cebu Auto Parts"},
  {id:"9002",name:"Korlanda Phils"},
  {id:"9003",name:"Mactan Rock Industries"},
  {id:"9004",name:"Mandaue Trade Center"},
  {id:"9005",name:"OnSemi Philippines"},
  {id:"9006",name:"Pizza Auto Parts"},
  {id:"9007",name:"Purefoods Corp"},
  {id:"9008",name:"Roro Transport"},
  {id:"9009",name:"Ryle Trucking"},
  {id:"9010",name:"San Miguel Corp"},
  {id:"9011",name:"Swift Foods"},
  {id:"9012",name:"Taiyu Yuden"},
  {id:"9013",name:"Timex Phils"},
  {id:"9014",name:"Virginia Foods Inc"},  
  {id:"9015",name:"Vitarich "}      
];

const PRODUCTLST = [
  {id:"",name:"Blank",category:"",price:0},
  {id:"P001",name:"Asus Laptop i5",category:"laptop",cost:7000,price:15000},
  {id:"P002",name:"Asus Laptop i7",category:"laptop",cost:9000,price:18000},
  {id:"P003",name:"HP Laptop i5",category:"laptop",cost:10000,price:20000},
  {id:"P004",name:"HP Laptop i7",category:"laptop",cost:12000,price:23000},
  {id:"P005",name:"Acer Laptop i5",category:"laptop",cost:6000,price:13000},
  {id:"P006",name:"Acer Laptop i7",category:"laptop",cost:8000,price:16000},
  {id:"P007",name:"Dell Laptop i5",category:"laptop",cost:8000,price:17000},
  {id:"P008",name:"Dell Laptop i7",category:"laptop",cost:10000,price:19000},
  {id:"H001",name:"SCSI External Drive 1Terra",category:"storage",cost:2500,price:5000},
  {id:"H002",name:"SCSI External Drive 3Terra",category:"storage",cost:3000,price:6000},
  {id:"H003",name:"SCSI External Drive 5Terra",category:"storage",cost:3000,price:7000},
  {id:"H004",name:"Seagate External Drive 1Terra",category:"storage",cost:2000,price:4000},
  {id:"H005",name:"Seagate External Drive 3Terra",category:"storage",cost:2000,price:5000},
  {id:"H006",name:"Seagate External Drive 5Terra",category:"storage",cost:3000,price:6000},
  {id:"M001",name:"24Inc Samsung Monitor",category:"monitor",cost:4000,price:8000},
  {id:"M002",name:"30Inc Samsung Monitor",category:"monitor",cost:5000,price:10000},
  {id:"M003",name:"24Inc Asus Monitor",category:"monitor",cost:3000,price:7000},
  {id:"M004",name:"30Inc Asus Monitor",category:"monitor",cost:4000,price:9000},
  {id:"A001",name:"50inc Samsung Smart TV",category:"appliancetv",cost:15000,price:30000},
  {id:"A002",name:"56inc Samsung Smart TV",category:"appliancetv",cost:17000,price:35000},
  {id:"A003",name:"60inc Samsung Smart TV",category:"appliancetv",cost:20000,price:40000},
  {id:"A011",name:"50inc TCL Smart TV",category:"appliancetv",cost:14000,price:29000},
  {id:"A012",name:"55inc TCL Smart TV",category:"appliancetv",cost:17000,price:33000},
  {id:"A013",name:"60inc TCL Smart TV",category:"appliancetv",cost:19000,price:38000}  
];

const NAV_ITEMS = [
  {
    id: "dashboard",
    icon: "▦",
    label: "Dashboard",
    path: "dashboard",
  },
    {
    id: "Files",
    icon: "👥",
    label: "Files",
    children: [
      { id: "fileschart", label: "Chart Of Accounts", path: "files/chart" },
      { id: "filessupplier", label: "Suppliers", path: "files/supplier" },      
      { id: "filescustomer", label: "Customers", path: "files/customer" },
      { id: "filesproducts", label: "Products", path: "files/products" },
    ],
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
    id: "generalledger",
    icon: "💰",
    label: "General Ledger",
    children: [
      { id: "gl-invoice", label: "Sales Invoice", path: "gl/invoice" },
      { id: "gl-receiv", label: "Receivables", path: "gl/receiv" },
      { id: "gl-pay", label: "Payables", path: "gl/pay" },
      { id: "gl-journal", label: "General Journal", path: "gl/journal" },
      { id: "gl-accounts", label: "Charts Of Accounts", path: "gl/accounts" },
    ],
  },
  {
    id: "inventory",
    icon: "📅",
    label: "Inventory",
    children: [
      { id: "inty-master", label: "Product List", path: "inty/master" },
      { id: "inty-rec", label: "Receiving", path: "inty/rec" },
      { id: "inty-iss", label: "Issuance", path: "inty/iss" },
      { id: "inty-sc", label: "Stockcard", path: "inty/sc" },      
      { id: "inty-summary", label: "Inventory Summary", path: "inty/summary" },      
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
    label: "Financial Reports",
    children: [
      { id: "rep-financial", label: "Financial Reports", path: "reports/financial" },
      { id: "rep-is", label: "Income Statement", path: "reports/is" },
      { id: "rep-bs", label: "Balance Sheet", path: "reports/bs" },
      { id: "rep-tb", label: "Trial Balance", path: "reports/tb" },
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


const initialAuthState = { isAuthenticated: false, user: null, error: null };
const rootReducer = combineReducers({ auth: authReducer});
const store = createStore(rootReducer);


const acct = (id) => ACCOUNTS.find((a) => a.id === id);
const EXPENSE_ACCOUNTS = ACCOUNTS.filter((a) => a.type === "expense");

const TYPE_LABEL = { asset: "Asset", liability: "Liability", equity: "Equity", revenue: "Revenue", expense: "Expense" };
const CATEGORY_LABEL = { laptop: "Laptop", storage: "Storage", monitor: "Monitor", appliancetv: "ApplianceTV", shoes: "Shoes" };



function authReducer(state = initialAuthState, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS": return { isAuthenticated: true, user: action.payload, error: null };
    case "LOGIN_FAILURE": return { ...state, error: action.payload };
    case "LOGOUT": return initialAuthState;
    case "CLEAR_ERROR": return { ...state, error: null };
    default: return state;
  }
}



/* ============================================================
   HELPERS
============================================================ */
const fmt = (n) => {
  const v = Math.round((n + Number.EPSILON) * 100) / 100;
  const abs = Math.abs(v);
  const s = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return v < 0 ? `(${s})` : s;
};
const money = (n) => `$${fmt(n)}`;
const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
const fmtDateShort = (d) => {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
const daysBetween = (a, b) => Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
const TODAY = "2026-07-01";

let idCounter = 1000;
const nextId = (prefix) => `${prefix}-${(++idCounter).toString().padStart(5, "0")}`;

/* ---- journal-entry builders (single source of truth for postings) ---- */
function buildInvoiceJE(inv) {
  const lines = [{ account: "1100", debit: inv.total, credit: 0 }, { account: "4000", debit: 0, credit: inv.total }];
  if (inv.cogs > 0) {
    lines.push({ account: "5000", debit: inv.cogs, credit: 0 });
    lines.push({ account: "1200", debit: 0, credit: inv.cogs });
  }
  return lines;
}
function buildReceiptJE(amount) {
  return [{ account: "1000", debit: amount, credit: 0 }, { account: "1100", debit: 0, credit: amount }];
}
function buildBillJE(bill) {
  return [{ account: bill.expenseAccount, debit: bill.total, credit: 0 }, { account: "2000", debit: 0, credit: bill.total }];
}
function buildBillPaymentJE(amount) {
  return [{ account: "2000", debit: amount, credit: 0 }, { account: "1000", debit: 0, credit: amount }];
}

/* ============================================================
   SEED DATA  (generated via the same posting helpers used at runtime,
   so every report ties out exactly)
============================================================ */
function buildSeedData() {
  const journalEntries = [];
  const invoices = [];
  const bills = [];

  const postJE = (date, memo, source,jeno, ref, lines) => {
    const je = { id: nextId("JE"), date, memo, source, jeno, ref, lines };
    journalEntries.push(je);
    return je.id;
  };

  // Opening capital
  postJE("2026-01-01", "Owner capital contribution — opening balances", "manual","JE-001","REF-001",
    [{ account: "1000", debit: 50000, credit: 0 }, { account: "1200", debit: 20000, credit: 0 }, { account: "3000", debit: 0, credit: 70000 }]);

  // --- Bills ---
  const mkBill = (vendor, date, due, expenseAccount, total, memo, paidDate) => {
    const id = nextId("BILL");
    const billNo = `BILL-${(bills.length + 1).toString().padStart(4, "0")}`;
    const bill = { id, billNo, vendor, date, due, expenseAccount, total, memo, amountPaid: 0, status: "unpaid", jeId: null };
    bill.jeId = postJE(date, `${memo} — ${vendor}`, "bill", billNo,"REF-002", buildBillJE(bill));
    if (paidDate) {
      postJE(paidDate, `Payment to ${vendor} — ${billNo}`, "bill-payment", billNo,"REF-003", buildBillPaymentJE(total));
      bill.amountPaid = total;
      bill.status = "paid";
    }
    bills.push(bill);
    return bill;
  };
  mkBill("Sterling Properties", "2026-01-05", "2026-01-20", "5100", 3000, "January rent", "2026-01-18");
  mkBill("Apex Office Supplies", "2026-02-03", "2026-02-18", "5300", 1250, "Office supplies restock", "2026-02-15");
  mkBill("Metro Power & Water", "2026-05-01", "2026-05-16", "5200", 980, "April utilities");
  mkBill("CloudHost Services", "2026-06-10", "2026-06-25", "5500", 540, "Monthly hosting & SaaS");
  mkBill("Sterling Properties", "2026-06-01", "2026-06-15", "5100", 3000, "June rent");

  // --- Invoices ---
  const mkInvoice = (customer, date, due, total, cogs, memo, paidDate, paidAmount) => {
    const id = nextId("INV");
    const invoiceNo = `INV-${(invoices.length + 1).toString().padStart(4, "0")}`;
    const inv = { id, invoiceNo, customer, date, due, total, cogs, memo, amountPaid: 0, status: "unpaid", jeId: null };
    inv.jeId = postJE(date, `${memo} — ${customer}`, "sales",invoiceNo,"REF-004", buildInvoiceJE(inv));
    if (paidAmount) {
      postJE(paidDate, `Payment from ${customer} — ${invoiceNo}`, "payment", invoiceNo,"REF-005", buildReceiptJE(paidAmount));
      inv.amountPaid = paidAmount;
      inv.status = paidAmount >= total ? "paid" : "partial";
    }
    invoices.push(inv);
    return inv;
  };
  mkInvoice("Acme Corp", "2026-02-10", "2026-03-12", 12500, 5000, "Consulting services", "2026-03-01", 12500);
  mkInvoice("Acme Corp", "2026-03-01", "2026-03-31", 9000, 3000, "Q1 systems integration", "2026-03-25", 9000);
  mkInvoice("Blue Ridge Foods", "2026-04-15", "2026-05-15", 8200, 0, "Wholesale order #214", "2026-05-10", 4000);
  mkInvoice("Nimbus Tech", "2026-05-20", "2026-06-19", 15750, 6200, "Platform license — annual", null, 0);
  mkInvoice("Coral Bay Hotel", "2026-06-25", "2026-07-25", 6300, 0, "Catering services", null, 0);

  // June payroll
  postJE("2026-06-29", "Take up rental for the month of june", "manual","JE-0009","REF-0009", [{ account: "5100", debit: 2000, credit: 0 }, { account: "1000", debit: 0, credit: 2000 }]);
  postJE("2026-06-30", "June payroll", "manual","JE-0010","REF-0010", [{ account: "5400", debit: 18000, credit: 0 }, { account: "1000", debit: 0, credit: 18000 }]);
  

  return { journalEntries, invoices, bills };
}

/* ============================================================
   REPORT CALCULATIONS
============================================================ */
function accountBalance(entries, accountId, throughDate) {
  //console.log('acct id: ' + accountId + '  throughDate: ' + throughDate) ;
  //console.log('entries: ' + JSON.stringify(entries));
  const a = acct(accountId);
  let debit = 0, credit = 0;
  
  entries.forEach((je) => {
    if (throughDate && je.date > throughDate) return;
    je.lines.forEach((l) => {
      //console.log('test5');
     // console.log('L account: ' + l.account + ' debit: ' + l.debit + ' credit:' + l.credit);
      if (l.account === accountId) { debit += l.debit || 0; credit += l.credit || 0; }
    });
  });
  const balance = a.normal === "debit" ? debit - credit : credit - debit;
  return { debit, credit, balance };
}

function accountBalanceRange(entries, accountId, start, end) {
  const a = acct(accountId);
  let debit = 0, credit = 0;
  entries.forEach((je) => {
    if (start && je.date < start) return;
    if (end && je.date > end) return;
    je.lines.forEach((l) => {
      if (l.account === accountId) { debit += l.debit || 0; credit += l.credit || 0; }
    });
  });
  return a.normal === "debit" ? debit - credit : credit - debit;
}

function computeTrialBalance(entries, asOf) {
  const rows = ACCOUNTS.map((a) => {
    const { balance } = accountBalance(entries, a.id, asOf);
    return { account: a, debit: a.normal === "debit" ? Math.max(balance, 0) : Math.max(-balance, 0), credit: a.normal === "credit" ? Math.max(balance, 0) : Math.max(-balance, 0) };
  }).filter((r) => r.debit !== 0 || r.credit !== 0);
  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);
  return { rows, totalDebit, totalCredit, balanced: Math.abs(totalDebit - totalCredit) < 0.005 };
}

function computeIncomeStatement(entries, start, end) {
  const revenue = ACCOUNTS.filter((a) => a.type === "revenue").map((a) => ({ account: a, amount: accountBalanceRange(entries, a.id, start, end) }));
  const expenses = ACCOUNTS.filter((a) => a.type === "expense").map((a) => ({ account: a, amount: accountBalanceRange(entries, a.id, start, end) })).filter((r) => r.amount !== 0);
  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
  const totalExpense = expenses.reduce((s, r) => s + r.amount, 0);
  return { revenue, expenses, totalRevenue, totalExpense, netIncome: totalRevenue - totalExpense };
}

function computeBalanceSheet(entries, asOf) {
  const assets = ACCOUNTS.filter((a) => a.type === "asset").map((a) => ({ account: a, amount: accountBalance(entries, a.id, asOf).balance }));
  const liabilities = ACCOUNTS.filter((a) => a.type === "liability").map((a) => ({ account: a, amount: accountBalance(entries, a.id, asOf).balance }));
  const equityBase = ACCOUNTS.filter((a) => a.type === "equity").map((a) => ({ account: a, amount: accountBalance(entries, a.id, asOf).balance }));
  const { netIncome } = computeIncomeStatement(entries, "2026-01-01", asOf);
  const totalAssets = assets.reduce((s, r) => s + r.amount, 0);
  const totalLiabilities = liabilities.reduce((s, r) => s + r.amount, 0);
  const totalEquity = equityBase.reduce((s, r) => s + r.amount, 0) + netIncome;
  return { assets, liabilities, equityBase, netIncome, totalAssets, totalLiabilities, totalEquity, balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.005 };
}

function agingBucket(days) {
  if (days < 0) return "Current";
  if (days <= 30) return "1–30";
  if (days <= 60) return "31–60";
  if (days <= 90) return "61–90";
  return "90+";
}
const BUCKETS = ["Current", "1–30", "31–60", "61–90", "90+"];

function computeAging(items, party, asOf) {
  const open = items.filter((i) => i.status !== "paid").map((i) => {
    const outstanding = i.total - i.amountPaid;
    const days = daysBetween(i.due, asOf);
    return { ...i, party: i[party], outstanding, days, bucket: agingBucket(days) };
  });
  const totals = {};
  BUCKETS.forEach((b) => (totals[b] = 0));
  open.forEach((o) => (totals[o.bucket] += o.outstanding));
  return { open, totals, grandTotal: open.reduce((s, o) => s + o.outstanding, 0) };
}

const statusOf = (item, asOf) => {
  if (item.status === "paid") return "paid";
  if (item.status === "partial") return item.due < asOf ? "overdue" : "partial";
  return item.due < asOf ? "overdue" : "unpaid";
};
const StatusBadge = ({ item, asOf }) => {
  const s = statusOf(item, asOf);
  const label = { paid: "Paid", partial: "Partial", unpaid: "Unpaid", overdue: "Overdue" }[s];
  return <span className={`badge badge-${s}`}>{label}</span>;
};

/* ============================================================
   SMALL UI PRIMITIVES
============================================================ */
const Modal = ({ title, onClose, children, foot }) => (
  <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-head">
        <h3>{title}</h3>
        <button className="iconbtn" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="modal-body">{children}</div>
      {foot && <div className="modal-foot">{foot}</div>}
    </div>
  </div>
);

const KPI = ({ label, value, deltaLabel, deltaUp, icon: Icon }) => (
  <div className="kpi">
    <div className="label">{label}</div>
    <div className="value">{value}</div>
    {deltaLabel && (
      <div className="delta" style={{ color: deltaUp ? "#2C5F4E" : "#8C3B33" }}>
        {deltaUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} {deltaLabel}
      </div>
    )}
  </div>
);

/* ============================================================
   DASHBOARD
============================================================ */
function Dashboard({ entries, invoices, bills, goTo }) {
  console.log('entering dashboard') ;
  const cash = accountBalance(entries, "1000", TODAY).balance;
  const ar = accountBalance(entries, "1100", TODAY).balance;
  const ap = accountBalance(entries, "2000", TODAY).balance;
  const is = computeIncomeStatement(entries, "2026-01-01", TODAY);

  const monthly = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((m, i) => {
      const start = `2026-${String(i + 1).padStart(2, "0")}-01`;
      const end = `2026-${String(i + 1).padStart(2, "0")}-31`;
      const stmt = computeIncomeStatement(entries, start, end);
      return { month: m, Revenue: Math.round(stmt.totalRevenue), Expenses: Math.round(stmt.totalExpense) };
    });
  }, [entries]);

  const expenseSplit = useMemo(() => {
    return EXPENSE_ACCOUNTS.map((a) => ({ name: a.name, value: accountBalanceRange(entries, a.id, "2026-01-01", TODAY) })).filter((d) => d.value > 0);
  }, [entries]);
  const PIE_COLORS = ["#2C5F4E", "#A97E2F", "#8C3B33", "#5B7C8E", "#7D6B9E", "#B08D57"];

  const arAging = computeAging(invoices, "customer", TODAY);
  const apAging = computeAging(bills, "vendor", TODAY);

  return (
    <div>
      <div className="eyebrow">Overview — through {fmtDate(TODAY)}</div>
      <div className="sectionhead"><h2 className="serif">Dashboard</h2></div>

      <div className="grid3" style={{ marginBottom: 18 }}>
        <KPI label="Cash on hand" value={money(cash)} icon={CircleDollarSign} />
        <KPI label="Accounts Receivable" value={money(ar)} deltaLabel={`${money(arAging.grandTotal)} outstanding`} deltaUp={false} />
        <KPI label="Accounts Payable" value={money(ap)} deltaLabel={`${money(apAging.grandTotal)} outstanding`} deltaUp={false} />
      </div>
      <div className="grid2" style={{ marginBottom: 26 }}>
        <KPI label="YTD Revenue" value={money(is.totalRevenue)} deltaLabel="Jan 1 – Jul 1, 2026" deltaUp={true} />
        <KPI label="YTD Net Income" value={money(is.netIncome)} deltaLabel={is.netIncome >= 0 ? "Profitable" : "Loss"} deltaUp={is.netIncome >= 0} />
      </div>

      <div className="grid2" style={{ alignItems: "start" }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow">Monthly</div>
          <div style={{ fontFamily: "Source Serif 4, serif", fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Revenue vs. Expenses</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} barGap={4}>
              <CartesianGrid strokeDasharray="2 4" stroke="#DCD3BC" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#646F7C" }} axisLine={{ stroke: "#DCD3BC" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#646F7C" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v) => money(v)} contentStyle={{ fontSize: 12, fontFamily: "IBM Plex Mono, monospace", borderRadius: 4, border: "1px solid #DCD3BC" }} />
              <Bar dataKey="Revenue" fill="#2C5F4E" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Expenses" fill="#8C3B33" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow">Year to date</div>
          <div style={{ fontFamily: "Source Serif 4, serif", fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Expense breakdown</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={expenseSplit} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {expenseSplit.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => money(v)} contentStyle={{ fontSize: 12, fontFamily: "IBM Plex Mono, monospace", borderRadius: 4, border: "1px solid #DCD3BC" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 6, justifyContent: "center" }}>
            {expenseSplit.map((d, i) => (
              <div key={d.name} style={{ fontSize: 11, color: "#646F7C", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 8, background: PIE_COLORS[i % PIE_COLORS.length], display: "inline-block" }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 18 }}>
        <div className="card" style={{ padding: 18, cursor: "pointer" }} onClick={() => goTo("receivables")}>
          <div className="sectionhead" style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: "Source Serif 4, serif", fontSize: 15, fontWeight: 600 }}>Overdue receivables</div>
            <ChevronRight size={16} color="#646F7C" />
          </div>
          {arAging.open.filter((o) => o.bucket !== "Current").slice(0, 3).map((o) => (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #DCD3BC" }}>
              <span>{o.party}</span>
              <span className="mono" style={{ color: "#8C3B33" }}>{money(o.outstanding)}</span>
            </div>
          ))}
          {arAging.open.filter((o) => o.bucket !== "Current").length === 0 && <div style={{ fontSize: 13, color: "#646F7C" }}>Nothing overdue. Clean book.</div>}
        </div>
        <div className="card" style={{ padding: 18, cursor: "pointer" }} onClick={() => goTo("payables")}>
          <div className="sectionhead" style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: "Source Serif 4, serif", fontSize: 15, fontWeight: 600 }}>Overdue payables</div>
            <ChevronRight size={16} color="#646F7C" />
          </div>
          {apAging.open.filter((o) => o.bucket !== "Current").slice(0, 3).map((o) => (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #DCD3BC" }}>
              <span>{o.party}</span>
              <span className="mono" style={{ color: "#8C3B33" }}>{money(o.outstanding)}</span>
            </div>
          ))}
          {apAging.open.filter((o) => o.bucket !== "Current").length === 0 && <div style={{ fontSize: 13, color: "#646F7C" }}>Nothing overdue. Clean book.</div>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SALES
============================================================ */
function NewInvoiceModal({xCustomer,xProduct, onClose, onSave }) {
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [date, setDate] = useState(TODAY);
  const [due, setDue] = useState(TODAY);
  const [memo, setMemo] = useState("");
  const [lines, setLines] = useState([{ desc: "", qty: 1, rate: 0 , cost: 0}]);
  const [cogs, setCogs] = useState(0);

  const total = lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.rate) || 0), 0);
  const [totcost,setTotcost] = useState(0);
  const updateLine = (i, field, val, cost) => setLines(lines.map((l, idx) => (idx === i ? { ...l, [field]: val} : l)));
  const canSave = useState(true) ; //customer.trim() && total > 0 && date && due;
  const [invno,setinvno] = useState("");
  const [sqno,setsqno] = useState("");
  const [sono,setsono] = useState("");
  const [drno,setdrno] = useState("");

  const [tinno,settinno] = useState("");

  const [selectedCust, setSelectedCust] = useState("") ;
  const [selectedProd, setSelectedProd] = useState("") ;

  const [refno,setrefno] = useState("");
  
  const handleDDchange = async (event) => {
  //event.preventDefault();
  //setSelectedFruit(event.target.value);
  console.log('customer : ' + event.target.value) ;
  setSelectedCust(event.target.value) ;
}

const handleDD2change = async (event,k) => {
  //event.preventDefault();
  //setSelectedFruit(event.target.value);
  //console.log('customer : ' + event.target.value) ;
  setSelectedProd(event.target.value) ;
  const dproduct = PRODUCTLST.filter(a=> a.id==event.target.value)
  const myval = dproduct[0].price;
  const mycost = dproduct[0].cost;  
  let totalcost = document.getElementById('lblcogs').innerText;
  //updateLine(k,"cost",mycost);
  updateLine(k,"rate",myval,mycost);
  
document.getElementById('lblcogs').innerText = Number(totalcost) + mycost ;
setCogs(Number(totalcost ) + mycost) ;
  //updateLine(k,"cost",mycost);
  //updateLine(k,"cost",mycost);
  //setCogs(totcost);
  //console.log('line no: ' + k  + '  target value: ' + event.target.value + '  cost:' + mycost + ' totcost: ' + totcost ) ;
}


  return (
    <Modal
      title="New invoice"
      onClose={onClose}
      foot={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!canSave} onClick={() => onSave({ customer, date, due, memo: memo || "Sales invoice", total, cogs: Number(cogs) || 0 })}>
            <Check size={14} /> Save invoice
          </button>
        </>
      }
    >
      <div className="grid2" style={{display:"flex"}}>
        <div className="field" ><label style={{textAlign:"left"}}>Invoice No</label><input style={{width:"150px"}} value={invno} onChange={(e) => setinvno(e.target.value)} placeholder="Invoice No" /></div>        
        <div className="field" ><label style={{textAlign:"left"}}>Customer</label>
        
        <select id="ddcustomer" defaultValue={customer} onChange={handleDDchange} style={{width:"407px"}}>
                      {xCustomer.map((u) => <option key={u.id} value={u.name}  >{u.name}</option>  )}
        </select>


        </div>        
       <div className="field"><label style={{textAlign:"left"}}>Invoice date</label><input style={{width:"150px"}} type="date" className="mono" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="field"><label style={{textAlign:"left"}}>Due date</label><input style={{width:"150px"}} type="date" className="mono" value={due} onChange={(e) => setDue(e.target.value)} /></div>        

       </div>
       <div className="grid2" style={{display:"flex"}}> 
        <div className="field"><label style={{textAlign:"left"}}>SO No.</label><input style={{width:"150px"}} type="text" className="mono" value={sono} onChange={(e) => setsono(e.target.value)} /></div>
        <div className="field"><label style={{textAlign:"left"}}>SQ No.</label><input style={{width:"197px"}} type="text" className="mono" value={sqno} onChange={(e) => setsqno(e.target.value)} /></div>        
        <div className="field"><label style={{textAlign:"left"}}>D.R No.</label><input style={{width:"197px"}} type="text" className="mono" value={drno} onChange={(e) => setdrno(e.target.value)} /></div>                
        <div className="field"><label style={{textAlign:"left"}}>TIN No</label><input style={{width:"150px"}} type="text" className="mono" value={tinno} onChange={(e) => settinno(e.target.value)} /></div>        
         <div className="field"><label style={{textAlign:"left"}}>Reference</label><input style={{width:"150px"}} type="text" className="mono" value={refno} onChange={(e) => setrefno(e.target.value)} /></div>        
      </div>

      <div className="grid2" style={{display:"flex"}}>
        <div className="field"><label style={{textAlign:"left"}}>Remarks</label><textarea style={{width:"890px",height:"50px"}} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="What's this for?" /></div>
      </div>


      <label style={{ marginTop: 3,textAlign:"left",fontWeight:"bold" }}>Invoice Details &nbsp; &nbsp; &nbsp; &nbsp;
&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;
&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;
&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;
&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;
&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;
&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;

          <button id="btnaddline" style={{textAlign:"right"}} className="btn btn-ghost" onClick={() => setLines([...lines, { desc: "", qty: 1, rate: 0 }])}>Add Item</button>

      
      </label>
      
      {lines.map((l, i) => (
        <div className="je-line-grid" key={i} style={{ gridTemplateColumns: "2fr 0.7fr 1fr 32px",marginBottom:"1px",width:"900px" }}>
          
          {/* <input placeholder="Description" value={l.desc} onChange={(e) => updateLine(i, "desc", e.target.value)} /> */}

        <select id="ddproduct" defaultValue={product} onChange={(e) => handleDD2change(e,i)} style={{width:"570px"}}>
                      {xProduct.map((u) => <option key={u.id} value={u.id}  >{u.name}</option>  )}
        </select>



          <input style={{width:"135px"}} className="mono" type="number" min="0" placeholder="Qty" value={l.qty} onChange={(e) => updateLine(i, "qty", e.target.value)} />
          <input style={{width:"135px",textAlign:"right"}} className="mono" type="number" min="0" placeholder="Rate" value={l.rate} onChange={(e) => updateLine(i, "rate", e.target.value)} />          
          <button style={{width:"30px"}} className="iconbtn" onClick={() => setLines(lines.filter((_, idx) => idx !== i))} disabled={lines.length === 1}><Trash2 size={15} /></button>
        </div>
      ))}

      

      <div className="field" style={{ marginTop: 14,display:"flex" }}>
        <label>Cost of goods sold (optional) &nbsp; &nbsp; &nbsp;</label>
        <label style={{fontSize:"16px",fontWeight:"bold"}} id="lblcogs">0</label>        
      
      </div>
      <div className="hint">If this sale ships inventory, recording its cost posts COGS against Inventory automatically.</div>

      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 10, borderTop: "1px solid var(--rule)", marginTop: 8 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".05em" }}>Total</div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{money(total)}</div>
        </div>
      </div>
    </Modal>
  );

  console.log('clicking button addline 1') ;
   const buttonadd = document.getElementById('btnaddline');
    if (buttonadd) {
       console.log('clicking button addline 2') ;
       buttonadd.click();
    }


}

function RecordPaymentModal({ title, outstanding, onClose, onSave }) {
  const [amount, setAmount] = useState(outstanding);
  const [date, setDate] = useState(TODAY);
  const [method, setMethod] = useState("Cash / Bank transfer");
  return (
    <Modal
      title={title}
      onClose={onClose}
      foot={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!(amount > 0 && amount <= outstanding + 0.001)} onClick={() => onSave(Number(amount), date)}>
            <Check size={14} /> Record payment
          </button>
        </>
      }
    >
      <div className="hint" style={{ marginBottom: 12 }}>Outstanding balance: <strong className="mono">{money(outstanding)}</strong></div>
      <div className="grid2">
        <div className="field"><label>Amount</label><input className="mono" type="number" step="0.01" max={outstanding} value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
        <div className="field"><label>Date</label><input type="date" className="mono" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      </div>
      <div className="field"><label>Method</label>
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option>Cash / Bank transfer</option>
          <option>Check</option>
          <option>Card</option>
        </select>
      </div>
    </Modal>
  );
}

function SalesView({ invoices, addInvoice, recordInvoicePayment }) {
  const [showNew, setShowNew] = useState(false);
  const [payTarget, setPayTarget] = useState(null);
  const [q, setQ] = useState("");
  const filtered = invoices.filter((i) => (i.customer + i.invoiceNo + i.memo).toLowerCase().includes(q.toLowerCase()));
  const totalBilled = invoices.reduce((s, i) => s + i.total, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.amountPaid, 0);

  return (
    <div>
      <div className="eyebrow">Sales</div>
      <div className="sectionhead">
        <h2 className="serif">Invoices</h2>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={15} /> New invoice</button>
      </div>

      <div className="grid3" style={{ marginBottom: 18 }}>
        <KPI label="Total invoiced" value={money(totalBilled)} />
        <KPI label="Total collected" value={money(totalCollected)} />
        <KPI label="Open balance" value={money(totalBilled - totalCollected)} />
      </div>

      <div style={{ marginBottom: 12, position: "relative", maxWidth: 320 }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "var(--ink-soft)" }} />
        <input placeholder="Search invoices…" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 30 }} />
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Invoice</th><th>Customer</th><th>Date</th><th>Due</th><th>Status</th><th className="num">Total</th><th className="num">Balance</th><th></th></tr></thead>
          <tbody>
            {filtered.map((inv) => {
              const bal = inv.total - inv.amountPaid;
              return (
                <tr key={inv.id}>
                  <td className="mono">{inv.invoiceNo}</td>
                  <td>{inv.customer}<div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{inv.memo}</div></td>
                  <td>{fmtDate(inv.date)}</td>
                  <td>{fmtDate(inv.due)}</td>
                  <td><StatusBadge item={inv} asOf={TODAY} /></td>
                  <td className="num">{money(inv.total)}</td>
                  <td className="num">{money(bal)}</td>
                  <td>{bal > 0.001 && <button className="btn-text" onClick={() => setPayTarget(inv)}>Receive</button>}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={8}><div className="empty"><Receipt size={26} /><div>No invoices match.</div></div></td></tr>}
          </tbody>
        </table>
      </div>

      {showNew && <NewInvoiceModal xCustomer={CUSTOMERLST} xProduct={PRODUCTLST} onClose={() => setShowNew(false)} onSave={(data) => { addInvoice(data); setShowNew(false); }} />}
      {payTarget && (
        <RecordPaymentModal
          title={`Receive payment — ${payTarget.invoiceNo}`}
          outstanding={payTarget.total - payTarget.amountPaid}
          onClose={() => setPayTarget(null)}
          onSave={(amount, date) => { recordInvoicePayment(payTarget.id, amount, date); setPayTarget(null); }}
        />
      )}
    </div>
  );
}

/* ============================================================
   RECEIVABLES / PAYABLES (aging)
============================================================ */
function AgingView({ title, items, party, partyLabel, onPay }) {
  const aging = useMemo(() => computeAging(items, party, TODAY), [items, party]);
  return (
    <div>
      <div className="eyebrow">{title === "Receivables" ? "Money owed to you" : "Money you owe"}</div>
      <div className="sectionhead"><h2 className="serif">{title}</h2></div>

      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Aging summary, as of {fmtDate(TODAY)}</div>
        <table>
          <thead><tr>{BUCKETS.map((b) => <th key={b} className="num">{b}</th>)}<th className="num">Total</th></tr></thead>
          <tbody>
            <tr className="total-row">
              {BUCKETS.map((b) => <td key={b} className="num" style={{ color: b === "Current" ? "var(--ink)" : aging.totals[b] > 0 ? "var(--brick)" : "var(--ink)" }}>{money(aging.totals[b])}</td>)}
              <td className="num">{money(aging.grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>{partyLabel}</th><th>Ref</th><th>Due date</th><th>Bucket</th><th className="num">Outstanding</th><th></th></tr></thead>
          <tbody>
            {aging.open.map((o) => (
              <tr key={o.id}>
                <td>{o.party}</td>
                <td className="mono">{o.invoiceNo || o.billNo}</td>
                <td>{fmtDate(o.due)}</td>
                <td><span className={`badge ${o.bucket === "Current" ? "badge-unpaid" : "badge-overdue"}`}>{o.bucket}</span></td>
                <td className="num">{money(o.outstanding)}</td>
                <td><button className="btn-text" onClick={() => onPay(o)}>{title === "Receivables" ? "Receive" : "Pay"}</button></td>
              </tr>
            ))}
            {aging.open.length === 0 && <tr><td colSpan={6}><div className="empty"><Wallet size={26} /><div>Nothing outstanding.</div></div></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReceivablesView({ invoices, recordInvoicePayment }) {
  const [payTarget, setPayTarget] = useState(null);
  return (
    <div>
      <AgingView title="Receivables" items={invoices} party="customer" partyLabel="Customer" onPay={(o) => setPayTarget(o)} />
      {payTarget && (
        <RecordPaymentModal
          title={`Receive payment — ${payTarget.invoiceNo}`}
          outstanding={payTarget.total - payTarget.amountPaid}
          onClose={() => setPayTarget(null)}
          onSave={(amount, date) => { recordInvoicePayment(payTarget.id, amount, date); setPayTarget(null); }}
        />
      )}
    </div>
  );
}

/* ============================================================
   PAYABLES (bills) — list + new bill
============================================================ */
function NewBillModal({ onClose, onSave }) {
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState(TODAY);
  const [due, setDue] = useState(TODAY);
  const [expenseAccount, setExpenseAccount] = useState(EXPENSE_ACCOUNTS[0].id);
  const [total, setTotal] = useState("");
  const [memo, setMemo] = useState("");
  const canSave = vendor.trim() && Number(total) > 0 && date && due;
  return (
    <Modal
      title="New bill"
      onClose={onClose}
      foot={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!canSave} onClick={() => onSave({ vendor, date, due, expenseAccount, total: Number(total), memo: memo || "Bill" })}>
            <Check size={14} /> Save bill
          </button>
        </>
      }
    >
      <div className="grid2">
        <div className="field"><label>Vendor</label><input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="e.g. Sterling Properties" /></div>
        <div className="field"><label>Expense account</label>
          <select value={expenseAccount} onChange={(e) => setExpenseAccount(e.target.value)}>
            {EXPENSE_ACCOUNTS.map((a) => <option key={a.id} value={a.id}>{a.id} · {a.name}</option>)}
          </select>
        </div>
        <div className="field"><label>Bill date</label><input type="date" className="mono" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="field"><label>Due date</label><input type="date" className="mono" value={due} onChange={(e) => setDue(e.target.value)} /></div>
        <div className="field"><label>Amount</label><input className="mono" type="number" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="0.00" /></div>
        <div className="field"><label>Memo</label><input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="What's this for?" /></div>
      </div>
    </Modal>
  );
}

function PayablesView({ bills, addBill, recordBillPayment }) {
  const [showNew, setShowNew] = useState(false);
  const [payTarget, setPayTarget] = useState(null);
  const [tab, setTab] = useState("list");

  return (
    <div>
      <div className="eyebrow">Payables</div>
      <div className="sectionhead">
        <h2 className="serif">Bills</h2>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={15} /> New bill</button>
      </div>

      <div className="tabs">
        <div className={`tab ${tab === "list" ? "active" : ""}`} onClick={() => setTab("list")}>All bills</div>
        <div className={`tab ${tab === "aging" ? "active" : ""}`} onClick={() => setTab("aging")}>Aging</div>
      </div>

      {tab === "aging" ? (
        <AgingView title="Payables" items={bills} party="vendor" partyLabel="Vendor" onPay={(o) => setPayTarget(o)} />
      ) : (
        <div className="card">
          <table>
            <thead><tr><th>Bill</th><th>Vendor</th><th>Account</th><th>Date</th><th>Due</th><th>Status</th><th className="num">Total</th><th className="num">Balance</th><th></th></tr></thead>
            <tbody>
              {bills.map((b) => {
                const bal = b.total - b.amountPaid;
                return (
                  <tr key={b.id}>
                    <td className="mono">{b.billNo}</td>
                    <td>{b.vendor}<div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{b.memo}</div></td>
                    <td>{acct(b.expenseAccount).name}</td>
                    <td>{fmtDate(b.date)}</td>
                    <td>{fmtDate(b.due)}</td>
                    <td><StatusBadge item={b} asOf={TODAY} /></td>
                    <td className="num">{money(b.total)}</td>
                    <td className="num">{money(bal)}</td>
                    <td>{bal > 0.001 && <button className="btn-text" onClick={() => setPayTarget(b)}>Pay</button>}</td>
                  </tr>
                );
              })}
              {bills.length === 0 && <tr><td colSpan={9}><div className="empty"><Wallet size={26} /><div>No bills yet.</div></div></td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showNew && <NewBillModal onClose={() => setShowNew(false)} onSave={(data) => { addBill(data); setShowNew(false); }} />}
      {payTarget && (
        <RecordPaymentModal
          title={`Pay bill — ${payTarget.billNo}`}
          outstanding={payTarget.total - payTarget.amountPaid}
          onClose={() => setPayTarget(null)}
          onSave={(amount, date) => { recordBillPayment(payTarget.id, amount, date); setPayTarget(null); }}
        />
      )}
    </div>
  );
}

/* ============================================================
   JOURNAL
============================================================ */
function NewJEModal({ onClose, onSave }) {
  const [date, setDate] = useState(TODAY);
  const [docdate, setDocdate] = useState("");
  const [memo, setMemo] = useState("");
  const [sono,setSono]=useState("");
  const [sqno,setSqno]=useState("");
  const [jeno,setJeno]=useState("");
  const [refno,setRefno]=useState("");
  const [bizpartner,setBizpartner]=useState("");
  const [lines, setLines] = useState([{ account: ACCOUNTS[0].id, debit: "", credit: "" }, { account: ACCOUNTS[5].id, debit: "", credit: "" }]);
  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.005 && totalDebit > 0;

  const updateLine = (i, field, val) => setLines(lines.map((l, idx) => (idx === i ? { ...l, [field]: val, ...(field === "debit" && val ? { credit: "" } : {}), ...(field === "credit" && val ? { debit: "" } : {}) } : l)));

  return (
    <Modal
      title="New Journal Entry"
      onClose={onClose}
      foot={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary"  >
            <Check size={14} /> Print J.V
          </button>
          <button className="btn btn-primary"  onClick={() => onSave({ date, memo,refno,jeno, lines: lines.filter((l) => Number(l.debit) || Number(l.credit)).map((l) => ({ account: l.account, debit: Number(l.debit) || 0, credit: Number(l.credit) || 0 })) })}>
            <Check size={14} /> Post entry
          </button>
        </>
      }
    >
      <div className="grid2" style={{display:"flex"}}>

        <div className="field"><label style={{textAlign:"left"}}>Date Created</label><input style={{width:"197px"}} type="date" className="mono" value={date} onChange={(e) => setDate(e.target.value)} readOnly /></div>
        <div className="field"><label style={{textAlign:"left"}}>Document Date</label><input style={{width:"197px"}} type="date" className="mono" value={docdate} onChange={(e) => setDocdate(e.target.value)} /></div>
        <div className="field"><label style={{textAlign:"left"}}>JE Entry No</label><input style={{width:"197px"}} type="text" className="mono" value={jeno} onChange={(e) => setJeno(e.target.value)} /></div>                
      </div>
      <div className="grid2" style={{display:"flex"}}>
          
          <div className="field"><label style={{textAlign:"left"}}>Source (Customer / Supplier) </label>
            <input style={{width:"409px"}} type="text" className="mono" value={bizpartner} onChange={(e) => setBizpartner(e.target.value)} />
          </div>        
          <div className="field"><label style={{textAlign:"left"}}>Reference #</label><input style={{width:"197px"}} type="text" className="mono" value={refno} onChange={(e) => setRefno(e.target.value)} /></div>        

          
      </div>
  
      
      <div className="grid2" style={{display:"flex"}}>  
        <div className="field"><label style={{textAlign:"left"}}>Remarks</label><textarea style={{width:"886px",height:"50px"}} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Describe this entry" /></div>
      </div>

      <label style={{textAlign:"left"}}>JE Sub Header  &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
        &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
        &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
        &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
        &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp;  
      <button className="btn btn-ghost" onClick={() => setLines([...lines, { account: ACCOUNTS[0].id, debit: "", credit: "" }])}><Plus size={13} /> Add entry</button>
      </label>
      {lines.map((l, i) => (
        <div className="je-line-grid" key={i}>
          <select value={l.account} onChange={(e) => updateLine(i, "account", e.target.value)}>
            {ACCOUNTS.map((a) => <option key={a.id} value={a.id}>{a.id} · {a.name}</option>)}
          </select>
          <input className="mono" type="number" step="0.01" placeholder="Debit" value={l.debit} onChange={(e) => updateLine(i, "debit", e.target.value)} />
          <input className="mono" type="number" step="0.01" placeholder="Credit" value={l.credit} onChange={(e) => updateLine(i, "credit", e.target.value)} />
          <button className="iconbtn" onClick={() => setLines(lines.filter((_, idx) => idx !== i))} disabled={lines.length <= 2}><Trash2 size={15} /></button>
        </div>
      ))}
      

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--rule)" }}>
        <div className={`balpill ${balanced ? "ok" : "bad"}`}>
          {balanced ? <Check size={13} /> : <AlertCircle size={13} />} {balanced ? "Balanced" : "Out of balance"}
        </div>
        <div className="mono" style={{ fontSize: 13 }}>
          Dr {money(totalDebit)} &nbsp;/&nbsp; Cr {money(totalCredit)}
        </div>
      </div>
    </Modal>
  );
}

function JournalView({ entries, addManualJE }) {
  const [showNew, setShowNew] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [q, setQ] = useState("");
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  const filtered = sorted.filter((je) => (je.memo + je.id + (je.ref || "")).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="eyebrow">General ledger</div>
      <div className="sectionhead">
        <h2 className="serif">Journal entries</h2>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={15} /> New entry</button>
      </div>

      <div style={{ marginBottom: 12, position: "relative", maxWidth: 320 }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "var(--ink-soft)" }} />
        <input placeholder="Search journal…" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 30 }} />
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Entry</th><th>Date</th><th>Memo</th><th>Source</th><th className="num">Debit</th><th className="num">Credit</th></tr></thead>
          <tbody>
            {filtered.map((je) => {
              const debit = je.lines.reduce((s, l) => s + l.debit, 0);
              const isOpen = expanded === je.id;
              return (
                <React.Fragment key={je.id}>
                  <tr style={{ cursor: "pointer" }} onClick={() => setExpanded(isOpen ? null : je.id)}>
                    <td className="mono">{je.id}</td>
                    <td>{fmtDate(je.date)}</td>
                    <td>{je.memo}</td>
                    <td><span className="badge badge-unpaid" style={{ textTransform: "capitalize" }}>{je.source}</span></td>
                    <td className="num">{money(debit)}</td>
                    <td className="num">{money(debit)}</td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={6} style={{ background: "var(--paper-alt)", padding: 0 }}>
                        <table style={{ margin: "4px 0" }}>
                          <thead><tr><th style={{ background: "transparent" }}>Account</th><th className="num" style={{ background: "transparent" }}>Debit</th><th className="num" style={{ background: "transparent" }}>Credit</th></tr></thead>
                          <tbody>
                            {je.lines.map((l, i) => (
                              <tr key={i}><td>{l.account} · {acct(l.account).name}</td><td className="num">{l.debit ? money(l.debit) : "—"}</td><td className="num">{l.credit ? money(l.credit) : "—"}</td></tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={6}><div className="empty"><ScrollText size={26} /><div>No entries match.</div></div></td></tr>}
          </tbody>
        </table>
      </div>

      {showNew && <NewJEModal onClose={() => setShowNew(false)} onSave={(data) => { addManualJE(data); setShowNew(false); }} />}
    </div>
  );
}


/* ============================================================
   PRODUCT LIST
============================================================ */
function ProductsView({ entries }) {
  //console.log('entering product master') ;
  const category = ["appliancetv", "monitor", "laptop", "storage"];
  return (
    <div>      
      <div className="sectionhead"><h2 className="serif">Product List</h2></div>
        <div className="card"  style={{ marginBottom: 2 }}>
          <table>
            <thead><tr><th colSpan={2} style={{width:"50px"}}>Product Code </th>
            <th colSpan={2} style={{textAlign:"left",width:"190px"}}> Product Description </th>
            <th className="num" style={{textAlign:"left",width:"150px"}}>Cost</th>
            <th className="num" style={{textAlign:"center",width:"110px"}}>Price</th>
            <th className="num" style={{textAlign:"left",width:"80px"}}>.</th>
            
            </tr></thead>
          </table>
        </div>


      {category.map((g) => (
        <div className="card" key={g} style={{ marginBottom: 16 }}>
          <table>
            <thead><tr><th colSpan={2}>{CATEGORY_LABEL[g]} </th>
            <th colSpan={2}> </th>
            <th className="num"></th>
            <th className="num"></th>
            </tr></thead>
            <tbody>
              {PRODUCTLST.filter((a) => a.category === g).map((a) => {
                //const { balance } = 0;//accountBalance(entries, a.id, TODAY);
                return <tr key={a.id}><td className="mono" style={{ width: "120px" }}>{a.id}</td><td style={{width:"410px",textAlign:"left"}}>{a.name}</td>
                <td className="num" style={{width:"170px"}}>{money(a.cost)}</td>
                <td className="num" style={{width:"170px"}}>{money(a.price)}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}



/* ============================================================
   CHART OF ACCOUNTS
============================================================ */
function ChartOfAccountsView({ entries }) {
  const groups = ["asset", "liability", "equity", "revenue", "expense"];
  return (
    <div>
      <div className="eyebrow">Reference</div>
      <div className="sectionhead"><h2 className="serif">Chart of accounts</h2></div>
      {groups.map((g) => (
        <div className="card" key={g} style={{ marginBottom: 16 }}>
          <table>
            <thead><tr><th colSpan={2}>{TYPE_LABEL[g]} accounts</th><th className="num">Balance, as of {fmtDateShort(TODAY)}</th></tr></thead>
            <tbody>
              {ACCOUNTS.filter((a) => a.type === g).map((a) => {
                const { balance } = accountBalance(entries, a.id, TODAY);
                return <tr key={a.id}><td className="mono" style={{ width: 70 }}>{a.id}</td><td>{a.name}</td><td className="num">{money(balance)}</td></tr>;
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   REPORTS
============================================================ */
function ReportsView({ entries,typ }) {
  console.log('entering report  typ: ' + typ) ;
  //const [tab, setTab] = useState("trial");
  const [tab, setTab] = useState(typ);
  const [asOf, setAsOf] = useState(TODAY);
  const [start, setStart] = useState("2026-01-01");

  const tb = useMemo(() => computeTrialBalance(entries, asOf), [entries, asOf]);
  const is = useMemo(() => computeIncomeStatement(entries, start, asOf), [entries, start, asOf]);
  const bs = useMemo(() => computeBalanceSheet(entries, asOf), [entries, asOf]);

  return (
    <div>
      <div className="eyebrow">Statements</div>
      <div className="sectionhead"><h2 className="serif">Financial reports</h2></div>

      <div className="tabs">
        <div className={`tab ${tab === "trial" ? "active" : ""}`} onClick={() => setTab("trial")}>Trial balance</div>
        <div className={`tab ${tab === "income" ? "active" : ""}`} onClick={() => setTab("income")}>Income statement</div>
        <div className={`tab ${tab === "balance" ? "active" : ""}`} onClick={() => setTab("balance")}>Balance sheet</div>
        <div className={`tab ${tab === "ledger" ? "active" : ""}`} onClick={() => setTab("balance")}>Account Ledger</div>
      </div>

      {tab === "income" && (
        <div className="grid2" style={{ maxWidth: 420, marginBottom: 16 }}>
          <div className="field"><label>Period start</label><input type="date" className="mono" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div className="field"><label>Period end</label><input type="date" className="mono" value={asOf} onChange={(e) => setAsOf(e.target.value)} /></div>
        </div>
      )}
      {(tab === "trial" || tab === "balance") && (
        <div className="field" style={{ maxWidth: 200, marginBottom: 16 }}><label>As of</label><input type="date" className="mono" value={asOf} onChange={(e) => setAsOf(e.target.value)} /></div>
      )}

      {tab === "trial" && (
        <div className="card">
          <div style={{ padding: "14px 18px 0 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="serif" style={{ fontSize: 15, fontWeight: 600 }}>Trial Balance — as of {fmtDate(asOf)}</div>
            <div className={`balpill ${tb.balanced ? "ok" : "bad"}`}>{tb.balanced ? <Check size={13} /> : <AlertCircle size={13} />} {tb.balanced ? "Balanced" : "Out of balance"}</div>
          </div>
          <table style={{ marginTop: 10 }}>
            <thead><tr><th>Account</th><th>Type</th><th className="num">Debit</th><th className="num">Credit</th></tr></thead>
            <tbody>
              {tb.rows.map((r) => <tr key={r.account.id}><td className="mono" style={{ width: 60 }}>{r.account.id}</td><td>{r.account.name}<div style={{ fontSize: 11, color: "var(--ink-soft)", textTransform: "capitalize" }}>{r.account.type}</div></td><td className="num">{r.debit ? money(r.debit) : "—"}</td><td className="num">{r.credit ? money(r.credit) : "—"}</td></tr>)}
              <tr className="total-row"><td colSpan={2}>Totals</td><td className="num">{money(tb.totalDebit)}</td><td className="num">{money(tb.totalCredit)}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === "income" && (
        <div className="card">
          <div style={{ padding: "14px 18px 0 18px" }} className="serif"><span style={{ fontSize: 15, fontWeight: 600 }}>Income Statement</span><div style={{ fontSize: 12, color: "var(--ink-soft)", fontFamily: "Inter" }}>{fmtDate(start)} – {fmtDate(asOf)}</div></div>
          <table style={{ marginTop: 10 }}>
            <thead><tr><th colSpan={2}>Revenue</th></tr></thead>
            <tbody>
              {is.revenue.map((r) => <tr key={r.account.id}><td>{r.account.name}</td><td className="num">{money(r.amount)}</td></tr>)}
              <tr className="subtotal-row"><td>Total revenue</td><td className="num">{money(is.totalRevenue)}</td></tr>
            </tbody>
            <thead><tr><th colSpan={2}>Expenses</th></tr></thead>
            <tbody>
              {is.expenses.map((r) => <tr key={r.account.id}><td>{r.account.name}</td><td className="num">{money(r.amount)}</td></tr>)}
              {is.expenses.length === 0 && <tr><td colSpan={2} style={{ color: "var(--ink-soft)" }}>No expenses recorded in this period.</td></tr>}
              <tr className="subtotal-row"><td>Total expenses</td><td className="num">{money(is.totalExpense)}</td></tr>
            </tbody>
            <tbody>
              <tr className="total-row"><td>Net income</td><td className="num" style={{ color: is.netIncome >= 0 ? "var(--green)" : "var(--brick)" }}>{money(is.netIncome)}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === "balance" && (
        <div className="card">
          <div style={{ padding: "14px 18px 0 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><span className="serif" style={{ fontSize: 15, fontWeight: 600 }}>Balance Sheet</span><div style={{ fontSize: 12, color: "var(--ink-soft)" }}>As of {fmtDate(asOf)}</div></div>
            <div className={`balpill ${bs.balanced ? "ok" : "bad"}`}>{bs.balanced ? <Check size={13} /> : <AlertCircle size={13} />} {bs.balanced ? "Balanced" : "Out of balance"}</div>
          </div>
          <table style={{ marginTop: 10 }}>
            <thead><tr><th colSpan={2}>Assets</th></tr></thead>
            <tbody>
              {bs.assets.map((r) => <tr key={r.account.id}><td>{r.account.name}</td><td className="num">{money(r.amount)}</td></tr>)}
              <tr className="subtotal-row"><td>Total assets</td><td className="num">{money(bs.totalAssets)}</td></tr>
            </tbody>
            <thead><tr><th colSpan={2}>Liabilities</th></tr></thead>
            <tbody>
              {bs.liabilities.map((r) => <tr key={r.account.id}><td>{r.account.name}</td><td className="num">{money(r.amount)}</td></tr>)}
              <tr className="subtotal-row"><td>Total liabilities</td><td className="num">{money(bs.totalLiabilities)}</td></tr>
            </tbody>
            <thead><tr><th colSpan={2}>Equity</th></tr></thead>
            <tbody>
              {bs.equityBase.map((r) => <tr key={r.account.id}><td>{r.account.name}</td><td className="num">{money(r.amount)}</td></tr>)}
              <tr><td>Current year earnings</td><td className="num">{money(bs.netIncome)}</td></tr>
              <tr className="subtotal-row"><td>Total equity</td><td className="num">{money(bs.totalEquity)}</td></tr>
            </tbody>
            <tbody>
              <tr className="total-row"><td>Total liabilities &amp; equity</td><td className="num">{money(bs.totalLiabilities + bs.totalEquity)}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   APP SHELL
============================================================ */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "sales", label: "Sales", icon: Receipt },
  { id: "receivables", label: "Receivables", icon: TrendingUp },
  { id: "payables", label: "Payables", icon: TrendingDown },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "accounts", label: "Chart of Accounts", icon: ListTree },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

function useSelector(selector) {
  const [state, setState] = useState(() => selector(store.getState()));
  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(selector(store.getState())));
    return unsubscribe;
  }, []);
  return state;
}


export default function App() {
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
    //console.log('journal entries : ' + JSON.stringify(journalEntries)) ;
    //setView(path);    
    if (path=='reports/financial') {
      setView('reports');
    }
   if (path=='reports/bs') {
      console.log('report is bs');
      setView('balance');
    }

    if (path=='reports/tb') {
      setView('trial');
    }

   if (path=='reports/is') {
      setView('income');
    }


    if (path=='dashboard') {
      setView('dashboard');
    }
    if (path=='gl/invoice') {
      setView('sales');
    }
    if (path=='gl/receiv') {
      setView('receivables');
    }
    if (path=='gl/pay') {
      setView('payables');
    }
    if (path=='gl/journal') {
      setView('journal');
    }
    if (path=='gl/accounts') {
      setView('accounts');
    }

    if (path=='inty/master') {
      setView('products');
    }


    console.log('path xx : ' + path);

  };





  const seedRef = useState(() => buildSeedData())[0];
  const [journalEntries, setJournalEntries] = useState(seedRef.journalEntries);
  const [invoices, setInvoices] = useState(seedRef.invoices);
  const [bills, setBills] = useState(seedRef.bills);
  const [view, setView] = useState("dashboard");

  const addInvoice = (data) => {
    const invoiceNo = `INV-${(invoices.length + 1).toString().padStart(4, "0")}`;
    const inv = { id: nextId("INV"), invoiceNo, customer: data.customer, date: data.date, due: data.due, total: data.total, cogs: data.cogs, memo: data.memo, amountPaid: 0, status: "unpaid", jeId: null };
    const je = { id: nextId("JE"), date: data.date, memo: `${data.memo} — ${data.customer}`, source: "sales", ref: invoiceNo, lines: buildInvoiceJE(inv) };
    inv.jeId = je.id;
    setInvoices([...invoices, inv]);
    setJournalEntries([...journalEntries, je]);
  };

  const recordInvoicePayment = (invoiceId, amount, date) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    const je = { id: nextId("JE"), date, memo: `Payment from ${inv.customer} — ${inv.invoiceNo}`, source: "payment", ref: inv.invoiceNo, lines: buildReceiptJE(amount) };
    const newPaid = inv.amountPaid + amount;
    setInvoices(invoices.map((i) => (i.id === invoiceId ? { ...i, amountPaid: newPaid, status: newPaid >= i.total - 0.001 ? "paid" : "partial" } : i)));
    setJournalEntries([...journalEntries, je]);
  };

  const addBill = (data) => {
    const billNo = `BILL-${(bills.length + 1).toString().padStart(4, "0")}`;
    const bill = { id: nextId("BILL"), billNo, vendor: data.vendor, date: data.date, due: data.due, expenseAccount: data.expenseAccount, total: data.total, memo: data.memo, amountPaid: 0, status: "unpaid", jeId: null };
    const je = { id: nextId("JE"), date: data.date, memo: `${data.memo} — ${data.vendor}`, source: "bill", ref: billNo, lines: buildBillJE(bill) };
    bill.jeId = je.id;
    setBills([...bills, bill]);
    setJournalEntries([...journalEntries, je]);
  };

  const recordBillPayment = (billId, amount, date) => {
    const bill = bills.find((b) => b.id === billId);
    const je = { id: nextId("JE"), date, memo: `Payment to ${bill.vendor} — ${bill.billNo}`, source: "bill-payment", ref: bill.billNo, lines: buildBillPaymentJE(amount) };
    const newPaid = bill.amountPaid + amount;
    setBills(bills.map((b) => (b.id === billId ? { ...b, amountPaid: newPaid, status: newPaid >= b.total - 0.001 ? "paid" : "partial" } : b)));
    setJournalEntries([...journalEntries, je]);
  };

  const addManualJE = (data) => {
    const je = { id: nextId("JE"), date: data.date, memo: data.memo, source: "manual", ref: data.refno,jeno:data.jeno, lines: data.lines };
    setJournalEntries([...journalEntries, je]);
  };

  const cash = accountBalance(journalEntries, "1000", TODAY).balance;
//3b82f6 , 6366f1
//d5ad12, f1ecd9
  return (
<>

<Styles />
<div className="ldgr">
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
            background: "linear-gradient(135deg, #d5ad12 0%, #f1ecd9 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, flexShrink: 0,
          }}>₱</div>
          {sidebarOpen && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>Bossing</div>
              <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>ERP System</div>
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



      <div className="main">
        <div className="topbar">
          <div>
            <h1>{NAV.find((n) => n.id === view)?.label}</h1>
            <div className="meta">{fmtDate(TODAY)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-soft)" }}>Cash on hand</div>
            <div className="mono" style={{ fontSize: 17, fontWeight: 700 }}>{money(cash)}</div>
          </div>
        </div>

        <div className="content">
          {view === "dashboard" && <Dashboard entries={journalEntries} invoices={invoices} bills={bills} goTo={setView} />}
          {view === "sales" && <SalesView invoices={invoices} addInvoice={addInvoice} recordInvoicePayment={recordInvoicePayment} />}
          {view === "receivables" && <ReceivablesView invoices={invoices} recordInvoicePayment={recordInvoicePayment} />}
          {view === "payables" && <PayablesView bills={bills} addBill={addBill} recordBillPayment={recordBillPayment} />}
          {view === "journal" && <JournalView entries={journalEntries} addManualJE={addManualJE} />}
          {view === "accounts" && <ChartOfAccountsView entries={journalEntries} />}
          {view === "reports" && <ReportsView entries={journalEntries} typ={"trial"} />}          
          {view === "income" && <ReportsView entries={journalEntries} typ={"income"} />}          
          {view === "balance" && <ReportsView entries={journalEntries} typ={"balance"} />}          
          {view === "trial" && <ReportsView entries={journalEntries} typ={"trial"} />}          

          {view === "products" && <ProductsView entries={PRODUCTLST} />}
        </div>
      </div>
    </div>
</div>

    </>
  );
}
