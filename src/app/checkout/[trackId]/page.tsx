import { notFound } from "next/navigation";

import { CheckoutClient } from "@/components/checkout/checkout-client";
import { trackRepository } from "@/lib/supabase/repositories";

export default async function CheckoutPage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  const track = await trackRepository.getById(trackId);

  if (!track) {
    notFound();
  }

  return <CheckoutClient track={track} />;
}
