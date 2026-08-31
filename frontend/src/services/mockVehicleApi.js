import { SAMPLE_VEHICLES } from '../data/vehicles';

const STORAGE_KEY = 'mock_vehicles_v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const seeded = SAMPLE_VEHICLES.map((v) => ({ ...v }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const db = {
  list: () => {
    return Promise.resolve(load());
  },
  listByOwner: (ownerId) => {
    const all = load();
    return Promise.resolve(all.filter((v) => v.ownerId === ownerId));
  },
  get: (id) => {
    const all = load();
    return Promise.resolve(all.find((v) => String(v.id) === String(id)));
  },
  create: (payload) => {
    const all = load();
    const id = `local-${Date.now()}`;
    const item = { id, ...payload };
    all.unshift(item);
    save(all);
    return Promise.resolve(item);
  },
  update: (id, changes) => {
    const all = load();
    const idx = all.findIndex((v) => String(v.id) === String(id));
    if (idx === -1) return Promise.reject(new Error('Not found'));
    all[idx] = { ...all[idx], ...changes };
    save(all);
    return Promise.resolve(all[idx]);
  },
  remove: (id) => {
    let all = load();
    all = all.filter((v) => String(v.id) !== String(id));
    save(all);
    return Promise.resolve(true);
  },
};

export default db;
