import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    const urlParms = url.searchParams;
    // TODO: pesquisar fotos no banco de dados

    return new Response();
};
