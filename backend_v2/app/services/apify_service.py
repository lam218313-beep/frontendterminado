"""
Apify Service
=============
Handles scraping via Apify Actors.

Based on official documentation:
- Actor: apify/instagram-scraper
- Docs: https://apify.com/apify/instagram-scraper

Input Schema:
{
    "directUrls": ["https://www.instagram.com/username"],
    "resultsType": "posts" | "comments" | "details",
    "resultsLimit": 100,
    "searchType": "hashtag" | "user" | "place",
    "searchLimit": 10
}

Comment Output:
{
    "id": "17900515570488496",
    "postId": "BwrsO1Bho2N",
    "text": "Comment text here",
    "position": 1,
    "timestamp": "2020-06-07T12:54:20.000Z",
    "ownerId": "5319127183",
    "ownerIsVerified": false,
    "ownerUsername": "username",
    "ownerProfilePicUrl": "https://..."
}

Post Output:
{
    "url": "https://www.instagram.com/p/XXX/",
    "type": "Image" | "Video" | "Sidecar",
    "caption": "Post caption here",
    "hashtags": ["tag1", "tag2"],
    "mentions": ["user1"],
    "commentsCount": 100,
    "likesCount": 5000,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "ownerUsername": "brand",
    "firstComment": "First comment text",
    "latestComments": [{"ownerUsername": "...", "text": "..."}]
}
"""

import logging
import os
from typing import Any

from apify_client import ApifyClientAsync

from ..config import settings

logger = logging.getLogger(__name__)


# Actor ID from Apify Store
INSTAGRAM_ACTOR_ID = "apify/instagram-scraper"


async def scrape_instagram_posts(
    profile_url: str,
    limit: int = 100
) -> list[dict[str, Any]]:
    """
    Scrape Instagram posts from a profile.
    
    Args:
        profile_url: Instagram profile URL (e.g., https://www.instagram.com/nike)
        limit: Maximum number of posts to fetch
        
    Returns:
        List of post dictionaries with: url, caption, hashtags, mentions,
        likesCount, commentsCount, timestamp, ownerUsername, latestComments
    """
    if not settings.APIFY_TOKEN:
        raise ValueError("APIFY_TOKEN not configured in environment")
    
    client = ApifyClientAsync(token=settings.APIFY_TOKEN)
    
    logger.info(f"📸 Starting Instagram posts scrape: {profile_url}")
    logger.info(f"   Limit: {limit} posts")
    
    try:
        # Run the Actor and wait for it to finish
        run = await client.actor(INSTAGRAM_ACTOR_ID).call(
            run_input={
                "directUrls": [profile_url],
                "resultsType": "posts",
                "resultsLimit": limit,
            },
            timeout_secs=300  # Max 5 minutes
        )
        
        logger.info(f"✅ Actor run completed: {run['id']}")
        logger.info(f"   Status: {run['status']}")
        
        # Fetch results from the default dataset
        dataset_id = run["defaultDatasetId"]
        result = await client.dataset(dataset_id).list_items(clean=True)
        
        items = result.items
        logger.info(f"📦 Retrieved {len(items)} posts")
        
        return items
        
    except Exception as e:
        logger.error(f"❌ Apify scraping error: {e}")
        raise


async def scrape_instagram_comments(
    post_url: str,
    limit: int = 500
) -> list[dict[str, Any]]:
    """
    Scrape comments from a specific Instagram post.
    
    Args:
        post_url: Instagram post URL (e.g., https://www.instagram.com/p/XXXXX/)
        limit: Maximum number of comments to fetch
        
    Returns:
        List of comment dictionaries with: id, text, timestamp, 
        ownerUsername, ownerIsVerified, position
    """
    if not settings.APIFY_TOKEN:
        raise ValueError("APIFY_TOKEN not configured in environment")
    
    client = ApifyClientAsync(token=settings.APIFY_TOKEN)
    
    logger.info(f"💬 Starting Instagram comments scrape: {post_url}")
    logger.info(f"   Limit: {limit} comments")
    
    try:
        run = await client.actor(INSTAGRAM_ACTOR_ID).call(
            run_input={
                "directUrls": [post_url],
                "resultsType": "comments",
                "resultsLimit": limit,
            },
            timeout_secs=300
        )
        
        logger.info(f"✅ Actor run completed: {run['id']}")
        
        dataset_id = run["defaultDatasetId"]
        result = await client.dataset(dataset_id).list_items(clean=True)
        
        items = result.items
        logger.info(f"📦 Retrieved {len(items)} comments")
        
        return items
        
    except Exception as e:
        logger.error(f"❌ Apify comments scraping error: {e}")
        raise


async def scrape_instagram_profile_with_posts_and_comments(
    profile_url: str,
    posts_limit: int = 50,
    comments_per_post: int = 100
) -> dict[str, Any]:
    """
    Complete scrape: Profile posts + comments from each post.
    
    This is the main function for the Aggregation Engine.
    
    Args:
        profile_url: Instagram profile URL
        posts_limit: Max posts to fetch from profile
        comments_per_post: Max comments per post
        
    Returns:
        {
            "profile": {...},
            "posts": [...],
            "all_comments": [...],  # Flattened list of all comments
            "stats": {
                "total_posts": X,
                "total_comments": Y,
                "avg_likes": Z
            }
        }
    """
    logger.info(f"🚀 Starting full Instagram scrape: {profile_url}")
    
    # Step 1: Get posts from profile
    posts = await scrape_instagram_posts(profile_url, limit=posts_limit)
    
    if not posts:
        logger.warning("⚠️ No posts found")
        return {"posts": [], "all_comments": [], "stats": {}}
    
    # Step 2: Collect ALL comments from each post
    all_comments = []
    
    for i, post in enumerate(posts):
        logger.info(f"📝 Processing post {i+1}/{len(posts)}: {post.get('shortCode', 'N/A')}")
        
        # First, add the post caption as content for analysis
        caption = post.get("caption", "")
        if caption:
            all_comments.append({
                "id": post.get("id"),
                "postId": post.get("shortCode"),
                "text": caption,
                "ownerUsername": post.get("ownerUsername", ""),
                "timestamp": post.get("timestamp"),
                "source": "caption",
                "likesCount": post.get("likesCount", 0),
                "hashtags": post.get("hashtags", []),
                "mentions": post.get("mentions", [])
            })
        
        # Then, fetch FULL comments for this post (not just latestComments)
        post_url = post.get("url")
        if post_url and comments_per_post > 0:
            try:
                full_comments = await scrape_instagram_comments(post_url, limit=comments_per_post)
                
                for comment in full_comments:
                    all_comments.append({
                        "id": comment.get("id"),
                        "postId": post.get("shortCode"),
                        "text": comment.get("text", ""),
                        "ownerUsername": comment.get("ownerUsername", ""),
                        "timestamp": comment.get("timestamp"),
                        "ownerIsVerified": comment.get("ownerIsVerified", False),
                        "source": "full_scrape"
                    })
                
                logger.info(f"   ✅ Retrieved {len(full_comments)} comments from post")
                
            except Exception as e:
                logger.error(f"   ❌ Error fetching comments for post {post_url}: {e}")
                # Continue with next post even if one fails
                continue
    
    # Calculate stats
    total_likes = sum(p.get("likesCount", 0) for p in posts)
    total_comments_count = sum(p.get("commentsCount", 0) for p in posts)
    
    stats = {
        "total_posts": len(posts),
        "total_comments_scraped": len(all_comments),
        "total_comments_reported": total_comments_count,
        "total_likes": total_likes,
        "avg_likes": total_likes // len(posts) if posts else 0,
        "avg_comments": total_comments_count // len(posts) if posts else 0
    }
    
    logger.info(f"📊 Scrape complete: {stats}")
    
    return {
        "posts": posts,
        "all_comments": all_comments,
        "stats": stats
    }



# Utility function to normalize comment format for classification
def normalize_comment_for_classification(item: dict[str, Any]) -> dict[str, Any]:
    """
    Convert Apify output format to our internal format for Gemini classification.
    """
    return {
        "platform": "instagram",
        "platform_id": item.get("id") or item.get("postId", ""),
        "content": item.get("text", ""),
        "author": item.get("ownerUsername", "unknown"),
        "posted_at": item.get("timestamp"),
        "is_caption": item.get("source") == "caption",
        "likes": item.get("likesCount", 0),
        "hashtags": item.get("hashtags", []),
        "mentions": item.get("mentions", [])
    }
