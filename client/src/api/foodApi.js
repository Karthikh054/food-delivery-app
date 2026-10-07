import api from "./axios";

export const getFoods = async (restaurantId, category = "", search = "") => {
  const response = await api.get("/foods", {
    params: {
      restaurantId,
      category,
      search,
    },
  });

  return response.data;
};