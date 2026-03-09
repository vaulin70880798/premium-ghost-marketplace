import { BrowseTracksClient } from "@/components/tracks/browse-tracks-client";
import { getFilterCollections, getTracks } from "@/data/queries";
import { producers, profiles } from "@/data/seed";

export default function TracksPage() {
  const tracks = getTracks();
  const filterCollections = getFilterCollections();

  const producerById = Object.fromEntries(
    producers.map((producer) => {
      const profile = profiles.find((item) => item.id === producer.profileId);
      return [producer.id, profile?.displayName ?? producer.artistName];
    }),
  );

  return <BrowseTracksClient tracks={tracks} producerById={producerById} filterCollections={filterCollections} />;
}
