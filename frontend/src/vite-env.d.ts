/// <reference types="vite/client" />

// Allow importing CSS files
declare module "*.css";

// Allow importing other static assets (optional but useful)
declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}