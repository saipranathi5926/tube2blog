import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import ClientBlogActions from "@/components/blog/ClientBlogActions";
import ReactMarkdown from "react-markdown";
import BlogImage from "@/components/blog/BlogImage";

async function getBlog(id: string) {
    const blog = await prisma.blog.findUnique({
        where: { id },
        include: {
            sections: {
                orderBy: {
                    order: 'asc'
                }
            }
        }
    });
    return blog;
}

export default async function BlogPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const blog = await getBlog(id);

    if (!blog) {
        notFound();
    }

    // Calculate reading time (approx 200 words per minute)
    const totalWords = blog.sections.reduce((acc, section) => acc + section.content.split(" ").length, 0) + (blog.conclusion?.split(" ").length || 0);
    const readingTime = Math.ceil(totalWords / 200);

    return (
        <div className="min-h-screen bg-white text-slate-900 pb-20 pt-16 -mx-4 sm:-mx-6 lg:-mx-8">
            {/* Hero Section */}
            <div className="relative h-[60vh] w-full bg-slate-900">
                {blog.coverImage ? (
                    <BlogImage
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-full object-cover opacity-60"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 opacity-60" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-5xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-slate-300 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Generator
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
                        {blog.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-200 font-medium max-w-3xl leading-relaxed">
                        {blog.subtitle}
                    </p>

                    <div className="flex items-center gap-6 mt-8 text-slate-300 text-sm font-medium">
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {readingTime} min read
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Main Content */}
                <div className="lg:col-span-8">
                    {/* Action Bar (Mobile/Tablet) */}
                    <div className="bg-white rounded-xl shadow-xl p-4 mb-8 flex justify-between items-center border border-slate-100 lg:hidden">
                        <div className="text-sm font-medium text-slate-500">
                            Share this post
                        </div>
                        <ClientBlogActions blog={blog} />
                    </div>

                    <article className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-img:rounded-xl prose-img:shadow-lg">
                        {blog.sections.map((section) => (
                            <section key={section.id} id={`section-${section.id}`} className="mb-16 scroll-mt-24">
                                <h2 className="text-3xl font-bold text-slate-900 mb-6">{section.heading}</h2>

                                {section.imageUrl && (
                                    <div className="my-8 rounded-xl overflow-hidden shadow-lg bg-slate-100 aspect-video relative">
                                        <BlogImage
                                            src={section.imageUrl}
                                            alt={section.heading}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="text-slate-700 leading-relaxed">
                                    <ReactMarkdown>
                                        {section.content}
                                    </ReactMarkdown>
                                </div>
                            </section>
                        ))}

                        {blog.conclusion && (
                            <section className="mt-16 pt-12 border-t border-slate-200">
                                <h2 className="text-3xl font-bold text-slate-900 mb-6">Conclusion</h2>
                                <div className="text-slate-700 leading-relaxed italic bg-indigo-50 p-8 rounded-2xl border border-indigo-100">
                                    <ReactMarkdown>
                                        {blog.conclusion}
                                    </ReactMarkdown>
                                </div>
                            </section>
                        )}
                    </article>
                </div>

                {/* Sidebar (Desktop) */}
                <div className="hidden lg:block lg:col-span-4 space-y-8">
                    {/* Sticky Action Bar */}
                    <div className="sticky top-8 space-y-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Share & Actions</h3>
                            <div className="flex justify-center">
                                <ClientBlogActions blog={blog} />
                            </div>
                        </div>

                        {/* Table of Contents */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Table of Contents</h3>
                            <nav className="space-y-3">
                                {blog.sections.map((section) => (
                                    <a
                                        key={section.id}
                                        href={`#section-${section.id}`}
                                        className="block text-slate-600 hover:text-indigo-600 transition-colors text-sm leading-snug hover:translate-x-1 duration-200"
                                    >
                                        {section.heading}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
