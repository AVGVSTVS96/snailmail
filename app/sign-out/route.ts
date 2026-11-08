import { signOut } from "@workos-inc/authkit-nextjs";

export const POST = async () => {
  await signOut();
};
