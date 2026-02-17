/* ─────────────────── TYPES ─────────────────── */

export type Project = {
  name: string
  symbol: string
  color: string
  ceo: string
  title: string
  avatar: string
  logo: string
  photo: string
}

export type ChatMessage = {
  role: 'user' | 'ai'
  text: string
  source?: string
}

export type Feature = {
  icon: string
  title: string
  desc: string
  size: string
}

export type AmaPhase = {
  phase: string
  label: string
  color: string
  desc: string
}

/* ─────────────────── DATA ─────────────────── */

export const projects: Project[] = [
  { name: 'Ethereum', symbol: 'ETH', color: '#627EEA', ceo: 'Vitalik Buterin', title: 'Co-Founder', avatar: 'VB', logo: '/logos/eth.png', photo: '/logos/people/vitalik.webp' },
  { name: 'Uniswap', symbol: 'UNI', color: '#FF007A', ceo: 'Hayden Adams', title: 'Founder & CEO', avatar: 'HA', logo: '/logos/uni.png', photo: '/logos/people/hayden.webp' },
  { name: 'Aave', symbol: 'AAVE', color: '#B6509E', ceo: 'Stani Kulechov', title: 'Founder & CEO', avatar: 'SK', logo: '/logos/aave.png', photo: '/logos/people/stani.webp' },
  { name: 'Arbitrum', symbol: 'ARB', color: '#28A0F0', ceo: 'Steven Goldfeder', title: 'Co-Founder & CEO', avatar: 'SG', logo: '/logos/arb.png', photo: '/logos/people/steven.webp' },
  { name: 'Chainlink', symbol: 'LINK', color: '#375BD2', ceo: 'Sergey Nazarov', title: 'Co-Founder', avatar: 'SN', logo: '/logos/link.png', photo: '/logos/people/sergey.webp' },
  { name: 'EigenLayer', symbol: 'EIGEN', color: '#1E0555', ceo: 'Sreeram Kannan', title: 'Founder', avatar: 'SK', logo: '/logos/eigen.png', photo: '/logos/people/sreeram.webp' },
]

export const uniswapChat: ChatMessage[] = [
  { role: 'user', text: 'What makes Uniswap v4 Hooks different from v3?' },
  { role: 'ai', text: 'Hooks are smart contracts attached to individual pools that execute custom logic at key points — before/after swaps, liquidity changes. This enables native limit orders, dynamic fees, and on-chain oracles.', source: 'Uniswap v4 Whitepaper, Section 3.2' },
  { role: 'user', text: 'How does this benefit regular users?' },
  { role: 'ai', text: 'Lower gas costs through singleton architecture, customizable fee tiers per pool, and access to TWAP oracles and limit orders natively — all without leaving Uniswap.', source: 'Hayden Adams, ETHDenver Talk' },
]

export const arbitrumChat: ChatMessage[] = [
  { role: 'user', text: 'How does Arbitrum Stylus change smart contract development?' },
  { role: 'ai', text: 'Stylus lets developers write smart contracts in Rust, C, and C++ alongside Solidity. It compiles to WASM, achieving 10-100x computational savings while maintaining full EVM interoperability.', source: 'Arbitrum Stylus Documentation' },
  { role: 'user', text: 'Is it compatible with existing Ethereum tooling?' },
  { role: 'ai', text: "Yes — Stylus contracts can call and be called by Solidity contracts seamlessly. Existing Ethereum tooling works as-is. It's additive, not a replacement.", source: 'Steven Goldfeder, ETHGlobal Talk' },
]

export const features: Feature[] = [
  { icon: '01', title: 'RAG-Powered Answers', desc: 'Whitepaper, docs, AMA, blog — all official sources chunked, embedded, and retrieved in real-time. Every answer cites its source.', size: 'large' },
  { icon: '02', title: 'CEO Persona', desc: "AI speaks in the founder's voice and perspective. Trained on interviews, Twitter threads, and conference talks.", size: 'small' },
  { icon: '03', title: 'Token-Gated Access', desc: 'Privy wallet auth with token/NFT gating. Reward holders with exclusive access and premium features.', size: 'small' },
  { icon: '04', title: 'Global by Default', desc: "50+ languages. AI detects and responds in the user's language automatically. No translation team needed.", size: 'medium' },
  { icon: '05', title: 'Community Intelligence', desc: 'Real-time dashboard showing question trends, sentiment analysis, unanswered issues, and regional activity.', size: 'medium' },
  { icon: '06', title: 'Embed Everywhere', desc: 'Drop a widget on your website, connect to Discord and Telegram. Your AI goes where your community lives.', size: 'large' },
]

export const amaPhases: AmaPhase[] = [
  { phase: 'Before', label: 'Pre-AMA', color: '#7C3AED', desc: 'Community submits questions. AI provides preliminary answers from existing knowledge. Token-weighted voting surfaces top questions.' },
  { phase: 'During', label: 'Live AMA', color: '#F43F5E', desc: "CEO answers top-voted questions. Every response is instantly added to the AI's knowledge base. AI handles overflow Q&A in parallel." },
  { phase: 'After', label: 'Post-AMA', color: '#10B981', desc: 'The AMA never ends. AI continues answering with all CEO responses included. New questions get answered using AMA context. Forever.' },
]
