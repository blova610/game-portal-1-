"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Table as TableInstance,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings2,
  Plus,
  Loader2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
}

export interface FilterOption {
  key: string;
  label: string;
  value: string;
}

export interface BaseDataTableProps<T> {
  title: string;
  description: string;
  data: T[];
  columns: Column<T>[];
  loading: boolean;
  stats: {
    title: string;
    value: number;
    subtext?: string;
  }[];
  filterOptions?: {
    search?: {
      placeholder: string;
      value: string;
      onChange: (value: string) => void;
    };
    select?: {
      key: string;
      options: FilterOption[];
      value: string;
      onChange: (value: string) => void;
      placeholder: string;
    };
  };
  tabs?: {
    value: string;
    label: string;
    filter: (item: T) => boolean;
    onClick?: () => void;
    isActive?: boolean;
  }[];
  onAdd?: () => void;
  addButtonLabel?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;
  pageSizeOptions?: number[];
}

export function BaseDataTable<T>({
  title,
  description,
  data,
  columns,
  loading,
  stats,
  filterOptions,
  tabs,
  onAdd,
  addButtonLabel = "Add New",
  pageSize = 10,
  onRowClick,
  enableRowSelection = true,
  enableColumnVisibility = true,
  enablePagination = true,
  pageSizeOptions = [10, 20, 50, 100],
}: BaseDataTableProps<T>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [activeTab, setActiveTab] = React.useState(tabs?.[0]?.value || "all");

  const tableColumns: ColumnDef<T>[] = columns.map((col) => ({
    accessorKey: col.key,
    header: col.header,
    enableSorting: col.enableSorting,
    enableHiding: col.enableHiding,
    cell: ({ row }) => col.render(row.original),
    // Add filtering function for each column
    filterFn: (row, id, value) => {
      const cellValue = row.getValue(id);
      if (typeof cellValue === "string") {
        return cellValue.toLowerCase().includes(value.toLowerCase());
      }
      if (typeof cellValue === "object") {
        return JSON.stringify(cellValue)
          .toLowerCase()
          .includes(value.toLowerCase());
      }
      return String(cellValue).toLowerCase().includes(value.toLowerCase());
    },
  }));

  // Filter data based on active tab
  const filteredData = React.useMemo(() => {
    if (!tabs) return data;
    const activeTabConfig = tabs.find((tab) => tab.value === activeTab);
    if (!activeTabConfig) return data;
    return data.filter(activeTabConfig.filter);
  }, [data, tabs, activeTab]);

  const table = useReactTable<T>({
    data: filteredData,
    columns: tableColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter: filterOptions?.search?.value || "",
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: (value) => filterOptions?.search?.onChange(value),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: false,
    pageCount: Math.ceil(filteredData.length / pageSizeOptions[0]),
    initialState: {
      pagination: {
        pageSize: pageSizeOptions[0],
      },
    },
  });

  const renderTable = () => (
    <div className="rounded-md border border-border bg-background">
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "text-foreground",
                        header.column.getCanSort()
                          ? "cursor-pointer select-none hover:bg-muted"
                          : ""
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted() as string] ?? null}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "hover:bg-muted/50",
                    onRowClick ? "cursor-pointer" : "",
                    row.getIsSelected() ? "bg-muted" : ""
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-foreground">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ellipsis">
            {title}
          </h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {onAdd && (
          <Button
            onClick={onAdd}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            {addButtonLabel}
          </Button>
        )}
      </div>

      {stats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-background border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                {stat.subtext && (
                  <p className="text-xs text-muted-foreground">
                    {stat.subtext}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            {filterOptions?.search && (
              <Input
                type="search"
                placeholder={filterOptions.search.placeholder}
                value={filterOptions.search.value}
                onChange={(e) => filterOptions.search?.onChange(e.target.value)}
                className="w-full sm:w-64 bg-background text-foreground border-input"
              />
            )}
            {filterOptions?.select && (
              <select
                value={filterOptions.select.value}
                onChange={(e) => filterOptions.select?.onChange(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="" className="text-foreground">
                  {filterOptions.select.placeholder}
                </option>
                {filterOptions.select.options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="text-foreground"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            {(filterOptions?.search?.value || filterOptions?.select?.value) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  filterOptions.search?.onChange("");
                  filterOptions.select?.onChange("");
                }}
                className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Settings2 className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-background border-border"
              >
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize text-foreground"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {tabs ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={tab.isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setActiveTab(tab.value);
                    tab.onClick?.();
                  }}
                  className={cn(
                    "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
                    tab.isActive &&
                      "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
            {renderTable()}
          </div>
        ) : (
          renderTable()
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-ellipsis">Rows per page</p>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] bg-background text-foreground">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent
                side="top"
                align="start"
                className="bg-background border-border"
              >
                {pageSizeOptions.map((size) => (
                  <SelectItem
                    key={size}
                    value={size.toString()}
                    className="cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1 text-sm text-ellipsis">
            <div>Page</div>
            <strong className="font-medium text-ellipsis">
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </div>
        </div>

        {enablePagination && (
          <div className="flex items-center justify-between">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <div>
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={table.getState().pagination.pageIndex === 0}
                className="hidden h-8 w-8 p-0 lg:flex border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={table.getState().pagination.pageIndex === 0}
                className="h-8 w-8 p-0 border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={
                  table.getState().pagination.pageIndex >=
                  Math.ceil(
                    table.getFilteredRowModel().rows.length /
                      table.getState().pagination.pageSize
                  ) -
                    1
                }
                className="h-8 w-8 p-0 border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={
                  table.getState().pagination.pageIndex >=
                  Math.ceil(
                    table.getFilteredRowModel().rows.length /
                      table.getState().pagination.pageSize
                  ) -
                    1
                }
                className="hidden h-8 w-8 p-0 lg:flex border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
