import PageTitle from "@/components/page-title.tsx";

const title = "Payments"
const breadcrumbs = [
    {
        name: "Payments",
    }
]

function Payments() {
    return(
        <PageTitle title={title} breadcrumbs={breadcrumbs}></PageTitle>
    )
}

export default Payments;