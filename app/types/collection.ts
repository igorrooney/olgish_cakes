export type HomepageCollectionImage = {
  asset: {
    _ref: string
    _type?: string
  }
  alt?: string
}

export type HomepageCollection = {
  _id: string
  name: string
  homepageOrder?: number
  image?: HomepageCollectionImage
}
