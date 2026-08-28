const sessions = new Map();

// ==========================
// CREATE SESSION
// ==========================

const createSession = (callId, data = {}) => {
  const session = {
    callId,
    phone: data.phone || null,
    farmerId: data.farmerId || null,
    language: data.language || null,
    stage: data.stage || "LANGUAGE",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  sessions.set(callId, session);

  return session;
};

// ==========================
// GET SESSION
// ==========================

const getSession = (callId) => {
  return sessions.get(callId) || null;
};

// ==========================
// UPDATE SESSION
// ==========================

const updateSession = (callId, data = {}) => {
  const session = sessions.get(callId);

  if (!session) {
    return null;
  }

  Object.assign(session, data);

  session.updatedAt = new Date();

  sessions.set(callId, session);

  return session;
};

// ==========================
// DELETE SESSION
// ==========================

const deleteSession = (callId) => {
  return sessions.delete(callId);
};

module.exports = {
  createSession,
  getSession,
  updateSession,
  deleteSession,
};