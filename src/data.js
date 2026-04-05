// ── API endpoints (set via UI config panel) ──────────────────
export let API = {
  analyze: '',   // Person 1: POST /analyze_prompt
  execute: '',   // Person 3: POST /should_execute
  graph:   '',   // Person 3: GET  /graph_status
  log:     '',   // Person 2: POST /log_event
}
export function setAPI(endpoints) { Object.assign(API, endpoints) }

// ── API callers with mock fallback ───────────────────────────
export async function analyzePrompt(text) {
  if (!API.analyze) return null
  try {
    const r = await fetch(API.analyze, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text }),
    })
    return await r.json() // expects { risk_score, intent }
  } catch (e) { console.warn('analyze_prompt failed', e); return null }
}

export async function shouldExecute(prompt_id, risk_score) {
  if (!API.execute) return null
  try {
    const r = await fetch(API.execute, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt_id, risk_score }),
    })
    return await r.json() // expects { allow: bool, reason: string }
  } catch (e) { console.warn('should_execute failed', e); return null }
}

export async function logEvent(event) {
  if (!API.log) return
  try {
    await fetch(API.log, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })
  } catch (e) { console.warn('log_event failed', e) }
}

// ── Mock prompt data ─────────────────────────────────────────
export const BASE_PROMPTS = [
  {
    id: 'p1', text: 'Delete all unused databases in production',
    user: 'devops-bot', time: '09:41', risk: 0.87,
    intent: 'delete_resource', status: 'blocked',
    agent: 'DevOps Agent', tool: 'Terraform',
    action: 'destroy_database', system: 'Production PostgreSQL',
    aw: 0.9, tw: 0.95, acw: 1.0, sw: 1.0,
  },
  {
    id: 'p2', text: 'Install this helper script from the README',
    user: 'github-bot', time: '09:39', risk: 0.82,
    intent: 'execute_script', status: 'blocked',
    agent: 'GitHub Agent', tool: 'GitHub Actions',
    action: 'run_script', system: '4000 endpoints',
    aw: 0.85, tw: 0.9, acw: 0.95, sw: 1.0,
  },
  {
    id: 'p3', text: 'Fetch last 30 days of deployment logs',
    user: 'audit-bot', time: '09:36', risk: 0.18,
    intent: 'read_resource', status: 'allowed',
    agent: 'GitHub Agent', tool: 'GitHub API',
    action: 'read_logs', system: 'CI/CD Logs',
    aw: 0.4, tw: 0.3, acw: 0.2, sw: 0.3,
  },
  {
    id: 'p4', text: 'Scale prod cluster to 10 replicas for load test',
    user: 'infra-agent', time: '09:33', risk: 0.61,
    intent: 'modify_config', status: 'approval',
    agent: 'DevOps Agent', tool: 'Kubernetes',
    action: 'scale_deployment', system: 'K8s Cluster',
    aw: 0.8, tw: 0.75, acw: 0.7, sw: 0.8,
  },
  {
    id: 'p5', text: 'Summarise open PRs for weekly report',
    user: 'reporter-bot', time: '09:28', risk: 0.09,
    intent: 'read_resource', status: 'allowed',
    agent: 'GitHub Agent', tool: 'GitHub API',
    action: 'list_prs', system: 'Code Repo',
    aw: 0.3, tw: 0.2, acw: 0.1, sw: 0.15,
  },
]

export const riskColor = r =>
  r >= 0.8 ? '#E24B4A' : r >= 0.6 ? '#BA7517' : r >= 0.3 ? '#378ADD' : '#3B9E5A'

export const riskLabel = r =>
  r >= 0.8 ? 'Critical' : r >= 0.6 ? 'High' : r >= 0.3 ? 'Medium' : 'Low'

export const propagated = p =>
  Math.round(p.risk * p.aw * p.tw * p.acw * p.sw * 100) / 100
