import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import ClientBlogActions from "@/components/blog/ClientBlogActions";

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
        <main className="min-h-screen bg-white text-slate-900 pb-20">
            {/* Hero Section */}
            <div className="relative h-[60vh] w-full bg-slate-900">
                {blog.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-full object-cover opacity-60"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-4xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-slate-300 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Generator
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                        {blog.title}
                    </h1>
                    <p className="text-xl text-slate-200 font-medium max-w-2xl">
                        {blog.subtitle}
                    </p>

                    <div className="flex items-center gap-6 mt-8 text-slate-300 text-sm">
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

            <div className="max-w-3xl mx-auto px-6 -mt-10 relative z-10">
                {/* Action Bar */}
                <div className="bg-white rounded-xl shadow-xl p-4 mb-12 flex justify-between items-center border border-slate-100">
                    <div className="text-sm font-medium text-slate-500">
                        Share this post
                    </div>
                    <ClientBlogActions blog={blog} />
                </div>

                {/* Content */}
                <article className="prose prose-lg prose-slate max-w-none">
                    {/* Table of Contents */}
                    <div className="bg-slate-50 p-6 rounded-xl mb-12 not-prose border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Table of Contents</h3>
                        <nav className="space-y-2">
                            {blog.sections.map((section) => (
                                <a
                                    key={section.id}
                                    href={`#section-${section.id}`}
                                    className="block text-slate-600 hover:text-indigo-600 transition-colors text-sm"
                                >
                                    {section.heading}
                                </a>
                            ))}
                        </nav>
                    </div>

                    {blog.sections.map((section) => (
                        <section key={section.id} id={`section-${section.id}`} className="mb-16 scroll-mt-24">
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">{section.heading}</h2>

                            {section.imageUrl && (
                                <div className="my-8 rounded-xl overflow-hidden shadow-lg">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={section.imageUrl}
                                        alt={section.heading}
                                        className="w-full h-auto object-cover max-h-[500px]"
                                    />
                                </div>
                            )}

                            <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                                {section.content}
                            </div>
                        </section>
                    ))}

                    {blog.conclusion && (
                        <section className="mt-16 pt-12 border-t border-slate-200">
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Conclusion</h2>
                            <div className="whitespace-pre-line text-slate-700 leading-relaxed italic bg-indigo-50 p-8 rounded-2xl border border-indigo-100">
                                {blog.conclusion}
                            </div>
                        </section>
                    )}
                </article>
            </div>
        </main>
    );
}
