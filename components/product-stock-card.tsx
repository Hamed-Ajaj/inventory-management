import type { Product } from "@/app/generated/prisma";
const ProductStockCard = ({ product }: { product: Product }) => {
  const bgColors = ["bg-red-600", "bg-yellow-600", "bg-green-600"];
  const textColors = ["text-red-600", "text-yellow-600", "text-green-600"];

  const stockLevel =
    product.quantity === 0
      ? 0
      : product.quantity <= (product.lowStockAt || 5)
        ? 1
        : 2;
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${bgColors[stockLevel]}`} />
        <span className="text-sm font-medium text-gray-900">
          {product.name}
        </span>
      </div>
      <div className={`text-sm font-medium ${textColors[stockLevel]}`}>
        {product.quantity} units
      </div>
    </div>
  );
};

export default ProductStockCard;
