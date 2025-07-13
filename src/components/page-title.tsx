import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb.tsx";
import React from "react";

interface Breadcrumbs {
    name?: string;
    url?: string;
}

interface PageTitleProps extends Breadcrumbs{
    title: string;
    breadcrumbs?: Breadcrumbs[];
}

function PageTitle({title, breadcrumbs}: PageTitleProps) {
    return (
        <div className={"space-y-4"}>
            <h1 className={"text-2xl font-semibold lg:text-5xl lg:font-normal"}>{title}</h1>

            {breadcrumbs && (
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>

                        {breadcrumbs?.map((item, index) => (
                            <React.Fragment key={index}>
                                <BreadcrumbSeparator>/</BreadcrumbSeparator>

                                <BreadcrumbItem>
                                    <BreadcrumbLink href={item.url}
                                                    className={breadcrumbs.length - 1 === index ? "text-gray-800" : ""}>
                                        {item.name}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
        </div>
    )
}

export default PageTitle;