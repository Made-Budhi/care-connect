import {
    type ColumnDef,
    type ColumnFiltersState, flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable
} from "@tanstack/react-table";
import {useState} from "react";
import {ListFilter, Search} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTableChildren<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            columnFilters,
        },
    })

    return (
        <div className={"space-y-3"}>
            <section id="filtering-section" className={"flex gap-2"}>
                <div className={"relative"}>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-500" />
                    <Input placeholder={"Search Name"}

                           value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                           onChange={(event) => {
                               table.getColumn("name")?.setFilterValue(event.target.value)
                           }}

                           className={"pl-10 bg-white"} />
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className="bg-white border space-x-1">
                            <p>Filter</p>
                            <ListFilter/>
                        </Button>
                    </PopoverTrigger>

                    {/* TODO: Implement filtering based on gender, school, and grade */}
                    <PopoverContent>
                        <p>Hi, this section is supposed to be filtering section.</p>
                    </PopoverContent>
                </Popover>
            </section>

            <div className={"bg-white p-2 rounded-sm border"}>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id} className={"border-r"}>
                                        {header.isPlaceholder ? null : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={"odd:bg-gray-50"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className={"border-r"}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}