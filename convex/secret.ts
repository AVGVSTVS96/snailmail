export const serverSecret = () => {
  const value = process.env.SNAILMAIL_RENDER_SECRET;

  if (!value) {
    throw new Error("SNAILMAIL_RENDER_SECRET is not set");
  }

  return value;
};

export const authorize = (given: string) => {
  if (given !== serverSecret()) {
    throw new Error("Not authorized");
  }
};
