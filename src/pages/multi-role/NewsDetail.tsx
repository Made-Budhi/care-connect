"use client"

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import PageTitle from "@/components/page-title.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
// import { Card, CardContent } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { dateTimeFormat } from "@/lib/utils.ts";
import { supabase } from "@/lib/supabaseClient.ts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Footer from "@/components/ui/footer.tsx";

// Interface for the joined data we expect from Supabase
interface NewsArticle {
    id: string;
    title: string;
    created_at: string;
    picture_url: string | null;
    description: string;
    author: { // Assuming a relationship to the profiles table
        name: string;
        avatar_url: string | null; // Optional author avatar
    } | null;
}

function ViewNewsArticlePage() {
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { uuid } = useParams<{ uuid: string }>();

    useEffect(() => {
        if (!uuid) {
            setError("Article ID is missing from the URL.");
            setLoading(false);
            return;
        }

        const fetchArticle = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch the article and join with the author's profile information
                const { data, error: fetchError } = await supabase
                    .from('news')
                    .select(`
                        *,
                        author:author_id ( name )
                    `)
                    .eq('id', uuid)
                    .single();

                if (fetchError) throw fetchError;
                if (!data) throw new Error("Article not found.");

                setArticle(data);

                // If an image path exists, create a signed URL for it
                if (data.picture_url) {
                    const { data: signedUrlData, error: urlError } = await supabase
                        .storage
                        .from('news')
                        .createSignedUrl(data.picture_url, 3600); // URL is valid for 1 hour

                    if (urlError) throw urlError;
                    setImageUrl(signedUrlData.signedUrl);
                }

            } catch (err) {
                console.error(err);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(err.message || "Failed to load the article.");
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [uuid]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500 mb-4">{error}</p>
                <Button asChild><Link to="/news">Back to News</Link></Button>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-8 max-w-4xl mx-auto px-4 mb-20">
                {article && (
                    <article>
                        <header className="space-y-4 text-center my-8">
                            <PageTitle title={article.title}/>
                            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={article.author?.avatar_url || undefined}
                                                     alt={article.author?.name}/>
                                        <AvatarFallback>{article.author?.name?.charAt(0) || 'A'}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{article.author?.name || 'Anonymous'}</span>
                                </div>
                                <span>•</span>
                                <time dateTime={article.created_at}>
                                    {dateTimeFormat(article.created_at)}
                                </time>
                            </div>
                        </header>

                        <div className="w-full bg-muted rounded-lg overflow-hidden aspect-video mb-8">
                            <img
                                src={imageUrl || "https://placehold.co/1200x675/e2e8f0/64748b?text=News+Image"}
                                alt={article.title}
                                className="h-full w-full object-cover"/>
                        </div>

                        {/* Using prose for nice blog-style typography */}
                        <div className="prose prose-lg max-w-none dark:prose-invert whitespace-pre-wrap">
                            {article.description}
                        </div>
                    </article>
                )}
            </div>
            <Footer/>
        </>
    );
}

export default ViewNewsArticlePage;
