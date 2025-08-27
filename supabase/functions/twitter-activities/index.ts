Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Verify token and get user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Get user's followed mentors
        const followedMentorsResponse = await fetch(`${supabaseUrl}/rest/v1/user_mentor_follows?user_id=eq.${userId}&select=mentor_id,mentors(name,title,twitter_handle,avatar_url)`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!followedMentorsResponse.ok) {
            throw new Error('Failed to fetch followed mentors');
        }

        const followedMentors = await followedMentorsResponse.json();

        // Generate mock Twitter-like activities for demonstration
        // In a real implementation, this would fetch from Twitter API
        const mockActivities = followedMentors.map(follow => {
            const mentor = follow.mentors;
            const activities = [
                {
                    id: `${mentor.twitter_handle}-1`,
                    mentor_name: mentor.name,
                    mentor_title: mentor.title,
                    mentor_avatar: mentor.avatar_url,
                    twitter_handle: mentor.twitter_handle,
                    content: generateMockTweet(mentor.name, mentor.title),
                    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
                    likes: Math.floor(Math.random() * 1000) + 50,
                    retweets: Math.floor(Math.random() * 300) + 10,
                    replies: Math.floor(Math.random() * 100) + 5
                }
            ];
            return activities;
        }).flat();

        // Sort by timestamp (newest first)
        mockActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return new Response(JSON.stringify({
            data: {
                activities: mockActivities.slice(0, 10), // Return latest 10 activities
                followed_mentors_count: followedMentors.length
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Twitter activities error:', error);

        const errorResponse = {
            error: {
                code: 'TWITTER_ACTIVITIES_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper function to generate mock tweets
function generateMockTweet(mentorName: string, mentorTitle: string): string {
    const tweetTemplates = [
        "Just finished an amazing discussion about the future of AI. The possibilities are endless! 🚀",
        "Excited to share our latest breakthrough in machine learning. Innovation never stops.",
        "Reflecting on the journey from startup to where we are today. Persistence pays off.",
        "The key to success in tech: stay curious, keep learning, and never fear failure.",
        "Working on some groundbreaking projects that will reshape how we think about technology.",
        "Grateful for the incredible team that makes the impossible possible every day.",
        "The future belongs to those who can adapt and innovate in the face of change.",
        "Just had an inspiring conversation with young entrepreneurs. The next generation is brilliant!",
        "Building technology that serves humanity is not just our goal, it's our responsibility.",
        "Sometimes the best ideas come from the most unexpected places. Stay open to possibilities."
    ];
    
    return tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)];
}