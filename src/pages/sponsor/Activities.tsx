import PageTitle from "@/components/page-title.tsx";

const title = "Activities"
const breadcrumbs = [
    {
        name: "Activities",
    }
]

function Activities() {
    return (
        <PageTitle title={title} breadcrumbs={breadcrumbs}></PageTitle>
    )
}

export default Activities;