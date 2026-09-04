export const COURSE_CATALOG = {
  MEC: {
    name: "Técnico em Mecânica",
    shortName: "Mecânica",
    slug: "mecanica",
  },
  ELE: {
    name: "Técnico em Eletrotécnica",
    shortName: "Eletrotécnica",
    slug: "eletrotecnica",
  },
  EDI: {
    name: "Técnico em Edificações",
    shortName: "Edificações",
    slug: "edificacoes",
  },
  ELO: {
    name: "Técnico em Eletrônica",
    shortName: "Eletrônica",
    slug: "eletronica",
  },
  PRD: {
    name: "Técnico em Processamento de Dados",
    shortName: "Processamento de Dados",
    slug: "processamento-de-dados",
  },
  TEL: {
    name: "Técnico em Telecomunicações",
    shortName: "Telecomunicações",
    slug: "telecomunicacoes",
  },
  INF: {
    name: "Técnico em Informática Industrial",
    shortName: "Informática Industrial",
    slug: "informatica-industrial",
  },
} as const;

export type Course = keyof typeof COURSE_CATALOG;

export const COURSES = Object.keys(COURSE_CATALOG) as Course[];

export function isCourse(value: string | null): value is Course {
  return value !== null && Object.hasOwn(COURSE_CATALOG, value);
}

export function courseFromSlug(slug: string): Course | undefined {
  return COURSES.find((course) => COURSE_CATALOG[course].slug === slug);
}

export function courseLabel(course: Course): string {
  return `${course} — ${COURSE_CATALOG[course].name}`;
}

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
  whatsapp?: string;
  whatsappUrl?: string;
  homepage?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
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
