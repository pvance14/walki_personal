interface ConversationMessage {
  role: string;
  content: string;
}

export class InMemorySessionMemory {
  private readonly sessions = new Map<string, ConversationMessage[]>();

  constructor(private readonly maxMessages = 12) {}

  get(sessionId?: string) {
    if (!sessionId) {
      return [];
    }

    return [...(this.sessions.get(sessionId) ?? [])];
  }

  append(sessionId: string | undefined, messages: ConversationMessage[]) {
    if (!sessionId || messages.length === 0) {
      return;
    }

    const nextMessages = [...(this.sessions.get(sessionId) ?? []), ...messages].slice(-this.maxMessages);
    this.sessions.set(sessionId, nextMessages);
  }

  clear(sessionId?: string) {
    if (!sessionId) {
      return false;
    }

    return this.sessions.delete(sessionId);
  }
}
