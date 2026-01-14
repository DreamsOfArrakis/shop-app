"use client";
import { DocumentType, gql } from "@/gql";
import { keytoUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";

type BuyAgainCardProps = {
  products: DocumentType<typeof BuyAgainCardFragment>[];
};

export const BuyAgainCardFragment = gql(/* GraphQL */ `
  fragment BuyAgainCardFragment on productsEdge {
    node {
      id
      featured
      price
      name
      slug
      description
      featuredImage: medias {
        id
        key
        alt
      }
    }
  }
`);

function BuyAgainCard({ products }: BuyAgainCardProps) {
  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b bg-muted/50">
        <h2 className="text-lg font-semibold">Buy again</h2>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          {products.map(({ node }) => (
            <Link
              key={node.id}
              href={`/shop/${node.slug}`}
              className="flex gap-4 group hover:opacity-80 transition-opacity"
            >
              <div className="relative flex-shrink-0">
                <Image
                  src={keytoUrl(node.featuredImage.key)}
                  alt={node.featuredImage.alt}
                  className="w-20 h-20 rounded-md object-cover"
                  width={80}
                  height={80}
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                <h3 className="text-sm font-medium line-clamp-2 text-foreground group-hover:underline">
                  {node.name}
                </h3>
                <p className="text-base font-semibold text-foreground">
                  ${node.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default BuyAgainCard;
