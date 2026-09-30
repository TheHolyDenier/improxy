export async function createInkSavingImageUri(imageUri: string) {
  const { encodeDataURL, fetchURL } = await import('image-js')

  const image = await fetchURL(imageUri)
  const inkSavingImage = image.grey().level({
    inputMin: 20,
    inputMax: 245,
    outputMin: 42,
    outputMax: 255,
    gamma: 0.82,
  })

  return encodeDataURL(inkSavingImage, { format: 'png' })
}
