import { createClient } from "./supabase/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const newUser = await db.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0],
        imageUrl: user.user_metadata?.avatar_url,
      },
    });

    return newUser;
  } catch (error) {
    console.log(error.message);
  }
};
