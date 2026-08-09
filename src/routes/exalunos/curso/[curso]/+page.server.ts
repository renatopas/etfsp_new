import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { courseFromSlug, isCourse } from "$lib/domain";
import {
  _courseRedirectUrl,
  _loadAlumniList,
} from "../../../exalunos_lista/+page.server";

export const load: PageServerLoad = async ({ params, url }) => {
  const course = courseFromSlug(params.curso);

  if (!course) {
    const alias = params.curso.toUpperCase();
    if (isCourse(alias)) {
      redirect(308, _courseRedirectUrl(url, alias));
    }

    error(404, "Curso não encontrado.");
  }

  return _loadAlumniList(url, course);
};
