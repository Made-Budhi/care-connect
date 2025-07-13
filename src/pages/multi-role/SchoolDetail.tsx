"use client"

import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useParams} from "react-router";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { DetailRow } from "@/components/detail-row";
import {supabase} from "@/lib/supabaseClient.ts";
import useAuth from "@/hooks/useAuth.tsx";

interface Breadcrumbs {
    name?: string;
    url?: string;
}

// Interface for the detailed School entity from the mock API
interface SchoolDetail {
    address: string
    created_at: string
    deleted: boolean | null
    id: string
    latitude: number | null
    longitude: number | null
    manager_id: {
        name: string | null;
        email: string | null;
    }
    name: string
    region: string | null
}

function SchoolDetailPage() {
    const [data, setData] = useState<SchoolDetail>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {auth} = useAuth();
    
    const { uuid } = useParams<{ uuid: string }>();

    // TODO: create dynamic breadcrumbs
    const breadcrumbs: Breadcrumbs[] = [
        { name: "School List", url: `/${auth.role}/schools` },
        { name: "Detail" }
    ];

    useEffect(() => {
        if (!uuid) {
            setError("Cannot fetch school details. UUID is missing from the URL.");
            setLoading(false);
            return;
        }

        const fetchSchoolDetail = async () => {
            setLoading(true);
            setError(null);

            try {
                const {data, error} = await supabase
                    .from('schools')
                    .select('*, manager_id (name, email)')
                    .eq('id', uuid)
                    .single();

                if (error) throw error;

                setData(data);
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSchoolDetail();
    }, [uuid]);

    // Component to render the interactive map
    const SchoolMap = ({ lat, lon, name }: { lat: number | null, lon: number | null, name: string }) => {
        if (!lat || !lon) {
            lat = 0
            lon = 0
        }
        // We construct an embeddable URL for OpenStreetMap.
        // The marker pinpoints the exact location.
        // The bbox (bounding box) defines the view area, creating a nice zoom level.
        const zoom = 0.005;
        const bbox = `${lon - zoom},${lat - zoom},${lon + zoom},${lat + zoom}`;
        const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

        return (
            <div className="w-full bg-muted rounded-lg overflow-hidden aspect-video border">
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={mapSrc}
                    title={`Map showing location of ${name}`}
                    style={{ border: 'none' }}
                ></iframe>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <PageTitle title={"School Detail"} breadcrumbs={breadcrumbs} />
                <div className="my-10 flex justify-center">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8">
                <PageTitle title={"School Detail"} breadcrumbs={breadcrumbs} />
                <p className="text-center text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageTitle title={"School Detail"} breadcrumbs={breadcrumbs} />

            {data && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{data?.name}</CardTitle>
                        <CardDescription>{data?.address}</CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent className="py-6 grid lg:grid-cols-2 gap-10">
                        {/* Left Column: Details */}
                        <div className="space-y-8">
                            <div className={"space-y-4"}>
                                <h3 className="font-semibold text-lg">School Information</h3>
                                <DetailRow label="School Name" value={data?.name} />
                                <DetailRow label="Region" value={data?.region} />
                                <DetailRow label="Full Address" value={data?.address} />
                            </div>

                            <div className={"space-y-4"}>
                                <h3 className="font-semibold text-lg">Administrative Details</h3>
                                <DetailRow label="School Manager" value={<span>{data.manager_id?.name}</span>} />
                                <DetailRow label="School Manager's E-mail" value={<span className={"underline"}>{data.manager_id?.email}</span>} />
                            </div>
                        </div>

                        {/* Right Column: Map */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Location</h3>
                            <SchoolMap lat={data?.latitude} lon={data?.longitude} name={data.name} />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default SchoolDetailPage;
