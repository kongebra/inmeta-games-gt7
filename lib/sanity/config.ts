import { ClientConfig } from "next-sanity";

const config: ClientConfig = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  apiVersion: "2021-10-21",

  useCdn: process.env.NODE_ENV === "production",
};

export default config;
