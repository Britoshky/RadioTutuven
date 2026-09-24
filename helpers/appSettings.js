const Setting = require("../models/Setting");

const CACHE_TTL_MS = 60_000;
let cache = { at: 0, data: null };

const DEFAULTS = {
  smtp: {
    host: "",
    port: 465,
    secure: true,
    user: "",
    pass: "",
    from: "",
    to: "",
    debug: false,
    rejectUnauthorized: true,
  },
  recaptcha: {
    siteKey: "",
    secretKey: "",
  },
};

async function loadFromDb() {
  const docs = await Setting.find({
    key: { $in: ["smtp", "recaptcha"] },
  }).lean();
  const map = Object.fromEntries(docs.map((d) => [d.key, d.value]));
  return {
    smtp: { ...DEFAULTS.smtp, ...(map.smtp || {}) },
    recaptcha: { ...DEFAULTS.recaptcha, ...(map.recaptcha || {}) },
  };
}

async function getAppSettings({ force = false } = {}) {
  const now = Date.now();
  if (!force && cache.data && now - cache.at < CACHE_TTL_MS) {
    return cache.data;
  }
  const data = await loadFromDb();
  cache = { at: now, data };
  return data;
}

function clearAppSettingsCache() {
  cache = { at: 0, data: null };
}

async function upsertSetting(key, value) {
  await Setting.findOneAndUpdate(
    { key },
    { $set: { value } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  clearAppSettingsCache();
}

module.exports = {
  getAppSettings,
  clearAppSettingsCache,
  upsertSetting,
  DEFAULTS,
};
