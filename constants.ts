export const playerQuery = `*[_type == "player"][] {
    ...,
    "imageUrl": image.asset->url
  }`;
