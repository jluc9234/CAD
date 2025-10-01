// This type is duplicated from the main /types.ts to ensure it's available
// to the Netlify functions during the build process.

export interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  phone?: string;
  password?: string;
  bio: string;
  images: string[];
  interests: string[];
  background?: string;
}
