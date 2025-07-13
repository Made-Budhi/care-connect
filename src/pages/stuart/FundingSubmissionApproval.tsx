"use client"

import { useEffect, useState } from "react";
// import { Link } from "react-router";
import PageTitle from "@/components/page-title.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
// import { Button } from "@/components/ui/button.tsx";
import {dateFormat} from "@/lib/utils.ts";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {supabase} from "@/lib/supabaseClient.ts";
import {MoveRight, Plus} from "lucide-react";
import {Link} from "react-router";
import {buttonVariants} from "@/components/ui/button.tsx";

const title = "Funding Submission List";
const breadcrumbs = [
    { name: "Funding Submissions" }
];

// This interface matches the data from the /v1/funding-submissions endpoint
interface FundingSubmissionListItem {
    id: string;
    sponsor_id: {
        name: string;
    };
    matched_child_id: {
        name: string;
    }
    status: 'pending' | 'approved' | 'rejected';
    start_date: string;
    end_date: string;
}

function FundingSubmissionApprovalPage() {
    const [submissions, setSubmissions] = useState<FundingSubmissionListItem[]>([]);
    const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            setError(null);
            try {
                const {data, error} = await supabase.from('funding_submissions').select('*, sponsor_id:sponsor_id (name), matched_child_id:matched_child_id (name)').order('date_requested', { ascending: false });

                if (error) throw error

                setSubmissions(data);

                // Calculate counts after fetching
                const pendingCount = data.filter(s => s.status === 'pending').length;
                const approvedCount = data.filter(s => s.status === 'approved').length;
                const rejectedCount = data.filter(s => s.status === 'rejected').length;
                setCounts({ pending: pendingCount, approved: approvedCount, rejected: rejectedCount });

            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    const StatusBadge = ({ status }: { status: 'pending' | 'approved' | 'rejected' }) => {
        const variant = {
            pending: "secondary",
            approved: "approved",
            rejected: "destructive",
        }[status] as "secondary" | "approved" | "destructive";
        return <Badge variant={variant} className="capitalize">{status}</Badge>;
    };

    const FundingSubmissionCard = ({submission}: {submission: FundingSubmissionListItem}) => (
        <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className={"space-y-4"}>
                <StatusBadge status={submission.status} />

                <div className={"space-y-2"}>
                    <div className={"flex items-center gap-3"}>
                        <p className={"font-semibold text-lg"}>{submission.sponsor_id?.name}</p>
                        <MoveRight />
                        <p className={"font-semibold text-lg"}>{submission.matched_child_id?.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Duration: {dateFormat(submission.start_date)} - {dateFormat(submission.end_date)}
                    </p>
                </div>
            </div>
            {/*<Button asChild variant="outline" size="sm">*/}
            {/*    <Link to={`/stuart/funding/${submission.id}`}>*/}
            {/*        View Details*/}
            {/*    </Link>*/}
            {/*</Button>*/}
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
                        <div className={"flex itemms-center gap-4"}>
                            <Link to={"/stuart/funding/add"} className={`${buttonVariants({variant: "ccbutton"})}`}>
                                <Plus />
                                <p>NEW</p>
                            </Link>
                            <TabsList>
                                <TabsTrigger value={"all"}>All</TabsTrigger>
                                <TabsTrigger value={"pending"}>Pending</TabsTrigger>
                                <TabsTrigger value={"reviewed"}>Reviewed</TabsTrigger>
                            </TabsList>
                        </div>
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
