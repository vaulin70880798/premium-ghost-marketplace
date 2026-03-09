import { notFound } from "next/navigation";

import { CheckoutClient } from "@/components/checkout/checkout-client";
import { getTrackById } from "@/data/queries";

export default async function CheckoutPage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  const track = getTrackById(trackId);

  if (!track) {
    notFound();
  }

  return <CheckoutClient track={track} />;
}
