export type BrandPresentation = "spaced" | "standard" | "brandmark";

export type BrandIdentity = {
  name: string;
  wordmarks: {
    spaced: string;
    standard: string;
  };
  brandmark: {
    src: string | null;
    alt: string;
  };
  defaultPresentation: BrandPresentation;
};

export const brandIdentity: BrandIdentity = {
  name: "Simatu",
  wordmarks: {
    spaced: "S I M A T U",
    standard: "Simatu",
  },
  brandmark: {
    src: null,
    alt: "Simatu",
  },
  defaultPresentation: "spaced",
};
