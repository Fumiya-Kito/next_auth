'use client'

import Link from 'next/link'

// ナビゲーション
const Navigation = () => {
  return (
    <header className="shadow-lg shadow-gray-100">
      <div className="container mx-auto flex max-w-screen-sm items-center justify-between px-1 py-5">
        <Link href="/" className="cursor-pointer text-xl font-bold">
          Next Auth App with Prisma
        </Link>
      </div>
    </header>
  )
}

export default Navigation