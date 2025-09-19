import Product from "@modules/products/components/product-preview"
import { getRegion } from "@lib/shopenup/regions"
import { productService } from "@lib/shopenup/product"
import { HttpTypes } from "@shopenup/types"
import { Layout, LayoutColumn } from "@components/Layout"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const products = await productService.getProducts({
    limit: 3,
    category: product.type?.value,
    tags: product.tags?.map(t => t.value).filter(Boolean),
  }).then((responseProducts) => {
    return responseProducts.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
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
        {products.map((product) => (
          <LayoutColumn key={product.id} className="!col-span-6 md:!col-span-4">
            <Product product={product as unknown as HttpTypes.StoreProduct} />
          </LayoutColumn>
        ))}
      </Layout>
    </>
  )
}
