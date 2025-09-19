import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { CollectionsSlider } from "@modules/store/components/collections-slider"

import { productService } from "@lib/shopenup/product"
import { getCategoriesList } from "@lib/shopenup/categories"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { getRegion } from "@lib/shopenup/regions"

const StoreTemplate = async ({
  sortBy,
  collection,
  category,
  type,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection?: string[]
  category?: string[]
  type?: string[]
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page, 10) : 1

  const [collections, categories, region] = await Promise.all([
    productService.getCollections(),
    getCategoriesList(0, 100, ["id", "name", "handle"]),
    getRegion(countryCode),
  ])

  return (
    <div className="md:pt-47 py-26 md:pb-36">
      <CollectionsSlider />
      <RefinementList
        collections={Object.fromEntries(
          collections.map((c) => [c.id, c.title])
        )}
        collection={collection}
        categories={Object.fromEntries(
          categories.product_categories.map((c) => [c.handle, c.name])
        )}
        category={category}
        types={{}}
        type={type}
        sortBy={sortBy}
      />
      <Suspense fallback={<SkeletonProductGrid />}>
        {region && (
          <PaginatedProducts
            sortBy={sortBy}
            page={pageNumber}
            countryCode={countryCode}
            collectionId={
              !collection
                ? undefined
                : collections
                    .filter((c) => collection.includes(c.id))
                    .map((c) => c.id)
            }
            categoryId={
              !category
                ? undefined
                : categories.product_categories
                    .filter((c) => category.includes(c.handle))
                    .map((c) => c.id)
            }
            typeId={undefined}
          />
        )}
      </Suspense>
    </div>
  )
}

export default StoreTemplate
