"use client"

import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useParams} from "react-router";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DetailRow } from "@/components/detail-row";
import {dateFormat} from "@/lib/utils.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {supabase} from "@/lib/supabaseClient.ts";
import {ImageViewer} from "@/components/image-viewer.tsx";

interface Child {
    created_at: string
    date_of_birth: string
    dreams: string | null
    father_job: string | null
    father_name: string | null
    favorite_subjects: string[] | null
    funding_status: string
    gender: "Male" | "Female"
    grade: string | null
    hobbies: string[] | null
    id: string
    mother_name: string | null
    name: string
    picture_url: string | null
    school: {
        name: string
    } | null
    semester: "even" | "odd"
    shirt_size: string | null
    shoes_size: string | null
    siblings: {
        date_of_birth: string
        gender: "Male" | "Female"
        name: string
    }[] | null
}

interface Breadcrumbs {
    name?: string;
    url?: string;
}

function ChildDetail({breadcrumbs}: { breadcrumbs: Breadcrumbs[] }) {
    const [data, setData] = useState<Child>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [activeImageUrl, setActiveImageUrl] = useState("");

    const openImageViewer = (url: string) => {
        setActiveImageUrl(url);
        setIsViewerOpen(true);
    };

    const {uuid} = useParams();

    useEffect(() => {
        const fetchChildren = async () => {
            setLoading(true);

            try {
                const {data, error} = await supabase.from('children').select('*, school_name:school_id (name)').eq('id', uuid).single();

                if (error) throw error.message

                if (data.picture_url) {
                    const { data: image, error } = await supabase
                        .storage
                        .from('children-profile-picture') // Your public bucket name
                        .createSignedUrl(data.picture_url, 3600)

                    if (error) throw error.message

                    setImageUrl(image?.signedUrl);
                }

                setData(data);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchChildren()
    }, [uuid]);

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
                                <div className="w-full sm:w-1/2 bg-muted rounded-sm overflow-hidden mx-auto cursor-pointer"
                                onClick={imageUrl ? (() => openImageViewer(imageUrl)) : undefined}>
                                    <img src={imageUrl ? imageUrl : "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"}
                                         alt={data.name}
                                         onError={(e) => {
                                             (e.currentTarget.src = "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80")
                                         }}
                                         className={"object-cover"}/>
                                </div>

                                <div className={"space-y-2"}>
                                    <DetailRow label={"Name"} value={data.name} />
                                    <DetailRow label={"Gender"} value={data.gender} />
                                    <DetailRow label={"School"} value={data.school?.name} />
                                    <DetailRow label={"Date of Birth"} value={dateFormat(data.date_of_birth)} />
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
                                        <DetailRow label={"Shoes Size (EU)"} value={data.shoes_size} />
                                        <DetailRow label={"Shirt Size"} value={data.shirt_size} />

                                        <div id={"favorite-subjects"} className={"space-y-2 mt-4"}>
                                            <h1 className={"font-semibold my-2"}>Favorite Subjects</h1>
                                            <ul className={"space-x-2"}>
                                                {data.favorite_subjects?.map((subject, index) => (
                                                    <Badge key={index}>{subject}</Badge>
                                                ))}
                                            </ul>
                                        </div>

                                        <div id="hobbies" className={"mt-4"}>
                                            <h1 className={"font-semibold my-2"}>Hobbies</h1>
                                            <ul className={"space-x-2"}>
                                                {data.hobbies?.map((hobby, index) => (
                                                    <Badge key={index}>{hobby}</Badge>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="relatives">
                                    <div className={"space-y-2"}>
                                        <DetailRow label={"Father Name"} value={data.father_name} />
                                        <DetailRow label={"Father Job"} value={data.father_job} />
                                        <DetailRow label={"Mother Name"} value={data.mother_name} />

                                        <div id={"siblings"} className={"mt-6"}>
                                            <h1 className={"font-semibold my-2"}>Siblings</h1>

                                            <div className={"space-y-4"}>
                                                {data.siblings?.map((sibling, index) => (
                                                    <Card key={index}>
                                                        <CardHeader>
                                                            <CardTitle>{sibling.name}</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <DetailRow label={"Gender"} value={sibling.gender} />
                                                            <DetailRow label={"Date of Birth"} value={dateFormat(sibling.date_of_birth)} />
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

            {activeImageUrl && (
                <ImageViewer
                    imageUrl={activeImageUrl}
                    isOpen={isViewerOpen}
                    onOpenChange={setIsViewerOpen}
                />
            )}
        </div>
    )
}

export default ChildDetail;