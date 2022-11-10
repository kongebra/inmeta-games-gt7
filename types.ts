export type Player = {
  _id: string;

  firstName: string;
  lastName: string;

  image: {
    _type: "image";
    asset: {
      _type: "reference";
      _ref: string;
    };
  };

  imageUrl: string;

  dep: {
    name: string;
    slug: {
      current: string;
    };
  };
};
