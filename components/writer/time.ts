export const day = (at: number) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(at);

export const ago = (at: number, now = Date.now()) => {
  const minutes = Math.round((now - at) / 60_000);

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `${hours} h ago`;
  }

  return day(at);
};
