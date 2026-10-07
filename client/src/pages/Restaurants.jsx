import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRestaurants } from "../api/restaurantApi";
import { Link } from "react-router-dom";

const PAGE_SIZE = 6;

function hueFor(text = "") {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 360;
    return h;
}

function formatFee(fee) {
    if (fee === 0 || fee === "0") return "Free delivery";
    if (fee === undefined || fee === null || fee === "") return "—";
    return `Delivery ₹${fee}`;
}

function SkeletonGrid() {
    return (
        <div className="rs-grid" aria-hidden="true">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div className="rs-card rs-skeleton" key={i} />
            ))}
        </div>
    );
}

function Restaurants() {
   
    const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
        queryKey: ["restaurants"],
        queryFn: getRestaurants,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const restaurants = data?.data || [];

    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const sentinelRef = useRef(null);

    const visibleRestaurants = restaurants.slice(0, visibleCount);
    const hasMore = visibleCount < restaurants.length;

    useEffect(() => {
        if (!hasMore || !sentinelRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisibleCount((count) => count + PAGE_SIZE);
                }
            },
            { rootMargin: "200px" }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, visibleCount]);

    return (
        <main className="rs-page">
            <header className="rs-header">
                <span className="rs-orb rs-orb-a" aria-hidden="true" />
                <span className="rs-orb rs-orb-b" aria-hidden="true" />
                <h1>Hungry? Pick a place.</h1>
                <p>
                    {isLoading || isError
                        ? "Fresh food from restaurants near you"
                        : `${restaurants.length} restaurants delivering to you now`}
                </p>
            </header>

            {isLoading && (
                <div role="status" aria-label="Loading restaurants">
                    <SkeletonGrid />
                </div>
            )}

            {isError && (
                <div className="rs-state" role="alert">
                    <h2>Couldn't load restaurants</h2>
                    <p>{error.message}</p>
                    <button className="rs-btn" onClick={() => refetch()} disabled={isFetching}>
                        {isFetching ? "Retrying…" : "Try again"}
                    </button>
                </div>
            )}

            {!isLoading && !isError && restaurants.length === 0 && (
                <div className="rs-state">
                    <h2>No restaurants yet</h2>
                    <p>Check back soon — new places are added often.</p>
                </div>
            )}

            {!isLoading && !isError && restaurants.length > 0 && (
                <>
                    <div className="rs-grid">
                        {visibleRestaurants.map((restaurant, i) => (
                            <article
                                className="rs-card"
                                key={restaurant._id}
                                style={{ "--hue": hueFor(restaurant.name), "--i": i % PAGE_SIZE }}
                            >
                                <div className="rs-banner">
                                    <span className="rs-initial" aria-hidden="true">
                                        {restaurant.name?.charAt(0).toUpperCase()}
                                    </span>
                                    {restaurant.rating != null && (
                                        <span className="rs-rating" aria-label={`Rated ${restaurant.rating}`}>
                                            ★ {restaurant.rating}
                                        </span>
                                    )}
                                    <span className="rs-fee">{formatFee(restaurant.deliveryFee)}</span>
                                </div>

                                <div className="rs-body">
                                    <h2 className="rs-name">{restaurant.name}</h2>
                                    <p className="rs-desc">{restaurant.description}</p>

                                    <ul className="rs-meta">
                                        {restaurant.cuisine && <li className="rs-chip">{restaurant.cuisine}</li>}
                                        {restaurant.location && <li className="rs-chip">{restaurant.location}</li>}
                                    </ul>

                                    <Link className="rs-btn" to={`/restaurant/${restaurant._id}`}>
                                        View menu <span className="rs-arrow" aria-hidden="true">→</span>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>

                    {hasMore ? (
                        <div className="rs-sentinel" ref={sentinelRef} role="status">
                            <span className="rs-dots" aria-hidden="true" />
                            Loading more…
                        </div>
                    ) : (
                        restaurants.length > PAGE_SIZE && (
                            <p className="rs-end">You've seen all {restaurants.length} restaurants</p>
                        )
                    )}
                </>
            )}
        </main>
    );
}

export default Restaurants;