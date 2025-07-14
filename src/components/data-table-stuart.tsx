import {
    type ColumnDef,
    type ColumnFiltersState, flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable
} from "@tanstack/react-table";
import {useState} from "react";
import {
    // Plus,
    Search} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
// import {buttonVariants} from "@/components/ui/button.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
// import {Link} from "react-router";
// import useAuth from "@/hooks/useAuth.tsx";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTableStuart<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    // const {auth} = useAuth();
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
                {/*{auth.role === 'admin' && (*/}
                {/*    <Link to={"/admin/stuarts/add"} className={`${buttonVariants({variant: "ccbutton"})}`}>*/}
                {/*        <Plus />*/}
                {/*        <p>NEW</p>*/}
                {/*    </Link>*/}
                {/*)}*/}

                <div className={"relative"}>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-500" />
                    <Input placeholder={"Search Name"}

                           value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                           onChange={(event) => {
                               table.getColumn("name")?.setFilterValue(event.target.value)
                           }}

                           className={"pl-10 bg-white"} />
                </div>
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