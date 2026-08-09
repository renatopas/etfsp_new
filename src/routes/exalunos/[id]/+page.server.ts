import type { PageServerLoad } from "./$types";
import {
  loadPublicAlumniProfile,
  parseAlumniId,
} from "$lib/server/alumni-profile";

export const load: PageServerLoad = async ({ params }) => {
  const id = parseAlumniId(params.id);
  return loadPublicAlumniProfile(id);
};
