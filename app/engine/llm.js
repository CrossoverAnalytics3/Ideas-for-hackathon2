// One place that talks to Claude. Everything else stays deterministic.
//
// MOCK=1 (or no credentials) switches every call to scripted, offline
// behaviour so the whole product runs with zero keys. That is also the
// hardcoded fallback the demo video needs if the network hiccups on camera.

'use strict';
const Anthropic = require('@anthropic-ai/sdk');

const MODEL = process.env.MODEL || 'claude-opus-5';
const MOCK = process.env.MOCK === '1';
let client = null;

function live() {
  if (MOCK) return false;
  if (!client) {
    try { client = new Anthropic(); } catch (e) { console.warn('[llm] no client:', e.message); return false; }
  }
  return true;
}

// Structured JSON call. `schema` is a JSON schema; returns the parsed object.
async function json({ system, content, schema, effort = 'medium', maxTokens = 2000 }) {
  const params = {
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content }],
    output_config: { effort, format: { type: 'json_schema', schema } },
  };
  const res = await callWithFallback(params);
  if (res.stop_reason === 'refusal') throw new Error('model refused');
  const text = res.content.filter(b => b.type === 'text').map(b => b.text).join('');
  return JSON.parse(text);
}

// Plain text call.
async function text({ system, messages, effort = 'low', maxTokens = 400 }) {
  const params = { model: MODEL, max_tokens: maxTokens, system, messages, output_config: { effort } };
  const res = await callWithFallback(params);
  if (res.stop_reason === 'refusal') throw new Error('model refused');
  return res.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
}

// Server-side refusal fallbacks are on by default for opus-5 / fable-5-1.
// Set NO_FALLBACKS=1 to send a plain request instead.
async function callWithFallback(params) {
  if (process.env.NO_FALLBACKS === '1') return client.messages.create(params);
  try {
    return await client.beta.messages.create({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' });
  } catch (e) {
    if (e instanceof Anthropic.BadRequestError) return client.messages.create(params);
    throw e;
  }
}

module.exports = { json, text, live, MODEL, MOCK };
