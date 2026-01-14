import { Shell } from "@/components/layouts/Shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { OrderProgress } from "@/features/orders";
import Link from "next/link";
import { gql } from "@/gql";
import { getClient } from "@/lib/urql";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import dayjs from "dayjs";

type TrackOrderProps = {
  params: { orderId: string };
};

const OrderDetailQuery = gql(/* GraphQL */ `
  query OrderDetailQuery($orderId: String!) {
    ordersCollection(filter: { id: { eq: $orderId } }, first: 1) {
      edges {
        node {
          id
          created_at
        }
      }
    }
  }
`);

async function TrackOrderPage({ params: { orderId } }: TrackOrderProps) {
  const cookieStore = cookies();
  const supabase = createClient({ cookieStore });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/sign-in");
  }

  const { data, error } = await getClient().query(OrderDetailQuery, {
    orderId: params.orderId,
  });

  if (!data || !data.ordersCollection?.edges?.[0]) {
    return notFound();
  }

  const order = data.ordersCollection.edges[0].node;
  const estimatedDeliveryDate = dayjs(order.created_at).add(2, "weeks").format("MMMM DD, YYYY");

  return (
    <Shell layout="narrow">
      <h2 className="text-xl font-semibold">
        Estimated Delivery: {estimatedDeliveryDate}
      </h2>
      <div>
        <p>
          <span className="font-semibold">Order Status:</span>
          Ordered
        </p>

        <p>
          <span className="font-semibold">{`Order Id: `}</span>
          {`#${orderId}`}
        </p>
        <OrderProgress />
      </div>

      <section className="grid grid-cols-3 gap-x-5">
        <Card>
          <CardHeader className="font-semibold">Shipping Address</CardHeader>
          <CardContent>
            <p>Hugo Lam</p>
            <p>4242 ORrder 122</p>
            <p>Vancourver 332 212</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="font-semibold">Track your Order</CardHeader>
          <CardContent>
            <Link href="/" className="text-blue-700 hover:underline">
              #{orderId}
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="font-semibold">Track your Order</CardHeader>
          <CardContent>
            <Link href="/" className="text-blue-700 hover:underline">
              #{orderId}
            </Link>
          </CardContent>
        </Card>
      </section>
    </Shell>
  );
}

export default TrackOrderPage;
