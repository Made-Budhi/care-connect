"use client"

import { useEffect, useState } from "react";
import { Link } from "react-router";
import PageTitle from "@/components/page-title.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { dateTimeFormat } from "@/lib/utils.ts";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import useAuth from "@/hooks/useAuth.tsx";
import { supabase } from "@/lib/supabaseClient.ts";

const title = "Activity Submissions";
const breadcrumbs = [
    { name: "Dashboard", url: "/dashboard" },
    { name: "Activity Submissions" }
];

// This interface matches the data shape from our Supabase query
interface ActivitySubmissionListItem {
    id: string;
    title: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    sponsor_id: { name: string } | null;
    child_id: {
        name: string;
    } | null;
}

function ActivitySubmissionApprovalPage() {
    const [submissions, setSubmissions] = useState<ActivitySubmissionListItem[]>([]);
    const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { auth } = useAuth();

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            setError(null);

            try {
                let query = supabase
                    .from('activities')
                    .select("*, sponsor_id ( name ), child_id ( name ) ");

                // Admin role fetches all submissions directly
                if (auth?.role === 'admin') {
                    // No additional filter needed for admin
                }
                // School role performs a two-step fetch
                else if (auth?.role === 'school' && auth.uuid) {
                    // Step 1: Find the school managed by the logged-in user
                    const { data: schoolData, error: schoolError } = await supabase
                        .from('schools')
                        .select('id')
                        .eq('manager_id', auth.uuid)
                        .single();

                    if (schoolError) throw new Error("Could not find your associated school.");
                    if (!schoolData) throw new Error("No school is associated with your account.");

                    // Step 2: Filter the main query by the found school_id
                    query = query.eq('school_id', schoolData.id);
                } else {
                    // If no valid role or UUID, prevent the API call
                    throw new Error("You do not have permission to view this page or your account is not properly configured.");
                }

                // Execute the final query
                const { data, error: submissionsError } = await query.order('created_at', { ascending: false });

                if (submissionsError) throw submissionsError;

                const submissionsData = data as ActivitySubmissionListItem[];
                setSubmissions(submissionsData);

                // Calculate counts after fetching
                const pendingCount = submissionsData.filter(s => s.status === 'pending').length;
                const approvedCount = submissionsData.filter(s => s.status === 'approved').length;
                const rejectedCount = submissionsData.filter(s => s.status === 'rejected').length;
                setCounts({ pending: pendingCount, approved: approvedCount, rejected: rejectedCount });

            } catch (err) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(err.message || "Failed to load submissions. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (auth) {
            fetchSubmissions();
        } else {
            // Handle case where auth context is not yet available
            setLoading(false);
            setError("Authentication context not available. Please log in.");
        }
    }, [auth]);

    const StatusBadge = ({ status }: { status: 'pending' | 'approved' | 'rejected' }) => {
        const variant = {
            pending: "secondary",
            approved: "approved",
            rejected: "destructive",
        }[status] as "secondary" | "approved" | "destructive";
        return <Badge variant={variant} className="capitalize">{status}</Badge>;
    };

    const ActivitySubmissionCard = ({submission}: {submission: ActivitySubmissionListItem}) => (
        <div key={submission.id} className="space-y-6 sm:flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-4">
                <StatusBadge status={submission.status} />
                <div className="space-y-1">
                    <p className="font-semibold text-lg">{submission.title}</p>
                    <p className="text-sm text-muted-foreground">
                        For <span className="font-medium text-primary">{submission.child_id?.name || 'N/A'}</span> by <span className="font-medium text-primary">{submission.sponsor_id?.name || 'N/A'}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Requested at {dateTimeFormat(submission.created_at)}
                    </p>
                </div>
            </div>
            <Button asChild variant="outline" size="sm">
                <Link to={`/school/activities/${submission.id}`}>
                    View Details
                </Link>
            </Button>
        </div>
    );

    const StatisticCard = ({title, count}: {title: string, count: number}) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold md:text-4xl">{count}</div>
            </CardContent>
        </Card>
    );

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
                <CardContent className="">
                    <Tabs defaultValue="all">
                        <TabsList className="">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="space-y-4 mt-4">
                            {submissions.length > 0 ? submissions.map((submission) => (
                                <ActivitySubmissionCard key={submission.id} submission={submission} />
                            )) : (
                                <p className="text-center text-muted-foreground py-8">No submissions found.</p>
                            )}
                        </TabsContent>

                        <TabsContent value="pending" className="space-y-4 mt-4">
                            {counts.pending > 0 ? submissions
                                .filter(submission => submission.status === "pending")
                                .map((submission) => (
                                    <ActivitySubmissionCard key={submission.id} submission={submission} />
                                )) : (
                                <p className="text-center text-muted-foreground py-8">No pending submissions found.</p>
                            )}
                        </TabsContent>
                        <TabsContent value="reviewed" className="space-y-4 mt-4">
                            {counts.approved > 0 || counts.rejected > 0 ? submissions
                                .filter(submission => submission.status === "approved" || submission.status === "rejected")
                                .map((submission) => (
                                    <ActivitySubmissionCard key={submission.id} submission={submission} />
                                )) : (
                                <p className="text-center text-muted-foreground py-8">No reviewed submissions found.</p>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

export default ActivitySubmissionApprovalPage;
