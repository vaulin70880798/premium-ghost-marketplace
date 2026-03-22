import { BrowseTracksClient } from "@/components/tracks/browse-tracks-client";
import { getFilterCollections } from "@/data/queries";
import { trackRepository } from "@/lib/supabase/repositories";

export default async function TracksPage() {
  const tracks = await trackRepository.list();
  const filterCollections = getFilterCollections();
  const producerIds = [...new Set(tracks.map((track) => track.producerId))];
  const producerById = await trackRepository.getProducerNameMap(producerIds);

  return <BrowseTracksClient tracks={tracks} producerById={producerById} filterCollections={filterCollections} />;
}
