import { z } from "zod";
import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useParams} from "react-router";
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";

const title = "Foster Child Detail"
const breadcrumbs = [
    {
        name: "Foster Child List",
        url: "/sponsor/children",
    },
    {
        name: "Detail"
    }
]

interface Child {
    uuid: string;
    name: string;
    schoolName: string;
    dateOfBirth: string;
    gender: string;
    grade: string;
    semester: string;
    shoesSize: string;
    shirtSize: string;
    fatherName: string;
    fatherJob: string;
    motherName: string;
    siblings: { name: string, gender: string, dateOfBirth: string }[];
    favoriteSubjects: string[];
    hobbies: string[];
    dreams: string;
    picture: string;
}

export const childSchema = z.object({
    name: z.string().min(1),
    schoolName: z.string(),
    dateOfBirth: z.string(),
    gender: z.enum(["male", "female"]),
    grade: z.string(),
    semester: z.string(),
    shoesSize: z.string(),
    shirtSize: z.string(),
    fatherName: z.string(),
    fatherJob: z.string(),
    motherName: z.string(),
    siblings: z.array(z.object({
        name: z.string(),
        gender: z.string(),
        dateOfBirth: z.string()
    })),
    favoriteSubjects: z.array(z.string()),
    hobbies: z.array(z.string()),
    dreams: z.string(),
    picture: z.string().url()
});

function ViewOrEditChild() {
    const [data, setData] = useState<Child>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate()

    const {uuid} = useParams();

    useEffect(() => {
        const fetchChildren = async () => {
            setLoading(true);

            try {
                const response = await axiosPrivate.get(`/v1/children/${uuid}`);
                setData(response.data);
            } catch (error) {
                console.error(error);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchChildren()
    }, []);


    // const onSubmit = async (data: ChildFormValues) => {
    //     if (mode === "edit") {
    //         await axios.put(`/api/children/${uuid}`, data);
    //     }
    // };

    return (
        <div className={"space-y-8"}>
            <PageTitle title={title} breadcrumbs={breadcrumbs} />

            <Card>
                {error && <div>{error}</div>}

                {loading ? (
                    <div className={"my-10 mx-auto"}>
                        <LoadingSpinner />
                    </div>
                ) :
                    <>
                        <CardHeader>
                            <CardTitle>{data?.name}'s Detail</CardTitle>
                        </CardHeader>
                            <Separator />
                        <CardContent>

                        </CardContent>
                    </>
                }
            </Card>

        </div>
    )
}

export default ViewOrEditChild;