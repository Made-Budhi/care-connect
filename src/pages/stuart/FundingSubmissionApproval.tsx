"use client"

import { useEffect, useState } from "react";
import { Link } from "react-router";
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import PageTitle from "@/components/page-title.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { dateTimeFormat } from "@/lib/utils.ts";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";

const title = "Funding Submission List";
const breadcrumbs = [
    { name: "Funding Submissions" }
];

// This interface matches the data from the /v1/funding-submissions endpoint
interface FundingSubmissionListItem {
    uuid: string;
    sponsorName: string
    status: 'pending' | 'approved' | 'rejected';
    date_requested: string;
    period: number;
}

function FundingSubmissionApprovalPage() {
    const [submissions, setSubmissions] = useState<FundingSubmissionListItem[]>([]);
    const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axiosPrivate.get("/v1/funding-submissions");
                const data: FundingSubmissionListItem[] = response.data;
                setSubmissions(data);

                // Calculate counts after fetching
                const pendingCount = data.filter(s => s.status === 'pending').length;
                const approvedCount = data.filter(s => s.status === 'approved').length;
                const rejectedCount = data.filter(s => s.status === 'rejected').length;
                setCounts({ pending: pendingCount, approved: approvedCount, rejected: rejectedCount });

            } catch (err) {
                console.error("Failed to fetch funding submissions", err);
                setError("Failed to load submissions. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [axiosPrivate]);

    const StatusBadge = ({ status }: { status: 'pending' | 'approved' | 'rejected' }) => {
        const variant = {
            pending: "secondary",
            approved: "approved",
            rejected: "destructive",
        }[status] as "secondary" | "approved" | "destructive";
        return <Badge variant={variant} className="capitalize">{status}</Badge>;
    };

    const FundingSubmissionCard = ({submission}: {submission: FundingSubmissionListItem}) => (
        <div key={submission.uuid} className="flex items-center justify-between p-4 border rounded-lg">
            <div className={"space-y-4"}>
                <StatusBadge status={submission.status} />

                <div className={"space-y-2"}>
                    <p className={"font-semibold text-lg"}>{submission.sponsorName}</p>
                    <p className="text-xs text-muted-foreground">
                        Requested on {dateTimeFormat(submission.date_requested)}
                    </p>
                </div>
            </div>
            <Button asChild variant="outline" size="sm">
                <Link to={`/stuart/funding/${submission.uuid}`}>
                    View Details
                </Link>
            </Button>
        </div>
    )

    const StatisticCard = ({title, count}: {title: string, count: number}) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold md:text-4xl md:font-semibold">{count}</div>
            </CardContent>
        </Card>
    )

    if (loading) {
        return (
            <div className="space-y-8">
                <PageTitle title={title} breadcrumbs={breadcrumbs} />
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8">
                <PageTitle title={title} breadcrumbs={breadcrumbs} />
                <p className="text-center text-red-500">{error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <PageTitle title={title} breadcrumbs={breadcrumbs} />

            {/* Submission Counts Section */}
            <div className="grid gap-3 sm:grid-cols-3">
                <StatisticCard title={"Pending"} count={counts.pending} />
                <StatisticCard title={"Approved"} count={counts.approved} />
                <StatisticCard title={"Rejected"} count={counts.rejected} />
            </div>

            {/* Submissions List Card */}
            <Card>
                <CardContent>
                    <Tabs defaultValue={"all"}>
                        <TabsList>
                            <TabsTrigger value={"all"}>All</TabsTrigger>
                            <TabsTrigger value={"pending"}>Pending</TabsTrigger>
                            <TabsTrigger value={"reviewed"}>Reviewed</TabsTrigger>
                        </TabsList>
                        <TabsContent value={"all"} className="space-y-4">
                            {submissions.length > 0 ? submissions.map((submission) => (
                                <FundingSubmissionCard submission={submission} />
                            )) : (
                                <p className="text-center text-muted-foreground py-8">No submissions found.</p>
                            )}
                        </TabsContent>

                        <TabsContent value={"pending"} className="space-y-4">
                            {counts.pending > 0 ? submissions
                                .filter(submission => submission.status === "pending")
                                .map((submission) => (
                                    <FundingSubmissionCard submission={submission} />
                                )) : (
                                <p className="text-center text-muted-foreground py-8">No pending submissions found.</p>
                            )}
                        </TabsContent>
                        <TabsContent value={"reviewed"} className="space-y-4">
                            {counts.approved > 0 || counts.rejected > 0 ? submissions
                                .filter(submission => submission.status === "approved" || submission.status === "rejected") // Filter approved & rejected submissions
                                .map((submission) => (
                                    <FundingSubmissionCard submission={submission} />
                                )) : (
                                <p className="text-center text-muted-foreground py-8">No approved or rejected submissions found.</p>
                            )}

                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

export default FundingSubmissionApprovalPage;
