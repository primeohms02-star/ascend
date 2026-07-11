type MemoryEntry = {
  role: "user" | "atlas";
  message: string;
};

const conversations = new Map<string, MemoryEntry[]>();

export function saveConversation(
  userId: string,
  role: "user" | "atlas",
  message: string
) {
  const history = conversations.get(userId) ?? [];

  history.push({
    role,
    message,
  });

  conversations.set(userId, history);
}

export function getConversation(userId: string) {
  return conversations.get(userId) ?? [];
}