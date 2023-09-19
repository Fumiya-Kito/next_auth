import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import prisma from '@/app/lib/prisma';


export async function POST(request: Request) {
  try {
    // リクエストボディの取得
    const body = await request.json();
    const { email, name, password } = body;

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザーの作成
    const response = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    })

    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return new NextResponse('Error', { status: 500 });
  }
}