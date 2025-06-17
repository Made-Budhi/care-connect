import {
    type ColumnDef,
    type ColumnFiltersState, flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable
} from "@tanstack/react-table";
import {useState} from "react";
import {ListFilter, Plus, Search, X} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button, buttonVariants} from "@/components/ui/button.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Link} from "react-router";
import useAuth from "@/hooks/useAuth.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Separator} from "@/components/ui/separator.tsx";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTableChildren<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const {auth} = useAuth();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

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
                {auth.role === 'school' && (
                    <Link to={"/school/children/add"} className={`${buttonVariants({variant: "ccbutton"})}`}>
                        <Plus />
                        <p>NEW</p>
                    </Link>
                )}

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
                    <PopoverContent className="space-y-8">
                        <div className={"space-y-4"}>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="gender">Gender</Label>
                                <div className="col-span-2 relative">
                                    <Select
                                        value={(table.getColumn("gender")?.getFilterValue() as string) ?? ""}
                                        onValueChange={(value) => table.getColumn("gender")?.setFilterValue(value === "all" ? "" : value)}
                                    >
                                        <SelectTrigger className="h-8 pr-8"><SelectValue placeholder="All Genders" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Genders</SelectItem>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {isFilterActive("gender") && (
                                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2" onClick={() => table.getColumn("gender")?.setFilterValue("")}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="grade">Grade</Label>
                                <div className="col-span-2 relative">
                                    <Select
                                        value={(table.getColumn("grade")?.getFilterValue() as string) ?? ""}
                                        onValueChange={(value) => {
                                            const filterValue = value === "all" ? "" : value;
                                            table.getColumn("grade")?.setFilterValue(filterValue);
                                        }}
                                    >
                                        <SelectTrigger className="h-8 pr-8"><SelectValue placeholder="All Grades" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Grades</SelectItem>
                                            <SelectItem value="1st">1st Grade</SelectItem>
                                            <SelectItem value="2nd">2nd Grade</SelectItem>
                                            <SelectItem value="3rd">3rd Grade</SelectItem>
                                            <SelectItem value="4th">4th Grade</SelectItem>
                                            <SelectItem value="5th">5th Grade</SelectItem>
                                            <SelectItem value="6th">6th Grade</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {isFilterActive("grade") && (
                                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2" onClick={() => table.getColumn("grade")?.setFilterValue("")}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {auth.role !== "sponsor" && (
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="status">Status</Label>
                                    <div className="col-span-2 relative">
                                        <Select
                                            value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
                                            onValueChange={(value) => {
                                                const filterValue = value === "all" ? "" : value;
                                                table.getColumn("status")?.setFilterValue(filterValue);
                                            }}
                                        >
                                            <SelectTrigger className="h-8 pr-8"><SelectValue placeholder="All Status" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="funded">Funded</SelectItem>
                                                <SelectItem value="pending_approval">Pending</SelectItem>
                                                <SelectItem value="not_funded">Not Funded</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {isFilterActive("status") && (
                                            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2" onClick={() => table.getColumn("status")?.setFilterValue("")}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
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