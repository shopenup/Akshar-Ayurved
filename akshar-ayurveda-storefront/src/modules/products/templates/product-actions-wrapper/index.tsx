import { productService } from "@lib/shopenup/product"
import { HttpTypes } from "@shopenup/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  materials,
  region,
}: {
  id: string
  materials: {
    id: string
    name: string
    colors: {
      id: string
      name: string
      hex_code: string
    }[]
  }[]
  region: HttpTypes.StoreRegion
}) {
  const [product] = await productService.getProductsById({
    ids: [id],
    regionId: region.id,
  })

  if (!product) {
    return null
  }

  return (
    <ProductActions product={product as unknown as HttpTypes.StoreProduct} materials={materials} region={region} />
  )
}
