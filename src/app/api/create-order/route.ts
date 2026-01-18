import { getProductsByIds } from "@/_actions/products";
import type { CartItems } from "@/features/carts";
import db from "@/lib/supabase/db";
import { SelectProducts, orders, carts, wishlist } from "@/lib/supabase/schema";
import { orderLines } from "@/lib/supabase/schema";
import { eq, and, inArray } from "drizzle-orm";
import { User, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const orderProductsSchema = z.object({
  orderProducts: z.record(
    z.object({
      quantity: z.number().min(1),
    }),
  ),
  guest: z.boolean(),
});

type OrderProducts = CartItems;

export async function POST(request: Request) {
  const data = (await request.json()) as {
    orderProducts: OrderProducts;
    guest: boolean;
  };

  const validation = orderProductsSchema.safeParse(data);
  const supabase = createRouteHandlerClient({ cookies });

  if (!validation.success) {
    return new NextResponse(JSON.stringify("Invalid data format."), {
      status: 400,
    });
  }

  try {
    const productsQuantity = await mergeProductDetailsWithQuantities(
      data.orderProducts,
    );

    const amount = calcSubtotal(productsQuantity);

    // Get user if not guest
    let userId: string | null = null;
    if (!data.guest) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id || null;
    }

    // Create order with test mode status
    const insertedOrder = await db
      .insert(orders)
      .values({
        user_id: userId,
        currency: "cad",
        amount: `${amount}`,
        order_status: "completed", // Mark as completed for test mode
        payment_status: "no_payment_required", // No payment needed in test mode
        payment_method: "test",
      })
      .returning();

    // Create order lines
    await db.insert(orderLines).values(
      productsQuantity.map(({ id, quantity, price }) => ({
        productId: id,
        quantity,
        price: `${price}`,
        orderId: insertedOrder[0].id,
      })),
    );

    // Clear cart and remove purchased items from wishlist for authenticated users
    if (userId) {
      try {
        // Clear cart
        await db.delete(carts).where(eq(carts.userId, userId));

        // Remove purchased products from wishlist
        const purchasedProductIds = productsQuantity.map((p) => p.id);
        if (purchasedProductIds.length > 0) {
          const deleteResult = await db
            .delete(wishlist)
            .where(
              and(
                eq(wishlist.userId, userId),
                inArray(wishlist.productId, purchasedProductIds),
              ),
            )
            .returning();
          console.log(
            `Removed ${deleteResult.length} item(s) from wishlist for user ${userId}`,
          );
        }
      } catch (err) {
        // Log error but don't fail the order creation
        console.error("Error clearing cart or wishlist:", err);
      }
    }

    return NextResponse.json({
      orderId: insertedOrder[0].id,
      success: true,
      purchasedProductIds: productsQuantity.map((p) => p.id),
    });
  } catch (err) {
    console.error("Error creating order:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

const calcSubtotal = (
  productsQuantity: (SelectProducts & { quantity: number })[],
) =>
  productsQuantity.reduce((acc, cur) => {
    return acc + cur.quantity * parseFloat(cur.price);
  }, 0);

const mergeProductDetailsWithQuantities = async (
  orderProducts: OrderProducts,
): Promise<(SelectProducts & { quantity: number })[]> => {
  const productIds = Object.keys(orderProducts);
  const products = await getProductsByIds(productIds);

  const orderDetails = products.map((product) => {
    const quantity = orderProducts[product.id].quantity;
    return { ...product, quantity };
  });

  return orderDetails;
};
