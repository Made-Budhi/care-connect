"use client"

import { useEffect, useState } from "react";
import { Link } from "react-router";
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
import { MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {toast} from "sonner";
import {supabase} from "@/lib/supabaseClient.ts";

const title = "News Management";
const breadcrumbs = [
    { name: "News" }
];

// This interface now includes the temporary, signed URL for display
interface NewsArticle extends News {
    display_picture_url: string | null;
}

// Interface for the raw data from the 'news' table
interface News {
    id: string;
    title: string;
    created_at: string;
    picture_url: string | null;
    description: string;
    author_id: {
        id: string;
        name: string;
    }
}

const PAGE_SIZE = 6; // Display 6 articles per page

function NewsListPage() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(0); // 0-indexed
    const [hasNextPage, setHasNextPage] = useState(false);

    const fetchNews = async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            // --- BEST PRACTICE: PAGINATION ---
            // 1. Calculate the range of data to fetch from the database.
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            // 2. Fetch one "page" of news articles.
            const { data: articles, error: dbError } = await supabase
                .from('news')
                .select('*, author_id (id, name)', { count: 'exact' }) // Fetch total count to check for next page
                .order('created_at', { ascending: false })
                .range(from, to);

            if (dbError) throw dbError;

            // 3. Check if there is a next page.
            const totalCount = articles?.length ? (await supabase.from('news').select('*', { count: 'exact', head: true })).count : 0;
            setHasNextPage(totalCount ? to < totalCount - 1 : false);

            // 4. Fetch signed URLs for the images on the CURRENT page only.
            const articlesWithSignedUrls = await Promise.all(
                (articles || []).map(async (article) => {
                    let display_picture_url = "https://placehold.co/600x400?text=No+Image";
                    if (article.picture_url) {
                        const { data: signedUrlData, error: urlError } = await supabase
                            .storage
                            .from('news')
                            .createSignedUrl(article.picture_url, 3600); // URL valid for 1 hour

                        if (urlError) {
                            toast.error("Failed to generate signed URL for image.", { description: urlError.message });
                        } else {
                            display_picture_url = signedUrlData.signedUrl;
                        }
                    }
                    return { ...article, display_picture_url };
                })
            );

            setNews(articlesWithSignedUrls);

        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setError(error.message || "Failed to load news articles.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews(currentPage);
    }, [currentPage]); // Refetch whenever the page changes

    const handleDelete = async (article: NewsArticle) => {
        try {
            // First, delete the image from storage if it exists
            if (article.picture_url) {
                await supabase.storage.from('news').remove([article.picture_url]);
            }
            // Then, delete the record from the database
            await supabase.from('news').delete().eq('id', article.id);
            toast.success("Article deleted successfully.");
            // Refresh the current page
            fetchNews(currentPage);
        } catch(error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            toast.error("Failed to delete article.", { description: error.message });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <PageTitle title={title} breadcrumbs={breadcrumbs} />
                <Button asChild variant={"ccbutton"}>
                    <Link to="/admin/news/add">Add New Article</Link>
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>
            ) : error ? (
                <div className="text-center text-red-500">{error}</div>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {news.length > 0 ? news.map((article) => (
                            <Card key={article.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="aspect-video w-full bg-muted rounded-md overflow-hidden mb-4">
                                        <img
                                            src={article.display_picture_url || "https://placehold.co/600x400?text=No+Image"}
                                            alt={article.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <CardTitle className="text-lg leading-snug">{article.title}</CardTitle>
                                    <CardDescription>Author: {article.author_id.name}</CardDescription>
                                    <CardDescription>{dateTimeFormat(article.created_at)}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-sm text-muted-foreground line-clamp-3">{article.description}</p>
                                </CardContent>
                                <CardFooter className="flex justify-end">
                                    <AlertDialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /><span className="sr-only">Options</span></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild><Link to={`/news/${article.id}`}>View Article</Link></DropdownMenuItem>
                                                <DropdownMenuItem asChild><Link to={`/admin/news/${article.id}/edit`}>Edit Article</Link></DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-600 focus:text-red-600">Delete Article</DropdownMenuItem></AlertDialogTrigger>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will permanently delete the article: "<span className="font-semibold">{article.title}</span>".</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction className={"bg-red-600"} onClick={() => handleDelete(article)}>Yes, delete it</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardFooter>
                            </Card>
                        )) : (
                            <div className="col-span-full text-center text-muted-foreground py-16">
                                <p>No news articles found.</p>
                                <Button asChild variant="link"><Link to="/admin/news/add">Create the first one</Link></Button>
                            </div>
                        )}
                    </div>

                    {/* --- PAGINATION CONTROLS --- */}
                    <div className="flex items-center justify-center space-x-2 pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            disabled={currentPage === 0}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                        </Button>
                        <span className="text-sm font-medium">Page {currentPage + 1}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={!hasNextPage}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

export default NewsListPage;
