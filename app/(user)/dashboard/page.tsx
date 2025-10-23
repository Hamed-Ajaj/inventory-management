import ProductStockCard from "@/components/product-stock-card";
import ProductsChart from "@/components/products-chart";
import DashboardHeading from "@/components/ui/dashboard-heading";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrendingUp } from "lucide-react";
import { headers } from "next/headers";
import { cache } from "react";

export const dynamic = "force-dynamic"; // Ensures the page revalidates

export const revalidate = 300; // cache for 5 minutes

const getSessionCached = cache(async (headers: Headers) => {
  return auth.api.getSession({ headers });
});

const getDashboardData = cache(async (userId: string) => {
  const [totalProducts, lowStock, recent, allProducts] = await Promise.all([
    prisma.product.count({ where: { userId } }),
    prisma.product.count({ where: { userId, quantity: { lte: 5 } } }),
    prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.product.findMany({
      where: { userId },
      select: { price: true, createdAt: true, quantity: true },
    }),
  ]);
  return { totalProducts, lowStock, recent, allProducts };
});

async function DashboardPage() {
  const session = await getSessionCached(await headers());

  if (!session) {
    return <div>Not authenticated</div>;
  }

  const { totalProducts, lowStock, recent, allProducts } =
    await getDashboardData(session.user.id);

  const totalValue = allProducts.reduce(
    (sum, product) => sum + Number(product.price) * Number(product.quantity),
    0,
  );

  const inStockCount = allProducts.filter((p) => Number(p.quantity) > 5).length;
  const lowStockCount = allProducts.filter(
    (p) => Number(p.quantity) <= 5 && Number(p.quantity) >= 1,
  ).length;
  const outOfStockCount = allProducts.filter(
    (p) => Number(p.quantity) === 0,
  ).length;

  const inStockPercentage =
    totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 100) : 0;
  const lowStockPercentage =
    totalProducts > 0 ? Math.round((lowStockCount / totalProducts) * 100) : 0;
  const outOfStockPercentage =
    totalProducts > 0 ? Math.round((outOfStockCount / totalProducts) * 100) : 0;

  const now = new Date();
  const weeklyProductsData = [];

  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekStart.setHours(23, 59, 59, 999);

    const weekLabel = `${String(weekStart.getMonth() + 1).padStart(
      2,
      "0",
    )}/${String(weekStart.getDate() + 1).padStart(2, "0")}`;

    const weekProducts = allProducts.filter((product) => {
      const productDate = new Date(product.createdAt);
      return productDate >= weekStart && productDate <= weekEnd;
    });

    weeklyProductsData.push({
      week: weekLabel,
      products: weekProducts.length,
    });
  }

  return (
    <div className="h-full ">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">
              Welcome back! Here is an overview of your inventory.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Key Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <DashboardHeading>Key Metrics</DashboardHeading>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {totalProducts}
              </div>
              <div className="text-sm text-gray-600">Total Products</div>
              <div className="flex items-center justify-center mt-1">
                <span className="text-xs text-green-600">+{totalProducts}</span>
                <TrendingUp className="w-3 h-3 text-green-600 ml-1" />
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                ${Number(totalValue).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
              <div className="flex items-center justify-center mt-1">
                <span className="text-xs text-green-600">
                  +${Number(totalValue).toFixed(0)}
                </span>
                <TrendingUp className="w-3 h-3 text-green-600 ml-1" />
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{lowStock}</div>
              <div className="text-sm text-gray-600">Low Stock</div>
              <div className="flex items-center justify-center mt-1">
                <span className="text-xs text-green-600">+{lowStock}</span>
                <TrendingUp className="w-3 h-3 text-green-600 ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Iventory over time */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <DashboardHeading>New Products per week</DashboardHeading>
          </div>
          <div className="h-48">
            <ProductsChart data={weeklyProductsData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Stock Levels */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <DashboardHeading>Stock Levels</DashboardHeading>
          </div>
          <div className="space-y-3">
            {recent.map((product, key) => (
              <ProductStockCard product={product} key={key} />
            ))}
          </div>
        </div>

        {/* Efficiency */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <DashboardHeading>Efficiency</DashboardHeading>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
              <div
                className="absolute inset-0 rounded-full border-8 border-purple-600"
                style={{
                  clipPath:
                    "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%)",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {inStockPercentage}%
                  </div>
                  <div className="text-sm text-gray-600">In Stock</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-200" />
                <span>In Stock ({inStockPercentage}%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-600" />
                <span>Low Stock ({lowStockPercentage}%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <span>Out of Stock ({outOfStockPercentage}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
