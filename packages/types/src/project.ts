export interface ProjectGalleryItem {
  id: string;
  src: string;
  caption: string;
  location: string;
  spec: string;
  aspect: "landscape" | "portrait" | "wide";
}

export interface FeaturedProject {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  client: string;
  locations: string[];
  year: string;
  categoryTag: string;
  scaleMetric: string;
  materials: string[];
  engineeringNotes: string[];
  summary: string;
  coverImage: string;
  gallery: ProjectGalleryItem[];
}

