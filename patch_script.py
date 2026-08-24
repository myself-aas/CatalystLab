import re

with open('src/components/home/LatestBlogsSection.tsx', 'r') as f:
    content = f.read()

# I want to replace the whole 1+4 Grid Layout section

new_grid_content = """
        {/* 1 + 4 Grid Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Hero Card */}
          {heroPost && (
            <div className="lg:col-span-5 h-full min-h-[450px]">
              <HeroImageCard
                imageUrl={getBlogCoverImage(heroPost)}
                imageAlt={heroPost.title}
                title={heroPost.title}
                subtitle={
                  <div className="flex items-center gap-2 text-xs font-mono mt-2 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-white/70" />
                      {formatDate(heroPost.createdAt)}
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-white/70" />
                      {getArticleReadingTime(heroPost)}
                    </span>
                  </div>
                }
                description={heroPost.excerpt || 'Explore deep-dive telemetry diagnostics, modern SSR hydration patterns, and benchmark data from production engines.'}
                badge={
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-black/60 border border-white/20 px-2 py-0.5 text-[10px] font-mono font-bold text-white backdrop-blur-md">
                      {heroPost.category || 'Trending'}
                    </span>
                    <span className="rounded bg-white text-black px-2 py-0.5 text-[10px] font-mono font-extrabold uppercase tracking-wider shadow-sm">
                      Featured
                    </span>
                  </div>
                }
                topRight={
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(heroPost.slug || heroPost.id || '', e);
                      }}
                      title="Share Article Link"
                      className="h-8 w-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white transition-colors hover:bg-black/60 backdrop-blur-md cursor-pointer shadow-sm"
                    >
                      {copiedSlug === (heroPost.slug || heroPost.id) ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Share2 className="h-4 w-4 text-white/90" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(heroPost.id || heroPost.slug, e);
                      }}
                      title={bookmarkedIds.has(heroPost.id || heroPost.slug) ? "Remove Bookmark" : "Save Article"}
                      className="h-8 w-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white transition-colors hover:bg-black/60 backdrop-blur-md cursor-pointer shadow-sm"
                    >
                      {bookmarkedIds.has(heroPost.id || heroPost.slug) ? (
                        <BookmarkCheck className="h-4 w-4 text-white fill-white" />
                      ) : (
                        <Bookmark className="h-4 w-4 text-white/90" />
                      )}
                    </button>
                  </div>
                }
                action={
                  <Link
                    to={`/blog/${heroPost.slug || heroPost.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-gray-100 px-4 py-2.5 text-sm font-bold text-black transition-colors shadow-sm"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
                footer={
                  <div className="flex items-center gap-2.5">
                    {heroPost.authorAvatar ? (
                      <img
                        src={heroPost.authorAvatar}
                        alt={heroPost.authorName || 'Author'}
                        className="h-8 w-8 rounded-full object-cover border border-white/20"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-white/20 border border-white/20 flex items-center justify-center text-white font-mono font-bold text-xs">
                        {heroPost.authorName ? heroPost.authorName.charAt(0) : 'C'}
                      </div>
                    )}
                    <div className="text-xs font-mono text-white/90">
                      <div className="font-bold">{heroPost.authorName || 'CatalystLab Telemetry'}</div>
                      <div className="text-[10px] text-white/60">Principal Engineer</div>
                    </div>
                  </div>
                }
                aspectRatio="h-full w-full"
                gradientFrom="from-slate-950"
              />
            </div>
          )}

          {/* Right 2x2 Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {finalCompactPosts.map((post, idx) => {
                const isBookmarked = bookmarkedIds.has(post.id || post.slug);
                return (
                  <div key={post.slug || post.id || idx} className="h-[260px] md:h-full">
                    <HeroImageCard
                      imageUrl={getBlogCoverImage(post)}
                      imageAlt={post.title}
                      title={<div className="text-lg md:text-xl line-clamp-2">{post.title}</div>}
                      description={null}
                      badge={
                        <span className="rounded bg-black/60 border border-white/20 px-2 py-0.5 text-[9px] font-mono font-bold text-white backdrop-blur-md">
                          {post.category || 'Guide'}
                        </span>
                      }
                      topRight={
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(post.id || post.slug, e);
                          }}
                          title={isBookmarked ? "Remove Bookmark" : "Save Article"}
                          className="h-7 w-7 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white transition-colors hover:bg-black/60 backdrop-blur-md cursor-pointer shadow-sm"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="h-3.5 w-3.5 text-white fill-white" />
                          ) : (
                            <Bookmark className="h-3.5 w-3.5 text-white/90" />
                          )}
                        </button>
                      }
                      footer={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono">
                            <Calendar className="h-3 w-3 text-white/70" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewPost(post);
                              }}
                              className="text-[10px] text-white/70 hover:text-white font-semibold transition-colors cursor-pointer"
                            >
                              Peek
                            </button>
                            <Link 
                              to={`/blog/${post.slug || post.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 border border-white/20 flex items-center justify-center text-white transition-colors"
                              aria-label={`Read article: ${post.title}`}
                            >
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      }
                      aspectRatio="h-full w-full"
                      gradientFrom="from-slate-900"
                    />
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
"""

start_str = "{/* 1 + 4 Grid Layout */}"
end_str = "{/* Bottom Ecosystem & Trust Bar */}"

idx_start = content.find(start_str)
idx_end = content.find(end_str)

if idx_start != -1 and idx_end != -1:
    new_content = content[:idx_start] + new_grid_content + "        " + content[idx_end:]
    with open('src/components/home/LatestBlogsSection.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced successfully")
else:
    print("Strings not found")
