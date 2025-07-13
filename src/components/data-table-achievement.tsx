import {
    type ColumnDef,
    type ColumnFiltersState, flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable
} from "@tanstack/react-table";
import {useState} from "react";
import {ListFilter, Plus, Search, X} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button, buttonVariants} from "@/components/ui/button.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import useAuth from "@/hooks/useAuth.tsx";
import {Link, useParams} from "react-router";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Separator} from "@/components/ui/separator.tsx";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTableAchievement<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const {auth} = useAuth();
    const {uuid} = useParams()

    const isFilterActive = (columnId: string) => !!table.getColumn(columnId)?.getFilterValue();

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

                {auth.role === 'school' && (
                    <Link to={`/school/children/${uuid}/achievements/add`} className={`${buttonVariants({variant: "ccbutton"})}`}>
                        <Plus />
                        <p>NEW</p>
                    </Link>
                )}

                {/*Filtering section*/}
                <div className={"relative"}>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-500" />
                    <Input placeholder={"Search Achievement"}

                           value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                           onChange={(event) => {
                               table.getColumn("title")?.setFilterValue(event.target.value)
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

                    <PopoverContent className={"space-y-8"}>
                        <div className={"space-y-4"}>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="type">Type</Label>
                                <div className="col-span-2 relative">
                                    <Select
                                        value={(table.getColumn("achievement_type")?.getFilterValue() as string) ?? ""}
                                        onValueChange={(value) => {
                                            const filterValue = value === "all" ? "" : value;
                                            table.getColumn("achievement_type")?.setFilterValue(filterValue);
                                        }}
                                    >
                                        <SelectTrigger className="h-8 pr-8"><SelectValue placeholder="All Status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Type</SelectItem>
                                            <SelectItem value="academic">Academic</SelectItem>
                                            <SelectItem value="non-academic">Non-Academic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {isFilterActive("achievement_type") && (
                                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2" onClick={() => table.getColumn("achievement_type")?.setFilterValue("")}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <Separator />
                            <Button variant="link" size="sm" onClick={() => table.resetColumnFilters()} className="w-full">
                                Reset All Filters
                            </Button>
                        </div>
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