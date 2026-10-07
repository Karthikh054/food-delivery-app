import { useEffect, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { getFoods } from "../api/foodApi";
import { getRestaurant } from "../api/restaurantApi";
import useDebounce from "../hooks/useDebounce";
import { useCart } from "../context/CartContext";

function hueFor(text = "") {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 360;
    return h;
}

function RestaurantDetails() {
    const { id } = useParams();
    const [category, setCategory] = useState("");
    const [search, setSearch] = useState("");
    const [justAddedId, setJustAddedId] = useState(null);
    const addedTimer = useRef(null);
    const debouncedSearch = useDebounce(search, 400);
    const { addToCart } = useCart();

    useEffect(() => () => clearTimeout(addedTimer.current), []);

    const handleAdd = (food) => {
        addToCart(food, id);
        setJustAddedId(food._id);
        clearTimeout(addedTimer.current);
        addedTimer.current = setTimeout(() => setJustAddedId(null), 1200);
    };

    const {
        data: restaurantData,
        isLoading: restaurantLoading,
        isError: restaurantError,
        error: restaurantErr,
    } = useQuery({
        queryKey: ["restaurant", id],
        queryFn: () => getRestaurant(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });

    const {
        data: foodData,
        isLoading: foodLoading,
        isError: foodError,
        error: foodErr,
        isPlaceholderData,
    } = useQuery({
        queryKey: ["foods", id, category, debouncedSearch],
        queryFn: () => getFoods(id, category, debouncedSearch),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    const { data: allFoodData } = useQuery({
        queryKey: ["foods", id, "all"],
        queryFn: () => getFoods(id),
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });

    if (restaurantLoading) {
        return (
            <main className="rd-page" role="status" aria-label="Loading restaurant">
                <div className="rd-skeleton rd-skeleton-hero" />
                <div className="rd-skeleton rd-skeleton-row" />
                <div className="rd-skeleton rd-skeleton-row" />
            </main>
        );
    }

    // Only a restaurant error replaces the page, so a failed food search keeps the search box on screen
    if (restaurantError) {
        return (
            <main className="rd-page">
                <div className="rd-state" role="alert">
                    <h2>Couldn't load this restaurant</h2>
                    <p>{restaurantErr?.message}</p>
                    <Link className="rd-back" to="/">Back to restaurants</Link>
                </div>
            </main>
        );
    }

    const restaurant = restaurantData?.data;
    const foods = foodData?.data || [];
    const allFoods = allFoodData?.data || [];

    const categories = ["All", ...new Set(allFoods.map((f) => f.category).filter(Boolean))];
    const activeCategory = category === "" ? "All" : category;
    const isFiltering = category !== "" || debouncedSearch !== "";

    return (
        <main className="rd-page" style={{ "--hue": hueFor(restaurant.name) }}>
            <Link className="rd-back" to="/">← All restaurants</Link>

            <section className="rd-hero">
                <span className="rd-orb rd-orb-a" aria-hidden="true" />
                <span className="rd-orb rd-orb-b" aria-hidden="true" />
                <span className="rd-watermark" aria-hidden="true">
                    {restaurant.name?.charAt(0).toUpperCase()}
                </span>

                <div className="rd-hero-main">
                    <p className="rd-hero-sub">
                        {[restaurant.cuisine, restaurant.location].filter(Boolean).join(" • ")}
                    </p>
                    <h1>{restaurant.name}</h1>
                    <p className="rd-hero-desc">{restaurant.description}</p>
                </div>

                <dl className="rd-stats">
                    <div>
                        <dt>Rating</dt>
                        <dd>★ {restaurant.rating}</dd>
                    </div>
                    <div>
                        <dt>Delivery</dt>
                        <dd>{restaurant.deliveryTime} min</dd>
                    </div>
                    <div>
                        <dt>Fee</dt>
                        <dd>{Number(restaurant.deliveryFee) === 0 ? "Free" : `₹${restaurant.deliveryFee}`}</dd>
                    </div>
                </dl>
            </section>

            <section className="rd-menu">
                <h2>Menu</h2>

                <div className="rd-search">
                    <svg className="rd-search-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" />
                        <path d="M20 20l-3.5-3.5" />
                    </svg>
                    <input
                        type="search"
                        placeholder="Search dishes"
                        aria-label="Search dishes"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            type="button"
                            className="rd-search-clear"
                            aria-label="Clear search"
                            onClick={() => setSearch("")}
                        >
                            ×
                        </button>
                    )}
                </div>

                <div className="rd-tabs" role="group" aria-label="Filter by category">
                    {categories.map((item) => (
                        <button
                            key={item}
                            type="button"
                            className={`rd-tab ${item === activeCategory ? "is-active" : ""}`}
                            aria-pressed={item === activeCategory}
                            onClick={() => setCategory(item === "All" ? "" : item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {foodError ? (
                    <div className="rd-state" role="alert">
                        <h3>Couldn't load the menu</h3>
                        <p>{foodErr?.message}</p>
                    </div>
                ) : foodLoading ? (
                    <div className="rd-foods" aria-hidden="true">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div className="rd-skeleton rd-skeleton-food" key={i} />
                        ))}
                    </div>
                ) : foods.length === 0 ? (
                    <div className="rd-state">
                        <h3>{isFiltering ? "No matching dishes" : "Nothing here yet"}</h3>
                        <p>
                            {debouncedSearch
                                ? `We couldn't find "${debouncedSearch}"${category ? ` in ${category}` : ""}. Try a different word.`
                                : category
                                ? "No items in this category. Try another one."
                                : "This menu is empty for now."}
                        </p>
                    </div>
                ) : (
                    
                    <div
                        className={`rd-foods ${isPlaceholderData ? "is-stale" : ""}`}
                        key={`${activeCategory}-${debouncedSearch}`}
                    >
                        {foods.map((food, i) => {
                            const added = justAddedId === food._id;
                            return (
                                <article className="rd-food" key={food._id} style={{ "--i": i }}>
                                  <p className="rd-price">{food.category}</p>
                                    <div className="rd-food-body">
                                        <span
                                            className={`rd-diet ${food.isVeg ? "is-veg" : "is-nonveg"}`}
                                            role="img"
                                            aria-label={food.isVeg ? "Vegetarian" : "Non-vegetarian"}
                                        />
                                        <h3>{food.name}</h3>
                                        <p className="rd-food-desc">{food.description}</p>

                                        <button
                                            type="button"
                                            className={`rd-add ${added ? "is-added" : ""}`}
                                            onClick={() => handleAdd(food)}
                                        >
                                            {added ? "Added ✓" : "+ Add to cart"}
                                        </button>
                                    </div>
                                    <p className="rd-price">₹{food.price}</p>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

export default RestaurantDetails;