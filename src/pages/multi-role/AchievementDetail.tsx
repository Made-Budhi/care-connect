"use client"

import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useParams} from "react-router";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { DetailRow } from "@/components/detail-row"; // Assuming you have this component
import {dateFormat} from "@/lib/utils.ts"; // Assuming you have this utility
import {Badge} from "@/components/ui/badge.tsx";
import {supabase} from "@/lib/supabaseClient.ts";
import {ImageViewer} from "@/components/image-viewer.tsx";

interface Breadcrumbs {
    name?: string;
    url?: string;
}

// Interface for the Achievement entity, matching the Supabase table structure
interface Achievement {
    achievement_type: "academic" | "non-academic";
    child_id: string;
    created_at: string;
    date_achieved: string;
    description: string | null;
    id: string;
    image_url: string | null; // This will be the path to the image in the bucket
    title: string;
}

function AchievementDetail({ breadcrumbs }: { breadcrumbs: Breadcrumbs[]}) {
    const [achievement, setAchievement] = useState<Achievement | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null); // State to hold the temporary signed URL
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [activeImageUrl, setActiveImageUrl] = useState("");

    const { uuid } = useParams<{ uuid: string }>();

    const openImageViewer = (url: string) => {
        setActiveImageUrl(url);
        setIsViewerOpen(true);
    };

    // const breadcrumbs: Breadcrumbs[] = [
    //     { name: "Dashboard", url: "/dashboard" },
    //     // These would be dynamic in a real app
    //     { name: "Child Achievements", url: "#" },
    //     { name: "Achievement Detail" }
    // ];

    useEffect(() => {
        if (!uuid) {
            setError("Achievement UUID is missing from the URL.");
            setLoading(false);
            return;
        }

        const fetchAchievement = async () => {
            setLoading(true);
            setError(null);
            try {
                // Step 1: Fetch the achievement record from the database
                const { data, error: fetchError } = await supabase
                    .from('achievements')
                    .select('*')
                    .eq('id', uuid)
                    .single();

                if (fetchError) throw fetchError;
                if (!data) throw new Error("Achievement not found.");

                setAchievement(data);

                // Step 2: If an image path exists, create a signed URL for it
                if (data.image_url) {
                    const { data: signedUrlData, error: urlError } = await supabase
                        .storage
                        .from('children-achievement') // Your private bucket name
                        .createSignedUrl(data.image_url, 3600); // URL is valid for 1 hour (3600 seconds)

                    if (urlError) throw urlError;

                    setImageUrl(signedUrlData.signedUrl);
                }

            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(error.message || "Failed to load achievement data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAchievement();
    }, [uuid]);

    return (
        <div className="space-y-8">
            <PageTitle title={"Achievement Detail"} breadcrumbs={breadcrumbs} />

            <Card>
                {loading ? (
                    <div className="my-10 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : achievement && (
                    <div className="lg:grid lg:grid-cols-2 lg:gap-10 p-6">
                        {/* Image Section */}
                        <section id="achievement-image" className="mb-6 lg:mb-0">
                            <div className="w-full bg-muted rounded-lg overflow-hidden aspect-video cursor-pointer"
                                 onClick={imageUrl ? (() => openImageViewer(imageUrl)) : undefined}>
                                <img
                                    src={imageUrl || "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image"}
                                    alt={achievement.title}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </section>

                        {/* Details Section */}
                        <section id="achievement-details" className="space-y-6">
                            <CardHeader className="p-0">
                                <Badge
                                    variant={achievement.achievement_type === 'academic' ? 'default' : 'secondary'}
                                    className="capitalize w-fit"
                                >
                                    {achievement.achievement_type}
                                </Badge>

                                <div className={"space-y-4"}>
                                    <CardTitle className="pt-2 text-2xl">{achievement.title}</CardTitle>
                                    <CardDescription>{achievement.description || "No description provided."}</CardDescription>
                                </div>
                                <Separator className="my-3" />
                            </CardHeader>
                            <CardContent className="p-0 space-y-2">
                                <DetailRow label={"Date Achieved"} value={dateFormat(achievement.date_achieved)} />
                            </CardContent>
                        </section>
                    </div>
                )}

                {error && <div className="p-6 text-center text-red-500">{error}</div>}
            </Card>

            {activeImageUrl && (
                <ImageViewer
                    imageUrl={activeImageUrl}
                    isOpen={isViewerOpen}
                    onOpenChange={setIsViewerOpen}
                />
            )}
        </div>
    );
}

export default AchievementDetail;
