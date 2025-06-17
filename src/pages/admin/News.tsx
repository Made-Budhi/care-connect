"use client"

import { useEffect, useState } from "react";
import { Link } from "react-router";
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import PageTitle from "@/components/page-title.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { dateTimeFormat } from "@/lib/utils.ts";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    // DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";

const title = "News Management";
const breadcrumbs = [
    { name: "News" }
];

// This interface matches the data from the /v1/news endpoint
interface News {
    uuid: string;
    title: string;
    dateCreated: string;
    picture: string;
    description: string;
}

function NewsListPage() {
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosPrivate.get("/v1/news");
            setNews(response.data);
        } catch (err) {
            console.error("Failed to fetch news", err);
            setError("Failed to load news articles. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [axiosPrivate]);

    const handleDelete = async (newsId: string) => {
        try {
            await axiosPrivate.delete(`/v1/news/${newsId}`);
            // Refetch the list to reflect the deletion
            await fetchNews();
        } catch(err) {
            console.error(`Failed to delete news article ${newsId}`, err);
            // In a real app, you would show a toast notification
            alert("Failed to delete the article.");
        }
    };

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
            <div className="flex justify-between items-center">
                <PageTitle title={title} breadcrumbs={breadcrumbs} />
                <Button asChild>
                    <Link to="/admin/news/add">Add New Article</Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {news.length > 0 ? news.map((article) => (
                    <Card key={article.uuid} className="flex flex-col">
                        <CardHeader>
                            <div className="aspect-video w-full bg-muted rounded-md overflow-hidden mb-4">
                                <img
                                    src={article.picture}
                                    alt={article.title}
                                    className="h-full w-full object-cover"
                                    onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400?text=News+Image" }}
                                />
                            </div>
                            <CardTitle className="text-lg leading-snug">{article.title}</CardTitle>
                            <CardDescription>{dateTimeFormat(article.dateCreated)}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground line-clamp-3">{article.description}</p>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">Article Options</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {/*<DropdownMenuItem asChild>*/}
                                        {/*    <Link to={`/admin/news/${article.uuid}/edit`}>*/}
                                        {/*        Edit Article*/}
                                        {/*    </Link>*/}
                                        {/*</DropdownMenuItem>*/}
                                        {/*<DropdownMenuSeparator />*/}
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                                Delete Article
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the article titled "<span className="font-semibold">{article.title}</span>".
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(article.uuid)}>
                                            Yes, delete it
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                )) : (
                    <div className="col-span-full text-center text-muted-foreground py-16">
                        <p>No news articles found.</p>
                        <Button asChild variant="link">
                            <Link to="/admin/news/add">Create the first one</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NewsListPage;
