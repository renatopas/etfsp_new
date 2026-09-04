import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { parseAlumniId } from "$lib/server/alumni-profile";

export const load: PageServerLoad = ({ url }) => {
  const id = parseAlumniId(url.searchParams.get("id"));
  redirect(308, `/exalunos/${id}`);
};
