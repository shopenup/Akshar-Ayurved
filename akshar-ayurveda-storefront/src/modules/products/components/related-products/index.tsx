import Product from "@modules/products/components/product-preview"
import { getRegion } from "@lib/shopenup/regions"
import { productService } from "@lib/shopenup/product"
import { HttpTypes } from "@shopenup/types"
import { Layout, LayoutColumn } from "@components/layout"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)
  // edit this function to define your related products logic
  // Fetch all products (example: limit 1000, adjust as needed)
  const products = await productService.getProducts({ limit: 1000 })
  // Optionally, filter out the current product if needed
  const relatedProducts = products.filter(
    (responseProduct: any) => responseProduct.id !== product.id
  )

  if (!relatedProducts.length) {
    return null
  }

  return (
    <>
      <Layout>
        <LayoutColumn className="mt-26 md:mt-36">
          <h4 className="text-md md:text-2xl mb-8 md:mb-16">
            Related products 1
          </h4>
        </LayoutColumn>
      </Layout>
      <Layout className="gap-y-10 md:gap-y-16">
        {relatedProducts.map((product: any) => (
          <LayoutColumn key={product.id} className="!col-span-6 md:!col-span-4">
            <Product product={product} />
          </LayoutColumn>
        ))}
      </Layout>
    </>
  )
}
