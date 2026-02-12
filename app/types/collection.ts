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
  isFeatured?: boolean
  homepageOrder?: number
  image?: HomepageCollectionImage
}
