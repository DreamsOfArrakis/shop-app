"use client";
import { QuantityInput } from "@/components/layouts/QuantityInput";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/providers/AuthProvider";
import useCartActions from "@/features/carts/hooks/useCartActions";
import { AddProductCartData, AddProductToCartSchema } from "@/features/carts/validations";
import BuyNowButton from "./BuyNowButton";
import { useState } from "react";

interface ProductPurchaseActionsProps {
  productId: string;
}

function ProductPurchaseActions({ productId }: ProductPurchaseActionsProps) {
  const { user } = useAuth();
  const { addProductToCart } = useCartActions(user, productId);
  const maxQuantity = 8;
  const [quantity, setQuantity] = useState(1);

  const form = useForm<AddProductCartData>({
    resolver: zodResolver(AddProductToCartSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  async function onSubmit(values: AddProductCartData) {
    addProductToCart(values.quantity);
  }

  const addOne = () => {
    const currQuantity = form.getValues("quantity");
    if (currQuantity < maxQuantity) {
      const newQuantity = currQuantity + 1;
      form.setValue("quantity", newQuantity);
      setQuantity(newQuantity);
    }
  };

  const minusOne = () => {
    const currQuantity = form.getValues("quantity");
    if (currQuantity > 1) {
      const newQuantity = currQuantity - 1;
      form.setValue("quantity", newQuantity);
      setQuantity(newQuantity);
    }
  };

  // Watch quantity changes
  const watchedQuantity = form.watch("quantity");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <QuantityInput
                  {...field}
                  addOneHandler={addOne}
                  minusOneHandler={minusOne}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-x-5">
          <Button type="submit">Add to Cart</Button>
          <BuyNowButton productId={productId} quantity={watchedQuantity} />
        </div>
      </form>
    </Form>
  );
}

export default ProductPurchaseActions;
