"use client"

import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useParams} from "react-router";
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { DetailRow } from "@/components/detail-row"; // Assuming you have this component
import {dateFormat} from "@/lib/utils.ts"; // Assuming you have this utility
import {Badge} from "@/components/ui/badge.tsx";

interface Breadcrumbs {
    name?: string;
    url?: string;
}

// Interface for the Achievement entity, matching the mock API
interface Achievement {
    uuid: string;
    title: string;
    description: string;
    achievementType: 'academic' | 'non-academic';
    image: string;
    date: string;
}

function AchievementDetail({breadcrumbs}: { breadcrumbs: Breadcrumbs[]}) {
    const [data, setData] = useState<Achievement>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();

    // The UUID for the achievement is fetched from the URL parameters
    const { uuid } = useParams<{ uuid: string }>();

    useEffect(() => {
        if (!uuid) {
            setError("Achievement UUID is missing from the URL.");
            return;
        }

        const fetchAchievement = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axiosPrivate.get(`/v1/achievements/${uuid}`);
                setData(response.data);
            } catch (error) {
                console.error(error);
                setError("Failed to load achievement data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAchievement();
    }, [axiosPrivate, uuid]);

    return (
        <div className="space-y-8">
            <PageTitle title={"Achievement Detail"} breadcrumbs={breadcrumbs} />

            <Card>
                {error && <div className="p-6 text-center text-red-500">{error}</div>}

                {loading ? (
                    <div className="my-10 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : data && (
                    <div className="lg:grid lg:grid-cols-2 lg:gap-10 p-6">
                        {/* Image Section */}
                        <section id="achievement-image" className="mb-6 lg:mb-0">
                            <div className="w-full bg-muted rounded-lg overflow-hidden aspect-video">
                                <img
                                    src={data.image}
                                    alt={data.title}
                                    onError={(e) => {
                                        // A more relevant placeholder for achievements
                                        (e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/64748b?text=Achievement+Image")
                                    }}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </section>

                        {/* Details Section */}
                        <section id="achievement-details" className="space-y-6">
                            <CardHeader className="p-0">
                                <Badge
                                    variant={data.achievementType === 'academic' ? 'default' : 'secondary'}
                                    className="capitalize w-fit"
                                >
                                    {data.achievementType}
                                </Badge>

                                <CardTitle className="pt-2 text-2xl">{data.title}</CardTitle>
                                <CardDescription>{data.description}</CardDescription>
                            </CardHeader>
                            <Separator/>
                            <CardContent className="p-0 space-y-2">
                                {/* Add more details here if needed */}
                                <DetailRow label={"Date Achieved"} value={dateFormat(data.date)} />
                            </CardContent>
                        </section>
                    </div>
                )}
            </Card>
        </div>
    );
}

export default AchievementDetail;
