import { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart, LineChart, AreaChart, PieChart,
  ResponsiveContainer, XAxis, YAxis, Tooltip,
  Cell, Bar, Line, Area, Pie, Legend
} from "recharts";

// ─── PALETA DE CORES ───────────────────────────────────────────────────────
const C = {
  primary: "#0F3460", success: "#059669", warning: "#D97706",
  danger: "#DC2626", info: "#2563EB", bg: "#F0F4F8", surface: "#FFFFFF",
  border: "#E2E8F0", text: "#0F172A", muted: "#64748B",
  anestesia: "#EA580C", srpa: "#059669", limpeza: "#F59E0B",
  disponivel: "#94A3B8", preparando: "#EAB308", cirurgia: "#2563EB",
  bloqueada: "#DC2626",
};

// ─── STATUS CONFIG ──────────────────────────────────────────────────────────
const STATUS_CFG = {
  "DISPONÍVEL":   { color: C.disponivel, label: "Disponível" },
  "PREPARANDO":   { color: C.preparando, label: "Preparando" },
  "ANESTESIA":    { color: C.anestesia,  label: "Anestesia" },
  "EM CIRURGIA":  { color: C.cirurgia,   label: "Em Cirurgia" },
  "SRPA":         { color: C.srpa,       label: "SRPA" },
  "LIMPEZA":      { color: C.limpeza,    label: "Limpeza" },
  "BLOQUEADA":    { color: C.bloqueada,  label: "Bloqueada" },
};

// ─── DADOS MOCKADOS ─────────────────────────────────────────────────────────
const now = () => new Date();
const minsAgo = (m) => new Date(Date.now() - m * 60000);
const minsFrom = (m) => new Date(Date.now() + m * 60000);

const INITIAL_PATIENTS = [
  { id: "CC-001", nome: "A.S.F.", procedimento: "Colecistectomia Laparoscópica", cirurgiao: "Dr. Marcos Lima", anestesista: "Dra. Ana Costa", sala: 1, faseAtual: 3, agendado: minsAgo(150), inicioCirurgia: minsAgo(90), estimadoMin: 120, alertas: [], fases: [ minsAgo(160), minsAgo(150), minsAgo(100), minsAgo(90), null, null ] },
  { id: "CC-002", nome: "B.R.M.", procedimento: "Artroplastia Total de Joelho D", cirurgiao: "Dr. Paulo Alves", anestesista: "Dr. João Ferreira", sala: 2, faseAtual: 4, agendado: minsAgo(240), inicioCirurgia: minsAgo(180), estimadoMin: 180, alertas: ["Aguardando vaga UTI há 52 min"], fases: [ minsAgo(250), minsAgo(240), minsAgo(200), minsAgo(185), minsAgo(52), null ] },
  { id: "CC-003", nome: "C.T.L.", procedimento: "Craniotomia Descompressiva", cirurgiao: "Dr. Roberto Nunes", anestesista: "Dra. Carla Melo", sala: 3, faseAtual: 3, agendado: minsAgo(210), inicioCirurgia: minsAgo(150), estimadoMin: 130, alertas: ["Tempo excedido em 14%"], fases: [ minsAgo(220), minsAgo(210), minsAgo(165), minsAgo(150), null, null ] },
  { id: "CC-004", nome: "D.M.S.", procedimento: "Histerectomia Laparoscópica", cirurgiao: "Dra. Fernanda Souza", anestesista: "Dr. Pedro Ramos", sala: 4, faseAtual: 1, agendado: minsFrom(10), inicioCirurgia: null, estimadoMin: 90, alertas: [], fases: [ minsAgo(20), minsAgo(10), null, null, null, null ] },
  { id: "CC-006", nome: "E.G.P.", procedimento: "Revascularização Miocárdica", cirurgiao: "Dr. Henrique Dias", anestesista: "Dra. Luisa Viana", sala: 6, faseAtual: 3, agendado: minsAgo(300), inicioCirurgia: minsAgo(240), estimadoMin: 300, alertas: [], fases: [ minsAgo(310), minsAgo(300), minsAgo(260), minsAgo(240), null, null ] },
  { id: "CC-009", nome: "F.K.O.", procedimento: "Gastrectomia Parcial", cirurgiao: "Dr. André Matos", anestesista: "Dr. Sérgio Lima", sala: 9, faseAtual: 2, agendado: minsAgo(60), inicioCirurgia: null, estimadoMin: 150, alertas: [], fases: [ minsAgo(70), minsAgo(60), minsAgo(20), null, null, null ] },
  { id: "CC-010", nome: "G.H.R.", procedimento: "Colectomia Laparoscópica", cirurgiao: "Dra. Renata Castro", anestesista: "Dra. Beatriz Lopes", sala: 10, faseAtual: 4, agendado: minsAgo(200), inicioCirurgia: minsAgo(140), estimadoMin: 120, alertas: [], fases: [ minsAgo(210), minsAgo(200), minsAgo(155), minsAgo(140), minsAgo(25), null ] },
  { id: "CC-005", nome: "H.F.B.", procedimento: "Apendicectomia", cirurgiao: "Dr. Carlos Gomes", anestesista: "Dra. Tânia Reis", sala: 5, faseAtual: 5, agendado: minsAgo(400), inicioCirurgia: minsAgo(300), estimadoMin: 60, alertas: [], fases: [ minsAgo(410), minsAgo(400), minsAgo(355), minsAgo(300), minsAgo(360), minsAgo(30) ] },
];

const INITIAL_ROOMS = [
  { id: 1, nome: "Sala 01", especialidade: "Cirurgia Geral",    status: "EM CIRURGIA", pacienteId: "CC-001", proximoProc: null },
  { id: 2, nome: "Sala 02", especialidade: "Ortopedia",         status: "SRPA",        pacienteId: "CC-002", proximoProc: null },
  { id: 3, nome: "Sala 03", especialidade: "Neurologia",        status: "EM CIRURGIA", pacienteId: "CC-003", proximoProc: null },
  { id: 4, nome: "Sala 04", especialidade: "Ginecologia",       status: "PREPARANDO",  pacienteId: "CC-004", proximoProc: null },
  { id: 5, nome: "Sala 05", especialidade: "Urologia",          status: "LIMPEZA",     pacienteId: null,     proximoProc: "11:30 Nefrolitotripsia" },
  { id: 6, nome: "Sala 06", especialidade: "Cardiovascular",    status: "EM CIRURGIA", pacienteId: "CC-006", proximoProc: null },
  { id: 7, nome: "Sala 07", especialidade: "Cirurgia Plástica", status: "DISPONÍVEL",  pacienteId: null,     proximoProc: "13:00 Reconstrução Mamária" },
  { id: 8, nome: "Sala 08", especialidade: "Trauma",            status: "BLOQUEADA",   pacienteId: null,     proximoProc: null, motivo: "Manutenção de equipamento" },
  { id: 9, nome: "Sala 09", especialidade: "Oncologia",         status: "ANESTESIA",   pacienteId: "CC-009", proximoProc: null },
  { id: 10,nome: "Sala 10", especialidade: "Endoscopia",        status: "SRPA",        pacienteId: "CC-010", proximoProc: null },
];

const INITIAL_MESSAGES = [
  { id: 1, de: "CC", para: "UTI", tipo: "TRANSFERÊNCIA", prio: "ALTA",   hora: minsAgo(52), texto: "Paciente CC-002 aguarda vaga UTI há 52 min. Cirurgia concluída, hemodinamicamente estável.", lido: false },
  { id: 2, de: "Sistema", para: "GESTÃO", tipo: "ALERTA",  prio: "ALTA",   hora: minsAgo(30), texto: "Sala 03 excedeu tempo previsto em 14%. Cirurgião notificado.", lido: false },
  { id: 3, de: "Sistema", para: "GESTÃO", tipo: "ALERTA",  prio: "ALTA",   hora: minsAgo(15), texto: "SRPA com 6/6 leitos ocupados. Capacidade máxima atingida.", lido: false },
  { id: 4, de: "IA",      para: "GESTÃO", tipo: "ALERTA",  prio: "MÉDIA",  hora: minsAgo(10), texto: "Predição IA: atraso cascata detectado. Salas 04 e 07 potencialmente impactadas pela Sala 03.", lido: false },
  { id: 5, de: "Farmácia",para: "CC",    tipo: "INSUMOS",  prio: "MÉDIA",  hora: minsAgo(45), texto: "Entrega de propofol e fentanil para Sala 09 confirmada.", lido: true },
  { id: 6, de: "UTI",     para: "CC",    tipo: "RESPOSTA", prio: "ALTA",   hora: minsAgo(5),  texto: "Leito UTI disponível em 20 min para paciente CC-002. Aguardando confirmação da Regulação.", lido: false },
  { id: 7, de: "Clínica Cirúrgica", para: "CC", tipo: "LEITO", prio: "NORMAL", hora: minsAgo(120), texto: "3 leitos disponíveis para alta pós-cirúrgica do turno da tarde.", lido: true },
  { id: 8, de: "Regulação", para: "CC", tipo: "LEITO", prio: "ALTA", hora: minsAgo(3), texto: "Confirmação de vaga UTI para CC-002. Favor preparar transferência.", lido: false },
];

const INITIAL_ALERTS = [
  { id: 1, tipo: "danger", titulo: "UTI — Vaga Urgente", desc: "CC-002 aguarda vaga UTI há 52 min", resolvido: false },
  { id: 2, tipo: "danger", titulo: "SLA Excedido", desc: "Sala 03 — Craniotomia +14% do tempo estimado", resolvido: false },
  { id: 3, tipo: "warning", titulo: "SRPA Lotada", desc: "6/6 leitos ocupados na SRPA", resolvido: false },
  { id: 4, tipo: "warning", titulo: "Predição IA", desc: "Risco de atraso cascata — Salas 04 e 07", resolvido: false },
  { id: 5, tipo: "info", titulo: "Turnover Sala 05", desc: "Limpeza em andamento. Previsão: 11:30", resolvido: false },
];

const CHECKLIST_ITEMS = {
  signIn: [
    { id: "si1", texto: "Identidade do paciente confirmada (nome, data nascimento, prontuário)", checked: true,  obs: "", ts: minsAgo(90), resp: "Enf. Maria" },
    { id: "si2", texto: "Sítio cirúrgico marcado e conferido", checked: true,  obs: "", ts: minsAgo(89), resp: "Dr. Marcos Lima" },
    { id: "si3", texto: "Consentimento informado assinado", checked: true,  obs: "", ts: minsAgo(92), resp: "Enf. Maria" },
    { id: "si4", texto: "Alergias verificadas", checked: true,  obs: "AINE — alergia confirmada", ts: minsAgo(91), resp: "Dra. Ana Costa" },
    { id: "si5", texto: "Via aérea avaliada — risco de aspiração?", checked: true,  obs: "Mallampati II — sem risco", ts: minsAgo(88), resp: "Dra. Ana Costa" },
    { id: "si6", texto: "Equipamentos de emergência disponíveis?", checked: false, obs: "", ts: null, resp: "" },
    { id: "si7", texto: "Oxímetro funcional e afixado ao paciente", checked: true, obs: "", ts: minsAgo(87), resp: "Enf. Carlos" },
  ],
  timeOut: [
    { id: "to1", texto: "Todos os membros da equipe se apresentaram por nome e função", checked: true,  obs: "", ts: minsAgo(85), resp: "Dr. Marcos Lima" },
    { id: "to2", texto: "Procedimento, sítio e paciente confirmados em voz alta", checked: true,  obs: "", ts: minsAgo(85), resp: "Dr. Marcos Lima" },
    { id: "to3", texto: "Antibiótico profilático administrado nos últimos 60 min?", checked: true,  obs: "Cefazolina 2g IV — 08:45", ts: minsAgo(84), resp: "Dra. Ana Costa" },
    { id: "to4", texto: "Imagens necessárias exibidas?", checked: false, obs: "", ts: null, resp: "" },
    { id: "to5", texto: "Antecipação de eventos críticos pela equipe cirúrgica?", checked: true,  obs: "", ts: minsAgo(83), resp: "Dr. Marcos Lima" },
    { id: "to6", texto: "Antecipação de eventos críticos pela equipe anestésica?", checked: true,  obs: "", ts: minsAgo(83), resp: "Dra. Ana Costa" },
    { id: "to7", texto: "Antecipação de eventos críticos pela equipe de enfermagem?", checked: false, obs: "", ts: null, resp: "" },
  ],
  signOut: [
    { id: "so1", texto: "Procedimento realizado registrado", checked: false, obs: "", ts: null, resp: "" },
    { id: "so2", texto: "Contagem de instrumentais, compressas e agulhas conferida", checked: false, obs: "", ts: null, resp: "" },
    { id: "so3", texto: "Peças/amostras rotuladas corretamente", checked: false, obs: "", ts: null, resp: "" },
    { id: "so4", texto: "Problemas com equipamentos registrados", checked: false, obs: "", ts: null, resp: "" },
    { id: "so5", texto: "Principais preocupações para recuperação comunicadas", checked: false, obs: "", ts: null, resp: "" },
  ],
};

const ANALYTICS_DATA = {
  ocupacao7d: [
    { dia: "Seg", valor: 87 }, { dia: "Ter", valor: 92 }, { dia: "Qua", valor: 75 },
    { dia: "Qui", valor: 88 }, { dia: "Sex", valor: 95 }, { dia: "Sáb", valor: 60 }, { dia: "Dom", valor: 45 },
  ],
  turnoverSalas: [
    { sala: "Sala 01", min: 22 }, { sala: "Sala 02", min: 28 }, { sala: "Sala 03", min: 19 },
    { sala: "Sala 04", min: 31 }, { sala: "Sala 05", min: 24 }, { sala: "Sala 06", min: 27 },
    { sala: "Sala 07", min: 18 }, { sala: "Sala 08", min: 0  }, { sala: "Sala 09", min: 23 }, { sala: "Sala 10", min: 29 },
  ],
  cirurgiasSemana: [
    { dia: "Seg", plan: 18, real: 17 }, { dia: "Ter", plan: 20, real: 19 }, { dia: "Qua", plan: 16, real: 14 },
    { dia: "Qui", plan: 19, real: 18 }, { dia: "Sex", plan: 22, real: 21 }, { dia: "Sáb", plan: 10, real: 9 }, { dia: "Dom", plan: 4, real: 3 },
  ],
  tempoEspecialidade: [
    { esp: "Cardiovascular", min: 280 }, { esp: "Neurologia", min: 195 }, { esp: "Ortopedia", min: 175 },
    { esp: "Oncologia", min: 160 }, { esp: "Ginecologia", min: 105 }, { esp: "Cirurgia Geral", min: 95 },
    { esp: "Urologia", min: 80 }, { esp: "Plástica", min: 75 }, { esp: "Trauma", min: 65 }, { esp: "Endoscopia", min: 50 },
  ],
};

const USERS_TABLE = [
  { nome: "Dr. Marcos Lima",    perfil: "CIRURGIAO",  setor: "Cirurgia Geral",  ativo: true },
  { nome: "Dra. Ana Costa",     perfil: "ANESTESISTA",setor: "Anestesiologia",  ativo: true },
  { nome: "Enf. Maria Silva",   perfil: "ENFERMAGEM", setor: "CC",              ativo: true },
  { nome: "Gest. Carlos Admin", perfil: "GESTAO",     setor: "Direção CC",      ativo: true },
  { nome: "Reg. João Leitos",   perfil: "REGULACAO",  setor: "Regulação",       ativo: true },
  { nome: "Dr. Paulo Alves",    perfil: "CIRURGIAO",  setor: "Ortopedia",       ativo: false },
];

const FASES = ["Admissão CC", "Pré-operatório", "Anestesia", "Cirurgia", "SRPA", "Alta/Transferência"];
const FASE_ICONS = ["🚪","📋","💉","🔬","🛌","✓"];

const TRANSLATIONS = {
  PT: { title:"CirurFlow", search:"Buscar por código do paciente", searchBtn:"Buscar", fase0:"Admissão", fase1:"Preparação", fase2:"Anestesia", fase3:"Em cirurgia", fase4:"Recuperação", fase5:"Alta", status:"Status atual", updated:"Última atualização", info:"Para mais informações, procure o balcão do CC", notFound:"Código não encontrado. Verifique e tente novamente." },
  EN: { title:"CirurFlow", search:"Search by patient code", searchBtn:"Search", fase0:"Admission", fase1:"Preparation", fase2:"Anesthesia", fase3:"In surgery", fase4:"Recovery", fase5:"Discharge", status:"Current status", updated:"Last update", info:"For more information, please contact the OR desk", notFound:"Code not found. Please check and try again." },
  ES: { title:"CirurFlow", search:"Buscar por código del paciente", searchBtn:"Buscar", fase0:"Admisión", fase1:"Preparación", fase2:"Anestesia", fase3:"En cirugía", fase4:"Recuperación", fase5:"Alta", status:"Estado actual", updated:"Última actualización", info:"Para más información, diríjase al mostrador del pabellón", notFound:"Código no encontrado. Verifique e intente de nuevo." },
};

// ─── UTILITÁRIOS ────────────────────────────────────────────────────────────
function fmtTime(date) {
  if (!date) return "--:--";
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function fmtElapsed(startDate) {
  if (!startDate) return "--";
  const diff = Math.floor((Date.now() - startDate.getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m ${String(s).padStart(2,"0")}s`;
}
function fmtClock(date) {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function pctElapsed(patient) {
  if (!patient.inicioCirurgia) return 0;
  const elapsed = (Date.now() - patient.inicioCirurgia.getTime()) / 60000;
  return Math.min(Math.round((elapsed / patient.estimadoMin) * 100), 150);
}

// ─── COMPONENTES BASE ───────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || { color: C.muted, label: status };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background: cfg.color + "22",
      color: cfg.color, border:`1px solid ${cfg.color}55`, borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:700 }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background: cfg.color, display:"inline-block" }} />
      {cfg.label}
    </span>
  );
}

function KPICard({ label, value, delta, up, icon }) {
  return (
    <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"16px 20px",
      boxShadow:"0 1px 3px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", gap:4 }}>
      <span style={{ fontSize:12, color: C.muted, textTransform:"uppercase", letterSpacing:1 }}>{icon} {label}</span>
      <span style={{ fontSize:26, fontWeight:800, color: C.text }}>{value}</span>
      {delta && <span style={{ fontSize:12, color: up ? C.success : C.danger, fontWeight:600 }}>
        {up ? "▲" : "▼"} {delta}
      </span>}
    </div>
  );
}

function AlertBanner({ type, text, onClose }) {
  const colors = { danger: C.danger, warning: C.warning, info: C.info };
  const bg = colors[type] || C.muted;
  return (
    <div style={{ background: bg + "15", border:`1px solid ${bg}55`, borderRadius:8, padding:"8px 12px",
      display:"flex", alignItems:"center", justifyContent:"space-between", color: bg, fontWeight:600, fontSize:13 }}>
      <span>⚠ {text}</span>
      {onClose && <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color: bg, fontSize:16 }}>×</button>}
    </div>
  );
}

function PhaseTimeline({ patient }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x+1), 1000); return () => clearInterval(t); }, []);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, overflowX:"auto", padding:"8px 0" }}>
      {FASES.map((fase, i) => {
        const done = i < patient.faseAtual;
        const active = i === patient.faseAtual;
        const col = done ? C.success : active ? C.info : C.border;
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", border:`3px solid ${col}`,
                background: done ? C.success : active ? C.info : "#fff",
                display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14,
                boxShadow: active ? `0 0 0 4px ${C.info}33` : "none",
                animation: active ? "pulse 1.5s infinite" : "none" }}>
                {done ? "✓" : FASE_ICONS[i]}
              </div>
              <span style={{ fontSize:10, color: done ? C.success : active ? C.info : C.muted, fontWeight: active ? 700 : 400, textAlign:"center", maxWidth:70 }}>{fase}</span>
              {patient.fases[i] && <span style={{ fontSize:9, color: C.muted }}>{fmtTime(patient.fases[i])}</span>}
            </div>
            {i < FASES.length - 1 && <div style={{ width:40, height:2, background: done ? C.success : C.border, margin:"0 2px", marginBottom:30 }} />}
          </div>
        );
      })}
    </div>
  );
}

function ToastNotification({ type, title, message, onClose }) {
  const colors = { danger: C.danger, warning: C.warning, info: C.info };
  const bg = colors[type] || C.muted;
  useEffect(() => { const t = setTimeout(onClose, 8000); return () => clearTimeout(t); }, []);
  return (
    <div style={{ background: C.surface, border:`2px solid ${bg}`, borderRadius:10, padding:"12px 16px",
      boxShadow:"0 4px 16px rgba(0,0,0,0.12)", maxWidth:320, width:"100%" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
          <span style={{ color: bg, fontSize:18 }}>{ type==="danger"?"🔴": type==="warning"?"🟡":"🔵"}</span>
          <div>
            <div style={{ fontWeight:700, color: C.text, fontSize:14 }}>{title}</div>
            <div style={{ color: C.muted, fontSize:12, marginTop:2 }}>{message}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color: C.muted, fontSize:18, lineHeight:1 }}>×</button>
      </div>
    </div>
  );
}

// ─── TELA DE LOGIN ──────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [user, setUser] = useState(""); const [pass, setPass] = useState(""); const [perfil, setPerfil] = useState("ENFERMAGEM");
  const perfis = ["CIRURGIAO","ANESTESISTA","ENFERMAGEM","GESTAO","REGULACAO","ACOMPANHANTE"];
  const inp = { width:"100%", padding:"10px 14px", border:`1px solid ${C.border}`, borderRadius:8, fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box" };
  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(135deg, ${C.primary} 0%, #1e5fa8 100%)`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background: C.surface, borderRadius:16, padding:40, width:400, maxWidth:"95vw", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:40 }}>🏥</div>
          <h1 style={{ margin:"8px 0 4px", color: C.primary, fontSize:28, fontWeight:800 }}>CirurFlow</h1>
          <p style={{ margin:0, color: C.muted, fontSize:14 }}>HUB-UnB · Centro Cirúrgico Digital</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <input style={inp} placeholder="Usuário" value={user} onChange={e=>setUser(e.target.value)} />
          <input style={inp} type="password" placeholder="Senha" value={pass} onChange={e=>setPass(e.target.value)} />
          <select style={{...inp, background:"#fff"}} value={perfil} onChange={e=>setPerfil(e.target.value)}>
            {perfis.map(p=><option key={p} value={p}>{p.charAt(0)+p.slice(1).toLowerCase().replace("ao","ão")}</option>)}
          </select>
          <button onClick={()=>onLogin(user||"Usuário",perfil)} style={{ background: C.primary, color:"#fff", border:"none", borderRadius:8, padding:"12px 0", fontSize:16, fontWeight:700, cursor:"pointer", marginTop:8 }}>Entrar</button>
        </div>
        <p style={{ textAlign:"center", color: C.muted, fontSize:11, marginTop:20 }}>🔒 Autenticação real via Active Directory institucional (Ebserh)</p>
      </div>
    </div>
  );
}

// ─── MAPA CC ────────────────────────────────────────────────────────────────
function MapaCC({ rooms, patients, onSelectPatient, setActiveTab, userPerfil }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x=>x+1), 1000); return () => clearInterval(t); }, []);

  return (
    <div>
      <h2 style={{ color: C.text, marginBottom:16, fontSize:20, fontWeight:700 }}>🗺 Mapa do Centro Cirúrgico</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
        {rooms.map(room => {
          const pat = patients.find(p => p.id === room.pacienteId);
          const cfg = STATUS_CFG[room.status] || {};
          const pct = pat ? pctElapsed(pat) : 0;
          const pctColor = pct < 80 ? C.success : pct < 100 ? C.warning : C.danger;
          const hasAlert = pat && pat.alertas.length > 0;
          return (
            <div key={room.id} onClick={() => { if(pat){ onSelectPatient(pat); setActiveTab("paciente"); } }}
              style={{ background: C.surface, border:`2px solid ${hasAlert ? C.danger : cfg.color || C.border}`, borderRadius:10,
                padding:16, cursor: pat ? "pointer" : "default", boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
                transition:"transform 0.15s", position:"relative" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:16, color: C.text }}>{room.nome}</div>
                  <div style={{ fontSize:12, color: C.muted }}>{room.especialidade}</div>
                </div>
                <StatusPill status={room.status} />
              </div>
              {pat ? (
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <div style={{ fontSize:13, color: C.text }}><b>{pat.id}</b> — {pat.procedimento}</div>
                  <div style={{ fontSize:12, color: C.muted }}>👨‍⚕️ {pat.cirurgiao}</div>
                  <div style={{ fontSize:12, color: C.muted }}>Fase: <b>{FASES[pat.faseAtual]}</b></div>
                  {pat.inicioCirurgia && <div style={{ fontSize:12, color: C.muted }}>⏱ {fmtElapsed(pat.inicioCirurgia)}</div>}
                  {pat.inicioCirurgia && (
                    <div style={{ marginTop:4 }}>
                      <div style={{ fontSize:11, color: C.muted, marginBottom:3 }}>Progresso tempo: {pct}%</div>
                      <div style={{ height:6, background: C.border, borderRadius:10, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${Math.min(pct,100)}%`, background: pctColor, borderRadius:10, transition:"width 0.5s" }} />
                      </div>
                    </div>
                  )}
                  {hasAlert && pat.alertas.map((a,i)=><AlertBanner key={i} type="danger" text={a} />)}
                </div>
              ) : (
                <div style={{ fontSize:13, color: C.muted }}>
                  {room.motivo && <div>⚠ {room.motivo}</div>}
                  {room.proximoProc && <div>📅 Próx: {room.proximoProc}</div>}
                  {!room.motivo && !room.proximoProc && <div>Sala disponível</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DETALHE DO PACIENTE ────────────────────────────────────────────────────
function DetalhePaciente({ patient, patients, onSelect, userPerfil, addToast, rooms }) {
  const [tick, setTick] = useState(0);
  const [showIntercorrencia, setShowIntercorrencia] = useState(false);
  const [intercorrenciaText, setIntercorrenciaText] = useState("");
  const [eventos, setEventos] = useState([
    { ts: patient?.fases[0], texto: "Paciente admitido no CC", resp: "Enf. Maria" },
    { ts: patient?.fases[1], texto: "Sala preparada, equipe acionada", resp: "Enf. Carlos" },
    { ts: patient?.fases[2], texto: "Indução anestésica iniciada", resp: patient?.anestesista },
    { ts: patient?.fases[3], texto: "Incisão cirúrgica realizada", resp: patient?.cirurgiao },
  ].filter(e=>e.ts));

  useEffect(() => { const t = setInterval(() => setTick(x=>x+1), 1000); return () => clearInterval(t); }, []);

  if (!patient) return (
    <div style={{ textAlign:"center", padding:60, color: C.muted }}>
      <div style={{ fontSize:48, marginBottom:16 }}>👤</div>
      <div style={{ fontSize:18 }}>Selecione um paciente no Mapa CC</div>
      <div style={{ marginTop:24, display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
        {patients.filter(p=>p.faseAtual < 5).map(p=>(
          <button key={p.id} onClick={()=>onSelect(p)} style={{ background: C.primary, color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
            {p.id} — {p.procedimento.substring(0,25)}…
          </button>
        ))}
      </div>
    </div>
  );

  const pct = pctElapsed(patient);
  const pctColor = pct < 80 ? C.success : pct < 100 ? C.warning : C.danger;
  const canAdvance = ["CIRURGIAO","ANESTESISTA","ENFERMAGEM","GESTAO"].includes(userPerfil);

  const addIntercorrencia = () => {
    if (!intercorrenciaText.trim()) return;
    setEventos(ev=>[...ev, { ts: new Date(), texto: `⚠ Intercorrência: ${intercorrenciaText}`, resp: userPerfil }]);
    setIntercorrenciaText(""); setShowIntercorrencia(false);
    addToast("warning","Intercorrência Registrada",intercorrenciaText);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ margin:0, color: C.text, fontSize:22, fontWeight:800 }}>{patient.id} — {patient.procedimento}</h2>
          <p style={{ margin:"4px 0 0", color: C.muted }}>{patient.cirurgiao} · {patient.anestesista}</p>
        </div>
        <StatusPill status={(() => { const s=["PREPARANDO","PREPARANDO","ANESTESIA","EM CIRURGIA","SRPA","DISPONÍVEL"]; return s[patient.faseAtual]||"PREPARANDO"; })()} />
      </div>

      {/* Timeline */}
      <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20 }}>
        <h3 style={{ margin:"0 0 16px", fontSize:14, color: C.muted, textTransform:"uppercase", letterSpacing:1 }}>Jornada do Paciente</h3>
        <PhaseTimeline patient={patient} />
      </div>

      {/* Info grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px,1fr))", gap:12 }}>
        {[
          { l:"Código", v: patient.id },
          { l:"Cirurgião", v: patient.cirurgiao },
          { l:"Anestesista", v: patient.anestesista },
          { l:"Agendado", v: fmtTime(patient.agendado) },
          { l:"Início real", v: patient.inicioCirurgia ? fmtTime(patient.inicioCirurgia) : "—" },
          { l:"Término previsto", v: patient.inicioCirurgia ? fmtTime(new Date(patient.inicioCirurgia.getTime() + patient.estimadoMin*60000)) : "—" },
          { l:"Tempo decorrido", v: patient.inicioCirurgia ? fmtElapsed(patient.inicioCirurgia) : "—" },
          { l:"Estimado", v: `${patient.estimadoMin}min` },
        ].map(item=>(
          <div key={item.l} style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px" }}>
            <div style={{ fontSize:11, color: C.muted, textTransform:"uppercase", letterSpacing:0.8 }}>{item.l}</div>
            <div style={{ fontWeight:700, fontSize:14, color: C.text, marginTop:2 }}>{item.v}</div>
          </div>
        ))}
      </div>

      {/* Barra de progresso */}
      {patient.inicioCirurgia && (
        <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:13, fontWeight:600 }}>Progresso do tempo cirúrgico</span>
            <span style={{ fontSize:13, fontWeight:700, color: pctColor }}>{pct}%</span>
          </div>
          <div style={{ height:12, background: C.border, borderRadius:10, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${Math.min(pct,100)}%`, background: pctColor, borderRadius:10, transition:"width 1s" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:11, color: C.muted }}>
            <span>{fmtTime(patient.inicioCirurgia)}</span>
            <span>{fmtTime(new Date(patient.inicioCirurgia.getTime() + patient.estimadoMin*60000))}</span>
          </div>
        </div>
      )}

      {/* Alertas */}
      {patient.alertas.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {patient.alertas.map((a,i)=><AlertBanner key={i} type="danger" text={a} />)}
        </div>
      )}

      {/* Ações */}
      {canAdvance && (
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button onClick={()=>addToast("info","Fase avançada",`Paciente ${patient.id} movido para próxima fase`)} style={{ background: C.success, color:"#fff", border:"none", borderRadius:8, padding:"10px 18px", cursor:"pointer", fontWeight:700, fontSize:13 }}>✅ Avançar Fase</button>
          <button onClick={()=>setShowIntercorrencia(!showIntercorrencia)} style={{ background: C.warning, color:"#fff", border:"none", borderRadius:8, padding:"10px 18px", cursor:"pointer", fontWeight:700, fontSize:13 }}>⚠ Intercorrência</button>
          <button onClick={()=>addToast("info","Solicitação enviada","Vaga UTI solicitada para "+patient.id)} style={{ background: C.info, color:"#fff", border:"none", borderRadius:8, padding:"10px 18px", cursor:"pointer", fontWeight:700, fontSize:13 }}>🏥 Solicitar UTI</button>
          <button onClick={()=>addToast("danger","Cancelamento","Cirurgia cancelada para "+patient.id)} style={{ background: C.danger, color:"#fff", border:"none", borderRadius:8, padding:"10px 18px", cursor:"pointer", fontWeight:700, fontSize:13 }}>✕ Cancelar Cirurgia</button>
        </div>
      )}

      {showIntercorrencia && (
        <div style={{ background: C.surface, border:`1px solid ${C.warning}`, borderRadius:10, padding:16 }}>
          <textarea value={intercorrenciaText} onChange={e=>setIntercorrenciaText(e.target.value)} placeholder="Descreva a intercorrência..." rows={3} style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:10, fontFamily:"inherit", fontSize:14, resize:"vertical", boxSizing:"border-box" }} />
          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            <button onClick={addIntercorrencia} style={{ background: C.warning, color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", cursor:"pointer", fontWeight:700 }}>Registrar</button>
            <button onClick={()=>setShowIntercorrencia(false)} style={{ background: C.border, color: C.text, border:"none", borderRadius:8, padding:"8px 16px", cursor:"pointer" }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Histórico */}
      <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:16 }}>
        <h3 style={{ margin:"0 0 12px", fontSize:14, color: C.muted, textTransform:"uppercase", letterSpacing:1 }}>Histórico de Eventos</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {eventos.map((ev,i)=>(
            <div key={i} style={{ display:"flex", gap:12, padding:"8px 12px", background: C.bg, borderRadius:8, fontSize:13 }}>
              <span style={{ color: C.muted, whiteSpace:"nowrap" }}>{fmtTime(ev.ts)}</span>
              <span style={{ flex:1, color: C.text }}>{ev.texto}</span>
              <span style={{ color: C.muted, whiteSpace:"nowrap" }}>{ev.resp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CHECKLIST OMS ──────────────────────────────────────────────────────────
function ChecklistOMS({ userPerfil }) {
  const [items, setItems] = useState(CHECKLIST_ITEMS);
  const [activeSection, setActiveSection] = useState("signIn");
  const [anestesia, setAnestesia] = useState({ tecnica: "Geral", medicamentos: "Propofol 200mg, Fentanil 100mcg, Rocurônio 50mg", intercorrencias: "", reversao: false, aldrete: "" });

  const toggle = (section, id) => {
    setItems(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === id ? { ...item, checked: !item.checked, ts: !item.checked ? new Date() : null, resp: !item.checked ? userPerfil : "" } : item
      )
    }));
  };

  const sections = { signIn: "Sign In", timeOut: "Time Out", signOut: "Sign Out" };
  const totalItems = Object.values(items).flat().length;
  const checkedItems = Object.values(items).flat().filter(i=>i.checked).length;
  const pct = Math.round((checkedItems/totalItems)*100);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color: C.text }}>✅ Checklist Cirurgia Segura OMS</h2>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:14, fontWeight:700, color: pct===100 ? C.success : C.warning }}>{checkedItems}/{totalItems} itens ({pct}%)</span>
          <div style={{ width:120, height:8, background: C.border, borderRadius:10, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background: pct===100 ? C.success : C.warning, borderRadius:10 }} />
          </div>
        </div>
      </div>

      {/* Seleção de seção */}
      <div style={{ display:"flex", gap:4, background: C.bg, padding:4, borderRadius:10, width:"fit-content" }}>
        {Object.entries(sections).map(([key,label])=>(
          <button key={key} onClick={()=>setActiveSection(key)} style={{ padding:"8px 20px", border:"none", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13,
            background: activeSection===key ? C.primary : "transparent", color: activeSection===key ? "#fff" : C.muted, transition:"all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Items da seção */}
      <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {items[activeSection].map(item=>(
            <div key={item.id} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 14px",
              background: item.checked ? C.success+"08" : C.bg, borderRadius:8, border:`1px solid ${item.checked ? C.success+"33" : C.border}` }}>
              <input type="checkbox" checked={item.checked} onChange={()=>toggle(activeSection, item.id)}
                style={{ width:18, height:18, marginTop:2, cursor:"pointer", accentColor: C.success }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, color: C.text, fontWeight: item.checked ? 600 : 400, textDecoration: item.checked ? "none" : "none" }}>{item.texto}</div>
                {item.checked && <div style={{ fontSize:11, color: C.muted, marginTop:4 }}>
                  ✓ {fmtTime(item.ts)} · {item.resp}
                  {item.obs && ` · "${item.obs}"`}
                </div>}
              </div>
              {!item.checked && <span style={{ fontSize:11, color: C.warning, fontWeight:700 }}>PENDENTE</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Ficha Anestésica */}
      <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20 }}>
        <h3 style={{ margin:"0 0 16px", fontSize:16, fontWeight:700, color: C.text }}>💉 Ficha Anestésica Simplificada</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:14 }}>
          <div>
            <label style={{ fontSize:12, color: C.muted, fontWeight:600, display:"block", marginBottom:4 }}>TÉCNICA ANESTÉSICA</label>
            <select value={anestesia.tecnica} onChange={e=>setAnestesia(a=>({...a,tecnica:e.target.value}))}
              style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"inherit", fontSize:14 }}>
              <option>Geral</option><option>Regional</option><option>Sedação</option><option>Geral + Regional</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, color: C.muted, fontWeight:600, display:"block", marginBottom:4 }}>REVERSÃO DE BLOQUEIO</label>
            <div style={{ display:"flex", gap:12, marginTop:6 }}>
              {["Sim","Não"].map(v=>(
                <label key={v} style={{ display:"flex", gap:6, alignItems:"center", cursor:"pointer", fontSize:14 }}>
                  <input type="radio" checked={(anestesia.reversao?"Sim":"Não")===v} onChange={()=>setAnestesia(a=>({...a,reversao:v==="Sim"}))} />
                  {v}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, color: C.muted, fontWeight:600, display:"block", marginBottom:4 }}>ESCORE ALDRETE (SRPA ≥ 9)</label>
            <input value={anestesia.aldrete} onChange={e=>setAnestesia(a=>({...a,aldrete:e.target.value}))} placeholder="Ex: 9"
              style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"inherit", fontSize:14, boxSizing:"border-box" }} />
          </div>
        </div>
        <div style={{ marginTop:14 }}>
          <label style={{ fontSize:12, color: C.muted, fontWeight:600, display:"block", marginBottom:4 }}>MEDICAMENTOS UTILIZADOS</label>
          <textarea value={anestesia.medicamentos} onChange={e=>setAnestesia(a=>({...a,medicamentos:e.target.value}))} rows={2}
            style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"inherit", fontSize:14, resize:"vertical", boxSizing:"border-box" }} />
        </div>
        <div style={{ marginTop:10 }}>
          <label style={{ fontSize:12, color: C.muted, fontWeight:600, display:"block", marginBottom:4 }}>INTERCORRÊNCIAS ANESTÉSICAS</label>
          <textarea value={anestesia.intercorrencias} onChange={e=>setAnestesia(a=>({...a,intercorrencias:e.target.value}))} rows={2} placeholder="Nenhuma intercorrência registrada"
            style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"inherit", fontSize:14, resize:"vertical", boxSizing:"border-box" }} />
        </div>
      </div>
    </div>
  );
}

// ─── COMUNICAÇÃO ─────────────────────────────────────────────────────────────
function Comunicacao({ messages, setMessages, userPerfil, addToast }) {
  const [filtro, setFiltro] = useState("TODOS");
  const [filtroPrio, setFiltroPrio] = useState("TODAS");
  const [showNew, setShowNew] = useState(false);
  const [nova, setNova] = useState({ para:"UTI", tipo:"SOLICITAÇÃO", prio:"NORMAL", texto:"" });
  const setores = ["UTI","Clínica Cirúrgica","Regulação","Farmácia","Gestão","CC","Todos"];
  const tipos = ["TRANSFERÊNCIA","SOLICITAÇÃO","ALERTA","INSUMOS","RESPOSTA","LEITO"];
  const prios = ["ALTA","MÉDIA","NORMAL"];
  const prioColors = { ALTA: C.danger, MÉDIA: C.warning, NORMAL: C.muted };

  const filtrados = messages.filter(m =>
    (filtro==="TODOS" || m.de===filtro || m.para===filtro) &&
    (filtroPrio==="TODAS" || m.prio===filtroPrio)
  );

  const enviarMensagem = () => {
    if (!nova.texto.trim()) return;
    setMessages(msgs=>[{ id: Date.now(), de: userPerfil, ...nova, hora: new Date(), lido: false }, ...msgs]);
    setNova({ para:"UTI", tipo:"SOLICITAÇÃO", prio:"NORMAL", texto:"" });
    setShowNew(false);
    addToast("info","Mensagem enviada",`Enviado para ${nova.para}`);
  };

  const inp = { padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"inherit", fontSize:13 };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color: C.text }}>💬 Central de Comunicação</h2>
        <button onClick={()=>setShowNew(!showNew)} style={{ background: C.primary, color:"#fff", border:"none", borderRadius:8, padding:"10px 18px", cursor:"pointer", fontWeight:700 }}>+ Nova Mensagem</button>
      </div>

      {showNew && (
        <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20 }}>
          <h3 style={{ margin:"0 0 14px", fontSize:16 }}>Nova Mensagem</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px,1fr))", gap:10, marginBottom:10 }}>
            <div><label style={{ fontSize:11, color: C.muted, fontWeight:600, display:"block", marginBottom:4 }}>DESTINATÁRIO</label>
              <select style={{...inp, width:"100%"}} value={nova.para} onChange={e=>setNova(n=>({...n,para:e.target.value}))}>
                {setores.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={{ fontSize:11, color: C.muted, fontWeight:600, display:"block", marginBottom:4 }}>TIPO</label>
              <select style={{...inp, width:"100%"}} value={nova.tipo} onChange={e=>setNova(n=>({...n,tipo:e.target.value}))}>
                {tipos.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label style={{ fontSize:11, color: C.muted, fontWeight:600, display:"block", marginBottom:4 }}>PRIORIDADE</label>
              <select style={{...inp, width:"100%"}} value={nova.prio} onChange={e=>setNova(n=>({...n,prio:e.target.value}))}>
                {prios.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <textarea value={nova.texto} onChange={e=>setNova(n=>({...n,texto:e.target.value}))} placeholder="Texto da mensagem..." rows={3}
            style={{ width:"100%", padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"inherit", fontSize:14, resize:"vertical", boxSizing:"border-box" }} />
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <button onClick={enviarMensagem} style={{ background: C.primary, color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", cursor:"pointer", fontWeight:700 }}>Enviar</button>
            <button onClick={()=>setShowNew(false)} style={{ background: C.border, color: C.text, border:"none", borderRadius:8, padding:"8px 16px", cursor:"pointer" }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {["TODOS","CC","UTI","Regulação","Farmácia","Gestão"].map(s=>(
          <button key={s} onClick={()=>setFiltro(s)} style={{ padding:"6px 14px", border:`1px solid ${filtro===s ? C.primary : C.border}`,
            borderRadius:20, background: filtro===s ? C.primary : C.surface, color: filtro===s ? "#fff" : C.muted, cursor:"pointer", fontSize:12, fontWeight:600 }}>{s}</button>
        ))}
        <div style={{ width:1, background: C.border }} />
        {["TODAS","ALTA","MÉDIA","NORMAL"].map(p=>(
          <button key={p} onClick={()=>setFiltroPrio(p)} style={{ padding:"6px 14px", border:`1px solid ${filtroPrio===p ? prioColors[p]||C.primary : C.border}`,
            borderRadius:20, background: filtroPrio===p ? (prioColors[p]||C.primary)+"22" : C.surface, color: prioColors[p]||C.muted, cursor:"pointer", fontSize:12, fontWeight:600 }}>{p}</button>
        ))}
      </div>

      {/* Feed de mensagens */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtrados.map(msg=>{
          const pc = prioColors[msg.prio] || C.muted;
          return (
            <div key={msg.id} style={{ background: C.surface, border:`1px solid ${msg.lido ? C.border : pc+"55"}`, borderRadius:10, padding:"14px 16px",
              borderLeft:`4px solid ${pc}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, flexWrap:"wrap", gap:6 }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  <span style={{ fontWeight:700, color: C.text, fontSize:13 }}>{msg.de}</span>
                  <span style={{ color: C.muted, fontSize:12 }}>→</span>
                  <span style={{ fontWeight:600, color: C.primary, fontSize:13 }}>{msg.para}</span>
                  <span style={{ background: pc+"22", color: pc, border:`1px solid ${pc}55`, borderRadius:10, padding:"1px 8px", fontSize:11, fontWeight:700 }}>{msg.tipo}</span>
                  {!msg.lido && <span style={{ background: C.danger, color:"#fff", borderRadius:10, padding:"1px 8px", fontSize:10, fontWeight:700 }}>NOVO</span>}
                </div>
                <span style={{ fontSize:11, color: C.muted }}>{fmtTime(msg.hora)}</span>
              </div>
              <p style={{ margin:0, fontSize:14, color: C.text, lineHeight:1.5 }}>{msg.texto}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PAINEL ACOMPANHANTES ───────────────────────────────────────────────────
function PainelAcompanhantes({ patients }) {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState("");
  const [lang, setLang] = useState("PT");
  const [altoContraste, setAltoContraste] = useState(false);
  const t = TRANSLATIONS[lang];
  const bg = altoContraste ? "#000" : "#f8faff";
  const textCol = altoContraste ? "#fff" : C.text;
  const cardBg = altoContraste ? "#111" : "#fff";

  const buscar = () => {
    if (!codigo.trim()) return;
    setBuscando(true); setErro(""); setResultado(null);
    setTimeout(()=>{
      const pat = patients.find(p=>p.id.toUpperCase()===codigo.trim().toUpperCase());
      if (pat) setResultado(pat); else setErro(t.notFound);
      setBuscando(false);
    }, 700);
  };

  const faseLabels = [t.fase0, t.fase1, t.fase2, t.fase3, t.fase4, t.fase5];

  return (
    <div style={{ minHeight:"70vh", background: bg, padding:24, borderRadius:12, transition:"all 0.3s" }}>
      {/* Controles acessibilidade */}
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginBottom:20, flexWrap:"wrap" }}>
        {["PT","EN","ES"].map(l=>(
          <button key={l} onClick={()=>setLang(l)} style={{ padding:"6px 14px", border:`2px solid ${lang===l ? C.primary : C.border}`,
            borderRadius:20, background: lang===l ? C.primary : cardBg, color: lang===l ? "#fff" : textCol, cursor:"pointer", fontWeight:700, fontSize:14 }}>{l}</button>
        ))}
        <button onClick={()=>setAltoContraste(!altoContraste)} style={{ padding:"6px 14px", border:`2px solid ${C.primary}`,
          borderRadius:20, background: altoContraste ? C.primary : cardBg, color: altoContraste ? "#fff" : C.primary, cursor:"pointer", fontWeight:700, fontSize:14 }}>
          {altoContraste ? "☀ Normal" : "🌙 Alto Contraste"}
        </button>
      </div>

      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ fontSize:48 }}>🏥</div>
        <h1 style={{ fontSize:28, fontWeight:800, color: textCol, margin:"8px 0 4px" }}>{t.title}</h1>
        <p style={{ color: altoContraste ? "#aaa" : C.muted, fontSize:17, margin:0 }}>Centro Cirúrgico · HUB-UnB</p>
      </div>

      {/* Campo de busca */}
      <div style={{ maxWidth:480, margin:"0 auto 28px", display:"flex", gap:10 }}>
        <input value={codigo} onChange={e=>setCodigo(e.target.value)} onKeyDown={e=>e.key==="Enter"&&buscar()}
          placeholder={t.search} style={{ flex:1, padding:"14px 18px", fontSize:17, border:`2px solid ${C.border}`, borderRadius:10, fontFamily:"inherit", outline:"none", background: cardBg, color: textCol }} />
        <button onClick={buscar} style={{ padding:"14px 24px", background: C.primary, color:"#fff", border:"none", borderRadius:10, fontSize:17, fontWeight:700, cursor:"pointer" }}>
          {buscando ? "⏳" : t.searchBtn}
        </button>
      </div>

      {/* Legenda */}
      <div style={{ maxWidth:600, margin:"0 auto 24px", display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
        {faseLabels.map((f,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background: cardBg, border:`1px solid ${C.border}`, borderRadius:20, fontSize:14 }}>
            <span>{FASE_ICONS[i]}</span><span style={{ color: textCol }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Resultado */}
      {erro && <div style={{ maxWidth:480, margin:"0 auto", padding:"16px 20px", background:"#fee", border:`1px solid ${C.danger}`, borderRadius:10, color: C.danger, fontSize:16, textAlign:"center" }}>{erro}</div>}

      {resultado && (
        <div style={{ maxWidth:560, margin:"0 auto", background: cardBg, border:`2px solid ${C.success}`, borderRadius:16, padding:28, boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <span style={{ fontSize:48 }}>{FASE_ICONS[resultado.faseAtual]}</span>
            <div style={{ fontSize:22, fontWeight:800, color: textCol, marginTop:8 }}>
              {faseLabels[resultado.faseAtual]}
            </div>
            <div style={{ fontSize:14, color: altoContraste ? "#aaa" : C.muted, marginTop:4 }}>{t.status}: {resultado.id}</div>
          </div>

          {/* Progresso fases */}
          <div style={{ display:"flex", gap:4, marginBottom:20, alignItems:"center" }}>
            {[0,1,2,3,4,5].map(i=>(
              <div key={i} style={{ flex:1, height:10, borderRadius:10,
                background: i <= resultado.faseAtual ? (i===resultado.faseAtual ? C.info : C.success) : C.border }} />
            ))}
          </div>

          {resultado.inicioCirurgia && (
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:15, color: altoContraste ? "#aaa" : C.muted }}>{t.updated}: {fmtTime(new Date())}</div>
              <div style={{ fontSize:15, color: altoContraste ? "#aaa" : C.muted, marginTop:4 }}>
                Previsão de conclusão: {fmtTime(new Date(resultado.inicioCirurgia.getTime() + resultado.estimadoMin*60000))}
              </div>
            </div>
          )}

          <div style={{ background: altoContraste ? "#222" : "#f0f9f4", border:`1px solid ${C.success}33`, borderRadius:10, padding:"12px 16px", textAlign:"center", fontSize:15, color: altoContraste ? "#aaa" : C.muted }}>
            ℹ {t.info}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ANALYTICS ──────────────────────────────────────────────────────────────
function Analytics({ addToast }) {
  const [showPredModal, setShowPredModal] = useState(false);

  const getTurnoverColor = (min) => min > 25 ? C.danger : C.info;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <h2 style={{ margin:0, fontSize:20, fontWeight:700, color: C.text }}>📊 Analytics & Indicadores</h2>

      {/* KPI Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px,1fr))", gap:14 }}>
        <KPICard icon="🏥" label="Ocupação média hoje" value="87%" delta="↑5% vs ontem" up={true} />
        <KPICard icon="⏱" label="Turnover médio" value="24 min" delta="↓2min vs semana" up={true} />
        <KPICard icon="❌" label="Cancelamentos semana" value="6" delta="↓4 vs sem. ant." up={true} />
        <KPICard icon="✅" label="Aderência OMS" value="94%" delta="↑2% vs mês" up={true} />
        <KPICard icon="🕐" label="Cirurgias no horário" value="71%" delta="↓3% vs semana" up={false} />
        <KPICard icon="🛌" label="Tempo médio SRPA" value="1h12m" delta="Dentro do SLA" up={true} />
      </div>

      {/* Gráfico 1 — Ocupação 7 dias */}
      <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20 }}>
        <h3 style={{ margin:"0 0 16px", fontSize:15, fontWeight:700, color: C.text }}>Ocupação Diária — Últimos 7 Dias (%)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={ANALYTICS_DATA.ocupacao7d}>
            <XAxis dataKey="dia" tick={{ fontSize:12 }} />
            <YAxis domain={[0,100]} tick={{ fontSize:12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="valor" stroke={C.primary} strokeWidth={2.5} dot={{ fill: C.primary, r:4 }} name="Ocupação %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráficos 2 e 3 em grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px,1fr))", gap:16 }}>
        <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20 }}>
          <h3 style={{ margin:"0 0 16px", fontSize:15, fontWeight:700, color: C.text }}>Turnover por Sala (min)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ANALYTICS_DATA.turnoverSalas} layout="vertical">
              <XAxis type="number" tick={{ fontSize:11 }} />
              <YAxis dataKey="sala" type="category" tick={{ fontSize:10 }} width={55} />
              <Tooltip />
              <Bar dataKey="min" name="Minutos">
                {ANALYTICS_DATA.turnoverSalas.map((entry,i)=>(
                  <Cell key={i} fill={getTurnoverColor(entry.min)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20 }}>
          <h3 style={{ margin:"0 0 16px", fontSize:15, fontWeight:700, color: C.text }}>Cirurgias — Planejado vs. Realizado</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ANALYTICS_DATA.cirurgiasSemana}>
              <XAxis dataKey="dia" tick={{ fontSize:12 }} />
              <YAxis tick={{ fontSize:12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="plan" stroke={C.border} fill={C.border} name="Planejado" />
              <Area type="monotone" dataKey="real" stroke={C.primary} fill={C.primary+"33"} name="Realizado" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 4 — Tempo por especialidade */}
      <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20 }}>
        <h3 style={{ margin:"0 0 16px", fontSize:15, fontWeight:700, color: C.text }}>Tempo Médio de Cirurgia por Especialidade (min)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={ANALYTICS_DATA.tempoEspecialidade} layout="vertical">
            <XAxis type="number" tick={{ fontSize:11 }} />
            <YAxis dataKey="esp" type="category" tick={{ fontSize:11 }} width={120} />
            <Tooltip />
            <Bar dataKey="min" fill={C.info} name="Minutos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Predição IA */}
      <div style={{ background: C.surface, border:`2px solid ${C.warning}`, borderRadius:10, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:12 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700, color: C.text }}>🤖 Predição IA — Risco de Atraso em Cascata</h3>
          <button onClick={()=>setShowPredModal(!showPredModal)} style={{ background: C.warning, color:"#fff", border:"none", borderRadius:8, padding:"7px 16px", cursor:"pointer", fontWeight:700, fontSize:13 }}>
            {showPredModal ? "Fechar" : "Ver Detalhes"}
          </button>
        </div>
        <p style={{ margin:"0 0 16px", fontSize:14, color: C.muted }}>
          Modelo detectou atraso de 14% na Sala 03 (Craniotomia Descompressiva). O impacto propagado afeta o escalonamento das Salas 04 e 07, que aguardam o SRPA para admissão de novos pacientes.
        </p>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {[
            { sala:"Sala 03", desc:"Atraso ativo — +18 min", type: C.danger },
            { sala:"Sala 04", desc:"Risco de atraso — ~12 min", type: C.warning },
            { sala:"Sala 07", desc:"Risco de atraso — ~25 min", type: C.warning },
          ].map(item=>(
            <div key={item.sala} style={{ background: item.type+"11", border:`1px solid ${item.type}55`, borderRadius:8, padding:"10px 16px", minWidth:150 }}>
              <div style={{ fontWeight:700, color: item.type, fontSize:15 }}>{item.sala}</div>
              <div style={{ color: C.muted, fontSize:12, marginTop:4 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {showPredModal && (
          <div style={{ marginTop:16, background: C.bg, borderRadius:8, padding:16, fontSize:13, color: C.text }}>
            <b>Análise detalhada:</b><br/><br/>
            • Sala 03 iniciou procedimento 26 min após o agendado devido a delay de entrada na UTI.<br/>
            • A Craniotomia Descompressiva está 18 min além da estimativa de 130 min.<br/>
            • SRPA operando a 100% de capacidade — sem leitos disponíveis para alta da Sala 03.<br/>
            • Sala 04 (Histerectomia) aguarda paciente que ocupa leito SRPA.<br/>
            • Sala 07 tem procedimento agendado para 13:00 — risco alto de atraso.<br/><br/>
            <b>Recomendação IA:</b> Solicitar alta antecipada de 2 pacientes SRPA com Aldrete ≥ 9 para absorver o backlog.
          </div>
        )}
      </div>

      {/* Exportação */}
      <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20 }}>
        <h3 style={{ margin:"0 0 14px", fontSize:15, fontWeight:700 }}>📁 Exportar Relatórios</h3>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {["📊 Exportar CSV","📄 Exportar PDF","📅 Agendar Relatório"].map(label=>(
            <button key={label} onClick={()=>addToast("info","Exportação",`${label.replace(/^[^ ]+ /,"")} solicitado. Disponível em instantes.`)}
              style={{ background: C.bg, color: C.primary, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 18px", cursor:"pointer", fontWeight:700, fontSize:13 }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CONFIGURAÇÕES ───────────────────────────────────────────────────────────
function Configuracoes() {
  const [sla, setSla] = useState({ turnover:25, uti:60, desvio:15, srpa:100 });
  const integracoes = [
    { nome:"AGHU (Prontuário)", status:"ok", msg:"Conectado — última sync 11:58" },
    { nome:"INTEGRA (Ebserh)", status:"ok", msg:"Conectado — última sync 11:55" },
    { nome:"Regulação de Leitos", status:"warn", msg:"Instável — 3 tentativas" },
    { nome:"Active Directory", status:"ok", msg:"Conectado" },
    { nome:"HL7 FHIR Endpoint", status:"ok", msg:"Operacional" },
  ];
  const inp = { padding:"8px 10px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:"inherit", fontSize:14, width:80 };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <h2 style={{ margin:0, fontSize:20, fontWeight:700, color: C.text }}>⚙ Configurações — Gestão</h2>

      {/* SLA */}
      <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20 }}>
        <h3 style={{ margin:"0 0 16px", fontSize:16, fontWeight:700 }}>Limites de SLA</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:16 }}>
          {[
            { key:"turnover", label:"Turnover máximo (min)" },
            { key:"uti", label:"Aguardo UTI máximo (min)" },
            { key:"desvio", label:"Desvio tempo cirúrgico (%)" },
            { key:"srpa", label:"Ocupação máxima SRPA (%)" },
          ].map(item=>(
            <div key={item.key}>
              <label style={{ fontSize:12, color: C.muted, fontWeight:600, display:"block", marginBottom:6 }}>{item.label.toUpperCase()}</label>
              <input type="number" style={inp} value={sla[item.key]} onChange={e=>setSla(s=>({...s,[item.key]:e.target.value}))} />
            </div>
          ))}
        </div>
        <button style={{ marginTop:16, background: C.primary, color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", cursor:"pointer", fontWeight:700 }}
          onClick={()=>alert("Configurações salvas!")}>Salvar Configurações</button>
      </div>

      {/* Integrações */}
      <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20 }}>
        <h3 style={{ margin:"0 0 16px", fontSize:16, fontWeight:700 }}>Status das Integrações</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {integracoes.map(integ=>(
            <div key={integ.nome} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px",
              background: C.bg, borderRadius:8, flexWrap:"wrap", gap:8 }}>
              <span style={{ fontWeight:600, fontSize:14 }}>{integ.nome}</span>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:14 }}>{integ.status==="ok" ? "🟢" : "🟡"}</span>
                <span style={{ fontSize:13, color: C.muted }}>{integ.msg}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usuários */}
      <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20 }}>
        <h3 style={{ margin:"0 0 16px", fontSize:16, fontWeight:700 }}>Gestão de Perfis</h3>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {["Nome","Perfil","Setor","Status"].map(h=>(
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", color: C.muted, fontWeight:700, fontSize:12, textTransform:"uppercase", borderBottom:`1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {USERS_TABLE.map((u,i)=>(
                <tr key={i} style={{ borderBottom:`1px solid ${C.border}` }}>
                  <td style={{ padding:"10px 14px", fontWeight:600 }}>{u.nome}</td>
                  <td style={{ padding:"10px 14px" }}><span style={{ background: C.primary+"15", color: C.primary, borderRadius:10, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{u.perfil}</span></td>
                  <td style={{ padding:"10px 14px", color: C.muted }}>{u.setor}</td>
                  <td style={{ padding:"10px 14px" }}><span style={{ color: u.ativo ? C.success : C.danger, fontWeight:700 }}>{u.ativo ? "● Ativo" : "● Inativo"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPerfil, setUserPerfil] = useState("ENFERMAGEM");
  const [activeTab, setActiveTab] = useState("mapa");
  const [rooms] = useState(INITIAL_ROOMS);
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [clock, setClock] = useState(new Date());
  const [showAlertPanel, setShowAlertPanel] = useState(false);

  // Relógio ao vivo
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Toast automático inicial
  useEffect(() => {
    if (loggedIn) {
      setTimeout(() => addToast("danger", "UTI — Urgente", "CC-002 aguarda vaga há 52 min"), 1500);
      setTimeout(() => addToast("warning", "Predição IA", "Risco de atraso cascata — Salas 04 e 07"), 4000);
    }
  }, [loggedIn]);

  const addToast = (type, title, message) => {
    const id = Date.now();
    setToasts(ts => [...ts, { id, type, title, message }]);
  };
  const removeToast = (id) => setToasts(ts => ts.filter(t => t.id !== id));

  const activeAlerts = alerts.filter(a => !a.resolvido);
  const unreadMessages = messages.filter(m => !m.lido).length;
  const activeSalas = rooms.filter(r => r.status === "EM CIRURGIA" || r.status === "ANESTESIA").length;

  // Abas disponíveis por perfil
  const allTabs = [
    { id:"mapa",          label:"🗺 Mapa CC",          perfis:["CIRURGIAO","ANESTESISTA","ENFERMAGEM","GESTAO","REGULACAO"] },
    { id:"paciente",      label:"👤 Paciente",         perfis:["CIRURGIAO","ANESTESISTA","ENFERMAGEM","GESTAO"] },
    { id:"checklist",     label:"✅ Checklist",        perfis:["CIRURGIAO","ANESTESISTA","ENFERMAGEM","GESTAO"] },
    { id:"comunicacao",   label:"💬 Comunicação",      perfis:["CIRURGIAO","ANESTESISTA","ENFERMAGEM","GESTAO","REGULACAO"] },
    { id:"acompanhantes", label:"👨‍👩‍👧 Acompanhantes",  perfis:["ENFERMAGEM","GESTAO","ACOMPANHANTE"] },
    { id:"analytics",     label:"📊 Analytics",        perfis:["GESTAO"] },
    { id:"config",        label:"⚙ Configurações",     perfis:["GESTAO"] },
  ];

  const tabs = userPerfil === "ACOMPANHANTE"
    ? [{ id:"acompanhantes", label:"👨‍👩‍👧 Painel Público", perfis:["ACOMPANHANTE"] }]
    : allTabs.filter(t => t.perfis.includes(userPerfil));

  if (!loggedIn) return <LoginScreen onLogin={(u,p) => { setUserName(u||"Usuário"); setUserPerfil(p); setLoggedIn(true); }} />;

  const headerH = { display:"flex", alignItems:"center" };

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background: C.bg, minHeight:"100vh", color: C.text }}>
      {/* CSS keyframes via style tag workaround */}
      <style>{`@keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0.4)} 50%{box-shadow:0 0 0 8px rgba(37,99,235,0)} }`}</style>

      {/* HEADER */}
      <header style={{ background: C.primary, color:"#fff", padding:"0 20px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", flexDirection:"column", lineHeight:1.2 }}>
          <span style={{ fontWeight:800, fontSize:16 }}>CirurFlow · HUB-UnB</span>
          <span style={{ fontSize:11, opacity:0.7 }}>Centro Cirúrgico — {activeSalas} salas ativas</span>
        </div>
        <div style={{ fontSize:18, fontWeight:700, fontVariantNumeric:"tabular-nums", letterSpacing:2 }}>
          {fmtClock(clock)}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={()=>setShowAlertPanel(!showAlertPanel)} style={{ position:"relative", background:"transparent", border:"none", cursor:"pointer", padding:4 }}>
            <span style={{ fontSize:20 }}>🔔</span>
            {activeAlerts.length > 0 && (
              <span style={{ position:"absolute", top:-2, right:-4, background: C.danger, color:"#fff", borderRadius:"50%", width:18, height:18, fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {activeAlerts.length}
              </span>
            )}
          </button>
          <div style={{ fontSize:13, opacity:0.9, textAlign:"right" }}>
            <div style={{ fontWeight:700 }}>{userName}</div>
            <div style={{ fontSize:10, opacity:0.7, background:"rgba(255,255,255,0.15)", borderRadius:10, padding:"1px 8px" }}>{userPerfil}</div>
          </div>
          <button onClick={()=>setLoggedIn(false)} style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", color:"#fff", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:12, fontWeight:700 }}>Sair</button>
        </div>
      </header>

      {/* Painel de Alertas */}
      {showAlertPanel && (
        <div style={{ position:"fixed", top:60, right:0, width:340, background: C.surface, border:`1px solid ${C.border}`, borderRadius:"0 0 0 12px", zIndex:200, boxShadow:"-4px 4px 20px rgba(0,0,0,0.12)", padding:20, maxHeight:"80vh", overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>Central de Alertas</h3>
            <button onClick={()=>setShowAlertPanel(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color: C.muted }}>×</button>
          </div>
          {activeAlerts.map(al=>{
            const col = { danger: C.danger, warning: C.warning, info: C.info }[al.tipo] || C.muted;
            return (
              <div key={al.id} style={{ border:`1px solid ${col}44`, borderLeft:`4px solid ${col}`, borderRadius:8, padding:"10px 12px", marginBottom:10, background: col+"08" }}>
                <div style={{ fontWeight:700, color: col, fontSize:13 }}>{al.titulo}</div>
                <div style={{ fontSize:12, color: C.muted, marginTop:4 }}>{al.desc}</div>
                <button onClick={()=>setAlerts(ats=>ats.map(a=>a.id===al.id?{...a,resolvido:true}:a))}
                  style={{ marginTop:8, background:"none", border:`1px solid ${col}`, color: col, borderRadius:6, padding:"3px 10px", cursor:"pointer", fontSize:11, fontWeight:700 }}>
                  Marcar resolvido
                </button>
              </div>
            );
          })}
          {activeAlerts.length===0 && <p style={{ color: C.muted, textAlign:"center" }}>Nenhum alerta ativo</p>}
        </div>
      )}

      {/* NAVEGAÇÃO */}
      <nav style={{ background: C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 20px", display:"flex", overflowX:"auto", position:"sticky", top:60, zIndex:90 }}>
        {tabs.map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ padding:"14px 18px", border:"none", background:"transparent", cursor:"pointer",
            fontWeight: activeTab===tab.id ? 700 : 500, fontSize:13, color: activeTab===tab.id ? C.primary : C.muted, whiteSpace:"nowrap",
            borderBottom: activeTab===tab.id ? `3px solid ${C.primary}` : "3px solid transparent", transition:"all 0.2s" }}>
            {tab.id==="comunicacao" && unreadMessages>0
              ? <>{tab.label} <span style={{ background: C.danger, color:"#fff", borderRadius:10, padding:"0 6px", fontSize:10, fontWeight:800 }}>{unreadMessages}</span></>
              : tab.label}
          </button>
        ))}
      </nav>

      {/* CONTEÚDO */}
      <main style={{ padding:24, maxWidth:1400, margin:"0 auto" }}>
        {activeTab==="mapa"          && <MapaCC rooms={rooms} patients={patients} onSelectPatient={setSelectedPatient} setActiveTab={setActiveTab} userPerfil={userPerfil} />}
        {activeTab==="paciente"      && <DetalhePaciente patient={selectedPatient} patients={patients} onSelect={setSelectedPatient} userPerfil={userPerfil} addToast={addToast} rooms={rooms} />}
        {activeTab==="checklist"     && <ChecklistOMS userPerfil={userPerfil} />}
        {activeTab==="comunicacao"   && <Comunicacao messages={messages} setMessages={setMessages} userPerfil={userPerfil} addToast={addToast} />}
        {activeTab==="acompanhantes" && <PainelAcompanhantes patients={patients} />}
        {activeTab==="analytics"     && <Analytics addToast={addToast} />}
        {activeTab==="config"        && <Configuracoes />}
      </main>

      {/* TOAST NOTIFICATIONS */}
      <div style={{ position:"fixed", bottom:20, right:20, display:"flex", flexDirection:"column", gap:10, zIndex:300 }}>
        {toasts.map(toast=>(
          <ToastNotification key={toast.id} type={toast.type} title={toast.title} message={toast.message} onClose={()=>removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
}
