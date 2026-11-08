export const setting = (name: string) => {
  const value = process.env[name];

  return value === undefined || value === "" ? null : value;
};

export const serverSecret = () => {
  const value = setting("SNAILMAIL_RENDER_SECRET");

  if (value === null) {
    throw new Error("SNAILMAIL_RENDER_SECRET is not set");
  }

  return value;
};

export const authorize = (given: string) => {
  if (given !== serverSecret()) {
    throw new Error("Not authorized");
  }
};
