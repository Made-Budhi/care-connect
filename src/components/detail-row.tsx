export const DetailRow = ({ label, value }: { label: string, value?: React.ReactNode | string | number | null }) => (
    value ? (
        <div className="flex justify-between border-b py-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-right">{value}</p>
        </div>
    ) : null
);