import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    return <div>Not authenticated</div>
  }

  const totalProducts = await prisma.product.count({
    where: {
      userId: session.user.id
    }
  });


  const lowStock = await prisma.product.count({
    where: {
      userId: session.user.id
    }
  })

  const recent = await prisma.product.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: { createdAt: "asc" },
    take: 5
  })

  console.log(recent)
  return (
    <div>
      <h1>Welcome {session.user.name}</h1>
    </div>
  )
}

export default DashboardPage;
