import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from '@/app/lib/prisma';


// ログインユーザーを取得
const getCurrnetUser = async() => {
  try {
    // セッション情報を取得
    const session = await getServerSession(authOptions);
    
    // ログインしていない場合
    if (!session?.user?.email) {
      return null;
    }

    // ログインユーザーの取得
    const response = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (!response) {
      return null;
    }

    return response;

  } catch (err) {
    return null;
  }
}

export default getCurrnetUser;