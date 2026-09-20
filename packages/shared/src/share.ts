export function shareUrl(origin: string, shareId: string): string {
  return `${origin.replace(/\/$/, "")}/share/${shareId}`;
}

/** The message that accompanies a shared link — doubles as the invite for someone without an account. */
export function shareMessage(title: string, ownerName: string | null): string {
  const sender = ownerName ? `${ownerName} thought you'd like` : "Thought you'd like";
  return `${sender} this Random Knowledge lesson: “${title}”. Read it, or join to get a new lesson every day.`;
}
