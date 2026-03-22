import { BrowseTracksClient } from "@/components/tracks/browse-tracks-client";
import { getFilterCollections } from "@/data/queries";
import { producers, profiles } from "@/data/seed";
import { trackRepository } from "@/lib/supabase/repositories";

export default async function TracksPage() {
  const tracks = await trackRepository.list();
  const filterCollections = getFilterCollections();

  const producerById = Object.fromEntries(
    producers.map((producer) => {
      const profile = profiles.find((item) => item.id === producer.profileId);
      return [producer.id, profile?.displayName ?? producer.artistName];
    }),
  );

  return <BrowseTracksClient tracks={tracks} producerById={producerById} filterCollections={filterCollections} />;
}
