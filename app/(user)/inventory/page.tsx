import DeleteForm from "@/components/delete-form";
import Pagination from "@/components/pagination";
import { deleteProduct } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export const revalidate = 300; // cache for 5 minutes

const InventoryPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q: string; page: string }>;
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const params = await searchParams;
  const q = (params.q ?? "").trim();

  const pageSize = 10;

  const page = Math.max(1, Number(params.page ?? 1));
  if (!session) {
    return <div>Not authenticated</div>;
  }

  const userId = session.user.id;

  const [totalCount, allProducts] = await Promise.all([
    prisma.product.count({
      where: {
        userId,
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
    }),
    prisma.product.findMany({
      where: {
        userId,
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  return (
    <div>
      <div>
        <h1 className="page-title">Inventory</h1>
        <p className="page-description">
          Manage your products and track inventory levels.
        </p>
      </div>
      <div className="space-y-6 mt-6">
        {/*search input*/}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form className="flex gap-2" action="/inventory" method="GET">
            <input
              name="q"
              placeholder="Search products..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
              defaultValue={q ?? ""}
            />
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Search
            </button>
          </form>
        </div>
        {/*products table*/}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Low Stock At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {allProducts.map((product, key) => (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {product.name}
                  </td>
                  <td className="px-6 py-4  text-sm text-gray-500">
                    {product.sku || "-"}
                  </td>
                  <td className="px-6 py-4  text-sm text-gray-900">
                    ${Number(product.price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4  text-sm text-gray-900">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4  text-sm text-gray-500">
                    {product.lowStockAt || "-"}
                  </td>
                  <td className="px-6 py-4  text-sm text-gray-500">
                    <DeleteForm productId={product.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Pagination
              baseUrl="/inventory"
              currentPage={page}
              totalPages={totalPages}
              searchParams={{
                q,
                pageSize: String(pageSize),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
