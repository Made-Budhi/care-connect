"use client"

import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useParams} from "react-router";
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { DetailRow } from "@/components/detail-row";

interface Breadcrumbs {
    name?: string;
    url?: string;
}

// Interface for the detailed School entity from the mock API
interface SchoolDetail {
    uuid: string;
    userUuid: string;
    name: string;
    region: string;
    address: string;
    latitude: number;
    longitude: number;
}

function SchoolDetailPage() {
    const [data, setData] = useState<SchoolDetail>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();

    const { uuid } = useParams<{ uuid: string }>();

    const breadcrumbs: Breadcrumbs[] = [
        { name: "School List", url: "/admin/schools" },
        { name: "Detail" }
    ];

    useEffect(() => {
        if (!uuid) {
            setError("School UUID is missing from the URL.");
            setLoading(false);
            return;
        }

        const fetchSchoolDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axiosPrivate.get(`/v1/schools/${uuid}`);
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch school details:", error);
                setError("Failed to load school data.");
            } finally {
                setLoading(false);
            }
        };

        fetchSchoolDetail();
    }, [uuid, axiosPrivate]);

    // Component to render the interactive map
    const SchoolMap = ({ lat, lon, name }: { lat: number, lon: number, name: string }) => {
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
                        <CardTitle className="text-2xl">{data.name}</CardTitle>
                        <CardDescription>{data.address}</CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent className="py-6 grid lg:grid-cols-2 gap-10">
                        {/* Left Column: Details */}
                        <div className="space-y-8">
                            <div className={"space-y-4"}>
                                <h3 className="font-semibold text-lg">School Information</h3>
                                <DetailRow label="School Name" value={data.name} />
                                <DetailRow label="Region" value={data.region} />
                                <DetailRow label="Full Address" value={data.address} />
                            </div>

                            <div className={"space-y-4"}>
                                <h3 className="font-semibold text-lg">Administrative Details</h3>
                                {/*TODO: Replace with manager's name*/}
                                <DetailRow label="School Manager UUID" value={<span className="font-mono text-xs">{data.userUuid}</span>} />
                                <DetailRow label="School UUID" value={<span className="font-mono text-xs">{data.uuid}</span>} />
                            </div>
                        </div>

                        {/* Right Column: Map */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Location</h3>
                            <SchoolMap lat={data.latitude} lon={data.longitude} name={data.name} />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default SchoolDetailPage;
