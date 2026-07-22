export const COURSES = [
  "PRD",
  "TEL",
  "ELO",
  "ELE",
  "EDI",
  "MEC",
  "INF",
] as const;

export type Course = (typeof COURSES)[number];

export const ALUMNI_ORDER_TO_LEGACY = {
  nome: "ALFA",
  cursoIngresso: "CURSOINGRESSO",
  cursoSaida: "CURSOSAIDA",
  ingressoCurso: "INGRESSOCURSO",
  ingressoNome: "INGRESSONOME",
  saidaCurso: "SAIDACURSO",
  saidaNome: "SAIDANOME",
} as const;

export type AlumniOrder = keyof typeof ALUMNI_ORDER_TO_LEGACY;
export type LegacyAlumniOrder = (typeof ALUMNI_ORDER_TO_LEGACY)[AlumniOrder];

export const LEGACY_ALUMNI_ORDER_TO_ORDER: Record<
  LegacyAlumniOrder,
  AlumniOrder
> = {
  ALFA: "nome",
  CURSOINGRESSO: "cursoIngresso",
  CURSOSAIDA: "cursoSaida",
  INGRESSOCURSO: "ingressoCurso",
  INGRESSONOME: "ingressoNome",
  SAIDACURSO: "saidaCurso",
  SAIDANOME: "saidaNome",
};

export interface AlumniListItem {
  id: number;
  name: string;
  nickname?: string;
  course?: string;
  startYear?: number;
  endYear?: number;
  thumbnail?: string;
}

export interface PublicAlumniProfile extends AlumniListItem {
  email?: string;
  phone?: string;
  homepage?: string;
  icq?: string;
  publicInfo?: string;
  comments?: string;
  registeredAt?: number;
  photoCount: number;
}

export interface PublicPhoto {
  title?: string;
  course?: Course;
  className?: string;
  photoYear?: number;
  graduationYear?: number;
  thumbnailUrl: string;
  imageUrl: string;
}
