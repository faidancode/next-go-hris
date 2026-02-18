"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBrands, useDeleteBrand } from "@/hooks/use-brand";
import { useBrandSheet } from "@/hooks/use-brand-sheet";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import BrandSheet from "./sheet";
import { columns } from "./columns";
import SkeletonTable from "@/components/shared/table/skeleton-table";
import { DataTable } from "@/components/shared/table/data-table";
import AppHeader from "@/components/shared/app-header";

function BrandPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300); // 300ms delay
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("createdAt:desc"); // default

  // Fetch data dengan pagination & search
  const { data, isLoading, error } = useBrands(
    page,
    pageSize,
    debouncedSearch,
    sort,
  );

  const tableData = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const deleteMutation = useDeleteBrand();
  const { openCreate, openEdit } = useBrandSheet();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <AppHeader title="Brands" />
      <div className="container pt-2">
        <div className="flex justify-between items-center mb-4 mt-6">
          <Input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white p-2 border rounded-lg w-32"
          />
          <Button onClick={openCreate}>
            <PlusCircle /> Add Brand
          </Button>
        </div>
        {isLoading ? (
          <SkeletonTable />
        ) : (
          <div>
            <DataTable
              key={`${page}-${pageSize}`}
              columns={columns(handleDelete, (brand) => {
                openEdit({
                  id: brand.id,
                  name: brand.name,
                  slug: brand.slug ?? "",
                  imageUrl: brand.imageUrl ?? "",
                });
              })}
              data={tableData}
              page={page}
              setPage={setPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              totalPages={totalPages}
              sort={sort}
              setSort={setSort}
            />
          </div>
        )}
        <BrandSheet />
      </div>
    </>
  );
}

export default BrandPage;
