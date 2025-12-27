"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageCircle, 
  Share2, 
  ExternalLink,
  MapPin,
  AlertTriangle,
  Car,
  Construction,
  Users,
  Flame,
  TrendingUp,
  Clock
} from "lucide-react";

interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  timeAgo: string;
  flair: string;
  flairColor: string;
  location?: string;
  preview?: string;
  isHot?: boolean;
}

const redditPosts: RedditPost[] = [
  {
    id: "1",
    title: "When roads fail, mother carries home",
    author: "Feeling-Article-1648",
    subreddit: "r/bangalore",
    upvotes: 3800,
    downvotes: 133,
    comments: 245,
    timeAgo: "8 days ago",
    flair: "Media",
    flairColor: "bg-purple-500",
    isHot: true,
    preview: "Heartbreaking scene of road conditions in the city"
  },
  {
    id: "2",
    title: "If the rumours about why this road in HSR is blocked is true then we've failed as a society",
    author: "deadunderdog",
    subreddit: "r/bangalore",
    upvotes: 4000,
    downvotes: 306,
    comments: 412,
    timeAgo: "10 days ago",
    flair: "Rant",
    flairColor: "bg-red-500",
    location: "HSR Layout",
    isHot: true
  },
  {
    id: "3",
    title: "A Small Effort From Us Citizens Can Make a Huge Impact For All",
    author: "entrepreneurblr",
    subreddit: "r/bangalore",
    upvotes: 2300,
    downvotes: 68,
    comments: 189,
    timeAgo: "5 days ago",
    flair: "Citizen's Report",
    flairColor: "bg-green-500",
    location: "Koramangala"
  },
  {
    id: "4",
    title: "Shame on us...",
    author: "panda_ammonium",
    subreddit: "r/bangalore",
    upvotes: 2000,
    downvotes: 106,
    comments: 156,
    timeAgo: "8 days ago",
    flair: "Suggestions",
    flairColor: "bg-blue-500"
  },
  {
    id: "5",
    title: "HCL mode in traffic lights",
    author: "noobcodee",
    subreddit: "r/bangalore",
    upvotes: 1100,
    downvotes: 59,
    comments: 87,
    timeAgo: "5 days ago",
    flair: "AskBangalore",
    flairColor: "bg-orange-500",
    preview: "Traffic light timing issues across the city"
  },
  {
    id: "6",
    title: "How is this even legal for a Govt. vehicle?",
    author: "KFPH-007",
    subreddit: "r/bangalore",
    upvotes: 1200,
    downvotes: 98,
    comments: 134,
    timeAgo: "7 days ago",
    flair: "AskBangalore",
    flairColor: "bg-orange-500"
  },
  {
    id: "7",
    title: "Advantages of having a wide footpath!",
    author: "margazi_perumal_20",
    subreddit: "r/bangalore",
    upvotes: 1400,
    downvotes: 101,
    comments: 98,
    timeAgo: "7 days ago",
    flair: "Media",
    flairColor: "bg-purple-500",
    location: "Malleswaram"
  },
  {
    id: "8",
    title: "The private buses should be restricted in peak time in Bengaluru",
    author: "RefuseAffectionate12",
    subreddit: "r/bangalore",
    upvotes: 1400,
    downvotes: 188,
    comments: 267,
    timeAgo: "11 days ago",
    flair: "Suggestions",
    flairColor: "bg-blue-500"
  },
  {
    id: "9",
    title: "Thank you my Bangalore brothers and sisters",
    author: "pupilofproductivity",
    subreddit: "r/bangalore",
    upvotes: 734,
    downvotes: 32,
    comments: 89,
    timeAgo: "2 days ago",
    flair: "Citizen's Report",
    flairColor: "bg-green-500",
    preview: "Story of strangers helping after an accident"
  },
  {
    id: "10",
    title: "Stay safe out there, folks! Almost got ran over by a car jumping signal",
    author: "Fresh_Librarian_2536",
    subreddit: "r/bangalore",
    upvotes: 149,
    downvotes: 12,
    comments: 67,
    timeAgo: "10 days ago",
    flair: "Rant",
    flairColor: "bg-red-500",
    location: "Kundalahalli"
  },
  {
    id: "11",
    title: "Work & Bengaluru roads - Tried Swiggy delivery with Yulu, met with an accident!",
    author: "Random_Guy_Bangalore",
    subreddit: "r/bangalore",
    upvotes: 5,
    downvotes: 2,
    comments: 12,
    timeAgo: "3 hr ago",
    flair: "Rant",
    flairColor: "bg-red-500"
  },
  {
    id: "12",
    title: "Is tummoc monthly pass reliable for Vayu Vajra service?",
    author: "GalaxyIsOnRedditIDK",
    subreddit: "r/bangalore",
    upvotes: 7,
    downvotes: 0,
    comments: 7,
    timeAgo: "5 hr ago",
    flair: "AskBangalore",
    flairColor: "bg-orange-500"
  }
];

// Custom hardcoded tips cards
const customTips = [
  {
    id: "tip1",
    icon: AlertTriangle,
    title: "🚨 Auto Scam Alert Zone",
    description: "Majestic, KR Market, and Railway Stations are known hotspots. Always insist on meter!",
    color: "from-red-500/20 to-orange-500/20",
    borderColor: "border-red-500/30"
  },
  {
    id: "tip2",
    icon: Car,
    title: "🛺 Peak Hour Surge",
    description: "8-10 AM & 6-8 PM - Expect 1.5x-2x quotes. Use 'Bere auto nodtini' and walk away!",
    color: "from-yellow-500/20 to-amber-500/20",
    borderColor: "border-yellow-500/30"
  },
  {
    id: "tip3",
    icon: Construction,
    title: "🚧 Road Work Excuse",
    description: "Drivers often cite 'road work' for detours. Check Google Maps before agreeing to alternate routes.",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30"
  },
  {
    id: "tip4",
    icon: MapPin,
    title: "📍 Silk Board Reality",
    description: "Yes, traffic is bad. No, it doesn't justify 3x fare. Fair price + 30 mins wait time is reasonable.",
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30"
  }
];

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

function RedditPostCard({ post }: { post: RedditPost }) {
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:border-orange-500/30 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">r/</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-orange-400 text-sm font-medium">{post.subreddit}</span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-gray-500 text-xs">u/{post.author}</span>
            {post.location && (
              <>
                <span className="text-gray-500 text-xs">•</span>
                <span className="text-green-400 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {post.location}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-gray-500 text-xs">{post.timeAgo}</span>
            <span className={`${post.flairColor} text-white text-[10px] px-2 py-0.5 rounded-full font-medium`}>
              {post.flair}
            </span>
            {post.isHot && (
              <span className="flex items-center gap-1 text-orange-400 text-[10px]">
                <Flame className="w-3 h-3" />
                Hot
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-white font-medium text-sm leading-snug mb-2 group-hover:text-orange-300 transition-colors line-clamp-2">
        {post.title}
      </h3>

      {/* Preview */}
      {post.preview && (
        <p className="text-gray-400 text-xs mb-3 line-clamp-1">{post.preview}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 text-gray-400">
        {/* Votes */}
        <div className="flex items-center gap-1 bg-white/5 rounded-full px-2 py-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setVoted(voted === 'up' ? null : 'up'); }}
            className={`p-0.5 rounded hover:bg-orange-500/20 transition-colors ${voted === 'up' ? 'text-orange-500' : ''}`}
          >
            <ArrowBigUp className="w-4 h-4" fill={voted === 'up' ? 'currentColor' : 'none'} />
          </button>
          <span className={`text-xs font-medium ${voted === 'up' ? 'text-orange-500' : voted === 'down' ? 'text-blue-500' : ''}`}>
            {formatNumber(post.upvotes + (voted === 'up' ? 1 : voted === 'down' ? -1 : 0))}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); setVoted(voted === 'down' ? null : 'down'); }}
            className={`p-0.5 rounded hover:bg-blue-500/20 transition-colors ${voted === 'down' ? 'text-blue-500' : ''}`}
          >
            <ArrowBigDown className="w-4 h-4" fill={voted === 'down' ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Comments */}
        <div className="flex items-center gap-1 hover:bg-white/5 rounded-full px-2 py-1 transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">{post.comments}</span>
        </div>

        {/* Share */}
        <div className="flex items-center gap-1 hover:bg-white/5 rounded-full px-2 py-1 transition-colors">
          <Share2 className="w-4 h-4" />
          <span className="text-xs hidden sm:inline">Share</span>
        </div>
      </div>
    </motion.div>
  );
}

function TipCard({ tip }: { tip: typeof customTips[0] }) {
  const Icon = tip.icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      className={`bg-gradient-to-br ${tip.color} backdrop-blur-sm rounded-xl border ${tip.borderColor} p-4 cursor-pointer`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-1">{tip.title}</h4>
          <p className="text-gray-300 text-xs leading-relaxed">{tip.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function RedditPosts() {
  const [showAll, setShowAll] = useState(false);
  const displayedPosts = showAll ? redditPosts : redditPosts.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-dark rounded-2xl md:rounded-3xl p-4 md:p-6 relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
            </div>
            <div>
              <h2 className="font-luxury text-xl md:text-2xl gradient-text">From r/bangalore</h2>
              <p className="text-xs text-gray-500 font-modern flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-orange-400" />
                Real stories from the streets
              </p>
            </div>
          </div>
          <a 
            href="https://reddit.com/r/bangalore" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm font-modern transition-colors"
          >
            Visit
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Custom Tips */}
        <div className="mb-6">
          <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-auto-yellow" />
            Local Intel from Bengalureans
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customTips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        </div>

        {/* Reddit Posts Grid */}
        <div className="mb-4">
          <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Trending Discussions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {displayedPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <RedditPostCard post={post} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Show More/Less Button */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 text-sm font-modern transition-colors flex items-center gap-2"
          >
            {showAll ? (
              <>Show Less</>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                Show {redditPosts.length - 6} More Posts
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
