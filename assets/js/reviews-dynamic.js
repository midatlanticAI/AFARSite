/* Dynamic Reviews Loader for reviews.html
   Fetches Google & Facebook reviews (up to 100 combined),
   displays them 15 at a time, and keeps rating/count metrics updated.

   IMPORTANT:  You MUST provide valid API keys / tokens in the config below.
   For a quick demo without keys, the script will fall back to the hard-coded
   sample reviews already in the HTML.
*/

(async function () {
    "use strict";

    /********************* CONFIG *************************/
    const CONFIG = {
        GOOGLE_PLACE_ID: "REPLACE_WITH_GOOGLE_PLACE_ID", // eg: "ChIJL_P_CXMED4gRm1d2ABa8M0A"
        GOOGLE_API_KEY: "REPLACE_WITH_GOOGLE_API_KEY",   // Server or browser key with Places API enabled
        FB_PAGE_ID: "REPLACE_WITH_FB_PAGE_ID",           // eg: "558334371191775"
        FB_ACCESS_TOKEN: "REPLACE_WITH_FB_ACCESS_TOKEN", // Requires the pages_read_user_content permission
        MAX_REVIEWS: 100,
        BATCH_SIZE: 15
    };

    /******************** STATE ***************************/
    let allReviews = [];          // merged list of {source, author, rating, text, date}
    let currentFilter = "all";    // 'all' | 'google' | 'facebook'
    let renderedCount = 0;        // how many are currently in DOM for the active filter

    const reviewsUL = document.querySelector(".reviews-list");
    const loadMoreBtn = document.getElementById("loadMoreBtn");

    // Helper: sanitize text to avoid HTML injection
    function escapeHTML(str) {
        return str.replace(/[&<>\"]/g, c => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;"}[c]));
    }

    // Helper: generate star icons string from rating (1-5)
    function starIcons(rating) {
        return "⭐".repeat(Math.round(rating));
    }

    /* ------------ Google Reviews ------------- */
    async function fetchGoogleReviews() {
        if (CONFIG.GOOGLE_API_KEY.startsWith("REPLACE")) return {reviews: [], rating: 0, count: 0};
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${CONFIG.GOOGLE_PLACE_ID}&key=${CONFIG.GOOGLE_API_KEY}&fields=rating,user_ratings_total,reviews`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.status !== "OK" || !data.result) throw new Error(data.status || "No data");
            const details = data.result;
            const reviews = (details.reviews || []).map(r => ({
                source: "google",
                author: r.author_name,
                rating: r.rating,
                text: r.text,
                date: new Date(r.time * 1000)
            }));
            return {reviews, rating: details.rating, count: details.user_ratings_total};
        } catch (err) {
            console.error("Google reviews fetch failed", err);
            return {reviews: [], rating: 0, count: 0};
        }
    }

    /* ------------ Facebook Reviews ------------ */
    async function fetchFacebookReviews() {
        if (CONFIG.FB_ACCESS_TOKEN.startsWith("REPLACE")) return {reviews: [], rating: 0, count: 0};
        const ratingsURL = `https://graph.facebook.com/${CONFIG.FB_PAGE_ID}/ratings?access_token=${CONFIG.FB_ACCESS_TOKEN}&limit=${CONFIG.MAX_REVIEWS}&fields=review_text,created_time,reviewer,rating`;
        const summaryURL = `https://graph.facebook.com/${CONFIG.FB_PAGE_ID}?fields=overall_star_rating,rating_count&access_token=${CONFIG.FB_ACCESS_TOKEN}`;
        try {
            const [ratingsRes, summaryRes] = await Promise.all([fetch(ratingsURL), fetch(summaryURL)]);
            const ratingsJSON = await ratingsRes.json();
            const summaryJSON = await summaryRes.json();
            const reviews = (ratingsJSON.data || []).map(r => ({
                source: "facebook",
                author: r.reviewer?.name || "FB User",
                rating: r.rating || 5,
                text: r.review_text || "",
                date: new Date(r.created_time)
            }));
            return {reviews, rating: summaryJSON.overall_star_rating || 0, count: summaryJSON.rating_count || reviews.length};
        } catch (err) {
            console.error("Facebook reviews fetch failed", err);
            return {reviews: [], rating: 0, count: 0};
        }
    }

    /***************** RENDERING *****************/
    function reviewToHTML(r) {
        return `<li class="review-item" data-source="${r.source}">
            <div class="review-header">
                <i class="fa-brands fa-${r.source === "google" ? "google" : "facebook"} review-source-logo" aria-hidden="true"></i>
                <span class="review-author">${escapeHTML(r.author)}</span>
                <span class="review-stars" aria-label="${r.rating} star review">${starIcons(r.rating)}</span>
            </div>
            <blockquote>${escapeHTML(r.text)}</blockquote>
            <div class="review-date">${r.date.toLocaleDateString()}</div>
        </li>`;
    }

    function refreshBanner(overall, total, gData, fbData) {
        const ratingSpan = document.getElementById("overallRating");
        const overallStars = document.getElementById("overallStars");
        ratingSpan.textContent = overall.toFixed(1);
        overallStars.textContent = starIcons(overall);

        document.getElementById("allFilter").textContent = `All (${overall.toFixed(1)} / ${total} Ratings)`;
        document.getElementById("googleFilter").innerHTML = `<i class="fa-brands fa-google"></i> Google (${gData.rating.toFixed(1)} / ${gData.count})`;
        document.getElementById("facebookFilter").innerHTML = `<i class="fa-brands fa-facebook"></i> Facebook (${fbData.rating.toFixed(1)} / ${fbData.count})`;
    }

    function getFilteredReviews() {
        if (currentFilter === "google") return allReviews.filter(r => r.source === "google");
        if (currentFilter === "facebook") return allReviews.filter(r => r.source === "facebook");
        return allReviews;
    }

    function renderNextBatch() {
        const list = getFilteredReviews();
        if (renderedCount >= list.length) return; // nothing more
        const slice = list.slice(renderedCount, renderedCount + CONFIG.BATCH_SIZE);
        const html = slice.map(reviewToHTML).join("");
        reviewsUL.insertAdjacentHTML("beforeend", html);
        renderedCount += slice.length;
        if (renderedCount >= list.length) {
            loadMoreBtn.style.display = "none";
        } else {
            loadMoreBtn.style.display = "inline-block";
        }
    }

    /**************** FILTER HANDLERS ****************/ 
    function attachFilters() {
        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentFilter = btn.getAttribute("data-filter");
                // reset
                reviewsUL.innerHTML = "";
                renderedCount = 0;
                renderNextBatch();
            });
        });
    }

    /********************* INIT **********************/
    try {
        const [googleData, facebookData] = await Promise.all([fetchGoogleReviews(), fetchFacebookReviews()]);

        // Merge & sort by date desc
        allReviews = [...googleData.reviews, ...facebookData.reviews]
            .sort((a, b) => b.date - a.date)
            .slice(0, CONFIG.MAX_REVIEWS);

        if (allReviews.length === 0) {
            console.warn("No live reviews fetched – falling back to existing markup.");
            return;
        }

        // Clear static sample items
        reviewsUL.innerHTML = "";

        // Compute overall rating
        const totalReviews = googleData.count + facebookData.count;
        const overallRating = totalReviews ? ((googleData.rating * googleData.count) + (facebookData.rating * facebookData.count)) / totalReviews : 0;

        refreshBanner(overallRating, totalReviews, googleData, facebookData);
        attachFilters();
        renderNextBatch();
    } catch (err) {
        console.error("Reviews initialisation failed", err);
    }

    // Load-more button
    loadMoreBtn.addEventListener("click", renderNextBatch);

    // Footer year
    const yearEl = document.getElementById("currentYear");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
})(); 