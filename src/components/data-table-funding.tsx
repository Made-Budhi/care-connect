import {
    type ColumnDef,
    type ColumnFiltersState, flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable
} from "@tanstack/react-table";
import {useState} from "react";
import {ListFilter, Plus} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button, buttonVariants} from "@/components/ui/button.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Link} from "react-router";
import useAuth from "@/hooks/useAuth.tsx";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTableFunding<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const {auth} = useAuth();
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
                {/*Add a new submission button*/}
                {auth.role === 'sponsor' && (
                    <Link to={"/sponsor/funding/add"} className={`${buttonVariants({variant: "ccbutton"})}`}>
                        <Plus />
                        <p>NEW</p>
                    </Link>
                )}

                {/*Filtering section*/}
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