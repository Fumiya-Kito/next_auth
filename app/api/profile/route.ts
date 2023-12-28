import { NextResponse } from "next/server";
import getCurrnetUser from "@/app/actions/getCurrentUser";
import prisma from '@/app/lib/prisma';


// プロフィール編集
export async function PATCH(request: Request) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    const { name, image } = body;
    const currentUser = await getCurrnetUser();

    // ログインしていない場合、エラー
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('認証していません', { status: 401 });
    }

    // ユーザーの編集
    const response = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name,
        image,
      },
    });

    return NextResponse.json(response);

  } catch (err) {
    console.error(err);
    return new NextResponse('Error', { status: 500 });
  }
}