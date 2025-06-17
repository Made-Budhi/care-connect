"use client"

import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useParams} from "react-router";
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DetailRow } from "@/components/detail-row";
import {dateFormat} from "@/lib/utils.ts";
import {Badge} from "@/components/ui/badge.tsx";

interface Child {
    uuid: string;

    // Personal Identity
    picture: string;
    name: string;
    schoolName: string;
    dateOfBirth: string;
    gender: string;

    // Academic data
    grade: string;
    semester: string;
    shoesSize: string;
    shirtSize: string;
    favoriteSubjects: string[];
    hobbies: string[];
    dreams: string;

    // Family data
    fatherName: string;
    fatherJob: string;
    motherName: string;
    siblings: { name: string, gender: string, dateOfBirth: string }[];
}

interface Breadcrumbs {
    name?: string;
    url?: string;
}

function ChildDetail({breadcrumbs}: { breadcrumbs: Breadcrumbs[] }) {
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

    return (
        <div className={"space-y-8"}>
            <PageTitle title={"Foster Child Detail"} breadcrumbs={breadcrumbs} />

            <Card>
                {error && <div>{error}</div>}

                {loading ? (
                    <div className={"my-10 mx-auto"}>
                        <LoadingSpinner />
                    </div>
                ) : data && (
                    <>
                        <CardHeader>
                            <CardTitle>{data?.name}'s Detail</CardTitle>
                        </CardHeader>
                            <Separator />
                        <CardContent className={"space-y-6 lg:flex lg:gap-6"}>
                            {/*Personal data section*/}
                            <section id="personal-data" className={"space-y-6 basis-1/3"}>
                                {/*Picture container*/}
                                <div className="w-full sm:w-1/2 bg-muted rounded-sm overflow-hidden mx-auto">
                                    <img src={data.picture}
                                         alt={data.name}
                                         onError={(e) => {
                                             (e.currentTarget.src = "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80")
                                         }}
                                         className={"object-cover"}/>
                                </div>

                                <div className={"space-y-2"}>
                                    <DetailRow label={"Name"} value={data.name} />
                                    <DetailRow label={"Gender"} value={data.gender} />
                                    <DetailRow label={"School"} value={data.schoolName} />
                                    <DetailRow label={"Date of Birth"} value={dateFormat(data.dateOfBirth)} />
                                </div>
                            </section>

                            <Tabs defaultValue="academic" className={"basis-2/3 mt-12 lg:mt-0"}>
                                <TabsList>
                                    <TabsTrigger value="academic">Academic</TabsTrigger>
                                    <TabsTrigger value="relatives">Relatives</TabsTrigger>
                                </TabsList>

                                <TabsContent value="academic">
                                    <div className={"space-y-2"}>
                                        <DetailRow label={"Grade"} value={data.grade} />
                                        <DetailRow label={"Semester"} value={data.semester} />
                                        <DetailRow label={"Shoes Size (EU)"} value={data.shoesSize} />
                                        <DetailRow label={"Shirt Size"} value={data.shirtSize} />

                                        <div id={"favorite-subjects"} className={"space-y-2 mt-4"}>
                                            <h1 className={"font-semibold my-2"}>Favorite Subjects</h1>
                                            <ul className={"space-x-2"}>
                                                {data.favoriteSubjects.map((subject) => (
                                                    <Badge>{subject}</Badge>
                                                ))}
                                            </ul>
                                        </div>

                                        <div id="hobbies" className={"mt-4"}>
                                            <h1 className={"font-semibold my-2"}>Hobbies</h1>
                                            <ul className={"space-x-2"}>
                                                {data.hobbies.map((hobby) => (
                                                    <Badge>{hobby}</Badge>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="relatives">
                                    <div className={"space-y-2"}>
                                        <DetailRow label={"Father Name"} value={data.fatherName} />
                                        <DetailRow label={"Father Job"} value={data.fatherJob} />
                                        <DetailRow label={"Mother Name"} value={data.motherName} />

                                        <div id={"siblings"} className={"mt-6"}>
                                            <h1 className={"font-semibold my-2"}>Siblings</h1>

                                            <div className={"space-y-4"}>
                                                {data.siblings.map((sibling) => (
                                                    <Card className={""}>
                                                        <CardHeader>
                                                            <CardTitle>{sibling.name}</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <DetailRow label={"Gender"} value={sibling.gender} />
                                                            <DetailRow label={"Date of Birth"} value={dateFormat(sibling.dateOfBirth)} />
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </>)
                }
            </Card>

        </div>
    )
}

export default ChildDetail;